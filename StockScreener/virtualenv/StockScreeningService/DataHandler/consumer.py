import pika
import os
from datetime import datetime, timezone, timedelta
from Screener.run import executing_all_strategy_run
from DataHandler.resultProducer import publish_result_rabbitmq

data={}
def start_consumer():
  print("Python ready and waiting for messages...")
  rabbitmq_url=os.getenv("RABBITMQ_URL")
  print("rabbit mq url is ",rabbitmq_url)
  if not rabbitmq_url:
    raise ValueError("RABBITMQ_URL not found in environment variables")
  params=pika.URLParameters(rabbitmq_url)
  connection=pika.BlockingConnection(params)
  channel=connection.channel()
  channel.queue_declare(queue='stock_screener_run_queue',durable=True)
  channel.queue_declare(queue="final_stock_screener_result",durable=True)

  def callback(ch,method,properties,body):
    message=body.decode()
    print("message received:",message)

    # Check timestamp property (set by publisher). If older than 2 minutes, skip processing.
    ts = None
    if properties and hasattr(properties, 'timestamp') and properties.timestamp:
      ts_val = properties.timestamp
      if isinstance(ts_val, (int, float)):
        try:
          ts = datetime.fromtimestamp(int(ts_val), tz=timezone.utc)
        except Exception:
          ts = None
      elif isinstance(ts_val, datetime):
        ts = ts_val if ts_val.tzinfo else ts_val.replace(tzinfo=timezone.utc)

    if ts:
      age = datetime.now(timezone.utc) - ts
      if age > timedelta(minutes=2):
        print(f"Skipping message; age={age} > 2 minutes.")
        try:
          ch.basic_ack(delivery_tag=method.delivery_tag)
        except Exception:
          pass
        return

    if message.strip().lower()=="run":
      data=executing_all_strategy_run()
      print("Stock screener completed.")
      print("Data from the screener: ",data)
      publish_result_rabbitmq(data)
      print("Result published to RabbitMQ.")

  # Use manual ack so we can explicitly ack skipped messages.
  channel.basic_consume(queue='stock_screener_run_queue',on_message_callback=callback,auto_ack=False)
  channel.start_consuming()

if __name__=="__main__":
  start_consumer()