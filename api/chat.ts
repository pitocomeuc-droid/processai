import Anthropic from '@anthropic-ai/sdk'
import type { VercelRequest, VercelResponse } from '@vercel/node'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { system, messages } = req.body

  if (!messages?.length) return res.status(400).json({ error: 'messages required' })

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system,
      messages,
    })

    const content = response.content[0].type === 'text' ? response.content[0].text : ''
    res.json({ content })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'AI error' })
  }
}
