-- Create active players table for multiplayer presence heartbeat tracking
CREATE TABLE IF NOT EXISTS public.arcade_active_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  room_id TEXT NOT NULL,
  last_heartbeat TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_user_active_room UNIQUE (user_id, room_id)
);

-- Enable RLS
ALTER TABLE public.arcade_active_players ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active players for counting
CREATE POLICY "Allow public read access to active players" ON public.arcade_active_players
  FOR SELECT TO public USING (true);

-- Allow authenticated users to upsert their own presence heartbeats
CREATE POLICY "Allow authenticated users to upsert heartbeats" ON public.arcade_active_players
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create chat messages table
CREATE TABLE IF NOT EXISTS public.arcade_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  username TEXT NOT NULL,
  text VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.arcade_chat_messages ENABLE ROW LEVEL SECURITY;

-- Allow public read access to chat messages
CREATE POLICY "Allow public read access to chat messages" ON public.arcade_chat_messages
  FOR SELECT TO public USING (true);

-- Allow authenticated users to insert messages
CREATE POLICY "Allow authenticated users to insert chat" ON public.arcade_chat_messages
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
