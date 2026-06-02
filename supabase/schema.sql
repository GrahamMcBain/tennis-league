create table if not exists matches (
  id uuid default gen_random_uuid() primary key,
  winner_id text not null,
  loser_id text not null,
  score text not null,
  played_at timestamptz default now()
);

-- Optional: index for faster per-player queries
create index if not exists matches_winner_id_idx on matches (winner_id);
create index if not exists matches_loser_id_idx on matches (loser_id);
create index if not exists matches_played_at_idx on matches (played_at desc);

-- Allow public read/insert (no auth required for this league app)
alter table matches enable row level security;

create policy "Anyone can read matches"
  on matches for select
  using (true);

create policy "Anyone can insert matches"
  on matches for insert
  with check (true);
