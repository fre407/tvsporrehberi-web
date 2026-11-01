-- TV Spor Rehberi WEB SİTESİ — maç yorumları (2026-11-02).
-- Yalnızca tvsporrehberi.com kullanır; mobil uygulamadan ve maç veri
-- hattından tamamen bağımsızdır (hiçbir mevcut tabloya dokunmaz).
-- Supabase SQL Editor'da bir kez çalıştırılır; tekrar çalıştırmak güvenlidir.
--
-- Güvenlik modeli: site yalnızca herkese açık "anon" anahtarını kullanıyor,
-- bu yüzden tüm kurallar VERİTABANINDA uygulanır — tabloya doğrudan yazma
-- kapalı, yorum yalnızca site_post_match_comment() fonksiyonundan geçer;
-- küfür/argo, bağlantı, uzunluk ve hız sınırları orada denetlenir.
--
-- Geri almak için:
--   drop function if exists public.site_post_match_comment(text, text, text, text);
--   drop function if exists public.site_report_match_comment(bigint);
--   drop function if exists public.site_comment_is_clean(text);
--   drop function if exists public.site_comment_normalize(text);
--   drop table if exists public.site_match_comments;
--
-- Yönetim: Supabase > Table Editor > site_match_comments — bir yorumu
-- gizlemek için hidden = true, silmek için satırı sil.

create table if not exists public.site_match_comments (
  id bigint generated always as identity primary key,
  match_key text not null check (match_key ~ '^[a-z0-9-]{5,160}$'),
  nickname text not null check (char_length(nickname) between 2 and 24),
  body text not null check (char_length(body) between 2 and 500),
  ip_hash text,
  report_count integer not null default 0,
  hidden boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists site_match_comments_match_idx
  on public.site_match_comments (match_key, created_at desc);
create index if not exists site_match_comments_ip_idx
  on public.site_match_comments (ip_hash, created_at desc);

alter table public.site_match_comments enable row level security;
revoke all on public.site_match_comments from anon, authenticated;
grant select (id, match_key, nickname, body, created_at)
  on public.site_match_comments to anon, authenticated;
drop policy if exists site_match_comments_read on public.site_match_comments;
create policy site_match_comments_read on public.site_match_comments
  for select to anon, authenticated using (hidden = false);

-- Metni filtre için sadeleştirir: Türkçe küçük harf, ş/ğ/ü/ö/ç → s/g/u/o/c,
-- rakam/simge hileleri (0→o, 1→i, 3→e, 4→a, 5→s, 7→t, 8→b, @→a, $→s),
-- harf dışı her şey boşluk, tekrar eden harfler teke ("siiiktir" → "siktir").
-- "ı" BİLEREK korunuyor: "sık sık" gibi masum sözcükler yakalanmasın.
create or replace function public.site_comment_normalize(t text)
returns text language sql immutable as $$
  select regexp_replace(
           regexp_replace(
             translate(
               lower(translate(coalesce(t, ''), 'İIŞĞÜÖÇ', 'iışğüöç')),
               'şğüöç0134578@$',
               'sguocoieastbas'),
             '[^a-zı]+', ' ', 'g'),
           '(.)\1+', '\1', 'g')
$$;

-- true = temiz. Üç katman: (1) tek başına yasak sözcükler, (2) yasak
-- köklerle başlayan sözcükler, (3) boşluk/nokta ile bölünmüş yazımlar için
-- boşluksuz metinde yalnızca masum sözcüklerle karışmayan uzun kökler.
create or replace function public.site_comment_is_clean(t text)
returns boolean language sql immutable as $$
  with n as (select ' ' || public.site_comment_normalize(t) || ' ' as s)
  select not (
    s ~ ' (o c|a m k|a q|amk|amq|aq|mk|mq|sg|oc|sik|pic|pice|pici|got|gote|gotu|pust|ibne|ipne|amın|anan[ıi]|anan[ıi]n|bacın[ıi]|dick) '
    or s ~ ' (orospu|orosbu|orsp|yarak|dalyarak|sikt|siker|sikey|sikiy|sikim|sikik|sikis(?!t)|sikicem|sikecem|sikmek|amcık|amcik|amına|amina|amını|amk|kahpe|pezeven|gavat|kaltak|fahise|surtuk|yavsak|dalama|serefsiz|haysiyetsiz|gerizekal|salak|dangalak|beyinsiz|aptal|gotun|gotveren|gotlek|kancık|kancik|fuck|shit|bitch|cunt|ashole|motherf|whore|slut)'
    or replace(s, ' ', '') ~ '(orospu|orosbu|siktir|pezevenk|amınakoy|aminakoy|gerizekal)'
    or s ~ ' geri zekal'
  )
  from n
$$;

create or replace function public.site_post_match_comment(
  p_match_key text,
  p_nickname text,
  p_body text,
  p_ip_hash text default null
) returns json
language plpgsql security definer set search_path = public as $$
declare
  v_nick text := btrim(regexp_replace(coalesce(p_nickname, ''), '\s+', ' ', 'g'));
  v_body text := btrim(regexp_replace(coalesce(p_body, ''), '[ \t]+', ' ', 'g'));
  v_link text := '(https?://|www\.|\.(com|net|org|xyz|ru|io|bet|info|tk|me|tr)(\W|$))';
  v_row public.site_match_comments;
begin
  v_body := regexp_replace(v_body, '\n{3,}', E'\n\n', 'g');
  if coalesce(p_match_key, '') !~ '^[a-z0-9-]{5,160}$' then
    return json_build_object('ok', false, 'error', 'match');
  end if;
  if char_length(v_nick) not between 2 and 24 then
    return json_build_object('ok', false, 'error', 'nickname_length');
  end if;
  if char_length(v_body) not between 2 and 500 then
    return json_build_object('ok', false, 'error', 'body_length');
  end if;
  if not public.site_comment_is_clean(v_nick) then
    return json_build_object('ok', false, 'error', 'nickname_profanity');
  end if;
  if not public.site_comment_is_clean(v_body) then
    return json_build_object('ok', false, 'error', 'profanity');
  end if;
  if v_body ~* v_link or v_nick ~* v_link then
    return json_build_object('ok', false, 'error', 'link');
  end if;
  if p_ip_hash is not null then
    if exists (select 1 from site_match_comments
               where ip_hash = p_ip_hash and created_at > now() - interval '30 seconds') then
      return json_build_object('ok', false, 'error', 'too_fast');
    end if;
    if (select count(*) from site_match_comments
        where ip_hash = p_ip_hash and created_at > now() - interval '10 minutes') >= 8 then
      return json_build_object('ok', false, 'error', 'too_many');
    end if;
  end if;
  if (select count(*) from site_match_comments
      where match_key = p_match_key and created_at > now() - interval '1 minute') >= 20 then
    return json_build_object('ok', false, 'error', 'busy');
  end if;
  if exists (select 1 from site_match_comments
             where match_key = p_match_key and lower(body) = lower(v_body)
               and created_at > now() - interval '1 hour') then
    return json_build_object('ok', false, 'error', 'duplicate');
  end if;

  insert into site_match_comments (match_key, nickname, body, ip_hash)
  values (p_match_key, v_nick, v_body, p_ip_hash)
  returning * into v_row;

  return json_build_object('ok', true, 'comment', json_build_object(
    'id', v_row.id, 'nickname', v_row.nickname, 'body', v_row.body, 'created_at', v_row.created_at));
end
$$;

-- Ziyaretçi bildirimi: 3 bildirimde yorum otomatik gizlenir (yönetici
-- Table Editor'dan hidden = false yaparak geri açabilir).
create or replace function public.site_report_match_comment(p_id bigint)
returns void
language sql security definer set search_path = public as $$
  update site_match_comments
     set report_count = report_count + 1,
         hidden = hidden or report_count + 1 >= 3
   where id = p_id;
$$;

revoke all on function public.site_post_match_comment(text, text, text, text) from public;
revoke all on function public.site_report_match_comment(bigint) from public;
grant execute on function public.site_post_match_comment(text, text, text, text) to anon, authenticated;
grant execute on function public.site_report_match_comment(bigint) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- "Kim kazanır?" tahmin anketi (1 / X / 2) — aynı dosyada, aynı bağımsızlık.
-- Ziyaretçi başına (IP özeti) maç başına tek oy; oyunu değiştirebilir.
-- Geri almak için:
--   drop function if exists public.site_vote_match_prediction(text, text, text);
--   drop function if exists public.site_match_prediction_counts(text);
--   drop table if exists public.site_match_predictions;

create table if not exists public.site_match_predictions (
  match_key text not null check (match_key ~ '^[a-z0-9-]{5,160}$'),
  ip_hash text not null,
  choice text not null check (choice in ('1', 'X', '2')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (match_key, ip_hash)
);
create index if not exists site_match_predictions_recent_idx
  on public.site_match_predictions (match_key, updated_at desc);

alter table public.site_match_predictions enable row level security;
revoke all on public.site_match_predictions from anon, authenticated;

create or replace function public.site_match_prediction_counts(p_match_key text)
returns json
language sql stable security definer set search_path = public as $$
  select json_build_object(
    'home', count(*) filter (where choice = '1'),
    'draw', count(*) filter (where choice = 'X'),
    'away', count(*) filter (where choice = '2'))
  from site_match_predictions
  where match_key = p_match_key;
$$;

create or replace function public.site_vote_match_prediction(
  p_match_key text,
  p_choice text,
  p_ip_hash text
) returns json
language plpgsql security definer set search_path = public as $$
begin
  if coalesce(p_match_key, '') !~ '^[a-z0-9-]{5,160}$' or p_choice not in ('1', 'X', '2') then
    return json_build_object('ok', false, 'error', 'bad_request');
  end if;
  if coalesce(p_ip_hash, '') = '' then
    return json_build_object('ok', false, 'error', 'no_ip');
  end if;
  if (select count(*) from site_match_predictions
      where match_key = p_match_key and updated_at > now() - interval '1 minute') >= 300 then
    return json_build_object('ok', false, 'error', 'busy');
  end if;
  insert into site_match_predictions (match_key, ip_hash, choice)
  values (p_match_key, p_ip_hash, p_choice)
  on conflict (match_key, ip_hash)
  do update set choice = excluded.choice, updated_at = now();
  return json_build_object('ok', true, 'counts', public.site_match_prediction_counts(p_match_key));
end
$$;

revoke all on function public.site_match_prediction_counts(text) from public;
revoke all on function public.site_vote_match_prediction(text, text, text) from public;
grant execute on function public.site_match_prediction_counts(text) to anon, authenticated;
grant execute on function public.site_vote_match_prediction(text, text, text) to anon, authenticated;
