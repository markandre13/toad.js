import { css } from 'src/util/lsx'

export const style = new CSSStyleSheet()
style.replaceSync(css`
:host {
    display: inline-block;
}

.tx-text {
    width: 100%;
    box-shadow: none;
    box-sizing: border-box;
    color: var(--tx-edit-fg-color);
    background-color: var(--tx-edit-bg-color);

    /* we use the border instead of an outline to indicate the focus */
    outline: none;
    border-width: var(--tx-border-width);
    border-style: solid;
    border-color: var(--tx-border-color);
    border-radius: var(--tx-border-radius);

    font-weight: var(--tx-edit-font-weight);
    font-size: var(--tx-edit-font-size);
    line-height: 18px;

    padding: 4px 8px 4px 8px;
    text-indent: 0;
    vertical-align: top;
    margin: 0;
    overflow: visible;
    text-overflow: ellipsis;
}
.tx-text:hover {
    border-color: var(--tx-border-color-hover);
}
.tx-text:disabled {
    color: var(--tx-fg-color-disabled);
    background-color: var(--tx-bg-color-disabled);
    border-color: var(--tx-bg-color-disabled);
}
.tx-text::placeholder {
    color: var(--tx-placeholder-fg-color);
    font-style: italic;
    font-weight: 300;
}
.tx-text:hover::placeholder {
    color: var(--tx-placeholder-fg-color-hover);
}
.tx-text:focus {
    border-color: var(--tx-outline-color);
}
.tx-text.tx-error {
    border-color: var(--tx-warning-color)
}
.tx-text.tx-unknown {
    background: repeating-conic-gradient(#000 0% 25%, #fff 0% 50%) 0 0 / 4px 4px;
}
.tx-text.tx-loading {
    background: repeating-linear-gradient(-45deg, #fff 0 10px, #faa 0 20px) 100% 100%;
    background-size: calc(20px / cos(45deg)) calc(20px / cos(45deg));
    animation: tx-loading 1s infinite linear;
}
@keyframes tx-loading {
    0% {
        background-position: 0 0;
    }

    100% {
        background-position: calc(20px / cos(45deg)) 0;
    }
}
`)