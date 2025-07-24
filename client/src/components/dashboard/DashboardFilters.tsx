import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface DashboardFiltersProps {
  filters: any;
  onFiltersChange: (filters: any) => void;
}

export default function DashboardFilters({ filters, onFiltersChange }: DashboardFiltersProps) {
  const { data: technicians } = useQuery({
    queryKey: ['/api/technicians'],
  });

  const { data: contracts } = useQuery({
    queryKey: ['/api/contracts'],
  });

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters };
    if (value === 'all' || !value) {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
    }
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filtros:</span>
        </div>
        
        {/* Date Range */}
        <Select value={filters.dateRange || 'all'} onValueChange={(value) => handleFilterChange('dateRange', value)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os períodos</SelectItem>
            <SelectItem value="7d">Últimos 7 dias</SelectItem>
            <SelectItem value="30d">Últimos 30 dias</SelectItem>
            <SelectItem value="current_month">Este mês</SelectItem>
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select value={filters.status || 'all'} onValueChange={(value) => handleFilterChange('status', value)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="PENDENTE">
              <div className="flex items-center">
                <span className="status-indicator status-pendente"></span>
                Pendente
              </div>
            </SelectItem>
            <SelectItem value="AGENDADA">
              <div className="flex items-center">
                <span className="status-indicator status-agendada"></span>
                Agendada
              </div>
            </SelectItem>
            <SelectItem value="CONCLUIDA">
              <div className="flex items-center">
                <span className="status-indicator status-concluida"></span>
                Concluída
              </div>
            </SelectItem>
            <SelectItem value="VENCIDA">
              <div className="flex items-center">
                <span className="status-indicator status-vencida"></span>
                Vencida
              </div>
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Technician Filter */}
        <Select value={filters.technicianId || 'all'} onValueChange={(value) => handleFilterChange('technicianId', value)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Técnico" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os técnicos</SelectItem>
            {technicians?.map((tech: any) => (
              <SelectItem key={tech.id} value={tech.id.toString()}>
                {tech.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Contract Filter */}
        <Select value={filters.contractId || 'all'} onValueChange={(value) => handleFilterChange('contractId', value)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Contrato" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os contratos</SelectItem>
            {contracts?.map((contract: any) => (
              <SelectItem key={contract.id} value={contract.id.toString()}>
                {contract.name} - {contract.company}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
          >
            <X className="h-4 w-4 mr-1" />
            Limpar
          </Button>
        )}
      </div>
    </div>
  );
}
