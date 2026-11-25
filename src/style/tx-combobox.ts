import styleText from "./tx-combobox.css?inline"
import { specialStyle } from './tx-special'

export const style = new CSSStyleSheet()
style.replaceSync(styleText + specialStyle)