-- Recipe book import: fixes, stub items, 25 recipes + ingredients

-- 1. Fix recipe_unit -> oz on existing items already weight/volume-tracked
update inventory_items set recipe_unit = 'oz'
where name in (
  'Chicken Breast (grilled)',
  'Mozzarella (shredded)',
  'Parmesan (grated)',
  'Parmesan (shaved)',
  'Feta Cheese',
  'Spring Mix / Greens',
  'Romaine Lettuce - Hearts',
  'Carrot (shredded)',
  'Red Onion',
  'Sliced Almonds',
  'Ken''s Caesar Dressing',
  'Ken''s Balsamic Vinaigrette',
  'Ken''s Ranch Dressing Homestyle',
  'Ken''s Garlic Aioli',
  'Cattlemen''s Base BBQ Sauce',
  'Hot Honey - (Made in House) Apple Cider Vin.',
  'Balsamic Glaze / Drizzle',
  'Olive Oil',
  'Meatballs 2 oz',
  'French Fries',
  'Italian Sausage (topping)',
  'Pepperoni',
  'Strawberries',
  'Carrot (sticks)',
  'Cucumber',
  'Pesto',
  'Bacon (topping)'
);

-- 2. New unpriced "recipe-use" stub items (count/slice/pack-based, can't auto-convert)
insert into inventory_items (name, category_tag, recipe_unit, purchase_unit, pack_qty, size_per_inner, size_uom)
values
  ('Chicken Wings (each)', 'Food', 'each', 'each', 1, 1, 'each'),
  ('Carrot Stick (each)', 'Food', 'each', 'each', 1, 1, 'each'),
  ('Celery Stick (each)', 'Food', 'each', 'each', 1, 1, 'each'),
  ('Mozzarella Shredded (pinch)', 'Food', 'pinch', 'pinch', 1, 1, 'pinch'),
  ('Dried Parsley (pinch)', 'Food', 'pinch', 'pinch', 1, 1, 'pinch'),
  ('Butter (Tbsp)', 'Food', 'Tbsp', 'Tbsp', 1, 1, 'Tbsp'),
  ('Chicken Tenders (each)', 'Food', 'each', 'each', 1, 1, 'each'),
  ('Cherry Tomatoes (each)', 'Food', 'each', 'each', 1, 1, 'each'),
  ('Cucumber (slice)', 'Food', 'each', 'each', 1, 1, 'each'),
  ('Croutons (each)', 'Food', 'each', 'each', 1, 1, 'each'),
  ('Strawberries (each)', 'Food', 'each', 'each', 1, 1, 'each'),
  ('Ricotta Cheese (dollop)', 'Food', 'each', 'each', 1, 1, 'each'),
  ('Ricotta Cheese (oz)', 'Food', 'oz', 'oz', 1, 1, 'oz'),
  ('Mozzarella Fresh (slice)', 'Food', 'each', 'each', 1, 1, 'each'),
  ('Roma Tomatoes (slice)', 'Food', 'each', 'each', 1, 1, 'each'),
  ('Dried Cilantro (pinch)', 'Food', 'pinch', 'pinch', 1, 1, 'pinch'),
  ('Sourdough Bread (slice)', 'Food', 'each', 'each', 1, 1, 'each'),
  ('Turkey (slice)', 'Food', 'each', 'each', 1, 1, 'each'),
  ('Swiss Cheese (slice)', 'Food', 'each', 'each', 1, 1, 'each'),
  ('Ham (slice)', 'Food', 'each', 'each', 1, 1, 'each'),
  ('Cheddar Cheese (slice)', 'Food', 'each', 'each', 1, 1, 'each'),
  ('Bacon (strip)', 'Food', 'each', 'each', 1, 1, 'each'),
  ('Romaine Sandwich Leaf (each)', 'Food', 'each', 'each', 1, 1, 'each'),
  ('Pickle (slice)', 'Food', 'each', 'each', 1, 1, 'each'),
  ('Flour Tortilla 12in (each)', 'Food', 'each', 'each', 1, 1, 'each'),
  ('Chocolate Chip Cookies (each)', 'Food', 'each', 'each', 1, 1, 'each'),
  ('Vanilla Ice Cream (scoop)', 'Food', 'each', 'each', 1, 1, 'each'),
  ('Peanut Butter (oz)', 'Food', 'oz', 'oz', 1, 1, 'oz'),
  ('Blueberries (oz)', 'Food', 'oz', 'oz', 1, 1, 'oz'),
  ('Greek Yogurt Dip (oz)', 'Food', 'oz', 'oz', 1, 1, 'oz'),
  ('Rice (cup)', 'Food', 'cup', 'cup', 1, 1, 'cup'),
  ('Veggies Frozen Mix (cup)', 'Food', 'cup', 'cup', 1, 1, 'cup'),
  ('Whipped Cream (oz)', 'Food', 'oz', 'oz', 1, 1, 'oz');

-- 3. Recipes
insert into recipes (name, category_tag, menu_category, yield, menu_price, labor_minutes, prep_notes)
values
  ('Chicken Wings', 'Food', 'Cravings', '6 wings', 10, 2, 'Cook at 500F/4min in Speed Oven, then run through conveyor for golden-crispy texture (internal temp 165F min). Tossed: coat in mixing bowl with chosen sauce. Sauce-on-side: 2oz ramekin. Sauce/rub options (not priced here, doesn''t change menu price): BBQ, Buffalo (wet, 2oz/6 wings); Lemon Pepper, Chili Rub (dry, 1oz/6 wings); Garlic Parm (1/4 cup butter, 1 minced garlic clove, 2oz parm, salt/pepper to taste, per 6 wings). Plate with Dougie''s logo liner; serve with matching # of carrot/celery sticks. 12-wing order scales all quantities x2, menu price $18.'),
  ('Meatball Sliders', 'Food', 'Cravings', '1 order (2 sliders)', 12, null, 'Toast 4 roll slices face-down on conveyor 450F/2min until golden. 1 pinch mozzarella on bottom+top of each bun, 1 meatball per slider, additional pinch mozzarella on top of meatball. Rub melted butter on tops, sprinkle dried parsley. Secure with skewer. Plate with Dougie''s logo liner on metal tray (dine-in) or in to-go container.'),
  ('Parmesan Fries', 'Food', 'Cravings', '1 order', 12, null, 'Cook fries 500F/3min in Speed Oven until golden/crispy. Toss with olive oil + melted butter, dried parsley, salt & pepper, then grated parmesan. Pile high (not spread out). Serve with 2oz aioli ramekin, garnish with extra parmesan/parsley on sauce.'),
  ('Chicken Tenders', 'Food', 'Cravings', '4 tenders + fries', 14, 2, 'Tenders: Speed Oven 500F/4min until golden-brown, internal temp 165F min. Fries: Speed Oven 500F/3min until golden/crispy. Serve with customer''s choice of dipping sauce (Ranch/Honey Mustard/Bleu Cheese/Aioli/BBQ/Buffalo/Ketchup/Mayo, not priced) in 2oz ramekin. Fries in mini fry basket w/ logo liner (dine-in).'),
  ('Kids Chicken Tenders', 'Food', 'For Kids', '2 tenders + chips or fries', 8, 2, 'Ages 12 & under; served with small soft drink or juice. Tenders: Speed Oven 500F/4min, internal temp 165F min. Fries: 500F/3min, OR sub 1oz chips. Choice of dipping sauce (not priced) in 2oz ramekin.'),
  ('Chicken Bacon Ranch Quesadilla', 'Food', 'Cravings', '1 order (4 pieces)', 14, null, 'Layer mozzarella, chicken, bacon on half of 12in tortilla, drizzle ranch. Cook on conveyor 450F/3min until golden/crispy, cheese melted. Fold, cut into 4 pieces, garnish with dried parsley. Serve with 2oz ranch ramekin. Dine-in: 4 pieces fanned. To-go: stacked.'),
  ('Kids Cheese Quesadilla', 'Food', 'For Kids', '1 order (4 pieces)', 8, 2, 'Sprinkle mozzarella on half of 12in tortilla, fold. Cook on conveyor 450F/3min until golden/crispy, cheese melted. Cut into 4 pieces. Dine-in: fanned. To-go: stacked.'),
  ('House Salad', 'Food', 'Salads', '1 salad', 12, 3, 'Chilled bowl: spring mix base, halved cherry tomatoes, cucumber slices (halved), shredded carrot, croutons — all spread evenly. Dressing of choice (not priced) 2oz ramekin on side. Optional +$5 grilled chicken (4oz, Speed Oven 500F/60sec, 165F min). Side House Salad = half all ingredients.'),
  ('Caesar Salad', 'Food', 'Salads', '1 salad', 13, 3, 'ASSUMPTION: prep time inferred as 3 min (illegible in source, matched to sibling salad recipes) — verify. Combine romaine, shaved parmesan, caesar dressing, croutons in large bowl, toss until evenly coated. Garnish w/ 2 crushed croutons. Optional +$5 grilled chicken (4oz, Speed Oven 500F/60sec, 165F min).'),
  ('Strawberry Feta Salad', 'Food', 'Salads', '1 salad', 13, 3, 'Chilled bowl: spring mix base, thin-sliced strawberries, sliced almonds, feta — spread evenly. Balsamic vinaigrette 2oz ramekin on side. Optional +$5 grilled chicken (4oz, Speed Oven 500F/60sec, 165F min).'),
  ('Hot Dougie Pizza', 'Food', 'From The Oven', '8in pizza (4 slices)', 15, 2, 'Signature pie. Basil/oregano blend on sauce, mozzarella, Italian sausage. Conveyor 475F/4min until golden/bubbled. Cut into 4. Top w/ ricotta dollop per slice, dried parsley, hot honey drizzle. Rub melted butter on crust. Pizza box + logo liner (to-go) or metal tray + liner (dine-in).'),
  ('Margherita Pizza', 'Food', 'From The Oven', '8in pizza (4 slices)', 14, 2, 'Basil/oregano blend on sauce, fresh mozzarella chunks, tomato pinwheel. Conveyor 475F/4min until golden/bubbled. Cut into 4, garnish fresh basil, drizzle olive oil, rub melted butter on crust.'),
  ('Pepperoni Pizza', 'Food', 'From The Oven', '8in pizza (4 slices)', 12, 2, 'Basil/oregano blend on sauce, mozzarella, evenly-spaced pepperoni (3 slices/piece). Conveyor 475F/4min until golden/bubbled. Cut into 4, rub melted butter on crust.'),
  ('Cheese Pizza', 'Food', 'From The Oven', '8in pizza (4 slices)', 11, 2, 'Mozzarella evenly spread. Conveyor 475F/4min until golden/bubbled. Cut into 4, rub melted butter on crust.'),
  ('BBQ Chicken Flatbread', 'Food', 'Flatbreads', '1 flatbread (8 pieces)', 12, 2, 'Straight from fridge, no defrost. BBQ base, mozzarella, diced chicken, red onion. Conveyor 475F/3min until golden/bubbled. Garnish dried cilantro, ranch + BBQ zigzag drizzle. Cut into 8 pieces. Large metal tray + 2 logo liners (dine-in) or flatbread box + liner (to-go).'),
  ('Pesto Flatbread', 'Food', 'Flatbreads', '1 flatbread (8 pieces)', 14, 2, 'Straight from fridge, no defrost. Pesto base, ricotta dollops, cherry tomato halves face-down. Conveyor 475F/3min until golden/bubbled. Top w/ chopped spring mix, balsamic glaze zigzag. Cut into 8 pieces. Large metal tray + 2 logo liners (dine-in) or flatbread box + liner (to-go).'),
  ('Dog House Club', 'Food', 'Handhelds', '1 sandwich', 16, 3, 'Toast 2 sourdough slices. Build bottom-to-top: turkey, Swiss, ham, cheddar, bacon, lettuce, tomato (order matters). Spread garlic aioli on toasted bread. Slice diagonally, skewer each half. Served w/ kettle chips or house salad (upgrade to fries +2).'),
  ('Grilled Chicken Sandwich', 'Food', 'Handhelds', '1 sandwich', 16, 3, 'ASSUMPTION: prep time inferred as 3 min (illegible in source, matched to sibling sandwich recipes) — verify. Toast focaccia halves 450F/2min. Chicken breast Speed Oven 500F/60sec (165F min). Spread garlic aioli on toasted bread. Build: chicken, pickle, tomato, lettuce. Slice in half, skewer each side. Served w/ kettle chips or house salad (upgrade to fries +2).'),
  ('Caprese Sandwich', 'Food', 'Handhelds', '1 sandwich', 14, 3, 'Toast focaccia halves 450F/2min. Spread balsamic glaze on both sides. Build bottom half up: spring mix, tomato slices, fresh mozzarella, fresh basil, olive oil drizzle. Slice in half, skewer each side. Served w/ kettle chips or house salad (upgrade to fries +2).'),
  ('Chicken Caesar Wrap', 'Food', 'Handhelds', '1 wrap', 14, 3, 'Guest favorite. Toss romaine, shaved parmesan, diced grilled chicken, caesar dressing; mix in crushed croutons last. Place mixture across center of 12in tortilla, fold sides in, fold bottom up, roll tightly, slice diagonally, skewer each side. Served w/ kettle chips or house salad (upgrade to fries +2).'),
  ('Ice Cream Cookie Sandwich', 'Food', 'Sweets', '1 sandwich', 6, 2, 'Warm both cookies briefly (Speed Oven 500F/5sec). Let cool before assembling. Scoop vanilla ice cream onto flat side of one cookie, press second cookie on top gently (should reach edges, not overflow). Serve immediately — do not hold assembled. Dine-in only, cannot be made to-go.'),
  ('Bark-Cuterie Board', 'Food', 'Dog Menu', '1 board', 10, 4, 'Served on keepsake frisbee (guest keeps). Peanut butter dollop center, surrounded circularly by: strawberries, blueberries, carrot sticks, cucumber slices. Pipe 3 Greek yogurt dollops in triangular formation for presentation. Dine-in only, cannot be made to-go.'),
  ('Barking Bowl', 'Food', 'Dog Menu', '1 bowl', 8, 2, 'Chicken Speed Oven 500F/60sec (165F min). Rice Speed Oven 500F/30sec. Mixed veggies Speed Oven 500F/45sec. Plate in to-go container: rice center, veggies circling rice, chicken on top of veggies. No liner.'),
  ('Pupcorn Chicken', 'Food', 'Dog Menu', '1 order', 5, 2, 'Baked chicken bites. Chicken Speed Oven 500F/60sec (165F min), dice into bite-sized pieces. Plate in paper food boat (dine-in) or to-go container, no liner.'),
  ('Pup Cup Sundae', 'Food', 'Dog Menu', '1 sundae', 4, 3, 'Smear peanut butter inside 4oz logo paper cup. Add whipped cream in circular motion. Melt remaining peanut butter (hover spreader near conveyor heat), drizzle on top. Place branded dog treat horizontally on top. Serve immediately — do not hold assembled. Dine-in only, cannot be made to-go.');

-- 4. Recipe ingredients. Uses insert-from-select (not insert-values) so a
-- name that fails to match inserts ZERO rows instead of a row with a
-- NULL item_id (item_id has no NOT NULL/FK-required constraint, so a typo
-- would otherwise fail silently).
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 6, 'each'
from recipes r, inventory_items i
where r.name = 'Chicken Wings' and i.name = 'Chicken Wings (each)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 1, 'each'
from recipes r, inventory_items i
where r.name = 'Chicken Wings' and i.name = 'Carrot Stick (each)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 1, 'each'
from recipes r, inventory_items i
where r.name = 'Chicken Wings' and i.name = 'Celery Stick (each)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 2, 'each'
from recipes r, inventory_items i
where r.name = 'Meatball Sliders' and i.name = 'Slider Rolls';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 6, 'oz'
from recipes r, inventory_items i
where r.name = 'Meatball Sliders' and i.name = 'Meatballs 2 oz';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 6, 'pinch'
from recipes r, inventory_items i
where r.name = 'Meatball Sliders' and i.name = 'Mozzarella Shredded (pinch)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 1, 'pinch'
from recipes r, inventory_items i
where r.name = 'Meatball Sliders' and i.name = 'Dried Parsley (pinch)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 12, 'oz'
from recipes r, inventory_items i
where r.name = 'Parmesan Fries' and i.name = 'French Fries';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 2, 'oz'
from recipes r, inventory_items i
where r.name = 'Parmesan Fries' and i.name = 'Parmesan (grated)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 1, 'oz'
from recipes r, inventory_items i
where r.name = 'Parmesan Fries' and i.name = 'Olive Oil';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 1, 'Tbsp'
from recipes r, inventory_items i
where r.name = 'Parmesan Fries' and i.name = 'Butter (Tbsp)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 1, 'pinch'
from recipes r, inventory_items i
where r.name = 'Parmesan Fries' and i.name = 'Dried Parsley (pinch)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 2, 'oz'
from recipes r, inventory_items i
where r.name = 'Parmesan Fries' and i.name = 'Ken''s Garlic Aioli';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 4, 'each'
from recipes r, inventory_items i
where r.name = 'Chicken Tenders' and i.name = 'Chicken Tenders (each)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 6, 'oz'
from recipes r, inventory_items i
where r.name = 'Chicken Tenders' and i.name = 'French Fries';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 2, 'each'
from recipes r, inventory_items i
where r.name = 'Kids Chicken Tenders' and i.name = 'Chicken Tenders (each)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 6, 'oz'
from recipes r, inventory_items i
where r.name = 'Kids Chicken Tenders' and i.name = 'French Fries';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 1, 'each'
from recipes r, inventory_items i
where r.name = 'Chicken Bacon Ranch Quesadilla' and i.name = 'Flour Tortilla 12in (each)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 2, 'oz'
from recipes r, inventory_items i
where r.name = 'Chicken Bacon Ranch Quesadilla' and i.name = 'Mozzarella (shredded)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 2, 'oz'
from recipes r, inventory_items i
where r.name = 'Chicken Bacon Ranch Quesadilla' and i.name = 'Chicken Breast (grilled)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 1, 'oz'
from recipes r, inventory_items i
where r.name = 'Chicken Bacon Ranch Quesadilla' and i.name = 'Bacon (topping)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 1, 'oz'
from recipes r, inventory_items i
where r.name = 'Chicken Bacon Ranch Quesadilla' and i.name = 'Ken''s Ranch Dressing Homestyle';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 1, 'pinch'
from recipes r, inventory_items i
where r.name = 'Chicken Bacon Ranch Quesadilla' and i.name = 'Dried Parsley (pinch)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 1, 'each'
from recipes r, inventory_items i
where r.name = 'Kids Cheese Quesadilla' and i.name = 'Flour Tortilla 12in (each)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 2, 'oz'
from recipes r, inventory_items i
where r.name = 'Kids Cheese Quesadilla' and i.name = 'Mozzarella (shredded)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 5, 'oz'
from recipes r, inventory_items i
where r.name = 'House Salad' and i.name = 'Spring Mix / Greens';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 4, 'each'
from recipes r, inventory_items i
where r.name = 'House Salad' and i.name = 'Cherry Tomatoes (each)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 4, 'each'
from recipes r, inventory_items i
where r.name = 'House Salad' and i.name = 'Cucumber (slice)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 2, 'oz'
from recipes r, inventory_items i
where r.name = 'House Salad' and i.name = 'Carrot (shredded)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 8, 'each'
from recipes r, inventory_items i
where r.name = 'House Salad' and i.name = 'Croutons (each)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 5, 'oz'
from recipes r, inventory_items i
where r.name = 'Caesar Salad' and i.name = 'Romaine Lettuce - Hearts';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 2, 'oz'
from recipes r, inventory_items i
where r.name = 'Caesar Salad' and i.name = 'Parmesan (shaved)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 10, 'each'
from recipes r, inventory_items i
where r.name = 'Caesar Salad' and i.name = 'Croutons (each)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 2, 'oz'
from recipes r, inventory_items i
where r.name = 'Caesar Salad' and i.name = 'Ken''s Caesar Dressing';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 5, 'oz'
from recipes r, inventory_items i
where r.name = 'Strawberry Feta Salad' and i.name = 'Spring Mix / Greens';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 8, 'each'
from recipes r, inventory_items i
where r.name = 'Strawberry Feta Salad' and i.name = 'Strawberries (each)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 0.5, 'oz'
from recipes r, inventory_items i
where r.name = 'Strawberry Feta Salad' and i.name = 'Sliced Almonds';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 3, 'oz'
from recipes r, inventory_items i
where r.name = 'Strawberry Feta Salad' and i.name = 'Feta Cheese';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 2, 'oz'
from recipes r, inventory_items i
where r.name = 'Strawberry Feta Salad' and i.name = 'Ken''s Balsamic Vinaigrette';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 1, 'each'
from recipes r, inventory_items i
where r.name = 'Hot Dougie Pizza' and i.name = 'Par Baked-Pre Sauced Pizza Dough (8")';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 2, 'oz'
from recipes r, inventory_items i
where r.name = 'Hot Dougie Pizza' and i.name = 'Mozzarella (shredded)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 1, 'oz'
from recipes r, inventory_items i
where r.name = 'Hot Dougie Pizza' and i.name = 'Italian Sausage (topping)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 4, 'each'
from recipes r, inventory_items i
where r.name = 'Hot Dougie Pizza' and i.name = 'Ricotta Cheese (dollop)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 1, 'pinch'
from recipes r, inventory_items i
where r.name = 'Hot Dougie Pizza' and i.name = 'Dried Parsley (pinch)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 1, 'oz'
from recipes r, inventory_items i
where r.name = 'Hot Dougie Pizza' and i.name = 'Hot Honey - (Made in House) Apple Cider Vin.';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 1, 'each'
from recipes r, inventory_items i
where r.name = 'Margherita Pizza' and i.name = 'Par Baked-Pre Sauced Pizza Dough (8")';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 1, 'each'
from recipes r, inventory_items i
where r.name = 'Margherita Pizza' and i.name = 'Mozzarella Fresh (slice)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 4, 'each'
from recipes r, inventory_items i
where r.name = 'Margherita Pizza' and i.name = 'Roma Tomatoes (slice)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 1, 'oz'
from recipes r, inventory_items i
where r.name = 'Margherita Pizza' and i.name = 'Olive Oil';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 1, 'each'
from recipes r, inventory_items i
where r.name = 'Pepperoni Pizza' and i.name = 'Par Baked-Pre Sauced Pizza Dough (8")';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 2, 'oz'
from recipes r, inventory_items i
where r.name = 'Pepperoni Pizza' and i.name = 'Mozzarella (shredded)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 0.5, 'oz'
from recipes r, inventory_items i
where r.name = 'Pepperoni Pizza' and i.name = 'Pepperoni';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 1, 'each'
from recipes r, inventory_items i
where r.name = 'Cheese Pizza' and i.name = 'Par Baked-Pre Sauced Pizza Dough (8")';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 2, 'oz'
from recipes r, inventory_items i
where r.name = 'Cheese Pizza' and i.name = 'Mozzarella (shredded)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 1, 'each'
from recipes r, inventory_items i
where r.name = 'BBQ Chicken Flatbread' and i.name = 'Flatbread Crust';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 3, 'oz'
from recipes r, inventory_items i
where r.name = 'BBQ Chicken Flatbread' and i.name = 'Cattlemen''s Base BBQ Sauce';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 2, 'oz'
from recipes r, inventory_items i
where r.name = 'BBQ Chicken Flatbread' and i.name = 'Mozzarella (shredded)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 2, 'oz'
from recipes r, inventory_items i
where r.name = 'BBQ Chicken Flatbread' and i.name = 'Chicken Breast (grilled)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 1, 'oz'
from recipes r, inventory_items i
where r.name = 'BBQ Chicken Flatbread' and i.name = 'Red Onion';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 1, 'pinch'
from recipes r, inventory_items i
where r.name = 'BBQ Chicken Flatbread' and i.name = 'Dried Cilantro (pinch)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 1, 'oz'
from recipes r, inventory_items i
where r.name = 'BBQ Chicken Flatbread' and i.name = 'Ken''s Ranch Dressing Homestyle';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 1, 'each'
from recipes r, inventory_items i
where r.name = 'Pesto Flatbread' and i.name = 'Flatbread Crust';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 1.5, 'oz'
from recipes r, inventory_items i
where r.name = 'Pesto Flatbread' and i.name = 'Pesto';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 2, 'oz'
from recipes r, inventory_items i
where r.name = 'Pesto Flatbread' and i.name = 'Ricotta Cheese (oz)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 4, 'each'
from recipes r, inventory_items i
where r.name = 'Pesto Flatbread' and i.name = 'Cherry Tomatoes (each)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 1, 'oz'
from recipes r, inventory_items i
where r.name = 'Pesto Flatbread' and i.name = 'Spring Mix / Greens';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 1, 'oz'
from recipes r, inventory_items i
where r.name = 'Pesto Flatbread' and i.name = 'Balsamic Glaze / Drizzle';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 2, 'each'
from recipes r, inventory_items i
where r.name = 'Dog House Club' and i.name = 'Sourdough Bread (slice)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 1, 'oz'
from recipes r, inventory_items i
where r.name = 'Dog House Club' and i.name = 'Ken''s Garlic Aioli';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 3, 'each'
from recipes r, inventory_items i
where r.name = 'Dog House Club' and i.name = 'Turkey (slice)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 1, 'each'
from recipes r, inventory_items i
where r.name = 'Dog House Club' and i.name = 'Swiss Cheese (slice)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 3, 'each'
from recipes r, inventory_items i
where r.name = 'Dog House Club' and i.name = 'Ham (slice)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 1, 'each'
from recipes r, inventory_items i
where r.name = 'Dog House Club' and i.name = 'Cheddar Cheese (slice)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 2, 'each'
from recipes r, inventory_items i
where r.name = 'Dog House Club' and i.name = 'Bacon (strip)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 2, 'each'
from recipes r, inventory_items i
where r.name = 'Dog House Club' and i.name = 'Romaine Sandwich Leaf (each)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 2, 'each'
from recipes r, inventory_items i
where r.name = 'Dog House Club' and i.name = 'Roma Tomatoes (slice)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 1, 'each'
from recipes r, inventory_items i
where r.name = 'Grilled Chicken Sandwich' and i.name = 'Focaccia Bread';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 4, 'oz'
from recipes r, inventory_items i
where r.name = 'Grilled Chicken Sandwich' and i.name = 'Chicken Breast (grilled)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 0.5, 'oz'
from recipes r, inventory_items i
where r.name = 'Grilled Chicken Sandwich' and i.name = 'Ken''s Garlic Aioli';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 2, 'each'
from recipes r, inventory_items i
where r.name = 'Grilled Chicken Sandwich' and i.name = 'Pickle (slice)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 2, 'each'
from recipes r, inventory_items i
where r.name = 'Grilled Chicken Sandwich' and i.name = 'Roma Tomatoes (slice)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 2, 'each'
from recipes r, inventory_items i
where r.name = 'Grilled Chicken Sandwich' and i.name = 'Romaine Sandwich Leaf (each)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 1, 'each'
from recipes r, inventory_items i
where r.name = 'Caprese Sandwich' and i.name = 'Focaccia Bread';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 1, 'oz'
from recipes r, inventory_items i
where r.name = 'Caprese Sandwich' and i.name = 'Balsamic Glaze / Drizzle';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 1.5, 'oz'
from recipes r, inventory_items i
where r.name = 'Caprese Sandwich' and i.name = 'Spring Mix / Greens';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 3, 'each'
from recipes r, inventory_items i
where r.name = 'Caprese Sandwich' and i.name = 'Roma Tomatoes (slice)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 2, 'each'
from recipes r, inventory_items i
where r.name = 'Caprese Sandwich' and i.name = 'Mozzarella Fresh (slice)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 0.5, 'oz'
from recipes r, inventory_items i
where r.name = 'Caprese Sandwich' and i.name = 'Olive Oil';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 1, 'each'
from recipes r, inventory_items i
where r.name = 'Chicken Caesar Wrap' and i.name = 'Flour Tortilla 12in (each)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 8, 'oz'
from recipes r, inventory_items i
where r.name = 'Chicken Caesar Wrap' and i.name = 'Romaine Lettuce - Hearts';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 2.5, 'oz'
from recipes r, inventory_items i
where r.name = 'Chicken Caesar Wrap' and i.name = 'Parmesan (shaved)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 4, 'oz'
from recipes r, inventory_items i
where r.name = 'Chicken Caesar Wrap' and i.name = 'Chicken Breast (grilled)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 2.5, 'oz'
from recipes r, inventory_items i
where r.name = 'Chicken Caesar Wrap' and i.name = 'Ken''s Caesar Dressing';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 10, 'each'
from recipes r, inventory_items i
where r.name = 'Chicken Caesar Wrap' and i.name = 'Croutons (each)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 2, 'each'
from recipes r, inventory_items i
where r.name = 'Ice Cream Cookie Sandwich' and i.name = 'Chocolate Chip Cookies (each)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 1, 'each'
from recipes r, inventory_items i
where r.name = 'Ice Cream Cookie Sandwich' and i.name = 'Vanilla Ice Cream (scoop)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 1.5, 'oz'
from recipes r, inventory_items i
where r.name = 'Bark-Cuterie Board' and i.name = 'Peanut Butter (oz)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 2, 'oz'
from recipes r, inventory_items i
where r.name = 'Bark-Cuterie Board' and i.name = 'Strawberries';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 2, 'oz'
from recipes r, inventory_items i
where r.name = 'Bark-Cuterie Board' and i.name = 'Blueberries (oz)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 2, 'oz'
from recipes r, inventory_items i
where r.name = 'Bark-Cuterie Board' and i.name = 'Carrot (sticks)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 2, 'oz'
from recipes r, inventory_items i
where r.name = 'Bark-Cuterie Board' and i.name = 'Cucumber';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 0.5, 'oz'
from recipes r, inventory_items i
where r.name = 'Bark-Cuterie Board' and i.name = 'Greek Yogurt Dip (oz)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 2, 'oz'
from recipes r, inventory_items i
where r.name = 'Barking Bowl' and i.name = 'Chicken Breast (grilled)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 0.5, 'cup'
from recipes r, inventory_items i
where r.name = 'Barking Bowl' and i.name = 'Rice (cup)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 0.5, 'cup'
from recipes r, inventory_items i
where r.name = 'Barking Bowl' and i.name = 'Veggies Frozen Mix (cup)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 4, 'oz'
from recipes r, inventory_items i
where r.name = 'Pupcorn Chicken' and i.name = 'Chicken Breast (grilled)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 4, 'oz'
from recipes r, inventory_items i
where r.name = 'Pup Cup Sundae' and i.name = 'Whipped Cream (oz)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 1, 'oz'
from recipes r, inventory_items i
where r.name = 'Pup Cup Sundae' and i.name = 'Peanut Butter (oz)';
insert into recipe_ingredients (recipe_id, item_id, quantity, unit)
select r.id, i.id, 1, 'each'
from recipes r, inventory_items i
where r.name = 'Pup Cup Sundae' and i.name = 'Dougie''s Dog Cookie';

-- 5. Verification: expected 109 ingredient rows across 25 recipes.
-- If this doesn't match, one or more ingredient names below didn't match
-- an existing inventory_items row (Slider Rolls, Par Baked-Pre Sauced
-- Pizza Dough (8"), Flatbread Crust, Focaccia Bread, Dougie's Dog Cookie
-- are the 5 names this script assumes already exist from earlier imports
-- rather than creating itself).
select count(*) as ingredient_rows_inserted from recipe_ingredients
where recipe_id in (select id from recipes where name in (
  'Chicken Wings',
  'Meatball Sliders',
  'Parmesan Fries',
  'Chicken Tenders',
  'Kids Chicken Tenders',
  'Chicken Bacon Ranch Quesadilla',
  'Kids Cheese Quesadilla',
  'House Salad',
  'Caesar Salad',
  'Strawberry Feta Salad',
  'Hot Dougie Pizza',
  'Margherita Pizza',
  'Pepperoni Pizza',
  'Cheese Pizza',
  'BBQ Chicken Flatbread',
  'Pesto Flatbread',
  'Dog House Club',
  'Grilled Chicken Sandwich',
  'Caprese Sandwich',
  'Chicken Caesar Wrap',
  'Ice Cream Cookie Sandwich',
  'Bark-Cuterie Board',
  'Barking Bowl',
  'Pupcorn Chicken',
  'Pup Cup Sundae'
));

-- Names this script expected to find in inventory_items (fixed, stub, or
-- pre-existing). Any row returned here means that name is MISSING and its
-- recipe_ingredients row was silently skipped above -- add the item first,
-- then re-run just its recipe_ingredients insert.
select expected.name as missing_ingredient_name
from (values
  ('Chicken Wings (each)'),
  ('Carrot Stick (each)'),
  ('Celery Stick (each)'),
  ('Slider Rolls'),
  ('Meatballs 2 oz'),
  ('Mozzarella Shredded (pinch)'),
  ('Dried Parsley (pinch)'),
  ('French Fries'),
  ('Parmesan (grated)'),
  ('Olive Oil'),
  ('Butter (Tbsp)'),
  ('Ken''s Garlic Aioli'),
  ('Chicken Tenders (each)'),
  ('Flour Tortilla 12in (each)'),
  ('Mozzarella (shredded)'),
  ('Chicken Breast (grilled)'),
  ('Bacon (topping)'),
  ('Ken''s Ranch Dressing Homestyle'),
  ('Spring Mix / Greens'),
  ('Cherry Tomatoes (each)'),
  ('Cucumber (slice)'),
  ('Carrot (shredded)'),
  ('Croutons (each)'),
  ('Romaine Lettuce - Hearts'),
  ('Parmesan (shaved)'),
  ('Ken''s Caesar Dressing'),
  ('Strawberries (each)'),
  ('Sliced Almonds'),
  ('Feta Cheese'),
  ('Ken''s Balsamic Vinaigrette'),
  ('Par Baked-Pre Sauced Pizza Dough (8")'),
  ('Italian Sausage (topping)'),
  ('Ricotta Cheese (dollop)'),
  ('Hot Honey - (Made in House) Apple Cider Vin.'),
  ('Mozzarella Fresh (slice)'),
  ('Roma Tomatoes (slice)'),
  ('Pepperoni'),
  ('Flatbread Crust'),
  ('Cattlemen''s Base BBQ Sauce'),
  ('Red Onion'),
  ('Dried Cilantro (pinch)'),
  ('Pesto'),
  ('Ricotta Cheese (oz)'),
  ('Balsamic Glaze / Drizzle'),
  ('Sourdough Bread (slice)'),
  ('Turkey (slice)'),
  ('Swiss Cheese (slice)'),
  ('Ham (slice)'),
  ('Cheddar Cheese (slice)'),
  ('Bacon (strip)'),
  ('Romaine Sandwich Leaf (each)'),
  ('Focaccia Bread'),
  ('Pickle (slice)'),
  ('Chocolate Chip Cookies (each)'),
  ('Vanilla Ice Cream (scoop)'),
  ('Peanut Butter (oz)'),
  ('Strawberries'),
  ('Blueberries (oz)'),
  ('Carrot (sticks)'),
  ('Cucumber'),
  ('Greek Yogurt Dip (oz)'),
  ('Rice (cup)'),
  ('Veggies Frozen Mix (cup)'),
  ('Whipped Cream (oz)'),
  ('Dougie''s Dog Cookie')
) as expected(name)
left join inventory_items i on i.name = expected.name
where i.id is null;

-- fixes: 27, stubs: 33, recipes: 25, ingredient lines: 109
