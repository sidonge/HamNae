from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

import os
import torch
import transformers
from transformers import pipeline, AutoModelForCausalLM, AutoTokenizer, AutoConfig, StoppingCriteria, StoppingCriteriaList

from langchain.embeddings import HuggingFaceEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.vectorstores import FAISS
from langchain.llms import HuggingFacePipeline
from langchain.chains import ConversationalRetrievalChain

from pydantic import BaseModel

from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse

from pydantic import BaseModel

from fastapi.responses import JSONResponse
from fastapi import HTTPException


class ChatRequest(BaseModel):
    data: str

def chatbot_response(message: str) -> str:
    inputs = tokenizer.encode(message, return_tensors="pt").to(device)
    outputs = model.generate(inputs, max_length=50)
    response = tokenizer.decode(outputs[0], skip_special_tokens=True)
    return response

# 모델 구성
model_id = 'meta-llama/Meta-Llama-3-8B-Instruct'
# GPU 대신 CPU 사용 설정
device = 'cpu'

# Hugging Face API 토큰을 사용하여 모델 로드
hf_auth = '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'
model_config = transformers.AutoConfig.from_pretrained(
    model_id,
    use_auth_token=hf_auth
)


# BitsAndBytes 설정 제거
model = transformers.AutoModelForCausalLM.from_pretrained(
    model_id,
    trust_remote_code=True,
    config=model_config,
    use_auth_token=hf_auth
)
model.to(device)  # 모델을 CPU로 이동
model.eval()

tokenizer = transformers.AutoTokenizer.from_pretrained(
    model_id, use_auth_token=hf_auth)


# 정지 토큰 설정
stop_list = ['\nHuman:', '\n```\n']
stop_token_ids = [tokenizer.encode(x) for x in stop_list]
stop_token_ids = [torch.LongTensor(x).to(device) for x in stop_token_ids]


class StopOnTokens(StoppingCriteria):
    def __call__(self, input_ids: torch.LongTensor, scores: torch.FloatTensor, **kwargs) -> bool:
        for stop_ids in stop_token_ids:
            if torch.eq(input_ids[-len(stop_ids):], stop_ids).all():
                return True
        return False


stopping_criteria = StoppingCriteriaList([StopOnTokens()])
generate_text = pipeline(
    model=model,
    tokenizer=tokenizer,
    return_full_text=True,
    task='text-generation',
    stopping_criteria=stopping_criteria,
    temperature=0.1,
    max_new_tokens=512,
    repetition_penalty=1.1,
    device=device  # 파이프라인에 디바이스 설정 추가
)


app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")


@app.get("/", response_class=HTMLResponse)
async def read_item(request: Request):
    return templates.TemplateResponse("chat.html", {"request": request})

# @app.post("/chat")
# async def chat_endpoint(data: RequestModel):
#     # 챗봇 로직 처리
#     response = chatbot_response(data.message)
#     return {"response": response}

# 챗봇의 응답확인


@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        print("Received message:", request.data)
        response = chatbot_response(request.data)  # 예제 응답
        print("Generated response:", response)
        return JSONResponse(status_code=200, content={"response": response})
    except Exception as e:
        print("Error during response generation:", str(e))
        raise HTTPException(status_code=500, detail=str(e))
