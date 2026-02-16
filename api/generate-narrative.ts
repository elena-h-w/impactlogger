import type { VercelRequest, VercelResponse } from '@vercel/node';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

const DAILY_LIMIT = 5;
const MAX_IMPACTS = 20;

// Supabase admin client (uses service role key to bypass RLS)
function getSupabaseAdmin() {
  return createClient(
    process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Verify the user's JWT and return their user ID
async function authenticateUser(req: VercelRequest): Promise<string | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return null;

  const token = authHeader.replace('Bearer ', '');
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) return null;
  return data.user.id;
}

// Check if user has exceeded daily limit
async function checkRateLimit(userId: string): Promise<{ allowed: boolean; used: number }> {
  const supabase = getSupabaseAdmin();

  // Count today's usage
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { count, error } = await supabase
    .from('narrative_usage')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', todayStart.toISOString());

  const used = count || 0;
  return { allowed: used < DAILY_LIMIT, used };
}

// Record a usage
async function recordUsage(userId: string) {
  const supabase = getSupabaseAdmin();
  await supabase.from('narrative_usage').insert({ user_id: userId });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 1. Authenticate user
    const userId = await authenticateUser(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized. Please log in.' });
    }

    // 2. Check rate limit
    const { allowed, used } = await checkRateLimit(userId);
    if (!allowed) {
      return res.status(429).json({
        error: `Daily limit reached (${DAILY_LIMIT} per day). Try again tomorrow.`,
        used,
        limit: DAILY_LIMIT,
      });
    }

    const { impacts, type, tone } = req.body;

    if (!impacts || !type || !tone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // 3. Cap input size
    const cappedImpacts = Array.isArray(impacts) ? impacts.slice(0, MAX_IMPACTS) : [];
    if (cappedImpacts.length === 0) {
      return res.status(400).json({ error: 'No impacts provided' });
    }

    // Initialize Anthropic
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    });

    // Format impacts for prompt
    const impactsText = cappedImpacts.map((entry: any, index: number) => {
      const tags = entry.tags?.join(', ') || 'None';
      const stakeholders = entry.stakeholders?.join(', ') || 'None';
      
      return `
Impact #${index + 1}:
- What I did: ${entry.whatYouDid}
- Who benefited: ${stakeholders}
- Result: ${entry.result}
- Evidence: ${entry.evidence || 'Not specified'}
- Tags: ${tags}
`;
    }).join('\n');

    const toneDescriptions: Record<string, string> = {
      'results': 'Emphasizes metrics, outcomes, and business impact',
      'leadership': 'Highlights influence, strategy, and team development',
      'technical': 'Showcases expertise, innovation, and problem-solving',
      'balanced': 'Mix of results, leadership, and technical achievements'
    };

    const toneDesc = toneDescriptions[tone] || toneDescriptions['balanced'];

    let prompt = '';
    let maxTokens = 1000;

    if (type === 'review') {
      prompt = `You are writing a performance review summary for a professional based on their documented achievements.

IMPACTS:
${impactsText}

INSTRUCTIONS:
Write a compelling 300-word performance review summary that:

1. OPENING (2-3 sentences): Lead with the most impressive achievement and overall impact theme

2. BODY (2-3 paragraphs): Deep dive into specific achievements with:
   - Concrete details and metrics
   - Who benefited and how
   - Cross-functional collaboration
   
3. CLOSING (1-2 sentences): Forward-looking statement about continued growth

WRITING STYLE:
- First person, active voice ("I launched..." not "successfully delivered")
- Professional but conversational
- Specific and concrete, no vague corporate jargon
- NEVER repeat the same phrase twice
- Vary sentence structure

TONE: ${toneDesc}

BANNED PHRASES (never use):
- "delivering tangible value to the organization"
- "sustained, high-quality contributions"
- "this directly benefited"
- "positioned to build on foundations"
- "meaningful contribution"

Write ONLY the narrative, no preamble or explanation.`;
    } else if (type === 'promotion') {
      maxTokens = 1200;
      prompt = `You are writing a promotion case document based on documented achievements.

IMPACTS:
${impactsText}

INSTRUCTIONS:
Write a compelling 350-word promotion case that:

1. OPENING (thesis statement): "I am ready for [next level] because..."

2. EVIDENCE (2-3 paragraphs):
   - 2-3 concrete examples of operating at next level
   - Scope, complexity, and strategic thinking beyond current role
   - Leadership and influence on others/teams
   - Pattern of increasing responsibility

3. CLOSING (forward-looking): Continued growth and readiness for new challenges

WRITING STYLE:
- First person, assertive voice
- Present perfect tense showing ongoing capability
- Use phrases like: "demonstrated readiness", "already operating at", "established myself as"
- Specific examples with metrics
- No repetition

TONE: ${toneDesc}

Focus on WHY the person deserves promotion NOW, not just what they accomplished.

Write ONLY the narrative, no preamble or explanation.`;
    } else {
      prompt = `You are writing a role-change narrative showcasing transferable skills and adaptability.

IMPACTS:
${impactsText}

INSTRUCTIONS:
Write a compelling 300-word role-change narrative that:

1. OPENING: Story of professional evolution and skill development

2. BODY (2-3 paragraphs):
   - Transferable skills with concrete examples
   - Examples of adaptability and learning new domains
   - Cross-functional experience and breadth
   - "When faced with X, I quickly learned Y"

3. CLOSING: Readiness and enthusiasm for new challenges

WRITING STYLE:
- First person, adaptive voice
- Progressive tense showing growth trajectory
- Use phrases like: "evolved from... to...", "expanded skillset", "applied expertise in new contexts"
- Show versatility and learning agility
- No repetition

TONE: ${toneDesc}

Focus on HOW the person has transformed and is ready for a different role.

Write ONLY the narrative, no preamble or explanation.`;
    }

    // Call Claude API
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    // 4. Record usage AFTER successful generation
    await recordUsage(userId);

    const content = message.content[0];
    if (content.type === 'text') {
      return res.status(200).json({ narrative: content.text });
    }

    throw new Error('Unexpected response format from Claude');

  } catch (error: any) {
    console.error('Error generating narrative:', error);
    return res.status(500).json({ 
      error: 'Failed to generate narrative', 
      details: error.message 
    });
  }
}