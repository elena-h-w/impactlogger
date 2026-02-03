import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Calendar, Users, Lightbulb, FileText, Trash2 } from 'lucide-react';
import { ImpactEntry } from '@/types/impact';
import { ImpactTag } from './ImpactTag';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ImpactCardProps {
  entry: ImpactEntry;
  index?: number;
  onDelete?: () => void;
}

export function ImpactCard({ entry, index = 0, onDelete }: ImpactCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Card className="group gradient-card shadow-card hover:shadow-hover transition-all duration-300 border border-border/50 relative">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Week of {format(entry.weekOf, 'MMM d, yyyy')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex flex-wrap gap-1.5 justify-end">
                {entry.tags.map((tag) => (
                  <ImpactTag key={tag} tag={tag} />
                ))}
              </div>
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          
          <h3 className="text-base font-semibold text-foreground mb-3 line-clamp-2 group-hover:text-accent transition-colors">
            {entry.whatYouDid}
          </h3>
          
          <div className="space-y-2.5 text-sm">
            <div className="flex items-start gap-2.5">
              <Users className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <span className="text-muted-foreground">{entry.whoBenefited}</span>
            </div>
            <div className="flex items-start gap-2.5">
              <Lightbulb className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <span className="text-muted-foreground">{entry.problemSolved}</span>
            </div>
            {entry.evidence && (
              <div className="flex items-start gap-2.5">
                <FileText className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <span className="text-muted-foreground line-clamp-1">{entry.evidence}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
