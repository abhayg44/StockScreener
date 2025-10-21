from DataHandler.consumer import start_consumer
from fastapi import FastAPI 
import threading
from Screener.run import executing_all_strategy_run

app=FastAPI()

@app.get("/")
def home():
  return {"message":"started screening service at 8081 port"}

threading.Thread(target=start_consumer,daemon=True).start()

if __name__=="__main__":
  port=int(os.environ.get("PORT",8081))
  uvicorn.run(app,host="0.0.0.0",port=port)