from flask import Flask
import json
import datetime
import os
from flask_pymongo import PyMongo
from dotenv import load_dotenv

load_dotenv()

app=Flask(__name__)
app.config["MONGO_URI"]=os.getenv("MONGO_URL")
db_name=os.getenv("MONGO_DBNAME")
mongo=PyMongo(app)


def safe_json_dumps(data):
    def replace_nan(obj):
        if isinstance(obj, float) and math.isnan(obj):
            return None  
        return obj

    return json.dumps(data, default=replace_nan, allow_nan=False)

def publish_result_rabbitmq(data):
  import pika
  connection=pika.BlockingConnection(pika.ConnectionParameters('localhost',port=5672))
  channel=connection.channel()
  channel.queue_declare(queue="final_stock_screener_result",durable=True)
  json_data=safe_json_dumps(data).encode('utf-8')
  print("this is the json data ",json_data)
  channel.basic_publish(exchange='',routing_key='final_stock_screener_result',body=json_data)
  print("sent data to rabbitmq",str(data))
  connection.close()
  
  