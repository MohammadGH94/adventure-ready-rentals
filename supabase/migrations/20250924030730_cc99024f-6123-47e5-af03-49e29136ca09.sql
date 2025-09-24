-- Update the existing bicycle listing to have better data and make it available
UPDATE listings 
SET categories = ARRAY['cycling'::listing_category],
    description = 'High-quality mountain bike perfect for trail adventures and city exploration. Includes helmet and basic repair kit.',
    pickup_addresses = ARRAY['San Francisco, CA'],
    pickup_instructions = 'Meet at Golden Gate Park bike rental area. Bring ID and helmet if you have one.',
    price_per_day = 45.00
WHERE id = 'f5b2a821-3825-4adf-b02b-c72589221e08';