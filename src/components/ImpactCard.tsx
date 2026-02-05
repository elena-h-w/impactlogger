import { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Users, Lightbulb, FileText, Trash2, Pencil, Check, X, Plus } from 'lucide-react';
import { ImpactEntry, ImpactTag as ImpactTagType, AnyTag, IMPACT_TAG_CONFIG } from '@/types/impact';
import { ImpactTag } from './ImpactTag';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ImpactCardProps {
  entry: ImpactEntry;
  index?: number;
  onDelete?: () => void;
  onUpdate?: (entry: Omit<ImpactEntry, 'createdAt'>) => Promise<void>;
  isUpdating?: boolean;
}

export function ImpactCard({ entry, index = 0, onDelete, onUpdate, isUpdating }: ImpactCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');
  const [editData, setEditData] = useState({
    weekOf: entry.weekOf,
    whatYouDid: entry.whatYouDid,
    whoBenefited: entry.whoBenefited,
    problemSolved: entry.problemSolved,
    evidence: entry.evidence,
    tags: [...entry.tags] as AnyTag[],
  });

  const handleEdit = () => {
    setEditData({
      weekOf: entry.weekOf,
      whatYouDid: entry.whatYouDid,
      whoBenefited: entry.whoBenefited,
      problemSolved: entry.problemSolved,
      evidence: entry.evidence,
      tags: [...entry.tags] as AnyTag[],
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setNewTagInput('');
  };

  const handleSave = async () => {
    if (!onUpdate) return;
    await onUpdate({
      id: entry.id,
      ...editData,
    });
    setIsEditing(false);
    setNewTagInput('');
  };

  const toggleTag = (tag: AnyTag) => {
    setEditData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const handleAddCustomTag = () => {
    const trimmed = newTagInput.trim().toLowerCase();
    if (trimmed && !editData.tags.includes(trimmed)) {
      setEditData(prev => ({
        ...prev,
        tags: [...prev.tags, trimmed],
      }));
      setNewTagInput('');
    }
  };

  const allTags = Object.keys(IMPACT_TAG_CONFIG) as ImpactTagType[];
  
  // Get custom tags that are on this entry but not in default config
  const customTagsOnEntry = editData.tags.filter(t => !allTags.includes(t as ImpactTagType));

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
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "justify-start text-left font-normal h-8 text-sm",
                      !editData.weekOf && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    Week of {format(editData.weekOf, 'MMM d, yyyy')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={editData.weekOf}
                    onSelect={(date) => date && setEditData(prev => ({ ...prev, weekOf: date }))}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
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

            <Textarea
              value={editData.whatYouDid}
              onChange={(e) => setEditData(prev => ({ ...prev, whatYouDid: e.target.value }))}
              placeholder="What did you do?"
              className="min-h-[60px] resize-none text-sm"
            />

            <div className="flex items-start gap-2">
              <Users className="h-4 w-4 text-muted-foreground mt-2.5 shrink-0" />
              <Input
                value={editData.whoBenefited}
                onChange={(e) => setEditData(prev => ({ ...prev, whoBenefited: e.target.value }))}
                placeholder="Who benefited?"
                className="text-sm"
              />
            </div>

            <div className="flex items-start gap-2">
              <Lightbulb className="h-4 w-4 text-muted-foreground mt-2.5 shrink-0" />
              <Input
                value={editData.problemSolved}
                onChange={(e) => setEditData(prev => ({ ...prev, problemSolved: e.target.value }))}
                placeholder="Result / Why it matters?"
                className="text-sm"
              />
            </div>

            <div className="flex items-start gap-2">
              <FileText className="h-4 w-4 text-muted-foreground mt-2.5 shrink-0" />
              <Input
                value={editData.evidence}
                onChange={(e) => setEditData(prev => ({ ...prev, evidence: e.target.value }))}
                placeholder="Evidence"
                className="text-sm"
              />
            </div>

            <div className="flex flex-wrap gap-1.5">
              {allTags.map((tag) => (
                <ImpactTag
                  key={tag}
                  tag={tag}
                  size="sm"
                  onClick={() => toggleTag(tag)}
                  selected={editData.tags.includes(tag)}
                />
              ))}
              {customTagsOnEntry.map((tag) => (
                <ImpactTag
                  key={tag}
                  tag={tag}
                  size="sm"
                  onClick={() => toggleTag(tag)}
                  selected={editData.tags.includes(tag)}
                />
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <Input
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                placeholder="Add custom tag..."
                className="text-sm h-8 flex-1"
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
                className="h-8"
                onClick={handleAddCustomTag}
                disabled={!newTagInput.trim()}
              >
                <Plus className="h-3 w-3" />
              </Button>
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
      <Card className="group gradient-card shadow-card hover:shadow-hover transition-all duration-300 border border-border/50 relative">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarIcon className="h-4 w-4" />
              <span>Week of {format(entry.weekOf, 'MMM d, yyyy')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex flex-wrap gap-1.5 justify-end">
                {entry.tags.map((tag) => (
                  <ImpactTag key={tag} tag={tag} />
                ))}
              </div>
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
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this impact entry?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete this impact entry from your log.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={onDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
          
          <h3 className="text-base font-semibold text-foreground mb-3 line-clamp-2 group-hover:text-accent transition-colors">
            {entry.whatYouDid}
          </h3>
          
          <div className="space-y-2.5 text-sm">
            <div className="flex items-start gap-2.5">
              <Users className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <span className="text-muted-foreground">{entry.whoBenefited}</span>
            </div>
            <div className="flex items-start gap-2.5">
              <Lightbulb className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <span className="text-muted-foreground">{entry.problemSolved}</span>
            </div>
            {entry.evidence && (
              <div className="flex items-start gap-2.5">
                <FileText className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <span className="text-muted-foreground line-clamp-1">{entry.evidence}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
