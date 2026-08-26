const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const prisma = require('./prisma')

const JWT_SECRET = process.env.AUTH_JWT_SECRET || 'changeme_replace_in_production'
const TOKEN_EXPIRES_IN = '7d'

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRES_IN })
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (e) {
    return null
  }
}

async function authenticateUser(email, password) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return null
  const ok = await bcrypt.compare(password, user.password)
  if (!ok) return null
  return user
}

async function getUserFromReq(req) {
  const token = req.cookies?.token || (req.headers?.authorization ? req.headers.authorization.split(' ')[1] : null)
  if (!token) return null
  const payload = verifyToken(token)
  if (!payload) return null
  const user = await prisma.user.findUnique({ where: { id: payload.sub } })
  return user
}

async function requireRole(req, roles = []) {
  const user = await getUserFromReq(req)
  if (!user) return null
  if (!Array.isArray(roles)) roles = [roles]
  if (roles.length === 0) return user
  if (roles.includes(user.role)) return user
  return null
}

module.exports = { signToken, verifyToken, authenticateUser, getUserFromReq, requireRole }
