
import styleText from "./tx-slider.css?inline"
import { specialStyle } from './tx-special'

// rail disabled: 3f3f3f
// thumb disabled: 6a6a6a

// rail enabled: 4b4b4b
// track/rail filled: a3a3a3
// thumb enabled: d0d0d0
// thumb hover: ebebeb

export const style = new CSSStyleSheet()
style.replaceSync(styleText + specialStyle)