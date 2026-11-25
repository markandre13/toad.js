import styleText from "./tx-switch.css?inline"
import { specialStyleFor } from './tx-special'

export const style = new CSSStyleSheet()
style.replaceSync(styleText + specialStyleFor(":host(.tx-switch) > span"))