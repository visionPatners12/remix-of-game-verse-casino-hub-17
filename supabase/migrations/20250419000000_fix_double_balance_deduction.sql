
-- Désactivons tout trigger qui pourrait causer une double déduction
DROP TRIGGER IF EXISTS update_wallet_after_purchase_trigger ON user_items;
DROP FUNCTION IF EXISTS public.update_wallet_after_purchase();

-- Assurons-nous que la fonction purchase_item est la seule à mettre à jour le solde
COMMENT ON FUNCTION public.purchase_item(uuid, uuid, numeric, text) IS 'Cette fonction gère la mise à jour du solde, l''insertion de l''item acheté et l''ajout de la transaction. Ne pas implémenter une logique similaire ailleurs.';
