export type ImpactTag = 
  | 'revenue'
  | 'risk-reduction'
  | 'speed'
  | 'efficiency'
  | 'quality'
  | 'alignment'
  | 'leadership'
  | 'visibility'
  | 'engagement';

// Custom tags are stored as strings but not in this union type
export type AnyTag = ImpactTag | string;

export interface ImpactEntry {
  id: string;
  createdAt: Date;
  weekOf: Date;
  whatYouDid: string;
  whoBenefited: string;
  problemSolved: string;
  evidence: string;
  tags: AnyTag[];
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
  'visibility': { label: 'Visibility', color: 'bg-pink-500/10 text-pink-600 border-pink-500/20' },
  'engagement': { label: 'Engagement', color: 'bg-teal-500/10 text-teal-600 border-teal-500/20' },
};

// Default color for custom tags
export const CUSTOM_TAG_COLOR = 'bg-gray-500/10 text-gray-600 border-gray-500/20';

export function getTagConfig(tag: AnyTag): { label: string; color: string } {
  if (tag in IMPACT_TAG_CONFIG) {
    return IMPACT_TAG_CONFIG[tag as ImpactTag];
  }
  // Custom tag - capitalize first letter
  return {
    label: tag.charAt(0).toUpperCase() + tag.slice(1),
    color: CUSTOM_TAG_COLOR,
  };
}
