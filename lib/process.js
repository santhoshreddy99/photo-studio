const sharp = require('sharp')
const { createClient } = require('./r2')
const { Upload } = require('@aws-sdk/lib-storage')

async function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = []
    stream.on('data', (c) => chunks.push(c))
    stream.on('end', () => resolve(Buffer.concat(chunks)))
    stream.on('error', reject)
  })
}

async function processPhoto(photo) {
  // Download original from R2, create thumbnail + webp, upload variants, return variant keys
  const client = createClient()
  const getParams = { Bucket: process.env.R2_BUCKET, Key: photo.key }
  const { GetObjectCommand } = require('@aws-sdk/client-s3')
  const getCmd = new GetObjectCommand(getParams)
  const res = await client.send(getCmd)
  const body = await streamToBuffer(res.Body)

  // Generate thumbnail (e.g., 400px width) and webp (quality 80)
  const thumbBuf = await sharp(body).resize({ width: 400 }).jpeg({ quality: 75 }).toBuffer()
  const webpBuf = await sharp(body).webp({ quality: 80 }).toBuffer()

  // Upload variants
  const timestamp = Date.now().toString(36)
  const thumbKey = photo.key.replace(/^uploads\//, `variants/${timestamp}-thumb-`)
  const webpKey = photo.key.replace(/^uploads\//, `variants/${timestamp}-webp-`)

  const uploadThumb = new Upload({
    client,
    params: { Bucket: process.env.R2_BUCKET, Key: thumbKey, Body: thumbBuf, ContentType: 'image/jpeg' }
  }).done()

  const uploadWebp = new Upload({
    client,
    params: { Bucket: process.env.R2_BUCKET, Key: webpKey, Body: webpBuf, ContentType: 'image/webp' }
  }).done()

  await Promise.all([uploadThumb, uploadWebp])

  return { thumbKey, webpKey }
}

module.exports = { processPhoto }
