-- Delete the duplicate user without privy_user_id (the newer one)
DELETE FROM public.users 
WHERE id = '9b98f206-ad21-4d77-aab4-d3f02ae59de0';