import { Hono } from 'hono'
import dotenv from 'dotenv'

dotenv.config()

const api = new Hono()

api.get('/user', async (c) => {
    return c.json({
        id: 'TEST',
    })
})

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

export default api
