from flask import Flask
import json
import datetime
import os
from dotenv import load_dotenv
import pika

load_dotenv()

def safe_json_dumps(data):
    def replace_nan(obj):
        if isinstance(obj, float) and math.isnan(obj):
            return None  
        return obj

    return json.dumps(data, default=replace_nan, allow_nan=False)

def publish_result_rabbitmq(data):
    rabbitmq_url=os.getenv("RABBITMQ_URL")
    print("rabbit mq url is ",rabbitmq_url)
    if not rabbitmq_url:
        raise ValueError("RABBITMQ_URL not found in environment variables")
    params=pika.URLParameters(rabbitmq_url)
    connection=pika.BlockingConnection(params)
    channel=connection.channel()
    channel.queue_declare(queue="final_stock_screener_result",durable=True)
    json_data=safe_json_dumps(data).encode('utf-8')
    print("this is the json data ",json_data)
    channel.basic_publish(exchange='',routing_key='final_stock_screener_result',body=json_data)
    print("sent data to rabbitmq",str(data))
    connection.close()
  
  