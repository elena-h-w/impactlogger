import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useCustomTags() {
  const [customTags, setCustomTags] = useState<string[]>([]);

  const fetchCustomTags = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('custom_tags')
      .select('name')
      .order('name');

    setCustomTags(data?.map(t => t.name) || []);
  };

  const addCustomTag = async (tagName: string) => {
    const trimmed = tagName.trim().toLowerCase();
    if (!trimmed || customTags.includes(trimmed)) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('custom_tags')
      .upsert(
        { user_id: user.id, name: trimmed },
        { onConflict: 'user_id,name' }
      );

    if (!error) {
      setCustomTags(prev => [...new Set([...prev, trimmed])].sort());
    }
  };

  useEffect(() => {
    fetchCustomTags();
  }, []);

  return { customTags, addCustomTag };
}