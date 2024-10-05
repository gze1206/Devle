import useStore from "../store"

function InGame() {
    const { user } = useStore.user()

    return (
        <h1>IN GAME, {user?.nickname}</h1>
    )
}

export default InGame
