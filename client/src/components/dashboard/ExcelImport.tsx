import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle } from "lucide-react";

interface ExcelImportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ExcelImport({ open, onOpenChange }: ExcelImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const importMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      // Use fetch directly to handle FormData properly
      const response = await fetch('/api/work-orders/import', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro na importação');
      }
      
      return response;
    },
    onSuccess: async (response) => {
      const result = await response.json();
      toast({
        title: "Importação concluída",
        description: result.errors 
          ? `${result.count} OS importadas com ${result.errors.length} avisos` 
          : `${result.count} OS foram importadas com sucesso`,
        variant: result.errors ? "default" : "default",
      });
      
      // Show errors if any
      if (result.errors && result.errors.length > 0) {
        console.warn("Import warnings:", result.errors);
      }
      
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/metrics'] });
      queryClient.invalidateQueries({ queryKey: ['/api/work-orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/recent-activity'] });
      onOpenChange(false);
      setFile(null);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Erro na importação",
        description: error.message || "Falha ao importar arquivo",
        variant: "destructive",
      });
    },
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
      toast({
        title: "Formato inválido",
        description: "Por favor, selecione um arquivo Excel (.xlsx ou .xls)",
        variant: "destructive",
      });
      return;
    }
    
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O arquivo deve ter no máximo 10MB",
        variant: "destructive",
      });
      return;
    }
    
    setFile(selectedFile);
  };

  const handleSubmit = () => {
    if (!file) return;
    importMutation.mutate(file);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Importar Ordens de Serviço Preventivas</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Template Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Formato da Planilha PREVENTIVAS
            </h3>
            <div className="text-xs text-blue-700 space-y-1">
              <div><strong>Colunas esperadas (ordem):</strong></div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 ml-2">
                <div>1. Número OS</div>
                <div>2. Descrição</div>
                <div>3. Equipamento</div>
                <div>4. Local</div>
                <div>5. Data Agendada</div>
                <div>6. Prioridade</div>
                <div>7. Técnico</div>
                <div>8. Observações</div>
              </div>
              <div className="mt-2 text-blue-600">
                💡 <strong>Dica:</strong> A primeira linha deve conter os cabeçalhos
              </div>
            </div>
          </div>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {file ? (
              <div className="space-y-2">
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto" />
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                <p className="text-sm text-gray-600">
                  Arraste um arquivo Excel aqui ou clique para selecionar
                </p>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                  className="hidden"
                  id="file-input"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('file-input')?.click()}
                >
                  Selecionar arquivo
                </Button>
              </div>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <FileSpreadsheet className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Formato esperado:</p>
                <ul className="text-xs space-y-1">
                  <li>• Coluna A: Título da OS</li>
                  <li>• Coluna B: Descrição</li>
                  <li>• Coluna C: Nome do equipamento</li>
                  <li>• Coluna D: Localização</li>
                  <li>• Coluna E: Prioridade (BAIXA/NORMAL/ALTA)</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!file || importMutation.isPending}
            >
              {importMutation.isPending ? "Importando..." : "Importar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
