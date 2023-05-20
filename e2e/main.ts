import { style as styleFont } from "../src/style/tx-font"
import { style as styleStatic } from "../src/style/tx-static"
import { style as styleDark } from "../src/style/tx-dark"
import { style as styleBase } from "../src/style/tx"

import { main as buttonMain } from "./button.code"

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

const fontSans = document.createElement("link")
fontSans.setAttribute("rel", "stylesheet")

// <meta charset="utf-8">
// <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
// <meta name="viewport" content="width=device-width, minimum-scale=1.0, initial-scale=1, user-scalable=yes">
// <link rel="stylesheet" type="text/css"
//     href="https://fonts.googleapis.com/css?family=IBM+Plex+Sans:400,500,600&subset=latin" />
// <link rel="stylesheet" type="text/css"
//     href="https://fonts.googleapis.com/css?family=IBM+Plex+Mono:400&subset=latin" />
// <script type="application/javascript" src="/polyfill/webcomponents-hi-sd-ce.js"></script>

window.onload = () => {
    buttonMain()
}
