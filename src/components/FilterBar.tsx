import { useState } from 'react';
import { Search, X, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ImpactTag as ImpactTagType, IMPACT_TAG_CONFIG } from '@/types/impact';
import { ImpactTag } from './ImpactTag';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedTags: ImpactTagType[];
  onTagToggle: (tag: ImpactTagType) => void;
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

const allTags: ImpactTagType[] = ['revenue', 'risk-reduction', 'speed', 'efficiency', 'quality', 'alignment', 'leadership'];

export function FilterBar({
  searchQuery,
  onSearchChange,
  selectedTags,
  onTagToggle,
  dateRange,
  onDateRangeChange,
  onClearFilters,
  hasActiveFilters,
}: FilterBarProps) {
  const [isDateOpen, setIsDateOpen] = useState(false);

  const formatDateRange = () => {
    if (!dateRange?.from) return 'Select dates';
    if (!dateRange.to) return format(dateRange.from, 'MMM d, yyyy');
    return `${format(dateRange.from, 'MMM d')} - ${format(dateRange.to, 'MMM d, yyyy')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 mb-6"
    >
      {/* Search and Date Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by keyword..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-card border-border/50"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <Popover open={isDateOpen} onOpenChange={setIsDateOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={`min-w-[200px] justify-start text-left font-normal ${
                dateRange?.from ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              <Calendar className="mr-2 h-4 w-4" />
              {formatDateRange()}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <CalendarComponent
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={(range) => {
                onDateRangeChange(range);
                if (range?.to) setIsDateOpen(false);
              }}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Tags Row */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground mr-1">Filter by tag:</span>
        {allTags.map((tag) => (
          <ImpactTag
            key={tag}
            tag={tag}
            size="sm"
            onClick={() => onTagToggle(tag)}
            selected={selectedTags.includes(tag)}
          />
        ))}
      </div>

      {/* Clear Filters */}
      <AnimatePresence>
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4 mr-1" />
              Clear all filters
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
