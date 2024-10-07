import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"
import useStore from "../store"
import Loading from "../components/loading"
import discord from "../clientDiscord"

const TitleMain = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
`

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
    
                    const res = await fetch('/api/user/token', {
                        method: 'POST',
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            code,
                        })
                    })

                    if (!res.ok) {
                        console.error('FAILED TO TOKEN API', code, await res.json())
                        return;
                    }

                    const { access_token } = await res.json()
                    
                    const auth = await discord.commands.authenticate({
                        access_token,
                    })

                    if (auth) {
                        console.log(`Hello, ${auth.user.username}!`)
                    } else {
                        console.error('FAILED TO AUTH', access_token)
                        return
                    }

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
                    console.error('FAILED TO AUTH API', accessToken, await res.json())
                    return;
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
                console.error(message, JSON.stringify(err))
            }
        })()
    }, [])

    return (
        <TitleMain>
            <button id="start" onClick={() => navigate('/ingame')}>PLAY WITH DAILY WORD</button>
            <Loading isLoading={isLoading}/>
        </TitleMain>
    )
}

export default Test
