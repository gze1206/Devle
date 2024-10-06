import { Context } from "hono";
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

dotenv.config()

async function Auth(c: Context, next: () => Promise<void>) {
    const token = c.req.header('Authorization')

    if (!token) return c.json({ error: 'Unauthorized' }, 401)

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
            sessionId: number,
            userId: number,
        }

        const session = await prisma.session.findUnique({
            where: { id: decoded.sessionId },
            include: {
                user: true,
            }
        })

        if (!session || session.token !== token || session.expiredAt <= new Date() || !session.user || session.user.id !== decoded.userId) {
            return c.json({ error: 'Unauthorized' }, 401)
        }

        c.set('sessionId', session.id)
        c.set('user', session.user)
        c.set('gameId', session.gameId)

        await next()
    } catch (error) {
        console.error('Error on JWT Verification : ', error)
        return c.json({ error: 'Unauthorized' }, 401)
    }
}

export default Auth
