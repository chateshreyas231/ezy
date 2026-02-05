-- Migration 029: Cleanup duplicate active buyer intents
-- Ensures each buyer has only one active intent (the most recent one)

-- Deactivate older duplicate intents, keeping only the newest one for each buyer
UPDATE buyer_intents
SET active = false
WHERE id IN (
  SELECT bi.id
  FROM buyer_intents bi
  INNER JOIN (
    SELECT 
      buyer_id,
      MAX(created_at) as max_created_at
    FROM buyer_intents
    WHERE active = true
    GROUP BY buyer_id
    HAVING COUNT(*) > 1  -- Only process buyers with multiple active intents
  ) duplicates ON bi.buyer_id = duplicates.buyer_id
  WHERE bi.active = true
  AND bi.created_at < duplicates.max_created_at  -- Keep the newest, deactivate older ones
);
