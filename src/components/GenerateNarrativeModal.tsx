import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Briefcase, ArrowUpRight, Copy, Check, Sparkles } from 'lucide-react';
import { ImpactEntry, IMPACT_TAG_CONFIG, ImpactTag } from '@/types/impact';
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

function extractOutcome(entry: ImpactEntry): string {
  const result = entry.problemSolved?.trim();
  const action = entry.whatYouDid?.trim();
  return result || action || '';
}

function groupEntriesByTheme(entries: ImpactEntry[]): Map<string, { entries: ImpactEntry[]; label: string }> {
  const themes = new Map<string, { entries: ImpactEntry[]; label: string }>();
  
  entries.forEach(entry => {
    const primaryTag = entry.tags[0] || 'general';
    const label = IMPACT_TAG_CONFIG[primaryTag as ImpactTag]?.label || 
      primaryTag.charAt(0).toUpperCase() + primaryTag.slice(1);
    
    if (!themes.has(primaryTag)) {
      themes.set(primaryTag, { entries: [], label });
    }
    themes.get(primaryTag)!.entries.push(entry);
  });
  
  return themes;
}

function getActionVerb(index: number): string {
  const verbs = ['spearheaded', 'architected', 'orchestrated', 'transformed', 'pioneered', 'championed', 'accelerated', 'elevated'];
  return verbs[index % verbs.length];
}

function buildOpeningParagraph(entries: ImpactEntry[], themes: Map<string, { entries: ImpactEntry[]; label: string }>): string {
  const themeLabels = Array.from(themes.values()).map(t => t.label.toLowerCase());
  const themeList = themeLabels.length > 2 
    ? `${themeLabels.slice(0, -1).join(', ')}, and ${themeLabels[themeLabels.length - 1]}`
    : themeLabels.join(' and ');
  
  const stakeholders = [...new Set(entries.map(e => e.whoBenefited).filter(Boolean))];
  const stakeholderMention = stakeholders.length > 0 
    ? ` with measurable impact across ${stakeholders.slice(0, 3).join(', ')}`
    : '';
  
  return `This review period marked significant contributions spanning ${themeList}${stakeholderMention}. Through strategic initiative and consistent execution, meaningful outcomes were achieved that strengthened both immediate deliverables and long-term organizational capabilities.`;
}

function buildBodyParagraph(themeLabel: string, themeEntries: ImpactEntry[], paragraphIndex: number): string {
  if (themeEntries.length === 0) return '';
  
  const verb = getActionVerb(paragraphIndex);
  const outcomes = themeEntries.slice(0, 3).map(e => extractOutcome(e)).filter(Boolean);
  const beneficiaries = [...new Set(themeEntries.map(e => e.whoBenefited).filter(Boolean))];
  
  let paragraph = `In the area of ${themeLabel.toLowerCase()}, `;
  
  if (outcomes.length === 1) {
    paragraph += `efforts ${verb} ${outcomes[0].charAt(0).toLowerCase() + outcomes[0].slice(1)}`;
  } else if (outcomes.length === 2) {
    paragraph += `work ${verb} initiatives that ${outcomes[0].charAt(0).toLowerCase() + outcomes[0].slice(1)}, while also ${outcomes[1].charAt(0).toLowerCase() + outcomes[1].slice(1)}`;
  } else if (outcomes.length >= 3) {
    paragraph += `multiple initiatives were ${verb}ed: ${outcomes[0].charAt(0).toLowerCase() + outcomes[0].slice(1)}, ${outcomes[1].charAt(0).toLowerCase() + outcomes[1].slice(1)}, and ${outcomes[2].charAt(0).toLowerCase() + outcomes[2].slice(1)}`;
  }
  
  if (beneficiaries.length > 0) {
    paragraph += `. These efforts directly benefited ${beneficiaries.slice(0, 2).join(' and ')}, creating lasting value for the organization`;
  }
  
  paragraph += '.';
  return paragraph;
}

function buildClosingParagraph(entries: ImpactEntry[]): string {
  const allStakeholders = [...new Set(entries.flatMap(e => e.whoBenefited ? [e.whoBenefited] : []))];
  const collaborationNote = allStakeholders.length > 2
    ? `demonstrated through partnerships with ${allStakeholders.slice(0, 3).join(', ')}`
    : 'evident throughout each initiative';
  
  return `Cross-functional collaboration remained a consistent strength, ${collaborationNote}. The combination of technical execution and stakeholder alignment positions continued growth and expanded responsibility in the coming period. These contributions reflect readiness to take on increasingly complex challenges while maintaining the quality and impact demonstrated throughout this review cycle.`;
}

function generateNarrative(entries: ImpactEntry[], type: NarrativeType): string {
  if (entries.length === 0) {
    return "No impact entries found. Start capturing your wins to generate narratives.";
  }

  const themes = groupEntriesByTheme(entries);
  const sortedThemes = Array.from(themes.entries())
    .sort((a, b) => b[1].entries.length - a[1].entries.length)
    .slice(0, 3);
  
  const opening = buildOpeningParagraph(entries, themes);
  const bodyParagraphs = sortedThemes
    .map(([, theme], idx) => buildBodyParagraph(theme.label, theme.entries, idx))
    .filter(Boolean)
    .join('\n\n');
  const closing = buildClosingParagraph(entries);

  if (type === 'review') {
    return `## Performance Review Summary\n\n${opening}\n\n${bodyParagraphs}\n\n${closing}`;
  }

  if (type === 'promotion') {
    const promotionOpening = opening.replace('This review period marked', 'This promotion case reflects');
    const promotionClosing = closing.replace(
      'positions continued growth and expanded responsibility',
      'demonstrates clear readiness for promotion and the capacity to operate at the next level'
    );
    return `## Promotion Case\n\n${promotionOpening}\n\n${bodyParagraphs}\n\n${promotionClosing}`;
  }

  // Role change narrative
  const roleOpening = opening.replace(
    'This review period marked significant contributions',
    'A pattern of adaptability and transferable excellence emerges from recent contributions'
  );
  const roleClosing = `The breadth of experience across ${sortedThemes.map(([, t]) => t.label.toLowerCase()).join(', ')} demonstrates versatility that translates directly to new contexts. ${closing.replace('Cross-functional collaboration remained a consistent strength', 'Strong collaborative instincts')}`;
  
  return `## Role Transition Narrative\n\n${roleOpening}\n\n${bodyParagraphs}\n\n${roleClosing}`;
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
                    <div className="whitespace-pre-wrap text-sm text-foreground/90 leading-relaxed">
                      {generatedNarrative}
                    </div>
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
