import { style as styleStatic } from "../style/tx-static"
import { style as styleDark } from "../style/tx-dark"
import { style as styleBase } from "../style/tx"

export function loadStyle() {
    for(const style of [styleStatic, styleDark, styleBase]) {
        if (!document.head.contains(style)) {
            document.head.appendChild(style)
        }
    }
}
