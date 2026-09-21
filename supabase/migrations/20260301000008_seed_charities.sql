-- Insert sensible seed charities if they don't exist
INSERT INTO public.charities (id, name, description, total_raised, image_url)
VALUES 
  ('d290f1ee-6c54-4b01-90e6-d701748f0851', 'Clean Water Initiative', 'Providing sustainable solar-powered filtration systems to remote communities. Every premium subscription logged contributes directly to building infrastructure on the ground.', 45000, 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80'),
  ('b1f9c8d7-e6a5-4b32-8c1d-123456789abc', 'Youth Golf Foundation', 'Empowering youth through the sport of golf by providing equipment, coaching, and access to premium courses.', 25000, 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800&q=80')
ON CONFLICT (id) DO UPDATE SET image_url = EXCLUDED.image_url;
