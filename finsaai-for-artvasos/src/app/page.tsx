"use client";

import { useState, useEffect } from "react";

import { 
  UploadCloud, CircleHelp, CheckIcon, ClockIcon, 
  FileWarningIcon, RefreshCwIcon, XIcon 
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment";

import { Spinner } from "@/components/ui/spinner";

type FileState = "idle" | "processing" | "error" | "done";

interface FileItem {
  id: string;
  file: File;
  state: FileState;
  progress: number;
  errorMessage?: string;
}

export default function Home() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isProcessing) return;

    setFiles((prev) => {
      const validCount = prev.filter(f => f.state !== "done" && !f.errorMessage).length;
      const availableSlots = 10 - validCount;

      if (availableSlots > 0) {
        const excessFiles = prev.filter(f => f.state === "error" && !!f.errorMessage);
        
        if (excessFiles.length > 0) {
          const idsToPromote = excessFiles.slice(0, availableSlots).map(f => f.id);
          
          return prev.map(f => 
            idsToPromote.includes(f.id) 
              ? { ...f, state: "idle", errorMessage: undefined, progress: 0 } 
              : f
          );
        }
      }
      
      return prev; 
    });
  }, [files, isProcessing]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    
    const newFilesArray = Array.from(event.target.files);
    
    const currentValidCount = files.filter(f => f.state !== "done" && !f.errorMessage).length;
    
    const newFileItems: FileItem[] = newFilesArray.map((f, index) => {
      const isExcess = currentValidCount + index >= 10;
      
      return {
        id: Math.random().toString(36).substring(7) + Date.now().toString(),
        file: f,
        state: isExcess ? "error" : "idle",
        progress: 0,
        errorMessage: isExcess ? "Limite excedido" : undefined,
      };
    });

    setFiles((prev) => [...prev, ...newFileItems]);
    event.target.value = '';
  };

  const removeFile = (idToRemove: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== idToRemove));
  };

  const retryFile = (idToRetry: string) => {
    setFiles((prev) => prev.map((f) => f.id === idToRetry ? { ...f, state: 'idle', errorMessage: undefined } : f));
  };

  const updateFileStatus = (id: string, updates: Partial<FileItem>) => {
    setFiles((prev) => prev.map((f) => f.id === id ? { ...f, ...updates } : f));
  };

  const processFiles = async () => {
    if (isProcessing || files.length === 0) return;
    setIsProcessing(true);

    const currentFiles = [...files];

    for (let i = 0; i < currentFiles.length; i++) {
      const fileObj = currentFiles[i];
      const id = fileObj.id;

      if (fileObj.state !== "idle") continue;

      updateFileStatus(id, { state: "processing" });

      try {
        const formData = new FormData();
        formData.append("file", fileObj.file);

        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/processar-pdf`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Erro na resposta do servidor");
        }

        updateFileStatus(id, { state: "done" });
      } catch (error) {
        console.error("Erro ao enviar arquivo:", error);
        updateFileStatus(id, { 
          state: "error", 
          errorMessage: "Falha no processamento. Tente novamente." 
        });
      }
    }

    setIsProcessing(false);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const validFilesCount = files.filter(f => f.state !== "done" && !f.errorMessage).length;
  const hasExcessFiles = files.some(f => f.state === "error" && !!f.errorMessage);

  return (
    <main className="min-h-screen bg-gray-50/30 flex flex-col items-center justify-center p-6">
      
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-slate-900">
            Envio de Notas Fiscais, Boletos ou Outros
          </h1>
          <Dialog>
            <DialogTrigger className="text-slate-400 hover:text-slate-600 transition-colors focus:outline-none rounded-full focus-visible:ring-2 focus-visible:ring-slate-400">
              <CircleHelp className="h-7 w-7" />
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>O que significa "Outros"?</DialogTitle>
              </DialogHeader>
              <div className="-mx-4 max-h-[50vh] overflow-y-auto px-4 mt-2">
                <p className="mb-4 leading-normal text-sm text-slate-700">
                  "Outros" se refere àqueles documentos que substituem Notas Fiscais por um breve período de tempo, como Cupons Fiscais e Pedidos de Compra.
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <p className="text-slate-500">Envie abaixo os seus documentos:</p>
      </div>

      <Card className="w-full max-w-lg shadow-sm border-slate-200">
        <CardContent className="flex flex-col items-center justify-center pt-8 pb-8">
          
          <div className="flex flex-col items-center justify-center space-y-4 w-full mb-6">
            <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-2">
              <UploadCloud className="h-8 w-8 text-slate-600" />
            </div>
            
            <div className="text-center space-y-1">
              <p className="text-sm font-medium text-slate-700">Arraste e solte ou clique para buscar</p>
              <p className="text-xs text-slate-500">Apenas arquivos PDF e JPG até 10MB são aceitos</p>
              <p className={`text-xs ${hasExcessFiles ? 'text-red-500 font-medium' : 'text-slate-500'}`}>
                Você pode processar até 10 arquivos por vez (fila atual: {validFilesCount}/10)
              </p>
            </div>

            <div className="relative mt-4">
              <input 
                type="file" 
                multiple
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" 
                accept=".pdf,.jpg,.jpeg"
                onChange={handleFileChange}
                disabled={isProcessing}
              />
              <Button variant="outline" disabled={isProcessing}>Buscar arquivos</Button>
            </div>
          </div>

          {files.length > 0 && (
            <div className="w-full space-y-3 border-t border-slate-100 pt-6">
              
              {files.map((fileItem) => (
                <Attachment 
                  key={fileItem.id} 
                  state={fileItem.state} 
                  className={`w-full shadow-sm transition-all duration-300 ${
                    fileItem.state === 'done' 
                      ? 'border-green-300' 
                      : 'bg-white'
                  }`}
                >
                  <AttachmentMedia
                    className={fileItem.state === "done" ? "bg-green-100 text-green-600" : ""}
                  >
                    {fileItem.state === "idle" && <ClockIcon />}
                    {fileItem.state === "processing" && <Spinner />}
                    {fileItem.state === "error" && <FileWarningIcon />}
                    {fileItem.state === "done" && <CheckIcon />}
                  </AttachmentMedia>
                  
                  <AttachmentContent>
                    <AttachmentTitle>{fileItem.file.name}</AttachmentTitle>
                    <AttachmentDescription>
                      {fileItem.state === "idle" && "Aguardando processamento"}
                      {fileItem.state === "processing" && "Em processamento..."}
                      {fileItem.state === "error" && (fileItem.errorMessage || "Ocorreu uma falha. Tente novamente.")}
                      {fileItem.state === "done" && (
                        <span className="text-green-600">
                          Processamento concluído
                        </span>
                      )}
                    </AttachmentDescription>
                  </AttachmentContent>
                  
                  <AttachmentActions>
                    {fileItem.state === "error" && !fileItem.errorMessage && (
                      <AttachmentAction aria-label="Tentar novamente" onClick={() => retryFile(fileItem.id)}>
                        <RefreshCwIcon />
                      </AttachmentAction>
                    )}
                    {fileItem.state !== "processing" && (
                      <AttachmentAction aria-label="Remover arquivo" onClick={() => removeFile(fileItem.id)}>
                        <XIcon />
                      </AttachmentAction>
                    )}
                  </AttachmentActions>
                </Attachment>
              ))}

              <div className="pt-4">
                <Button 
                  className="w-full" 
                  onClick={processFiles}
                  disabled={isProcessing || !files.some(f => f.state === 'idle')}
                >
                  {isProcessing ? (
                    <>
                      <Spinner className="mr-2 h-4 w-4" />
                      Processando arquivos na fila...
                    </>
                  ) : (
                    "Processar arquivos na fila"
                  )}
                </Button>
              </div>

            </div>
          )}

        </CardContent>
      </Card>
    </main>
  );
}