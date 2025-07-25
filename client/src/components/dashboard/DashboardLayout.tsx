import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardData } from "@/hooks/useDashboardData";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import DashboardFilters from "./DashboardFilters";
import AlertBanner from "./AlertBanner";
import MetricsGrid from "./MetricsGrid";
import StatusChart from "./StatusChart";
import TrendChart from "./TrendChart";
import TechnicianPerformance from "./TechnicianPerformance";
import RecentActivity from "./RecentActivity";
import QuickActions from "./QuickActions";
import AutoRefreshIndicator from "./AutoRefreshIndicator";
import FloatingNotification from "./FloatingNotification";
import { Monitor, Tv, Users } from "lucide-react";
import { Link } from "wouter";

export default function DashboardLayout() {
  const { user } = useAuth();
  const [tvMode, setTvMode] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(60);
  const [filters, setFilters] = useState({});
  
  const { 
    metrics, 
    statusDistribution, 
    technicianStats, 
    recentActivity, 
    monthlyTrends,
    notifications,
    isLoading,
    refetch 
  } = useDashboardData(filters, refreshInterval);

  const toggleTvMode = () => {
    setTvMode(!tvMode);
    document.body.classList.toggle('tv-mode', !tvMode);
  };

  const unreadNotifications = notifications?.filter(n => !n.read).length || 0;

  return (
    <div className={`min-h-screen ${tvMode ? 'tv-mode' : 'bg-gradient-to-br from-blue-50 to-indigo-100'}`}>
      {/* Header Navigation */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="h-8 w-12 flex items-center">
                {/* MAFFENG Logo */}
                <svg viewBox="0 0 100 60" className="h-full w-full">
                  <path d="M10 50 L25 10 L40 35 L55 10 L70 50" stroke="#B91C1C" strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M30 50 L45 10 L60 35 L75 10 L90 50" stroke="#374151" strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h1 className={`text-xl font-bold text-gray-900 dashboard-header ${tvMode ? 'text-4xl' : ''}`}>
                  Dashboard OS Preventiva
                </h1>
                <p className="text-sm text-gray-500">
                  {user?.firstName} {user?.lastName} - {user?.userLevel}
                </p>
              </div>
            </div>

            {/* Controls and User Info */}
            <div className="flex items-center space-x-4">
              {/* Team Information Link */}
              <Link href="/team">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <Users className="h-4 w-4" />
                  <span>Equipe</span>
                </Button>
              </Link>

              {/* TV Mode Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={toggleTvMode}
                className="flex items-center space-x-2"
              >
                {tvMode ? <Monitor className="h-4 w-4" /> : <Tv className="h-4 w-4" />}
                <span>{tvMode ? 'Sair do TV' : 'Modo TV'}</span>
              </Button>

              {/* Refresh Interval Selector */}
              <Select value={refreshInterval.toString()} onValueChange={(value) => setRefreshInterval(parseInt(value))}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30s</SelectItem>
                  <SelectItem value="60">1min</SelectItem>
                  <SelectItem value="300">5min</SelectItem>
                </SelectContent>
              </Select>

              {/* Notifications */}
              <div className="relative">
                <Button variant="ghost" size="sm" className="relative">
                  <i className="fas fa-bell"></i>
                  {unreadNotifications > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                      {unreadNotifications}
                    </Badge>
                  )}
                </Button>
              </div>

              {/* User Avatar */}
              <div className="flex items-center space-x-3">
                <img 
                  src={user?.profileImageUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=32&h=32"} 
                  alt="User Avatar" 
                  className="h-8 w-8 rounded-full object-cover" 
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters Section */}
        <DashboardFilters filters={filters} onFiltersChange={setFilters} />

        {/* Alert Banner */}
        <AlertBanner metrics={metrics} />

        {/* Key Metrics Cards */}
        <MetricsGrid metrics={metrics} isLoading={isLoading} />

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <StatusChart data={statusDistribution} isLoading={isLoading} />
          <TrendChart data={monthlyTrends} isLoading={isLoading} />
        </div>

        {/* Performance and Activity Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
          <TechnicianPerformance data={technicianStats} isLoading={isLoading} />
          <RecentActivity data={recentActivity} isLoading={isLoading} />
        </div>

        {/* Quick Actions Section */}
        <QuickActions />
      </div>

      {/* Floating Components */}
      <AutoRefreshIndicator interval={refreshInterval} onRefresh={refetch} />
      <FloatingNotification notifications={notifications} />
    </div>
  );
}
