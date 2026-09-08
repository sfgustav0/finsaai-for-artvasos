from dotenv import load_dotenv
import os
from supabase import create_client, Client
import json

load_dotenv()
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")

supabase: Client = create_client(url, key)

def salvar_dados_estruturados(dados_estruturados: dict, nome_arquivo_original: str):
    
    lista_de_documentos = dados_estruturados.get("documentos", [])

    for documento in lista_de_documentos:
        tipo = documento.get("tipo_de_documento")

        if tipo == "Nota Fiscal":
            dados_nf = documento.get("dados_nota_fiscal", {})
            
            descricao_lista = dados_nf.get("descricao_da_nota_fiscal", [])
            descricao_texto = json.dumps(descricao_lista, ensure_ascii=False) if descricao_lista else ""

            dados_insercao = {
                "nf_caminho_do_arquivo": nome_arquivo_original, 
                "nf_nome_do_emitente": dados_nf.get("nome_do_emitente_da_nota_fiscal"),
                "nf_cnpj_do_emitente": dados_nf.get("cnpj_do_emitente_da_nota_fiscal"),
                "nf_nome_do_destinatario": dados_nf.get("nome_do_destinatario_da_nota_fiscal"),
                "nf_cnpj_do_destinatario": dados_nf.get("cnpj_do_destinatario_da_nota_fiscal"),
                "nf_numero": dados_nf.get("numero_da_nota_fiscal"),
                "nf_data_de_emissao": dados_nf.get("data_de_emissao_da_nota_fiscal"),
                "nf_descricao": descricao_texto,
                "nf_valor_total": dados_nf.get("valor_total_da_nota_fiscal"),
                "nf_valor_liquido": dados_nf.get("valor_liquido_da_nota_fiscal")
            }

            try:
                resposta = supabase.table("notas_fiscais").insert(dados_insercao).execute()
                print(f"Sucesso! Nota Fiscal inserida no Supabase: ID {resposta.data[0]['id']}")
            except Exception as e:
                print(f"Erro ao inserir Nota Fiscal: {e}")

        elif tipo == "Boleto":
            dados_bol = documento.get("dados_boleto", {})
            
            dados_insercao = {
                "bol_caminho_do_arquivo": nome_arquivo_original,
                "bol_nome_do_beneficiario": dados_bol.get("nome_do_beneficiario_do_boleto"),
                "bol_cnpj_do_beneficiario": dados_bol.get("cnpj_do_beneficiario_do_boleto"),
                "bol_nome_do_pagador": dados_bol.get("nome_do_pagador_do_boleto"),
                "bol_cnpj_do_pagador": dados_bol.get("cnpj_do_pagador_do_boleto"),
                "bol_nosso_numero": dados_bol.get("nosso_numero_do_boleto"),
                "bol_numero_do_documento": dados_bol.get("numero_do_documento_do_boleto"),
                "bol_data_do_documento": dados_bol.get("data_do_documento_do_boleto"),
                "bol_data_do_vencimento": dados_bol.get("data_do_vencimento_do_boleto"),
                "bol_valor_do_documento": dados_bol.get("valor_do_documento_do_boleto"),
                "bol_linha_digitavel": dados_bol.get("linha_digitavel_do_boleto")
            }

            try:
                resposta = supabase.table("boletos").insert(dados_insercao).execute()
                print(f"Sucesso! Boleto inserido no Supabase: ID {resposta.data[0]['id']}")
            except Exception as e:
                print(f"Erro ao inserir Boleto: {e}")

        elif tipo == "Outro documento":
            dados_od = documento.get("dados_outro_documento", {})

            descricao_lista = dados_od.get("descricao_do_outro_documento", [])
            descricao_texto = json.dumps(descricao_lista, ensure_ascii=False) if descricao_lista else ""

            dados_insercao = {
                "od_caminho_do_arquivo": nome_arquivo_original,
                "od_nome_do_emitente": dados_od.get("nome_do_emitente_do_outro_documento"),
                "od_cnpj_do_emitente": dados_od.get("cnpj_do_emitente_do_outro_documento"),
                "od_nome_do_destinatario": dados_od.get("nome_do_destinatario_do_outro_documento"),
                "od_cnpj_do_destinatario": dados_od.get("cnpj_do_destinatario_do_outro_documento"),
                "od_numero": dados_od.get("numero_do_outro_documento"),
                "od_data_de_emissao": dados_od.get("data_de_emissao_do_outro_documento"),
                "od_descricao": descricao_texto,
                "od_valor_total": dados_od.get("valor_total_do_outro_documento"),
                "od_valor_liquido": dados_od.get("valor_liquido_do_outro_documento")
            }

            try:
                resposta = supabase.table("outros_documentos").insert(dados_insercao).execute()
                print(f"Sucesso! Outro documento inserido no Supabase: ID {resposta.data[0]['id']}")
            except Exception as e:
                print(f"Erro ao inserir Outro documento: {e}")

def salvar_arquivo_no_storage(file_bytes: bytes, nome_arquivo: str, content_type: str):
    try:
        resposta = supabase.storage.from_("arquivos-dos-documentos-processados").upload(
            file=file_bytes,
            path=nome_arquivo,
            file_options={"content-type": content_type}
        )
        print(f"Sucesso! Arquivo '{nome_arquivo}' salvo no Storage.")
    except Exception as e:
        print(f"Erro ao salvar arquivo no Storage: {e}")