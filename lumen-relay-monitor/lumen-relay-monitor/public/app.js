const streamEl = document.getElementById('stream');
const tableEl = document.getElementById('table');

const rpcStatusEl = document.getElementById('rpcStatus');
const blockNumEl = document.getElementById('blockNum');
const lagEl = document.getElementById('lag');
const eventCountEl = document.getElementById('eventCount');
const authorsEl = document.getElementById('authors');
const kernelEl = document.getElementById('kernel');

const topicInput = document.getElementById('topic');
const authorInput = document.getElementById('author');
const limitInput = document.getElementById('limit');
const applyBtn = document.getElementById('apply');
const clearBtn = document.getElementById('clear');

let events = [];
let authors = new Set();
let headBlock = 0;

function shortHex(h, n=6) {
  if (!h) return '';
  return h.slice(0, 2+n) + '…' + h.slice(-4);
}

function ts(t) {
  const d = new Date(t * 1000);
  const hh = String(d.getHours()).padStart(2,'0');
  const mm = String(d.getMinutes()).padStart(2,'0');
  const ss = String(d.getSeconds()).padStart(2,'0');
  return `${hh}:${mm}:${ss}`;
}

function addLine(e) {
  const p = document.createElement('div');
  p.className = 'line';
  p.innerHTML = `${ts(e.timestamp)} <span class="muted">blk</span>${e.blockNumber} <span class="muted">seq</span>${e.seq} <span class="muted">topic</span>${shortHex(e.topic, 10)} <span class="muted">by</span>${shortHex(e.author, 10)} <span class="muted">ctx</span>${shortHex(e.contextId, 10)}`;
  streamEl.prepend(p);
  // keep last 300 lines
  while (streamEl.childNodes.length > 300) streamEl.removeChild(streamEl.lastChild);
}

function renderTable() {
  tableEl.innerHTML = '';
  const header = document.createElement('div');
  header.className = 'h';
  header.innerHTML = '<div>time</div><div>topic / hashes</div><div>author</div><div>tx</div>';
  tableEl.appendChild(header);

  for (const e of events.slice(0, 250)) {
    const row = document.createElement('div');
    row.className = 'row';
    const txUrl = `https://base.blockscout.com/tx/${e.txHash}`;
    row.innerHTML = `
      <div>${ts(e.timestamp)}<div class="muted">#${e.blockNumber}</div></div>
      <div>
        <div><span class="badge">topic</span> ${e.topic}</div>
        <div class="muted">payload ${shortHex(e.payloadHash, 10)} • uri ${shortHex(e.uriHash, 10)} • meta ${shortHex(e.metaHash, 10)}</div>
        <div class="muted">contextId ${shortHex(e.contextId, 12)}</div>
      </div>
      <div>${e.author}</div>
      <div><a href="${txUrl}" target="_blank" rel="noreferrer">${shortHex(e.txHash, 10)}</a></div>
    `;
    tableEl.appendChild(row);
  }
}

function updateStats() {
  eventCountEl.textContent = String(events.length);
  authorsEl.textContent = String(authors.size);
  blockNumEl.textContent = String(headBlock);
  if (events.length > 0 && headBlock) {
    const newest = events[0].blockNumber;
    lagEl.textContent = String(Math.max(0, headBlock - newest));
  }
}

async function fetchHealth() {
  const r = await fetch('/health');
  const j = await r.json();
  rpcStatusEl.textContent = j.ok ? 'OK' : 'ERR';
  headBlock = j.latestBlock || 0;
  kernelEl.textContent = `Kernel: ${j.kernelAddress}`;
  updateStats();
}

function qs() {
  const topic = topicInput.value.trim();
  const author = authorInput.value.trim();
  const limit = Number(limitInput.value || 200);
  const p = new URLSearchParams();
  if (topic) p.set('topic', topic);
  if (author) p.set('author', author);
  p.set('limit', String(Math.min(Math.max(limit, 1), 1000)));
  return p.toString();
}

async function loadEvents() {
  const r = await fetch(`/events?${qs()}`);
  const j = await r.json();
  events = j.events || [];
  authors = new Set(events.map(e => e.author.toLowerCase()));
  renderTable();
  updateStats();
}

function connectStream() {
  const es = new EventSource(`/stream?${qs()}`);
  es.addEventListener('context', (ev) => {
    const e = JSON.parse(ev.data);
    events.unshift(e);
    authors.add(e.author.toLowerCase());
    addLine(e);
    if (events.length % 10 === 0) renderTable();
    updateStats();
  });
  es.onerror = () => {
    // auto-reconnect by recreating EventSource
    es.close();
    setTimeout(connectStream, 1500);
  };
  return es;
}

let es = null;

applyBtn.onclick = async () => {
  if (es) es.close();
  await loadEvents();
  es = connectStream();
};

clearBtn.onclick = async () => {
  topicInput.value = '';
  authorInput.value = '';
  if (es) es.close();
  await loadEvents();
  es = connectStream();
};

(async () => {
  await fetchHealth();
  await loadEvents();
  es = connectStream();
  setInterval(fetchHealth, 5000);
})();
