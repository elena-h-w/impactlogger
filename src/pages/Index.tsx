import { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Target, TrendingUp, Calendar, Tags } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { ImpactEntry, ImpactTag as ImpactTagType } from '@/types/impact';
import { Header } from '@/components/Header';
import { ImpactCard } from '@/components/ImpactCard';
import { AddImpactForm } from '@/components/AddImpactForm';
import { StatsCard } from '@/components/StatsCard';
import { EmptyState } from '@/components/EmptyState';
import { GenerateNarrativeModal } from '@/components/GenerateNarrativeModal';
import { FilterBar } from '@/components/FilterBar';
import { Button } from '@/components/ui/button';

// Sample data to showcase the app
const sampleEntries: ImpactEntry[] = [
  {
    id: '1',
    createdAt: new Date('2026-01-28'),
    weekOf: new Date('2026-01-27'),
    whatYouDid: 'Led the migration of authentication system to OAuth 2.0, reducing login failures by 40%',
    whoBenefited: 'Engineering team, End users',
    problemSolved: 'Eliminated legacy auth bottlenecks causing 2,000+ failed logins per week',
    evidence: 'PR #1234, Datadog dashboard showing 40% reduction',
    tags: ['efficiency', 'quality', 'leadership'],
  },
  {
    id: '2',
    createdAt: new Date('2026-01-21'),
    weekOf: new Date('2026-01-20'),
    whatYouDid: 'Identified and fixed a critical data sync issue before it affected Q4 reporting',
    whoBenefited: 'Finance team, Executive leadership',
    problemSolved: 'Prevented $2.3M in potential misreported revenue',
    evidence: 'Incident postmortem doc, Finance team Slack acknowledgment',
    tags: ['risk-reduction', 'quality'],
  },
  {
    id: '3',
    createdAt: new Date('2026-01-14'),
    weekOf: new Date('2026-01-13'),
    whatYouDid: 'Mentored two junior engineers through their first production deployments',
    whoBenefited: 'Junior engineers, Team velocity',
    problemSolved: 'Reduced onboarding time by 2 weeks per new hire',
    evidence: '1:1 notes, deployment success metrics',
    tags: ['leadership', 'alignment'],
  },
];

const Index = () => {
  const [entries, setEntries] = useState<ImpactEntry[]>(sampleEntries);
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [isNarrativeModalOpen, setIsNarrativeModalOpen] = useState(false);
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<ImpactTagType[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const hasActiveFilters = searchQuery.length > 0 || selectedTags.length > 0 || !!dateRange?.from;

  const handleTagToggle = (tag: ImpactTagType) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTags([]);
    setDateRange(undefined);
  };

  // Filter entries
  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      // Keyword search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesKeyword =
          entry.whatYouDid.toLowerCase().includes(query) ||
          entry.whoBenefited.toLowerCase().includes(query) ||
          entry.problemSolved.toLowerCase().includes(query) ||
          entry.evidence.toLowerCase().includes(query);
        if (!matchesKeyword) return false;
      }

      // Tag filter
      if (selectedTags.length > 0) {
        const hasMatchingTag = selectedTags.some(tag => entry.tags.includes(tag));
        if (!hasMatchingTag) return false;
      }

      // Date range filter
      if (dateRange?.from) {
        const entryDate = new Date(entry.weekOf);
        if (entryDate < dateRange.from) return false;
        if (dateRange.to && entryDate > dateRange.to) return false;
      }

      return true;
    });
  }, [entries, searchQuery, selectedTags, dateRange]);

  const handleAddEntry = (entry: Omit<ImpactEntry, 'id' | 'createdAt'>) => {
    const newEntry: ImpactEntry = {
      ...entry,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    setEntries(prev => [newEntry, ...prev]);
    setIsAddingEntry(false);
  };

  // Calculate stats
  const totalEntries = entries.length;
  const thisMonthEntries = entries.filter(e => {
    const now = new Date();
    return e.weekOf.getMonth() === now.getMonth() && e.weekOf.getFullYear() === now.getFullYear();
  }).length;
  
  const allTags = entries.flatMap(e => e.tags);
  const uniqueTags = [...new Set(allTags)].length;
  
  const tagCounts = allTags.reduce((acc, tag) => {
    acc[tag] = (acc[tag] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const topTag = Object.entries(tagCounts).sort(([, a], [, b]) => b - a)[0]?.[0] as ImpactTagType | undefined;

  return (
    <div className="min-h-screen bg-background">
      <Header onGenerateClick={() => setIsNarrativeModalOpen(true)} hasEntries={entries.length > 0} />
      
      <main className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-8">
          <StatsCard
            title="Total Impacts"
            value={totalEntries}
            subtitle="documented wins"
            icon={Target}
            accent
            index={0}
          />
          <StatsCard
            title="This Month"
            value={thisMonthEntries}
            subtitle="entries captured"
            icon={Calendar}
            index={1}
          />
          <StatsCard
            title="Impact Areas"
            value={uniqueTags}
            subtitle="categories covered"
            icon={Tags}
            index={2}
          />
          <StatsCard
            title="Top Strength"
            value={topTag ? topTag.replace('-', ' ') : '—'}
            subtitle="most frequent tag"
            icon={TrendingUp}
            index={3}
          />
        </div>

        {/* Add Entry Section */}
        <AnimatePresence mode="wait">
          {isAddingEntry ? (
            <div className="mb-8">
              <AddImpactForm
                onSubmit={handleAddEntry}
                onCancel={() => setIsAddingEntry(false)}
              />
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-8"
            >
              <Button
                onClick={() => setIsAddingEntry(true)}
                className="w-full gradient-amber text-accent-foreground shadow-amber hover:opacity-90 h-12 text-base"
              >
                <Plus className="h-5 w-5 mr-2" />
                Capture This Week's Impact
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Entries Section */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-semibold text-foreground">Your Impact Log</h2>
            <span className="text-sm text-muted-foreground">
              {hasActiveFilters ? `${filteredEntries.length} of ${entries.length}` : `${entries.length}`} entries
            </span>
          </div>

          {entries.length === 0 ? (
            <EmptyState onAddClick={() => setIsAddingEntry(true)} />
          ) : (
            <>
              <FilterBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedTags={selectedTags}
                onTagToggle={handleTagToggle}
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
                onClearFilters={clearFilters}
                hasActiveFilters={hasActiveFilters}
              />
              
              {filteredEntries.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No entries match your filters.</p>
                  <Button variant="link" onClick={clearFilters} className="mt-2">
                    Clear filters
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredEntries.map((entry, index) => (
                    <ImpactCard key={entry.id} entry={entry} index={index} />
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      </main>

      {/* Generate Narrative Modal */}
      <GenerateNarrativeModal
        open={isNarrativeModalOpen}
        onOpenChange={setIsNarrativeModalOpen}
        entries={entries}
      />
    </div>
  );
};

export default Index;
