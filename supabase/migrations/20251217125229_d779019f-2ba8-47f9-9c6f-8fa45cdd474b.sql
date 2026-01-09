-- Grant INSERT, UPDATE, DELETE permissions to authenticated role for tipster_subscriptions
GRANT INSERT ON public.tipster_subscriptions TO authenticated;
GRANT UPDATE ON public.tipster_subscriptions TO authenticated;
GRANT DELETE ON public.tipster_subscriptions TO authenticated;