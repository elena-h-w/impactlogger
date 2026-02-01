import { motion } from 'framer-motion';
import { Shield, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
interface HeaderProps {
  onGenerateClick: () => void;
  hasEntries: boolean;
}
export function Header({
  onGenerateClick,
  hasEntries
}: HeaderProps) {
  return <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <motion.div initial={{
        opacity: 0,
        x: -12
      }} animate={{
        opacity: 1,
        x: 0
      }} className="flex items-center gap-3">
          <div className="p-2 rounded-lg gradient-amber shadow-amber">
            <Shield className="h-5 w-5 text-accent-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Reputation Builder</h1>
            <p className="text-xs text-muted-foreground -mt-0.5">Your private evidence system</p>
          </div>
        </motion.div>

        <motion.div initial={{
        opacity: 0,
        x: 12
      }} animate={{
        opacity: 1,
        x: 0
      }}>
          <Button onClick={onGenerateClick} disabled={!hasEntries} variant="outline" className="gap-2 hover:border-accent hover:text-accent transition-colors">
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">Generate Narrative</span>
            <span className="sm:hidden">Generate</span>
          </Button>
        </motion.div>
      </div>
    </header>;
}