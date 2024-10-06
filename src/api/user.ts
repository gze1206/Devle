import { Hono } from 'hono'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

dotenv.config()

const api = new Hono()
const prisma = new PrismaClient()

api.post('/user/token', async (c) => {
    const { code } = await c.req.json()

    if (code === 'mock_code') {
        return c.json({ access_token: 'mock_token' })
    }

    const res = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            client_id: process.env.VITE_DISCORD_CLIENT_ID,
            client_secret: process.env.DISCORD_CLIENT_SECRET,
            grant_type: 'authorization_code',
            code: code,
        } as Record<string, string>),
    })

    const { access_token } = await res.json()

    return c.json({ access_token })
})

api.post('/user/auth', async (c) => {
    const { access_token } = await c.req.json()

    let discordUid : string
    let nickname : string
    let profilePictureUrl : string | null

    if (access_token === 'mock_token') {
        discordUid = "MOCK_DISCORD_UID"
        nickname = "MOCK_NAME"
        profilePictureUrl = null
    } else {
        const res = await fetch(`${process.env.DISCORD_API_HOST}/users/@me`, {
            method: 'GET',
            headers: {
                "Authorization": `Bearer ${access_token}`,
                "Content-Type": "application/x-www-form-urlencoded" 
            }
        })
    
        const { id, username, global_name, avatar } = await res.json()
        discordUid = id
        nickname = global_name || username
        profilePictureUrl = avatar ? `https://cdn.discordapp.com/avatars/${id}/${avatar}.jpg` : null
    }


    const token = await prisma.$transaction(async tx => {
        let user = await tx.user.findFirst({
            where: { discordUid },
        })

        if (!user) {
            user = await tx.user.create({
                data: {
                    discordUid,
                    isAdmin: false,
                }
            })
        }

        const expiredAt = Date.now() + 1000 * 60 * 60 * 24

        const session = await tx.session.create({
            data: {
                userId: user.id,
                token: '',
                expiredAt: new Date(expiredAt),
            },
        })

        const token = jwt.sign(
            { sessionId: session.id, userId: user.id },
            process.env.JWT_SECRET!,
            { expiresIn: '24h' }
        )

        await tx.session.update({
            where: { id: session.id },
            data: { token },
        })

        return token
    })

    return c.json({
        sessionToken: token,
        nickname,
        profilePictureUrl,
    })
})

export default api
