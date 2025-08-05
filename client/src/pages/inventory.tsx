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
import { Plus, Pencil, Trash2, Package, AlertCircle, TrendingDown, TrendingUp, DollarSign } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface InventoryItem {
  id: number;
  partNumber: string;
  name: string;
  description?: string;
  category?: string;
  unit: string;
  currentStock: string;
  minimumStock: string;
  maximumStock?: string;
  location?: string;
  supplier?: string;
  unitCost?: string;
  imageUrl?: string;
}

interface InventoryTransaction {
  id: number;
  inventoryItemId: number;
  workOrderId?: number;
  transactionType: string;
  quantity: string;
  unitCost?: string;
  totalCost?: string;
  notes?: string;
  performedBy?: string;
  createdAt: string;
}

const UNITS = [
  { value: "UN", label: "Unidade" },
  { value: "KG", label: "Quilograma" },
  { value: "M", label: "Metro" },
  { value: "L", label: "Litro" },
  { value: "CX", label: "Caixa" },
  { value: "PC", label: "Peça" }
];

const CATEGORIES = [
  "Elétrico",
  "Hidráulico",
  "Mecânico",
  "Eletrônico",
  "Consumível",
  "Ferramenta",
  "EPI",
  "Outro"
];

export default function Inventory() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isTransactionOpen, setIsTransactionOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['/api/inventory'],
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['/api/inventory/transactions', selectedItem?.id],
    enabled: !!selectedItem,
  });

  const createMutation = useMutation({
    mutationFn: async (data: Partial<InventoryItem>) => {
      return await apiRequest('/api/inventory', 'POST', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
      setIsCreateOpen(false);
      toast({
        title: "Sucesso",
        description: "Item criado com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao criar item",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InventoryItem> }) => {
      return await apiRequest(`/api/inventory/${id}`, 'PUT', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
      setEditingItem(null);
      toast({
        title: "Sucesso",
        description: "Item atualizado com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao atualizar item",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/inventory/${id}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
      toast({
        title: "Sucesso",
        description: "Item removido com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao remover item",
        variant: "destructive",
      });
    },
  });

  const transactionMutation = useMutation({
    mutationFn: async (data: Partial<InventoryTransaction>) => {
      return await apiRequest('/api/inventory/transactions', 'POST', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
      queryClient.invalidateQueries({ queryKey: ['/api/inventory/transactions'] });
      setIsTransactionOpen(false);
      toast({
        title: "Sucesso",
        description: "Transação registrada com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao registrar transação",
        variant: "destructive",
      });
    },
  });

  const filteredItems = items.filter((item: InventoryItem) => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const currentStock = parseFloat(item.currentStock);
    const minimumStock = parseFloat(item.minimumStock);
    
    const matchesTab = activeTab === 'all' ||
      (activeTab === 'low' && currentStock <= minimumStock) ||
      (activeTab === 'out' && currentStock === 0);
    
    return matchesSearch && matchesTab;
  });

  const getStockStatus = (item: InventoryItem) => {
    const current = parseFloat(item.currentStock);
    const minimum = parseFloat(item.minimumStock);
    const maximum = parseFloat(item.maximumStock || '999999');
    
    if (current === 0) {
      return <Badge variant="destructive">Sem Estoque</Badge>;
    } else if (current <= minimum) {
      return <Badge variant="destructive">Estoque Baixo</Badge>;
    } else if (current >= maximum) {
      return <Badge variant="secondary">Estoque Máximo</Badge>;
    }
    return <Badge variant="default">Normal</Badge>;
  };

  const getStockIcon = (item: InventoryItem) => {
    const current = parseFloat(item.currentStock);
    const minimum = parseFloat(item.minimumStock);
    
    if (current === 0) {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    } else if (current <= minimum) {
      return <TrendingDown className="h-4 w-4 text-orange-500" />;
    }
    return <TrendingUp className="h-4 w-4 text-green-500" />;
  };

  const InventoryItemForm = ({ item, onSubmit, onCancel }: {
    item?: InventoryItem | null;
    onSubmit: (data: Partial<InventoryItem>) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState<Partial<InventoryItem>>(item || {
      unit: 'UN',
      currentStock: '0',
      minimumStock: '0'
    });

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="partNumber">Código/Part Number</Label>
            <Input
              id="partNumber"
              value={formData.partNumber || ''}
              onChange={(e) => setFormData({ ...formData, partNumber: e.target.value })}
              placeholder="PN-001"
            />
          </div>
          <div>
            <Label htmlFor="name">Nome do Item</Label>
            <Input
              id="name"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Parafuso Sextavado M8"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Descrição detalhada do item..."
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
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="unit">Unidade de Medida</Label>
            <Select
              value={formData.unit || 'UN'}
              onValueChange={(value) => setFormData({ ...formData, unit: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {UNITS.map((unit) => (
                  <SelectItem key={unit.value} value={unit.value}>
                    {unit.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="currentStock">Estoque Atual</Label>
            <Input
              id="currentStock"
              type="number"
              min="0"
              step="0.01"
              value={formData.currentStock || '0'}
              onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="minimumStock">Estoque Mínimo</Label>
            <Input
              id="minimumStock"
              type="number"
              min="0"
              step="0.01"
              value={formData.minimumStock || '0'}
              onChange={(e) => setFormData({ ...formData, minimumStock: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="maximumStock">Estoque Máximo</Label>
            <Input
              id="maximumStock"
              type="number"
              min="0"
              step="0.01"
              value={formData.maximumStock || ''}
              onChange={(e) => setFormData({ ...formData, maximumStock: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="location">Localização</Label>
            <Input
              id="location"
              value={formData.location || ''}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Prateleira A-1"
            />
          </div>
          <div>
            <Label htmlFor="supplier">Fornecedor</Label>
            <Input
              id="supplier"
              value={formData.supplier || ''}
              onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="unitCost">Custo Unitário (R$)</Label>
          <Input
            id="unitCost"
            type="number"
            min="0"
            step="0.01"
            value={formData.unitCost || ''}
            onChange={(e) => setFormData({ ...formData, unitCost: e.target.value })}
            placeholder="0.00"
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button onClick={() => onSubmit(formData)}>
            {item ? 'Atualizar' : 'Criar'}
          </Button>
        </div>
      </div>
    );
  };

  const TransactionForm = ({ item, onSubmit, onCancel }: {
    item: InventoryItem;
    onSubmit: (data: Partial<InventoryTransaction>) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState<Partial<InventoryTransaction>>({
      inventoryItemId: item.id,
      transactionType: 'OUT'
    });

    return (
      <div className="space-y-4">
        <div>
          <Label>Item</Label>
          <div className="p-2 bg-muted rounded">
            {item.partNumber} - {item.name}
          </div>
        </div>

        <div>
          <Label htmlFor="transactionType">Tipo de Transação</Label>
          <Select
            value={formData.transactionType || 'OUT'}
            onValueChange={(value) => setFormData({ ...formData, transactionType: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="IN">Entrada</SelectItem>
              <SelectItem value="OUT">Saída</SelectItem>
              <SelectItem value="ADJUSTMENT">Ajuste</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="quantity">Quantidade</Label>
          <Input
            id="quantity"
            type="number"
            min="0"
            step="0.01"
            value={formData.quantity || ''}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            placeholder="0"
          />
        </div>

        <div>
          <Label htmlFor="notes">Observações</Label>
          <Textarea
            id="notes"
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Motivo da transação..."
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button onClick={() => onSubmit(formData)}>
            Registrar
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Inventário</h1>
          <p className="text-muted-foreground">Controle de estoque e materiais</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Novo Item</DialogTitle>
            </DialogHeader>
            <InventoryItemForm
              onSubmit={(data) => createMutation.mutate(data)}
              onCancel={() => setIsCreateOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Itens</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{items.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {items.filter((i: InventoryItem) => 
                parseFloat(i.currentStock) <= parseFloat(i.minimumStock) && parseFloat(i.currentStock) > 0
              ).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sem Estoque</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {items.filter((i: InventoryItem) => parseFloat(i.currentStock) === 0).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {items.reduce((total: number, item: InventoryItem) => {
                const stock = parseFloat(item.currentStock || '0');
                const cost = parseFloat(item.unitCost || '0');
                return total + (stock * cost);
              }, 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Itens de Inventário</CardTitle>
            <Input
              placeholder="Buscar itens..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="low">Estoque Baixo</TabsTrigger>
              <TabsTrigger value="out">Sem Estoque</TabsTrigger>
            </TabsList>
            <TabsContent value={activeTab}>
              {isLoading ? (
                <div className="text-center py-8">Carregando...</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Status</TableHead>
                        <TableHead>Código</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Estoque</TableHead>
                        <TableHead>Localização</TableHead>
                        <TableHead>Valor Unit.</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{getStockIcon(item)}</TableCell>
                          <TableCell className="font-mono">{item.partNumber}</TableCell>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.category || '-'}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span>{item.currentStock} {item.unit}</span>
                              {getStockStatus(item)}
                            </div>
                          </TableCell>
                          <TableCell>{item.location || '-'}</TableCell>
                          <TableCell>
                            {item.unitCost ? `R$ ${parseFloat(item.unitCost).toFixed(2)}` : '-'}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedItem(item);
                                  setIsTransactionOpen(true);
                                }}
                              >
                                Transação
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => setEditingItem(item)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => deleteMutation.mutate(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Item</DialogTitle>
          </DialogHeader>
          <InventoryItemForm
            item={editingItem}
            onSubmit={(data) => editingItem && updateMutation.mutate({ id: editingItem.id, data })}
            onCancel={() => setEditingItem(null)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isTransactionOpen} onOpenChange={setIsTransactionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Transação</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <TransactionForm
              item={selectedItem}
              onSubmit={(data) => transactionMutation.mutate(data)}
              onCancel={() => {
                setIsTransactionOpen(false);
                setSelectedItem(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}