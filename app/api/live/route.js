import { NextResponse } from 'next/server';
import { getLiveFixtures } from '../../../lib/data';

// /canli sayfasının istemci tarafı otomatik yenilemesi bu uca istek atıyor
// (bkz. components/LiveGuide.js) — sayfa yenilenmeden skorlar güncelleniyor.
export async function GET() {
  try {
    const rows = await getLiveFixtures();
    return NextResponse.json({ rows });
  } catch {
    return NextResponse.json({ rows: [] }, { status: 200 });
  }
}
