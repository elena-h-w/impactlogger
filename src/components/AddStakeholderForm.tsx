import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, X, UserPlus } from 'lucide-react';
import { Stakeholder } from '@/types/impact';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { z } from 'zod';
import { toast } from 'sonner';

const stakeholderFormSchema = z.object({
  name: z.string()
    .trim()
    .min(1, 'Name is required')
    .max(200, 'Name must be 200 characters or less'),
  team: z.string()
    .trim()
    .max(200, 'Team must be 200 characters or less'),
  whatTheyCareAbout: z.string()
    .trim()
    .max(1000, 'Must be 1000 characters or less'),
  howYouImpacted: z.string()
    .trim()
    .max(1000, 'Must be 1000 characters or less'),
});

interface AddStakeholderFormProps {
  onSubmit: (stakeholder: Omit<Stakeholder, 'id'>) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function AddStakeholderForm({ onSubmit, onCancel, isSubmitting }: AddStakeholderFormProps) {
  const [name, setName] = useState('');
  const [team, setTeam] = useState('');
  const [whatTheyCareAbout, setWhatTheyCareAbout] = useState('');
  const [howYouImpacted, setHowYouImpacted] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const formData = {
      name,
      team,
      whatTheyCareAbout,
      howYouImpacted,
    };

    const result = stakeholderFormSchema.safeParse(formData);
    
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
      name: result.data.name,
      team: result.data.team,
      whatTheyCareAbout: result.data.whatTheyCareAbout,
      howYouImpacted: result.data.howYouImpacted,
    });
  };

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
              <UserPlus className="h-5 w-5 text-accent" />
              Add Stakeholder
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onCancel} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Name
                </Label>
                <Input
                  id="name"
                  placeholder="Sarah Chen"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={200}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="team" className="text-sm font-medium">
                  Team / Department
                </Label>
                <Input
                  id="team"
                  placeholder="Engineering, Product, Leadership..."
                  value={team}
                  onChange={(e) => setTeam(e.target.value)}
                  maxLength={200}
                />
                {errors.team && (
                  <p className="text-sm text-destructive">{errors.team}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatTheyCareAbout" className="text-sm font-medium">
                What do they care about?
              </Label>
              <Textarea
                id="whatTheyCareAbout"
                placeholder="Shipping features on time, code quality, team morale..."
                value={whatTheyCareAbout}
                onChange={(e) => setWhatTheyCareAbout(e.target.value)}
                className="min-h-[80px] resize-none"
                maxLength={1000}
              />
              {errors.whatTheyCareAbout && (
                <p className="text-sm text-destructive">{errors.whatTheyCareAbout}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="howYouImpacted" className="text-sm font-medium">
                How have you impacted them?
              </Label>
              <Textarea
                id="howYouImpacted"
                placeholder="Helped their team ship 2 weeks early, reduced their oncall burden..."
                value={howYouImpacted}
                onChange={(e) => setHowYouImpacted(e.target.value)}
                className="min-h-[80px] resize-none"
                maxLength={1000}
              />
              {errors.howYouImpacted && (
                <p className="text-sm text-destructive">{errors.howYouImpacted}</p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1 gradient-amber text-accent-foreground shadow-amber hover:opacity-90">
                <Plus className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Saving...' : 'Add Stakeholder'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
