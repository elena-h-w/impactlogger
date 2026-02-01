import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Target, TrendingUp, Calendar, Tags } from 'lucide-react';
import { ImpactEntry, ImpactTag as ImpactTagType } from '@/types/impact';
import { Header } from '@/components/Header';
import { ImpactCard } from '@/components/ImpactCard';
import { AddImpactForm } from '@/components/AddImpactForm';
import { StatsCard } from '@/components/StatsCard';
import { EmptyState } from '@/components/EmptyState';
import { GenerateNarrativeModal } from '@/components/GenerateNarrativeModal';
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
            <span className="text-sm text-muted-foreground">{entries.length} entries</span>
          </div>

          {entries.length === 0 ? (
            <EmptyState onAddClick={() => setIsAddingEntry(true)} />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {entries.map((entry, index) => (
                <ImpactCard key={entry.id} entry={entry} index={index} />
              ))}
            </div>
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
