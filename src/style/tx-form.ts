/* 
 * Form 
 * Available in two variants: labels on the side (wide/default) and labels on the top (narrow)
 */
import { css } from 'src/util/lsx'
import errorIcon from "./tx-form.svg"

export const styleBase = new CSSStyleSheet()
styleBase.replaceSync(css`
:host {
    display: grid;
    background-color: var(--tx-gray-100);
    border-radius: var(--tx-border-radius);
    border: var(--tx-border-radius);
    margin: 4px;
    padding: 16px;
    row-gap: 6px;
}
::slotted(h1), ::slotted(h2), ::slotted(h3), ::slotted(h4), ::slotted(h5), ::slotted(h6) {
    grid-column: 1 / span 2;
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
    content: url("${errorIcon}");
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
}`)

export const styleNarrow = new CSSStyleSheet()
styleNarrow.replaceSync(css`
:host {
    padding-top: 8px;
    padding-bottom: 8px;
}

::slotted(tx-formlabel) {
    text-align: left;
}

::slotted(tx-formfield) {
    grid-column: 1 / span 1;
}

::slotted(tx-formhelp) {
    grid-column: 1 / span 1;
}`)
