import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Briefcase, ArrowUpRight, Copy, Check, Sparkles } from 'lucide-react';
import { ImpactEntry, IMPACT_TAG_CONFIG } from '@/types/impact';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface GenerateNarrativeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entries: ImpactEntry[];
}

type NarrativeType = 'review' | 'promotion' | 'role-change';

const narrativeOptions: { type: NarrativeType; title: string; description: string; icon: React.ReactNode }[] = [
  {
    type: 'review',
    title: 'Performance Review Summary',
    description: 'A concise overview of your key contributions and impact for review discussions.',
    icon: <FileText className="h-5 w-5" />,
  },
  {
    type: 'promotion',
    title: 'Promotion Case',
    description: 'Evidence-based bullets showcasing leadership, growth, and organizational impact.',
    icon: <ArrowUpRight className="h-5 w-5" />,
  },
  {
    type: 'role-change',
    title: 'Role-Change Narrative',
    description: 'A story of your evolution, transferable skills, and readiness for new challenges.',
    icon: <Briefcase className="h-5 w-5" />,
  },
];

function generateOutcomeBullet(entry: ImpactEntry): string {
  // Transform entry into polished, outcome-focused bullet
  const result = entry.problemSolved?.trim();
  const beneficiary = entry.whoBenefited?.trim();
  const action = entry.whatYouDid?.trim();
  
  // Build a concise outcome-focused statement
  if (result && beneficiary) {
    return `Drove ${result.toLowerCase().replace(/^reduced|improved|increased|enabled/i, (m) => m.toLowerCase())} for ${beneficiary}`;
  } else if (result) {
    return `Delivered ${result.charAt(0).toLowerCase() + result.slice(1)}`;
  } else if (action && beneficiary) {
    return `${action} — enabling ${beneficiary} to operate more effectively`;
  }
  return action || '';
}

function groupEntriesByTheme(entries: ImpactEntry[]): Map<string, ImpactEntry[]> {
  const themes = new Map<string, ImpactEntry[]>();
  
  entries.forEach(entry => {
    // Use primary tag as theme, or 'General' if no tags
    const theme = entry.tags[0] 
      ? IMPACT_TAG_CONFIG[entry.tags[0] as keyof typeof IMPACT_TAG_CONFIG]?.label || 'General'
      : 'General';
    
    if (!themes.has(theme)) {
      themes.set(theme, []);
    }
    themes.get(theme)!.push(entry);
  });
  
  return themes;
}

function generateNarrative(entries: ImpactEntry[], type: NarrativeType): string {
  if (entries.length === 0) {
    return "No impact entries found. Start capturing your wins to generate narratives.";
  }

  const themes = groupEntriesByTheme(entries);
  const uniqueStakeholders = [...new Set(entries.map(e => e.whoBenefited).filter(Boolean))];
  
  // Generate polished bullets grouped by theme
  const themedBullets: string[] = [];
  themes.forEach((themeEntries, themeName) => {
    if (themeEntries.length >= 2) {
      // Combine related entries into one stronger bullet
      const combinedOutcomes = themeEntries
        .slice(0, 2)
        .map(e => e.problemSolved?.trim())
        .filter(Boolean)
        .join(' and ');
      if (combinedOutcomes) {
        themedBullets.push(`• ${themeName}: ${combinedOutcomes}`);
      } else {
        themedBullets.push(`• ${generateOutcomeBullet(themeEntries[0])}`);
      }
    } else {
      themedBullets.push(`• ${generateOutcomeBullet(themeEntries[0])}`);
    }
  });

  // Build individual outcome bullets for remaining entries
  const individualBullets = entries
    .slice(0, 6)
    .map(generateOutcomeBullet)
    .filter(b => b.length > 0)
    .map(b => `• ${b}`);

  if (type === 'review') {
    return `## Performance Review Summary

${individualBullets.join('\n')}

**Cross-functional reach:** ${uniqueStakeholders.slice(0, 4).join(', ') || 'Multiple teams'}`;
  }

  if (type === 'promotion') {
    return `## Promotion Case

**Key contributions demonstrating readiness:**

${individualBullets.join('\n')}

**Scope of influence:** Delivered outcomes benefiting ${uniqueStakeholders.slice(0, 3).join(', ') || 'multiple stakeholders'}, demonstrating ability to operate at the next level.`;
  }

  return `## Role Transition Narrative

**Demonstrated capabilities:**

${individualBullets.join('\n')}

**Transferable impact:** Built credibility across ${uniqueStakeholders.length || 'multiple'} stakeholder groups with documented, measurable outcomes.`;
}

export function GenerateNarrativeModal({ open, onOpenChange, entries }: GenerateNarrativeModalProps) {
  const [selectedType, setSelectedType] = useState<NarrativeType | null>(null);
  const [generatedNarrative, setGeneratedNarrative] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async (type: NarrativeType) => {
    setSelectedType(type);
    setIsGenerating(true);
    
    // Simulate AI generation delay
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    const narrative = generateNarrative(entries, type);
    setGeneratedNarrative(narrative);
    setIsGenerating(false);
  };

  const handleCopy = async () => {
    if (generatedNarrative) {
      await navigator.clipboard.writeText(generatedNarrative);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleBack = () => {
    setSelectedType(null);
    setGeneratedNarrative(null);
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setSelectedType(null);
      setGeneratedNarrative(null);
    }, 200);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            {selectedType ? 'Your Narrative' : 'Generate Narrative'}
          </DialogTitle>
          <DialogDescription>
            {selectedType 
              ? 'Based on your captured impact, here\'s your evidence-based narrative.'
              : 'Transform your impact log into compelling narratives for key career moments.'}
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {!selectedType ? (
            <motion.div
              key="options"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid gap-3 py-4"
            >
              {narrativeOptions.map((option) => (
                <button
                  key={option.type}
                  onClick={() => handleGenerate(option.type)}
                  className="flex items-start gap-4 p-4 text-left rounded-lg border border-border hover:border-accent/50 hover:bg-accent/5 transition-all duration-200 group"
                >
                  <div className="p-2 rounded-md bg-accent/10 text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                    {option.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{option.title}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">{option.description}</p>
                  </div>
                </button>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="narrative"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-4"
            >
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <div className="relative">
                    <Sparkles className="h-8 w-8 text-accent animate-pulse-soft" />
                  </div>
                  <p className="text-muted-foreground">Generating your narrative...</p>
                </div>
              ) : (
                <>
                  <div className="bg-muted/50 rounded-lg p-4 mb-4 max-h-[300px] overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm font-mono text-foreground/90">
                      {generatedNarrative}
                    </pre>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={handleBack} className="flex-1">
                      Generate Another
                    </Button>
                    <Button onClick={handleCopy} className="flex-1 gradient-amber text-accent-foreground">
                      {copied ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy to Clipboard
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
