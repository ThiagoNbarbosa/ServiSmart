import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { 
  Settings, 
  Moon, 
  RefreshCw, 
  Clock,
  Monitor,
  Palette,
  Timer
} from "lucide-react";
import type { TVModeConfig } from "@/hooks/useTVMode";

interface TVConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: TVModeConfig;
  onConfigChange: (config: Partial<TVModeConfig>) => void;
}

export default function TVConfigModal({ 
  isOpen, 
  onClose, 
  config, 
  onConfigChange 
}: TVConfigModalProps) {
  const [localConfig, setLocalConfig] = useState<TVModeConfig>(config);

  const handleSave = () => {
    onConfigChange(localConfig);
    onClose();
  };

  const handleSliderChange = (value: number[]) => {
    setLocalConfig(prev => ({ ...prev, rotationInterval: value[0] }));
  };

  const toggleNightMode = (checked: boolean) => {
    setLocalConfig(prev => ({ ...prev, nightMode: checked }));
  };

  const toggleAutoRefresh = (checked: boolean) => {
    setLocalConfig(prev => ({ ...prev, autoRefresh: checked }));
  };

  const toggleShowClock = (checked: boolean) => {
    setLocalConfig(prev => ({ ...prev, showClock: checked }));
  };

  const presetIntervals = [
    { label: '15 segundos', value: 15 },
    { label: '30 segundos', value: 30 },
    { label: '1 minuto', value: 60 },
    { label: '2 minutos', value: 120 },
    { label: '5 minutos', value: 300 }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 text-white border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold flex items-center gap-3">
            <Settings className="h-8 w-8 text-blue-400" />
            Configurações do Modo TV
          </DialogTitle>
          <DialogDescription className="text-lg text-gray-300">
            Personalize a experiência do modo TV para suas necessidades
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Configurações de Rotação */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <Timer className="h-6 w-6 text-blue-400" />
                Rotação de Telas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-lg font-semibold text-gray-200 mb-4 block">
                  Intervalo de Rotação
                </Label>
                <div className="px-3">
                  <Slider
                    value={[localConfig.rotationInterval]}
                    onValueChange={handleSliderChange}
                    max={300}
                    min={10}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-400 mt-2">
                    <span>10s</span>
                    <span className="font-bold text-blue-400">
                      {localConfig.rotationInterval}s
                    </span>
                    <span>5min</span>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-lg font-semibold text-gray-200 mb-3 block">
                  Presets Rápidos
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {presetIntervals.map((preset) => (
                    <Button
                      key={preset.value}
                      variant={localConfig.rotationInterval === preset.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setLocalConfig(prev => ({ ...prev, rotationInterval: preset.value }))}
                      className="text-sm"
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configurações Visuais */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <Palette className="h-6 w-6 text-purple-400" />
                Aparência
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-lg font-semibold text-gray-200">
                    Modo Noite
                  </Label>
                  <p className="text-sm text-gray-400">
                    Ideal para ambientes com pouca luz
                  </p>
                </div>
                <Switch 
                  checked={localConfig.nightMode}
                  onCheckedChange={toggleNightMode}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-lg font-semibold text-gray-200">
                    Mostrar Relógio
                  </Label>
                  <p className="text-sm text-gray-400">
                    Exibe horário atual na tela
                  </p>
                </div>
                <Switch 
                  checked={localConfig.showClock}
                  onCheckedChange={toggleShowClock}
                />
              </div>

              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Moon className="h-5 w-5 text-purple-400" />
                  <span className="font-semibold text-gray-200">Preview</span>
                </div>
                <div className={`w-full h-20 rounded border-2 transition-all ${
                  localConfig.nightMode 
                    ? 'bg-black border-purple-500' 
                    : 'bg-gray-600 border-blue-500'
                }`}>
                  <div className="flex items-center justify-center h-full">
                    <span className={`text-sm font-bold ${
                      localConfig.nightMode ? 'text-purple-300' : 'text-blue-300'
                    }`}>
                      {localConfig.nightMode ? 'Modo Noite' : 'Modo Claro'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configurações de Dados */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <RefreshCw className="h-6 w-6 text-green-400" />
                Atualização de Dados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-lg font-semibold text-gray-200">
                    Auto-Refresh
                  </Label>
                  <p className="text-sm text-gray-400">
                    Atualiza dados automaticamente a cada 15s
                  </p>
                </div>
                <Switch 
                  checked={localConfig.autoRefresh}
                  onCheckedChange={toggleAutoRefresh}
                />
              </div>

              <div className="bg-gray-700 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <RefreshCw className="h-8 w-8 mx-auto mb-2 text-green-400" />
                    <div className="text-sm font-semibold text-gray-200">Rotação</div>
                    <div className="text-xs text-gray-400">{localConfig.rotationInterval}s</div>
                  </div>
                  <div>
                    <Clock className="h-8 w-8 mx-auto mb-2 text-blue-400" />
                    <div className="text-sm font-semibold text-gray-200">Refresh</div>
                    <div className="text-xs text-gray-400">{localConfig.autoRefresh ? '15s' : 'Off'}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações do Sistema */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <Monitor className="h-6 w-6 text-orange-400" />
                Informações do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-sm text-gray-300 space-y-2">
                  <div className="flex justify-between">
                    <span>Resolução recomendada:</span>
                    <span className="font-bold text-white">1920x1080 ou superior</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Controle de saída:</span>
                    <span className="font-bold text-white">Tecla ESC</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Navegação manual:</span>
                    <span className="font-bold text-white">Clique nas visões</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Atualização WebSocket:</span>
                    <span className="font-bold text-green-400">Tempo real</span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-500 leading-relaxed">
                <p>• As configurações são aplicadas imediatamente</p>
                <p>• Pressione ESC a qualquer momento para sair</p>
                <p>• Recomenda-se tela cheia para melhor experiência</p>
                <p>• Dados críticos são atualizados com maior frequência</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-700">
          <Button variant="outline" onClick={onClose} className="px-8">
            Cancelar
          </Button>
          <Button onClick={handleSave} className="px-8">
            Salvar Configurações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}