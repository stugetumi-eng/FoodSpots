import prisma from '../../../lib/prisma'
import bcrypt from 'bcrypt'
import { signToken } from '../../../lib/auth'

export default async function handler(req, res){
  if (req.method !== 'POST') return res.status(405).end()
  const { email, password, name } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' })
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' })
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return res.status(400).json({ error: 'Email already registered' })
  const hash = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({ data: { email, password: hash, name } })
  const token = signToken({ sub: user.id, role: user.role })
  const secure = process.env.NODE_ENV === 'production'
  res.setHeader('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=${7*24*60*60}; SameSite=Strict${secure ? '; Secure' : ''}`)
  return res.status(201).json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } })
}
