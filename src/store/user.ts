import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
    accessToken: string
    nickname: string
    profilePictureUrl: string | null
    guildId: string | null
}

interface UserState {
    user: User | null
    setUser: (user: User | null) => void
    clearUser: () => void
}

const useUserStore = create<UserState>()(
    persist(
        (set) => ({
            user: null,
            setUser: (user: User | null) => set({user}),
            clearUser: () => set({user: null})
        }),
        {
            name: 'user-storage',
        }
    )
)

export default useUserStore
