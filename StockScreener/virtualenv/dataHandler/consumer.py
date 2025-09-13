import pika
import json
from Screener.run import executing_all_strategy_run
from DataHandler.push_data_mongo import push_data_mongo
from Screener.strategies import fetch_data

data={}
def start_consumer():
  connection=pika.BlockingConnection(pika.ConnectionParameters('localhost',port=5672))
  channel=connection.channel()
  channel.queue_declare(queue='stock_screener_run_queue',durable=True)
  channel.queue_declare(queue="nifty50_ready_queue", durable=True)

  def callback(ch,method,properties,body):
    message=body.decode()
    print("message recieved:",message)
    if message.strip().lower()=="run":
      print("Got message to run nifty 50 list")
      stock_data,tickers,company_names=fetch_data()
      data["tickers"]=tickers
      data["company_names"]=company_names
      print("ticker data ",data["tickers"],"\n company names ",data["company_names"])
      current_timestamp = push_data_mongo(data)
      channel.basic_publish(
                exchange="",
                routing_key="nifty50_ready_queue",
                body=bytes("done", "utf-8"),
                properties=pika.BasicProperties(delivery_mode=2)  
      )
      print("Published READY message to nifty50_ready_queue")


  channel.basic_consume(queue="stock_screener_run_queue", on_message_callback=callback, auto_ack=True)
  print("Python waiting for RUN message...")
  channel.start_consuming()
  
if __name__=="__main__":
  start_consumer()