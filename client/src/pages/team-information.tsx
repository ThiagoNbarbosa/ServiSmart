import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  MoreVertical, 
  Edit, 
  Eye, 
  Trash2, 
  MessageCircle, 
  Phone, 
  ArrowLeft,
  Users
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "wouter";
import type { User, TeamTask } from "@shared/schema";

/**
 * Team Information Page Component
 * 
 * Displays team member cards in a responsive grid layout
 * Features: Member profiles, task progress, contact options, and admin controls
 */
export default function TeamInformation() {
  const { user } = useAuth();
  const [selectedMember, setSelectedMember] = useState<User | null>(null);

  // Fetch team members (users with showInTeam = true)
  const { data: teamMembers, isLoading } = useQuery({
    queryKey: ['/api/team/members'],
  });

  // Fetch team tasks for progress display
  const { data: teamTasks } = useQuery({
    queryKey: ['/api/team/tasks'],
  });

  /**
   * Get team task for specific user
   */
  const getUserTask = (userId: string): TeamTask | undefined => {
    return teamTasks?.find((task: TeamTask) => task.userId === userId);
  };

  /**
   * Get team members working on same task
   */
  const getTaskTeamMembers = (task: TeamTask): User[] => {
    if (!task.teamMembers || !teamMembers) return [];
    const memberIds = Array.isArray(task.teamMembers) ? task.teamMembers : [];
    return teamMembers.filter((member: User) => memberIds.includes(member.id));
  };

  /**
   * Handle member card actions
   */
  const handleMemberAction = (action: string, member: User) => {
    switch (action) {
      case 'edit':
        console.log('Edit member:', member.id);
        break;
      case 'details':
        setSelectedMember(member);
        break;
      case 'delete':
        console.log('Delete member:', member.id);
        break;
    }
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

  // Sample data structure for demonstration (will be replaced with real data)
  const sampleMembers = teamMembers && teamMembers.length > 0 ? teamMembers : [
    {
      id: "1",
      firstName: "Alfie",
      lastName: "Harrison", 
      position: "Strategy Director",
      location: "Sydney, Australia",
      profileImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80",
      userLevel: "ADMIN"
    },
    {
      id: "2", 
      firstName: "Zara",
      lastName: "Walsh",
      position: "Product Strategist", 
      location: "Sydney, Australia",
      profileImageUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b3e8?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80",
      userLevel: "SUPER"
    },
    {
      id: "3",
      firstName: "Jack", 
      lastName: "Fisher",
      position: "Product Manager",
      location: "Melbourne, Australia", 
      profileImageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80",
      userLevel: "USER"
    },
    {
      id: "4",
      firstName: "Hannah",
      lastName: "Perry", 
      position: "UX Director",
      location: "Brisbane, Australia",
      profileImageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80", 
      userLevel: "ADMIN"
    },
    {
      id: "5",
      firstName: "Blake",
      lastName: "Morris",
      position: "Head of Digital Designer", 
      location: "Hobart, Australia",
      profileImageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80",
      userLevel: "USER"
    },
    {
      id: "6", 
      firstName: "Alisha",
      lastName: "Bates",
      position: "Head of Motion Design",
      location: "Brisbane, Australia",
      profileImageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80",
      userLevel: "USER"
    },
    {
      id: "7",
      firstName: "Victoria", 
      lastName: "Wilson",
      position: "Head of Creative Developer",
      location: "Sydney, Australia",
      profileImageUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80",
      userLevel: "SUPER"  
    },
    {
      id: "8",
      firstName: "Luke",
      lastName: "Elliott", 
      position: "Head of Visual Designer",
      location: "Perth, Australia",
      profileImageUrl: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80",
      userLevel: "USER"
    }
  ];

  const progressColors = [
    "#F59E0B", // Orange/Yellow
    "#3B82F6", // Blue  
    "#10B981", // Green
    "#8B5CF6", // Purple
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Voltar ao Dashboard
                </Button>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-2xl font-bold text-gray-900">Informação de Equipe</h1>
            </div>
            
            {hasDevAccess && (
              <div className="flex items-center space-x-2">
                <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded-full font-medium">
                  DEV MODE
                </span>
                <Button variant="outline" size="sm">
                  <Users className="h-4 w-4 mr-1" />
                  Gerenciar Equipe
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Team Cards Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {sampleMembers.map((member: any, index: number) => {
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

      {/* Member Details Modal/Overlay - placeholder for future implementation */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">
              {selectedMember.firstName} {selectedMember.lastName}
            </h3>
            <p className="text-gray-600 mb-4">
              Detalhes do membro serão implementados com dados reais do banco de dados.
            </p>
            <Button onClick={() => setSelectedMember(null)}>
              Fechar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}