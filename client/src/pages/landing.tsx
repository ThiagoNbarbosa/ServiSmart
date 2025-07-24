import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <div className="mx-auto h-48 w-64 flex items-center justify-center">
            {/* MAFFENG Logo */}
            <svg viewBox="0 0 200 120" className="h-full w-full">
              <path d="M20 100 L50 20 L80 70 L110 20 L140 100" stroke="#B91C1C" strokeWidth="16" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M60 100 L90 20 L120 70 L150 20 L180 100" stroke="#374151" strokeWidth="16" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center text-3xl">Dashboard OS Preventiva</CardTitle>
            <p className="text-center text-gray-600 mt-2">
              Sistema inteligente de gestão de Ordens de Serviço
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button 
                className="w-full" 
                onClick={() => window.location.href = '/api/login'}
              >
                Entrar no Sistema
              </Button>
              
              <div className="text-center">
                <p className="text-sm text-gray-500">
                  Acesso restrito a usuários autorizados
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-sm font-medium text-blue-800 mb-2">
                ✨ Funcionalidades
              </h3>
              <div className="text-xs text-blue-700 space-y-1">
                <div>• Dashboard inteligente com métricas em tempo real</div>
                <div>• Importação de OS via Excel</div>
                <div>• Chat interno por OS</div>
                <div>• Alertas automatizados</div>
                <div>• Modo TV para equipe de engenharia</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
