const { Queue } = require('bullmq')

const connection = process.env.REDIS_URL ? { connection: process.env.REDIS_URL } : { connection: { host: '127.0.0.1', port: 6379 } }

const q = new Queue('photo-processing', connection)

async function addProcessJob(photo) {
  // keep job id stable using photo.id
  await q.add('process-photo', { photo }, { removeOnComplete: true, removeOnFail: false, jobId: `photo-${photo.id}` })
}

module.exports = { addProcessJob, queue: q }
