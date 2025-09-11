from flask import Flask
import datetime
import os
from flask_pymongo import PyMongo
from dotenv import load_dotenv

load_dotenv()

app=Flask(__name__)
app.config["MONGO_URI"]=os.getenv("MONGO_URL")
db_name=os.getenv("MONGO_DBNAME")
mongo=PyMongo(app)

def push_data_mongo(data):
  db=mongo.cx[db_name]
  db["stock_data"].update_one(
    {"type": "latest"},
    {"$set": {"data": data, "date": datetime.datetime.now(datetime.timezone.utc)}},
    upsert=True
)
  