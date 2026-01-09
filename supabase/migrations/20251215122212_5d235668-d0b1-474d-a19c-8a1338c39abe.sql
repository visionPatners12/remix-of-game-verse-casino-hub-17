-- Drop existing RESTRICTIVE policies on support_tickets
DROP POLICY IF EXISTS "Users can create their own tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Users can view their own tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Users can update their own tickets" ON public.support_tickets;

-- Recreate as PERMISSIVE policies
CREATE POLICY "Users can create their own tickets" 
ON public.support_tickets 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own tickets" 
ON public.support_tickets 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own tickets" 
ON public.support_tickets 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

-- Drop existing RESTRICTIVE policies on support_messages
DROP POLICY IF EXISTS "Users can add messages to their tickets" ON public.support_messages;
DROP POLICY IF EXISTS "Users can view messages from their tickets" ON public.support_messages;

-- Recreate as PERMISSIVE policies
CREATE POLICY "Users can add messages to their tickets" 
ON public.support_messages 
FOR INSERT 
TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM public.support_tickets 
  WHERE support_tickets.id = support_messages.ticket_id 
  AND support_tickets.user_id = auth.uid()
));

CREATE POLICY "Users can view messages from their tickets" 
ON public.support_messages 
FOR SELECT 
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.support_tickets 
  WHERE support_tickets.id = support_messages.ticket_id 
  AND support_tickets.user_id = auth.uid()
));