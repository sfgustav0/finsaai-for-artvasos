import { Table, RowData } from "@tanstack/react-table"
import { Columns, ChevronDown } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { type DataTableFeatures } from "@/app/documentos/data_table_features"

interface DataTableViewOptionsProps<TData extends RowData> {
  table: Table<DataTableFeatures, TData>
}

const nomesDasColunas: Record<string, string> = {
    id: "ID",
    acoes: "Ações",
    
    nf_nome_do_emitente: "Nome do emitente",
    nf_cnpj_do_emitente: "CNPJ do emitente",
    nf_nome_do_destinatario: "Nome do destinatário",
    nf_cnpj_do_destinatario: "CNPJ do destinatário",
    nf_numero: "Número",
    nf_data_de_emissao: "Data de emissão",
    nf_descricao: "Descrição",
    nf_valor_total: "Valor total",
    nf_valor_liquido: "Valor líquido",

    bol_nome_do_beneficiario: "Nome do beneficiário",
    bol_cnpj_do_beneficiario: "CNPJ do beneficiário",
    bol_nome_do_pagador: "Nome do pagador",
    bol_cnpj_do_pagador: "CNPJ do pagador",
    bol_nosso_numero: "Nosso número",
    bol_numero_do_documento: "Número do documento",
    bol_data_do_documento: "Data do documento",
    bol_data_do_vencimento: "Data do vencimento",
    bol_valor_do_documento: "Valor do documento",
    bol_linha_digitavel: "Linha digitável",

    od_nome_do_emitente: "Nome do emitente",
    od_cnpj_do_emitente: "CNPJ do emitente",
    od_nome_do_destinatario: "Nome do destinatário",
    od_cnpj_do_destinatario: "CNPJ do destinatário",
    od_numero: "Número",
    od_data_de_emissao: "Data de emissão",
    od_descricao: "Descrição",
    od_valor_total: "Valor total",
    od_valor_liquido: "Valor líquido",
  }

export function DataTableViewOptions<TData extends RowData>({
  table,
}: DataTableViewOptionsProps<TData>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-gray-300 bg-white px-4 py-2 hover:bg-gray-100 transition-colors focus:outline-none">
        <Columns className="mr-2 h-4 w-4" />
        Colunas
        <ChevronDown className="ml-2 h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        {table
          .getAllColumns()
          .filter((column) => column.getCanHide())
          .map((column) => {
            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="cursor-pointer"
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
              >
                {nomesDasColunas[column.id] || column.id}
              </DropdownMenuCheckboxItem>
            )
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}