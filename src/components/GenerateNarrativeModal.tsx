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

function generateNarrative(entries: ImpactEntry[], type: NarrativeType): string {
  if (entries.length === 0) {
    return "No impact entries found. Start capturing your wins to generate narratives!";
  }

  const tagCounts = entries.reduce((acc, entry) => {
    entry.tags.forEach(tag => {
      acc[tag] = (acc[tag] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const topTags = Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([tag]) => IMPACT_TAG_CONFIG[tag as keyof typeof IMPACT_TAG_CONFIG].label);

  const bullets = entries.slice(0, 5).map(e => `• ${e.whatYouDid}`).join('\n');

  if (type === 'review') {
    return `## Performance Review Summary

**Key Impact Areas:** ${topTags.join(', ')}

**Highlights from this period:**

${bullets}

**Quantified Impact:**
- Contributed to ${entries.length} documented wins
- Benefited stakeholders across: ${[...new Set(entries.map(e => e.whoBenefited))].slice(0, 3).join(', ')}

This summary represents concrete, evidence-based contributions with documented outcomes.`;
  }

  if (type === 'promotion') {
    return `## Promotion Case

**Demonstrated Competencies:** ${topTags.join(', ')}

**Evidence of Next-Level Performance:**

${bullets}

**Leadership & Influence:**
- Consistently delivered impact across ${Object.keys(tagCounts).length} different areas
- ${entries.length} documented contributions with measurable outcomes
- Stakeholder impact spanning multiple teams

This promotion case is built on documented evidence, not self-assessment.`;
  }

  return `## Role Transition Narrative

**Transferable Strengths:** ${topTags.join(', ')}

**Demonstrated Capabilities:**

${bullets}

**Why I'm Ready:**
- Proven track record with ${entries.length} documented wins
- Cross-functional impact touching: ${[...new Set(entries.map(e => e.whoBenefited))].slice(0, 3).join(', ')}
- Evidence-based record of delivering results

This narrative is grounded in actual work, not aspirational statements.`;
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
