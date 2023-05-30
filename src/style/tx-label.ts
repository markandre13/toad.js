import { css } from 'src/util/lsx'

export const style = new CSSStyleSheet()
style.replaceSync(css`
.tx-label {
    display: block;
    box-sizing: border-box;
    padding: 4px 0 5px 0;
    font-size: var(--tx-font-size-info);
    text-align: left;
}

.tx-label.disabled {
    color: var(--tx-fg-color-disabled)
}`)