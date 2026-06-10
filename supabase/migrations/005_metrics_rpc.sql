create or replace function get_product_metrics()
returns table (product text, count bigint)
language sql
as $$
  select product, count(*)
  from leads
  where product in ('dump_trailer', 'dumpster_20', 'dumpster_30', 'not_sure')
  group by product;
$$;

create or replace function get_region_metrics()
returns table (region text, count bigint)
language sql
as $$
  select region, count(*)
  from leads
  group by region;
$$;
