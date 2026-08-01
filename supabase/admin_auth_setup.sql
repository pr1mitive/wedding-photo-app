-- 1) Supabase Dashboard > Authentication > Users で管理者ユーザーを作成する
-- 2) 下のSQLで auth.users の id と email を確認する
select id, email, created_at from auth.users order by created_at desc;

-- 3) 該当イベントに管理者として紐づける
-- YOUR_AUTH_USER_UUID を実際のUUIDに置き換えて実行してください
insert into public.admin_users (
  event_id,
  auth_user_id,
  display_name
)
select
  e.id,
  'YOUR_AUTH_USER_UUID'::uuid,
  '管理者'
from public.events e
where e.event_code = 'wedding-test'
on conflict do nothing;

-- 4) 確認
select au.id, au.display_name, au.auth_user_id, e.event_code
from public.admin_users au
join public.events e on e.id = au.event_id
order by au.created_at desc;
