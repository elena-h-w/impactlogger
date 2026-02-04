import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ImpactEntry, ImpactTag } from '@/types/impact';
import { toast } from 'sonner';

interface DbImpactEntry {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  week_of: string;
  what_you_did: string;
  who_benefited: string;
  problem_solved: string;
  evidence: string;
  tags: string[];
}

function mapDbToEntry(db: DbImpactEntry): ImpactEntry {
  return {
    id: db.id,
    createdAt: new Date(db.created_at),
    weekOf: new Date(db.week_of),
    whatYouDid: db.what_you_did,
    whoBenefited: db.who_benefited,
    problemSolved: db.problem_solved,
    evidence: db.evidence,
    tags: db.tags as ImpactTag[],
  };
}

export function useImpactEntries() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: entries = [], isLoading, error } = useQuery({
    queryKey: ['impact-entries', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('impact_entries')
        .select('*')
        .order('week_of', { ascending: false });
      
      if (error) throw error;
      return (data as DbImpactEntry[]).map(mapDbToEntry);
    },
    enabled: !!user,
  });

  const addEntry = useMutation({
    mutationFn: async (entry: Omit<ImpactEntry, 'id' | 'createdAt'>) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('impact_entries')
        .insert({
          user_id: user.id,
          week_of: entry.weekOf.toISOString().split('T')[0],
          what_you_did: entry.whatYouDid,
          who_benefited: entry.whoBenefited,
          problem_solved: entry.problemSolved,
          evidence: entry.evidence,
          tags: entry.tags,
        })
        .select()
        .single();
      
      if (error) throw error;
      return mapDbToEntry(data as DbImpactEntry);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['impact-entries'] });
      toast.success('Impact entry saved!');
    },
    onError: (error) => {
      toast.error('Failed to save entry: ' + error.message);
    },
  });

  const deleteEntry = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('impact_entries')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['impact-entries'] });
      toast.success('Entry deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete: ' + error.message);
    },
  });

  const updateEntry = useMutation({
    mutationFn: async ({ id, ...entry }: Omit<ImpactEntry, 'createdAt'>) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('impact_entries')
        .update({
          week_of: entry.weekOf.toISOString().split('T')[0],
          what_you_did: entry.whatYouDid,
          who_benefited: entry.whoBenefited,
          problem_solved: entry.problemSolved,
          evidence: entry.evidence,
          tags: entry.tags,
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return mapDbToEntry(data as DbImpactEntry);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['impact-entries'] });
      toast.success('Entry updated!');
    },
    onError: (error) => {
      toast.error('Failed to update: ' + error.message);
    },
  });

  return {
    entries,
    isLoading,
    error,
    addEntry: addEntry.mutateAsync,
    deleteEntry: deleteEntry.mutateAsync,
    updateEntry: updateEntry.mutateAsync,
    isAdding: addEntry.isPending,
    isUpdating: updateEntry.isPending,
  };
}
