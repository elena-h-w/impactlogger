import { ImpactEntry, IMPACT_TAG_CONFIG, ImpactTag } from '@/types/impact';

export type NarrativeType = 'review' | 'promotion' | 'role-change';
export type NarrativeTone = 'results' | 'leadership' | 'technical' | 'balanced';

export const TONE_CONFIG: Record<NarrativeTone, { label: string; description: string }> = {
  results: { label: 'Results-Focused', description: 'Emphasizes metrics, outcomes, and business impact' },
  leadership: { label: 'Leadership-Oriented', description: 'Highlights influence, strategy, and team development' },
  technical: { label: 'Technical Depth', description: 'Showcases expertise, innovation, and problem-solving' },
  balanced: { label: 'Balanced', description: 'Mix of results, leadership, and technical achievements' },
};

// Executive-level action verbs by tone
const ACTION_VERBS: Record<NarrativeTone, string[]> = {
  results: ['accelerated', 'delivered', 'achieved', 'generated', 'optimized', 'captured', 'secured', 'unlocked'],
  leadership: ['spearheaded', 'championed', 'orchestrated', 'mentored', 'galvanized', 'aligned', 'steered', 'mobilized'],
  technical: ['architected', 'engineered', 'pioneered', 'innovated', 'automated', 'transformed', 'scaled', 'implemented'],
  balanced: ['spearheaded', 'delivered', 'architected', 'transformed', 'accelerated', 'championed', 'optimized', 'pioneered'],
};

// Transition phrases for varied language
const TRANSITIONS: Record<NarrativeTone, string[]> = {
  results: ['This directly resulted in', 'The measurable outcome was', 'Quantifiably, this', 'The bottom-line impact included'],
  leadership: ['Through strategic guidance,', 'By fostering alignment,', 'Leading cross-functional efforts,', 'Cultivating team excellence,'],
  technical: ['Leveraging deep expertise,', 'Through systematic innovation,', 'By engineering novel solutions,', 'Applying technical rigor,'],
  balanced: ['This initiative', 'The resulting impact', 'Through focused execution,', 'Building on this foundation,'],
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

// Get action verb based on tone and index
function getActionVerb(tone: NarrativeTone, index: number): string {
  const verbs = ACTION_VERBS[tone];
  return verbs[index % verbs.length];
}

// Get transition phrase based on tone and index
function getTransition(tone: NarrativeTone, index: number): string {
  const transitions = TRANSITIONS[tone];
  return transitions[index % transitions.length];
}

// Build opening paragraph with overall impact summary
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
  
  // Get unique beneficiaries
  const beneficiaries = [...new Set(entries.map(e => e.whoBenefited).filter(Boolean))];
  
  let opening = '';
  
  if (type === 'promotion') {
    opening = `This promotion case presents a compelling record of sustained excellence across ${themeList}. `;
  } else if (type === 'role-change') {
    opening = `A trajectory of progressive impact and adaptable expertise emerges from contributions spanning ${themeList}. `;
  } else {
    opening = `This review period reflects substantial contributions spanning ${themeList}. `;
  }
  
  // Add metrics if available
  if (allMetrics.length > 0) {
    const topMetrics = allMetrics.slice(0, 2).join(' and ');
    opening += `Key outcomes include ${topMetrics}, demonstrating measurable organizational value. `;
  }
  
  // Add beneficiary context
  if (beneficiaries.length > 0) {
    const beneficiaryList = beneficiaries.length > 2
      ? `${beneficiaries.slice(0, 2).join(', ')}, and others`
      : beneficiaries.join(' and ');
    
    if (tone === 'leadership') {
      opening += `Strategic partnerships with ${beneficiaryList} amplified impact across the organization.`;
    } else if (tone === 'results') {
      opening += `Direct value was delivered to ${beneficiaryList}, advancing critical business objectives.`;
    } else if (tone === 'technical') {
      opening += `Technical solutions enabled ${beneficiaryList} to achieve their goals with greater efficiency.`;
    } else {
      opening += `Cross-functional collaboration with ${beneficiaryList} strengthened both immediate outcomes and long-term capabilities.`;
    }
  }
  
  return opening;
}

// Build body paragraph for a theme
function buildBodyParagraph(
  themeLabel: string, 
  themeEntries: ImpactEntry[], 
  paragraphIndex: number,
  tone: NarrativeTone
): string {
  if (themeEntries.length === 0) return '';
  
  const verb = getActionVerb(tone, paragraphIndex);
  const transition = getTransition(tone, paragraphIndex);
  
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
  
  // Opening with theme and action verb
  if (tone === 'leadership') {
    paragraph = `In ${themeLabel.toLowerCase()}, strategic direction ${verb} initiatives that shaped organizational priorities. `;
  } else if (tone === 'results') {
    paragraph = `${themeLabel} outcomes were ${verb} through targeted execution. `;
  } else if (tone === 'technical') {
    paragraph = `Technical excellence in ${themeLabel.toLowerCase()} was demonstrated by ${verb}ing solutions that addressed complex challenges. `;
  } else {
    paragraph = `In the domain of ${themeLabel.toLowerCase()}, efforts ${verb} meaningful progress. `;
  }
  
  // Weave in specific outcomes
  outcomes.forEach((outcome, idx) => {
    const outcomeText = outcome.text.charAt(0).toLowerCase() + outcome.text.slice(1);
    
    if (idx === 0) {
      if (outcome.metrics.length > 0) {
        paragraph += `${transition} ${outcomeText}, achieving ${outcome.metrics[0]}. `;
      } else {
        paragraph += `${transition} ${outcomeText}. `;
      }
    } else {
      const connector = idx === outcomes.length - 1 ? 'Additionally, ' : 'Building on this, ';
      paragraph += `${connector}${outcomeText}. `;
    }
    
    // Add beneficiary context
    if (outcome.beneficiary && idx === 0) {
      if (tone === 'leadership') {
        paragraph += `This enabled ${outcome.beneficiary} to operate more strategically. `;
      } else if (tone === 'results') {
        paragraph += `${outcome.beneficiary} directly benefited from these improvements. `;
      } else if (tone === 'technical') {
        paragraph += `${outcome.beneficiary} gained new capabilities through this technical foundation. `;
      }
    }
  });
  
  return paragraph.trim();
}

// Build closing paragraph emphasizing collaboration and future potential
function buildClosingParagraph(
  entries: ImpactEntry[], 
  tone: NarrativeTone,
  type: NarrativeType
): string {
  const allBeneficiaries = [...new Set(entries.flatMap(e => e.whoBenefited ? [e.whoBenefited] : []))];
  const collaborators = allBeneficiaries.slice(0, 3);
  
  let closing = '';
  
  // Collaboration emphasis based on tone
  if (collaborators.length > 0) {
    const collaboratorList = collaborators.join(', ');
    
    if (tone === 'leadership') {
      closing = `Strong partnerships with ${collaboratorList} exemplify the stakeholder management and influence essential for senior leadership. `;
    } else if (tone === 'results') {
      closing = `Collaborative impact with ${collaboratorList} translated directly into organizational value. `;
    } else if (tone === 'technical') {
      closing = `Technical partnerships with ${collaboratorList} enabled scalable solutions with lasting impact. `;
    } else {
      closing = `Effective collaboration with ${collaboratorList} underscores the ability to drive outcomes across organizational boundaries. `;
    }
  } else {
    closing = 'Cross-functional effectiveness remained a consistent strength throughout this period. ';
  }
  
  // Future potential based on type
  if (type === 'promotion') {
    closing += 'This body of work demonstrates clear readiness to operate at the next level, combining strategic vision with consistent execution. ';
    closing += 'The pattern of increasing scope and complexity positions this individual for expanded leadership responsibility.';
  } else if (type === 'role-change') {
    closing += 'The breadth of experience and demonstrated adaptability translate seamlessly to new contexts and challenges. ';
    closing += 'This foundation of versatile excellence supports confident transition into expanded or evolved responsibilities.';
  } else {
    closing += 'Looking ahead, this foundation of execution and collaboration positions continued growth and expanded impact. ';
    closing += 'The consistency of contributions reflects both current capability and future potential.';
  }
  
  return closing;
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
    .map(([, theme], idx) => buildBodyParagraph(theme.label, theme.entries, idx, tone))
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
