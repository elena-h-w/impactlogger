/**
 * NARRATIVE GENERATOR - Impact Logger
 * 
 * Transforms impact log entries into compelling, first-person professional narratives.
 * Designed to sound like a confident human professional, not a corporate robot.
 * 
 * WRITING PRINCIPLES:
 * - First person throughout ("I launched..." not "successfully delivered")
 * - Active, confident voice
 * - Varied sentence structure - NEVER repeat phrases
 * - Specific and concrete, no vague corporate jargon
 * - Extract ALL metrics and use them naturally
 */

import { ImpactEntry, IMPACT_TAG_CONFIG, ImpactTag } from '@/types/impact';

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

// ============================================================================
// BANNED PHRASES - Never use these corporate jargon phrases
// ============================================================================
const BANNED_PHRASES = [
  'delivering tangible value to the organization',
  'sustained, high-quality contributions',
  'this directly benefited',
  'throughout the review cycle',
  'reliable execution',
  'positioned to build on these foundations',
  'meaningful contribution',
  'track record as a trusted and dependable contributor',
  'demonstrating consistency',
  'delivering tangible value',
  'reinforcing a track record',
  'reflecting a track record',
];

// ============================================================================
// METRIC EXTRACTION
// ============================================================================

interface ExtractedMetrics {
  percentages: string[];
  numbers: string[];
  currency: string[];
  timeframes: string[];
  counts: string[];
  all: string[];
}

function extractAllMetrics(text: string): ExtractedMetrics {
  if (!text) return { percentages: [], numbers: [], currency: [], timeframes: [], counts: [], all: [] };
  
  const percentages: string[] = [];
  const numbers: string[] = [];
  const currency: string[] = [];
  const timeframes: string[] = [];
  const counts: string[] = [];
  
  // Percentages: 40%, 3.5%, reduced by 25%
  const pctMatches = text.match(/\d+(?:\.\d+)?%/g);
  if (pctMatches) percentages.push(...pctMatches);
  
  // Currency: $50K, $1.2M, $500
  const currencyMatches = text.match(/\$[\d,]+(?:\.\d{2})?(?:\s*[KMB])?/gi);
  if (currencyMatches) currency.push(...currencyMatches);
  
  // Counts with context: 5,000+ users, 12 teams, 500 customers
  const countMatches = text.match(/\d+(?:,\d{3})*\+?\s*(?:users?|customers?|teams?|people|engineers?|stakeholders?|professionals?|subscribers?|readers?|attendees?|participants?|clients?)/gi);
  if (countMatches) counts.push(...countMatches);
  
  // Timeframes: Q1, 3 months, 2 weeks ahead
  const timeMatches = text.match(/(?:Q[1-4]|within\s+\d+\s+(?:days?|weeks?|months?)|in\s+\d+\s+(?:days?|weeks?|months?)|first-ever|\d+\s+(?:days?|weeks?|months?))/gi);
  if (timeMatches) timeframes.push(...timeMatches);
  
  // Generic numbers with units: 3x faster, 10x improvement
  const multiplierMatches = text.match(/\d+(?:\.\d+)?x\s*(?:improvement|increase|faster|better|growth)?/gi);
  if (multiplierMatches) numbers.push(...multiplierMatches);
  
  const all = [...new Set([...percentages, ...currency, ...counts, ...timeframes, ...numbers])];
  
  return { percentages, numbers, currency, timeframes, counts, all };
}

// ============================================================================
// ENTRY ANALYSIS
// ============================================================================

interface AnalyzedEntry {
  entry: ImpactEntry;
  metrics: ExtractedMetrics;
  stakeholders: string[];
  primaryTag: string;
  tagLabel: string;
  impactScore: number; // Higher = more impressive
}

function analyzeEntry(entry: ImpactEntry): AnalyzedEntry {
  const allText = [entry.whatYouDid, entry.problemSolved, entry.evidence].filter(Boolean).join(' ');
  const metrics = extractAllMetrics(allText);
  
  // Parse stakeholders
  const stakeholders = entry.whoBenefited
    ? entry.whoBenefited.split(/[,;&]/).map(s => s.trim()).filter(Boolean)
    : [];
  
  const primaryTag = entry.tags[0] || 'general';
  const tagLabel = IMPACT_TAG_CONFIG[primaryTag as ImpactTag]?.label || 
    primaryTag.charAt(0).toUpperCase() + primaryTag.slice(1);
  
  // Calculate impact score based on metrics and specificity
  let impactScore = 0;
  impactScore += metrics.percentages.length * 3;
  impactScore += metrics.currency.length * 4;
  impactScore += metrics.counts.length * 2;
  impactScore += entry.evidence.length > 50 ? 2 : 0;
  impactScore += stakeholders.length * 1;
  
  return { entry, metrics, stakeholders, primaryTag, tagLabel, impactScore };
}

// ============================================================================
// NARRATIVE BUILDING UTILITIES
// ============================================================================

class PhraseTracker {
  private usedPhrases: Set<string> = new Set();
  
  // Check if a phrase or its core would be repetitive
  wouldRepeat(phrase: string): boolean {
    const normalized = phrase.toLowerCase().trim();
    if (this.usedPhrases.has(normalized)) return true;
    
    // Check for partial matches
    for (const used of this.usedPhrases) {
      if (normalized.includes(used) || used.includes(normalized)) {
        if (normalized.length > 10 && used.length > 10) return true;
      }
    }
    return false;
  }
  
  track(phrase: string): void {
    this.usedPhrases.add(phrase.toLowerCase().trim());
  }
  
  trackAndGet(phrase: string): string {
    this.track(phrase);
    return phrase;
  }
}

function formatStakeholderList(stakeholders: string[], maxCount: number = 3): string {
  const list = stakeholders.slice(0, maxCount);
  if (list.length === 0) return '';
  if (list.length === 1) return list[0];
  if (list.length === 2) return `${list[0]} and ${list[1]}`;
  return `${list.slice(0, -1).join(', ')}, and ${list[list.length - 1]}`;
}

function getActionDescription(whatYouDid: string): string {
  // Clean up the action to work in first person
  let action = whatYouDid.trim();
  
  // Remove leading "I" if present (we'll add it back contextually)
  if (action.toLowerCase().startsWith('i ')) {
    action = action.slice(2);
  }
  
  // Remove "Successfully" or similar weak openers
  action = action.replace(/^(successfully|effectively|efficiently)\s+/i, '');
  
  return action.charAt(0).toLowerCase() + action.slice(1);
}

// ============================================================================
// REVIEW NARRATIVE GENERATOR
// ============================================================================

function generateReviewNarrative(
  analyzedEntries: AnalyzedEntry[],
  tone: NarrativeTone
): string {
  const phraseTracker = new PhraseTracker();
  
  // Sort by impact score to lead with most impressive
  const sortedEntries = [...analyzedEntries].sort((a, b) => b.impactScore - a.impactScore);
  
  // Collect all stakeholders and metrics
  const allStakeholders = [...new Set(sortedEntries.flatMap(e => e.stakeholders))];
  const allMetrics = sortedEntries.flatMap(e => e.metrics.all);
  const allCounts = sortedEntries.flatMap(e => e.metrics.counts);
  
  // Get top 2-3 entries for main content
  const topEntries = sortedEntries.slice(0, Math.min(3, sortedEntries.length));
  const primaryEntry = topEntries[0];
  const secondaryEntry = topEntries[1];
  
  const paragraphs: string[] = [];
  
  // ========== PARAGRAPH 1: Opening (2-3 sentences) ==========
  // Lead with most impressive achievement, state overall impact theme
  {
    let opening = '';
    const primaryAction = getActionDescription(primaryEntry.entry.whatYouDid);
    const primaryResult = primaryEntry.entry.problemSolved;
    
    // First sentence: Lead with most impressive achievement
    if (allCounts.length > 0) {
      opening = `This quarter, I ${primaryAction}`;
      if (primaryResult) {
        opening += ` that ${primaryResult.toLowerCase().replace(/^i\s+/i, '')}`;
      }
      opening += `, reaching ${allCounts[0]}. `;
    } else if (primaryEntry.metrics.percentages.length > 0) {
      opening = `I ${primaryAction}, achieving ${primaryEntry.metrics.percentages[0]}`;
      if (primaryResult) {
        opening += ` in ${primaryResult.toLowerCase().replace(/^i\s+/i, '').split(' ').slice(0, 4).join(' ')}`;
      }
      opening += '. ';
    } else {
      opening = `I ${primaryAction}`;
      if (primaryResult) {
        opening += `, ${primaryResult.toLowerCase().replace(/^i\s+/i, '')}`;
      }
      opening += '. ';
    }
    
    // Second sentence: Overall theme
    const uniqueTags = [...new Set(sortedEntries.map(e => e.tagLabel))].slice(0, 3);
    if (uniqueTags.length > 1) {
      opening += `My work spanned ${uniqueTags.join(', ').toLowerCase()}, with measurable outcomes across each area.`;
    } else if (secondaryEntry) {
      const secondaryAction = getActionDescription(secondaryEntry.entry.whatYouDid);
      opening += `I also ${secondaryAction.split(' ').slice(0, 8).join(' ')}.`;
    }
    
    paragraphs.push(opening.trim());
  }
  
  // ========== PARAGRAPH 2: First Major Achievement (3-4 sentences) ==========
  {
    let para2 = '';
    const entry = primaryEntry;
    const action = getActionDescription(entry.entry.whatYouDid);
    const result = entry.entry.problemSolved;
    const evidence = entry.entry.evidence;
    
    // Deep dive into most significant impact
    para2 = `The ${action.split(' ').slice(0, 3).join(' ')} represented a key initiative. `;
    
    if (evidence) {
      para2 += evidence.charAt(0).toUpperCase() + evidence.slice(1);
      if (!evidence.endsWith('.')) para2 += '.';
      para2 += ' ';
    }
    
    if (result && !para2.toLowerCase().includes(result.toLowerCase().slice(0, 20))) {
      para2 += `The result: ${result.toLowerCase().replace(/^i\s+/i, '')}`;
      if (!result.endsWith('.')) para2 += '.';
      para2 += ' ';
    }
    
    if (entry.stakeholders.length > 0) {
      para2 += `This work directly supported ${formatStakeholderList(entry.stakeholders)}.`;
    }
    
    paragraphs.push(para2.trim());
  }
  
  // ========== PARAGRAPH 3: Second Major Achievement (3-4 sentences) ==========
  if (secondaryEntry) {
    let para3 = '';
    const entry = secondaryEntry;
    const action = getActionDescription(entry.entry.whatYouDid);
    const result = entry.entry.problemSolved;
    const evidence = entry.entry.evidence;
    
    // Build on momentum
    para3 = `Building on this momentum, I ${action}. `;
    
    if (entry.metrics.all.length > 0) {
      para3 += `This delivered ${entry.metrics.all[0]}`;
      if (result) {
        para3 += `, ${result.toLowerCase().replace(/^i\s+/i, '').split(' ').slice(0, 8).join(' ')}`;
      }
      para3 += '. ';
    } else if (result) {
      para3 += `${result.charAt(0).toUpperCase() + result.slice(1)}`;
      if (!result.endsWith('.')) para3 += '.';
      para3 += ' ';
    }
    
    if (evidence && !para3.includes(evidence.slice(0, 20))) {
      const evidenceShort = evidence.split('.')[0];
      para3 += evidenceShort;
      if (!evidenceShort.endsWith('.')) para3 += '.';
    }
    
    paragraphs.push(para3.trim());
  }
  
  // ========== PARAGRAPH 4: Collaboration & Impact (2-3 sentences) ==========
  {
    let para4 = '';
    
    // Show cross-functional influence without repeating earlier points
    const unusedStakeholders = allStakeholders.filter(s => 
      !paragraphs.some(p => p.toLowerCase().includes(s.toLowerCase()))
    );
    
    if (unusedStakeholders.length > 0) {
      para4 = `These initiatives required close collaboration with ${formatStakeholderList(unusedStakeholders, 2)}`;
      
      // Add specific partnership detail if available
      const thirdEntry = topEntries[2];
      if (thirdEntry) {
        const thirdAction = getActionDescription(thirdEntry.entry.whatYouDid);
        para4 += ` to ${thirdAction.split(' ').slice(0, 6).join(' ')}`;
      }
      para4 += '. ';
      
      // Connect to broader goals based on tone
      if (tone === 'leadership') {
        para4 += 'I focused on building relationships that enable faster decision-making and smoother execution.';
      } else if (tone === 'results') {
        para4 += 'Each partnership was structured around clear deliverables and measurable outcomes.';
      } else if (tone === 'technical') {
        para4 += 'I ensured technical alignment across teams to maintain quality and consistency.';
      } else {
        para4 += 'These partnerships strengthened our ability to execute on strategic priorities.';
      }
    } else if (topEntries.length > 2) {
      const thirdEntry = topEntries[2];
      const thirdAction = getActionDescription(thirdEntry.entry.whatYouDid);
      para4 = `I also ${thirdAction}. `;
      if (thirdEntry.entry.problemSolved) {
        para4 += thirdEntry.entry.problemSolved.charAt(0).toUpperCase() + thirdEntry.entry.problemSolved.slice(1);
        if (!thirdEntry.entry.problemSolved.endsWith('.')) para4 += '.';
      }
    } else {
      para4 = 'My approach emphasized proactive communication and alignment with stakeholder priorities, ';
      para4 += 'ensuring work delivered maximum value.';
    }
    
    paragraphs.push(para4.trim());
  }
  
  // ========== PARAGRAPH 5: Forward-looking (1-2 sentences) ==========
  {
    let closing = '';
    
    // Brief, confident statement about continued growth with specific area
    const primaryTag = primaryEntry.tagLabel.toLowerCase();
    
    if (tone === 'leadership') {
      closing = `Looking ahead, I'm focused on expanding my influence in ${primaryTag} while mentoring others on best practices.`;
    } else if (tone === 'technical') {
      closing = `I'm now positioned to take on more complex ${primaryTag} challenges and deepen my technical expertise in this area.`;
    } else if (tone === 'results') {
      closing = `My next priority is scaling these ${primaryTag} wins into repeatable processes that multiply our team's impact.`;
    } else {
      closing = `Going forward, I'm ready to build on this ${primaryTag} foundation while taking on new strategic initiatives.`;
    }
    
    paragraphs.push(closing.trim());
  }
  
  return `## Performance Review Summary\n\n${paragraphs.join('\n\n')}`;
}

// ============================================================================
// PROMOTION NARRATIVE GENERATOR
// ============================================================================

function generatePromotionNarrative(
  analyzedEntries: AnalyzedEntry[],
  tone: NarrativeTone
): string {
  const sortedEntries = [...analyzedEntries].sort((a, b) => b.impactScore - a.impactScore);
  const allStakeholders = [...new Set(sortedEntries.flatMap(e => e.stakeholders))];
  const allMetrics = sortedEntries.flatMap(e => e.metrics.all);
  
  const topEntries = sortedEntries.slice(0, Math.min(3, sortedEntries.length));
  const primaryEntry = topEntries[0];
  const secondaryEntry = topEntries[1];
  
  const paragraphs: string[] = [];
  
  // ========== PARAGRAPH 1: Opening thesis (2-3 sentences) ==========
  {
    let opening = '';
    const primaryAction = getActionDescription(primaryEntry.entry.whatYouDid);
    
    opening = `I've consistently operated above my current level, taking ownership of high-impact initiatives that drive measurable business results. `;
    
    if (allMetrics.length > 0) {
      opening += `Over the past period, I delivered ${allMetrics.slice(0, 2).join(' and ')}, demonstrating the strategic judgment and execution capability expected at the next level. `;
    } else {
      opening += `My work has expanded in scope and complexity, with outcomes that reflect senior-level ownership and strategic thinking. `;
    }
    
    if (allStakeholders.length > 0) {
      opening += `My influence extends across ${formatStakeholderList(allStakeholders, 3)}.`;
    }
    
    paragraphs.push(opening.trim());
  }
  
  // ========== PARAGRAPH 2: Evidence of next-level capability (3-4 sentences) ==========
  {
    let para2 = '';
    const entry = primaryEntry;
    const action = getActionDescription(entry.entry.whatYouDid);
    const result = entry.entry.problemSolved;
    
    para2 = `A clear example of elevated performance: I independently ${action}. `;
    
    if (result) {
      para2 += `${result.charAt(0).toUpperCase() + result.slice(1)}`;
      if (!result.endsWith('.')) para2 += '.';
      para2 += ' ';
    }
    
    if (entry.metrics.all.length > 0) {
      para2 += `The quantified impact—${entry.metrics.all[0]}—reflects my ability to drive outcomes at scale. `;
    }
    
    if (entry.entry.evidence) {
      const evidenceShort = entry.entry.evidence.split('.')[0];
      para2 += evidenceShort;
      if (!evidenceShort.endsWith('.')) para2 += '.';
    }
    
    paragraphs.push(para2.trim());
  }
  
  // ========== PARAGRAPH 3: Scope and complexity (3-4 sentences) ==========
  if (secondaryEntry) {
    let para3 = '';
    const entry = secondaryEntry;
    const action = getActionDescription(entry.entry.whatYouDid);
    const result = entry.entry.problemSolved;
    
    para3 = `The complexity of my work has grown significantly. I ${action}`;
    if (entry.stakeholders.length > 0) {
      para3 += `, coordinating with ${formatStakeholderList(entry.stakeholders)}`;
    }
    para3 += '. ';
    
    if (result) {
      para3 += `This required strategic prioritization and independent decision-making to ${result.toLowerCase().replace(/^i\s+/i, '')}`;
      if (!result.endsWith('.')) para3 += '.';
      para3 += ' ';
    }
    
    if (entry.metrics.all.length > 0) {
      para3 += `I delivered ${entry.metrics.all[0]} through this work.`;
    }
    
    paragraphs.push(para3.trim());
  }
  
  // ========== PARAGRAPH 4: Leadership and influence (2-3 sentences) ==========
  {
    let para4 = '';
    
    if (tone === 'leadership') {
      para4 = "Beyond individual contributions, I've shaped how our team approaches key challenges. ";
      para4 += "I regularly mentor colleagues and drive alignment on strategic priorities, demonstrating the leadership expected at the next level.";
    } else if (tone === 'technical') {
      para4 = "I've become the go-to expert for complex technical decisions in my area. ";
      para4 += "My recommendations consistently influence architecture choices and technical direction across multiple initiatives.";
    } else {
      para4 = "I've expanded my influence beyond execution into strategy. ";
      if (allStakeholders.length > 2) {
        const unusedStakeholders = allStakeholders.slice(2);
        para4 += `My partnerships with ${formatStakeholderList(unusedStakeholders, 2)} have opened new opportunities for the team.`;
      } else {
        para4 += 'I proactively identify opportunities and drive initiatives that create value beyond my immediate scope.';
      }
    }
    
    paragraphs.push(para4.trim());
  }
  
  // ========== PARAGRAPH 5: Forward-looking (1-2 sentences) ==========
  {
    let closing = '';
    const primaryTag = primaryEntry.tagLabel.toLowerCase();
    
    closing = `I'm ready to formalize my move to the next level and take on the expanded scope that comes with it. `;
    closing += `I'll continue driving ${primaryTag} initiatives while taking on new areas of strategic ownership.`;
    
    paragraphs.push(closing.trim());
  }
  
  return `## Promotion Case\n\n${paragraphs.join('\n\n')}`;
}

// ============================================================================
// ROLE-CHANGE NARRATIVE GENERATOR
// ============================================================================

function generateRoleChangeNarrative(
  analyzedEntries: AnalyzedEntry[],
  tone: NarrativeTone
): string {
  const sortedEntries = [...analyzedEntries].sort((a, b) => b.impactScore - a.impactScore);
  const allStakeholders = [...new Set(sortedEntries.flatMap(e => e.stakeholders))];
  const allMetrics = sortedEntries.flatMap(e => e.metrics.all);
  const uniqueTags = [...new Set(sortedEntries.map(e => e.tagLabel))];
  
  const topEntries = sortedEntries.slice(0, Math.min(3, sortedEntries.length));
  const primaryEntry = topEntries[0];
  const secondaryEntry = topEntries[1];
  
  const paragraphs: string[] = [];
  
  // ========== PARAGRAPH 1: Professional evolution (2-3 sentences) ==========
  {
    let opening = '';
    
    opening = `My career has been defined by tackling challenges outside my comfort zone and delivering results each time. `;
    
    if (uniqueTags.length > 1) {
      opening += `I've built expertise across ${uniqueTags.slice(0, 3).join(', ').toLowerCase()}, developing the versatility to contribute from day one in new environments. `;
    }
    
    if (allMetrics.length > 0) {
      opening += `Along the way, I've achieved ${allMetrics[0]}, proving I can drive impact regardless of the context.`;
    }
    
    paragraphs.push(opening.trim());
  }
  
  // ========== PARAGRAPH 2: Transferable skills (3-4 sentences) ==========
  {
    let para2 = '';
    const entry = primaryEntry;
    const action = getActionDescription(entry.entry.whatYouDid);
    const result = entry.entry.problemSolved;
    
    para2 = `My strongest transferable skill is ${action.split(' ').slice(0, 4).join(' ')}. `;
    
    if (result) {
      para2 += `When I ${action.split(' ').slice(0, 6).join(' ')}, I ${result.toLowerCase().replace(/^i\s+/i, '')}`;
      if (!result.endsWith('.')) para2 += '.';
      para2 += ' ';
    }
    
    para2 += 'This required learning new systems quickly, building stakeholder relationships, and delivering under ambiguity—skills that translate directly to any new role.';
    
    paragraphs.push(para2.trim());
  }
  
  // ========== PARAGRAPH 3: Adaptability (3-4 sentences) ==========
  if (secondaryEntry) {
    let para3 = '';
    const entry = secondaryEntry;
    const action = getActionDescription(entry.entry.whatYouDid);
    const result = entry.entry.problemSolved;
    
    para3 = `I thrive when adapting to new challenges. `;
    
    if (entry.tagLabel !== primaryEntry.tagLabel) {
      para3 += `Moving from ${primaryEntry.tagLabel.toLowerCase()} to ${entry.tagLabel.toLowerCase()} work, I ${action}`;
      if (result) {
        para3 += `, ${result.toLowerCase().replace(/^i\s+/i, '')}`;
      }
      para3 += '. ';
    } else {
      para3 += `I ${action}`;
      if (result) {
        para3 += `, achieving ${result.toLowerCase().replace(/^i\s+/i, '')}`;
      }
      para3 += '. ';
    }
    
    if (entry.metrics.all.length > 0) {
      para3 += `The ${entry.metrics.all[0]} outcome demonstrates my ability to perform in unfamiliar territory.`;
    } else {
      para3 += 'Each transition has strengthened my ability to learn fast and deliver fast.';
    }
    
    paragraphs.push(para3.trim());
  }
  
  // ========== PARAGRAPH 4: Cross-functional experience (2-3 sentences) ==========
  {
    let para4 = '';
    
    if (allStakeholders.length > 0) {
      para4 = `I've built productive relationships with ${formatStakeholderList(allStakeholders, 3)}. `;
      para4 += 'This cross-functional experience means I understand how different teams operate and can bridge gaps between them.';
    } else {
      para4 = 'My experience spans multiple functions and stakeholder groups. ';
      para4 += 'I know how to navigate organizational complexity and align diverse perspectives toward shared goals.';
    }
    
    paragraphs.push(para4.trim());
  }
  
  // ========== PARAGRAPH 5: Forward-looking (1-2 sentences) ==========
  {
    let closing = '';
    
    closing = "I'm excited to bring this adaptability and drive to a new challenge. ";
    closing += "My track record shows I can deliver impact quickly, and I'm ready to do it again.";
    
    paragraphs.push(closing.trim());
  }
  
  return `## Role Transition Narrative\n\n${paragraphs.join('\n\n')}`;
}

// ============================================================================
// MAIN ENTRY POINT
// ============================================================================

export function generateNarrative(
  entries: ImpactEntry[], 
  type: NarrativeType,
  tone: NarrativeTone
): string {
  if (entries.length === 0) {
    return "No impact entries found. Start capturing your wins to generate compelling narratives for your career moments.";
  }

  const analyzedEntries = entries.map(analyzeEntry);
  
  switch (type) {
    case 'review':
      return generateReviewNarrative(analyzedEntries, tone);
    case 'promotion':
      return generatePromotionNarrative(analyzedEntries, tone);
    case 'role-change':
      return generateRoleChangeNarrative(analyzedEntries, tone);
    default:
      return generateReviewNarrative(analyzedEntries, tone);
  }
}
