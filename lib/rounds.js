// Veri sağlayıcısı tur adlarını İngilizce veriyor ("Regular Season - 9",
// "League Stage - 4", "Round of 16"); sitede Türkçe gösteriliyor. Tanınmayan
// biçim olduğu gibi kalır. Maç sayfası ve açılır maç kartı ortak kullanır.
const ROUND_NAMES_TR = {
  'Knockout Round Play-offs': 'Play-off turu',
  'Round of 32': 'Son 32',
  'Round of 16': 'Son 16',
  'Quarter-finals': 'Çeyrek final',
  'Semi-finals': 'Yarı final',
  Final: 'Final',
};

export function roundText(round, locale = 'tr') {
  if (!round) return null;
  const en = locale === 'en';
  const week = round.match(/^Regular Season - (\d+)$/);
  if (week) return en ? `Matchweek ${week[1]}` : `${week[1]}. Hafta`;
  if (en) return round;
  const league = round.match(/^League Stage - (\d+)$/);
  if (league) return `Lig aşaması · ${league[1]}. maç günü`;
  const group = round.match(/^Group ([A-Z]) - (\d+)$/);
  if (group) return `${group[1]} Grubu · ${group[2]}. maç`;
  const nth = round.match(/^(?:(\d+)(?:st|nd|rd|th) Round|Round (\d+))$/);
  if (nth) return `${nth[1] ?? nth[2]}. tur`;
  return ROUND_NAMES_TR[round] ?? round;
}
