import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Briefcase, ArrowUpRight, Copy, Check, Sparkles, Target, Users, Zap, Scale } from 'lucide-react';
import { ImpactEntry } from '@/types/impact';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  generateNarrative, 
  NarrativeType, 
  NarrativeTone, 
  TONE_CONFIG 
} from '@/lib/narrativeGenerator';

interface GenerateNarrativeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entries: ImpactEntry[];
}

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
    description: 'Evidence-based narrative showcasing leadership, growth, and organizational impact.',
    icon: <ArrowUpRight className="h-5 w-5" />,
  },
  {
    type: 'role-change',
    title: 'Role-Change Narrative',
    description: 'A story of your evolution, transferable skills, and readiness for new challenges.',
    icon: <Briefcase className="h-5 w-5" />,
  },
];

const toneOptions: { tone: NarrativeTone; icon: React.ReactNode }[] = [
  { tone: 'results', icon: <Target className="h-4 w-4" /> },
  { tone: 'leadership', icon: <Users className="h-4 w-4" /> },
  { tone: 'technical', icon: <Zap className="h-4 w-4" /> },
  { tone: 'balanced', icon: <Scale className="h-4 w-4" /> },
];

export function GenerateNarrativeModal({ open, onOpenChange, entries }: GenerateNarrativeModalProps) {
  const [selectedType, setSelectedType] = useState<NarrativeType | null>(null);
  const [selectedTone, setSelectedTone] = useState<NarrativeTone>('balanced');
  const [generatedNarrative, setGeneratedNarrative] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [step, setStep] = useState<'type' | 'tone' | 'result'>('type');

  const handleSelectType = (type: NarrativeType) => {
    setSelectedType(type);
    setStep('tone');
  };

  const handleGenerate = async () => {
    if (!selectedType) return;
    
    setIsGenerating(true);
    setStep('result');
    
    // Simulate generation delay
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    const narrative = generateNarrative(entries, selectedType, selectedTone);
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
    if (step === 'result') {
      setStep('tone');
      setGeneratedNarrative(null);
    } else if (step === 'tone') {
      setStep('type');
      setSelectedType(null);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setSelectedType(null);
      setSelectedTone('balanced');
      setGeneratedNarrative(null);
      setStep('type');
    }, 200);
  };

  const getStepTitle = () => {
    if (step === 'type') return 'Generate Narrative';
    if (step === 'tone') return 'Choose Your Tone';
    return 'Your Narrative';
  };

  const getStepDescription = () => {
    if (step === 'type') return 'Transform your impact log into compelling narratives for key career moments.';
    if (step === 'tone') return 'Select the emphasis that best matches your audience and goals.';
    return 'Based on your captured impact, here\'s your evidence-based narrative.';
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            {getStepTitle()}
          </DialogTitle>
          <DialogDescription>{getStepDescription()}</DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === 'type' && (
            <motion.div
              key="type"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid gap-3 py-4"
            >
              {narrativeOptions.map((option) => (
                <button
                  key={option.type}
                  onClick={() => handleSelectType(option.type)}
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
          )}

          {step === 'tone' && (
            <motion.div
              key="tone"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-4 space-y-4"
            >
              <div className="grid gap-2">
                {toneOptions.map((option) => {
                  const config = TONE_CONFIG[option.tone];
                  const isSelected = selectedTone === option.tone;
                  return (
                    <button
                      key={option.tone}
                      onClick={() => setSelectedTone(option.tone)}
                      className={`flex items-center gap-3 p-3 text-left rounded-lg border transition-all duration-200 ${
                        isSelected
                          ? 'border-accent bg-accent/10'
                          : 'border-border hover:border-accent/50 hover:bg-accent/5'
                      }`}
                    >
                      <div className={`p-2 rounded-md transition-colors ${
                        isSelected ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'
                      }`}>
                        {option.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">{config.label}</h4>
                        <p className="text-xs text-muted-foreground">{config.description}</p>
                      </div>
                      {isSelected && (
                        <Check className="h-4 w-4 text-accent" />
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={handleBack} className="flex-1">
                  Back
                </Button>
                <Button onClick={handleGenerate} className="flex-1 gradient-amber text-accent-foreground">
                  Generate Narrative
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'result' && (
            <motion.div
              key="result"
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
                      Change Tone
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
