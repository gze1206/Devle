import { Hono } from 'hono'

const api = new Hono()

api.get('/user', async (c) => {
    return c.json({
        id: 'TEST',
    })
})

export default api
