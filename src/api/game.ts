import { Hono } from "hono"
import dotenv from 'dotenv'
import { Prisma, PrismaClient, User } from "@prisma/client"
import AuthMiddleware from '../middlewares/auth'

dotenv.config()

type GameMode = 'daily' | null
type ResultType = 'strike' | 'ball' | 'out'

interface AnswerReq {
    mode: GameMode
    answer: string
}

interface ApiVariables {
    sessionId: number
    user: User
    gameId: number | null
}

const api = new Hono<{ Variables: ApiVariables }>()
const prisma = new PrismaClient()

async function getDailyGame(transaction: Prisma.TransactionClient | null = null) {
    const now = new Date()
    const utcToday = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())

    async function process(tx: Prisma.TransactionClient) {
        const found = await tx.todayWord.findFirst({
            where: {
                date: utcToday,
            },
            include: {
                word: true,
            }
        })

        if (found) return found

        const count = await tx.word.count({
            where: {
                isDevKeyword: true,
            },
        })

        if (count == 0) return null

        const randomIdx = Math.floor(Math.random() * count)

        const answer = await tx.word.findFirst({
            where: {
                isDevKeyword: true,
            },
            skip: randomIdx,
        })

        if (!answer) return null

        return await tx.todayWord.create({
            data: {
                wordId: answer.id,
                date: utcToday,
            },
            include: {
                word: true,
            }
        })
    }

    if (transaction) {
        return process(transaction)
    } else {
        return await prisma.$transaction(async tx => await process(tx))
    }
}

api.post('/game/start', AuthMiddleware, async (c) => {
    const sessionId = c.get('sessionId')
    const user = c.get('user')
    let { mode }: { mode: GameMode } = await c.req.json()
    mode ??= 'daily'

    console.log('[/game/start] BEGIN', sessionId, user.id, mode)

    if (mode === 'daily') {
        try {
            const { dailyGame, answers } = await prisma.$transaction(async tx => {
                const dailyGame = await getDailyGame(tx)
    
                if (dailyGame == null) return { dailyGame }
    
                await prisma.session.update({
                    where: {
                        id: sessionId
                    },
                    data: {
                        gameId: dailyGame.id,
                    }
                })
    
                const answers = await tx.todayWordAnswer.findMany({
                    where: {
                        gameId: dailyGame.id,
                        userId: user.id,
                    }
                })
    
                return {
                    dailyGame,
                    answers,
                }
            })
    
            if (dailyGame == null) {
                console.error('[/game/start] FAILED - word db is empty', sessionId, user.id, mode)
                return c.json({ error: 'Word DB is empty '}, 404)
            }
    
            let currentTry = 0
            let hasCorrect = false
            let results: any[] = []
    
            if (answers) {
                answers.forEach(answer => {
                    if (currentTry < answer.try) currentTry = answer.try
                    if (dailyGame.word.name === answer.answer) hasCorrect = true
                    results.push(JSON.parse(answer.results))
                });
            }
    
            console.log('[/game/start] DONE', sessionId, user.id, mode, currentTry)
            return c.json({
                wordLength: dailyGame.word.length,
                maxTry: parseInt(process.env.DAILY_MAX_TRY!),
                hasCorrect,
                currentTry,
                results,
            })
        } catch (error) {
            console.error('[/game/start] ERROR', sessionId, user.id, mode, JSON.stringify(error))
            return c.json({ error }, 500)
        }
    }

    console.log('[/game/start] FAILED - unknown game mode', sessionId, user.id, mode)
    
    return c.json({ error: 'Unknown game mode' }, 400)
})

api.post('/game/answer', AuthMiddleware, async (c) => {
    const user = c.get('user')
    let { mode, answer }: AnswerReq = await c.req.json()
    mode ??= 'daily'
    answer = answer.toUpperCase()

    console.log('[/game/answer] BEGIN', user.id, mode, answer)

    if (mode === 'daily') {
        try {
                const dailyGame = await getDailyGame()
        
                if (dailyGame == null) {
                    return c.json({ error: 'Word DB is empty '}, 404)
                }
        
                const dailyWord = dailyGame.word
        
                if (answer.length !== dailyWord.length) {
                    return c.json({ error: 'Invalid answer' }, 400)
                }
        
                const correctAnswer = dailyWord.name.toUpperCase()
                const isCorrect = correctAnswer === answer
                const results: { value: string, type: ResultType }[] = []
                let remainLetters = correctAnswer
        
                for (let i = 0; i < dailyWord.length; i++) {
                    if (correctAnswer[i] === answer[i]) {
                        remainLetters = remainLetters.replace(answer[i], '')
                        results.push({ value: answer[i], type: 'strike' })
                    } else {
                        results.push({ value: answer[i], type: 'out' })
                    }
                }
        
                for (let i = 0; i < dailyWord.length; i++) {
                    if (correctAnswer[i] === answer[i] || !remainLetters.includes(answer[i])) continue
        
                    remainLetters = remainLetters.replace(answer[i], '')
                    results[i].type = 'ball'
                }
        
                return await prisma.$transaction(async tx => {
                    const prev = await tx.todayWordAnswer.findFirst({
                        where: {
                            userId: user.id,
                            gameId: dailyGame.id,
                        },
                        orderBy: [
                            { try: 'desc' },
                        ]
                    })
        
                    const currentTry = (prev?.try || 0) + 1
        
                    if (prev?.answer === correctAnswer || parseInt(process.env.DAILY_MAX_TRY!) < currentTry) {
                        console.error('[/game/answer] FAILED - over try', user.id, mode, answer)
                        return c.json({ error: 'over try' }, 400)
                    }
        
                    await tx.todayWordAnswer.create({
                        data: {
                            userId: user.id,
                            gameId: dailyGame.id,
                            answer,
                            try: currentTry,
                            results: JSON.stringify(results),
                        }
                    })
        
                    console.log('[/game/answer] DONE', user.id, mode, answer)
        
                    return c.json({ isCorrect, results })
                })
        } catch (error) {
            console.error('[/game/answer] ERROR', user.id, mode, answer, JSON.stringify(error))
            return c.json({ error }, 500)
        }
    }

    console.error('[/game/answer] FAILED - unknown game mode', user.id, mode, answer)
    return c.json({ error: 'Unknown game mode' }, 400)
})

export default api
