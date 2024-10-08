import styled, { keyframes } from 'styled-components'

const LoadingRoot = styled.div`
    position: fixed;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999;
    width: 100%;
    height: 100%;
    overflow: visible;
    margin: auto;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    background: rgba(20, 20, 20, 0.8);
`

const Spin = keyframes`
    from {
        transform: rotate(0);
    }
    to {
        transform: rotate(360deg);
    }
`

const Spinner = styled.div`
    width: 50px;
    height: 50px;
    border: 3px solid #03fc4e;
    border-top: 3px solid transparent;
    border-radius: 50%;
    animation: ${Spin} 0.5s linear 0s infinite;
`

function Loading({ isLoading } : { isLoading: boolean }) {
    return (
        <>
            {isLoading ? (
                <LoadingRoot>
                    <Spinner />
                </LoadingRoot>
            ) : (
                <></>
            )}
        </>
    )
}

export default Loading
