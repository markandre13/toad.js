import { css } from './lsx'

let fontHasBeenAddedToDocumentHead = false
export function loadFont(path: string | undefined = undefined) {
    if (fontHasBeenAddedToDocumentHead) {
        return
    }
    let style = path === undefined ? googleFont() : localFont(path)
    style.forEach( node => document.head.appendChild(node))
    fontHasBeenAddedToDocumentHead = true
}

export function googleFont() {
    const sans = document.createElement("link")
    sans.rel = "stylesheet"
    sans.type = "text/css"
    sans.href = "https://fonts.googleapis.com/css?family=IBM+Plex+Sans:300,400,500,600,700,300italic,400italic,500italic,600italic,700italic&subset=latin"
    const mono = document.createElement("link")
    mono.rel = "stylesheet"
    mono.type = "text/css"
    mono.href = "https://fonts.googleapis.com/css?family=IBM+Plex+Mono:400,700,400italic,700italic&subset=latin"
    return [sans, mono]
}

export function localFont(path: string = "/ttf/") {   
    const style = document.createElement("style")
    style.textContent = css`
@font-face { font-family: 'IBM Plex Sans'; font-style: normal; font-weight: 300; src: url(${path}IBMPlexSans-Light.ttf) }
@font-face { font-family: 'IBM Plex Sans'; font-style: normal; font-weight: 400; src: url(${path}IBMPlexSans-Regular.ttf) }
@font-face { font-family: 'IBM Plex Sans'; font-style: normal; font-weight: 500; src: url(${path}IBMPlexSans-Medium.ttf) }
@font-face { font-family: 'IBM Plex Sans'; font-style: normal; font-weight: 600; src: url(${path}IBMPlexSans-SemiBold.ttf) }
@font-face { font-family: 'IBM Plex Sans'; font-style: normal; font-weight: 700; src: url(${path}IBMPlexSans-Bold.ttf) }

@font-face { font-family: 'IBM Plex Sans'; font-style: italic; font-weight: 300; src: url(${path}IBMPlexSans-LightItalic.ttf) }
@font-face { font-family: 'IBM Plex Sans'; font-style: italic; font-weight: 400; src: url(${path}IBMPlexSans-Italic.ttf) }
@font-face { font-family: 'IBM Plex Sans'; font-style: italic; font-weight: 500; src: url(${path}IBMPlexSans-MediumItalic.ttf) }
@font-face { font-family: 'IBM Plex Sans'; font-style: italic; font-weight: 600; src: url(${path}IBMPlexSans-SemiBoldItalic.ttf) }
@font-face { font-family: 'IBM Plex Sans'; font-style: italic; font-weight: 700; src: url(${path}IBMPlexSans-BoldItalic.ttf) }

@font-face { font-family: 'IBM Plex Mono'; font-style: normal; font-weight: 400; src: url(${path}IBMPlexMono-Regular.ttf) }
@font-face { font-family: 'IBM Plex Mono'; font-style: normal; font-weight: 700; src: url(${path}IBMPlexMono-Bold.ttf) }

@font-face { font-family: 'IBM Plex Mono'; font-style: italic; font-weight: 400; src: url(${path}IBMPlexMono-Italic.ttf) }
@font-face { font-family: 'IBM Plex Mono'; font-style: italic; font-weight: 700; src: url(${path}IBMPlexMono-BoldItalic.ttf) }`
    return [style]
}
