import Database from "better-sqlite3";

export type Db = Database.Database;

export function openDb(dbPath: string): Db {
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS contexts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chainId INTEGER NOT NULL,
      blockNumber INTEGER NOT NULL,
      txHash TEXT NOT NULL,
      logIndex INTEGER NOT NULL,
      timestamp INTEGER NOT NULL,
      topic TEXT NOT NULL,
      seq INTEGER NOT NULL,
      author TEXT NOT NULL,
      payloadHash TEXT NOT NULL,
      uriHash TEXT NOT NULL,
      metaHash TEXT NOT NULL,
      contextId TEXT NOT NULL,
      UNIQUE(txHash, logIndex)
    );

    CREATE INDEX IF NOT EXISTS idx_contexts_topic ON contexts(topic);
    CREATE INDEX IF NOT EXISTS idx_contexts_author ON contexts(author);
    CREATE INDEX IF NOT EXISTS idx_contexts_time ON contexts(timestamp);
  `);
  return db;
}

export function getMeta(db: Db, key: string): string | null {
  const row = db.prepare("SELECT value FROM meta WHERE key=?").get(key) as any;
  return row?.value ?? null;
}

export function setMeta(db: Db, key: string, value: string): void {
  db.prepare("INSERT INTO meta(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value")
    .run(key, value);
}

export type ContextRow = {
  chainId: number;
  blockNumber: number;
  txHash: string;
  logIndex: number;
  timestamp: number;
  topic: string;
  seq: number;
  author: string;
  payloadHash: string;
  uriHash: string;
  metaHash: string;
  contextId: string;
};

export function insertContext(db: Db, row: ContextRow): boolean {
  try {
    db.prepare(`
      INSERT INTO contexts(chainId, blockNumber, txHash, logIndex, timestamp, topic, seq, author, payloadHash, uriHash, metaHash, contextId)
      VALUES(@chainId, @blockNumber, @txHash, @logIndex, @timestamp, @topic, @seq, @author, @payloadHash, @uriHash, @metaHash, @contextId)
    `).run(row as any);
    return true;
  } catch (e: any) {
    // ignore duplicates
    if (String(e?.message || "").includes("UNIQUE")) return false;
    throw e;
  }
}

export function queryEvents(db: Db, opts: { topic?: string; author?: string; limit: number }): ContextRow[] {
  const where: string[] = [];
  const params: any = {};
  if (opts.topic) { where.push("topic = @topic"); params.topic = opts.topic; }
  if (opts.author) { where.push("lower(author) = lower(@author)"); params.author = opts.author; }
  const sql = `
    SELECT chainId, blockNumber, txHash, logIndex, timestamp, topic, seq, author, payloadHash, uriHash, metaHash, contextId
    FROM contexts
    ${where.length ? "WHERE " + where.join(" AND ") : ""}
    ORDER BY blockNumber DESC, logIndex DESC
    LIMIT @limit
  `;
  params.limit = opts.limit;
  return db.prepare(sql).all(params) as any;
}

export function queryTopics(db: Db, limit: number): { topic: string; count: number }[] {
  const sql = `
    SELECT topic, COUNT(*) as count
    FROM contexts
    GROUP BY topic
    ORDER BY count DESC
    LIMIT ?
  `;
  return db.prepare(sql).all(limit) as any;
}
