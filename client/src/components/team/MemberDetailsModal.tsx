import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  X, 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  Briefcase,
  User,
  Calendar,
  Shield
} from 'lucide-react';
import { User as UserType } from '@shared/schema';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MemberDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: UserType | null;
}

const userLevelMap: Record<string, { label: string; color: string }> = {
  DEV: { label: 'Desenvolvedor', color: 'bg-purple-500' },
  CONTRACT_MANAGER: { label: 'Gestor de Contrato', color: 'bg-blue-500' },
  REPORT_ELABORATOR: { label: 'Elaborador de Relatório', color: 'bg-green-500' },
  SUPERVISOR: { label: 'Supervisor', color: 'bg-orange-500' },
  ADMIN: { label: 'Administrador', color: 'bg-red-500' },
  TECHNICIAN: { label: 'Técnico', color: 'bg-gray-500' },
};

export function MemberDetailsModal({ isOpen, onClose, member }: MemberDetailsModalProps) {
  if (!member) return null;

  const initials = `${member.firstName?.charAt(0) || ''}${member.lastName?.charAt(0) || ''}`.toUpperCase();
  const userLevel = userLevelMap[member.userLevel] || userLevelMap.TECHNICIAN;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Detalhes do Membro</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Header */}
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={member.profileImageUrl || undefined} />
              <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-2">
              <h2 className="text-2xl font-bold">
                {member.firstName} {member.lastName}
              </h2>
              <p className="text-gray-600">{member.position || 'Sem cargo definido'}</p>
              <Badge className={`${userLevel.color} text-white`}>
                {userLevel.label}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações de Contato
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {member.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{member.email}</p>
                  </div>
                </div>
              )}
              
              {member.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Telefone</p>
                    <p className="font-medium">{member.phone}</p>
                  </div>
                </div>
              )}
              
              {member.location && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Localização</p>
                    <p className="font-medium">{member.location}</p>
                  </div>
                </div>
              )}
              
              {member.department && (
                <div className="flex items-center gap-3">
                  <Building2 className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Departamento</p>
                    <p className="font-medium">{member.department}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {member.bio && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Biografia
                </h3>
                <p className="text-gray-600 whitespace-pre-wrap">{member.bio}</p>
              </div>
            </>
          )}

          <Separator />

          {/* System Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Informações do Sistema
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Status</p>
                <p className="font-medium">
                  {member.isActive ? (
                    <span className="text-green-600">Ativo</span>
                  ) : (
                    <span className="text-red-600">Inativo</span>
                  )}
                </p>
              </div>
              
              <div>
                <p className="text-gray-500">Visível na Equipe</p>
                <p className="font-medium">
                  {member.showInTeam ? 'Sim' : 'Não'}
                </p>
              </div>
              
              {member.createdAt && (
                <div>
                  <p className="text-gray-500">Criado em</p>
                  <p className="font-medium">
                    {format(new Date(member.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                </div>
              )}
              
              {member.updatedAt && (
                <div>
                  <p className="text-gray-500">Última atualização</p>
                  <p className="font-medium">
                    {format(new Date(member.updatedAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button onClick={onClose} variant="outline">
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}