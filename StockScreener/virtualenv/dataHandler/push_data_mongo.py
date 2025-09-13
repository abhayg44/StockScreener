from flask import Flask
import datetime
import os
from flask_pymongo import PyMongo
from dotenv import load_dotenv
import traceback

load_dotenv()

app = Flask(__name__)
app.config["MONGO_URI"] = os.getenv("MONGO_URL")
db_name = os.getenv("MONGO_DBNAME")
mongo = PyMongo(app)

#push the list of tickers and company names to mongo db
def push_data_mongo(data):
    print("mongo db name is ", db_name, "\n mongo uri is ", app.config["MONGO_URI"])
    try:
        # Connect to DB and collection
        db = mongo.cx[db_name]
        collection = db["stock_data"]

        # Keep only the latest 4 documents (using pushed_at)
        latest_docs = list(collection.find().sort("pushed_at", -1).limit(5))
        if len(latest_docs) >= 5:
            ids_to_keep = [doc["_id"] for doc in latest_docs[:4]]
            collection.delete_many({"_id": {"$nin": ids_to_keep}})
            print("Old documents deleted, keeping only the latest 4.")
        current_timestamp=datetime.datetime.utcnow()
        # Insert new doc
        insert_result = collection.insert_one({
            "stock_list": data.get("tickers", []),
            "company_names": data.get("company_names").to_dict(orient="records"),
            "pushed_at": current_timestamp
        })
        print(f"Inserted into Mongo successfully! _id: {insert_result.inserted_id}")
        print("Current docs in stock_data:",
              list(collection.find().sort("pushed_at", -1).limit(1)))

    except Exception as e:
        print("Mongo insert error:", e)
        traceback.print_exc()

    return current_timestamp
