-- Supprimer l'ancienne politique ALL problématique
DROP POLICY IF EXISTS "Users can manage their own subscriptions" ON tipster_subscriptions;

-- INSERT : permet aux utilisateurs de créer leurs propres subscriptions
CREATE POLICY "Users can insert their own subscriptions"
ON tipster_subscriptions
FOR INSERT
WITH CHECK (auth.uid() = subscriber_id);

-- UPDATE : permet aux utilisateurs de modifier leurs propres subscriptions  
CREATE POLICY "Users can update their own subscriptions"
ON tipster_subscriptions
FOR UPDATE
USING (auth.uid() = subscriber_id)
WITH CHECK (auth.uid() = subscriber_id);

-- DELETE : permet aux utilisateurs de supprimer leurs propres subscriptions
CREATE POLICY "Users can delete their own subscriptions"
ON tipster_subscriptions
FOR DELETE
USING (auth.uid() = subscriber_id);