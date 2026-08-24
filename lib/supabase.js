import { createClient } from '@supabase/supabase-js';

// TV Spor Rehberi mobil uygulamasıyla AYNI Supabase projesi ve AYNI anon
// key — bunlar herkese açık (public) anahtarlardır, istemci/sunucu
// taraflı okuma için tasarlanmıştır. Yazma güvenliği anon key'in gizliliğine
// değil, Supabase RLS politikalarına dayanır (bkz. tv-spor-rehberi-app
// reposundaki supabaseClient.js'deki aynı not).
const SUPABASE_URL = 'https://pwpwibvomoujxokjxtlp.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3cHdpYnZvbW91anhva2p4dGxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUxMjI3ODUsImV4cCI6MjEwMDY5ODc4NX0.xijK0Hd1x0DQQ4q4p03k2_4XIyU8_5ZSOYQAnN8i83Q';

// Sunucu tarafında (Next.js RSC/route) her istek için oturum saklamaya
// gerek yok — auth tamamen kapalı, sadece herkese açık okuma yapılıyor.
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
