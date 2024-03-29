import { css } from 'src/util/lsx'

export const style = new CSSStyleSheet()
style.replaceSync(css`
.tx-helptext {
    display: flex;
    margin: 0;
    padding: 0;
    border: 0 none;
    color: var(--tx-fg-color);
    fill: var(--tx-fg-color);
}

.tx-helptext>svg {
    flex-shrink: 0;
    width: 18px;
    height: 18px;
    padding: 3px 0 3px 0;
    margin: 0 8px 0 0;
}

.tx-helptext>div {
    font-weight: 400;
    font-size: var(--tx-font-size-info);
    padding: 4px 0 5px 0;
    margin: 0 8px 0 0;
}

.tx-helptext.error {
    color: var(--tx-warning-color);
    fill: var(--tx-warning-color);
}
`)