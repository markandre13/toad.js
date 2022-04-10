import { View } from "../view/View"
import { ul, li, span, text, div } from "../util/lsx"

export class Tabs extends View {
    markerLine: HTMLDivElement
    content: HTMLDivElement

    constructor() {
        super()

        this.setTab = this.setTab.bind(this)

        this.classList.add("tx-tabs")
        if (this.hasAttribute("vertical")) {
            this.classList.add("tx-vertical")
        }

        let firstTab: HTMLElement | undefined
        const tabContainer = ul()
        for (let i = 0; i < this.children.length; ++i) {
            const child = this.children[i]
            if (child.nodeName !== "TX-TAB") {
                console.log(`unexpected <${child.nodeName.toLowerCase()}> within <tabs>`)
                continue
            }
            let tabLabel
            tabContainer.appendChild(
                li(
                    tabLabel = span(
                        text(child.getAttribute("label")!) as any
                    )
                )
            )
            tabLabel.onmousedown = this.setTab
            if (firstTab === undefined) {
                firstTab = tabLabel
            }
        }

        this.attachShadow({ mode: 'open' })
        this.attachStyle("tabs")
        this.shadowRoot!.appendChild(tabContainer)
        this.shadowRoot!.appendChild(this.markerLine = div())
        this.shadowRoot!.appendChild(this.content = div())
        this.markerLine.classList.add("line")
        this.content.classList.add("content")

        if (firstTab !== undefined) {
            this.setTab(firstTab)
        }
    }

    setTab(eventOrTab: MouseEvent | HTMLElement) {
        let tab: HTMLElement
        if (eventOrTab instanceof HTMLElement) {
            tab = eventOrTab;
        } else {
            let event = eventOrTab
            tab = event.target as HTMLElement
            event.stopPropagation()
            event.preventDefault()
            event.cancelBubble = true
        }

        const line = this.markerLine
        if (this.hasAttribute("vertical")) {
            line.style.top = `${tab.offsetTop}px`
            line.style.height = `${tab.clientHeight}px`
        } else {
            line.style.left = `${tab.offsetLeft}px`
            line.style.width = `${tab.clientWidth}px`
        }

        const tabs = tab.parentElement!.parentElement!.querySelectorAll("li > span")
        tabs.forEach((t: any) => {
            t.classList.remove("active")
        })
        tab.classList.add("active")

        this.content.innerHTML = "ZACK!!"
    }
}

Tabs.define("tx-tabs", Tabs)

export class Tab extends HTMLElement { }
View.define("tx-tab", Tab)