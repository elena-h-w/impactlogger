import { ImpactEntry, IMPACT_TAG_CONFIG, ImpactTag } from '@/types/impact';

export type NarrativeType = 'review' | 'promotion' | 'role-change';
export type NarrativeTone = 'results' | 'leadership' | 'technical' | 'balanced';

export const TONE_CONFIG: Record<NarrativeTone, { label: string; description: string }> = {
  results: { label: 'Results-Focused', description: 'Emphasizes metrics, outcomes, and business impact' },
  leadership: { label: 'Leadership-Oriented', description: 'Highlights influence, strategy, and team development' },
  technical: { label: 'Technical Depth', description: 'Showcases expertise, innovation, and problem-solving' },
  balanced: { label: 'Balanced', description: 'Mix of results, leadership, and technical achievements' },
};

// Type-specific action verbs with appropriate tenses
const TYPE_VERBS: Record<NarrativeType, Record<NarrativeTone, string[]>> = {
  review: {
    // REFLECTIVE: Past tense, descriptive - "What WAS done"
    results: ['successfully delivered', 'achieved', 'completed', 'accomplished', 'attained', 'realized', 'fulfilled'],
    leadership: ['contributed to', 'collaborated on', 'supported', 'facilitated', 'coordinated', 'partnered with'],
    technical: ['implemented', 'built', 'developed', 'created', 'designed', 'executed', 'produced'],
    balanced: ['successfully delivered', 'contributed to', 'implemented', 'achieved', 'completed', 'developed'],
  },
  promotion: {
    // ASSERTIVE: Present perfect showing ongoing capability - "What you're CAPABLE of"
    results: ['demonstrated ability to', 'established track record of', 'proven capacity to', 'shown mastery in'],
    leadership: ['already operating as', 'established myself as', 'consistently led', 'taken ownership of', 'driven strategy for'],
    technical: ['demonstrated senior-level', 'independently driven', 'taken technical ownership of', 'established expertise in'],
    balanced: ['demonstrated readiness by', 'proven ability to', 'established pattern of', 'shown capability to'],
  },
  'role-change': {
    // ADAPTIVE: Progressive showing growth - "How you've TRANSFORMED"
    results: ['evolved to deliver', 'expanded capability to', 'grew expertise in', 'developed proficiency in'],
    leadership: ['adapted leadership to', 'expanded influence across', 'evolved from specialist to', 'broadened scope to'],
    technical: ['applied expertise to', 'transferred skills to', 'quickly mastered', 'built new capabilities in'],
    balanced: ['evolved from', 'expanded skillset to', 'adapted approach to', 'applied learning to'],
  },
};

// Type-specific transition phrases
const TYPE_TRANSITIONS: Record<NarrativeType, string[]> = {
  review: [
    'During this period,',
    'Throughout the review cycle,',
    'Over the past period,',
    'This quarter,',
    'Consistently,',
  ],
  promotion: [
    'Demonstrating next-level capability,',
    'Operating beyond current scope,',
    'Taking strategic ownership,',
    'Showing senior-level judgment,',
    'Exhibiting expanded leadership,',
  ],
  'role-change': [
    'Applying transferable expertise,',
    'Drawing on diverse experience,',
    'Leveraging cross-functional skills,',
    'Building on foundational strengths,',
    'Demonstrating learning agility,',
  ],
};

// Opening templates by type
const OPENING_TEMPLATES: Record<NarrativeType, (themes: string, metricsPreview: string, beneficiaries: string) => string> = {
  review: (themes, metricsPreview, beneficiaries) => {
    let opening = `This review period reflects sustained, high-quality contributions across ${themes}. `;
    if (metricsPreview) {
      opening += `Key accomplishments include ${metricsPreview}, demonstrating consistent delivery against objectives. `;
    }
    if (beneficiaries) {
      opening += `Value was delivered to ${beneficiaries}, reinforcing reliability as a trusted contributor.`;
    }
    return opening;
  },
  promotion: (themes, metricsPreview, beneficiaries) => {
    let opening = `I am ready for the next level because I have consistently demonstrated capability beyond my current role across ${themes}. `;
    if (metricsPreview) {
      opening += `Already operating at elevated scope, I have delivered ${metricsPreview} through strategic initiative and independent ownership. `;
    }
    if (beneficiaries) {
      opening += `My influence extends across ${beneficiaries}, reflecting the cross-functional leadership expected at the next level.`;
    }
    return opening;
  },
  'role-change': (themes, metricsPreview, beneficiaries) => {
    let opening = `My professional journey reflects continuous evolution and skill expansion, with demonstrated expertise across ${themes}. `;
    if (metricsPreview) {
      opening += `I have successfully navigated new challenges, achieving ${metricsPreview} while rapidly building new competencies. `;
    }
    if (beneficiaries) {
      opening += `My cross-functional experience with ${beneficiaries} has developed the versatility essential for this transition.`;
    }
    return opening;
  },
};

// Closing templates by type
const CLOSING_TEMPLATES: Record<NarrativeType, (collaborators: string, tone: NarrativeTone) => string> = {
  review: (collaborators, tone) => {
    let closing = '';
    if (collaborators) {
      closing = `Effective partnerships with ${collaborators} enabled consistent delivery throughout the period. `;
    }
    closing += 'This body of work reflects reliable execution and meaningful contribution to team and organizational goals. ';
    closing += 'Looking ahead, I am positioned to build on these foundations while continuing to grow in areas of strategic importance.';
    return closing;
  },
  promotion: (collaborators, tone) => {
    let closing = '';
    if (collaborators) {
      closing = `Strategic relationships with ${collaborators} demonstrate the stakeholder management and influence essential for senior leadership. `;
    }
    closing += 'The pattern of increasing scope, complexity, and independent ownership establishes clear readiness to operate at the next level. ';
    closing += 'I am prepared to take on expanded responsibility and continue driving outsized impact for the organization.';
    return closing;
  },
  'role-change': (collaborators, tone) => {
    let closing = '';
    if (collaborators) {
      closing = `Diverse collaborations with ${collaborators} have built the cross-functional fluency essential for navigating new domains. `;
    }
    closing += 'My trajectory shows consistent ability to learn rapidly, adapt to new contexts, and deliver value in unfamiliar territory. ';
    closing += 'I am enthusiastic about applying this foundation of versatile excellence to new challenges and continued growth.';
    return closing;
  },
};

// Extract metrics and quantifiable outcomes from text
function extractMetrics(text: string): { metrics: string[]; cleanText: string } {
  const metricPatterns = [
    /(\d+(?:\.\d+)?%)/g,                          // percentages
    /(\$[\d,]+(?:\.\d{2})?[KMB]?)/gi,             // currency
    /(\d+(?:\.\d+)?x)/g,                          // multipliers
    /(\d+(?:,\d{3})*)\s*(users?|customers?|teams?|people|hours?|days?|weeks?|months?)/gi, // counts with units
    /(\d+(?:\.\d+)?)\s*(percent|points?)/gi,      // written percentages
  ];
  
  const metrics: string[] = [];
  let cleanText = text;
  
  metricPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      metrics.push(...matches);
    }
  });
  
  return { metrics: [...new Set(metrics)], cleanText };
}

// Extract timeframes from text
function extractTimeframes(text: string): string[] {
  const timePatterns = [
    /within\s+(\d+\s+(?:days?|weeks?|months?))/gi,
    /(\d+\s+(?:days?|weeks?|months?))\s+ahead/gi,
    /in\s+just\s+(\d+\s+(?:days?|weeks?|months?))/gi,
    /(Q[1-4](?:\s+\d{4})?)/gi,
  ];
  
  const timeframes: string[] = [];
  timePatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) timeframes.push(...matches);
  });
  
  return [...new Set(timeframes)];
}

// Group entries by theme based on primary tag
function groupEntriesByTheme(entries: ImpactEntry[]): Map<string, { entries: ImpactEntry[]; label: string }> {
  const themes = new Map<string, { entries: ImpactEntry[]; label: string }>();
  
  entries.forEach(entry => {
    const primaryTag = entry.tags[0] || 'general';
    const label = IMPACT_TAG_CONFIG[primaryTag as ImpactTag]?.label || 
      primaryTag.charAt(0).toUpperCase() + primaryTag.slice(1);
    
    if (!themes.has(primaryTag)) {
      themes.set(primaryTag, { entries: [], label });
    }
    themes.get(primaryTag)!.entries.push(entry);
  });
  
  return themes;
}

// Group entries by beneficiary for cross-functional narrative
function groupByBeneficiary(entries: ImpactEntry[]): Map<string, ImpactEntry[]> {
  const groups = new Map<string, ImpactEntry[]>();
  
  entries.forEach(entry => {
    const beneficiary = entry.whoBenefited?.trim() || 'Organization';
    if (!groups.has(beneficiary)) {
      groups.set(beneficiary, []);
    }
    groups.get(beneficiary)!.push(entry);
  });
  
  return groups;
}

// Get action verb based on type, tone, and index
function getActionVerb(type: NarrativeType, tone: NarrativeTone, index: number): string {
  const verbs = TYPE_VERBS[type][tone];
  return verbs[index % verbs.length];
}

// Get transition phrase based on type and index
function getTransition(type: NarrativeType, index: number): string {
  const transitions = TYPE_TRANSITIONS[type];
  return transitions[index % transitions.length];
}

// Build opening paragraph using type-specific templates
function buildOpeningParagraph(
  entries: ImpactEntry[], 
  themes: Map<string, { entries: ImpactEntry[]; label: string }>,
  tone: NarrativeTone,
  type: NarrativeType
): string {
  const themeLabels = Array.from(themes.values()).map(t => t.label.toLowerCase());
  const themeList = themeLabels.length > 2 
    ? `${themeLabels.slice(0, -1).join(', ')}, and ${themeLabels[themeLabels.length - 1]}`
    : themeLabels.join(' and ');
  
  // Extract all metrics across entries
  const allMetrics: string[] = [];
  entries.forEach(entry => {
    const { metrics } = extractMetrics(entry.problemSolved || '');
    allMetrics.push(...metrics);
    const { metrics: actionMetrics } = extractMetrics(entry.whatYouDid || '');
    allMetrics.push(...actionMetrics);
  });
  
  const metricsPreview = allMetrics.length > 0 ? allMetrics.slice(0, 2).join(' and ') : '';
  
  // Get unique beneficiaries
  const beneficiaries = [...new Set(entries.map(e => e.whoBenefited).filter(Boolean))];
  const beneficiaryList = beneficiaries.length > 2
    ? `${beneficiaries.slice(0, 2).join(', ')}, and others`
    : beneficiaries.join(' and ');
  
  return OPENING_TEMPLATES[type](themeList, metricsPreview, beneficiaryList);
}

// Build body paragraph with type-specific framing
function buildBodyParagraph(
  themeLabel: string, 
  themeEntries: ImpactEntry[], 
  paragraphIndex: number,
  tone: NarrativeTone,
  type: NarrativeType
): string {
  if (themeEntries.length === 0) return '';
  
  const verb = getActionVerb(type, tone, paragraphIndex);
  const transition = getTransition(type, paragraphIndex);
  
  // Extract outcomes and metrics from entries
  const outcomes: { text: string; metrics: string[]; beneficiary: string }[] = [];
  
  themeEntries.slice(0, 3).forEach(entry => {
    const outcome = entry.problemSolved?.trim() || entry.whatYouDid?.trim() || '';
    if (outcome) {
      const { metrics } = extractMetrics(outcome);
      const timeframes = extractTimeframes(outcome);
      outcomes.push({
        text: outcome,
        metrics: [...metrics, ...timeframes],
        beneficiary: entry.whoBenefited?.trim() || '',
      });
    }
  });
  
  if (outcomes.length === 0) return '';
  
  let paragraph = '';
  
  // Type-specific opening framing
  if (type === 'review') {
    // REFLECTIVE: Past tense, what was accomplished
    paragraph = `${transition} ${verb} significant progress in ${themeLabel.toLowerCase()}. `;
  } else if (type === 'promotion') {
    // ASSERTIVE: Demonstrating next-level capability
    paragraph = `${transition} I have ${verb} in ${themeLabel.toLowerCase()}, taking ownership of strategic initiatives. `;
  } else {
    // ADAPTIVE: Showing evolution and transferable skills
    paragraph = `${transition} I ${verb} in ${themeLabel.toLowerCase()}, building versatile expertise. `;
  }
  
  // Weave in specific outcomes with type-appropriate framing
  outcomes.forEach((outcome, idx) => {
    const outcomeText = outcome.text.charAt(0).toLowerCase() + outcome.text.slice(1);
    
    if (idx === 0) {
      if (type === 'review') {
        // Review: Descriptive past tense
        if (outcome.metrics.length > 0) {
          paragraph += `This work resulted in ${outcomeText}, achieving ${outcome.metrics[0]}. `;
        } else {
          paragraph += `This included ${outcomeText}. `;
        }
      } else if (type === 'promotion') {
        // Promotion: Emphasize scope and complexity
        if (outcome.metrics.length > 0) {
          paragraph += `A key example: independently driving ${outcomeText}, delivering ${outcome.metrics[0]} through strategic execution. `;
        } else {
          paragraph += `A concrete example: ${outcomeText}, demonstrating senior-level judgment and initiative. `;
        }
      } else {
        // Role-change: Emphasize learning and adaptation
        if (outcome.metrics.length > 0) {
          paragraph += `When faced with this challenge, I quickly learned and delivered ${outcomeText}, achieving ${outcome.metrics[0]}. `;
        } else {
          paragraph += `I adapted my approach to deliver ${outcomeText}, demonstrating learning agility. `;
        }
      }
    } else {
      // Subsequent outcomes with type-appropriate connectors
      if (type === 'review') {
        paragraph += `Additionally, ${outcomeText}. `;
      } else if (type === 'promotion') {
        paragraph += `Further demonstrating readiness, ${outcomeText}. `;
      } else {
        paragraph += `Building on this foundation, ${outcomeText}. `;
      }
    }
    
    // Add beneficiary context with type-specific framing
    if (outcome.beneficiary && idx === 0) {
      if (type === 'review') {
        paragraph += `This directly benefited ${outcome.beneficiary}. `;
      } else if (type === 'promotion') {
        paragraph += `The scope of impact extended to ${outcome.beneficiary}, reflecting cross-organizational influence. `;
      } else {
        paragraph += `This work with ${outcome.beneficiary} developed transferable skills in stakeholder collaboration. `;
      }
    }
  });
  
  return paragraph.trim();
}

// Build closing paragraph using type-specific templates
function buildClosingParagraph(
  entries: ImpactEntry[], 
  tone: NarrativeTone,
  type: NarrativeType
): string {
  const allBeneficiaries = [...new Set(entries.flatMap(e => e.whoBenefited ? [e.whoBenefited] : []))];
  const collaborators = allBeneficiaries.slice(0, 3).join(', ');
  
  return CLOSING_TEMPLATES[type](collaborators, tone);
}

// Main narrative generation function
export function generateNarrative(
  entries: ImpactEntry[], 
  type: NarrativeType,
  tone: NarrativeTone
): string {
  if (entries.length === 0) {
    return "No impact entries found. Start capturing your wins to generate narratives.";
  }

  const themes = groupEntriesByTheme(entries);
  const sortedThemes = Array.from(themes.entries())
    .sort((a, b) => b[1].entries.length - a[1].entries.length)
    .slice(0, 3);
  
  const opening = buildOpeningParagraph(entries, themes, tone, type);
  
  const bodyParagraphs = sortedThemes
    .map(([, theme], idx) => buildBodyParagraph(theme.label, theme.entries, idx, tone, type))
    .filter(Boolean)
    .join('\n\n');
  
  const closing = buildClosingParagraph(entries, tone, type);

  // Build title based on type
  let title = '';
  if (type === 'review') {
    title = '## Performance Review Summary';
  } else if (type === 'promotion') {
    title = '## Promotion Case';
  } else {
    title = '## Role Transition Narrative';
  }

  return `${title}\n\n${opening}\n\n${bodyParagraphs}\n\n${closing}`;
}
