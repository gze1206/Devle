import { Hono } from 'hono'
import dotenv from 'dotenv'
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

    if (access_token === 'mock_token') {
        discordUid = "MOCK_DISCORD_UID"
    } else {
        const res = await fetch(`${process.env.DISCORD_API_HOST}/users/@me`, {
            method: 'GET',
            headers: {
                "Authorization": `Bearer ${access_token}`,
                "Content-Type": "application/x-www-form-urlencoded" 
            }
        })
    
        const { id } = await res.json()
        discordUid = id
    }


    await prisma.$transaction(async tx => {
        const found = await tx.user.findFirst({
            where: { discordUid },
        })

        if (found) return found

        return await tx.user.create({
            data: {
                discordUid,
                isAdmin: false,
            }
        })
    })

    return c.json({})
})

export default api
