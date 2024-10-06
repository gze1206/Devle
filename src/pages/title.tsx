import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import useStore from "../store"
import Loading from "../components/loading"
import discord from "../clientDiscord"
import './title.css'

function Test() {
    const [isLoading, setLoading] = useState(false)
    const navigate = useNavigate()
    const { user } = useStore.user()
    const setUser = useStore.user(state => state.setUser)

    useEffect(() => {
        (async () => {
            let accessToken
            
            setLoading(true)
            await discord.ready()

            try {
                if (user) {
                    accessToken = user.accessToken
                } else {
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

                    await discord.commands.authenticate({
                        access_token: accessToken,
                    })
                    
                    accessToken = access_token
                }

                const res = await fetch('/api/user/auth', {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        access_token: accessToken,
                    })
                })

                if (!res.ok) {
                    throw new Error('AUTH FAILED')
                }

                const { sessionToken, nickname, profilePictureUrl } = await res.json()

                setUser({
                    sessionToken,
                    accessToken,
                    nickname,
                    profilePictureUrl,
                    guildId: discord.guildId
                })

                setLoading(false)
            } catch (err) {
                let message = 'Unknown Error'
                if (err instanceof Error) message = err.message
                document.getElementById('start')!.innerText = JSON.stringify(err)
            }
        })()
    }, [])

    return (
        <div id="main">
            <button id="start" onClick={() => navigate('/ingame')}>PLAY WITH DAILY WORD</button>
            <Loading isLoading={isLoading}/>
        </div>
    )
}

export default Test
