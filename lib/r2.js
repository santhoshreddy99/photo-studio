const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3')
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')

const R2_REGION = 'auto' // not used but required by client

function createClient() {
  const endpoint = process.env.R2_ENDPOINT
  if (!process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY || !endpoint || !process.env.R2_BUCKET) {
    throw new Error('Missing R2 config in env: R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_ENDPOINT, R2_BUCKET')
  }

  const client = new S3Client({
    region: R2_REGION,
    endpoint,
    forcePathStyle: false,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY
    }
  })
  return client
}

async function presignUpload({ key, contentType, expiresIn = 3600 }) {
  const client = createClient()
  const cmd = new PutObjectCommand({ Bucket: process.env.R2_BUCKET, Key: key, ContentType: contentType })
  const url = await getSignedUrl(client, cmd, { expiresIn })
  return url
}

async function presignGet({ key, expiresIn = 300 }) {
  const client = createClient()
  const cmd = new GetObjectCommand({ Bucket: process.env.R2_BUCKET, Key: key })
  const url = await getSignedUrl(client, cmd, { expiresIn })
  return url
}

module.exports = { presignUpload, presignGet, createClient }
