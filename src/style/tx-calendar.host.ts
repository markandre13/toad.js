import { css } from 'src/util/lsx'

export const style = document.createElement("style")
style.textContent = css`
:host {
    display: inline-block;
    width: fit-content;
}

:host>div {
    display: flex;
    align-items: center;
    width: 100%;
}

:host>div>div {
    flex-grow: 1;
    order: 1;
    text-align: center;

    font-size: calc((18/16) * 1rem);
    font-weight: bold;
}

:host>div button {
    background: none;
    border: none;
    position: relative;
}

:host>div button>svg {
    width: 10px;
    height: 10px;
    fill: var(--tx-gray-900)
}

:host>div>div+button {
    order: 0;
    transform: rotate(180deg);
}

:host>div>div+button+button {
    order: 2;
}

:host td {
    text-align: center;
}

:host td span {
    display: inline-block;
    margin: 2px;
    width: 28px;
    height: 28px;
    text-align: center;
    line-height: 28px;
    border: 2px solid var(--tx-gray-100);
    border-radius: 100%;
    cursor: default;
    font-weight: bold;
}

:host td span:hover {
    background-color: var(--tx-gray-200);
    border-color: var(--tx-gray-200);
}

:host td span.tx-today {
    border-color: var(--tx-gray-900);
}

:host td span.tx-selected {
    background: #334961;
    border-color: #334961;
}`
