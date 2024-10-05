import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Loading from "../components/loading"
import discord from "../clientDiscord"
import './title.css'

function Test() {
    const [isLoading, setLoading] = useState(false)
    const navigate = useNavigate()
    let auth

    useEffect(() => {
        (async () => {
            setLoading(true)
            await discord.ready();

            const { code } = await discord.commands.authorize({
                client_id: import.meta.env.VITE_DISCORD_CLIENT_ID,
                response_type: 'code',
                state: '',
                prompt: 'none',
                scope: [
                    'identify',
                    'guilds',
                    'applications.commands'
                ],
            })

            try {
                let res = await fetch('/api/user/token', {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        code,
                    })
                })
                const { access_token } = await res.json()
    
                auth = await discord.commands.authenticate({
                    access_token,
                })

                res = await fetch('/api/user/auth', {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        access_token,
                    })
                })

                if (!res.ok) {
                    throw new Error('AUTH FAILED')
                }

                setLoading(false)
            } catch (err) {
                let message = 'Unknown Error'
                if (err instanceof Error) message = err.message
                alert(message)
            }
        })()
    }, [])

    return (
        <div id="main">
            <button id="start" onClick={() => navigate('/ingame')}>START</button>
            <Loading isLoading={isLoading}/>
        </div>
    )
}

export default Test
