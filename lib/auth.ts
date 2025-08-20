import { SignJWT, jwtVerify, JWTPayload } from 'jose'

const getSecretKey = (): Uint8Array => {
  const secret = process.env.ADMIN_SESSION_SECRET
  if (!secret) {
    throw new Error('ADMIN_SESSION_SECRET is required')
  }
  return new TextEncoder().encode(secret)
}

export type SessionPayload = JWTPayload & {
  username: string
  userId: string
}

export const createSessionToken = async (payload: SessionPayload): Promise<string> => {
  const token = await new SignJWT({ username: payload.username, userId: payload.userId })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(getSecretKey())
  return token
}

export const verifySessionToken = async (token: string): Promise<SessionPayload | null> => {
  try {
    const { payload } = await jwtVerify(token, getSecretKey())
    return payload as SessionPayload
  } catch {
    return null
  }
}


