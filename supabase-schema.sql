-- PaletteCraft Database Schema
-- Run these commands in your Supabase SQL editor

-- Enable Row Level Security
ALTER DEFAULT PRIVILEGES GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;

-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  public_url TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create palettes table
CREATE TABLE palettes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  colors TEXT[] NOT NULL,
  source_image_url TEXT,
  tailwind_config JSONB,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_settings table
CREATE TABLE user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  theme TEXT CHECK (theme IN ('light', 'dark', 'system')) DEFAULT 'system',
  auto_generate_tailwind BOOLEAN DEFAULT TRUE,
  default_tailwind_version TEXT CHECK (default_tailwind_version IN ('3', '4')) DEFAULT '4',
  auto_save_to_library BOOLEAN DEFAULT FALSE,
  default_access TEXT CHECK (default_access IN ('private', 'public')) DEFAULT 'private',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_palettes_user_id ON palettes(user_id);
CREATE INDEX idx_palettes_is_public ON palettes(is_public);
CREATE INDEX idx_palettes_created_at ON palettes(created_at);
CREATE INDEX idx_profiles_public_url ON profiles(public_url);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE palettes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies
CREATE POLICY "Users can view their own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Public profiles are viewable by public_url" 
  ON profiles FOR SELECT 
  USING (public_url IS NOT NULL);

-- Palettes RLS Policies
CREATE POLICY "Users can view their own palettes" 
  ON palettes FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own palettes" 
  ON palettes FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own palettes" 
  ON palettes FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own palettes" 
  ON palettes FOR DELETE 
  USING (auth.uid() = user_id);

CREATE POLICY "Public palettes are viewable by everyone" 
  ON palettes FOR SELECT 
  USING (is_public = true);

-- User Settings RLS Policies
CREATE POLICY "Users can view their own settings" 
  ON user_settings FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" 
  ON user_settings FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" 
  ON user_settings FOR UPDATE 
  USING (auth.uid() = user_id);

-- Storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('avatars', 'avatars', true),
  ('palette-images', 'palette-images', true);

-- Storage RLS Policies
CREATE POLICY "Users can upload their own avatar" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar" 
  ON storage.objects FOR UPDATE 
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar" 
  ON storage.objects FOR DELETE 
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Avatar images are publicly viewable" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload palette images" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'palette-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own palette images" 
  ON storage.objects FOR DELETE 
  USING (bucket_id = 'palette-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Palette images are publicly viewable" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'palette-images');

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function when a new user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_palettes_updated_at
  BEFORE UPDATE ON palettes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
