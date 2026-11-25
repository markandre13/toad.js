import styleText from "./tx-checkbox.css?inline"
import { specialStyle } from './tx-special'

export const style = new CSSStyleSheet()
style.replaceSync(styleText + specialStyle)