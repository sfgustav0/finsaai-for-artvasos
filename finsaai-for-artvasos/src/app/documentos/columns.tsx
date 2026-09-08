"use client"

import { createColumnHelper } from "@tanstack/react-table"
import { type DataTableFeatures } from "./data_table_features"
import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { DataTableColumnHeader } from "@/components/ui/data_table_column_header"
import { obterUrlDoDocumento } from "@/lib/documentos"; // ou o caminho correto de onde você salvou a função

export type NotaFiscal = {
  id: number
  nf_caminho_do_arquivo: string
  nf_nome_do_emitente: string
  nf_cnpj_do_emitente: string
  nf_nome_do_destinatario: string
  nf_cnpj_do_destinatario: string
  nf_numero: string
  nf_data_de_emissao: string
  nf_descricao: string
  nf_valor_total: number
  nf_valor_liquido: number
}

export type Boleto = {
  id: number
  bol_caminho_do_arquivo: string
  bol_nome_do_beneficiario: string
  bol_cnpj_do_beneficiario: string
  bol_nome_do_pagador: string
  bol_cnpj_do_pagador: string
  bol_nosso_numero: string
  bol_numero_do_documento: string
  bol_data_do_documento: string
  bol_data_do_vencimento: string
  bol_valor_do_documento: number
  bol_linha_digitavel: string
}

export type OutroDocumento = {
  id: number
  od_caminho_do_arquivo: string
  od_nome_do_emitente: string
  od_cnpj_do_emitente: string
  od_nome_do_destinatario: string
  od_cnpj_do_destinatario: string
  od_numero: string
  od_data_de_emissao: string
  od_descricao: string
  od_valor_total: number
  od_valor_liquido: number
}

const helperNotasFiscais = createColumnHelper<DataTableFeatures, NotaFiscal>()
const helperBoletos = createColumnHelper<DataTableFeatures, Boleto>()
const helperOutrosDocumentos = createColumnHelper<DataTableFeatures, OutroDocumento>()

const createSelectColumn = (helper: any) => 
  helper.display({
    id: "select",
    header: ({ table }: any) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Selecionar tudo"
      />
    ),
    cell: ({ row }: any) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Selecionar linha"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  })

export const colunasNotasFiscais = helperNotasFiscais.columns([
  createSelectColumn(helperNotasFiscais),
  helperNotasFiscais.accessor("id", { 
    header: ({ column }) => <DataTableColumnHeader column={column} title="ID" /> 
  }),
  helperNotasFiscais.accessor("nf_nome_do_emitente", { 
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nome do emitente" /> 
  }),
  helperNotasFiscais.accessor("nf_cnpj_do_emitente", { 
    header: ({ column }) => <DataTableColumnHeader column={column} title="CNPJ do emitente" /> 
  }),
  helperNotasFiscais.accessor("nf_nome_do_destinatario", { 
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nome do destinatário" /> 
  }),
  helperNotasFiscais.accessor("nf_cnpj_do_destinatario", { 
    header: ({ column }) => <DataTableColumnHeader column={column} title="CNPJ do destinatário" /> 
  }),
  helperNotasFiscais.accessor("nf_numero", { 
    header: ({ column }) => <DataTableColumnHeader column={column} title="Número" /> 
  }),
  helperNotasFiscais.accessor("nf_data_de_emissao", { 
    header: ({ column }) => <DataTableColumnHeader column={column} title="Data de emissão" /> 
  }),
  helperNotasFiscais.accessor("nf_descricao", { 
    header: ({ column }) => <DataTableColumnHeader column={column} title="Descrição" /> 
  }),
  helperNotasFiscais.accessor("nf_valor_total", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="Valor total" />,
    cell: ({ row }) => {
      const valor = row.getValue("nf_valor_total")
      return valor ? `R$ ${Number(valor).toFixed(2)}` : "-"
    }
  }),
  helperNotasFiscais.accessor("nf_valor_liquido", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="Valor líquido" />,
    cell: ({ row }) => {
      const valor = row.getValue("nf_valor_liquido")
      return valor ? `R$ ${Number(valor).toFixed(2)}` : "-"
    }
  }),

    helperNotasFiscais.display({
      id: "acoes",
      cell: ({ row }) => {
        const nota_fiscal = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-gray-100 transition-colors">
              <span className="sr-only">Abrir menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                className="cursor-pointer"
                onClick={async () => {
                  if (nota_fiscal.nf_caminho_do_arquivo) {
                    try {
                      // 1. Pede a URL segura (usa o cache ou vai no backend)
                      const urlSegura = await obterUrlDoDocumento(nota_fiscal.nf_caminho_do_arquivo);
                      
                      // 2. Abre a aba com o PDF
                      window.open(urlSegura, '_blank');
                    } catch (erro) {
                      console.error("Erro ao obter URL:", erro);
                      alert("Erro ao abrir o documento. Verifique se o servidor está rodando.");
                    }
                  } else {
                    alert("Arquivo não encontrado ou sem caminho registrado.");
                  }
                }}
              >
                Visualizar documento
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    }),
  ])

export const colunasBoletos = helperBoletos.columns([
  createSelectColumn(helperBoletos),
  helperBoletos.accessor("id", { 
    header: ({ column }) => <DataTableColumnHeader column={column} title="ID" /> 
  }),
  helperBoletos.accessor("bol_nome_do_beneficiario", { 
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nome do beneficiário" /> 
  }),
  helperBoletos.accessor("bol_cnpj_do_beneficiario", { 
    header: ({ column }) => <DataTableColumnHeader column={column} title="CNPJ do beneficiário" /> 
  }),
  helperBoletos.accessor("bol_nome_do_pagador", { 
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nome do pagador" /> 
  }),
  helperBoletos.accessor("bol_cnpj_do_pagador", { 
    header: ({ column }) => <DataTableColumnHeader column={column} title="CNPJ do pagador" /> 
  }),
  helperBoletos.accessor("bol_nosso_numero", { 
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nosso número" /> 
  }),
  helperBoletos.accessor("bol_numero_do_documento", { 
    header: ({ column }) => <DataTableColumnHeader column={column} title="Número do documento" /> 
  }),
  helperBoletos.accessor("bol_data_do_documento", { 
    header: ({ column }) => <DataTableColumnHeader column={column} title="Data do documento" /> 
  }),
  helperBoletos.accessor("bol_data_do_vencimento", { 
    header: ({ column }) => <DataTableColumnHeader column={column} title="Data do vencimento" /> 
  }),
  helperBoletos.accessor("bol_valor_do_documento", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="Valor do documento" />,
    cell: ({ row }) => {
      const valor = row.getValue("bol_valor_do_documento")
      return valor ? `R$ ${Number(valor).toFixed(2)}` : "-"
    }
  }),
  helperBoletos.accessor("bol_linha_digitavel", { 
    header: ({ column }) => <DataTableColumnHeader column={column} title="Linha digitável" /> 
  }),

    helperBoletos.display({
      id: "acoes",
      cell: ({ row }) => {
        const boleto = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-gray-100 transition-colors">
              <span className="sr-only">Abrir menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                className="cursor-pointer"
                onClick={async () => {
                  if (boleto.bol_caminho_do_arquivo) {
                    try {
                      // 1. Pede a URL segura (usa o cache ou vai no backend)
                      const urlSegura = await obterUrlDoDocumento(boleto.bol_caminho_do_arquivo);
                      
                      // 2. Abre a aba com o PDF
                      window.open(urlSegura, '_blank');
                    } catch (erro) {
                      console.error("Erro ao obter URL:", erro);
                      alert("Erro ao abrir o documento. Verifique se o servidor está rodando.");
                    }
                  } else {
                    alert("Arquivo não encontrado ou sem caminho registrado.");
                  }
                }}
              >
                Visualizar documento
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    }),
  ])

export const colunasOutrosDocumentos = helperOutrosDocumentos.columns([
  createSelectColumn(helperOutrosDocumentos),
  helperOutrosDocumentos.accessor("id", { 
    header: ({ column }) => <DataTableColumnHeader column={column} title="ID" /> 
  }),
  helperOutrosDocumentos.accessor("od_nome_do_emitente", { 
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nome do emitente" /> 
  }),
  helperOutrosDocumentos.accessor("od_cnpj_do_emitente", { 
    header: ({ column }) => <DataTableColumnHeader column={column} title="CNPJ do emitente" /> 
  }),
  helperOutrosDocumentos.accessor("od_nome_do_destinatario", { 
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nome do destinatário" /> 
  }),
  helperOutrosDocumentos.accessor("od_cnpj_do_destinatario", { 
    header: ({ column }) => <DataTableColumnHeader column={column} title="CNPJ do destinatário" /> 
  }),
  helperOutrosDocumentos.accessor("od_numero", { 
    header: ({ column }) => <DataTableColumnHeader column={column} title="Número" /> 
  }),
  helperOutrosDocumentos.accessor("od_data_de_emissao", { 
    header: ({ column }) => <DataTableColumnHeader column={column} title="Data de emissão" /> 
  }),
  helperOutrosDocumentos.accessor("od_descricao", { 
    header: ({ column }) => <DataTableColumnHeader column={column} title="Descrição" /> 
  }),
  helperOutrosDocumentos.accessor("od_valor_total", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="Valor total" />,
    cell: ({ row }) => {
      const valor = row.getValue("od_valor_total")
      return valor ? `R$ ${Number(valor).toFixed(2)}` : "-"
    }
  }),
  helperOutrosDocumentos.accessor("od_valor_liquido", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="Valor líquido" />,
    cell: ({ row }) => {
      const valor = row.getValue("od_valor_liquido")
      return valor ? `R$ ${Number(valor).toFixed(2)}` : "-"
    }
  }),

    helperOutrosDocumentos.display({
      id: "acoes",
      cell: ({ row }) => {
        const outro_documento = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-gray-100 transition-colors">
              <span className="sr-only">Abrir menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                className="cursor-pointer"
                onClick={async () => {
                  if (outro_documento.od_caminho_do_arquivo) {
                    try {
                      // 1. Pede a URL segura (usa o cache ou vai no backend)
                      const urlSegura = await obterUrlDoDocumento(outro_documento.od_caminho_do_arquivo);
                      
                      // 2. Abre a aba com o PDF
                      window.open(urlSegura, '_blank');
                    } catch (erro) {
                      console.error("Erro ao obter URL:", erro);
                      alert("Erro ao abrir o documento. Verifique se o servidor está rodando.");
                    }
                  } else {
                    alert("Arquivo não encontrado ou sem caminho registrado.");
                  }
                }}
              >
                Visualizar documento
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    }),
  ])