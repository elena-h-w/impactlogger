import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Sparkles } from 'lucide-react';
import { ImpactTag as ImpactTagType, AnyTag, IMPACT_TAG_CONFIG, ImpactEntry } from '@/types/impact';
import { ImpactTag } from './ImpactTag';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { z } from 'zod';
import { toast } from 'sonner';

const impactFormSchema = z.object({
  whatYouDid: z.string()
    .trim()
    .min(1, 'This field is required')
    .max(2000, 'Must be 2000 characters or less'),
  whoBenefited: z.string()
    .trim()
    .max(500, 'Must be 500 characters or less'),
  problemSolved: z.string()
    .trim()
    .max(500, 'Must be 500 characters or less'),
  evidence: z.string()
    .trim()
    .max(1000, 'Must be 1000 characters or less'),
  tags: z.array(z.string()).max(10, 'Maximum 10 tags allowed'),
});

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
  const [selectedTags, setSelectedTags] = useState<AnyTag[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleTag = (tag: AnyTag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleAddCustomTag = () => {
    const trimmed = newTagInput.trim().toLowerCase();
    if (trimmed && !selectedTags.includes(trimmed)) {
      setSelectedTags(prev => [...prev, trimmed]);
      setNewTagInput('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const formData = {
      whatYouDid,
      whoBenefited,
      problemSolved,
      evidence,
      tags: selectedTags,
    };

    const result = impactFormSchema.safeParse(formData);
    
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      toast.error('Please fix the validation errors');
      return;
    }

    onSubmit({
      weekOf: new Date(),
      whatYouDid: result.data.whatYouDid,
      whoBenefited: result.data.whoBenefited,
      problemSolved: result.data.problemSolved,
      evidence: result.data.evidence,
      tags: selectedTags,
    });
  };

  const allTags = Object.keys(IMPACT_TAG_CONFIG) as ImpactTagType[];
  
  // Custom tags that were added by user
  const customTags = selectedTags.filter(t => !allTags.includes(t as ImpactTagType));

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
                maxLength={2000}
              />
              {errors.whatYouDid && (
                <p className="text-sm text-destructive">{errors.whatYouDid}</p>
              )}
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
                  maxLength={500}
                />
                {errors.whoBenefited && (
                  <p className="text-sm text-destructive">{errors.whoBenefited}</p>
                )}
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
                  maxLength={500}
                />
                {errors.problemSolved && (
                  <p className="text-sm text-destructive">{errors.problemSolved}</p>
                )}
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
                maxLength={1000}
              />
              {errors.evidence && (
                <p className="text-sm text-destructive">{errors.evidence}</p>
              )}
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
                {customTags.map((tag) => (
                  <ImpactTag
                    key={tag}
                    tag={tag}
                    size="md"
                    onClick={() => toggleTag(tag)}
                    selected={selectedTags.includes(tag)}
                  />
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <Input
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  placeholder="Add custom tag..."
                  className="text-sm h-9 flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomTag();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9"
                  onClick={handleAddCustomTag}
                  disabled={!newTagInput.trim()}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
              {errors.tags && (
                <p className="text-sm text-destructive">{errors.tags}</p>
              )}
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
