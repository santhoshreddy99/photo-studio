const { Worker } = require('bullmq')
const { processPhoto } = require('../lib/process')
const fs = require('fs/promises')
const path = require('path')

const PHOTOS_FILE = path.join(process.cwd(), 'data', 'photos.json')

const connection = process.env.REDIS_URL ? { connection: process.env.REDIS_URL } : { connection: { host: '127.0.0.1', port: 6379 } }

const worker = new Worker('photo-processing', async (job) => {
  if (job.name !== 'process-photo') return
  const { photo } = job.data
  console.log('Worker processing photo', photo.id)
  try {
    const variants = await processPhoto(photo)

    // update photos.json with variants
    let photos = []
    try {
      const content = await fs.readFile(PHOTOS_FILE, 'utf8')
      photos = JSON.parse(content || '[]')
    } catch (e) {
      photos = []
    }

    const idx = photos.findIndex((p) => p.id === photo.id)
    if (idx !== -1) {
      photos[idx].variants = variants
      photos[idx].processedAt = new Date().toISOString()
    }

    await fs.mkdir(path.dirname(PHOTOS_FILE), { recursive: true })
    await fs.writeFile(PHOTOS_FILE, JSON.stringify(photos, null, 2))

    console.log('Processed photo', photo.id)
  } catch (err) {
    console.error('Worker failed processing', photo.id, err)
    throw err
  }
}, connection)

worker.on('failed', (job, err) => {
  console.error('Job failed', job.id, err)
})

worker.on('completed', (job) => {
  console.log('Job completed', job.id)
})

console.log('Worker started (photo-processing)')
