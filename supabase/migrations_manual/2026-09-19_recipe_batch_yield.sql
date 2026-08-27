-- Adds batch_yield_qty to recipes: when set, this recipe's ingredient list
-- represents a whole BATCH that makes this many servings, and food/labor/
-- prime cost get divided by it to give a per-serving cost. Null/0 (every
-- existing recipe) behaves exactly as today -- no existing recipe changes.

alter table recipes add column if not exists batch_yield_qty numeric;
