import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Sparkles } from 'lucide-react';
import { ImpactTag as ImpactTagType, IMPACT_TAG_CONFIG, ImpactEntry } from '@/types/impact';
import { ImpactTag } from './ImpactTag';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AddImpactFormProps {
  onSubmit: (entry: Omit<ImpactEntry, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function AddImpactForm({ onSubmit, onCancel, isSubmitting }: AddImpactFormProps) {
  const [whatYouDid, setWhatYouDid] = useState('');
  const [whoBenefited, setWhoBenefited] = useState('');
  const [problemSolved, setProblemSolved] = useState('');
  const [evidence, setEvidence] = useState('');
  const [selectedTags, setSelectedTags] = useState<ImpactTagType[]>([]);

  const toggleTag = (tag: ImpactTagType) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!whatYouDid.trim()) return;
    
    onSubmit({
      weekOf: new Date(),
      whatYouDid,
      whoBenefited,
      problemSolved,
      evidence,
      tags: selectedTags,
    });
  };

  const allTags = Object.keys(IMPACT_TAG_CONFIG) as ImpactTagType[];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="gradient-card shadow-lg border-accent/20">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Sparkles className="h-5 w-5 text-accent" />
              Capture Your Impact
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onCancel} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="whatYouDid" className="text-sm font-medium">
                What did you do that moved something forward?
              </Label>
              <Textarea
                id="whatYouDid"
                placeholder="Led the migration of authentication system to OAuth 2.0..."
                value={whatYouDid}
                onChange={(e) => setWhatYouDid(e.target.value)}
                className="min-h-[80px] resize-none"
                required
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="whoBenefited" className="text-sm font-medium">
                  Who benefited?
                </Label>
                <Input
                  id="whoBenefited"
                  placeholder="Engineering team, Product, Customers..."
                  value={whoBenefited}
                  onChange={(e) => setWhoBenefited(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="problemSolved" className="text-sm font-medium">
                  What was the result? Why does it matter?
                </Label>
                <Input
                  id="problemSolved"
                  placeholder="Reduced login failures by 40%, improving user retention..."
                  value={problemSolved}
                  onChange={(e) => setProblemSolved(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="evidence" className="text-sm font-medium">
                Evidence (doc, metric, message, outcome)
              </Label>
              <Input
                id="evidence"
                placeholder="Link to PR, Slack thread, dashboard..."
                value={evidence}
                onChange={(e) => setEvidence(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Impact Tags</Label>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <ImpactTag
                    key={tag}
                    tag={tag}
                    size="md"
                    onClick={() => toggleTag(tag)}
                    selected={selectedTags.includes(tag)}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1 gradient-amber text-accent-foreground shadow-amber hover:opacity-90">
                <Plus className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Saving...' : 'Save Impact'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
