import pika
from Screener.run import executing_all_strategy_run
from DataHandler.resultProducer import publish_result_rabbitmq

data={}
def start_consumer():
  print("Python ready and waiting for messages...")
  connection=pika.BlockingConnection(pika.ConnectionParameters('localhost',port=5672))
  channel=connection.channel()
  channel.queue_declare(queue='stock_screener_run_queue',durable=True)
  channel.queue_declare(queue="final_stock_screener_result",durable=True)

  def callback(ch,method,properties,body):
    message=body.decode()
    print("message recieved:",message)
    if message.strip().lower()=="run":
      data=executing_all_strategy_run()
      print("Stock screener completed.")
      print("Data from the screener: ",data)
      publish_result_rabbitmq(data)
      print("Result published to RabbitMQ.")

  channel.basic_consume(queue='stock_screener_run_queue',on_message_callback=callback,auto_ack=True)
  channel.start_consuming()

if __name__=="__main__":
  start_consumer()