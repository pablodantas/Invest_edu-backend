import fs from 'node:fs/promises'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import sharp from 'sharp'
import { env } from '../env/index.js'

const ACCEPTED = ['image/jpeg', 'image/png']

export async function ensureDir(p: string) {
  await fs.mkdir(p, { recursive: true })
}

export async function saveCompressedImage(
  opts: { buffer: Buffer; mime: string; folder: 'usuarios' | 'assinaturas' }
): Promise<{ fileKey: string; absolutePath: string }> {
  if (!ACCEPTED.includes(opts.mime)) {
    throw new Error('Formato inválido. Aceito: .jpg ou .png')
  }

  const baseDir = path.resolve(env.UPLOAD_DIR, opts.folder)
  await ensureDir(baseDir)

  const id = randomUUID()
  const ext = opts.mime === 'image/png' ? 'png' : 'jpg'
  const fileKey = `${opts.folder}/${id}.${ext}`
  const outPath = path.join(baseDir, `${id}.${ext}`)

  let pipeline = sharp(opts.buffer, { failOn: 'none' })
  if (ext === 'jpg') pipeline = pipeline.jpeg({ quality: 80 })
  else pipeline = pipeline.png({ compressionLevel: 9 })

  let output = await pipeline.toBuffer()

  const limitBytes = env.UPLOAD_MAX_MB * 1024 * 1024
  if (output.byteLength > limitBytes) {
    const factor = Math.max(0.5, Math.min(0.9, limitBytes / output.byteLength))
    const meta = await sharp(output).metadata()
    const width = meta.width ? Math.floor(meta.width * factor) : undefined

    let p2 = sharp(output).resize(width)
    output = ext === 'jpg' ? await p2.jpeg({ quality: 65 }).toBuffer() : await p2.png({ compressionLevel: 9 }).toBuffer()
  }

  await fs.writeFile(outPath, output)
  return { fileKey, absolutePath: outPath }
}
