import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

// "Kim kazanır?" tahmin anketi (1 / X / 2). Ziyaretçi başına tek oy kuralı
// veritabanında (site_vote_match_prediction — bkz.
// supabase/site_match_comments.sql); IP saklanmıyor, yalnızca özeti.

export const dynamic = 'force-dynamic';

const MATCH_KEY_RE = /^[a-z0-9-]{5,160}$/;
const CHOICES = new Set(['1', 'X', '2']);

function ipHash(request) {
  const fwd = request.headers.get('x-forwarded-for');
  const ip = (fwd ? fwd.split(',')[0] : request.headers.get('x-real-ip') || '').trim();
  if (!ip) return null;
  return createHash('sha256').update(`tvsporrehberi-tahmin:${ip}`).digest('hex').slice(0, 32);
}

export async function GET(request) {
  const match = new URL(request.url).searchParams.get('match') ?? '';
  if (!MATCH_KEY_RE.test(match)) return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  const { data, error } = await supabase.rpc('site_match_prediction_counts', { p_match_key: match });
  if (error) return NextResponse.json({ error: 'unavailable' }, { status: 503 });
  return NextResponse.json({ counts: data });
}

export async function POST(request) {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 });
  }
  const match = String(payload?.match ?? '');
  const choice = String(payload?.choice ?? '');
  if (!MATCH_KEY_RE.test(match) || !CHOICES.has(choice)) {
    return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 });
  }
  const { data, error } = await supabase.rpc('site_vote_match_prediction', {
    p_match_key: match,
    p_choice: choice,
    p_ip_hash: ipHash(request),
  });
  if (error) return NextResponse.json({ ok: false, error: 'unavailable' }, { status: 503 });
  return NextResponse.json(data, { status: data?.ok ? 200 : 422 });
}
