import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Users, Activity, Zap, DollarSign, Repeat, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

// Replace with your actual admin email
const ADMIN_EMAIL = 'elenawong1031@gmail.com';

const API_URL = import.meta.env.PROD
  ? '/api/admin-metrics'
  : 'http://localhost:3000/api/admin-metrics';

interface Metrics {
  totalUsers: number;
  activeUsers7d: number;
  totalGenerations: number;
  avgCost: number;
  mtdSpend: number;
  totalSpend: number;
  repeatRate: number;
  chartData: {
    date: string;
    generations: number;
    cost: number;
    inputTokens: number;
    outputTokens: number;
  }[];
  topUsers: { label: string; generations: number }[];
}

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || user.email !== ADMIN_EMAIL)) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user || user.email !== ADMIN_EMAIL) return;

    const fetchMetrics = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) throw new Error('No session');

        const response = await fetch(API_URL, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });

        if (!response.ok) throw new Error('Failed to fetch metrics');
        const data = await response.json();
        setMetrics(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-destructive">{error || 'Failed to load metrics'}</p>
      </div>
    );
  }

  const maxGenerations = Math.max(...metrics.chartData.map((d) => d.generations), 1);
  const maxCost = Math.max(...metrics.chartData.map((d) => d.cost), 0.001);
  const maxTopUser = Math.max(...metrics.topUsers.map((u) => u.generations), 1);

  // Only show days with activity for cleaner charts
  const activeDays = metrics.chartData.filter((d) => d.generations > 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Impact Logger metrics — last updated {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 mb-8">
          <KPICard
            title="Total Users"
            value={metrics.totalUsers.toString()}
            subtitle="registered accounts"
            icon={Users}
            index={0}
          />
          <KPICard
            title="Active Users (7d)"
            value={metrics.activeUsers7d.toString()}
            subtitle="generated narratives"
            icon={Activity}
            index={1}
          />
          <KPICard
            title="Total Generations"
            value={metrics.totalGenerations.toString()}
            subtitle="narratives created"
            icon={Zap}
            index={2}
          />
          <KPICard
            title="Avg Cost / Generation"
            value={`$${metrics.avgCost.toFixed(4)}`}
            subtitle="per API call"
            icon={DollarSign}
            index={3}
          />
          <KPICard
            title="Spend (MTD)"
            value={`$${metrics.mtdSpend.toFixed(2)}`}
            subtitle={`$${metrics.totalSpend.toFixed(2)} total`}
            icon={TrendingUp}
            index={4}
          />
          <KPICard
            title="Repeat Usage"
            value={`${metrics.repeatRate}%`}
            subtitle="users with 2+ generations"
            icon={Repeat}
            index={5}
          />
        </div>

        {/* Charts */}
        <div className="space-y-6">
          {/* Generations Over Time */}
          {activeDays.length > 0 && (
            <Card className="gradient-card shadow-card border border-border/50">
              <CardContent className="p-5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                  Generations Over Time (30d)
                </h3>
                <div className="space-y-2">
                  {activeDays.map((day, i) => (
                    <motion.div
                      key={day.date}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03, duration: 0.3 }}
                      className="flex items-center gap-3"
                    >
                      <span className="w-[72px] text-xs font-medium text-muted-foreground text-right shrink-0 tabular-nums">
                        {formatDate(day.date)}
                      </span>
                      <div className="flex-1 h-6 bg-muted/30 rounded overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(day.generations / maxGenerations) * 100}%` }}
                          transition={{ delay: i * 0.03 + 0.2, duration: 0.6, ease: 'easeOut' }}
                          className="h-full rounded bg-accent/60"
                        />
                      </div>
                      <span className="w-6 text-xs font-bold text-foreground text-right tabular-nums">
                        {day.generations}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cost Over Time */}
          {activeDays.length > 0 && (
            <Card className="gradient-card shadow-card border border-border/50">
              <CardContent className="p-5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                  Cost Over Time (30d)
                </h3>
                <div className="space-y-2">
                  {activeDays.map((day, i) => (
                    <motion.div
                      key={day.date}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03, duration: 0.3 }}
                      className="flex items-center gap-3"
                    >
                      <span className="w-[72px] text-xs font-medium text-muted-foreground text-right shrink-0 tabular-nums">
                        {formatDate(day.date)}
                      </span>
                      <div className="flex-1 h-6 bg-muted/30 rounded overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(day.cost / maxCost) * 100}%` }}
                          transition={{ delay: i * 0.03 + 0.2, duration: 0.6, ease: 'easeOut' }}
                          className="h-full rounded bg-emerald-500/60"
                        />
                      </div>
                      <span className="w-16 text-xs font-bold text-foreground text-right tabular-nums">
                        ${day.cost.toFixed(4)}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Top Users */}
          {metrics.topUsers.length > 0 && (
            <Card className="gradient-card shadow-card border border-border/50">
              <CardContent className="p-5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                  Top Users by Generations
                </h3>
                <div className="space-y-2.5">
                  {metrics.topUsers.map((u, i) => (
                    <motion.div
                      key={u.label}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05, duration: 0.3 }}
                      className="flex items-center gap-3"
                    >
                      <span className="w-[72px] text-xs font-medium text-muted-foreground text-right shrink-0">
                        {u.label}
                      </span>
                      <div className="flex-1 h-6 bg-muted/30 rounded overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(u.generations / maxTopUser) * 100}%` }}
                          transition={{ delay: i * 0.05 + 0.2, duration: 0.6, ease: 'easeOut' }}
                          className="h-full rounded bg-violet-500/60"
                        />
                      </div>
                      <span className="w-6 text-xs font-bold text-foreground text-right tabular-nums">
                        {u.generations}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Empty state */}
          {metrics.totalGenerations === 0 && (
            <Card className="gradient-card shadow-card border border-border/50">
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No generations yet. Charts will appear once users start generating narratives.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper: format date as "Feb 18"
function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// KPI Card sub-component
function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  index,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Card className="gradient-card shadow-card border border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">{title}</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
