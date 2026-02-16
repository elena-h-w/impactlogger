import { ImpactEntry } from '@/types/impact';
import { supabase } from '@/integrations/supabase/client';

export type NarrativeType = 'review' | 'promotion' | 'role-change';
export type NarrativeTone = 'results' | 'leadership' | 'technical' | 'balanced';

export const TONE_CONFIG: Record<NarrativeTone, { label: string; description: string }> = {
  results: {
    label: 'Results-Focused',
    description: 'Emphasizes metrics, outcomes, and business impact'
  },
  leadership: {
    label: 'Leadership-Oriented',
    description: 'Highlights influence, strategy, and team development'
  },
  technical: {
    label: 'Technical Depth',
    description: 'Showcases expertise, innovation, and problem-solving'
  },
  balanced: {
    label: 'Balanced',
    description: 'Mix of results, leadership, and technical achievements'
  },
};

const API_URL = import.meta.env.PROD 
  ? '/api/generate-narrative'
  : 'http://localhost:3000/api/generate-narrative';

export async function generateNarrative(
  analyzedEntries: ImpactEntry[],
  type: NarrativeType,
  tone: NarrativeTone
): Promise<string> {
  try {
    // Get the current user's session token
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error('You must be logged in to generate narratives.');
    }

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        impacts: analyzedEntries,
        type: type,
        tone: tone
      })
    });

    if (response.status === 429) {
      throw new Error('Daily limit reached (5 per day). Try again tomorrow!');
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate narrative');
    }

    const data = await response.json();
    return data.narrative;

  } catch (error: any) {
    console.error('Error generating narrative:', error);
    throw new Error(error.message || 'Failed to generate narrative. Please try again.');
  }
}

export async function generateReviewNarrative(
  analyzedEntries: ImpactEntry[],
  tone: NarrativeTone
): Promise<string> {
  return generateNarrative(analyzedEntries, 'review', tone);
}

export async function generatePromotionNarrative(
  analyzedEntries: ImpactEntry[],
  tone: NarrativeTone
): Promise<string> {
  return generateNarrative(analyzedEntries, 'promotion', tone);
}

export async function generateRoleChangeNarrative(
  analyzedEntries: ImpactEntry[],
  tone: NarrativeTone
): Promise<string> {
  return generateNarrative(analyzedEntries, 'role-change', tone);
}