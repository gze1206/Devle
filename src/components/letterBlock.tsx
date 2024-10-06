import styled from "styled-components"

const LetterInput = styled.label`
    width: 55px;
    height: 55px;
    border-radius: 10px;
    margin: 2px;
    border: 2px solid gray;
    font-size: 50px;
    color: white;
    text-transform: uppercase;
    caret-color: transparent;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    -webkit-user-select:none;
    -moz-user-select:none;
    -ms-user-select:none;
    user-select:none;

    &.next {
        border: 1px solid rgba(50, 50, 50, 0.8);
    }

    &.strike {
        border: none;
        background-color: #508f49;
    }

    &.ball {
        border: none;
        background-color: #a89738;
    }

    &.out {
        border: none;
        background-color: rgb(100, 100, 100);
    }
`

function LetterBlock({ type, value }: { type: string, value: string }) {
    return (
        <LetterInput className={type}>{value}</LetterInput>
    )
}

export default LetterBlock
