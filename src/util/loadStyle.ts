import txStatic from "../../style/tx-static.css?inline"
import txDark from "../../style/tx-dark.css?inline"
import txBase from "../../style/tx.css?inline"

function createStyle(textContent: string) {
    const style = document.createElement("style")
    style.textContent = textContent
    return style
}

export const styleStatic = createStyle(txStatic)
export const styleDark = createStyle(txDark)
export const styleBase = createStyle(txBase)

export function loadStyle() {
    for(const style of [styleStatic, styleDark, styleBase]) {
        if (!document.head.contains(style)) {
            document.head.appendChild(style)
        }
    }
}
