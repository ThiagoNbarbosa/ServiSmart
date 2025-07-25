import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Users, Shield, FileText, Eye, Settings } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

const USER_LEVELS = [
  { value: 'DEV', label: 'Desenvolvedor', icon: '💻', color: 'bg-purple-100 text-purple-800' },
  { value: 'ADMIN', label: 'Administrador', icon: '👑', color: 'bg-red-100 text-red-800' },
  { value: 'SUPERVISOR', label: 'Supervisor', icon: '👨‍💼', color: 'bg-blue-100 text-blue-800' },
  { value: 'CONTRACT_MANAGER', label: 'Gestor de Contratos', icon: '📋', color: 'bg-green-100 text-green-800' },
  { value: 'REPORT_ELABORATOR', label: 'Elaborador de Relatórios', icon: '📊', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'TECHNICIAN', label: 'Técnico', icon: '🔧', color: 'bg-gray-100 text-gray-800' }
];

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userLevel: string;
  position?: string;
  department?: string;
  phone?: string;
  active: boolean;
  createdAt: string;
}

export default function UserManagement() {
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    email: '',
    firstName: '',
    lastName: '',
    userLevel: 'TECHNICIAN',
    position: '',
    department: '',
    phone: ''
  });
  const [isCreating, setIsCreating] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch users by level
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['/api/users', selectedLevel],
    enabled: !!selectedLevel
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      return await apiRequest(`/api/users`, {
        method: 'POST',
        body: JSON.stringify(userData)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setIsCreating(false);
      setNewUser({
        email: '',
        firstName: '',
        lastName: '',
        userLevel: 'TECHNICIAN',
        position: '',
        department: '',
        phone: ''
      });
      toast({
        title: "Usuário criado",
        description: "Usuário criado com sucesso",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Falha ao criar usuário",
        variant: "destructive",
      });
    }
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, userData }: { id: string, userData: any }) => {
      return await apiRequest(`/api/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(userData)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setEditingUser(null);
      toast({
        title: "Usuário atualizado",
        description: "Usuário atualizado com sucesso",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Falha ao atualizar usuário",
        variant: "destructive",
      });
    }
  });

  const handleCreateUser = () => {
    if (!newUser.email || !newUser.firstName || !newUser.lastName) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha email, nome e sobrenome",
        variant: "destructive",
      });
      return;
    }
    createUserMutation.mutate(newUser);
  };

  const handleUpdateUser = () => {
    if (!editingUser) return;
    updateUserMutation.mutate({
      id: editingUser.id,
      userData: editingUser
    });
  };

  const getLevelInfo = (level: string) => {
    return USER_LEVELS.find(l => l.value === level) || USER_LEVELS[USER_LEVELS.length - 1];
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gerenciamento de Usuários</h1>
          <p className="text-muted-foreground">
            Gerencie todos os níveis de usuários do sistema MAFFENG
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo Usuário
        </Button>
      </div>

      {/* User Level Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Filtrar por Nível de Usuário
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {USER_LEVELS.map((level) => (
              <Button
                key={level.value}
                variant={selectedLevel === level.value ? "default" : "outline"}
                onClick={() => setSelectedLevel(level.value)}
                className="flex flex-col items-center gap-2 h-auto py-4"
              >
                <span className="text-2xl">{level.icon}</span>
                <span className="text-xs text-center">{level.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create User Form */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Criar Novo Usuário</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Nome</Label>
                <Input
                  id="firstName"
                  value={newUser.firstName}
                  onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="lastName">Sobrenome</Label>
                <Input
                  id="lastName"
                  value={newUser.lastName}
                  onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="userLevel">Nível de Usuário</Label>
                <Select value={newUser.userLevel} onValueChange={(value) => setNewUser({ ...newUser, userLevel: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {USER_LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.icon} {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="position">Cargo</Label>
                <Input
                  id="position"
                  value={newUser.position}
                  onChange={(e) => setNewUser({ ...newUser, position: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="department">Departamento</Label>
                <Input
                  id="department"
                  value={newUser.department}
                  onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateUser} disabled={createUserMutation.isPending}>
                {createUserMutation.isPending ? "Criando..." : "Criar Usuário"}
              </Button>
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users List */}
      {selectedLevel && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">{getLevelInfo(selectedLevel).icon}</span>
              {getLevelInfo(selectedLevel).label}s
              <Badge variant="secondary">{users.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Carregando usuários...</div>
            ) : users.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum usuário encontrado para este nível
              </div>
            ) : (
              <div className="grid gap-4">
                {users.map((user: User) => {
                  const levelInfo = getLevelInfo(user.userLevel);
                  return (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="text-2xl">{levelInfo.icon}</div>
                        <div>
                          <div className="font-medium">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                          {user.position && (
                            <div className="text-xs text-muted-foreground">{user.position}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={levelInfo.color}>
                          {levelInfo.label}
                        </Badge>
                        <Badge variant={user.active ? "default" : "secondary"}>
                          {user.active ? "Ativo" : "Inativo"}
                        </Badge>
                        <Button size="sm" variant="outline" onClick={() => setEditingUser(user)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Edit User Modal would go here */}
    </div>
  );
}