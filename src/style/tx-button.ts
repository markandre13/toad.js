import { css } from 'src/util/lsx'

export const style = document.createElement("style")
style.textContent = css`
.tx-button {
    padding: 2px 14px 2px 14px;
    margin: 0;
    color: var(--tx-gray-800);
    transition: background-color 130ms ease-in-out;
    background-color: var(--tx-gray-300);
    border: 0 none;
    height: 28px;
    border-radius: 16px;
    box-shadow: none;
}

:host(.tx-default) > .tx-button {
    color: var(--tx-gray-50);
    background-color: var(--tx-gray-800);
}

/* accent */

:host(.tx-accent) > .tx-button {
    color: var(--tx-static-white);
    background-color: var(--tx-static-blue-600);
}

:host(.tx-accent) > .tx-button:hover, :host(.tx-accent) > .tx-button:active {
    color: var(--tx-static-white);
    background-color: var(--tx-static-blue-700);
}
:host(.tx-accent) > .tx-button:hover:active {
    color: var(--tx-static-white);
    background-color: var(--tx-static-blue-500);
}

/* negative */

:host(.tx-negative) > .tx-button {
    color: var(--tx-static-white);
    background-color: var(--tx-static-red-600);
}
:host(.tx-negative) > :hover, :host(.tx-negative) > :active {
    color: var(--tx-static-white);
    background-color: var(--tx-static-red-700);
}
:host(.tx-negative) > :hover:active {
    color: var(--tx-static-white);
    background-color: var(--tx-static-red-500);
}

.tx-button:hover, .tx-button:active {
    color: var(--tx-gray-900);
    background-color: var(--tx-gray-400);
}
:host(.tx-default) > .tx-button:hover, :host(.tx-default) > .tx-button:hover:active {
    color: var(--tx-gray-50);
    background-color: var(--tx-gray-900);
}

.tx-button:hover:active {
    color: var(--tx-gray-900);
    background-color: var(--tx-gray-500);
}

.tx-button:hover:active > span {
    transition: transform 130ms ease-in-out;
    transform: translate(1px, 1px);
}

:host(.tx-default) > .tx-button:active {
    color: var(--tx-gray-50);
    background-color: var(--tx-gray-900);
}

.tx-label {
    font-weight: bold;
    padding: 4px 0 6px 0;
    /* override parent flex/grid's align-items property to align in the center */
    align-self: center;
    /* adjust sides in container to look centered...? */
    justify-self: center;
    /* align children in the center */
    text-align: center;
}
`
