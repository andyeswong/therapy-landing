import { fileURLToPath } from 'url'
import { dirname, join, extname } from 'path'
import { createHash } from 'crypto'
import { mkdirSync } from 'fs'
import express from 'express'
import multer from 'multer'
import { getDb, PIN_HASH, createSession, validateSession } from './db.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
app.use(express.json())
app.use(express.static(join(__dirname, '../dist')))

const db = getDb()

// File uploads
const uploadsDir = join(__dirname, '../data/uploads')
mkdirSync(uploadsDir, { recursive: true })
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = extname(file.originalname)
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`)
  },
})
const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } })
app.use('/uploads', express.static(uploadsDir))

function requireAuth(req, res, next) {
  const auth = req.headers.authorization || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  if (!validateSession(db, token)) return res.status(401).json({ error: 'Unauthorized' })
  next()
}

// Auth
app.post('/api/auth', (req, res) => {
  const { pin } = req.body || {}
  if (!pin) return res.status(400).json({ error: 'PIN requerido' })
  const hash = createHash('sha256').update(String(pin)).digest('hex')
  if (hash !== PIN_HASH) return res.status(401).json({ error: 'PIN incorrecto' })
  res.json({ token: createSession(db) })
})

app.post('/api/auth/logout', requireAuth, (req, res) => {
  const token = req.headers.authorization.slice(7)
  db.prepare('DELETE FROM sessions WHERE token = ?').run(token)
  res.json({ ok: true })
})

// Appointments
app.get('/api/appointments', requireAuth, (req, res) => {
  const appointments = db.prepare('SELECT * FROM appointments ORDER BY id').all()
  const row = db.prepare("SELECT value FROM config WHERE key='prices'").get()
  const prices = row ? JSON.parse(row.value) : { neuropsic_total: 0, alem: {}, study: {} }
  res.json({ appointments, prices })
})

app.post('/api/appointments', requireAuth, (req, res) => {
  const { appointments, prices } = req.body || {}
  if (!Array.isArray(appointments)) return res.status(400).json({ error: 'appointments must be array' })

  db.transaction(() => {
    db.prepare('DELETE FROM appointments').run()
    const ins = db.prepare(
      'INSERT INTO appointments (id,date,time,title,place,category,status,cost) VALUES (@id,@date,@time,@title,@place,@category,@status,@cost)'
    )
    appointments.forEach(a => ins.run({
      id: a.id, date: a.date, time: a.time || '',
      title: a.title, place: a.place || '',
      category: a.category, status: a.status || 'pendiente',
      cost: a.cost ?? 0,
    }))
  })()

  res.json({ ok: true })
})

// Notes
app.get('/api/notes', requireAuth, (req, res) => {
  res.json(db.prepare('SELECT * FROM notes ORDER BY sort_order').all())
})

app.post('/api/notes', requireAuth, (req, res) => {
  const notes = req.body
  if (!Array.isArray(notes)) return res.status(400).json({ error: 'notes must be array' })

  db.transaction(() => {
    db.prepare('DELETE FROM notes').run()
    const ins = db.prepare(
      'INSERT INTO notes (id,text,color,sort_order,type,url,mime_type,filename) VALUES (@id,@text,@color,@sort_order,@type,@url,@mime_type,@filename)'
    )
    notes.forEach((n, i) => ins.run({
      id: n.id, text: n.text || '', color: n.color || null, sort_order: i,
      type: n.type || 'note', url: n.url || null, mime_type: n.mime_type || null, filename: n.filename || null,
    }))
  })()

  res.json({ ok: true })
})

// File upload
app.post('/api/notes/upload', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' })
  res.json({
    url: `/uploads/${req.file.filename}`,
    mime_type: req.file.mimetype,
    filename: req.file.originalname,
  })
})

// SPA fallback
app.use((_, res) => res.sendFile(join(__dirname, '../dist/index.html')))

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Server on http://localhost:${PORT}`))
