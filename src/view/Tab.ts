import { View } from "../view/View"
import { ul, li, span, text, div } from "../util/lsx"

export class Tabs extends View {
    // input: HTMLInputElement

    constructor() {
        super()

        this.setTab = this.setTab.bind(this)

        this.classList.add("tx-tabs")
        if (this.hasAttribute("vertical")) {
            this.classList.add("tx-vertical")
        }
        const u = ul()

        let firstTab: HTMLElement | undefined

        for (let i = 0; i < this.children.length; ++i) {
            const child = this.children[i]
            if (child.nodeName !== "TX-TAB") {
                console.log(`unexpected <${child.nodeName.toLowerCase()}> within <tabs>`)
                continue
            }
            let l, s
            u.appendChild(
                l = li(
                    s = span(
                        text(child.getAttribute("label")!) as any
                    )
                )
            )
            s.onmousedown = this.setTab
            if (firstTab === undefined) {
                firstTab = s
            }
        }

        let d

        this.attachShadow({ mode: 'open' })
        this.attachStyle("tabs")
        this.shadowRoot!.appendChild(u)
        this.shadowRoot!.appendChild(d = div())

        if (firstTab !== undefined) {
            this.setTab(firstTab)
        }

    }

    setTab(eventOrTab: any) {
        let tab: any
        if (eventOrTab.target === undefined) {
            tab = eventOrTab;
        } else {
            let event = eventOrTab;
            tab = event.target;
            if (event.stopPropagation) event.stopPropagation();
            if (event.preventDefault) event.preventDefault();
            event.cancelBubble = true;
            event.returnValue = false;
        }

        let list = tab.parentElement.parentElement
        let line = list.nextSibling
        while (line.nodeName !== "DIV") {
            line = line.nextSibling
        }

        // let container = list.parentElement
        if (this.hasAttribute("vertical")) {
            line.style.top = tab.offsetTop + "px";
            line.style.height = tab.clientHeight + "px";
        } else {
            line.style.left = tab.offsetLeft + "px";
            line.style.width = tab.clientWidth + "px";
        }

        let tabs = tab.parentElement.parentElement.querySelectorAll("li > span")
        tabs.forEach((t: any) => {
            t.classList.remove("active")
        })
        tab.classList.add("active")

        return false
    }
}

Tabs.define("tx-tabs", Tabs)

export class Tab extends HTMLElement { }
View.define("tx-tab", Tab)