import { motion } from 'framer-motion';
import { Inbox, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  onAddClick: () => void;
}

export function EmptyState({ onAddClick }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <div className="p-4 rounded-2xl bg-accent/10 mb-5">
        <Inbox className="h-10 w-10 text-accent" />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">
        No impact captured yet
      </h3>
      <p className="text-muted-foreground max-w-sm mb-6">
        Start documenting your wins. Each entry becomes evidence you can use for reviews, promotions, or role changes.
      </p>
      <Button onClick={onAddClick} className="gradient-amber text-accent-foreground shadow-amber hover:opacity-90">
        <Plus className="h-4 w-4 mr-2" />
        Capture Your First Win
      </Button>
    </motion.div>
  );
}
