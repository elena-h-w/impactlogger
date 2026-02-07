/**
 * NARRATIVE GENERATOR - Impact Logger
 * 
 * This module transforms impact log entries into compelling professional narratives
 * for three distinct use cases: Performance Reviews, Promotion Cases, and Role Changes.
 * 
 * =============================================================================
 * CORE DESIGN PRINCIPLES (PRESERVE IN FUTURE UPDATES)
 * =============================================================================
 * 
 * 1. PROSE OVER BULLETS: All output must be flowing paragraphs with no bullet points.
 *    Executives read prose; bullets feel like task lists.
 * 
 * 2. VARIED LANGUAGE: Avoid repetition of action verbs like "drove" or "showcased".
 *    Use rich, professional vocabulary that varies throughout the narrative.
 * 
 * 3. METRIC EXTRACTION: Actively pull out percentages, numbers, currency, and timeframes
 *    from impact entries and weave them into the narrative for concrete evidence.
 * 
 * 4. STAKEHOLDER-CENTRIC: The "Who benefited?" field should be prominently featured
 *    to demonstrate cross-functional impact and business value delivery.
 * 
 * 5. TYPE-SPECIFIC FRAMING: Each narrative type has fundamentally different purposes:
 *    - Review: Reflective, past-tense, showing consistency and reliability
 *    - Promotion: Assertive, present-perfect, proving next-level readiness
 *    - Role-Change: Adaptive, progressive, highlighting transferable skills
 * 
 * =============================================================================
 * NARRATIVE TYPE SPECIFICATIONS
 * =============================================================================
 * 
 * PERFORMANCE REVIEW SUMMARY:
 * - Focus: What you accomplished in the current review period
 * - Tone: Reflective and comprehensive
 * - Structure: Cover key impact areas, showing consistent performance
 * - Emphasis: Meeting/exceeding expectations, sustained contributions, reliability
 * - Language: Past tense ("Successfully delivered...", "Contributed to...", "Achieved...")
 * - Answers: "What value did I deliver this period?"
 * 
 * Paragraph Structure:
 * 1. Overview of review period contributions
 * 2-3. Deep dive into 2-3 key impact areas with examples
 * 4. Cross-functional collaboration and stakeholder value
 * 5. (Optional) Growth and development
 * 
 * PROMOTION CASE:
 * - Focus: Why you're ready for the NEXT level
 * - Tone: Assertive and forward-looking
 * - Structure: Evidence-based argument with specific examples proving readiness
 * - Emphasis: Operating above current level, scope expansion, leadership, business impact
 * - Language: Present perfect ("Demonstrated readiness by...", "Already operating at...", "Established myself as...")
 * - Answers: "Why do I deserve this promotion NOW?"
 * 
 * Paragraph Structure:
 * 1. Opening argument for promotion readiness (thesis statement)
 * 2. Evidence of operating at next level (specific example)
 * 3. Scope and complexity of work (showing expanded impact)
 * 4. Leadership and influence on organization
 * 5. Future vision and continued growth trajectory
 * 
 * ROLE-CHANGE NARRATIVE:
 * - Focus: Transferable skills and readiness for NEW challenges
 * - Tone: Adaptive and growth-oriented
 * - Structure: Story of evolution, highlighting versatility and learning agility
 * - Emphasis: Skill breadth, adaptability, cross-functional experience, potential
 * - Language: Progressive ("Evolved from... to...", "Expanded skillset to include...", "Applied expertise in new contexts...")
 * - Answers: "Why am I the right fit for this different role?"
 * 
 * Paragraph Structure:
 * 1. Your professional journey and skill evolution
 * 2. Transferable skills with concrete examples
 * 3. Examples of adaptability and learning new domains
 * 4. Cross-functional experience and breadth
 * 5. Readiness and enthusiasm for new challenges
 * 
 * =============================================================================
 * HOW IMPACT LOG FIELDS ARE USED DIFFERENTLY BY TYPE
 * =============================================================================
 * 
 * Performance Review Summary:
 * - Heavily weight "What was the result? Why does it matter?"
 * - Group by Impact Tags to show breadth
 * - Emphasize stakeholder value from "Who benefited?"
 * 
 * Promotion Case:
 * - Look for impacts with tags: Leadership, Revenue, Strategic importance
 * - Highlight scope from "Who benefited?" (number of teams/users affected)
 * - Extract metrics that show scale and complexity
 * - Identify patterns of increasing responsibility over time
 * 
 * Role-Change Narrative:
 * - Focus on diversity of Impact Tags (showing breadth)
 * - Highlight cross-functional work from "Who benefited?"
 * - Emphasize different skill areas demonstrated
 * - Show progression: "started with X, then learned Y, now capable of Z"
 * 
 * =============================================================================
 * EXAMPLE: SAME IMPACT, DIFFERENT FRAMINGS
 * =============================================================================
 * 
 * Impact: "Led OAuth 2.0 migration, reduced login failures by 40%"
 * 
 * Performance Review: "Successfully led the OAuth 2.0 migration project,
 * collaborating with the engineering team to improve system reliability.
 * This reduced login failures by 40%, directly improving user retention..."
 * 
 * Promotion Case: "Demonstrated senior-level technical leadership by
 * independently driving the OAuth 2.0 migration—a critical infrastructure
 * initiative affecting all product users. Reduced login failures by 40%,
 * showing ability to deliver high-impact, high-complexity projects..."
 * 
 * Role-Change: "Applied authentication expertise to solve a critical
 * business problem, leading the OAuth 2.0 migration. Quickly learned
 * the new authentication framework and coordinated across engineering,
 * product, and support teams—demonstrating the cross-functional
 * collaboration skills essential for..."
 * 
 * =============================================================================
 */

import { ImpactEntry, IMPACT_TAG_CONFIG, ImpactTag } from '@/types/impact';

export type NarrativeType = 'review' | 'promotion' | 'role-change';
export type NarrativeTone = 'results' | 'leadership' | 'technical' | 'balanced';

/**
 * Tone configurations modify the vocabulary emphasis within each narrative type.
 * These work as a secondary lens on top of the primary type-based framing.
 */
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

/**
 * =============================================================================
 * TYPE-SPECIFIC LANGUAGE PATTERNS
 * =============================================================================
 * 
 * These verb banks ensure varied, executive-level language that matches
 * the purpose and tense of each narrative type. Never repeat verbs within
 * a single narrative - rotate through the bank.
 * 
 * Key principle: Each type uses different tenses and focuses:
 * - REVIEW (Reflective): Past tense - what WAS done
 * - PROMOTION (Assertive): Present perfect - what you're CAPABLE of now
 * - ROLE-CHANGE (Adaptive): Progressive - how you've TRANSFORMED
 */

// Primary action verbs organized by type and tone
const TYPE_VERBS: Record<NarrativeType, Record<NarrativeTone, string[]>> = {
  // REVIEW: Reflective, past tense - describing completed work
  review: {
    results: [
      'successfully delivered', 'achieved measurable gains in', 'completed', 
      'accomplished', 'attained', 'realized', 'fulfilled objectives in',
      'exceeded expectations for', 'met critical milestones in'
    ],
    leadership: [
      'contributed meaningfully to', 'collaborated effectively on', 
      'supported key initiatives in', 'facilitated progress on', 
      'coordinated efforts for', 'partnered with stakeholders to advance',
      'fostered alignment on', 'championed improvements in'
    ],
    technical: [
      'implemented solutions for', 'built robust systems for', 
      'developed capabilities in', 'created infrastructure for', 
      'designed approaches to', 'executed improvements in',
      'produced deliverables for', 'engineered solutions to'
    ],
    balanced: [
      'successfully delivered', 'contributed to', 'implemented', 
      'achieved', 'completed', 'developed', 'advanced', 'strengthened'
    ],
  },
  
  // PROMOTION: Assertive, present perfect - proving current capability
  promotion: {
    results: [
      'demonstrated ability to deliver', 'established track record of driving', 
      'proven capacity to achieve', 'shown mastery in executing',
      'consistently exceeded expectations in', 'delivered outsized impact through'
    ],
    leadership: [
      'already operating as a leader in', 'established myself as go-to expert for', 
      'consistently led strategic initiatives in', 'taken ownership of',
      'driven strategy for', 'influenced direction of', 'shaped outcomes for'
    ],
    technical: [
      'demonstrated senior-level expertise in', 'independently driven complex',
      'taken technical ownership of', 'established expertise in',
      'architected solutions for', 'led technical direction of'
    ],
    balanced: [
      'demonstrated readiness by excelling in', 'proven ability to lead',
      'established pattern of excellence in', 'shown capability beyond role in',
      'operated at elevated scope in', 'driven strategic outcomes in'
    ],
  },
  
  // ROLE-CHANGE: Adaptive, progressive - showing evolution and transferability
  'role-change': {
    results: [
      'evolved to deliver impact in', 'expanded capability to drive', 
      'grew expertise while achieving', 'developed proficiency delivering',
      'applied learning to achieve', 'transferred skills to deliver'
    ],
    leadership: [
      'adapted leadership approach for', 'expanded influence across', 
      'evolved from specialist to leader in', 'broadened scope to encompass',
      'developed cross-functional fluency in', 'built bridges between'
    ],
    technical: [
      'applied expertise in new contexts including', 'transferred skills to master',
      'quickly built capabilities in', 'developed new competencies for',
      'leveraged foundation to learn', 'extended technical depth to'
    ],
    balanced: [
      'evolved from', 'expanded skillset to include', 'adapted approach to excel in',
      'applied diverse experience to', 'demonstrated versatility through',
      'grew into new challenges including'
    ],
  },
};

/**
 * Secondary verbs for additional variety within paragraphs.
 * These supplement the primary verbs to avoid any repetition.
 */
const SECONDARY_VERBS: Record<NarrativeType, string[]> = {
  review: [
    'contributed to', 'supported', 'enabled', 'strengthened', 
    'improved', 'enhanced', 'optimized', 'streamlined'
  ],
  promotion: [
    'spearheaded', 'orchestrated', 'championed', 'pioneered',
    'transformed', 'elevated', 'accelerated', 'catalyzed'
  ],
  'role-change': [
    'explored', 'mastered', 'acquired', 'cultivated',
    'honed', 'refined', 'expanded', 'deepened'
  ],
};

/**
 * Transition phrases that vary by type to create natural paragraph flow.
 * Each type uses transitions that reinforce its core message.
 */
const TYPE_TRANSITIONS: Record<NarrativeType, string[]> = {
  // Review: Time-based, period-focused transitions
  review: [
    'During this period,',
    'Throughout the review cycle,',
    'A key area of contribution was',
    'Notably,',
    'In parallel,',
    'Building on these foundations,',
    'Demonstrating consistency,',
  ],
  // Promotion: Capability and evidence-focused transitions
  promotion: [
    'Demonstrating next-level capability,',
    'Operating beyond current scope,',
    'Taking strategic ownership,',
    'A clear example of elevated performance:',
    'Proving senior-level judgment,',
    'Exhibiting expanded leadership,',
    'Further evidence of readiness:',
  ],
  // Role-change: Evolution and learning-focused transitions  
  'role-change': [
    'Applying transferable expertise,',
    'Drawing on diverse experience,',
    'Leveraging cross-functional skills,',
    'Demonstrating learning agility,',
    'Navigating new territory,',
    'Building on foundational strengths,',
    'Showing adaptability,',
  ],
};

/**
 * Connector phrases for flowing prose within paragraphs.
 * These replace bullet-point structures with natural reading flow.
 */
const PROSE_CONNECTORS = [
  'This work',
  'The initiative',
  'This effort',
  'The project',
  'This contribution',
];

const RESULT_PHRASES: Record<NarrativeType, string[]> = {
  review: [
    'resulting in', 'which achieved', 'leading to', 'producing',
    'delivering', 'enabling', 'that yielded'
  ],
  promotion: [
    'demonstrating capacity to deliver', 'proving ability to achieve',
    'showing capability to drive', 'establishing pattern of',
    'reflecting readiness through'
  ],
  'role-change': [
    'while simultaneously learning', 'rapidly acquiring skills to achieve',
    'applying new knowledge to deliver', 'transferring expertise to accomplish',
    'adapting approach to realize'
  ],
};

/**
 * =============================================================================
 * METRIC EXTRACTION UTILITIES
 * =============================================================================
 * 
 * These functions actively mine impact entries for quantifiable evidence.
 * Metrics are the currency of credibility in professional narratives.
 */

/**
 * Extract all quantifiable metrics from text.
 * Captures: percentages, currency, multipliers, counts with units, timeframes.
 */
function extractMetrics(text: string): { metrics: string[]; cleanText: string } {
  if (!text) return { metrics: [], cleanText: '' };
  
  const metricPatterns = [
    /(\d+(?:\.\d+)?%)/g,                                    // percentages: 40%, 3.5%
    /(\$[\d,]+(?:\.\d{2})?(?:\s*[KMB])?)/gi,               // currency: $50K, $1.2M
    /(\d+(?:\.\d+)?x\s*(?:improvement|increase|faster|better)?)/gi, // multipliers: 3x faster
    /(\d+(?:,\d{3})*)\s*(users?|customers?|teams?|people|engineers?|stakeholders?)/gi, // counts
    /(\d+(?:,\d{3})*)\s*(hours?|days?|weeks?|months?|quarters?)\s*(?:saved|reduced|ahead|early)/gi, // time savings
    /(\d+(?:\.\d+)?)\s*(?:percent(?:age)?|points?|pp)/gi,  // written percentages
    /reduced\s+(?:by\s+)?(\d+(?:\.\d+)?%)/gi,              // reductions
    /increased?\s+(?:by\s+)?(\d+(?:\.\d+)?%)/gi,           // increases
    /(top\s+\d+%)/gi,                                       // rankings: top 10%
  ];
  
  const metrics: string[] = [];
  let cleanText = text;
  
  metricPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      metrics.push(...matches.map(m => m.trim()));
    }
  });
  
  // Deduplicate while preserving order
  return { metrics: [...new Set(metrics)], cleanText };
}

/**
 * Extract timeframe references for context.
 */
function extractTimeframes(text: string): string[] {
  if (!text) return [];
  
  const timePatterns = [
    /within\s+(\d+\s+(?:days?|weeks?|months?))/gi,
    /(\d+\s+(?:days?|weeks?|months?))\s+(?:ahead|early|before)/gi,
    /in\s+(?:just\s+)?(\d+\s+(?:days?|weeks?|months?))/gi,
    /(Q[1-4](?:\s+\d{4})?)/gi,
    /(\d{4})/g, // years
  ];
  
  const timeframes: string[] = [];
  timePatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) timeframes.push(...matches);
  });
  
  return [...new Set(timeframes)];
}

/**
 * Extract scale indicators that suggest scope of impact.
 */
function extractScaleIndicators(text: string): string[] {
  if (!text) return [];
  
  const scalePatterns = [
    /(?:all|entire|whole|full)\s+(?:team|organization|company|department)/gi,
    /(?:cross-functional|cross-team|company-wide|org-wide)/gi,
    /(?:multiple|several|numerous)\s+(?:teams?|departments?|stakeholders?)/gi,
    /(\d+)\s+(?:teams?|departments?|regions?)/gi,
  ];
  
  const indicators: string[] = [];
  scalePatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) indicators.push(...matches);
  });
  
  return [...new Set(indicators)];
}

/**
 * =============================================================================
 * ENTRY ANALYSIS AND GROUPING
 * =============================================================================
 */

/**
 * Analyze an entry to extract all relevant narrative elements.
 */
interface AnalyzedEntry {
  entry: ImpactEntry;
  metrics: string[];
  timeframes: string[];
  scaleIndicators: string[];
  beneficiaries: string[];
  primaryTheme: string;
  themeLabel: string;
}

function analyzeEntry(entry: ImpactEntry): AnalyzedEntry {
  const allText = [
    entry.whatYouDid,
    entry.problemSolved,
    entry.evidence,
  ].filter(Boolean).join(' ');
  
  const { metrics } = extractMetrics(allText);
  const timeframes = extractTimeframes(allText);
  const scaleIndicators = extractScaleIndicators(allText);
  
  // Parse beneficiaries (may be comma-separated)
  const beneficiaries = entry.whoBenefited
    ? entry.whoBenefited.split(/[,;&]/).map(b => b.trim()).filter(Boolean)
    : [];
  
  const primaryTag = entry.tags[0] || 'general';
  const themeLabel = IMPACT_TAG_CONFIG[primaryTag as ImpactTag]?.label || 
    primaryTag.charAt(0).toUpperCase() + primaryTag.slice(1);
  
  return {
    entry,
    metrics,
    timeframes,
    scaleIndicators,
    beneficiaries,
    primaryTheme: primaryTag,
    themeLabel,
  };
}

/**
 * Group analyzed entries by theme for narrative organization.
 */
function groupEntriesByTheme(
  analyzedEntries: AnalyzedEntry[]
): Map<string, { entries: AnalyzedEntry[]; label: string }> {
  const themes = new Map<string, { entries: AnalyzedEntry[]; label: string }>();
  
  analyzedEntries.forEach(analyzed => {
    if (!themes.has(analyzed.primaryTheme)) {
      themes.set(analyzed.primaryTheme, { entries: [], label: analyzed.themeLabel });
    }
    themes.get(analyzed.primaryTheme)!.entries.push(analyzed);
  });
  
  return themes;
}

/**
 * Collect all unique beneficiaries across entries for cross-functional narrative.
 */
function collectBeneficiaries(analyzedEntries: AnalyzedEntry[]): string[] {
  const allBeneficiaries = analyzedEntries.flatMap(a => a.beneficiaries);
  return [...new Set(allBeneficiaries)].filter(Boolean);
}

/**
 * Collect all metrics for summary statements.
 */
function collectAllMetrics(analyzedEntries: AnalyzedEntry[]): string[] {
  const allMetrics = analyzedEntries.flatMap(a => a.metrics);
  return [...new Set(allMetrics)];
}

/**
 * =============================================================================
 * VERB AND PHRASE MANAGEMENT
 * =============================================================================
 * 
 * Track used verbs to ensure variety throughout the narrative.
 */

class VerbTracker {
  private usedVerbs: Set<string> = new Set();
  private verbIndex: Record<string, number> = {};
  
  getVerb(type: NarrativeType, tone: NarrativeTone, category: 'primary' | 'secondary'): string {
    const key = `${type}-${tone}-${category}`;
    const verbs = category === 'primary' 
      ? TYPE_VERBS[type][tone] 
      : SECONDARY_VERBS[type];
    
    // Find next unused verb
    const startIndex = this.verbIndex[key] || 0;
    for (let i = 0; i < verbs.length; i++) {
      const idx = (startIndex + i) % verbs.length;
      const verb = verbs[idx];
      if (!this.usedVerbs.has(verb)) {
        this.usedVerbs.add(verb);
        this.verbIndex[key] = idx + 1;
        return verb;
      }
    }
    
    // If all used, cycle through anyway
    const idx = startIndex % verbs.length;
    this.verbIndex[key] = idx + 1;
    return verbs[idx];
  }
  
  getTransition(type: NarrativeType): string {
    const transitions = TYPE_TRANSITIONS[type];
    const key = `transition-${type}`;
    const idx = (this.verbIndex[key] || 0) % transitions.length;
    this.verbIndex[key] = idx + 1;
    return transitions[idx];
  }
  
  getResultPhrase(type: NarrativeType): string {
    const phrases = RESULT_PHRASES[type];
    const key = `result-${type}`;
    const idx = (this.verbIndex[key] || 0) % phrases.length;
    this.verbIndex[key] = idx + 1;
    return phrases[idx];
  }
  
  getConnector(): string {
    const key = 'connector';
    const idx = (this.verbIndex[key] || 0) % PROSE_CONNECTORS.length;
    this.verbIndex[key] = idx + 1;
    return PROSE_CONNECTORS[idx];
  }
}

/**
 * =============================================================================
 * OPENING PARAGRAPH BUILDERS
 * =============================================================================
 * 
 * Each type has a distinct opening strategy:
 * - Review: Overview of period contributions
 * - Promotion: Thesis statement for readiness
 * - Role-Change: Story of professional evolution
 */

function buildReviewOpening(
  analyzedEntries: AnalyzedEntry[],
  themes: Map<string, { entries: AnalyzedEntry[]; label: string }>,
  allMetrics: string[],
  beneficiaries: string[]
): string {
  const themeLabels = Array.from(themes.values()).map(t => t.label.toLowerCase());
  const themeList = formatList(themeLabels);
  
  let opening = `This review period reflects sustained, high-quality contributions across ${themeList}. `;
  
  if (allMetrics.length > 0) {
    const topMetrics = allMetrics.slice(0, 2).join(' and ');
    opening += `Key accomplishments include achieving ${topMetrics}, demonstrating consistent execution against objectives. `;
  } else {
    opening += `The work delivered measurable value through focused execution and reliable delivery. `;
  }
  
  if (beneficiaries.length > 0) {
    const beneficiaryList = formatList(beneficiaries.slice(0, 3));
    opening += `Value was delivered to ${beneficiaryList}, reinforcing a track record as a trusted and dependable contributor.`;
  } else {
    opening += `Each initiative contributed to team success and organizational priorities.`;
  }
  
  return opening;
}

function buildPromotionOpening(
  analyzedEntries: AnalyzedEntry[],
  themes: Map<string, { entries: AnalyzedEntry[]; label: string }>,
  allMetrics: string[],
  beneficiaries: string[]
): string {
  const themeLabels = Array.from(themes.values()).map(t => t.label.toLowerCase());
  const themeList = formatList(themeLabels);
  
  // Thesis statement format
  let opening = `I am ready for the next level because I have consistently demonstrated capability beyond my current role, `;
  opening += `with proven impact across ${themeList}. `;
  
  if (allMetrics.length > 0) {
    const topMetrics = allMetrics.slice(0, 2).join(' and ');
    opening += `Operating at elevated scope, I have delivered ${topMetrics} through strategic initiative and independent ownership. `;
  } else {
    opening += `Through strategic initiative and independent ownership, I have consistently exceeded role expectations. `;
  }
  
  if (beneficiaries.length > 0) {
    const beneficiaryList = formatList(beneficiaries.slice(0, 3));
    opening += `My influence extends across ${beneficiaryList}, reflecting the cross-functional leadership expected at the next level.`;
  } else {
    opening += `The scope and complexity of my contributions demonstrate readiness for expanded responsibility.`;
  }
  
  return opening;
}

function buildRoleChangeOpening(
  analyzedEntries: AnalyzedEntry[],
  themes: Map<string, { entries: AnalyzedEntry[]; label: string }>,
  allMetrics: string[],
  beneficiaries: string[]
): string {
  const themeLabels = Array.from(themes.values()).map(t => t.label.toLowerCase());
  const themeList = formatList(themeLabels);
  
  // Evolution narrative format
  let opening = `My professional journey reflects continuous evolution and deliberate skill expansion, `;
  opening += `with demonstrated expertise across ${themeList}. `;
  
  if (allMetrics.length > 0) {
    const topMetrics = allMetrics.slice(0, 2).join(' and ');
    opening += `I have successfully navigated new challenges, achieving ${topMetrics} while rapidly building competencies in unfamiliar domains. `;
  } else {
    opening += `Each role transition has strengthened my ability to learn rapidly and deliver value in new contexts. `;
  }
  
  if (beneficiaries.length > 0) {
    const beneficiaryList = formatList(beneficiaries.slice(0, 3));
    opening += `My cross-functional experience with ${beneficiaryList} has developed the versatility essential for this transition.`;
  } else {
    opening += `This breadth of experience has cultivated the adaptability and learning agility essential for new challenges.`;
  }
  
  return opening;
}

/**
 * =============================================================================
 * BODY PARAGRAPH BUILDERS
 * =============================================================================
 * 
 * Body paragraphs dive deep into specific impact areas.
 * Each type frames the same achievements differently:
 * - Review: Past accomplishment focus
 * - Promotion: Evidence of next-level capability
 * - Role-Change: Transferable skill demonstration
 */

function buildReviewBodyParagraph(
  themeLabel: string,
  themeEntries: AnalyzedEntry[],
  verbTracker: VerbTracker,
  tone: NarrativeTone
): string {
  if (themeEntries.length === 0) return '';
  
  const verb = verbTracker.getVerb('review', tone, 'primary');
  const transition = verbTracker.getTransition('review');
  
  // Opening sentence: past-tense accomplishment focus
  let paragraph = `${transition} ${verb} in ${themeLabel.toLowerCase()}. `;
  
  // Detail the top 2-3 entries with flowing prose
  themeEntries.slice(0, 3).forEach((analyzed, idx) => {
    const { entry, metrics, beneficiaries } = analyzed;
    const action = entry.whatYouDid || '';
    const result = entry.problemSolved || '';
    
    if (idx === 0) {
      // Primary example with full detail
      if (result) {
        const resultPhrase = verbTracker.getResultPhrase('review');
        paragraph += `This included ${action.toLowerCase()}, ${resultPhrase} ${result.toLowerCase()}`;
        if (metrics.length > 0) {
          paragraph += `—achieving ${metrics[0]}`;
        }
        paragraph += '. ';
      } else if (action) {
        paragraph += `This work encompassed ${action.toLowerCase()}. `;
      }
      
      // Stakeholder value - prominent for reviews
      if (beneficiaries.length > 0) {
        paragraph += `This directly benefited ${formatList(beneficiaries)}, delivering tangible value to the organization. `;
      }
    } else {
      // Secondary examples with lighter detail
      const secondaryVerb = verbTracker.getVerb('review', tone, 'secondary');
      if (action && result) {
        paragraph += `Additionally, ${secondaryVerb} ${action.toLowerCase()}, which ${result.toLowerCase()}. `;
      } else if (action) {
        paragraph += `The work also ${secondaryVerb} ${action.toLowerCase()}. `;
      }
    }
  });
  
  return paragraph.trim();
}

function buildPromotionBodyParagraph(
  themeLabel: string,
  themeEntries: AnalyzedEntry[],
  verbTracker: VerbTracker,
  tone: NarrativeTone,
  paragraphFocus: 'evidence' | 'scope' | 'leadership'
): string {
  if (themeEntries.length === 0) return '';
  
  const verb = verbTracker.getVerb('promotion', tone, 'primary');
  const transition = verbTracker.getTransition('promotion');
  
  let paragraph = '';
  
  // Different framing based on paragraph focus
  if (paragraphFocus === 'evidence') {
    paragraph = `${transition} I have ${verb} ${themeLabel.toLowerCase()}, taking ownership of strategic initiatives that typically require senior-level judgment. `;
  } else if (paragraphFocus === 'scope') {
    paragraph = `${transition} the scope and complexity of work in ${themeLabel.toLowerCase()} demonstrate capability beyond current role expectations. `;
  } else {
    paragraph = `${transition} I have exercised leadership in ${themeLabel.toLowerCase()}, influencing outcomes and developing others. `;
  }
  
  // Emphasize concrete evidence with next-level framing
  themeEntries.slice(0, 2).forEach((analyzed, idx) => {
    const { entry, metrics, beneficiaries, scaleIndicators } = analyzed;
    const action = entry.whatYouDid || '';
    const result = entry.problemSolved || '';
    
    if (idx === 0) {
      if (paragraphFocus === 'evidence') {
        paragraph += `A concrete example: independently ${action.toLowerCase()}`;
        if (result) {
          paragraph += `, ${result.toLowerCase()}`;
        }
        if (metrics.length > 0) {
          paragraph += `—delivering ${metrics[0]} through strategic execution`;
        }
        paragraph += '. ';
      } else if (paragraphFocus === 'scope') {
        if (scaleIndicators.length > 0 || beneficiaries.length > 0) {
          const scope = scaleIndicators[0] || formatList(beneficiaries);
          paragraph += `This work affected ${scope}, demonstrating ability to operate at scale. `;
        }
        if (action) {
          paragraph += `By ${action.toLowerCase()}, I showed capacity to handle elevated complexity`;
          if (metrics.length > 0) {
            paragraph += ` and achieve ${metrics[0]}`;
          }
          paragraph += '. ';
        }
      } else {
        paragraph += `By ${action.toLowerCase()}, I shaped outcomes for ${formatList(beneficiaries) || 'key stakeholders'}`;
        if (result) {
          paragraph += `, ultimately ${result.toLowerCase()}`;
        }
        paragraph += '. ';
      }
    } else {
      const secondaryVerb = verbTracker.getVerb('promotion', tone, 'secondary');
      paragraph += `Further demonstrating readiness, ${secondaryVerb} similar initiatives that ${result.toLowerCase() || 'delivered measurable impact'}. `;
    }
  });
  
  return paragraph.trim();
}

function buildRoleChangeBodyParagraph(
  themeLabel: string,
  themeEntries: AnalyzedEntry[],
  verbTracker: VerbTracker,
  tone: NarrativeTone,
  paragraphFocus: 'skills' | 'adaptability' | 'breadth'
): string {
  if (themeEntries.length === 0) return '';
  
  const verb = verbTracker.getVerb('role-change', tone, 'primary');
  const transition = verbTracker.getTransition('role-change');
  
  let paragraph = '';
  
  // Different framing based on paragraph focus
  if (paragraphFocus === 'skills') {
    paragraph = `${transition} I have ${verb} ${themeLabel.toLowerCase()}, building transferable capabilities directly applicable to new challenges. `;
  } else if (paragraphFocus === 'adaptability') {
    paragraph = `${transition} navigating ${themeLabel.toLowerCase()} required quickly mastering new domains and methodologies. `;
  } else {
    paragraph = `${transition} my work in ${themeLabel.toLowerCase()} demonstrates the breadth of experience I bring. `;
  }
  
  // Emphasize learning and transfer
  themeEntries.slice(0, 2).forEach((analyzed, idx) => {
    const { entry, metrics, beneficiaries } = analyzed;
    const action = entry.whatYouDid || '';
    const result = entry.problemSolved || '';
    
    if (idx === 0) {
      if (paragraphFocus === 'skills') {
        paragraph += `Through ${action.toLowerCase()}, I developed expertise in areas that transfer directly to the target role`;
        if (result) {
          paragraph += `, demonstrated by ${result.toLowerCase()}`;
        }
        paragraph += '. ';
      } else if (paragraphFocus === 'adaptability') {
        const resultPhrase = verbTracker.getResultPhrase('role-change');
        paragraph += `When faced with this challenge, I ${resultPhrase} ${action.toLowerCase()}`;
        if (metrics.length > 0) {
          paragraph += `, achieving ${metrics[0]}`;
        }
        paragraph += '. ';
      } else {
        if (beneficiaries.length > 0) {
          paragraph += `Working with ${formatList(beneficiaries)}, I ${action.toLowerCase()}`;
          if (result) {
            paragraph += `, ${result.toLowerCase()}`;
          }
          paragraph += '—showcasing cross-functional collaboration skills. ';
        } else {
          paragraph += `By ${action.toLowerCase()}, I expanded my professional toolkit`;
          if (result) {
            paragraph += ` and ${result.toLowerCase()}`;
          }
          paragraph += '. ';
        }
      }
    } else {
      const secondaryVerb = verbTracker.getVerb('role-change', tone, 'secondary');
      paragraph += `Building on this, I ${secondaryVerb} additional competencies that enhance readiness for new challenges. `;
    }
  });
  
  return paragraph.trim();
}

/**
 * =============================================================================
 * CLOSING PARAGRAPH BUILDERS
 * =============================================================================
 * 
 * Closing paragraphs wrap up the narrative with type-appropriate conclusions:
 * - Review: Reflection on growth and looking ahead
 * - Promotion: Forward-looking statement about continued growth
 * - Role-Change: Enthusiasm for applying skills to new challenges
 */

function buildReviewClosing(
  beneficiaries: string[],
  tone: NarrativeTone
): string {
  let closing = '';
  
  if (beneficiaries.length > 0) {
    closing = `Effective partnerships with ${formatList(beneficiaries.slice(0, 3))} enabled consistent delivery throughout the period. `;
  }
  
  closing += 'This body of work reflects reliable execution and meaningful contribution to team and organizational goals. ';
  closing += 'Looking ahead, I am positioned to build on these foundations while continuing to grow in areas of strategic importance.';
  
  return closing;
}

function buildPromotionClosing(
  beneficiaries: string[],
  allMetrics: string[],
  tone: NarrativeTone
): string {
  let closing = '';
  
  if (beneficiaries.length > 0) {
    closing = `Strategic relationships with ${formatList(beneficiaries.slice(0, 3))} demonstrate the stakeholder management and influence essential for senior leadership. `;
  }
  
  closing += 'The pattern of increasing scope, complexity, and independent ownership establishes clear readiness to operate at the next level. ';
  closing += 'I am prepared to take on expanded responsibility and continue driving outsized impact for the organization.';
  
  return closing;
}

function buildRoleChangeClosing(
  beneficiaries: string[],
  themes: Map<string, { entries: AnalyzedEntry[]; label: string }>,
  tone: NarrativeTone
): string {
  let closing = '';
  
  if (beneficiaries.length > 0) {
    closing = `Diverse collaborations with ${formatList(beneficiaries.slice(0, 3))} have built the cross-functional fluency essential for navigating new domains. `;
  }
  
  const themeLabels = Array.from(themes.values()).map(t => t.label.toLowerCase());
  if (themeLabels.length > 0) {
    closing += `My trajectory across ${formatList(themeLabels)} shows consistent ability to learn rapidly, adapt to new contexts, and deliver value in unfamiliar territory. `;
  } else {
    closing += 'My trajectory shows consistent ability to learn rapidly, adapt to new contexts, and deliver value in unfamiliar territory. ';
  }
  
  closing += 'I am enthusiastic about applying this foundation of versatile excellence to new challenges and continued growth.';
  
  return closing;
}

/**
 * =============================================================================
 * UTILITY FUNCTIONS
 * =============================================================================
 */

/**
 * Format a list of items with proper grammar (Oxford comma).
 */
function formatList(items: string[]): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

/**
 * =============================================================================
 * MAIN NARRATIVE GENERATION FUNCTION
 * =============================================================================
 * 
 * This is the primary entry point for narrative generation.
 * It orchestrates the entire process:
 * 1. Analyze all entries for metrics, beneficiaries, themes
 * 2. Build type-specific opening, body, and closing paragraphs
 * 3. Assemble into flowing prose narrative (3-5 paragraphs, 200-300 words)
 */
export function generateNarrative(
  entries: ImpactEntry[], 
  type: NarrativeType,
  tone: NarrativeTone
): string {
  // Handle empty input gracefully
  if (entries.length === 0) {
    return "No impact entries found. Start capturing your wins to generate compelling narratives for your career moments.";
  }

  // Analyze all entries
  const analyzedEntries = entries.map(analyzeEntry);
  
  // Group by theme and collect aggregates
  const themes = groupEntriesByTheme(analyzedEntries);
  const beneficiaries = collectBeneficiaries(analyzedEntries);
  const allMetrics = collectAllMetrics(analyzedEntries);
  
  // Sort themes by entry count for prioritization
  const sortedThemes = Array.from(themes.entries())
    .sort((a, b) => b[1].entries.length - a[1].entries.length)
    .slice(0, 3); // Focus on top 3 themes
  
  // Initialize verb tracker for variety
  const verbTracker = new VerbTracker();
  
  // Build type-specific paragraphs
  let opening: string;
  let bodyParagraphs: string[];
  let closing: string;
  
  if (type === 'review') {
    /**
     * PERFORMANCE REVIEW STRUCTURE:
     * 1. Overview of review period contributions
     * 2-3. Deep dive into key impact areas
     * 4. Cross-functional collaboration
     * 5. Growth and development (in closing)
     */
    opening = buildReviewOpening(analyzedEntries, themes, allMetrics, beneficiaries);
    
    bodyParagraphs = sortedThemes.map(([_, themeData]) => 
      buildReviewBodyParagraph(themeData.label, themeData.entries, verbTracker, tone)
    ).filter(Boolean);
    
    closing = buildReviewClosing(beneficiaries, tone);
    
  } else if (type === 'promotion') {
    /**
     * PROMOTION CASE STRUCTURE:
     * 1. Opening thesis for promotion readiness
     * 2. Evidence of operating at next level
     * 3. Scope and complexity demonstration
     * 4. Leadership and influence
     * 5. Future vision (in closing)
     */
    opening = buildPromotionOpening(analyzedEntries, themes, allMetrics, beneficiaries);
    
    const focuses: ('evidence' | 'scope' | 'leadership')[] = ['evidence', 'scope', 'leadership'];
    bodyParagraphs = sortedThemes.map(([_, themeData], idx) => 
      buildPromotionBodyParagraph(themeData.label, themeData.entries, verbTracker, tone, focuses[idx % focuses.length])
    ).filter(Boolean);
    
    closing = buildPromotionClosing(beneficiaries, allMetrics, tone);
    
  } else {
    /**
     * ROLE-CHANGE STRUCTURE:
     * 1. Professional journey opening
     * 2. Transferable skills with examples
     * 3. Adaptability and learning
     * 4. Cross-functional breadth
     * 5. Enthusiasm for new challenges (in closing)
     */
    opening = buildRoleChangeOpening(analyzedEntries, themes, allMetrics, beneficiaries);
    
    const focuses: ('skills' | 'adaptability' | 'breadth')[] = ['skills', 'adaptability', 'breadth'];
    bodyParagraphs = sortedThemes.map(([_, themeData], idx) => 
      buildRoleChangeBodyParagraph(themeData.label, themeData.entries, verbTracker, tone, focuses[idx % focuses.length])
    ).filter(Boolean);
    
    closing = buildRoleChangeClosing(beneficiaries, themes, tone);
  }

  // Build title based on type
  let title = '';
  if (type === 'review') {
    title = '## Performance Review Summary';
  } else if (type === 'promotion') {
    title = '## Promotion Case';
  } else {
    title = '## Role Transition Narrative';
  }

  // Assemble final narrative with proper paragraph separation
  return `${title}\n\n${opening}\n\n${bodyParagraphs.join('\n\n')}\n\n${closing}`;
}
