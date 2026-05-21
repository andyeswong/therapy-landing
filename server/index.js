import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import express from 'express'

const __dirname = dirname(fileURLToPath(import.meta.url))
const APPTS_FILE = join(__dirname, '../src/data/appointments.json')
const NOTES_FILE = join(__dirname, '../src/data/notes.json')

const app = express()
app.use(express.json())

// Serve dist static files
app.use(express.static(join(__dirname, '../dist')))

// Appointments API
app.get('/api/appointments', (_, res) => {
  try {
    const data = JSON.parse(readFileSync(APPTS_FILE, 'utf-8'))
    res.json(data)
  } catch (e) {
    res.status(500).json({ error: 'Cannot read data' })
  }
})

app.post('/api/appointments', (req, res) => {
  try {
    writeFileSync(APPTS_FILE, JSON.stringify(req.body, null, 2), 'utf-8')
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: 'Cannot write data' })
  }
})

// Notes API
app.get('/api/notes', (_, res) => {
  try {
    const data = JSON.parse(readFileSync(NOTES_FILE, 'utf-8'))
    res.json(data)
  } catch (e) {
    res.json([])
  }
})

app.post('/api/notes', (req, res) => {
  try {
    writeFileSync(NOTES_FILE, JSON.stringify(req.body, null, 2), 'utf-8')
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: 'Cannot write notes' })
  }
})

// SPA fallback
app.use((_, res) => {
  res.sendFile(join(__dirname, '../dist/index.html'))
})

const PORT = 3000
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))
