-- Create a table for impact entries
CREATE TABLE public.impact_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  week_of DATE NOT NULL,
  what_you_did TEXT NOT NULL,
  who_benefited TEXT NOT NULL,
  problem_solved TEXT NOT NULL,
  evidence TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}'
);

-- Enable Row Level Security
ALTER TABLE public.impact_entries ENABLE ROW LEVEL SECURITY;

-- Create policies for user access (owner-only CRUD)
CREATE POLICY "Users can view their own entries" 
ON public.impact_entries 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own entries" 
ON public.impact_entries 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own entries" 
ON public.impact_entries 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own entries" 
ON public.impact_entries 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_impact_entries_updated_at
BEFORE UPDATE ON public.impact_entries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();