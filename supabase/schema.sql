create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  event_code text not null unique,
  description text,
  guest_pin text,
  album_access_code text,
  album_public_until timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint events_event_code_check check (char_length(event_code) between 3 and 80)
);

create trigger trg_events_updated_at
before update on public.events
for each row execute function public.set_updated_at();

create table if not exists public.display_settings (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null unique references public.events(id) on delete cascade,
  slide_interval_sec integer not null default 5,
  focus_duration_sec integer not null default 4,
  transition_type text not null default 'fade',
  order_type text not null default 'chronological',
  show_comment boolean not null default true,
  highlight_priority boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint display_settings_slide_interval_check check (slide_interval_sec between 2 and 15),
  constraint display_settings_focus_duration_check check (focus_duration_sec between 3 and 10),
  constraint display_settings_transition_type_check check (transition_type in ('fade', 'zoom', 'slide')),
  constraint display_settings_order_type_check check (order_type in ('chronological', 'newest', 'random'))
);

create trigger trg_display_settings_updated_at
before update on public.display_settings
for each row execute function public.set_updated_at();

create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  guest_name text not null,
  comment text,
  original_path text not null,
  display_path text not null,
  thumb_path text not null,
  mime_type text,
  file_size_bytes bigint,
  width integer,
  height integer,
  timeline_label text,
  is_favorite boolean not null default false,
  is_highlight boolean not null default false,
  is_hidden boolean not null default false,
  upload_status text not null default 'completed',
  client_upload_id text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint photos_guest_name_check check (char_length(guest_name) between 1 and 30),
  constraint photos_comment_check check (comment is null or char_length(comment) <= 120),
  constraint photos_upload_status_check check (upload_status in ('pending', 'completed', 'failed'))
);

create unique index if not exists ux_photos_event_client_upload_id on public.photos(event_id, client_upload_id);
create index if not exists ix_photos_event_created_at on public.photos(event_id, created_at desc);
create index if not exists ix_photos_event_hidden_created on public.photos(event_id, is_hidden, created_at desc);
create index if not exists ix_photos_event_favorite on public.photos(event_id, is_favorite, created_at desc);
create index if not exists ix_photos_event_highlight on public.photos(event_id, is_highlight, created_at desc);
create index if not exists ix_photos_event_timeline on public.photos(event_id, timeline_label, created_at desc);
create index if not exists ix_photos_event_guest_name on public.photos(event_id, guest_name);

create trigger trg_photos_updated_at
before update on public.photos
for each row execute function public.set_updated_at();

insert into public.events (title, event_code, description, album_public_until, is_active)
values ('Taro & Hanako Wedding', 'wedding-test', '結婚式テストイベント', now() + interval '7 days', true)
on conflict (event_code) do nothing;

insert into public.display_settings (event_id, slide_interval_sec, focus_duration_sec, transition_type, order_type, show_comment, highlight_priority)
select id, 5, 4, 'fade', 'chronological', true, true from public.events where event_code = 'wedding-test'
on conflict (event_id) do nothing;
