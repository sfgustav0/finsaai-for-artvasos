from dotenv import load_dotenv
import os
from supabase import create_client, Client

load_dotenv()
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")

supabase: Client = create_client(url, key)

def gerar_url_assinada(nome_arquivo: str, expiracao_em_segundos: int = 3600):
    try:
        nome_limpo = nome_arquivo.split("/")[-1]

        resposta = supabase.storage.from_("arquivos-dos-documentos-processados").create_signed_url(
            path=nome_limpo, 
            expires_in=expiracao_em_segundos
        )
        return resposta.get("signedURL")
    except Exception:
        return None