import './loading.css'

function Loading({ isLoading } : { isLoading: boolean }) {
    return (
        <>
            {isLoading ? (
                <div className="loading">
                    <div className="spinner"></div>
                </div>
            ) : (
                <></>
            )}
        </>
    )
}

export default Loading
