import os
import base64
import tempfile
from fastapi import UploadFile
from mistralai.client import Mistral
from dotenv import load_dotenv
import pdf_inspector 

load_dotenv()
api_key = os.environ.get("MISTRAL_API_KEY")
client = Mistral(api_key=api_key)

def encode_file(file_path):
    with open(file_path, "rb") as f:
        return base64.b64encode(f.read()).decode('utf-8')

async def extrair_texto(file: UploadFile) -> str:
    extensao = file.filename.lower().split('.')[-1]
    
    with tempfile.NamedTemporaryFile(delete=False, suffix=f".{extensao}") as temp_file:
        conteudo = await file.read()
        temp_file.write(conteudo)
        caminho_do_arquivo = temp_file.name

    try:
        base64_file = encode_file(caminho_do_arquivo)
        
        if extensao == 'pdf':
            tipo_parametro = "document_url"
            url_formatada = f"data:application/pdf;base64,{base64_file}"
        else:
            mimetype = "image/png" if extensao == "png" else "image/jpeg"
            tipo_parametro = "image_url"
            url_formatada = f"data:{mimetype};base64,{base64_file}"

        texto_completo = ""
        resultado = pdf_inspector.extract_pages_markdown(caminho_do_arquivo)
        
        for i, pagina in enumerate(resultado.pages):
            texto_completo += f"\n\n--- INÍCIO DA PÁGINA {pagina.page} ---\n\n"
            
            if getattr(pagina, 'needs_ocr', False):
                ocr_response = client.ocr.process(
                    document={"type": tipo_parametro, tipo_parametro: url_formatada},
                    model="mistral-ocr-latest",
                    pages=[i]
                )
                texto_completo += ocr_response.pages[0].markdown
            else:
                texto_completo += pagina.markdown
                
            texto_completo += f"\n\n--- FIM DA PÁGINA {pagina.page} ---\n\n"

        return texto_completo

    finally:
        if os.path.exists(caminho_do_arquivo):
            os.remove(caminho_do_arquivo)