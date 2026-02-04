-- Create stakeholders table
CREATE TABLE public.stakeholders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  name TEXT NOT NULL,
  team TEXT NOT NULL DEFAULT '',
  what_they_care_about TEXT NOT NULL DEFAULT '',
  how_you_impacted TEXT NOT NULL DEFAULT ''
);

-- Enable Row Level Security
ALTER TABLE public.stakeholders ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own stakeholders" 
ON public.stakeholders 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own stakeholders" 
ON public.stakeholders 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stakeholders" 
ON public.stakeholders 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own stakeholders" 
ON public.stakeholders 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_stakeholders_updated_at
BEFORE UPDATE ON public.stakeholders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();