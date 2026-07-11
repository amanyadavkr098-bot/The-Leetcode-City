-- Atomic free/dev checkout purchase fulfillment.
-- Inserts the purchase row and fulfills the item inside one DB transaction.
-- If either step fails, the transaction rolls back and no reward/purchase remains.

CREATE OR REPLACE FUNCTION public.create_checkout_purchase_and_fulfill(
  p_developer_id BIGINT,
  p_recipient_id BIGINT,
  p_item_id TEXT,
  p_provider TEXT,
  p_idempotency_key TEXT,
  p_amount_cents INTEGER,
  p_currency TEXT,
  p_gifted_to BIGINT
)
RETURNS TABLE(purchase_id BIGINT, status TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_purchase_id BIGINT;
  v_status TEXT;
  v_item_category TEXT;
BEGIN
  SELECT category INTO v_item_category
  FROM public.items
  WHERE id = p_item_id
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Item % not found', p_item_id;
  END IF;

  IF v_item_category = 'consumable' AND p_item_id = 'streak_freeze' THEN
    PERFORM public.grant_streak_freeze(p_recipient_id);
    INSERT INTO public.streak_freeze_log (developer_id, action)
    VALUES (p_recipient_id, 'purchased');
  ELSIF v_item_category = 'consumable' AND p_item_id IN (
    'anti_missile_system',
    'anti_tank_mines',
    'scouting_satellite',
    'emp_shield',
    'stealth_cloak',
    'emp_device',
    'sabotage_virus'
  ) THEN
    PERFORM public.grant_consumable(p_recipient_id, p_item_id);
  END IF;

  INSERT INTO public.purchases (
    developer_id,
    item_id,
    provider,
    idempotency_key,
    amount_cents,
    currency,
    status,
    gifted_to
  )
  VALUES (
    p_developer_id,
    p_item_id,
    p_provider,
    p_idempotency_key,
    p_amount_cents,
    p_currency,
    CASE
      WHEN v_item_category = 'consumable' THEN 'delivered'
      ELSE 'completed'
    END,
    p_gifted_to
  )
  RETURNING id INTO v_purchase_id;

  v_status := CASE
    WHEN v_item_category = 'consumable' THEN 'delivered'
    ELSE 'completed'
  END;

  RETURN QUERY SELECT v_purchase_id, v_status;
END;
$$;
