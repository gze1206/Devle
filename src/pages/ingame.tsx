import useStore from "../store"
import styled from "styled-components"
import LetterBlock from "../components/letterBlock"
import Loading from "../components/loading"
import { useEffect, useState } from "react"

const Main = styled.div`
    padding-top: 2em;
`

const Box = styled.div`
    display: flex;
    justify-content: center;
`

interface Result {
    value: string
    type: string
}

function InGame() {
    const { user } = useStore.user()
    const [wordLength, setWordLength] = useState(0)
    const [tries, setTries] = useState(0)
    const [results, setResults] = useState<Result[][]>()
    const [currentTry, setCurrentTry] = useState(0)
    const [currentInput, setCurrentInput] = useState<string[]>([])
    const [hasCorrect, setHasCorrect] = useState(false)
    const [isLoading, setLoading] = useState(false)

    function getInput(index: number) : string {
        if (currentInput.length <= index) return '';
        return currentInput[index];
    }

    function renderCurrent() {
        const result = []
        const type = hasCorrect ? "next" : ""

        if (currentTry < tries) {
            for (let i = 0; i < wordLength; i++) {
                result.push((<LetterBlock key={i} type={type} value={getInput(i)}></LetterBlock>))
            }
        }

        return (
            <Box>{result}</Box>
        )
    }

    function renderPrevs() {
        if (results == null) return

        const prevs = []

        for (let i = 0; i < results.length; i++) {
            const result = results[i]
            const letters = []

            for (let j = 0; j < wordLength; j++) {
                letters.push((<LetterBlock key={j} type={result[j].type} value={result[j].value} />))
            }

            prevs.push((<Box key={i}>{letters}</Box>))
        }

        return prevs
    }

    function renderNexts() {
        const letters = []
        for (let i = 0; i < wordLength; i++) {
            letters.push((<LetterBlock key={i} type="next" value="" />))
        }

        const result = []
        for (let i = 0; i < (tries - currentTry - 1); i++) {
            result.push((<Box key={i}>{letters}</Box>))
        }

        return result
    }

    useEffect(() => {
        (async () => {
            setLoading(true)

            const res = await fetch('/api/game/start', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({

                })
            })

            if (!res.ok) {
                const { error } = await res.json()
                console.log(error)
                return
            }

            const gameInfo: { wordLength: number, maxTry: number, hasCorrect: boolean, currentTry: number, results: Result[][] } = await res.json()
            setHasCorrect(gameInfo.hasCorrect)
            setWordLength(gameInfo.wordLength)
            setTries(gameInfo.maxTry)
            setCurrentTry(gameInfo.currentTry)
            setResults(gameInfo.results)
            setLoading(false)
        })()
    }, [])

    useEffect(() => {
        if (isLoading || hasCorrect) return

        function handleKeyDown(e : KeyboardEvent) {
            if (e.key === "Backspace") {
                e.preventDefault()
            }
        }

        async function handleKeyUp(e : KeyboardEvent) {
            if (tries <= currentTry) return

            if (e.key === "Backspace") {
                if (0 < currentInput.length) {
                    setCurrentInput(old => old.slice(0, -1))
                }

                return
            }

            if (e.key === "Enter") {
                if (currentInput.length == wordLength) {
                    setLoading(true)
                    const input = [...currentInput]
                    const res = await fetch('/api/game/answer', {
                        method: 'POST',
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            answer: input.join('')
                        })
                    })

                    const { isCorrect, results: newResults } = await res.json()

                    if (isCorrect === true) setHasCorrect(true)
                    setResults(old => [...(old || []), newResults])
                    setCurrentTry(old => old + 1)
                    setCurrentInput([])
                    setLoading(false)
                }

                return
            }

            if (currentInput.length < wordLength && /^[a-zA-Z]$/.test(e.key)) {
                setCurrentInput(old => [...old, e.key.toUpperCase()])
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        document.addEventListener('keyup', handleKeyUp)

        return () => {
            document.removeEventListener('keydown', handleKeyDown)
            document.removeEventListener('keyup', handleKeyUp)
        }
    }, [isLoading, results, currentInput, wordLength])

    return (
        <Main>
            { renderPrevs() }
            { renderCurrent() }
            { renderNexts() }
            <Loading isLoading={isLoading} />
        </Main>
    )
}

export default InGame
