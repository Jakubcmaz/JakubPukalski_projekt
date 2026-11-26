'use strict';
/* ADCC Champions Ranking — baza danych = tablica obiektów (zapis w localStorage przeglądarki).
   UWAGA: dane startowe to ZWERYFIKOWANA CZĘŚĆ złotych medali; uzupełnij i sprawdź je w panelu admina. */
const KEY = 'adcc_db_v1', LOGKEY = 'adcc_stats_v1', ADMIN_PASS = 'admin123'; // hasło demonstracyjne (kod jest jawny)
const MEDALS = ['złoty', 'srebrny', 'brązowy'];
const slug = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const $ = s => document.querySelector(s);

const P = (name, country, g) => ({ id: slug(name), name, country, wins: g.map(([year, category]) => ({ year, category, medal: 'złoty' })) });
const seed = () => [
  P('Alexander Freitas', 'Brazylia', [[1998, '-66 kg']]),
  P('Royler Gracie', 'Brazylia', [[1999, '-66 kg'], [2000, '-66 kg'], [2001, '-66 kg']]),
  P('Leo Vieira', 'Brazylia', [[2003, '-66 kg'], [2005, '-66 kg']]),
  P('Rubens Charles', 'Brazylia', [[2017, '-66 kg']]),
  P('Diogo Reis', 'Brazylia', [[2022, '-66 kg']]),
  P('Renzo Gracie', 'Brazylia', [[1998, '-77 kg'], [2000, '-77 kg']]),
  P('Jean Jacques Machado', 'Brazylia', [[1999, '-77 kg']]),
  P('Marcio Feitosa', 'Brazylia', [[2001, '-77 kg']]),
  P('Marcelo Garcia', 'Brazylia', [[2005, '-77 kg']]),
  P('Kade Ruotolo', 'USA', [[2022, '-77 kg']]),
  P('Rodrigo Gracie', 'Brazylia', [[1998, '-88 kg']]),
  P('Karimula Barkalaev', 'Rosja', [[1999, '-88 kg']]),
  P('Saulo Ribeiro', 'Brazylia', [[2000, '-88 kg'], [2003, '-88 kg']]),
  P('Sanae Kikuta', 'Japonia', [[2001, '-88 kg']]),
  P('Giancarlo Bodoni', 'USA', [[2022, '-88 kg']]),
  P('Mario Sperry', 'Brazylia', [[1998, '-99 kg'], [1998, 'Absolute']]),
  P('Jeff Monson', 'USA', [[1999, '-99 kg']]),
  P('Ricardo Arona', 'Brazylia', [[2000, '-99 kg'], [2001, '-99 kg'], [2001, 'Absolute']]),
  P('Felipe Pena', 'Brazylia', [[2017, 'Absolute'], [2024, '-99 kg']]),
  P('Roberto Traven', 'Brazylia', [[1999, 'Absolute']]),
  P('Mark Kerr', 'USA', [[2000, 'Absolute']]),
  P('Dean Lister', 'USA', [[2003, 'Absolute']]),
  P('Braulio Estima', 'Brazylia', [[2009, 'Absolute']]),
  P('Andre Galvao', 'Brazylia', [[2011, 'Absolute']]),
  P('Roberto Abreu', 'Brazylia', [[2013, 'Absolute']]),
  P('Claudio Calasans', 'Brazylia', [[2015, 'Absolute']]),
  P('Gordon Ryan', 'USA', [[2019, 'Absolute']]),
  P('Yuri Simões', 'Brazylia', [[2022, 'Absolute']]),
];

let db = [], log = [], isAdmin = false;

/* ---------- baza danych ---------- */
function load() {
  try { const r = localStorage.getItem(KEY); db = r ? JSON.parse(r) : seed(); } catch (e) { db = seed(); }
  try { log = JSON.parse(localStorage.getItem(LOGKEY) || '[]'); } catch (e) { log = []; }
  if (!Array.isArray(db)) throw new Error('Nieprawidłowe dane');
}
function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(db)); localStorage.setItem(LOGKEY, JSON.stringify(log)); return true; }
  catch (e) { return false; }
}
const gold = p => p.wins.filter(w => w.medal === 'złoty').length;
const cnt = (p, m) => p.wins.filter(w => w.medal === m).length;
function ranked() {
  const l = [...db].sort((a, b) => gold(b) - gold(a) || a.name.localeCompare(b.name, 'pl'));
  l.forEach((p, i) => { p.pos = i > 0 && gold(p) === gold(l[i - 1]) ? l[i - 1].pos : i + 1; });
  return l;
}

/* ---------- widok publiczny ---------- */
function fillCategories() {
  const cats = [...new Set(db.flatMap(p => p.wins.map(w => w.category)))].sort();
  const cur = $('#cat').value;
  $('#cat').innerHTML = '<option value="">Wszystkie kategorie</option>' + cats.map(c => `<option>${esc(c)}</option>`).join('');
  $('#cat').value = cats.includes(cur) ? cur : '';
}
function render() {
  const q = $('#q').value.trim().toLowerCase(), yr = $('#yr').value.trim(), cat = $('#cat').value;
  let msg = '', yearOk = true;
  if (yr && !/^\d{4}$/.test(yr)) { msg = 'Nieprawidłowy rok — wymagany format: cztery cyfry, np. 2019. Filtr roku pominięto.'; yearOk = false; }
  let list = ranked();
  if (q) list = list.filter(p => [p.name, p.country, ...p.wins.flatMap(w => [w.year, w.category])].join(' ').toLowerCase().includes(q));
  if ((yr && yearOk) || cat) list = list.filter(p => p.wins.some(w => (!yr || !yearOk || String(w.year) === yr) && (!cat || w.category === cat)));
  if ($('#srt').value === 'name') list.sort((a, b) => a.name.localeCompare(b.name, 'pl'));
  $('#tbody').innerHTML = list.map(p => `<tr class="${p.pos <= 3 ? 'top' + p.pos : ''}">
    <td class="pos">${p.pos}</td><td><strong>${esc(p.name)}</strong></td><td>${esc(p.country)}</td><td class="gold">${gold(p)}<small>Ag ${cnt(p, 'srebrny')} · Br ${cnt(p, 'brązowy')}</small></td>
    <td>${[...p.wins].sort((a, b) => a.year - b.year).map(w => `<span class="chip m-${w.medal}">${w.year} · ${esc(w.category)}${w.medal !== 'złoty' ? ' · ' + w.medal : ''}</span>`).join('')}</td></tr>`).join('');
  if (!list.length) msg = db.length ? 'Nie znaleziono zawodników spełniających kryteria' : 'Brak dostępnych zawodników.';
  $('#msg').textContent = msg;
  summary();
}

/* ---------- panel administratora ---------- */
function say(t, ok) { const m = $('#fmsg'); m.textContent = t; m.className = ok ? 'ok' : ''; }
function renderAdmin() {
  $('#plist').innerHTML = [...db].sort((a, b) => a.name.localeCompare(b.name, 'pl')).map(p =>
    `<li><span>${esc(p.name)} <small>(${esc(p.country)}, ${p.wins.length} med.)</small></span>
     <span><button data-e="${esc(p.id)}" class="ghost">Edytuj</button> <button data-d="${esc(p.id)}">Usuń</button></span></li>`).join('');
}
function parseWins(txt) {
  const out = [];
  for (const [i, line] of txt.split('\n').map(s => s.trim()).filter(Boolean).entries()) {
    const [y, c, m = 'złoty'] = line.split(';').map(s => s.trim());
    if (!/^\d{4}$/.test(y) || +y < 1998 || +y > 2100) return { err: `Linia ${i + 1}: nieprawidłowy rok (np. 2019).` };
    if (!c) return { err: `Linia ${i + 1}: brak kategorii.` };
    if (!MEDALS.includes(m.toLowerCase())) return { err: `Linia ${i + 1}: medal musi być: złoty, srebrny lub brązowy.` };
    out.push({ year: +y, category: c, medal: m.toLowerCase() });
  }
  return { wins: out };
}
function savePlayer() {
  const name = $('#f-name').value.trim(), country = $('#f-country').value.trim(), editId = $('#f-id').value;
  if (!name || !country) return say('Uzupełnij imię i nazwisko oraz klub/kraj.');
  const r = parseWins($('#f-wins').value);
  if (r.err) return say(r.err);
  if (!r.wins.length) return say('Zawodnik w rankingu musi mieć co najmniej jeden medal.');
  const id = editId || slug(name);
  if (!id) return say('Niepoprawne imię i nazwisko.');
  if (!editId && db.some(p => p.id === id || p.name.toLowerCase() === name.toLowerCase())) return say('Duplikat: taki zawodnik już istnieje w bazie.');
  const prev = db;                                       // zapis atomowy: wszystko albo nic
  db = editId ? db.map(p => p.id === id ? { id, name, country, wins: r.wins } : p) : [...db, { id, name, country, wins: r.wins }];
  if (!persist()) { db = prev; return say('Błąd zapisu danych w przeglądarce.'); }
  clearForm(); say('Zapisano.', true); fillCategories(); renderAdmin(); render();
}
function clearForm() { ['#f-id', '#f-name', '#f-country', '#f-wins'].forEach(s => $(s).value = ''); }
function stats() {
  const all = db.flatMap(p => p.wins), n = m => all.filter(w => w.medal === m).length;
  log.push({ date: new Date().toLocaleString('pl-PL'), zlote: n('złoty'), srebrne: n('srebrny'), brazowe: n('brązowy'), zawodnicy: db.length });
  persist(); showLog();
}
function showLog() {
  $('#slog').innerHTML = log.length ? `<table><thead><tr><th>Data</th><th>Złote</th><th>Srebrne</th><th>Brązowe</th><th>Zawodnicy</th></tr></thead><tbody>${
    [...log].reverse().map(l => `<tr><td>${esc(l.date)}</td><td>${l.zlote}</td><td>${l.srebrne}</td><td>${l.brazowe}</td><td>${l.zawodnicy}</td></tr>`).join('')}</tbody></table>` : '';
}
function backup() {
  try {
    const blob = new Blob([JSON.stringify({ data: new Date().toISOString(), zawodnicy: db, statystyki: log }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `adcc-backup-${new Date().toISOString().slice(0, 10)}.json`; a.click(); URL.revokeObjectURL(a.href);
    say('Kopia zapasowa została zapisana.', true);
  } catch (e) { say('Błąd zapisu kopii zapasowej.'); }
}

/* ---------- podsumowanie, weryfikacja, przywracanie ---------- */
function summary() {
  const all = db.flatMap(p => p.wins), yrs = new Set(all.map(w => w.year));
  $('#sum').innerHTML = [[db.length, 'zawodników'], [all.filter(w => w.medal === 'złoty').length, 'złotych medali'], [yrs.size, 'edycji w bazie']]
    .map(([n, t]) => `<span><b>${n}</b>${t}</span>`).join('');
}
function verify() {
  const out = [], gold1 = {}, thisYear = new Date().getFullYear();
  db.forEach(p => p.wins.forEach(w => {
    if (!Number.isInteger(w.year) || w.year < 1998 || w.year > thisYear) out.push(`${p.name}: nieprawidłowy rok ${w.year}.`);
    if (!w.category) out.push(`${p.name}: brak kategorii (${w.year}).`);
    if (w.medal === 'złoty') { const k = `${w.year} · ${w.category}`; (gold1[k] = gold1[k] || []).push(p.name); }
  }));
  Object.entries(gold1).filter(([, v]) => v.length > 1).forEach(([k, v]) => out.push(`Więcej niż jeden złoty medal w ${k}: ${v.join(', ')}.`));
  $('#vlog').innerHTML = out.length ? '<ul>' + out.map(o => `<li>${esc(o)}</li>`).join('') + '</ul>' : '<p class="okmsg">Nie znaleziono nieprawidłowości w danych historycznych.</p>';
}
function rsay(t, ok) { const m = $('#rmsg') || $('#fmsg'); if (!m) return alert(t); m.textContent = t; m.className = ok ? 'ok' : ''; }
function restore(file) {
  rsay(`Wczytuję plik „${file.name}”…`, true);
  const rd = new FileReader();
  rd.onerror = () => rsay('Nie udało się odczytać pliku.');
  rd.onloadend = () => { $('#restoreFile').value = ''; };
  rd.onload = () => {
    try {
      const d = JSON.parse(rd.result);
      if (!Array.isArray(d.zawodnicy) || !d.zawodnicy.every(p => p && p.id && p.name && p.country && Array.isArray(p.wins))) throw new Error('format');
      if (!confirm('Zastąpić bieżące dane danymi z kopii zapasowej?')) return rsay('Anulowano — dane bez zmian.');
      const prev = [db, log];
      db = d.zawodnicy; log = Array.isArray(d.statystyki) ? d.statystyki : [];
      if (!persist()) { db = prev[0]; log = prev[1]; return rsay('Błąd zapisu danych w przeglądarce.'); }
      fillCategories(); renderAdmin(); render(); showLog(); rsay(`Przywrócono dane z kopii: ${db.length} zawodników.`, true);
    } catch (e) { console.error(e); rsay('Nieprawidłowy plik kopii zapasowej — wybierz plik zapisany przyciskiem „Kopia zapasowa (JSON)”.'); }
  };
  rd.readAsText(file);
}

/* ---------- start ---------- */
function init() {
  try { load(); } catch (e) { $('#msg').textContent = 'Błąd: nie udało się wczytać rankingu.'; return; }
  fillCategories(); render();
  ['#q', '#yr'].forEach(s => $(s).addEventListener('input', render));
  ['#cat', '#srt'].forEach(s => $(s).addEventListener('change', render));
  $('#adminBtn').addEventListener('click', () => {
    if (!isAdmin) { if (prompt('Hasło administratora:') !== ADMIN_PASS) return; isAdmin = true; $('#adminBtn').innerHTML = '<i class="fa-solid fa-lock-open"></i> Zamknij panel'; $('#admin').hidden = false; renderAdmin(); showLog(); }
    else { isAdmin = false; $('#admin').hidden = true; $('#adminBtn').innerHTML = '<i class="fa-solid fa-lock"></i> Panel administratora'; }
  });
  $('#saveBtn').addEventListener('click', savePlayer);
  $('#clearBtn').addEventListener('click', () => { clearForm(); say(''); });
  $('#statsBtn').addEventListener('click', stats);
  $('#backupBtn').addEventListener('click', backup);
  $('#verifyBtn').addEventListener('click', verify);
  $('#restoreBtn').addEventListener('click', () => $('#restoreFile').click());
  $('#restoreFile').addEventListener('change', e => { if (e.target.files[0]) restore(e.target.files[0]); });
  $('#resetBtn').addEventListener('click', () => { if (confirm('Przywrócić dane początkowe? Zmiany zostaną utracone.')) { db = seed(); persist(); fillCategories(); renderAdmin(); render(); } });
  $('#plist').addEventListener('click', e => {
    const ed = e.target.dataset.e, del = e.target.dataset.d;
    if (ed) { const p = db.find(x => x.id === ed); $('#f-id').value = p.id; $('#f-name').value = p.name; $('#f-country').value = p.country;
      $('#f-wins').value = p.wins.map(w => `${w.year};${w.category};${w.medal}`).join('\n'); say('Edycja: ' + p.name, true); window.scrollTo({ top: $('#admin').offsetTop, behavior: 'smooth' }); }
    if (del && confirm('Usunąć zawodnika?')) { db = db.filter(x => x.id !== del); persist(); fillCategories(); renderAdmin(); render(); }
  });
}
document.addEventListener('DOMContentLoaded', init);
