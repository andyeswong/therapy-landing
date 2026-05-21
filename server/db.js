import Database from 'better-sqlite3'
import { existsSync, mkdirSync, readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { createHash, randomBytes } from 'crypto'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR  = join(__dirname, '../data')
const DB_PATH   = join(DATA_DIR, 'app.db')
const APPTS_JSON = join(__dirname, '../src/data/appointments.json')
const NOTES_JSON = join(__dirname, '../src/data/notes.json')

if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })

export const PIN_HASH = createHash('sha256').update(process.env.APP_PIN || '280217').digest('hex')

let _db

export function getDb() {
  if (_db) return _db
  _db = new Database(DB_PATH)
  _db.pragma('journal_mode = WAL')
  _db.pragma('foreign_keys = ON')
  initSchema(_db)
  return _db
}

export function createSession(db) {
  const token = randomBytes(32).toString('hex')
  db.prepare('INSERT INTO sessions (token, created_at) VALUES (?, ?)').run(token, Date.now())
  return token
}

export function validateSession(db, token) {
  if (!token) return false
  return !!db.prepare('SELECT 1 FROM sessions WHERE token = ?').get(token)
}

function initSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS appointments (
      id       INTEGER PRIMARY KEY AUTOINCREMENT,
      date     TEXT NOT NULL,
      time     TEXT NOT NULL DEFAULT '',
      title    TEXT NOT NULL,
      place    TEXT NOT NULL DEFAULT '',
      category TEXT NOT NULL DEFAULT 'neuropsic',
      status   TEXT NOT NULL DEFAULT 'pendiente',
      cost     REAL NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS notes (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      text       TEXT NOT NULL DEFAULT '',
      color      TEXT NOT NULL DEFAULT 'yellow',
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS config (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token      TEXT PRIMARY KEY,
      created_at INTEGER NOT NULL
    );
  `)

  // Migration: add cost column to existing appointments table
  const cols = db.prepare('PRAGMA table_info(appointments)').all().map(c => c.name)
  if (!cols.includes('cost')) {
    db.prepare('ALTER TABLE appointments ADD COLUMN cost REAL NOT NULL DEFAULT 0').run()
    // Populate cost from prices config for existing rows
    try {
      const row = db.prepare("SELECT value FROM config WHERE key='prices'").get()
      if (row) {
        const prices = JSON.parse(row.value)
        const nCount = db.prepare("SELECT COUNT(*) as c FROM appointments WHERE category='neuropsic'").get().c
        const perSession = nCount > 0 ? Math.round(prices.neuropsic_total / nCount) : 0
        db.prepare("UPDATE appointments SET cost=? WHERE category='neuropsic'").run(perSession)
        Object.entries(prices.alem   || {}).forEach(([title, val]) =>
          db.prepare("UPDATE appointments SET cost=? WHERE category='alem' AND title=?").run(val, title))
        Object.entries(prices.study  || {}).forEach(([title, val]) =>
          db.prepare("UPDATE appointments SET cost=? WHERE category='study' AND title=?").run(val, title))
      }
    } catch {}
  }

  // One-time seed from JSON files
  if (db.prepare('SELECT COUNT(*) as c FROM appointments').get().c === 0) {
    try {
      const { appointments, prices } = JSON.parse(readFileSync(APPTS_JSON, 'utf-8'))
      const nCount = appointments.filter(a => a.category === 'neuropsic').length
      const perSession = nCount > 0 ? Math.round(prices.neuropsic_total / nCount) : 0
      const ins = db.prepare(
        'INSERT INTO appointments (id,date,time,title,place,category,status,cost) VALUES (@id,@date,@time,@title,@place,@category,@status,@cost)'
      )
      db.transaction(rows => rows.forEach(a => {
        let cost = 0
        if (a.category === 'neuropsic') cost = perSession
        else if (a.category === 'alem')  cost = prices.alem[a.title]  || 0
        else if (a.category === 'study') cost = prices.study[a.title] || 0
        ins.run({ id: a.id, date: a.date, time: a.time || '', title: a.title,
                  place: a.place || '', category: a.category, status: a.status || 'pendiente', cost })
      }))(appointments)
    } catch {}
  }

  if (db.prepare("SELECT COUNT(*) as c FROM config WHERE key='prices'").get().c === 0) {
    try {
      const { prices } = JSON.parse(readFileSync(APPTS_JSON, 'utf-8'))
      db.prepare("INSERT INTO config (key,value) VALUES ('prices',?)").run(JSON.stringify(prices))
    } catch {
      db.prepare("INSERT INTO config (key,value) VALUES ('prices',?)").run(
        JSON.stringify({ neuropsic_total: 0, alem: {}, study: {} })
      )
    }
  }

  if (db.prepare('SELECT COUNT(*) as c FROM notes').get().c === 0) {
    try {
      const notes = JSON.parse(readFileSync(NOTES_JSON, 'utf-8'))
      if (Array.isArray(notes) && notes.length) {
        const ins = db.prepare('INSERT INTO notes (id,text,color,sort_order) VALUES (@id,@text,@color,@sort_order)')
        db.transaction(rows => rows.forEach((n, i) => ins.run({
          id: n.id, text: n.text || '', color: n.color || 'yellow', sort_order: i
        })))(notes)
      }
    } catch {}
  }
}
