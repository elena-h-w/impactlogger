-- Drop existing constraints and recreate with matching client-side limits
-- This ensures defense-in-depth with consistent validation on both layers

-- Drop existing impact_entries constraint
ALTER TABLE public.impact_entries 
DROP CONSTRAINT IF EXISTS check_impact_text_lengths;

-- Recreate with client-matching limits
ALTER TABLE public.impact_entries 
ADD CONSTRAINT check_impact_text_lengths 
CHECK (
  length(what_you_did) <= 2000 AND 
  length(who_benefited) <= 500 AND 
  length(problem_solved) <= 500 AND 
  length(evidence) <= 1000
);

-- Drop existing stakeholders constraint
ALTER TABLE public.stakeholders 
DROP CONSTRAINT IF EXISTS check_stakeholder_text_lengths;

-- Recreate with client-matching limits
ALTER TABLE public.stakeholders 
ADD CONSTRAINT check_stakeholder_text_lengths 
CHECK (
  length(name) <= 200 AND 
  length(team) <= 200 AND 
  length(what_they_care_about) <= 1000 AND 
  length(how_you_impacted) <= 1000
);