-- Bar/drink menu import: placeholder item, 54 recipes + ingredients

-- 1. Placeholder ingredient for composite/bundle drinks with no known
-- ratio yet (Piña Colada, Strawberry Frost, Mimosa, the 3 Buckets).
-- Deliberately unpriced -- keeps these recipes flagged "needs pricing"
-- instead of silently showing a $0 food cost.
insert into inventory_items (name, category_tag, recipe_unit, purchase_unit, pack_qty, size_per_inner, size_uom)
select 'TBD - Recipe Not Yet Built (placeholder ingredient)', 'Bar', 'each', 'each', 1, 1, 'each'
where not exists (select 1 from inventory_items where name = 'TBD - Recipe Not Yet Built (placeholder ingredient)');

-- 2. Recipes
insert into recipes (name, category_tag, menu_category, yield, menu_price, labor_minutes, prep_notes)
values
  ('Crooked Can - Cloud Chaser', 'Bar', 'On Draft', '1 pint (16oz)', 8, null, 'ASSUMPTION: costed assuming a standard half-barrel keg (15.5 gal / 1984 fl oz) and a 16oz pint pour. If this beer is poured from a different keg size, correct the ingredient quantity in Recipes > Edit.'),
  ('Crooked Can - Sixth Man', 'Bar', 'On Draft', '1 pint (16oz)', 8, null, 'ASSUMPTION: costed assuming a standard half-barrel keg (15.5 gal / 1984 fl oz) and a 16oz pint pour. If this beer is poured from a different keg size, correct the ingredient quantity in Recipes > Edit.'),
  ('Crooked Can - Hit The Haze', 'Bar', 'On Draft', '1 pint (16oz)', 8, null, 'ASSUMPTION: costed assuming a standard half-barrel keg (15.5 gal / 1984 fl oz) and a 16oz pint pour. If this beer is poured from a different keg size, correct the ingredient quantity in Recipes > Edit.'),
  ('Ivanhoe Park - Park Hopper', 'Bar', 'On Draft', '1 pint (16oz)', 8, null, 'ASSUMPTION: costed assuming a standard half-barrel keg (15.5 gal / 1984 fl oz) and a 16oz pint pour. If this beer is poured from a different keg size, correct the ingredient quantity in Recipes > Edit.'),
  ('Keel Farms - Elderberry Cider', 'Bar', 'On Draft', '1 pint (16oz)', 8, null, 'ASSUMPTION: costed assuming a standard half-barrel keg (15.5 gal / 1984 fl oz) and a 16oz pint pour. If this beer is poured from a different keg size, correct the ingredient quantity in Recipes > Edit.'),
  ('Guinness Stout', 'Bar', 'On Draft', '1 pint (16oz)', 8, null, 'ASSUMPTION: costed assuming a standard half-barrel keg (15.5 gal / 1984 fl oz) and a 16oz pint pour. If this beer is poured from a different keg size, correct the ingredient quantity in Recipes > Edit.'),
  ('Lagunitas IPA', 'Bar', 'On Draft', '1 pint (16oz)', 7, null, 'ASSUMPTION: costed assuming a standard half-barrel keg (15.5 gal / 1984 fl oz) and a 16oz pint pour. If this beer is poured from a different keg size, correct the ingredient quantity in Recipes > Edit.'),
  ('Kona Big Wave', 'Bar', 'On Draft', '1 pint (16oz)', 7, null, 'ASSUMPTION: costed assuming a standard half-barrel keg (15.5 gal / 1984 fl oz) and a 16oz pint pour. If this beer is poured from a different keg size, correct the ingredient quantity in Recipes > Edit.'),
  ('Blue Moon', 'Bar', 'On Draft', '1 pint (16oz)', 7, null, 'ASSUMPTION: costed assuming a standard half-barrel keg (15.5 gal / 1984 fl oz) and a 16oz pint pour. If this beer is poured from a different keg size, correct the ingredient quantity in Recipes > Edit.'),
  ('Narragansett', 'Bar', 'On Draft', '1 pint (16oz)', 6, null, 'ASSUMPTION: costed assuming a standard half-barrel keg (15.5 gal / 1984 fl oz) and a 16oz pint pour. If this beer is poured from a different keg size, correct the ingredient quantity in Recipes > Edit.'),
  ('Yuengling', 'Bar', 'On Draft', '1 pint (16oz)', 6, null, 'ASSUMPTION: costed assuming a standard half-barrel keg (15.5 gal / 1984 fl oz) and a 16oz pint pour. If this beer is poured from a different keg size, correct the ingredient quantity in Recipes > Edit.'),
  ('Bud Light (Draft)', 'Bar', 'On Draft', '1 pint (16oz)', 6, null, 'ASSUMPTION: costed assuming a standard half-barrel keg (15.5 gal / 1984 fl oz) and a 16oz pint pour. If this beer is poured from a different keg size, correct the ingredient quantity in Recipes > Edit.'),
  ('Bud Light', 'Bar', 'Domestic & Import Cans', '1 can', 5, null, ''),
  ('Michelob Ultra', 'Bar', 'Domestic & Import Cans', '1 can', 5, null, ''),
  ('Miller Lite', 'Bar', 'Domestic & Import Cans', '1 can', 5, null, ''),
  ('Coors Light', 'Bar', 'Domestic & Import Cans', '1 can', 5, null, ''),
  ('Corona', 'Bar', 'Domestic & Import Cans', '1 can', 6, null, ''),
  ('Modelo', 'Bar', 'Domestic & Import Cans', '1 can', 6, null, ''),
  ('Stella Artois', 'Bar', 'Domestic & Import Cans', '1 can', 7, null, ''),
  ('Heineken', 'Bar', 'Domestic & Import Cans', '1 can', 7, null, ''),
  ('Jai Alai IPA', 'Bar', 'Domestic & Import Cans', '1 can', 7, null, ''),
  ('Ivanhoe Park Guava', 'Bar', 'Domestic & Import Cans', '1 can', 8, null, ''),
  ('Good Boy Blackberry Tea', 'Bar', 'Hard Tea & Lemonade', '1 can', 8, null, ''),
  ('Good Boy Hard Tea', 'Bar', 'Hard Tea & Lemonade', '1 can', 8, null, ''),
  ('Lucky One Peach Lemonade', 'Bar', 'Hard Tea & Lemonade', '1 can', 8, null, ''),
  ('Lucky One Raspberry', 'Bar', 'Hard Tea & Lemonade', '1 can', 8, null, ''),
  ('Twisted Tea Half & Half', 'Bar', 'Hard Tea & Lemonade', '1 can', 8, null, ''),
  ('High Noon Watermelon', 'Bar', 'Seltzers', '1 can', 7, null, ''),
  ('High Noon Pineapple', 'Bar', 'Seltzers', '1 can', 7, null, ''),
  ('Good Boy Strawberry Hibiscus', 'Bar', 'Seltzers', '1 can', 8, null, ''),
  ('Carbliss Black Raspberry', 'Bar', 'Seltzers', '1 can', 8, null, ''),
  ('Carbliss Mango', 'Bar', 'Seltzers', '1 can', 8, null, ''),
  ('Jack Daniel''s & Coca-Cola', 'Bar', 'Canned Cocktails', '1 can', 10, null, ''),
  ('Two Chicks Paloma', 'Bar', 'Canned Cocktails', '1 can', 8, null, ''),
  ('Piña Colada', 'Bar', 'Frozen', '1 drink', 12, null, 'Not yet costed -- this is a mixed drink / bundle without a known ratio. Edit this recipe to replace the placeholder ingredient with the real components once you have the recipe.'),
  ('Strawberry Frost', 'Bar', 'Frozen', '1 drink', 8, null, 'Non-alcoholic. Not yet costed -- this is a mixed drink / bundle without a known ratio. Edit this recipe to replace the placeholder ingredient with the real components once you have the recipe.'),
  ('Flores Carolina Mata Sparkling', 'Bar', 'Wine', '1 glass (5oz)', 8, null, 'ASSUMPTION: costed as a 5oz pour from a standard 750ml (25.4oz) bottle -- about 5 glasses per bottle. Correct the ingredient quantity if this wine''s bottle size or standard pour differs.'),
  ('Santa Marina Pinot Grigio', 'Bar', 'Wine', '1 glass (5oz)', 8, null, 'ASSUMPTION: costed as a 5oz pour from a standard 750ml (25.4oz) bottle -- about 5 glasses per bottle. Correct the ingredient quantity if this wine''s bottle size or standard pour differs.'),
  ('Mohua Sauvignon Blanc', 'Bar', 'Wine', '1 glass (5oz)', 10, null, 'ASSUMPTION: costed as a 5oz pour from a standard 750ml (25.4oz) bottle -- about 5 glasses per bottle. Correct the ingredient quantity if this wine''s bottle size or standard pour differs.'),
  ('Daou Chardonnay', 'Bar', 'Wine', '1 glass (5oz)', 10, null, 'ASSUMPTION: costed as a 5oz pour from a standard 750ml (25.4oz) bottle -- about 5 glasses per bottle. Correct the ingredient quantity if this wine''s bottle size or standard pour differs.'),
  ('La Vieille Ferme Rosé', 'Bar', 'Wine', '1 glass (5oz)', 8, null, 'ASSUMPTION: costed as a 5oz pour from a standard 750ml (25.4oz) bottle -- about 5 glasses per bottle. Correct the ingredient quantity if this wine''s bottle size or standard pour differs.'),
  ('Bulletin Place Cabernet Sauvignon', 'Bar', 'Wine', '1 glass (5oz)', 8, null, 'ASSUMPTION: costed as a 5oz pour from a standard 750ml (25.4oz) bottle -- about 5 glasses per bottle. Correct the ingredient quantity if this wine''s bottle size or standard pour differs.'),
  ('Daou Cabernet Sauvignon', 'Bar', 'Wine', '1 glass (5oz)', 12, null, 'ASSUMPTION: costed as a 5oz pour from a standard 750ml (25.4oz) bottle -- about 5 glasses per bottle. Correct the ingredient quantity if this wine''s bottle size or standard pour differs.'),
  ('Wild Hills Pinot Noir', 'Bar', 'Wine', '1 glass (5oz)', 10, null, 'ASSUMPTION: costed as a 5oz pour from a standard 750ml (25.4oz) bottle -- about 5 glasses per bottle. Correct the ingredient quantity if this wine''s bottle size or standard pour differs.'),
  ('Brez Social Lemon Elderflower', 'Bar', 'Zero Proof & THC/CBD', '1 can', 12, null, ''),
  ('Serenity Mint & Lemongrass Kombucha', 'Bar', 'Zero Proof & THC/CBD', '1 can', 10, null, ''),
  ('Strawberry & Lavender Lemonade Kombucha', 'Bar', 'Zero Proof & THC/CBD', '1 can', 10, null, ''),
  ('Mimosa (Glass)', 'Bar', 'Wine Cocktails', '1 glass', 9, null, 'Not yet costed -- this is a mixed drink / bundle without a known ratio. Edit this recipe to replace the placeholder ingredient with the real components once you have the recipe.'),
  ('Mimosa (Carafe)', 'Bar', 'Wine Cocktails', '1 carafe', 32, null, 'Not yet costed -- this is a mixed drink / bundle without a known ratio. Edit this recipe to replace the placeholder ingredient with the real components once you have the recipe.'),
  ('Sangria (Glass)', 'Bar', 'Wine Cocktails', '1 glass (5oz)', 9, null, 'ASSUMPTION: costed as a 5oz pour from a standard 750ml (25.4oz) bottle -- about 5 glasses per bottle. Correct the ingredient quantity if this wine''s bottle size or standard pour differs.'),
  ('Sangria (Carafe)', 'Bar', 'Wine Cocktails', '1 carafe (~25oz)', 32, null, 'ASSUMPTION: a carafe is costed as one full 750ml bottle-equivalent of Sangria. Correct the ingredient quantity if Dougie''s carafe is a different size.'),
  ('Domestics Bucket', 'Bar', 'Buckets for the Pack', '5 beers', 22, null, 'Bundle of 5 domestic canned beers. Not yet costed -- this is a mixed drink / bundle without a known ratio. Edit this recipe to replace the placeholder ingredient with the real components once you have the recipe.'),
  ('Imports Bucket', 'Bar', 'Buckets for the Pack', '5 beers', 30, null, 'Bundle of 5 import canned beers. Not yet costed -- this is a mixed drink / bundle without a known ratio. Edit this recipe to replace the placeholder ingredient with the real components once you have the recipe.'),
  ('Hard Teas / Lemonades / Seltzers Bucket', 'Bar', 'Buckets for the Pack', '5 drinks', 35, null, 'Bundle of 5 hard teas, lemonades, or seltzers. Not yet costed -- this is a mixed drink / bundle without a known ratio. Edit this recipe to replace the placeholder ingredient with the real components once you have the recipe.');

-- 3. Recipe ingredients. insert-from-select so a name that fails to
-- match inserts ZERO rows instead of a row with a NULL item_id.
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 0.008064516129032258, 'keg'
from recipes r, inventory_items i
where r.name = 'Crooked Can - Cloud Chaser' and i.name = 'Crooked Can – Cloud Chaser (Hefeweizen 5.3%)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 0.008064516129032258, 'keg'
from recipes r, inventory_items i
where r.name = 'Crooked Can - Sixth Man' and i.name = 'Crooked Can – Sixth Man (Lager 4.6%)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 0.008064516129032258, 'keg'
from recipes r, inventory_items i
where r.name = 'Crooked Can - Hit The Haze' and i.name = 'Crooked Can – Hit The Haze (Hazy IPA 6.1%)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 0.008064516129032258, 'keg'
from recipes r, inventory_items i
where r.name = 'Ivanhoe Park - Park Hopper' and i.name = 'Ivanhoe Park – Park Hopper (Czech Pilsner 5.0%)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 0.008064516129032258, 'keg'
from recipes r, inventory_items i
where r.name = 'Keel Farms - Elderberry Cider' and i.name = 'Keel Farms – Elderberry Cider (5.3%)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 0.008064516129032258, 'keg'
from recipes r, inventory_items i
where r.name = 'Guinness Stout' and i.name = 'Guinness Stout (4.2%)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 0.008064516129032258, 'keg'
from recipes r, inventory_items i
where r.name = 'Lagunitas IPA' and i.name = 'Lagunitas (6.2%)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 0.008064516129032258, 'keg'
from recipes r, inventory_items i
where r.name = 'Kona Big Wave' and i.name = 'Kona Big Wave (4.4%)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 0.008064516129032258, 'keg'
from recipes r, inventory_items i
where r.name = 'Blue Moon' and i.name = 'Blue Moon (5.4%)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 0.008064516129032258, 'keg'
from recipes r, inventory_items i
where r.name = 'Narragansett' and i.name = 'Narragansett (5.0%)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 0.008064516129032258, 'keg'
from recipes r, inventory_items i
where r.name = 'Yuengling' and i.name = 'Yuengling (4.5%)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 0.008064516129032258, 'keg'
from recipes r, inventory_items i
where r.name = 'Bud Light (Draft)' and i.name = 'Bud Light – Draft (4.2%)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 1, 'Can'
from recipes r, inventory_items i
where r.name = 'Bud Light' and i.name = 'Bud Light (can)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 1, 'each'
from recipes r, inventory_items i
where r.name = 'Michelob Ultra' and i.name = 'Michelob Ultra (can)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 1, 'each'
from recipes r, inventory_items i
where r.name = 'Miller Lite' and i.name = 'Miller Lite (can)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 1, 'each'
from recipes r, inventory_items i
where r.name = 'Coors Light' and i.name = 'Coors Light (can)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 1, 'each'
from recipes r, inventory_items i
where r.name = 'Corona' and i.name = 'Corona (can)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 1, 'each'
from recipes r, inventory_items i
where r.name = 'Modelo' and i.name = 'Modelo (can)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 1, 'each'
from recipes r, inventory_items i
where r.name = 'Stella Artois' and i.name = 'Stella Artois (can)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 1, 'each'
from recipes r, inventory_items i
where r.name = 'Heineken' and i.name = 'Heineken (can)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 1, 'each'
from recipes r, inventory_items i
where r.name = 'Jai Alai IPA' and i.name = 'Jai Alai IPA (can)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 1, 'each'
from recipes r, inventory_items i
where r.name = 'Ivanhoe Park Guava' and i.name = 'Ivanhoe – Guava (can)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 1, 'each'
from recipes r, inventory_items i
where r.name = 'Good Boy Blackberry Tea' and i.name = 'Good Boy – Blackberry Tea (can)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 1, 'each'
from recipes r, inventory_items i
where r.name = 'Good Boy Hard Tea' and i.name = 'Good Boy – Hard Tea (can)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 1, 'each'
from recipes r, inventory_items i
where r.name = 'Lucky One Peach Lemonade' and i.name = 'Lucky One – Peach Lemonade (can)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 1, 'each'
from recipes r, inventory_items i
where r.name = 'Lucky One Raspberry' and i.name = 'Lucky One – Raspberry (can)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 1, 'each'
from recipes r, inventory_items i
where r.name = 'Twisted Tea Half & Half' and i.name = 'Twisted Tea – Half & Half (can)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 1, 'each'
from recipes r, inventory_items i
where r.name = 'High Noon Watermelon' and i.name = 'High Noon – Watermelon (can)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 1, 'each'
from recipes r, inventory_items i
where r.name = 'High Noon Pineapple' and i.name = 'High Noon – Pineapple (can)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 1, 'each'
from recipes r, inventory_items i
where r.name = 'Good Boy Strawberry Hibiscus' and i.name = 'Good Boy – Strawberry Hibiscus (can)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 1, 'each'
from recipes r, inventory_items i
where r.name = 'Carbliss Black Raspberry' and i.name = 'Carbliss – Black Raspberry (can)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 1, 'each'
from recipes r, inventory_items i
where r.name = 'Carbliss Mango' and i.name = 'Carbliss – Mango (can)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 1, 'each'
from recipes r, inventory_items i
where r.name = 'Jack Daniel''s & Coca-Cola' and i.name = 'Jack Daniel''s & Coca-Cola (can)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 1, 'each'
from recipes r, inventory_items i
where r.name = 'Two Chicks Paloma' and i.name = 'Two Chicks Paloma (can)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 1, 'each'
from recipes r, inventory_items i
where r.name = 'Piña Colada' and i.name = 'TBD - Recipe Not Yet Built (placeholder ingredient)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 1, 'each'
from recipes r, inventory_items i
where r.name = 'Strawberry Frost' and i.name = 'TBD - Recipe Not Yet Built (placeholder ingredient)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 0.1968503937007874, 'bottle'
from recipes r, inventory_items i
where r.name = 'Flores Carolina Mata Sparkling' and i.name = 'Flores Carolina Mata – Sparkling (Spain)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 0.1968503937007874, 'bottle'
from recipes r, inventory_items i
where r.name = 'Santa Marina Pinot Grigio' and i.name = 'Santa Marina – Pinot Grigio (Italy)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 0.1968503937007874, 'bottle'
from recipes r, inventory_items i
where r.name = 'Mohua Sauvignon Blanc' and i.name = 'Mohua – Sauvignon Blanc (New Zealand)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 0.1968503937007874, 'bottle'
from recipes r, inventory_items i
where r.name = 'Daou Chardonnay' and i.name = 'Daou – Chardonnay (Paso Robles)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 0.1968503937007874, 'bottle'
from recipes r, inventory_items i
where r.name = 'La Vieille Ferme Rosé' and i.name = 'La Vieille Ferme – Rosé (France)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 0.1968503937007874, 'bottle'
from recipes r, inventory_items i
where r.name = 'Bulletin Place Cabernet Sauvignon' and i.name = 'Bulletin Place – Cabernet Sauvignon (Australia)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 0.1968503937007874, 'bottle'
from recipes r, inventory_items i
where r.name = 'Daou Cabernet Sauvignon' and i.name = 'Daou – Cabernet Sauvignon (Paso Robles)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 0.1968503937007874, 'bottle'
from recipes r, inventory_items i
where r.name = 'Wild Hills Pinot Noir' and i.name = 'Wild Hills – Pinot Noir (Willamette Valley)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 1, 'each'
from recipes r, inventory_items i
where r.name = 'Brez Social Lemon Elderflower' and i.name = 'Brez Social Lemon Elderflower (10mg CBD, 5mg THC) (can)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 1, 'each'
from recipes r, inventory_items i
where r.name = 'Serenity Mint & Lemongrass Kombucha' and i.name = 'Serenity – Mint & Lemongrass Kombucha (can)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 1, 'each'
from recipes r, inventory_items i
where r.name = 'Strawberry & Lavender Lemonade Kombucha' and i.name = 'Strawberry & Lavender Lemonade Kombucha (can)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 1, 'each'
from recipes r, inventory_items i
where r.name = 'Mimosa (Glass)' and i.name = 'TBD - Recipe Not Yet Built (placeholder ingredient)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 1, 'each'
from recipes r, inventory_items i
where r.name = 'Mimosa (Carafe)' and i.name = 'TBD - Recipe Not Yet Built (placeholder ingredient)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 0.1968503937007874, 'bottle'
from recipes r, inventory_items i
where r.name = 'Sangria (Glass)' and i.name = 'Sangria';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 1, 'bottle'
from recipes r, inventory_items i
where r.name = 'Sangria (Carafe)' and i.name = 'Sangria';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 1, 'each'
from recipes r, inventory_items i
where r.name = 'Domestics Bucket' and i.name = 'TBD - Recipe Not Yet Built (placeholder ingredient)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 1, 'each'
from recipes r, inventory_items i
where r.name = 'Imports Bucket' and i.name = 'TBD - Recipe Not Yet Built (placeholder ingredient)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 1, 'each'
from recipes r, inventory_items i
where r.name = 'Hard Teas / Lemonades / Seltzers Bucket' and i.name = 'TBD - Recipe Not Yet Built (placeholder ingredient)';

-- 4. Verification: expected 54 ingredient rows across 54 recipes.
select count(*) as ingredient_rows_inserted from recipe_ingredients
where recipe_id in (select id from recipes where name in (
  'Crooked Can - Cloud Chaser',
  'Crooked Can - Sixth Man',
  'Crooked Can - Hit The Haze',
  'Ivanhoe Park - Park Hopper',
  'Keel Farms - Elderberry Cider',
  'Guinness Stout',
  'Lagunitas IPA',
  'Kona Big Wave',
  'Blue Moon',
  'Narragansett',
  'Yuengling',
  'Bud Light (Draft)',
  'Bud Light',
  'Michelob Ultra',
  'Miller Lite',
  'Coors Light',
  'Corona',
  'Modelo',
  'Stella Artois',
  'Heineken',
  'Jai Alai IPA',
  'Ivanhoe Park Guava',
  'Good Boy Blackberry Tea',
  'Good Boy Hard Tea',
  'Lucky One Peach Lemonade',
  'Lucky One Raspberry',
  'Twisted Tea Half & Half',
  'High Noon Watermelon',
  'High Noon Pineapple',
  'Good Boy Strawberry Hibiscus',
  'Carbliss Black Raspberry',
  'Carbliss Mango',
  'Jack Daniel''s & Coca-Cola',
  'Two Chicks Paloma',
  'Piña Colada',
  'Strawberry Frost',
  'Flores Carolina Mata Sparkling',
  'Santa Marina Pinot Grigio',
  'Mohua Sauvignon Blanc',
  'Daou Chardonnay',
  'La Vieille Ferme Rosé',
  'Bulletin Place Cabernet Sauvignon',
  'Daou Cabernet Sauvignon',
  'Wild Hills Pinot Noir',
  'Brez Social Lemon Elderflower',
  'Serenity Mint & Lemongrass Kombucha',
  'Strawberry & Lavender Lemonade Kombucha',
  'Mimosa (Glass)',
  'Mimosa (Carafe)',
  'Sangria (Glass)',
  'Sangria (Carafe)',
  'Domestics Bucket',
  'Imports Bucket',
  'Hard Teas / Lemonades / Seltzers Bucket'
));

-- Any row returned below means that ingredient name is MISSING from
-- inventory_items and its recipe_ingredients row was silently skipped
-- above -- fix the name (or add the item), then re-run just that insert.
select expected.name as missing_ingredient_name
from (values
  ('Crooked Can – Cloud Chaser (Hefeweizen 5.3%)'),
  ('Crooked Can – Sixth Man (Lager 4.6%)'),
  ('Crooked Can – Hit The Haze (Hazy IPA 6.1%)'),
  ('Ivanhoe Park – Park Hopper (Czech Pilsner 5.0%)'),
  ('Keel Farms – Elderberry Cider (5.3%)'),
  ('Guinness Stout (4.2%)'),
  ('Lagunitas (6.2%)'),
  ('Kona Big Wave (4.4%)'),
  ('Blue Moon (5.4%)'),
  ('Narragansett (5.0%)'),
  ('Yuengling (4.5%)'),
  ('Bud Light – Draft (4.2%)'),
  ('Bud Light (can)'),
  ('Michelob Ultra (can)'),
  ('Miller Lite (can)'),
  ('Coors Light (can)'),
  ('Corona (can)'),
  ('Modelo (can)'),
  ('Stella Artois (can)'),
  ('Heineken (can)'),
  ('Jai Alai IPA (can)'),
  ('Ivanhoe – Guava (can)'),
  ('Good Boy – Blackberry Tea (can)'),
  ('Good Boy – Hard Tea (can)'),
  ('Lucky One – Peach Lemonade (can)'),
  ('Lucky One – Raspberry (can)'),
  ('Twisted Tea – Half & Half (can)'),
  ('High Noon – Watermelon (can)'),
  ('High Noon – Pineapple (can)'),
  ('Good Boy – Strawberry Hibiscus (can)'),
  ('Carbliss – Black Raspberry (can)'),
  ('Carbliss – Mango (can)'),
  ('Jack Daniel''s & Coca-Cola (can)'),
  ('Two Chicks Paloma (can)'),
  ('TBD - Recipe Not Yet Built (placeholder ingredient)'),
  ('Flores Carolina Mata – Sparkling (Spain)'),
  ('Santa Marina – Pinot Grigio (Italy)'),
  ('Mohua – Sauvignon Blanc (New Zealand)'),
  ('Daou – Chardonnay (Paso Robles)'),
  ('La Vieille Ferme – Rosé (France)'),
  ('Bulletin Place – Cabernet Sauvignon (Australia)'),
  ('Daou – Cabernet Sauvignon (Paso Robles)'),
  ('Wild Hills – Pinot Noir (Willamette Valley)'),
  ('Brez Social Lemon Elderflower (10mg CBD, 5mg THC) (can)'),
  ('Serenity – Mint & Lemongrass Kombucha (can)'),
  ('Strawberry & Lavender Lemonade Kombucha (can)'),
  ('Sangria')
) as expected(name)
left join inventory_items i on i.name = expected.name
where i.id is null;

-- recipes: 54, ingredient lines: 54
