
ALTER TABLE public.p2p_listings
ADD CONSTRAINT p2p_listings_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
