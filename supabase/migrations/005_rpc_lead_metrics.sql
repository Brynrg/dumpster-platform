CREATE OR REPLACE FUNCTION get_lead_counts_by_region()
RETURNS TABLE (region text, count bigint)
LANGUAGE sql
AS $$
  SELECT region, COUNT(*) as count
  FROM leads
  GROUP BY region;
$$;

CREATE OR REPLACE FUNCTION get_lead_counts_by_product()
RETURNS TABLE (product text, count bigint)
LANGUAGE sql
AS $$
  SELECT product, COUNT(*) as count
  FROM leads
  GROUP BY product;
$$;
