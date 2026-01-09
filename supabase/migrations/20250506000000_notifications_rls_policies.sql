
-- Enable Row Level Security for notifications table if not already enabled
ALTER TABLE IF EXISTS public.notifications ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own notifications
CREATE POLICY IF NOT EXISTS "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy for users to insert notifications (create notification for another user)
CREATE POLICY IF NOT EXISTS "Users can create notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (true);

-- Policy for users to update their own notifications (mark as read, etc)
CREATE POLICY IF NOT EXISTS "Users can update their own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id);

-- Policy for users to delete their own notifications
CREATE POLICY IF NOT EXISTS "Users can delete their own notifications"
ON public.notifications
FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger to create notification when a friendship request is created
CREATE OR REPLACE FUNCTION public.create_friend_request_notification()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  INSERT INTO public.notifications (title, body, notification_type, user_id, sender_id)
  VALUES ('Nouvelle demande d''amitié', 'Vous avez reçu une nouvelle demande d''amitié', 'FRIEND_REQUEST_RECEIVED', NEW.receiver_id, NEW.sender_id);
  RETURN NEW;
END;
$function$;

