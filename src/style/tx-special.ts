import { css } from "../util/lsx"

/**
 * styles for the special values VALUE_UNKNOWN (tx-unknown) and VALUE_LOADING (tx-loading),
 * prefixed with the selector of the element they apply to. Use it when the element's own
 * rules have a higher specificity than the bare class selectors.
 *
 * included at the end of each style sheet that renders a special value, as
 * shadow roots do not see the global style sheet.
 */
export function specialStyleFor(selector: string) {
    return css`
${selector}.tx-unknown {
    background: repeating-conic-gradient(#000 0% 25%, #fff 0% 50%) 0 0 / 4px 4px;
}

${selector}.tx-loading {
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
`
}

export const specialStyle = specialStyleFor("")
