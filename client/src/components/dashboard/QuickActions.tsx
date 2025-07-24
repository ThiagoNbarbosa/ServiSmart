import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { FileSpreadsheet, Plus, BarChart3, Settings } from "lucide-react";
import ExcelImport from "./ExcelImport";

export default function QuickActions() {
  const [showImport, setShowImport] = useState(false);

  const actions = [
    {
      icon: FileSpreadsheet,
      label: "Importar Excel",
      color: "hover:border-blue-500 hover:bg-blue-50 group-hover:text-blue-500",
      iconColor: "text-gray-400 group-hover:text-blue-500",
      onClick: () => setShowImport(true)
    },
    {
      icon: Plus,
      label: "Nova OS",
      color: "hover:border-green-500 hover:bg-green-50 group-hover:text-green-500",
      iconColor: "text-gray-400 group-hover:text-green-500",
      onClick: () => console.log('Nova OS')
    },
    {
      icon: BarChart3,
      label: "Relatórios",
      color: "hover:border-purple-500 hover:bg-purple-50 group-hover:text-purple-500",
      iconColor: "text-gray-400 group-hover:text-purple-500",
      onClick: () => console.log('Relatórios')
    },
    {
      icon: Settings,
      label: "Configurações",
      color: "hover:border-orange-500 hover:bg-orange-50 group-hover:text-orange-500",
      iconColor: "text-gray-400 group-hover:text-orange-500",
      onClick: () => console.log('Configurações')
    }
  ];

  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className={`flex items-center justify-center space-x-3 p-6 h-auto border-2 border-dashed border-gray-300 transition-all group ${action.color}`}
                onClick={action.onClick}
              >
                <action.icon className={`h-6 w-6 ${action.iconColor}`} />
                <span className="font-medium text-gray-700 group-hover:text-current">
                  {action.label}
                </span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <ExcelImport 
        open={showImport} 
        onOpenChange={setShowImport}
      />
    </>
  );
}
