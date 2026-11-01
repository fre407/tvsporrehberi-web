import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

// Maç yorumları. Tüm kurallar (küfür/argo filtresi, bağlantı yasağı,
// uzunluk, hız sınırı) veritabanındaki site_post_match_comment()
// fonksiyonunda — bkz. supabase/site_match_comments.sql. Bu uç nokta
// ziyaretçinin IP'sini kaydetmeden yalnızca tek yönlü özetini (hash)
// hız sınırı için iletiyor.

export const dynamic = 'force-dynamic';

const MATCH_KEY_RE = /^[a-z0-9-]{5,160}$/;
const PAGE_SIZE = 30;

function ipHash(request) {
  const fwd = request.headers.get('x-forwarded-for');
  const ip = (fwd ? fwd.split(',')[0] : request.headers.get('x-real-ip') || '').trim();
  if (!ip) return null;
  return createHash('sha256').update(`tvsporrehberi-yorum:${ip}`).digest('hex').slice(0, 32);
}

export async function GET(request) {
  const params = new URL(request.url).searchParams;
  const match = params.get('match') ?? '';
  const before = Number(params.get('before')) || null;
  if (!MATCH_KEY_RE.test(match)) return NextResponse.json({ comments: [] }, { status: 400 });

  let query = supabase
    .from('site_match_comments')
    .select('id, nickname, body, created_at')
    .eq('match_key', match)
    .order('id', { ascending: false })
    .limit(PAGE_SIZE);
  if (before) query = query.lt('id', before);

  const { data, error } = await query;
  if (error) return NextResponse.json({ comments: [], error: 'unavailable' }, { status: 503 });
  return NextResponse.json({ comments: data ?? [], hasMore: (data?.length ?? 0) === PAGE_SIZE });
}

export async function POST(request) {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 });
  }

  // Bal küpü: insanların görmediği gizli alan; doluysa bot — başarı gibi
  // davranıp hiçbir şey kaydetmiyoruz.
  if (payload?.website) return NextResponse.json({ ok: true, comment: null });

  if (payload?.action === 'report') {
    const id = Number(payload.id);
    if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ ok: false }, { status: 400 });
    const { error } = await supabase.rpc('site_report_match_comment', { p_id: id });
    return NextResponse.json({ ok: !error });
  }

  const { data, error } = await supabase.rpc('site_post_match_comment', {
    p_match_key: String(payload?.match ?? ''),
    p_nickname: String(payload?.nickname ?? ''),
    p_body: String(payload?.body ?? ''),
    p_ip_hash: ipHash(request),
  });
  if (error) return NextResponse.json({ ok: false, error: 'unavailable' }, { status: 503 });
  return NextResponse.json(data, { status: data?.ok ? 200 : 422 });
}
