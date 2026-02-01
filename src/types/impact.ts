export type ImpactTag = 
  | 'revenue'
  | 'risk-reduction'
  | 'speed'
  | 'efficiency'
  | 'quality'
  | 'alignment'
  | 'leadership';

export interface ImpactEntry {
  id: string;
  createdAt: Date;
  weekOf: Date;
  whatYouDid: string;
  whoBenefited: string;
  problemSolved: string;
  evidence: string;
  tags: ImpactTag[];
}

export interface Stakeholder {
  id: string;
  name: string;
  team: string;
  whatTheyCareAbout: string;
  howYouImpacted: string;
}

export const IMPACT_TAG_CONFIG: Record<ImpactTag, { label: string; color: string }> = {
  'revenue': { label: 'Revenue', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  'risk-reduction': { label: 'Risk Reduction', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
  'speed': { label: 'Speed', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
  'efficiency': { label: 'Efficiency', color: 'bg-violet-500/10 text-violet-600 border-violet-500/20' },
  'quality': { label: 'Quality', color: 'bg-rose-500/10 text-rose-600 border-rose-500/20' },
  'alignment': { label: 'Alignment', color: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20' },
  'leadership': { label: 'Leadership', color: 'bg-orange-500/10 text-orange-600 border-orange-500/20' },
};
