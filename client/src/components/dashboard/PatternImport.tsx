import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, Users, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ImportResult {
  technicians: number;
  elaborators: number;
  contracts: number;
}

export default function PatternImport() {
  const [isUploading, setIsUploading] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast({
        title: "Formato inválido",
        description: "Por favor, selecione um arquivo CSV.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiRequest('/api/import-patterns', {
        method: 'POST',
        body: formData,
      });

      setImportResult(response.imported);
      toast({
        title: "Importação concluída",
        description: `Técnicos: ${response.imported.technicians}, Elaboradores: ${response.imported.elaborators}, Contratos: ${response.imported.contracts}`,
      });

    } catch (error) {
      console.error('Error importing patterns:', error);
      toast({
        title: "Erro na importação",
        description: "Falha ao importar os padrões. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset file input
      event.target.value = '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Importar Padrões (Técnicos, Elaboradores, Contratos)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 mb-4 text-gray-500" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Clique para enviar</span> arquivo CSV de padrões
              </p>
              <p className="text-xs text-gray-500">CSV com colunas: Nome, Categoria</p>
            </div>
            <input
              type="file"
              className="hidden"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
          </label>
        </div>

        {isUploading && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Importando padrões...</p>
          </div>
        )}

        {importResult && (
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <Users className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <div className="text-lg font-bold text-blue-600">{importResult.technicians}</div>
              <div className="text-sm text-gray-600">Técnicos</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <FileText className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <div className="text-lg font-bold text-green-600">{importResult.elaborators}</div>
              <div className="text-sm text-gray-600">Elaboradores</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <Building2 className="h-6 w-6 mx-auto mb-2 text-purple-600" />
              <div className="text-lg font-bold text-purple-600">{importResult.contracts}</div>
              <div className="text-sm text-gray-600">Contratos</div>
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
          <strong>Formato esperado:</strong>
          <br />
          • Coluna 1: Nome (ex: FELIPE, DIVINOPOLIS MG - CTR 2056)
          <br />
          • Coluna 2: Categoria (Técnico, Elaborador, Contrato, Responsável)
          <br />
          • Arquivo CSV separado por ponto e vírgula (;)
        </div>
      </CardContent>
    </Card>
  );
}