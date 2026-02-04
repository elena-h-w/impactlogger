import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Users, Loader2 } from 'lucide-react';
import { Stakeholder } from '@/types/impact';
import { Header } from '@/components/Header';
import { StakeholderCard } from '@/components/StakeholderCard';
import { AddStakeholderForm } from '@/components/AddStakeholderForm';
import { Button } from '@/components/ui/button';
import { useStakeholders } from '@/hooks/useStakeholders';

const Stakeholders = () => {
  const { stakeholders, isLoading, addStakeholder, deleteStakeholder, updateStakeholder, isAdding, isUpdating } = useStakeholders();
  const [isAddingStakeholder, setIsAddingStakeholder] = useState(false);

  const handleAddStakeholder = async (stakeholder: Omit<Stakeholder, 'id'>) => {
    await addStakeholder(stakeholder);
    setIsAddingStakeholder(false);
  };

  const handleDeleteStakeholder = async (id: string) => {
    await deleteStakeholder(id);
  };

  const handleUpdateStakeholder = async (stakeholder: Stakeholder) => {
    await updateStakeholder(stakeholder);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <Users className="h-7 w-7 text-accent" />
              Stakeholder Map
            </h1>
            <p className="text-muted-foreground mt-1">
              Track the people your work impacts and what matters to them
            </p>
          </div>
          <span className="text-sm text-muted-foreground">
            {stakeholders.length} {stakeholders.length === 1 ? 'person' : 'people'}
          </span>
        </div>

        {/* Add Stakeholder Section */}
        <AnimatePresence mode="wait">
          {isAddingStakeholder ? (
            <div className="mb-8">
              <AddStakeholderForm
                onSubmit={handleAddStakeholder}
                onCancel={() => setIsAddingStakeholder(false)}
                isSubmitting={isAdding}
              />
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-8"
            >
              <Button
                onClick={() => setIsAddingStakeholder(true)}
                className="w-full gradient-amber text-accent-foreground shadow-amber hover:opacity-90 h-12 text-base"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Stakeholder
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stakeholders Grid */}
        {stakeholders.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No stakeholders yet</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Start mapping the people your work impacts—managers, peers, cross-functional partners, and customers.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {stakeholders.map((stakeholder, index) => (
              <StakeholderCard
                key={stakeholder.id}
                stakeholder={stakeholder}
                index={index}
                onDelete={() => handleDeleteStakeholder(stakeholder.id)}
                onUpdate={handleUpdateStakeholder}
                isUpdating={isUpdating}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Stakeholders;
