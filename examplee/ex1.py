from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def home():
    return {"message": "Working Successfully"}

@app.get("/add")
def add(a: int, b: int):
    return {"sum": a + b}