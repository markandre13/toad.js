import styleText from "./tx-text.css?inline"
import { specialStyle } from './tx-special'

export const style = new CSSStyleSheet()
style.replaceSync(styleText + specialStyle)