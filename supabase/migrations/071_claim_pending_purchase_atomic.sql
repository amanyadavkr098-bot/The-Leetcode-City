-- ============================================================
-- 071: Atomic Pending Purchase Claim with Stock Check
-- Fixes inventory overselling race condition in webhooks
-- ============================================================

CREATE OR REPLACE FUNCTION public.claim_pending_purchase_atomic(
  p_developer_id BIGINT,
  p_item_id TEXT,
  p_provider TEXT,
  p_tx_id TEXT,
  p_purchase_id UUID DEFAULT NULL
)
RETURNS TABLE (
  ok BOOLEAN,
  error_code TEXT,
  purchase_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_max_quantity INT;
  v_sold_count INT;
  v_purchase_id UUID;
BEGIN
  -- 1. Lock the item row to prevent concurrent claims for the same item
  SELECT max_quantity INTO v_max_quantity
  FROM public.items
  WHERE id = p_item_id
  FOR UPDATE;

  -- 2. Find the pending purchase
  IF p_purchase_id IS NOT NULL THEN
    SELECT id INTO v_purchase_id
    FROM public.purchases
    WHERE id = p_purchase_id
      AND developer_id = p_developer_id
      AND item_id = p_item_id
      AND status = 'pending'
      AND provider = p_provider;
  ELSE
    SELECT id INTO v_purchase_id
    FROM public.purchases
    WHERE developer_id = p_developer_id
      AND item_id = p_item_id
      AND status = 'pending'
      AND provider = p_provider
    LIMIT 1;
  END IF;

  IF v_purchase_id IS NULL THEN
    RETURN QUERY SELECT false, 'not_found'::TEXT, NULL::UUID;
    RETURN;
  END IF;

  -- 3. If it has a stock limit, check current sold count
  IF v_max_quantity IS NOT NULL THEN
    SELECT COUNT(*)::INT INTO v_sold_count
    FROM public.purchases
    WHERE item_id = p_item_id
      AND status IN ('completed', 'delivered', 'processing');

    IF v_sold_count >= v_max_quantity THEN
      RETURN QUERY SELECT false, 'sold_out'::TEXT, v_purchase_id;
      RETURN;
    END IF;
  END IF;

  -- 4. Claim the pending purchase
  UPDATE public.purchases
  SET status = 'processing',
      provider_tx_id = p_tx_id
  WHERE id = v_purchase_id
    AND status = 'pending';

  -- Ensure we actually claimed it (another transaction didn't claim it first)
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'already_claimed'::TEXT, v_purchase_id;
    RETURN;
  END IF;

  RETURN QUERY SELECT true, NULL::TEXT, v_purchase_id;
END;
$$;

-- Restrict execution to service_role to prevent abuse by authenticated users
REVOKE EXECUTE ON FUNCTION public.claim_pending_purchase_atomic FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_pending_purchase_atomic TO service_role;
