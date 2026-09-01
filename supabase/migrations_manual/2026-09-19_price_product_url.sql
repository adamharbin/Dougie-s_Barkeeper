-- Adds an optional product-page URL to each purchase history entry, so you
-- can quickly reference the item on the vendor's site later.

alter table inventory_prices add column if not exists product_url text;
