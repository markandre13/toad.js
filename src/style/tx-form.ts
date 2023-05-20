/* 
 * Form 
 * Available in two variants: labels on the side (wide/default) and labels on the top (narrow)
 */
import { css } from 'src/util/lsx'

export const styleBase = document.createElement("style")
styleBase.textContent = css`
:host {
    display: grid;
    background-color: var(--tx-gray-100);
    border-radius: var(--tx-border-radius);
    border: var(--tx-border-radius);
    margin: 4px;
    padding: 16px;
    row-gap: 6px;
}

::slotted(tx-formlabel) {
    grid-column: 1 / span 1;
    font-size: var(--tx-font-size-info);
    font-weight: bolder;
    text-align: right;
    padding-top: 4px;
    padding-right: 12px;
}

::slotted(tx-formfield) {
    grid-column: 2 / span 1;
    text-align: left;
}

::slotted(tx-formhelp) {
    display: flex;
    grid-column: 2 / span 1;
    font-size: var(--tx-font-size-info);
    color: var(--tx-gray-700);
    fill: var(--tx-gray-700);
}

::slotted(tx-formhelp.tx-error) {
    color: var(--tx-warning-color);
    fill: var(--tx-warning-color);
}

::slotted(tx-formhelp.tx-error)::before {
    content: url("data:image/svg+xml,%3Csvg viewBox='0 0 36 36' width='18' height='18' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='rgb(247,109,116)' d='M17.127 2.579L.4 32.512A1 1 0 001.272 34h33.456a1 1 0 00.872-1.488L18.873 2.579a1 1 0 00-1.746 0zM20 29.5a.5.5 0 01-.5.5h-3a.5.5 0 01-.5-.5v-3a.5.5 0 01.5-.5h3a.5.5 0 01.5.5zm0-6a.5.5 0 01-.5.5h-3a.5.5 0 01-.5-.5v-12a.5.5 0 01.5-.5h3a.5.5 0 01.5.5z' /%3E%3C/svg%3E");
    width: 18px;
    height: 18px;
    padding-bottom: 3px;
    margin: 0 8px 0 0;
}

::slotted(tx-formhelp) > svg {
    flex-shrink: 0;
    width: 18px;
    height: 18px;
    padding-bottom: 3px;
    margin: 0 8px 0 0;
}`

export const styleNarrow = document.createElement("style")
styleNarrow.textContent = css`
:host {
    padding-top: 8px;
    padding-bottom: 8px;
}

::slotted(tx-formfield) {
    grid-column: 1 / span 1;
}

::slotted(tx-formhelp) {
    grid-column: 1 / span 1;
}`
