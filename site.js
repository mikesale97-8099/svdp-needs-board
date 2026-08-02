// ============================================================
// SHARED CONFIG — paste your published Google Sheet CSV URLs here.
// File > Share > Publish to web > select the tab > CSV.
// Leave as "" to use the sample data below instead.
// Both index.html and board.html read from this one file.
// ============================================================
const NEEDS_CSV_URL = "";   // e.g. "https://docs.google.com/spreadsheets/d/e/XXXX/pub?gid=0&single=true&output=csv"
const RESULTS_CSV_URL = ""; // e.g. "https://docs.google.com/spreadsheets/d/e/XXXX/pub?gid=123&single=true&output=csv"

// Expected Needs sheet columns: id, category, title, detail, urgency (high/medium/low), active (yes/no)
const SAMPLE_NEEDS = [
  { id: "1", category: "Furnishings", title: "Twin bed frame + mattress", detail: "Family of 4, kids sharing a room. Currently sleeping on the floor.", urgency: "high" },
  { id: "2", category: "Furnishings", title: "Kitchen table + 4 chairs", detail: "Single dad, two school-age kids. No place to eat together.", urgency: "medium" },
  { id: "3", category: "Rent", title: "$420 toward March rent", detail: "Grandmother raising two grandchildren, short after a car repair.", urgency: "high" },
  { id: "4", category: "Utilities", title: "Overdue electric bill, $185", detail: "Household of 3, shutoff notice received this week.", urgency: "high" },
];

// Expected Results sheet columns: month, home_visits, people_helped, furniture_requests, rent_utility_requests, financial_assistance
const SAMPLE_RESULTS = [
  { month: "June 2026", home_visits: "15", people_helped: "30", furniture_requests: "7", rent_utility_requests: "8", financial_assistance: "2500" },
  { month: "July 2026", home_visits: "10", people_helped: "22", furniture_requests: "5", rent_utility_requests: "5", financial_assistance: "3000" },
];

function parseCSV(text) {
  const rows = [];
  let row = [], field = '', inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i], next = text[i + 1];
    if (inQuotes) {
      if (c === '"' && next === '"') { field += '"'; i++; }
      else if (c === '"') { inQuotes = false; }
      else { field += c; }
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ',') { row.push(field); field = ''; }
      else if (c === '\n' || c === '\r') {
        if (field !== '' || row.length) { row.push(field); rows.push(row); row = []; field = ''; }
        if (c === '\r' && next === '\n') i++;
      } else field += c;
    }
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  const headers = rows.shift().map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));
  return rows.filter(r => r.length && r.some(v => v.trim() !== '')).map(r => {
    const obj = {};
    headers.forEach((h, idx) => obj[h] = (r[idx] || '').trim());
    return obj;
  });
}

async function loadCSV(url, fallback) {
  if (!url) return fallback;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('fetch failed');
    return parseCSV(await res.text());
  } catch (e) {
    console.warn('Falling back to sample data for', url, e);
    return fallback;
  }
}

async function loadNeeds() { return loadCSV(NEEDS_CSV_URL, SAMPLE_NEEDS); }
async function loadResults() { return loadCSV(RESULTS_CSV_URL, SAMPLE_RESULTS); }

function activeNeeds(needs) {
  return needs.filter(n => (n.active || 'yes').toLowerCase() !== 'no');
}
