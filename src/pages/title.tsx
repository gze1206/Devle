import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

function Test() {
    const navigate = useNavigate()

    useEffect(() => {
        (async () => {
            const res = await fetch('/api/user', {
                method: 'GET',
            })
    
            if (res.ok) {
                navigate('/ingame')
            } else {
                alert('ERROR')
            }
        })()
    }, [])

    return (
        <h1>TITLE</h1>
    )
}

export default Test
