import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import pg from 'pg'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '..', '.env') })

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  console.error('Missing DATABASE_URL in .env')
  process.exit(1)
}

const ssl =
  process.env.DATABASE_SSL === 'false'
    ? false
    : /railway|rlwy|sslmode=require/i.test(DATABASE_URL)
      ? { rejectUnauthorized: false }
      : undefined

const pool = new pg.Pool({ connectionString: DATABASE_URL, ssl })

const SAMPLE_TAGS = [
  { label: 'Fintech', kind: 'category' },
  { label: 'React', kind: 'tech', tint: 'aqua' },
  { label: 'Landing-Page', kind: 'category' },
  { label: 'Minimalist', kind: 'category' },
  { label: 'Javascript', kind: 'tech', tint: 'yellow' },
  { label: 'Node.js', kind: 'tech', tint: 'green' },
]

function rowToProject(row) {
  return {
    id: row.id,
    title: row.title,
    tags: row.tags,
    bannerSrc: row.banner_src,
    deployedUrl: row.deployed_url,
    ownerPhotoURL: row.owner_photo_url || '',
    ownerUid: row.owner_uid || '',
    likes: row.likes,
    likedByUser: row.liked_by_user,
    savedByUser: row.saved_by_user,
    createdAt:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : row.created_at
          ? new Date(row.created_at).toISOString()
          : null,
  }
}

/** Match Spring {@code DeployUrlNormalizer} / React {@code normalizeDeployedUrl} + {@code || '#'}. */
function normalizeDeployedUrlForStorage(raw) {
  if (raw == null || typeof raw !== 'string') return '#'
  const t = raw.trim()
  if (!t || t === '#') return '#'
  try {
    if (/^https?:\/\//i.test(t)) return new URL(t).href
    return new URL(`https://${t}`).href
  } catch {
    return t
  }
}

function isPlaceholderDeployUrl(u) {
  const t = (u ?? '').trim()
  return !t || t === '#'
}

async function ensureSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      tags JSONB NOT NULL DEFAULT '[]'::jsonb,
      banner_src TEXT NOT NULL,
      deployed_url TEXT NOT NULL DEFAULT '#',
      owner_photo_url TEXT NOT NULL DEFAULT '',
      likes INTEGER NOT NULL DEFAULT 0,
      liked_by_user BOOLEAN NOT NULL DEFAULT FALSE,
      saved_by_user BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `)

  await pool.query(`
    ALTER TABLE projects ADD COLUMN IF NOT EXISTS owner_uid TEXT NOT NULL DEFAULT '';
  `)

  await pool.query(
    `
    INSERT INTO projects (id, title, tags, banner_src, deployed_url, owner_photo_url, owner_uid, likes, liked_by_user, saved_by_user)
    VALUES ($1, $2, $3::jsonb, $4, $5, $6, $7, $8, $9, $10)
    ON CONFLICT (id) DO NOTHING
    `,
    [
      'sample-bardimin',
      'Bardimin Smart Lamp Web/UX Revamp',
      JSON.stringify(SAMPLE_TAGS),
      '/figma/card-91-1198/preview.png',
      '#',
      '/figma/card-91-1198/avatar.png',
      '',
      12,
      false,
      false,
    ],
  )
}

const app = express()
const PORT = Number(process.env.API_PORT) || 3001

app.use(cors({ origin: true }))
app.use(express.json({ limit: '15mb' }))

app.get('/api/projects', async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, title, tags, banner_src, deployed_url, owner_photo_url, owner_uid, likes, liked_by_user, saved_by_user, created_at
       FROM projects
       ORDER BY created_at DESC`,
    )
    res.json(rows.map(rowToProject))
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to load projects' })
  }
})

app.get('/api/projects/deploy-url-exists', async (req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate')
    res.setHeader('Pragma', 'no-cache')
    const raw = typeof req.query.url === 'string' ? req.query.url : ''
    const normalized = normalizeDeployedUrlForStorage(raw || '#')
    if (isPlaceholderDeployUrl(normalized)) {
      return res.json({ exists: false })
    }
    const { rows: candidates } = await pool.query(
      `SELECT deployed_url FROM projects
       WHERE deployed_url IS NOT NULL
         AND deployed_url <> $1
         AND trim(deployed_url) <> $2`,
      ['#', ''],
    )
    for (const row of candidates) {
      if (normalizeDeployedUrlForStorage(row.deployed_url) === normalized) {
        return res.json({ exists: true })
      }
    }
    res.json({ exists: false })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to check deploy URL' })
  }
})

app.post('/api/projects', async (req, res) => {
  try {
    const body = req.body || {}
    const id = typeof body.id === 'string' ? body.id : null
    const title = typeof body.title === 'string' ? body.title.trim() : ''
    const tags = Array.isArray(body.tags) ? body.tags : []
    const bannerSrc = typeof body.bannerSrc === 'string' ? body.bannerSrc : ''
    const deployedStored = normalizeDeployedUrlForStorage(
      typeof body.deployedUrl === 'string' ? body.deployedUrl : '#',
    )
    const ownerPhotoURL =
      typeof body.ownerPhotoURL === 'string' ? body.ownerPhotoURL : ''
    const ownerUid =
      typeof body.ownerUid === 'string' ? body.ownerUid.trim() : ''
    const likes = Number.isFinite(body.likes) ? Math.max(0, body.likes) : 0
    const likedByUser = Boolean(body.likedByUser)
    const savedByUser = Boolean(body.savedByUser)

    if (!id || !title || !bannerSrc) {
      return res.status(400).json({ error: 'id, title, and bannerSrc are required' })
    }

    if (!isPlaceholderDeployUrl(deployedStored)) {
      const { rows: candidates } = await pool.query(
        `SELECT deployed_url FROM projects
         WHERE deployed_url IS NOT NULL
           AND deployed_url <> $1
           AND trim(deployed_url) <> $2`,
        ['#', ''],
      )
      for (const row of candidates) {
        if (
          normalizeDeployedUrlForStorage(row.deployed_url) === deployedStored
        ) {
          return res.status(409).json({ error: 'This project already exists' })
        }
      }
    }

    const { rows } = await pool.query(
      `INSERT INTO projects (id, title, tags, banner_src, deployed_url, owner_photo_url, owner_uid, likes, liked_by_user, saved_by_user)
       VALUES ($1, $2, $3::jsonb, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, title, tags, banner_src, deployed_url, owner_photo_url, owner_uid, likes, liked_by_user, saved_by_user, created_at`,
      [
        id,
        title,
        JSON.stringify(tags),
        bannerSrc,
        deployedStored,
        ownerPhotoURL,
        ownerUid,
        likes,
        likedByUser,
        savedByUser,
      ],
    )
    res.status(201).json(rowToProject(rows[0]))
  } catch (e) {
    console.error(e)
    if (e.code === '23505') {
      return res.status(409).json({ error: 'Project id already exists' })
    }
    res.status(500).json({ error: 'Failed to save project' })
  }
})

app.patch('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params
    const body = req.body || {}
    const sets = []
    const vals = []
    let n = 1

    if ('likes' in body && Number.isFinite(body.likes)) {
      sets.push(`likes = $${n++}`)
      vals.push(Math.max(0, body.likes))
    }
    if ('likedByUser' in body) {
      sets.push(`liked_by_user = $${n++}`)
      vals.push(Boolean(body.likedByUser))
    }
    if ('savedByUser' in body) {
      sets.push(`saved_by_user = $${n++}`)
      vals.push(Boolean(body.savedByUser))
    }

    if (sets.length === 0) {
      return res.status(400).json({ error: 'No updatable fields' })
    }

    vals.push(id)
    const { rows } = await pool.query(
      `UPDATE projects SET ${sets.join(', ')}
       WHERE id = $${n}
       RETURNING id, title, tags, banner_src, deployed_url, owner_photo_url, owner_uid, likes, liked_by_user, saved_by_user, created_at`,
      vals,
    )
    if (!rows[0]) {
      return res.status(404).json({ error: 'Project not found' })
    }
    res.json(rowToProject(rows[0]))
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to update project' })
  }
})

await ensureSchema()
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`)
})
