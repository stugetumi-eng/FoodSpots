import prisma from '../../../lib/prisma'
import { authenticateUser, signToken } from '../../../lib/auth'

export default async function handler(req, res){
  if (req.method !== 'POST') return res.status(405).end()
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' })
  const user = await authenticateUser(email, password)
  if (!user) return res.status(401).json({ error: 'Invalid credentials' })
  const token = signToken({ sub: user.id, role: user.role })
  const secure = process.env.NODE_ENV === 'production'
  res.setHeader('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=${7*24*60*60}; SameSite=Strict${secure ? '; Secure' : ''}`)
  return res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } })
}
