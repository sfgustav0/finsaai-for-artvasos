from pydantic import BaseModel, Field
from typing import List, Literal, Optional
from dotenv import load_dotenv
from anthropic import AsyncAnthropic
import json
import os
import base64
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import SimpleSpanProcessor
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
from opentelemetry.instrumentation.anthropic import AnthropicInstrumentor

class ItensNotasFiscais(BaseModel):
    model_config = {"extra": "forbid"}
    nome_completo_do_produto_ou_servico: str
    quantidade: float

class DadosNotasFiscais(BaseModel):
    model_config = {"extra": "forbid"}
    caminho_do_arquivo: str
    nome_do_emitente_da_nota_fiscal: str
    cnpj_do_emitente_da_nota_fiscal: str
    nome_do_destinatario_da_nota_fiscal: str
    cnpj_do_destinatario_da_nota_fiscal: str
    numero_da_nota_fiscal: str
    data_de_emissao_da_nota_fiscal: str
    descricao_da_nota_fiscal: List[ItensNotasFiscais] = Field(
        description="Liste os nomes completos e as quantidades de todos os produtos ou serviços descritos na 'Nota Fiscal'."
    )
    valor_total_da_nota_fiscal: float
    valor_liquido_da_nota_fiscal: float

class DadosBoletos(BaseModel):
    model_config = {"extra": "forbid"}
    caminho_do_arquivo: str
    nome_do_beneficiario_do_boleto: str
    cnpj_do_beneficiario_do_boleto: str
    nome_do_pagador_do_boleto: str
    cnpj_do_pagador_do_boleto: str
    nosso_numero_do_boleto: str
    numero_do_documento_do_boleto: str
    data_do_documento_do_boleto: str
    data_do_vencimento_do_boleto: str
    valor_do_documento_do_boleto: float
    linha_digitavel_do_boleto: str = Field(
        description="A linha digitável do boleto é uma sequência númerica de 47 ou 48 dígitos separados em 5 campos. Atente-se ao fato de que a sequência númerica XXX-X não faz parte da linha digitável do boleto, embora possam estar próximas no texto do arquivo."
    )

class ItensOutrosDocumentos(BaseModel):
    model_config = {"extra": "forbid"}
    nome_completo_do_produto_ou_servico: str
    quantidade: float

class DadosOutrosDocumentos(BaseModel):
    model_config = {"extra": "forbid"}
    caminho_do_arquivo: str
    nome_do_emitente_do_outro_documento: str
    cnpj_do_emitente_do_outro_documento: str
    nome_do_destinatario_do_outro_documento: str
    cnpj_do_destinatario_do_outro_documento: str
    numero_do_outro_documento: str
    data_de_emissao_do_outro_documento: str
    descricao_do_outro_documento: List[ItensOutrosDocumentos] = Field(
        description="Liste os nomes completos e as quantidades de todos os produtos ou serviços descritos no 'Outro documento'."
    )
    valor_total_do_outro_documento: float
    valor_liquido_do_outro_documento: float

class CapturaDeDadosDosDocumentos(BaseModel):
    model_config = {"extra": "forbid"}
    tipo_de_documento: Literal["Nota Fiscal", "Boleto", "Outro documento"] = Field(
        description="Analise o arquivo e classifique o tipo de documento."
    )
    dados_nota_fiscal: Optional[DadosNotasFiscais] = Field(
        default=None,
        description="Preencha APENAS se o tipo_de_documento for 'Nota Fiscal'."
    )
    dados_boleto: Optional[DadosBoletos] = Field(
        default=None,
        description="Preencha APENAS se o tipo_de_documento for 'Boleto'."
    )
    dados_outro_documento: Optional[DadosOutrosDocumentos] = Field(
        default=None,
        description="Preencha APENAS se o tipo_de_documento for 'Outro documento'."
    )

class LoteDeDocumentos(BaseModel):
    model_config = {"extra": "forbid"}
    documentos: List[CapturaDeDadosDosDocumentos] = Field(
        description="Liste todos os documentos identificados e extraídos do arquivo."
    )

load_dotenv()

provedor = TracerProvider()
trace.set_tracer_provider(provedor)

public_key = os.environ.get("LANGFUSE_PUBLIC_KEY")
secret_key = os.environ.get("LANGFUSE_SECRET_KEY")
url_langfuse = os.environ.get("LANGFUSE_BASE_URL", "https://us.cloud.langfuse.com")

credencial = base64.b64encode(f"{public_key}:{secret_key}".encode()).decode()

exportador = OTLPSpanExporter(
    endpoint=f"{url_langfuse}/api/public/otel/v1/traces",
    headers={"Authorization": f"Basic {credencial}"}
)

provedor.add_span_processor(SimpleSpanProcessor(exportador))

AnthropicInstrumentor().instrument()

client = AsyncAnthropic()

async def analisar_documento(texto_extraido: str):
    
    prompt = f"""
--- TEXTO DO ARQUIVO ---
{texto_extraido}
-------------------------
"""

    resultado_json = ""

    resposta = await client.beta.messages.create(
        model="claude-sonnet-5",
        max_tokens=4096,
        system="""Você extrai dados estruturados de um texto destruturado. Esse texto é proveniente de um arquivo que contém 'Notas Fiscais', 'Boletos' ou 'Outros documentos', portanto, as seguintes instruções te auxiliam a identificar o tipo de documento presente no texto do arquivo que você recebeu e extrair determinadas informações de acordo com esse tipo:
1. 'Notas Fiscais' sempre terão um campo e um número destinados a sua 'Chave de Acesso';
2. 'Boletos' sempre terão um campo e um número destinados ao seu 'Nosso Número';
3. 'Outros documentos' são arquivos que substituem Notas Fiscais por um breve período de tempo, como Cupons Fiscais e Pedidos de Compra. Geralmente, esses irão conter apenas uma descrição de produtos. Logo, se o texto do arquivo não possuir campos e números destinados a uma 'Chave de Acesso' (identificador de 'Notas Fiscais') ou a um 'Nosso Número' (identificador de 'Boletos'), ele será correspondente a um 'Outro documento';
4. O texto do arquivo pode conter uma combinação entre diferentes 'Notas Fiscais', 'Boletos' e 'Outros documentos'. Caso o texto do arquivo contenha mais de 1 documento, seu output deve conter as informações de cada documento, como está configurado o 'format' do 'output_config';
5. Todas as informações que devem ser extraídas de uma 'Nota Fiscal' sempre existirão no texto do arquivo;
6. Todas as informações que devem ser extraídas de um 'Boleto' sempre existirão no texto do arquivo;
7. É possível que nem todas as informações que devem ser extraídas de um 'Outro Documento' existam no texto do arquivo. Logo, caso uma informação não exista no texto do arquivo, basta completar o campo correspondente dessa informação no seu output com "NA".
8. Prefira valores explícitos ao invés de valores inferidos.""",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        thinking={"type": "disabled"},
        betas=["structured-outputs-2025-11-13"],
        output_config={
            "format": {
                "type": "json_schema",
                "schema": LoteDeDocumentos.model_json_schema()
            }
        }
    )

    resultado_json = resposta.content[0].text
            
    dicionario_pronto = json.loads(resultado_json)

    provedor.force_flush()

    return dicionario_pronto