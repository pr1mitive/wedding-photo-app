alter table public.photos add column if not exists is_recommended boolean not null default false;
create index if not exists ix_photos_event_recommended on public.photos(event_id, is_recommended, created_at desc);

alter table public.display_settings add column if not exists current_mission_title text;
alter table public.display_settings add column if not exists current_mission_description text;
alter table public.display_settings add column if not exists current_mission_active boolean not null default false;
alter table public.display_settings add column if not exists auto_highlight_enabled boolean not null default false;
alter table public.display_settings add column if not exists auto_highlight_interval_sec integer not null default 20;

create table if not exists public.photo_reaction_counts (
  photo_id uuid primary key references public.photos(id) on delete cascade,
  heart_count integer not null default 0,
  clap_count integer not null default 0,
  wow_count integer not null default 0,
  cry_count integer not null default 0,
  fire_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint photo_reaction_counts_nonnegative check (
    heart_count >= 0 and clap_count >= 0 and wow_count >= 0 and cry_count >= 0 and fire_count >= 0
  )
);

create trigger trg_photo_reaction_counts_updated_at
before update on public.photo_reaction_counts
for each row execute function public.set_updated_at();
