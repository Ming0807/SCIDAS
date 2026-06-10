-- Add user_id column to students table
ALTER TABLE public.students
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_students_user_id ON public.students(user_id);

-- Optionally add a unique constraint if one student = one user
ALTER TABLE public.students
ADD CONSTRAINT uq_students_user_id UNIQUE (user_id);
