import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Stakeholder } from '@/types/impact';
import { toast } from 'sonner';

interface DbStakeholder {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  name: string;
  team: string;
  what_they_care_about: string;
  how_you_impacted: string;
}

function mapDbToStakeholder(db: DbStakeholder): Stakeholder {
  return {
    id: db.id,
    name: db.name,
    team: db.team,
    whatTheyCareAbout: db.what_they_care_about,
    howYouImpacted: db.how_you_impacted,
  };
}

export function useStakeholders() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: stakeholders = [], isLoading, error } = useQuery({
    queryKey: ['stakeholders', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('stakeholders')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      return (data as DbStakeholder[]).map(mapDbToStakeholder);
    },
    enabled: !!user,
  });

  const addStakeholder = useMutation({
    mutationFn: async (stakeholder: Omit<Stakeholder, 'id'>) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('stakeholders')
        .insert({
          user_id: user.id,
          name: stakeholder.name,
          team: stakeholder.team,
          what_they_care_about: stakeholder.whatTheyCareAbout,
          how_you_impacted: stakeholder.howYouImpacted,
        })
        .select()
        .single();
      
      if (error) throw error;
      return mapDbToStakeholder(data as DbStakeholder);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stakeholders'] });
      toast.success('Stakeholder added!');
    },
    onError: (error) => {
      toast.error('Failed to add stakeholder: ' + error.message);
    },
  });

  const updateStakeholder = useMutation({
    mutationFn: async (stakeholder: Stakeholder) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('stakeholders')
        .update({
          name: stakeholder.name,
          team: stakeholder.team,
          what_they_care_about: stakeholder.whatTheyCareAbout,
          how_you_impacted: stakeholder.howYouImpacted,
        })
        .eq('id', stakeholder.id)
        .select()
        .single();
      
      if (error) throw error;
      return mapDbToStakeholder(data as DbStakeholder);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stakeholders'] });
      toast.success('Stakeholder updated!');
    },
    onError: (error) => {
      toast.error('Failed to update: ' + error.message);
    },
  });

  const deleteStakeholder = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('stakeholders')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stakeholders'] });
      toast.success('Stakeholder removed');
    },
    onError: (error) => {
      toast.error('Failed to delete: ' + error.message);
    },
  });

  return {
    stakeholders,
    isLoading,
    error,
    addStakeholder: addStakeholder.mutateAsync,
    updateStakeholder: updateStakeholder.mutateAsync,
    deleteStakeholder: deleteStakeholder.mutateAsync,
    isAdding: addStakeholder.isPending,
    isUpdating: updateStakeholder.isPending,
  };
}
