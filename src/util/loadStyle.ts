import styleStatic from "../../style/tx-static.css?inline"
import styleDark from "../../style/tx-dark.css?inline"
import styleBase from "../../style/tx.css?inline"

function createStyle(textContent: string) {
    const style = document.createElement("style")
    style.textContent = textContent
    return style
}

export const txStatic = createStyle(styleStatic)
export const txDark = createStyle(styleDark)
export const txBase = createStyle(styleBase)

export function loadStyle() {
    for (const style of [txStatic, txDark, txBase]) {
        if (!document.head.contains(style)) {
            document.head.appendChild(style)
        }
    }
}
