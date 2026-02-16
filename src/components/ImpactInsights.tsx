import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, TrendingUp, Users, BarChart3 } from 'lucide-react';
import { ImpactEntry, AnyTag, IMPACT_TAG_CONFIG, ImpactTag as ImpactTagType, getTagConfig } from '@/types/impact';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ImpactInsightsProps {
  entries: ImpactEntry[];
}

export function ImpactInsights({ entries }: ImpactInsightsProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Tag distribution data
  const tagData = useMemo(() => {
    const counts: Record<string, number> = {};
    entries.forEach(entry => {
      entry.tags.forEach(tag => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .map(([tag, count]) => ({
        tag,
        count,
        config: getTagConfig(tag),
      }))
      .sort((a, b) => b.count - a.count);
  }, [entries]);

  // Stakeholder frequency data
  const stakeholderData = useMemo(() => {
    const counts: Record<string, number> = {};
    entries.forEach(entry => {
      const benefited = entry.whoBenefited?.trim();
      if (benefited) {
        // Split by common delimiters to count individual stakeholders
        const stakeholders = benefited.split(/[,;&]+/).map(s => s.trim()).filter(Boolean);
        stakeholders.forEach(s => {
          counts[s] = (counts[s] || 0) + 1;
        });
      }
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8); // Top 8
  }, [entries]);

  const maxTagCount = Math.max(...tagData.map(d => d.count), 1);
  const maxStakeholderCount = Math.max(...stakeholderData.map(d => d.count), 1);

  // Determine strengths and gaps
  const strengths = tagData.slice(0, 3);
  const gaps = tagData.length > 3
    ? [...tagData].sort((a, b) => a.count - b.count).slice(0, 2)
    : [];

  if (entries.length < 2) return null; // Don't show insights with fewer than 2 entries

  return (
    <Card className="gradient-card shadow-card border border-border/50 overflow-hidden">
      <button
        onClick={() => setIsExpanded(prev => !prev)}
        className="w-full flex items-center justify-between p-5 pb-0 text-left hover:opacity-80 transition-opacity"
      >
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-accent" />
          <h3 className="text-lg font-semibold text-foreground">Impact Insights</h3>
          <span className="text-xs text-muted-foreground ml-1">
            Based on {entries.length} entries
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <CardContent className="p-5 pt-4 space-y-6">
              {/* Strength & Gap Badges */}
              {(strengths.length > 0 || gaps.length > 0) && (
                <div className="flex flex-wrap gap-2">
                  {strengths.map(s => (
                    <span
                      key={`strength-${s.tag}`}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                    >
                      <TrendingUp className="h-3 w-3" />
                      {s.config.label} ({s.count})
                    </span>
                  ))}
                  {gaps.map(g => (
                    <span
                      key={`gap-${g.tag}`}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20"
                    >
                      Gap: {g.config.label} ({g.count})
                    </span>
                  ))}
                </div>
              )}

              {/* Tag Distribution */}
              {tagData.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                    Strength Areas
                  </h4>
                  <div className="space-y-2.5">
                    {tagData.map((item, i) => (
                      <motion.div
                        key={item.tag}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05, duration: 0.3 }}
                        className="flex items-center gap-3"
                      >
                        <span className="w-[100px] text-xs font-medium text-muted-foreground text-right truncate shrink-0">
                          {item.config.label}
                        </span>
                        <div className="flex-1 h-6 bg-muted/30 rounded overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(item.count / maxTagCount) * 100}%` }}
                            transition={{ delay: i * 0.05 + 0.2, duration: 0.6, ease: 'easeOut' }}
                            className={cn(
                              "h-full rounded",
                              // Use the tag's own color for default tags, accent for custom
                              item.tag in IMPACT_TAG_CONFIG
                                ? getBarColor(item.tag as ImpactTagType)
                                : "bg-accent/60"
                            )}
                          />
                        </div>
                        <span className="w-6 text-xs font-bold text-foreground text-right tabular-nums">
                          {item.count}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stakeholder Frequency */}
              {stakeholderData.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                    Stakeholder Relationships
                  </h4>
                  <div className="space-y-2.5">
                    {stakeholderData.map((item, i) => (
                      <motion.div
                        key={item.name}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05, duration: 0.3 }}
                        className="flex items-center gap-3"
                      >
                        <span className="w-[100px] text-xs font-medium text-muted-foreground text-right truncate shrink-0" title={item.name}>
                          {item.name}
                        </span>
                        <div className="flex-1 h-6 bg-muted/30 rounded overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(item.count / maxStakeholderCount) * 100}%` }}
                            transition={{ delay: i * 0.05 + 0.2, duration: 0.6, ease: 'easeOut' }}
                            className="h-full rounded bg-accent/60"
                          />
                        </div>
                        <span className="w-6 text-xs font-bold text-foreground text-right tabular-nums">
                          {item.count}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

// Map default tags to Tailwind bar colors
function getBarColor(tag: ImpactTagType): string {
  const colorMap: Record<ImpactTagType, string> = {
    'revenue': 'bg-emerald-500/70',
    'risk-reduction': 'bg-blue-500/70',
    'speed': 'bg-amber-500/70',
    'efficiency': 'bg-violet-500/70',
    'quality': 'bg-rose-500/70',
    'alignment': 'bg-cyan-500/70',
    'leadership': 'bg-orange-500/70',
    'visibility': 'bg-pink-500/70',
    'engagement': 'bg-teal-500/70',
  };
  return colorMap[tag] || 'bg-accent/60';
}
