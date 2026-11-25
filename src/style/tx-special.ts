import specialCss from "./tx-special.css?inline"

/**
 * styles for the special values VALUE_UNKNOWN (tx-unknown) and VALUE_LOADING (tx-loading).
 *
 * included at the end of each style sheet that renders a special value, as
 * shadow roots do not see the global style sheet. The background declarations
 * are !important so they win over the background of the element's own rules.
 */
export const specialStyle = specialCss
