import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import discord from "../clientDiscord"

function Test() {
    const navigate = useNavigate()
    let auth

    useEffect(() => {
        (async () => {
            await discord.ready();
            document.getElementById('result')!.innerText = 'Discord SDK is ready'

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
            document.getElementById('result')!.innerText = 'Authorize DONE'

            try {
                const res = await fetch('/api/user/token', {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        code,
                    })
                })
                const { access_token } = await res.json()
                document.getElementById('result')!.innerText = 'POST token DONE'
    
                auth = await discord.commands.authenticate({
                    access_token,
                })
    
                document.getElementById('result')!.innerText = auth.user.global_name || auth.user.username//'Authenticate DONE'
            } catch (err) {
                let message = 'Unknown Error'
                if (err instanceof Error) message = err.message
                document.getElementById('result')!.innerText = message
            }
        })()
    }, [])

    return (
        <div>
            <h1>TITLE</h1>
            <div id="result">LOADING...</div>
        </div>
    )
}

export default Test
