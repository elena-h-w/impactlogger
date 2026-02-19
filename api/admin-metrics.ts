import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Replace with your actual email address
const ADMIN_EMAIL = 'elenawong1031@gmail.com';

function getSupabaseAdmin() {
  return createClient(
    process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function authenticateAdmin(req: VercelRequest): Promise<boolean> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return false;

  const token = authHeader.replace('Bearer ', '');
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) return false;
  return data.user.email === ADMIN_EMAIL;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const isAdmin = await authenticateAdmin(req);
  if (!isAdmin) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const supabase = getSupabaseAdmin();
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Total users
    const { data: usersData } = await supabase.auth.admin.listUsers();
    const totalUsers = usersData?.users?.length || 0;

    // All generations
    const { data: allGenerations } = await supabase
      .from('generations')
      .select('*')
      .order('created_at', { ascending: true });

    const generations = allGenerations || [];
    const totalGenerations = generations.length;

    // Active users (7d) — users who generated in last 7 days
    const recentGenerations = generations.filter(
      (g) => new Date(g.created_at) >= sevenDaysAgo
    );
    const activeUsers7d = new Set(recentGenerations.map((g) => g.user_id)).size;

    // Avg cost per generation
    const totalCost = generations.reduce((sum, g) => sum + (parseFloat(g.cost_usd) || 0), 0);
    const avgCost = totalGenerations > 0 ? totalCost / totalGenerations : 0;

    // Month-to-date spend
    const mtdGenerations = generations.filter(
      (g) => new Date(g.created_at) >= monthStart
    );
    const mtdSpend = mtdGenerations.reduce((sum, g) => sum + (parseFloat(g.cost_usd) || 0), 0);

    // Repeat usage % — users with more than 1 generation
    const userGenCounts: Record<string, number> = {};
    generations.forEach((g) => {
      userGenCounts[g.user_id] = (userGenCounts[g.user_id] || 0) + 1;
    });
    const usersWithGenerations = Object.keys(userGenCounts).length;
    const repeatUsers = Object.values(userGenCounts).filter((c) => c > 1).length;
    const repeatRate = usersWithGenerations > 0 ? repeatUsers / usersWithGenerations : 0;

    // Generations per day (last 30 days)
    const dailyData: Record<string, { generations: number; cost: number; inputTokens: number; outputTokens: number }> = {};
    generations
      .filter((g) => new Date(g.created_at) >= thirtyDaysAgo)
      .forEach((g) => {
        const day = new Date(g.created_at).toISOString().split('T')[0];
        if (!dailyData[day]) {
          dailyData[day] = { generations: 0, cost: 0, inputTokens: 0, outputTokens: 0 };
        }
        dailyData[day].generations += 1;
        dailyData[day].cost += parseFloat(g.cost_usd) || 0;
        dailyData[day].inputTokens += g.input_tokens || 0;
        dailyData[day].outputTokens += g.output_tokens || 0;
      });

    // Fill in missing days
    const chartData = [];
    for (let d = new Date(thirtyDaysAgo); d <= now; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().split('T')[0];
      chartData.push({
        date: key,
        generations: dailyData[key]?.generations || 0,
        cost: Math.round((dailyData[key]?.cost || 0) * 1000000) / 1000000,
        inputTokens: dailyData[key]?.inputTokens || 0,
        outputTokens: dailyData[key]?.outputTokens || 0,
      });
    }

    // Top users (anonymized)
    const topUsers = Object.entries(userGenCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([userId, count], index) => ({
        label: `User ${index + 1}`,
        generations: count,
      }));

    return res.status(200).json({
      totalUsers,
      activeUsers7d,
      totalGenerations,
      avgCost: Math.round(avgCost * 1000000) / 1000000,
      mtdSpend: Math.round(mtdSpend * 100) / 100,
      totalSpend: Math.round(totalCost * 100) / 100,
      repeatRate: Math.round(repeatRate * 100),
      chartData,
      topUsers,
    });
  } catch (error: any) {
    console.error('Admin metrics error:', error);
    return res.status(500).json({ error: 'Failed to fetch metrics' });
  }
}
