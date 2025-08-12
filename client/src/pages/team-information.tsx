import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MoreVertical, 
  Edit, 
  Eye, 
  Trash2, 
  MessageCircle, 
  Phone, 
  ArrowLeft,
  Users,
  Plus,
  Filter
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "wouter";
import type { User, TeamTask } from "@shared/schema";
import { TeamMemberForm } from "@/components/team/TeamMemberForm";
import { DeleteMemberDialog } from "@/components/team/DeleteMemberDialog";
import { MemberDetailsModal } from "@/components/team/MemberDetailsModal";

// Member type configuration
const tipoConfig = {
  TECHNICIAN: { icon: '🔧', color: 'blue', label: 'Técnico', bg: 'bg-blue-50' },
  AUXILIAR: { icon: '💻', color: 'green', label: 'Auxiliar', bg: 'bg-green-50' },
  ELABORADOR: { icon: '📝', color: 'purple', label: 'Elaborador', bg: 'bg-purple-50' },
  CAMPO: { icon: '🏗️', color: 'orange', label: 'Campo', bg: 'bg-orange-50' }
};

/**
 * Team Information Page Component
 * 
 * Displays team member cards in a responsive grid layout
 * Features: Member profiles, task progress, contact options, and admin controls
 */
export default function TeamInformation() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedMember, setSelectedMember] = useState<User | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState<User | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<User | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [filtroTipo, setFiltroTipo] = useState<string>('TODOS');

  // Fetch team members with filtering
  const { data: teamMembers = [], isLoading, error: membersError } = useQuery<User[]>({
    queryKey: ['/api/team/members', { tipo: filtroTipo }],
    queryFn: async () => {
      const response = await fetch(`/api/team/members?tipo=${filtroTipo}`);
      if (!response.ok) throw new Error('Failed to fetch team members');
      return response.json();
    }
  });

  // Fetch team statistics
  const { data: stats = {}, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/team/members/stats'],
    queryFn: async () => {
      const response = await fetch('/api/team/members/stats');
      if (!response.ok) throw new Error('Failed to fetch team stats');
      return response.json();
    }
  });

  // Fetch team tasks for progress display
  const { data: teamTasks = [], isLoading: tasksLoading } = useQuery<TeamTask[]>({
    queryKey: ['/api/team/tasks'],
  });

  // Show error toast if there's an error fetching members
  useEffect(() => {
    if (membersError) {
      toast({
        title: "Erro ao carregar membros",
        description: "Não foi possível carregar os membros da equipe. Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  }, [membersError, toast]);

  /**
   * Get team task for specific user
   */
  const getUserTask = (userId: string): TeamTask | undefined => {
    return teamTasks.find((task: TeamTask) => task.userId === userId);
  };

  /**
   * Get team members working on same task
   */
  const getTaskTeamMembers = (task: TeamTask): User[] => {
    if (!task.teamMembers) return [];
    const memberIds = Array.isArray(task.teamMembers) ? task.teamMembers : [];
    return teamMembers.filter((member: User) => memberIds.includes(member.id));
  };

  /**
   * Handle member card actions
   */
  const handleMemberAction = (action: string, member: User) => {
    switch (action) {
      case 'edit':
        setMemberToEdit(member);
        setFormMode('edit');
        setIsFormOpen(true);
        break;
      case 'details':
        setSelectedMember(member);
        break;
      case 'delete':
        setMemberToDelete(member);
        setIsDeleteDialogOpen(true);
        break;
    }
  };

  /**
   * Handle adding new member
   */
  const handleAddMember = () => {
    setMemberToEdit(null);
    setFormMode('create');
    setIsFormOpen(true);
  };

  /**
   * Handle closing modals
   */
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setMemberToEdit(null);
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setMemberToDelete(null);
  };

  /**
   * Check if current user has DEV access
   */
  const hasDevAccess = user?.userLevel === 'DEV' || user?.isDev;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-48 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="h-32 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (membersError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl p-8 shadow-sm text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Erro ao carregar membros</h2>
            <p className="text-gray-600 mb-6">
              Não foi possível carregar os membros da equipe. Por favor, tente novamente.
            </p>
            <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700">
              Tentar Novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Use real team members data from API
  const membersToDisplay = teamMembers || [];

  const progressColors = [
    "#F59E0B", // Orange/Yellow
    "#3B82F6", // Blue  
    "#10B981", // Green
    "#8B5CF6", // Purple
  ];

  return (
    <>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Informações da Equipe</h1>
            <p className="text-muted-foreground">
              Gerencie membros da equipe e visualize suas atividades
            </p>
            
            {/* Statistics Display */}
            <div className="flex gap-3 mt-4">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                🔧 {stats.tecnicos || 0} Técnicos
              </Badge>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                💻 {stats.auxiliares || 0} Auxiliares
              </Badge>
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                📝 {stats.elaboradores || 0} Elaboradores
              </Badge>
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                🏗️ {stats.campo || 0} Campo
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user?.isDev && (
              <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded-full font-medium">
                DEV MODE
              </span>
            )}
            <Button onClick={handleAddMember} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Membro
            </Button>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 flex-wrap">
          {['TODOS', 'TECHNICIAN', 'AUXILIAR', 'ELABORADOR', 'CAMPO'].map(tipo => (
            <Button
              key={tipo}
              variant={filtroTipo === tipo ? 'default' : 'outline'}
              onClick={() => setFiltroTipo(tipo)}
              size="sm"
              className={filtroTipo === tipo ? 'bg-blue-600' : ''}
            >
              {tipo === 'TODOS' ? 'Todos' : (tipoConfig[tipo as keyof typeof tipoConfig]?.label || tipo)}
            </Button>
          ))}
        </div>

        {/* Team Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {membersToDisplay.map((member: any, index: number) => {
              const task = getUserTask(member.id);
              const taskTeamMembers = task ? getTaskTeamMembers(task) : [];
              const progressColor = progressColors[index % progressColors.length];
              const progress = task?.progress || Math.floor(Math.random() * 100);

              return (
                <Card 
                  key={member.id} 
                  className="group hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:-translate-y-1"
                  onClick={() => handleMemberAction('details', member)}
                >
                  <CardContent className="p-6">
                    {/* Header with Avatar and Menu */}
                    <div className="flex items-start justify-between mb-4">
                      <img
                        src={member.profileImageUrl}
                        alt={`${member.firstName} ${member.lastName}`}
                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                      />
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleMemberAction('edit', member)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleMemberAction('details', member)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Detalhes
                        </DropdownMenuItem>
                        {hasDevAccess && (
                          <DropdownMenuItem 
                            onClick={() => handleMemberAction('delete', member)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Member Info */}
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {member.firstName} {member.lastName}
                    </h3>
                    <p className="text-sm text-gray-500 mb-1">{member.location}</p>
                    
                    {/* Contact Icons */}
                    <div className="flex items-center space-x-2 mt-2">
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-blue-600">
                        <MessageCircle className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-green-600">
                        <Phone className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Position */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">POSIÇÃO</p>
                    <p className="font-medium text-gray-900">{member.position}</p>
                  </div>

                  {/* Task Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">TASK</p>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-xs text-blue-600 hover:text-blue-800 p-0 h-auto"
                      >
                        Explore Team
                      </Button>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${progress}%`,
                          backgroundColor: progressColor
                        }}
                      ></div>
                    </div>
                    
                    {/* Team Members Avatars */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex -space-x-1">
                        {taskTeamMembers.length > 0 ? (
                          taskTeamMembers.slice(0, 3).map((teamMember: User, idx: number) => (
                            <img
                              key={teamMember.id}
                              src={teamMember.profileImageUrl || `https://images.unsplash.com/photo-150000000${idx}?ixlib=rb-4.0.3&auto=format&fit=crop&w=24&h=24`}
                              alt={`${teamMember.firstName} ${teamMember.lastName}`}
                              className="w-6 h-6 rounded-full border-2 border-white object-cover"
                            />
                          ))
                        ) : (
                          // Sample team avatars
                          <>
                            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=24&h=24" alt="Team member" className="w-6 h-6 rounded-full border-2 border-white object-cover" />
                            <img src="https://images.unsplash.com/photo-1494790108755-2616b612b3e8?ixlib=rb-4.0.3&auto=format&fit=crop&w=24&h=24" alt="Team member" className="w-6 h-6 rounded-full border-2 border-white object-cover" />
                            {taskTeamMembers.length > 2 && (
                              <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs text-gray-600">
                                +{taskTeamMembers.length - 2}
                              </div>
                            )}
                          </>
                        )}
                        {taskTeamMembers.length === 0 && (
                          <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs text-gray-600">
                            2+
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <MemberDetailsModal
        isOpen={!!selectedMember}
        onClose={() => setSelectedMember(null)}
        member={selectedMember}
      />

      <TeamMemberForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        member={memberToEdit}
        mode={formMode}
      />

      <DeleteMemberDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        member={memberToDelete}
      />
    </>
  );
}