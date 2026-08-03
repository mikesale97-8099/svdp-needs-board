// ============================================================
// SHARED CONFIG — paste your published Google Sheet CSV URLs here.
// File > Share > Publish to web > select the tab > CSV.
// Leave as "" to use the sample data below instead.
// Both index.html and board.html read from this one file.
// ============================================================
const NEEDS_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQfHbKTRIbnDPqch2FCNGXKjbmXG8ReltAk5-KahXqQ6MgHY-yscQ9-IJ7TEbSTreAffgx8FL2LchoQ/pub?gid=1892373341&single=true&output=csv";
const RESULTS_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQfHbKTRIbnDPqch2FCNGXKjbmXG8ReltAk5-KahXqQ6MgHY-yscQ9-IJ7TEbSTreAffgx8FL2LchoQ/pub?gid=769314143&single=true&output=csv";
const LEDGER_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQfHbKTRIbnDPqch2FCNGXKjbmXG8ReltAk5-KahXqQ6MgHY-yscQ9-IJ7TEbSTreAffgx8FL2LchoQ/pub?gid=500042350&single=true&output=csv"; // published CSV of the "Balance Snapshot" tab (feeds the balance gauge)

// Where "Give" buttons send people — the ONE shared SVdP giving option on the
// parish site. There is no way to earmark a gift to a specific family: all
// gifts go into one fund that SVdP draws from, with a natural lag between
// giving and disbursement.
const DONATE_URL = "give.html"; // placeholder — swap for St. Luke's real online giving link once the SVdP designation is live there

// When someone clicks "I can help" on a Special Need item, we open a
// pre-filled email to this address so a real person actually finds out.
// This is a stopgap — no record persists anywhere except that inbox, and
// it relies on the sender actually hitting "send" in their email client.
const CLAIM_NOTIFY_EMAIL = "maccsale@sbcglobal.net";

// Google Sheets exports currency-formatted cells with the $ and thousands
// commas baked into the CSV text (e.g. "$1,590"). Number() chokes on that,
// so every dollar figure needs to go through this first.
function toNumber(val) {
  if (val === null || val === undefined || val === '') return 0;
  const n = Number(String(val).replace(/[^0-9.-]/g, ''));
  return isNaN(n) ? 0 : n;
}

function currentMonthKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
// "2026-08-02" -> "August"
function formatMonthName(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d)) return '';
  return d.toLocaleString('en-US', { month: 'long' });
}
// "2026-08-02" -> "August 2026" (matches the Results tab's "month" column)
function formatMonthYear(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d)) return '';
  return d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
}
// "August 2026" -> "Aug-26" (for tight table columns)
function formatMonthAbbrev(monthLabel) {
  if (!monthLabel) return '';
  const parts = monthLabel.trim().split(/\s+/);
  if (parts.length < 2) return monthLabel;
  const [monthName, year] = parts;
  const d = new Date(`${monthName} 1, ${year}`);
  if (isNaN(d)) return monthLabel;
  const abbrev = d.toLocaleString('en-US', { month: 'short' });
  return `${abbrev}-${String(year).slice(-2)}`;
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
    "warehouse_item_needed?": "Yes", distribution_center_request_date: "",
    warehouse_item: "Twin bed frame + mattress", warehouse_status: "Open",
    "special_need_item?": "", special_need_item: "", special_need_status: "",
    "rent_assistance_needed?": "", rent_assistance_needed: "", rent_amount_needed: "", rent_need_status: "",
    "utility_assistance_needed?": "", utility_assistance_needed: "", utility_need_amount: "", utility_need_status: "",
    overall_status: "Active", month_posted: "2026-08",
  },
  {
    servware_id: "3", initial_home_visit_date: "2026-07-30", "#_in_household": "3",
    summary: "Grandmother raising two grandchildren, short after a car repair.",
    "warehouse_item_needed?": "", distribution_center_request_date: "",
    warehouse_item: "", warehouse_status: "",
    "special_need_item?": "", special_need_item: "", special_need_status: "",
    "rent_assistance_needed?": "Yes", rent_assistance_needed: "March Rent Assistance", rent_amount_needed: "420", rent_need_status: "Open",
    "utility_assistance_needed?": "", utility_assistance_needed: "", utility_need_amount: "", utility_need_status: "",
    overall_status: "Active", month_posted: "2026-07",
  },
  {
    servware_id: "4", initial_home_visit_date: "2026-07-28", "#_in_household": "3",
    summary: "Household of 3, shutoff notice received this week.",
    "warehouse_item_needed?": "", distribution_center_request_date: "",
    warehouse_item: "", warehouse_status: "",
    "special_need_item?": "", special_need_item: "", special_need_status: "",
    "rent_assistance_needed?": "", rent_assistance_needed: "", rent_amount_needed: "", rent_need_status: "",
    "utility_assistance_needed?": "Yes", utility_assistance_needed: "Overdue Electric Bill", utility_need_amount: "185", utility_need_status: "Partially Covered",
    overall_status: "Active", month_posted: "2026-07",
  },
  {
    servware_id: "6", initial_home_visit_date: "2026-07-21", "#_in_household": "4",
    summary: "Mom returning to work after medical leave, one month behind.",
    "warehouse_item_needed?": "", distribution_center_request_date: "",
    warehouse_item: "", warehouse_status: "",
    "special_need_item?": "", special_need_item: "", special_need_status: "",
    "rent_assistance_needed?": "Yes", rent_assistance_needed: "February Rent Assistance", rent_amount_needed: "300", rent_need_status: "Covered",
    "utility_assistance_needed?": "", utility_assistance_needed: "", utility_need_amount: "", utility_need_status: "",
    overall_status: "Inactive", month_posted: "2026-07",
  },
  {
    servware_id: "7", initial_home_visit_date: "2026-07-18", "#_in_household": "2",
    summary: "Elderly couple on fixed income, house has been cold.",
    "warehouse_item_needed?": "", distribution_center_request_date: "",
    warehouse_item: "", warehouse_status: "",
    "special_need_item?": "", special_need_item: "", special_need_status: "",
    "rent_assistance_needed?": "", rent_assistance_needed: "", rent_amount_needed: "", rent_need_status: "",
    "utility_assistance_needed?": "Yes", utility_assistance_needed: "Gas Bill", utility_need_amount: "120", utility_need_status: "Open",
    overall_status: "Active", month_posted: "2026-07",
  },
  {
    // Has BOTH a warehouse item and a special need — the board shows only
    // the special need (claimable); the warehouse item still counts in
    // Results but never renders its own card.
    servware_id: "127", initial_home_visit_date: "2026-08-12", "#_in_household": "4",
    summary: "Family needs both a kitchen table and help with utilities.",
    "warehouse_item_needed?": "Yes", distribution_center_request_date: "",
    warehouse_item: "Kitchen table + chairs", warehouse_status: "Open",
    "special_need_item?": "Yes", special_need_item: "High chair", special_need_status: "Open",
    "rent_assistance_needed?": "", rent_assistance_needed: "", rent_amount_needed: "", rent_need_status: "",
    "utility_assistance_needed?": "Yes", utility_assistance_needed: "Water Bill", utility_need_amount: "85", utility_need_status: "Open",
    overall_status: "Active", month_posted: "2026-08",
  },
  {
    // Special need only, no warehouse item at all.
    servware_id: "129", initial_home_visit_date: "2026-08-16", "#_in_household": "3",
    summary: "Family needs a microwave — not available through the warehouse this cycle.",
    "warehouse_item_needed?": "", distribution_center_request_date: "",
    warehouse_item: "", warehouse_status: "",
    "special_need_item?": "Yes", special_need_item: "Microwave", special_need_status: "Open",
    "rent_assistance_needed?": "", rent_assistance_needed: "", rent_amount_needed: "", rent_need_status: "",
    "utility_assistance_needed?": "", utility_assistance_needed: "", utility_need_amount: "", utility_need_status: "",
    overall_status: "Active", month_posted: "2026-08",
  },
];

// The Results tab is already fully formula-driven from the Needs tab inside
// the workbook itself — the site just displays whatever it publishes.
const SAMPLE_RESULTS = [
  { month: "June 2026", home_visits: "10", people_helped: "32", furniture_requests: "3", rent_utility_requests: "7", financial_assistance: "1590" },
  { month: "July 2026", home_visits: "10", people_helped: "33", furniture_requests: "3", rent_utility_requests: "8", financial_assistance: "395" },
  { month: "August 2026", home_visits: "8", people_helped: "26", furniture_requests: "2", rent_utility_requests: "6", financial_assistance: "0" },
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

async function loadVisits() {
  if (!NEEDS_CSV_URL) return SAMPLE_NEEDS;
  try {
    const res = await fetch(NEEDS_CSV_URL);
    if (!res.ok) throw new Error('fetch failed');
    let text = await res.text();
    // The Needs tab has a merged group-header row ABOVE the real per-column
    // headers (e.g. "Household Items Needed?" spanning 4 columns). When
    // published to CSV that row comes through as literal, mostly-blank
    // text — strip it so row 2's real headers are what parseCSV reads.
    const firstBreak = text.indexOf('\n');
    if (firstBreak !== -1) text = text.slice(firstBreak + 1);
    return parseCSV(text);
  } catch (e) {
    console.warn('Falling back to sample data for Needs CSV', e);
    return SAMPLE_NEEDS;
  }
}
async function loadResults() { return loadCSV(RESULTS_CSV_URL, SAMPLE_RESULTS); }

// ------------------------------------------------------------
// Expand each visit row into board cards — this is the bridge between the
// workbook's one-row-per-visit shape and the board's one-card-per-need
// display. Household items are special: a visit tracks a Warehouse item
// and a Special Need item INDEPENDENTLY (both count toward Results), but
// the board only ever shows ONE household card per visit — the Special
// Need if one exists (claimable, "I can help"), otherwise the Warehouse
// item (informational only, no button — most items are fulfilled this way
// with no parishioner action needed).
// ------------------------------------------------------------
function expandVisitsToNeeds(visits) {
  const needs = [];
  visits.forEach(v => {
    const monthPosted = v.month_posted || '';
    const detail = v.summary || '';

    const hasSpecial = (v['special_need_item?'] || '').toLowerCase() === 'yes';
    const hasWarehouse = (v['warehouse_item_needed?'] || '').toLowerCase() === 'yes';

    if (hasSpecial) {
      needs.push({
        id: `${v.servware_id}-H`,
        category: 'Furnishings',
        subtype: 'special',
        title: v.special_need_item || 'Household item',
        detail,
        status: v.special_need_status || 'Open',
        amount: '',
        month_posted: monthPosted,
      });
    } else if (hasWarehouse) {
      needs.push({
        id: `${v.servware_id}-H`,
        category: 'Furnishings',
        subtype: 'warehouse',
        title: v.warehouse_item || 'Household item',
        detail,
        status: v.warehouse_status || 'Open',
        amount: '',
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
        amount: v.rent_amount_needed ? String(toNumber(v.rent_amount_needed)) : '',
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
        amount: v.utility_need_amount ? String(toNumber(v.utility_need_amount)) : '',
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

// ------------------------------------------------------------
// Balance Snapshot / balance gauge — a simple hand-reported snapshot
// (not a transactional ledger; detailed money-tracking lives elsewhere
// with whoever minds the funds). Separate from the "known need"
// thermometer above.
// ------------------------------------------------------------
const SAMPLE_BALANCE_SNAPSHOTS = [
  { snapshot_date: "2026-07-05", funds_budgeted: "1700", outstanding_needs: "900", assistance_provided_this_month: "250" },
  { snapshot_date: "2026-07-12", funds_budgeted: "1700", outstanding_needs: "605", assistance_provided_this_month: "395" },
  { snapshot_date: "2026-07-19", funds_budgeted: "1650", outstanding_needs: "420", assistance_provided_this_month: "395" },
  { snapshot_date: "2026-07-26", funds_budgeted: "1700", outstanding_needs: "185", assistance_provided_this_month: "395" },
  { snapshot_date: "2026-08-02", funds_budgeted: "1700", outstanding_needs: "605", assistance_provided_this_month: "0" },
];

async function loadBalanceSnapshots() { return loadCSV(LEDGER_CSV_URL, SAMPLE_BALANCE_SNAPSHOTS); }

// Uses the LAST row (most recent snapshot) for funds_budgeted — that part
// stays manual/treasurer-reported. The Balance Snapshot tab's own
// outstanding_needs column is NOT used here anymore (see outstandingNeedsSummary
// below) — outstanding needs and family count have to come from the same
// live source or they'd drift out of sync with each other.
function latestSnapshot(rows) {
  return rows.length ? rows[rows.length - 1] : null;
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
    .reduce((sum, n) => sum + toNumber(n.amount), 0);
}

// Live from the Needs tab: total outstanding $ AND the number of distinct
// families behind it (a family can have both a Rent and a Utility need —
// counted as 2 needs but 1 family, via the shared visit id prefix on each
// expanded need's id, e.g. "121-R" and "121-U" both belong to family 121).
function outstandingNeedsSummary(needs) {
  const open = visibleNeeds(needs)
    .filter(n => (n.category === 'Rent' || n.category === 'Utilities') && n.amount)
    .filter(n => (n.status || 'Open').toLowerCase() !== 'covered');
  const total = open.reduce((sum, n) => sum + toNumber(n.amount), 0);
  const families = new Set(open.map(n => n.id.split('-')[0]));
  return { total, families: families.size };
}

// Builds the full "This Month, At a Glance" block as two <p> paragraphs.
// Paragraph 1 (activity) pulls from the matching Results row for this month.
// Paragraph 2 (funds/needs) is unchanged in logic from before.
function buildSnapshotSentence(needs, resultsRows, snap) {
  if (!snap) return '';
  const month = formatMonthName(snap.snapshot_date) || 'this month';
  const monthYear = formatMonthYear(snap.snapshot_date);
  const results = (resultsRows || []).find(r => r.month === monthYear);

  let activity;
  if (results) {
    const visits = toNumber(results.home_visits);
    const assistance = toNumber(results.financial_assistance);
    const visitWord = visits === 1 ? 'home' : 'homes';
    activity = `In <strong>${month}</strong>, SVdP visited <strong>${visits}</strong> ${visitWord}, gave <strong>$${assistance.toLocaleString()}</strong> in rent/utility assistance, and provided furniture/home goods to neighbors in need.`;
  } else {
    activity = `In <strong>${month}</strong>, SVdP continues visiting families across our parish community.`;
  }

  const funds = toNumber(snap.funds_budgeted);
  const { total: needsTotal, families } = outstandingNeedsSummary(needs);
  const gap = funds - needsTotal;
  const avgRequest = families ? needsTotal / families : 0;
  const familyWord = families === 1 ? 'family' : 'families';

  let s = `We have <strong>$${funds.toLocaleString()}</strong> in available funds`;

  if (families > 0) {
    s += ` and outstanding requests from <strong>${families}</strong> ${familyWord} totaling <strong>$${needsTotal.toLocaleString()}</strong> for rent/utility assistance.`;
  } else {
    s += ` and no open rent or utility requests right now.`;
  }

  if (gap >= 0) {
    s += ` This leaves <strong>$${gap.toLocaleString()}</strong> for future requests`;
    if (avgRequest > 0) {
      const mm = Math.max(1, Math.round(gap / avgRequest));
      s += ` &mdash; approximately <strong>${mm}</strong> more request${mm === 1 ? '' : 's'} at this month's typical size.`;
    } else {
      s += `.`;
    }
  } else {
    s += ` That's <strong>$${Math.abs(gap).toLocaleString()}</strong> more than what's currently budgeted &mdash; additional gifts will be needed to fully cover it.`;
  }

  return `<p>${activity}</p><p>${s}</p>`;
}

const STATUS_COLOR = { open: "#A8492E", "partially covered": "#C9A24B", covered: "#7C8B6F" };
function statusColor(status) {
  return STATUS_COLOR[(status || 'open').toLowerCase()] || STATUS_COLOR.open;
}
