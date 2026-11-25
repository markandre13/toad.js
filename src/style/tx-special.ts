import specialCss from "./tx-special.css?inline"

/**
 * styles for the special values VALUE_UNKNOWN (tx-unknown) and VALUE_LOADING (tx-loading),
 * prefixed with the selector of the element they apply to. Use it when the element's own
 * rules have a higher specificity than the bare class selectors.
 *
 * included at the end of each style sheet that renders a special value, as
 * shadow roots do not see the global style sheet.
 */
export function specialStyleFor(selector: string) {
    return specialCss.replace(/^\.tx-(unknown|loading)/gm, `${selector}.tx-$1`)
}

export const specialStyle = specialStyleFor("")
