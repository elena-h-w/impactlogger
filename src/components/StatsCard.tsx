import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  accent?: boolean;
  index?: number;
}

export function StatsCard({ title, value, subtitle, icon: Icon, accent, index = 0 }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      className={cn(
        'relative overflow-hidden rounded-xl p-5 transition-all duration-300',
        accent 
          ? 'gradient-amber text-accent-foreground shadow-amber' 
          : 'gradient-card border border-border/50 shadow-card hover:shadow-hover'
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className={cn(
            'text-sm font-medium',
            accent ? 'text-accent-foreground/80' : 'text-muted-foreground'
          )}>
            {title}
          </p>
          <p className={cn(
            'text-3xl font-bold mt-1',
            accent ? 'text-accent-foreground' : 'text-foreground'
          )}>
            {value}
          </p>
          {subtitle && (
            <p className={cn(
              'text-xs mt-1',
              accent ? 'text-accent-foreground/70' : 'text-muted-foreground'
            )}>
              {subtitle}
            </p>
          )}
        </div>
        <div className={cn(
          'p-2 rounded-lg',
          accent ? 'bg-white/20' : 'bg-accent/10'
        )}>
          <Icon className={cn(
            'h-5 w-5',
            accent ? 'text-accent-foreground' : 'text-accent'
          )} />
        </div>
      </div>
    </motion.div>
  );
}
