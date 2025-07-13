from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.chat_message import ChatMessage
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/chat-flow", tags=["chat-flow"])
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Giriş modeli
class ChatTurn(BaseModel):
    roadmap_id: int
    user_id: int
    message: str

# Sistem promptu
INITIAL_SYSTEM_PROMPT = """
Sen kullanıcıya kişisel kariyer rehberliği yapan yardımsever bir yapay zekasın.

Kullanıcıdan aşağıdaki konularla ilgili bilgi almaya çalış:
1. İlgi alanları ve güçlü olduğu dersler: Hangi konulara ilgisi var? Hangi derslerde başarılı?
2. Merak ettiği sektörler: Hangi alanlarda çalışmak istiyor? (ör. teknoloji, sanat, sağlık)
3. Kişisel beklentiler ve motivasyonlar: Ne tür iş ortamını tercih ediyor? Önem verdiği değerler neler? (ör. yaratıcılık, yardım etme, maaş)

Bu bilgiler ışığında şu şablona benzer sade bir kariyer önerisi ver:
"Analiz ettiğim bilgilere göre, güçlü yönlerin [DERSLER], ilgi alanların [İLGİ ALANLARI], ve senin için önemli olan [MOTİVASYON] unsurları seni [SEKTÖR] sektöründe [MESLEK] rolüne yönlendiriyor. Bu yolculuğa başlamak için temel becerilerini geliştirecek kurslar, stajlar ve küçük projeler öneriyorum."
"""

@router.post("/")
async def chat_flow(input: ChatTurn, db: Session = Depends(get_db)):
    try:
        # 1. Geçmiş konuşmaları veritabanından al
        history_records = db.query(ChatMessage).filter(
            ChatMessage.roadmap_id == input.roadmap_id
        ).order_by(ChatMessage.timestamp.asc()).all()

        # 2. Gemini için message formatı oluştur
        messages = [{
            "role": "user",
            "parts": [{"text": INITIAL_SYSTEM_PROMPT}]
        }]

        for record in history_records:
            role = "user" if record.type == "user" else "model"
            messages.append({
                "role": role,
                "parts": [{"text": record.content}]
            })

        # 3. Yeni kullanıcı mesajını Gemini formatına ekle
        messages.append({
            "role": "user",
            "parts": [{"text": input.message}]
        })

        # 4. Kullanıcı mesajını veritabanına kaydet
        db.add(ChatMessage(
            roadmap_id=input.roadmap_id,
            user_id=input.user_id,
            type="user",
            content=input.message
        ))
        db.commit()

        # 5. Gemini'den cevap al
        model = genai.GenerativeModel("models/gemini-2.5-flash")
        response = model.generate_content(messages)

        # 6. AI cevabını veritabanına kaydet
        db.add(ChatMessage(
            roadmap_id=input.roadmap_id,
            user_id=input.user_id,
            type="ai",
            content=response.text
        ))
        db.commit()

        # 7. Sonuçları geri döndür
        return {
            "reply": response.text
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
