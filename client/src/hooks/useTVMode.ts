import { useState, useEffect, useCallback, useRef } from 'react';
import { useWebSocket } from './useWebSocket';
import { queryClient } from '@/lib/queryClient';

export type TVView = 'overview' | 'technicians' | 'schedule' | 'critical';

export interface TVModeConfig {
  rotationInterval: number; // em segundos
  nightMode: boolean;
  autoRefresh: boolean;
  showClock: boolean;
}

const DEFAULT_CONFIG: TVModeConfig = {
  rotationInterval: 30,
  nightMode: false,
  autoRefresh: true,
  showClock: true,
};

export function useTVMode() {
  const [isActive, setIsActive] = useState(false);
  const [currentView, setCurrentView] = useState<TVView>('overview');
  const [config, setConfig] = useState<TVModeConfig>(DEFAULT_CONFIG);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  
  const rotationTimerRef = useRef<NodeJS.Timeout>();
  const countdownTimerRef = useRef<NodeJS.Timeout>();
  const { connectionStatus, sendMessage } = useWebSocket();

  const views: TVView[] = ['overview', 'technicians', 'schedule', 'critical'];

  // Controla tela cheia
  const enterFullscreen = useCallback(async () => {
    try {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } catch (error) {
      console.error('Erro ao entrar em tela cheia:', error);
    }
  }, []);

  const exitFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
      setIsFullscreen(false);
    } catch (error) {
      console.error('Erro ao sair da tela cheia:', error);
    }
  }, []);

  // Ativa modo TV
  const activateTVMode = useCallback(async () => {
    setIsActive(true);
    await enterFullscreen();
    
    // Aplica classe CSS para modo TV
    document.body.classList.add('tv-mode');
    
    // Aplica modo noite se configurado
    if (config.nightMode) {
      document.body.classList.add('tv-night-mode');
    }

    // Inicia rotação automática
    startRotation();

    // Envia mensagem via WebSocket para otimizar atualizações
    sendMessage({
      type: 'TV_MODE_ACTIVATED',
      config: config
    });
  }, [config, enterFullscreen, sendMessage]);

  // Desativa modo TV
  const deactivateTVMode = useCallback(async () => {
    setIsActive(false);
    await exitFullscreen();
    
    // Remove classes CSS
    document.body.classList.remove('tv-mode', 'tv-night-mode');
    
    // Para rotação
    stopRotation();

    // Restaura visão padrão
    setCurrentView('overview');

    // Notifica via WebSocket
    sendMessage({
      type: 'TV_MODE_DEACTIVATED'
    });
  }, [exitFullscreen, sendMessage]);

  // Controla rotação automática
  const startRotation = useCallback(() => {
    stopRotation(); // Limpa timer anterior
    
    setTimeRemaining(config.rotationInterval);
    
    // Timer para countdown
    countdownTimerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          return config.rotationInterval;
        }
        return prev - 1;
      });
    }, 1000);

    // Timer para rotação
    rotationTimerRef.current = setInterval(() => {
      setCurrentView(prevView => {
        const currentIndex = views.indexOf(prevView);
        const nextIndex = (currentIndex + 1) % views.length;
        return views[nextIndex];
      });
      
      // Refresh dados quando muda visão
      if (config.autoRefresh) {
        queryClient.refetchQueries({ 
          queryKey: ['/api/dashboard'] 
        });
      }
      
      setTimeRemaining(config.rotationInterval);
    }, config.rotationInterval * 1000);
  }, [config.rotationInterval, config.autoRefresh, views]);

  const stopRotation = useCallback(() => {
    if (rotationTimerRef.current) {
      clearInterval(rotationTimerRef.current);
      rotationTimerRef.current = undefined;
    }
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = undefined;
    }
  }, []);

  // Navegação manual entre visões
  const goToView = useCallback((view: TVView) => {
    setCurrentView(view);
    if (isActive) {
      // Reinicia timer de rotação
      startRotation();
    }
  }, [isActive, startRotation]);

  // Atualiza configurações
  const updateConfig = useCallback((newConfig: Partial<TVModeConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
    
    // Se estiver ativo, aplica mudanças imediatamente
    if (isActive) {
      const updatedConfig = { ...config, ...newConfig };
      
      // Modo noite
      if (updatedConfig.nightMode !== config.nightMode) {
        document.body.classList.toggle('tv-night-mode', updatedConfig.nightMode);
      }
      
      // Reinicia rotação se mudou intervalo
      if (updatedConfig.rotationInterval !== config.rotationInterval) {
        startRotation();
      }
    }
  }, [config, isActive, startRotation]);

  // Listener para ESC key
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isActive) {
        deactivateTVMode();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isActive, deactivateTVMode]);

  // Listener para mudanças de fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isCurrentlyFullscreen);
      
      // Se saiu de fullscreen mas TV mode estava ativo, desativa
      if (!isCurrentlyFullscreen && isActive) {
        deactivateTVMode();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [isActive, deactivateTVMode]);

  // Cleanup na desmontagem
  useEffect(() => {
    return () => {
      stopRotation();
      if (isActive) {
        deactivateTVMode();
      }
    };
  }, [isActive, deactivateTVMode, stopRotation]);

  // Auto-refresh mais frequente quando em modo TV
  useEffect(() => {
    if (isActive && config.autoRefresh) {
      const refreshInterval = setInterval(() => {
        queryClient.refetchQueries({ 
          queryKey: ['/api/dashboard'] 
        });
      }, 15000); // Refresh a cada 15 segundos

      return () => clearInterval(refreshInterval);
    }
  }, [isActive, config.autoRefresh]);

  return {
    // Estado
    isActive,
    currentView,
    config,
    isFullscreen,
    timeRemaining,
    connectionStatus,
    
    // Ações
    activateTVMode,
    deactivateTVMode,
    goToView,
    updateConfig,
    
    // Utilitários
    views,
  };
}