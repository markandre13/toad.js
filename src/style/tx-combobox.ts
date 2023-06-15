import { css } from 'src/util/lsx'

export const style = new CSSStyleSheet()
style.replaceSync(css`
:host(.tx-combobox) {
    display: inline-flex;
    align-items: flex-start;
    position: relative;
    vertical-align: top;
}
:host(.tx-combobox) > :first-child {
    box-sizing: border-box;
    width: 100%;
    height: 32px;
    line-height: 30px; /* center text vertically */
    overflow: hidden; /* children shall not overlap our border */
    margin: 0;
    padding: 0;
    vertical-align: top;
    text-align: left;
    outline: none;
    display: inline-block;
    border: 1px solid var(--tx-gray-400);
    border-radius: 4px;
    background-color: var(--tx-gray-50);
    
    color: var(--tx-gray-900);  
    font-weight: var(--tx-edit-font-weight);
    font-size: var(--tx-edit-font-size);
}
:host(.tx-combobox) > input:first-child {
    padding: 4px 32px 4px 11px;
}
:host(.tx-combobox) > :first-child > :first-child {
    padding-left: 7px;
}
:host(.tx-combobox) > :first-child::placeholder {
    color: var(--tx-placeholder-fg-color);
    font-style: italic;
    font-weight: 300;
}
:host(.tx-combobox) > button {
    position: absolute;
    right: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    border-style: none;
    box-sizing: border-box;
    overflow: visible;
    margin: 0;
    text-transform: none;

    width: 32px;
    height: 32px;
    background-color: var(--tx-gray-75);
    border-radius: 0 4px 4px 0;
    border: 1px solid var(--tx-gray-400);
}
:host(.tx-combobox) > button > svg {
    fill: var(--tx-gray-700);
    transform: rotate(90deg) translate(5px, 8px);
}

:host(.tx-combobox) > :first-child:hover {
    border-color: var(--tx-gray-500);
}
:host(.tx-combobox) > button:hover {
    border-color: var(--tx-gray-500);
    background-color: var(--tx-gray-50);
}
:host(.tx-combobox) > button:hover > svg {
    fill: var(--tx-gray-900);
}

:host(.tx-combobox) > :first-child:focus {
    border-color: var(--tx-outline-color);
}
:host(.tx-combobox) > :first-child:focus + button {
    border-color: var(--tx-outline-color);
}
/* spectrum use a 1px focus ring when the focus was set by mouse
 * and a 2px focus ring when the focus was set by keyboard
 * no clue how to do that with css
 *
/* :host(.tx-combobox) > input:focus-visible {
    outline: 1px solid var(--tx-outline-color);
}
:host(.tx-combobox) > input:focus-visible + button {
    outline: 1px solid var(--tx-outline-color);
    border-left: none;
} */

:host(.tx-combobox) > :first-child:disabled {
    color: var(--tx-gray-700);
    background-color: var(--tx-gray-200);
    border-color: var(--tx-gray-200);
}
:host(.tx-combobox) > :first-child:disabled + button {
    background-color: var(--tx-gray-200);
    border-color: var(--tx-gray-200);
}
:host(.tx-combobox) > :first-child:disabled + button > svg {
    fill: var(--tx-gray-400);
}
:host(.tx-combobox) > :first-child.tx-error {
    color: var(--tx-warning-color);
    border-color: var(--tx-warning-color)
}
:host(.tx-combobox) > :first-child.tx-error + button {
    border-color: var(--tx-warning-color)
}
`)