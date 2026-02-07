-- Add text length constraints to impact_entries table
-- This provides server-side validation to complement client-side Zod validation
ALTER TABLE public.impact_entries 
ADD CONSTRAINT check_impact_text_lengths 
CHECK (
  length(what_you_did) <= 5000 AND 
  length(who_benefited) <= 1000 AND 
  length(problem_solved) <= 5000 AND 
  length(evidence) <= 5000
);

-- Add text length constraints to stakeholders table
ALTER TABLE public.stakeholders 
ADD CONSTRAINT check_stakeholder_text_lengths 
CHECK (
  length(name) <= 200 AND 
  length(team) <= 200 AND 
  length(what_they_care_about) <= 2000 AND 
  length(how_you_impacted) <= 2000
);