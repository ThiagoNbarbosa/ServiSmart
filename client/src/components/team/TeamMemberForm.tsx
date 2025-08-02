import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { User } from '@shared/schema';

// Form validation schema
const teamMemberFormSchema = z.object({
  firstName: z.string().min(1, "Nome é obrigatório"),
  lastName: z.string().min(1, "Sobrenome é obrigatório"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  position: z.string().min(1, "Posição é obrigatória"),
  phone: z.string().optional(),
  location: z.string().optional(),
  department: z.string().optional(),
  bio: z.string().optional(),
  profileImageUrl: z.string().url("URL da imagem inválida").optional().or(z.literal("")),
  userLevel: z.enum(["CONTRACT_MANAGER", "REPORT_ELABORATOR", "SUPERVISOR", "ADMIN", "TECHNICIAN"]).default("TECHNICIAN")
});

type TeamMemberFormData = z.infer<typeof teamMemberFormSchema>;

interface TeamMemberFormProps {
  isOpen: boolean;
  onClose: () => void;
  member?: User | null;
  mode: 'create' | 'edit';
}

export function TeamMemberForm({ isOpen, onClose, member, mode }: TeamMemberFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<TeamMemberFormData>({
    resolver: zodResolver(teamMemberFormSchema),
    defaultValues: {
      firstName: member?.firstName || "",
      lastName: member?.lastName || "",
      email: member?.email || "",
      position: member?.position || "",
      phone: member?.phone || "",
      location: member?.location || "",
      department: member?.department || "",
      bio: member?.bio || "",
      profileImageUrl: member?.profileImageUrl || "",
      userLevel: (member?.userLevel as any) || "TECHNICIAN",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: TeamMemberFormData) => {
      const response = await fetch('/api/team/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create team member');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Membro da equipe criado com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/team/members'] });
      onClose();
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar membro da equipe",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: TeamMemberFormData) => {
      const response = await fetch(`/api/team/members/${member?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update team member');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Membro da equipe atualizado com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/team/members'] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar membro da equipe",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TeamMemberFormData) => {
    // Clean empty strings to undefined for optional fields
    const cleanData = {
      ...data,
      email: data.email || undefined,
      phone: data.phone || undefined,
      location: data.location || undefined,
      department: data.department || undefined,
      bio: data.bio || undefined,
      profileImageUrl: data.profileImageUrl || undefined,
    };

    if (mode === 'create') {
      createMutation.mutate(cleanData);
    } else {
      updateMutation.mutate(cleanData);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Adicionar Membro da Equipe' : 'Editar Membro da Equipe'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Preencha as informações do novo membro da equipe.' 
              : 'Atualize as informações do membro da equipe.'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sobrenome *</FormLabel>
                    <FormControl>
                      <Input placeholder="Sobrenome" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="email@exemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Posição *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Engenheiro de Software" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="(11) 99999-9999" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="userLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nível de Acesso</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o nível" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="TECHNICIAN">Técnico</SelectItem>
                        <SelectItem value="SUPERVISOR">Supervisor</SelectItem>
                        <SelectItem value="REPORT_ELABORATOR">Elaborador de Relatório</SelectItem>
                        <SelectItem value="CONTRACT_MANAGER">Gerente de Contrato</SelectItem>
                        <SelectItem value="ADMIN">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Localização</FormLabel>
                    <FormControl>
                      <Input placeholder="São Paulo, SP" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Departamento</FormLabel>
                    <FormControl>
                      <Input placeholder="Engenharia" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="profileImageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL da Foto de Perfil</FormLabel>
                  <FormControl>
                    <Input placeholder="https://exemplo.com/foto.jpg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Biografia</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Breve descrição sobre o membro da equipe..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Salvando...' : mode === 'create' ? 'Criar' : 'Atualizar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}