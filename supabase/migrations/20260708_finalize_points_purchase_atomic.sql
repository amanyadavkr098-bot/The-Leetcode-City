-- Atomic points purchase finalization.
-- Ensures points deduction, item fulfillment, purchase completion,
-- and activity feed insertion all occur in one transaction.

CREATE OR REPLACE FUNCTION public.finalize_points_purchase(
  p_purchase_id BIGINT,
  p_developer_id BIGINT,
  p_item_id TEXT,
  p_price_points INTEGER,
  p_is_dev BOOLEAN,
  p_github_login TEXT
)
RETURNS TABLE(ok BOOLEAN, error_code TEXT, points_remaining INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_purchase_status TEXT;
  v_item_category TEXT;
  v_deduction_success BOOLEAN;
  v_remaining_points INTEGER;
BEGIN
  -- 1. Deduct points if not developer bypass.
  IF NOT p_is_dev THEN
    SELECT success, remaining_points
    INTO v_deduction_success, v_remaining_points
    FROM public.deduct_points_atomic(p_developer_id, p_price_points);

    IF NOT v_deduction_success THEN
      ok := false;
      error_code := 'not_enough_points';
      points_remaining := 0;
      RETURN NEXT;
    END IF;
  ELSE
    SELECT points INTO v_remaining_points FROM public.developers WHERE id = p_developer_id;
  END IF;

  -- 2. Fulfill item.
  SELECT category INTO v_item_category
  FROM public.items
  WHERE id = p_item_id
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Item % not found', p_item_id;
  END IF;

  IF v_item_category = 'consumable' THEN
    IF p_item_id = 'streak_freeze' THEN
      PERFORM public.grant_streak_freeze(p_developer_id);
      INSERT INTO public.streak_freeze_log (developer_id, action)
      VALUES (p_developer_id, 'purchased');
      v_purchase_status := 'delivered';
    ELSIF p_item_id IN (
      'anti_missile_system',
      'anti_tank_mines',
      'scouting_satellite',
      'emp_shield',
      'stealth_cloak',
      'emp_device',
      'sabotage_virus'
    ) THEN
      PERFORM public.grant_consumable(p_developer_id, p_item_id);
      v_purchase_status := 'delivered';
    ELSE
      -- Non-battle consumables are consumable items that do not require a
      -- grant_consumable RPC; they are still treated as delivered.
      v_purchase_status := 'delivered';
    END IF;
  ELSE
    v_purchase_status := 'completed';
  END IF;

  -- 3. Complete purchase.
  UPDATE public.purchases
  SET status = v_purchase_status
  WHERE id = p_purchase_id
  RETURNING status INTO v_purchase_status;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Purchase % not found', p_purchase_id;
  END IF;

  -- 4. Insert activity feed event.
  INSERT INTO public.activity_feed (event_type, actor_id, metadata)
  VALUES ('item_purchased', p_developer_id, jsonb_build_object('login', p_github_login, 'item_id', p_item_id, 'provider', 'points'));

  ok := true;
  error_code := NULL;
  points_remaining := v_remaining_points;
  RETURN NEXT;
END;
$$;
