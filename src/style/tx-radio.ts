/* a div on top serves as the container for elements used for the switch*/
import styleText from "./tx-radio.css?inline"
import { specialStyleFor } from './tx-special'

export const style = new CSSStyleSheet()
style.replaceSync(styleText + specialStyleFor(":host(.tx-radio) > span"))
