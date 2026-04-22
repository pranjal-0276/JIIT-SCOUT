export type Location = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  latitude: number;
  longitude: number;
  image_url: string | null;
  panorama_url: string | null;
  created_at: string;
  updated_at: string;
};