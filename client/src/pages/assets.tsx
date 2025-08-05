import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, QrCode, FileText, Image, Calendar, Wrench } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";

interface Asset {
  id: number;
  assetCode: string;
  name: string;
  description?: string;
  category?: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  location?: string;
  status: string;
  purchaseDate?: string;
  warrantyExpiry?: string;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  qrCode?: string;
  documentationUrl?: string;
  imageUrl?: string;
  contractId?: number;
}

const ASSET_CATEGORIES = [
  "HVAC",
  "Elétrico",
  "Hidráulico",
  "TI/Computadores",
  "Mobiliário",
  "Veículos",
  "Equipamento de Segurança",
  "Outro"
];

const ASSET_STATUS = [
  { value: "OPERATIONAL", label: "Operacional", color: "green" },
  { value: "UNDER_MAINTENANCE", label: "Em Manutenção", color: "yellow" },
  { value: "OUT_OF_SERVICE", label: "Fora de Serviço", color: "red" }
];

export default function Assets() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  const { data: assets = [], isLoading } = useQuery({
    queryKey: ['/api/assets'],
  });

  const { data: contracts = [] } = useQuery({
    queryKey: ['/api/contracts'],
  });

  const createMutation = useMutation({
    mutationFn: async (data: Partial<Asset>) => {
      return await apiRequest('/api/assets', 'POST', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/assets'] });
      setIsCreateOpen(false);
      toast({
        title: "Sucesso",
        description: "Ativo criado com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao criar ativo",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Asset> }) => {
      return await apiRequest(`/api/assets/${id}`, 'PUT', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/assets'] });
      setEditingAsset(null);
      toast({
        title: "Sucesso",
        description: "Ativo atualizado com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao atualizar ativo",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/assets/${id}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/assets'] });
      toast({
        title: "Sucesso",
        description: "Ativo removido com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao remover ativo",
        variant: "destructive",
      });
    },
  });

  const filteredAssets = assets.filter((asset: Asset) =>
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.assetCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const statusInfo = ASSET_STATUS.find(s => s.value === status);
    if (!statusInfo) return <Badge>{status}</Badge>;
    
    return (
      <Badge className={`
        ${statusInfo.color === 'green' ? 'bg-green-500' : ''}
        ${statusInfo.color === 'yellow' ? 'bg-yellow-500' : ''}
        ${statusInfo.color === 'red' ? 'bg-red-500' : ''}
      `}>
        {statusInfo.label}
      </Badge>
    );
  };

  const AssetForm = ({ asset, onSubmit, onCancel }: {
    asset?: Asset | null;
    onSubmit: (data: Partial<Asset>) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState<Partial<Asset>>(asset || {
      status: 'OPERATIONAL'
    });

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="assetCode">Código do Ativo</Label>
            <Input
              id="assetCode"
              value={formData.assetCode || ''}
              onChange={(e) => setFormData({ ...formData, assetCode: e.target.value })}
              placeholder="EQ-001"
            />
          </div>
          <div>
            <Label htmlFor="name">Nome do Ativo</Label>
            <Input
              id="name"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ar Condicionado Central"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Descrição detalhada do ativo..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="category">Categoria</Label>
            <Select
              value={formData.category || ''}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                {ASSET_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status || 'OPERATIONAL'}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ASSET_STATUS.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="manufacturer">Fabricante</Label>
            <Input
              id="manufacturer"
              value={formData.manufacturer || ''}
              onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="model">Modelo</Label>
            <Input
              id="model"
              value={formData.model || ''}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="serialNumber">Número de Série</Label>
            <Input
              id="serialNumber"
              value={formData.serialNumber || ''}
              onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="location">Localização</Label>
            <Input
              id="location"
              value={formData.location || ''}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Sala A, 2º andar"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="purchaseDate">Data de Compra</Label>
            <Input
              id="purchaseDate"
              type="date"
              value={formData.purchaseDate || ''}
              onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="warrantyExpiry">Vencimento da Garantia</Label>
            <Input
              id="warrantyExpiry"
              type="date"
              value={formData.warrantyExpiry || ''}
              onChange={(e) => setFormData({ ...formData, warrantyExpiry: e.target.value })}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="contractId">Contrato Associado</Label>
          <Select
            value={formData.contractId?.toString() || ''}
            onValueChange={(value) => setFormData({ ...formData, contractId: parseInt(value) })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um contrato" />
            </SelectTrigger>
            <SelectContent>
              {contracts.map((contract: any) => (
                <SelectItem key={contract.id} value={contract.id.toString()}>
                  {contract.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button onClick={() => onSubmit(formData)}>
            {asset ? 'Atualizar' : 'Criar'}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Ativos</h1>
          <p className="text-muted-foreground">Gerencie os equipamentos e ativos da empresa</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Ativo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Novo Ativo</DialogTitle>
            </DialogHeader>
            <AssetForm
              onSubmit={(data) => createMutation.mutate(data)}
              onCancel={() => setIsCreateOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Lista de Ativos</CardTitle>
            <Input
              placeholder="Buscar ativos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Localização</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Próx. Manutenção</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssets.map((asset) => (
                    <TableRow key={asset.id}>
                      <TableCell className="font-mono">{asset.assetCode}</TableCell>
                      <TableCell>{asset.name}</TableCell>
                      <TableCell>{asset.category || '-'}</TableCell>
                      <TableCell>{asset.location || '-'}</TableCell>
                      <TableCell>{getStatusBadge(asset.status)}</TableCell>
                      <TableCell>
                        {asset.nextMaintenanceDate
                          ? new Date(asset.nextMaintenanceDate).toLocaleDateString('pt-BR')
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setEditingAsset(asset)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => deleteMutation.mutate(asset.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          {asset.qrCode && (
                            <Button size="icon" variant="ghost">
                              <QrCode className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!editingAsset} onOpenChange={(open) => !open && setEditingAsset(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Ativo</DialogTitle>
          </DialogHeader>
          <AssetForm
            asset={editingAsset}
            onSubmit={(data) => editingAsset && updateMutation.mutate({ id: editingAsset.id, data })}
            onCancel={() => setEditingAsset(null)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}