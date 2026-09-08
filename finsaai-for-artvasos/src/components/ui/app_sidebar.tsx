"use client"

import Link from "next/link"
import { UploadCloud, Check } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="flex flex-row items-center justify-between p-4 pb-2">
        <span className="text-sm font-medium text-gray-500 px-2">Menu principal</span>
        <SidebarTrigger />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              
              <SidebarMenuItem>
                <Link href="/" className="w-full">
                  <SidebarMenuButton>
                    <UploadCloud />
                    <span>Envio de documentos</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <Link href="/documentos" className="w-full">
                  <SidebarMenuButton>
                    <Check />
                    <span>Documentos processados</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>

            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

export function FloatingTrigger() {
  const { state } = useSidebar()
  
  if (state === "expanded") return null
  
  return (
    <div className="p-4 absolute z-50">
      <SidebarTrigger />
    </div>
  )
}