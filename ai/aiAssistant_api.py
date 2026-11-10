import os

from dotenv import load_dotenv
from fastapi import FastAPI
from openai import OpenAI

load_dotenv()

app = FastAPI()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

@app.get("/")
def home():
	return {"message": "Yoni API is running!"}

@app.get("/test-ai")
def test_ai():
	response = client.responses.create(
		model="gpt-5.4-nano",
		instructions="You are Yoni, a friendly travel assistant for Yonder.",
		input="Say hello and introduce yourself in one sentence."
	)

	return {"reply": response.output_text}