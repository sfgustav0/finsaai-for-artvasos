from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import extracao_via_mistral_ocr
import extracao_via_pdfinspector
import agente_de_ia
import preenchimento_do_banco_de_dados
import os
import time
import aaa

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/processar-pdf")
async def processar_pdf(file: UploadFile = File(...)):
    try:
        texto_extraido = ""
        
        if file.content_type.startswith('image/') or not file.filename.lower().endswith('.pdf'):
            texto_extraido = await extracao_via_mistral_ocr.extrair_texto(file)
            
        else:
            try:
                texto_extraido = await extracao_via_pdfinspector.extrair_texto(file)
                
            except Exception:
                
                await file.seek(0) 
                
                texto_extraido = await extracao_via_mistral_ocr.extrair_texto(file)

        dados_estruturados = await agente_de_ia.analisar_documento(texto_extraido)

        nome_original = file.filename
        nome_base, extensao = os.path.splitext(nome_original)
        carimbo_tempo = int(time.time())
        nome_unico = f"{nome_base}_{carimbo_tempo}{extensao}"

        preenchimento_do_banco_de_dados.salvar_dados_estruturados(dados_estruturados, nome_unico)

        await file.seek(0)
        
        file_bytes = await file.read()
        
        preenchimento_do_banco_de_dados.salvar_arquivo_no_storage(file_bytes, nome_unico, file.content_type)

        return {"status": "sucesso", "mensagem": "Sucesso!"}

    except Exception as e:
        print(f"Erro geral no processamento: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/gerar-url-documento/{nome_arquivo:path}")
async def obter_url_documento(nome_arquivo: str):
    url_assinada = aaa.gerar_url_assinada(nome_arquivo)
    
    if url_assinada:
        return {"status": "sucesso", "url": url_assinada}
    else:
        raise HTTPException(status_code=404, detail="Arquivo não encontrado ou erro ao gerar URL")