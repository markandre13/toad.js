/* 
 * Form 
 * Available in two variants: labels on the side (wide/default) and labels on the top (narrow)
 */
import baseText from "./tx-form.css?inline"
import narrowText from "./tx-form-narrow.css?inline"

export const styleBase = new CSSStyleSheet()
styleBase.replaceSync(baseText)

export const styleNarrow = new CSSStyleSheet()
styleNarrow.replaceSync(narrowText)
