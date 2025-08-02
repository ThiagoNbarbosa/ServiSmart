import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { User } from '@shared/schema';

interface DeleteMemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  member: User | null;
}

export function DeleteMemberDialog({ isOpen, onClose, member }: DeleteMemberDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const response = await fetch(`/api/team/members/${memberId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete team member');
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Membro da equipe removido com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/team/members'] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao remover membro da equipe",
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    if (member?.id) {
      deleteMutation.mutate(member.id);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja remover <strong>{member?.firstName} {member?.lastName}</strong> da equipe?
            <br />
            <br />
            Esta ação não pode ser desfeita. O membro será desativado e não aparecerá mais na lista da equipe.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {deleteMutation.isPending ? 'Removendo...' : 'Confirmar Exclusão'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}