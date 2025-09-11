import pika
from Screener.run import executing_all_strategy_run
from dataHandler.push_data_mongo import push_data_mongo

data={}
def start_consumer():
  connection=pika.BlockingConnection(pika.ConnectionParameters('localhost',port=5672))
  channel=connection.channel()
  channel.queue_declare(queue='stock_screener_run_queue',durable=True)

  def callback(ch,method,properties,body):
    message=body.decode()
    print("message recieved:",message)
    if message.strip().lower()=="run":
      data=executing_all_strategy_run()
      print("Stock screener completed.")
      push_data_mongo((data))
      print("message sent to mongo ",(data))
      

  channel.basic_consume(queue='stock_screener_run_queue',on_message_callback=callback,auto_ack=True)
  channel.start_consuming()

if __name__=="__main__":
  start_consumer()