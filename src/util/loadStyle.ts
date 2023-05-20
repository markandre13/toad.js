import { style as styleFont } from "../style/tx-font"
import { style as styleStatic } from "../style/tx-static"
import { style as styleDark } from "../style/tx-dark"
import { style as styleBase } from "../style/tx"

/**
 * Load toad.js' default styles. Fonts need to be in /ttf/
 * 
 * This is equivalent to:
 * 
 * <meta charset="utf-8">
 * <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
 * <link rel="stylesheet" type="text/css" href="/style/tx-font.css" />
 * <link rel="stylesheet" type="text/css" href="/style/tx-static.css" />
 * <link rel="stylesheet" type="text/css" href="/style/tx-dark.css" />
 * <link rel="stylesheet" type="text/css" href="/style/tx.css" /> 
 */
export function loadStyle() {
    document.head.appendChild(styleFont)
    document.head.appendChild(styleStatic)
    document.head.appendChild(styleDark)
    document.head.appendChild(styleBase)
    
    const charset = document.createElement("meta")
    charset.setAttribute("charset", "utf8")
    document.head.appendChild(charset)
    
    const viewport = document.createElement("meta")
    charset.setAttribute("name", "viewport")
    charset.setAttribute("content", "width=device-width, minimum-scale=1.0, initial-scale=1, user-scalable=yes")
    document.head.appendChild(viewport)   
}
