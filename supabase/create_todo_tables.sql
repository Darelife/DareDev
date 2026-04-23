-- Create tasks table
CREATE TABLE todo_tasks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  content text NOT NULL,
  type text CHECK (type IN ('planned', 'actual')) NOT NULL,
  task_time time NOT NULL,
  task_date date NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Create deadlines table
CREATE TABLE todo_deadlines (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  content text NOT NULL,
  target_date date NOT NULL,
  target_time time NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Ensure RLS is enabled to prevent unauthorized access
-- Since we are doing all data access server-side with the service_role key, 
-- we will just enable RLS with no policies to completely lock down the client-side access.
ALTER TABLE todo_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE todo_deadlines ENABLE ROW LEVEL SECURITY;
