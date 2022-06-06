import { css } from 'src/util/lsx'

export const style = document.createElement("style")
style.textContent = css`
.tx-calendar {
    display: inline-block;
    width: fit-content;
}

.tx-calendar>div {
    display: flex;
    align-items: center;
    width: 100%;
}

.tx-calendar>div>div {
    flex-grow: 1;
    order: 1;
    text-align: center;

    font-size: calc((18/16) * 1rem);
    font-weight: bold;
}

.tx-calendar>div button {
    background: none;
    border: none;
    position: relative;
}

.tx-calendar>div button>svg {
    width: 10px;
    height: 10px;
    fill: var(--tx-gray-900)
}

.tx-calendar>div>div+button {
    order: 0;
    transform: rotate(180deg);
}

.tx-calendar>div>div+button+button {
    order: 2;
}

.tx-calendar td {
    text-align: center;
}

.tx-calendar td span {
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

.tx-calendar td span:hover {
    background-color: var(--tx-gray-200);
    border-color: var(--tx-gray-200);
}

.tx-calendar td span.tx-today {
    border-color: var(--tx-gray-900);
}

.tx-calendar td span.tx-selected {
    background: #334961;
    border-color: #334961;
}`