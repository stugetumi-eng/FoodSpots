import { verifyToken } from '../../../lib/auth'
import prisma from '../../../lib/prisma'

export default async function handler(req, res) {
  const token = req.cookies?.token || (req.headers?.authorization ? req.headers.authorization.split(' ')[1] : null)
  const payload = verifyToken(token)
  if (!payload) return res.status(401).json({ error: 'Unauthorized' })
  const userId = payload.sub
  if (req.method === 'GET') {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true, name: true, avatar: true, role: true } })
    return res.json({ user })
  }
  if (req.method === 'PUT') {
    const { name, avatar } = req.body
    const user = await prisma.user.update({ where: { id: userId }, data: { name, avatar } })
    return res.json({ user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar, role: user.role } })
  }
  res.status(405).end()
}
