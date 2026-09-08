from dotenv import load_dotenv
from mistralai.client import Mistral
import os
from fastapi import UploadFile
import base64

load_dotenv()
client = Mistral(api_key=os.environ["MISTRAL_API_KEY"])

async def extrair_texto(file: UploadFile) -> str:
    
    conteudo = await file.read()
    
    base64_file = base64.b64encode(conteudo).decode('utf-8')
    
    extensao = file.filename.lower().split('.')[-1]
    
    if extensao == 'pdf':
        tipo_parametro = "document_url"
        url_formatada = f"data:application/pdf;base64,{base64_file}"
    else:
        mimetype = "image/png" if extensao == "png" else "image/jpeg"
        tipo_parametro = "image_url"
        url_formatada = f"data:{mimetype};base64,{base64_file}"
        
    ocr_response = client.ocr.process(
        document={
            "type": tipo_parametro,
            tipo_parametro: url_formatada
        },
        model="mistral-ocr-latest"
    )
    
    text = ""
    for page in ocr_response.pages:
        text += page.markdown + "\n"
        
    await file.seek(0)
        
    return text