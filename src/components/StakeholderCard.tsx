import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Users, Heart, Sparkles, Trash2, Pencil, Check, X } from 'lucide-react';
import { Stakeholder } from '@/types/impact';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface StakeholderCardProps {
  stakeholder: Stakeholder;
  index?: number;
  onDelete?: () => void;
  onUpdate?: (stakeholder: Stakeholder) => Promise<void>;
  isUpdating?: boolean;
}

export function StakeholderCard({ stakeholder, index = 0, onDelete, onUpdate, isUpdating }: StakeholderCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: stakeholder.name,
    team: stakeholder.team,
    whatTheyCareAbout: stakeholder.whatTheyCareAbout,
    howYouImpacted: stakeholder.howYouImpacted,
  });

  const handleEdit = () => {
    setEditData({
      name: stakeholder.name,
      team: stakeholder.team,
      whatTheyCareAbout: stakeholder.whatTheyCareAbout,
      howYouImpacted: stakeholder.howYouImpacted,
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!onUpdate) return;
    await onUpdate({
      id: stakeholder.id,
      ...editData,
    });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.3 }}
      >
        <Card className="gradient-card shadow-card border border-accent/30">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <Input
                value={editData.name}
                onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Name"
                className="text-base font-semibold max-w-[200px]"
              />
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={handleCancel}
                  disabled={isUpdating}
                >
                  <X className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-accent hover:text-accent"
                  onClick={handleSave}
                  disabled={isUpdating}
                >
                  <Check className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Users className="h-4 w-4 text-muted-foreground mt-2.5 shrink-0" />
              <Input
                value={editData.team}
                onChange={(e) => setEditData(prev => ({ ...prev, team: e.target.value }))}
                placeholder="Team or department"
                className="text-sm"
              />
            </div>

            <div className="flex items-start gap-2">
              <Heart className="h-4 w-4 text-muted-foreground mt-2.5 shrink-0" />
              <Textarea
                value={editData.whatTheyCareAbout}
                onChange={(e) => setEditData(prev => ({ ...prev, whatTheyCareAbout: e.target.value }))}
                placeholder="What do they care about?"
                className="text-sm min-h-[60px] resize-none"
              />
            </div>

            <div className="flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-muted-foreground mt-2.5 shrink-0" />
              <Textarea
                value={editData.howYouImpacted}
                onChange={(e) => setEditData(prev => ({ ...prev, howYouImpacted: e.target.value }))}
                placeholder="How have you impacted them?"
                className="text-sm min-h-[60px] resize-none"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Card className="group gradient-card shadow-card hover:shadow-hover transition-all duration-300 border border-border/50">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                <User className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground group-hover:text-accent transition-colors">
                  {stakeholder.name}
                </h3>
                {stakeholder.team && (
                  <p className="text-sm text-muted-foreground">{stakeholder.team}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              {onUpdate && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit();
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
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
          
          <div className="space-y-2.5 text-sm">
            {stakeholder.whatTheyCareAbout && (
              <div className="flex items-start gap-2.5">
                <Heart className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <span className="text-muted-foreground">{stakeholder.whatTheyCareAbout}</span>
              </div>
            )}
            {stakeholder.howYouImpacted && (
              <div className="flex items-start gap-2.5">
                <Sparkles className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <span className="text-muted-foreground">{stakeholder.howYouImpacted}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
