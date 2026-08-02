// ============================================================
// SHARED CONFIG — paste your published Google Sheet CSV URLs here.
// File > Share > Publish to web > select the tab > CSV.
// Leave as "" to use the sample data below instead.
// Both index.html and board.html read from this one file.
// ============================================================
const NEEDS_CSV_URL = "";   // published CSV of the "Needs" tab (one row per home visit)
const RESULTS_CSV_URL = ""; // published CSV of the "Results" tab (already formula-computed in the workbook)

// Where "Give" buttons send people — the ONE shared SVdP giving option on the
// parish site. There is no way to earmark a gift to a specific family: all
// gifts go into one fund that SVdP draws from, with a natural lag between
// giving and disbursement.
const DONATE_URL = ""; // e.g. "https://www.fellowshiponegiving.com/App/Form/XXXX"

// FUND_RAISED is a manually-updated number — how much has come in toward this
// month's known need, as best a Vincentian can estimate from the parish giving
// system. It is NOT live-tracked. FUND_RAISED_MONTH pairs it with a month
// ("YYYY-MM"); if the site is opened in a later month before this has been
// updated, the thermometer shows $0 automatically rather than stale data.
const FUND_RAISED = 300;
const FUND_RAISED_MONTH = "2026-07";

function currentMonthKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
function effectiveFundRaised() {
  return FUND_RAISED_MONTH === currentMonthKey() ? FUND_RAISED : 0;
}

// ------------------------------------------------------------
// Sample data — one row per home visit, matching the real Needs
// tab column headers (after Google's CSV-publish header normalization:
// lowercased, spaces -> underscores, punctuation like ? and # kept).
// ------------------------------------------------------------
const SAMPLE_NEEDS = [
  {
    servware_id: "1", initial_home_visit_date: "2026-08-02", "#_in_household": "4",
    summary: "Family of 4, kids sharing a room. Currently sleeping on the floor.",
    "household_items_needed?": "Yes", distribution_center_request_date: "",
    household_items_needed: "Twin bed frame + mattress", household_need_status: "Open",
    "rent_assistance_needed?": "", rent_assistance_needed: "", rent_amount_needed: "", rent_need_status: "",
    "utility_assistance_needed?": "", utility_assistance_needed: "", utility_need_amount: "", utility_need_status: "",
    overall_status: "Active", month_posted: "2026-08",
  },
  {
    servware_id: "3", initial_home_visit_date: "2026-07-30", "#_in_household": "3",
    summary: "Grandmother raising two grandchildren, short after a car repair.",
    "household_items_needed?": "", distribution_center_request_date: "",
    household_items_needed: "", household_need_status: "",
    "rent_assistance_needed?": "Yes", rent_assistance_needed: "March Rent Assistance", rent_amount_needed: "420", rent_need_status: "Open",
    "utility_assistance_needed?": "", utility_assistance_needed: "", utility_need_amount: "", utility_need_status: "",
    overall_status: "Active", month_posted: "2026-07",
  },
  {
    servware_id: "4", initial_home_visit_date: "2026-07-28", "#_in_household": "3",
    summary: "Household of 3, shutoff notice received this week.",
    "household_items_needed?": "", distribution_center_request_date: "",
    household_items_needed: "", household_need_status: "",
    "rent_assistance_needed?": "", rent_assistance_needed: "", rent_amount_needed: "", rent_need_status: "",
    "utility_assistance_needed?": "Yes", utility_assistance_needed: "Overdue Electric Bill", utility_need_amount: "185", utility_need_status: "Partially Covered",
    overall_status: "Active", month_posted: "2026-07",
  },
  {
    servware_id: "6", initial_home_visit_date: "2026-07-21", "#_in_household": "4",
    summary: "Mom returning to work after medical leave, one month behind.",
    "household_items_needed?": "", distribution_center_request_date: "",
    household_items_needed: "", household_need_status: "",
    "rent_assistance_needed?": "Yes", rent_assistance_needed: "February Rent Assistance", rent_amount_needed: "300", rent_need_status: "Covered",
    "utility_assistance_needed?": "", utility_assistance_needed: "", utility_need_amount: "", utility_need_status: "",
    overall_status: "Inactive", month_posted: "2026-07",
  },
  {
    servware_id: "7", initial_home_visit_date: "2026-07-18", "#_in_household": "2",
    summary: "Elderly couple on fixed income, house has been cold.",
    "household_items_needed?": "", distribution_center_request_date: "",
    household_items_needed: "", household_need_status: "",
    "rent_assistance_needed?": "", rent_assistance_needed: "", rent_amount_needed: "", rent_need_status: "",
    "utility_assistance_needed?": "Yes", utility_assistance_needed: "Gas Bill", utility_need_amount: "120", utility_need_status: "Open",
    overall_status: "Active", month_posted: "2026-07",
  },
];

// The Results tab is already fully formula-driven from the Needs tab inside
// the workbook itself — the site just displays whatever it publishes.
const SAMPLE_RESULTS = [
  { month: "July 2026", home_visits: "4", people_helped: "13", furniture_requests: "1", rent_utility_requests: "3", financial_assistance: "300" },
  { month: "August 2026", home_visits: "1", people_helped: "4", furniture_requests: "1", rent_utility_requests: "0", financial_assistance: "0" },
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

async function loadVisits() { return loadCSV(NEEDS_CSV_URL, SAMPLE_NEEDS); }
async function loadResults() { return loadCSV(RESULTS_CSV_URL, SAMPLE_RESULTS); }

// ------------------------------------------------------------
// Expand each visit row into up to 3 board cards (Household item,
// Rent, Utility) — this is the bridge between the workbook's
// one-row-per-visit shape and the board's one-card-per-need display.
// ------------------------------------------------------------
function expandVisitsToNeeds(visits) {
  const needs = [];
  visits.forEach(v => {
    const monthPosted = v.month_posted || '';
    const detail = v.summary || '';

    if ((v['household_items_needed?'] || '').toLowerCase() === 'yes') {
      needs.push({
        id: `${v.servware_id}-H`,
        category: 'Furnishings',
        title: v.household_items_needed || 'Household item',
        detail,
        status: v.household_need_status || 'Open',
        amount: '', // no dollar figure tracked for household items — fulfilled via distribution center
        month_posted: monthPosted,
      });
    }
    if ((v['rent_assistance_needed?'] || '').toLowerCase() === 'yes') {
      needs.push({
        id: `${v.servware_id}-R`,
        category: 'Rent',
        title: v.rent_assistance_needed || 'Rent Assistance',
        detail,
        status: v.rent_need_status || 'Open',
        amount: v.rent_amount_needed || '',
        month_posted: monthPosted,
      });
    }
    if ((v['utility_assistance_needed?'] || '').toLowerCase() === 'yes') {
      needs.push({
        id: `${v.servware_id}-U`,
        category: 'Utilities',
        title: v.utility_assistance_needed || 'Utility Assistance',
        detail,
        status: v.utility_need_status || 'Open',
        amount: v.utility_need_amount || '',
        month_posted: monthPosted,
      });
    }
  });
  return needs;
}

async function loadNeeds() {
  const visits = await loadVisits();
  return expandVisitsToNeeds(visits);
}

// Applies the monthly rollover rule: a Covered need from a PRIOR month drops
// off automatically; Open/Partially Covered needs keep showing regardless of
// age; needs posted in the current month show regardless of status.
function visibleNeeds(needs) {
  const thisMonth = currentMonthKey();
  return needs.filter(n => {
    const status = (n.status || 'open').toLowerCase();
    const postedThisMonth = (n.month_posted || thisMonth) === thisMonth;
    if (status !== 'covered') return true;
    return postedThisMonth;
  });
}

// The shared fund goal is the sum of "amount" across visible Rent/Utility
// needs that aren't Covered yet — i.e. the known gap still open right now.
function fundGoal(needs) {
  return visibleNeeds(needs)
    .filter(n => (n.category === 'Rent' || n.category === 'Utilities') && n.amount)
    .filter(n => (n.status || 'Open').toLowerCase() !== 'covered')
    .reduce((sum, n) => sum + (Number(n.amount) || 0), 0);
}

const STATUS_COLOR = { open: "#A8492E", "partially covered": "#C9A24B", covered: "#7C8B6F" };
function statusColor(status) {
  return STATUS_COLOR[(status || 'open').toLowerCase()] || STATUS_COLOR.open;
}
