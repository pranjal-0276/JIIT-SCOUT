
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Tighten bucket listing: only allow reading individual files (still public URLs work).
DROP POLICY "Public read panoramas" ON storage.objects;

CREATE POLICY "Public read panorama files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'panoramas' AND auth.role() = 'anon' IS NOT NULL);
