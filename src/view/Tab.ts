/*
 *  The TOAD JavaScript/TypeScript GUI Library
 *  Copyright (C) 2018-2021 Mark-André Hopf <mhopf@mark13.org>
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { View } from "../view/View"
import { ul, li, span, text, div, slot } from "../util/lsx"
import { style as txTabs } from "../style/tx-tabs"
import { HTMLElementProps } from "toad.jsx"

export class Tabs extends View {
    markerLine: HTMLElement
    content: HTMLElement

    activeTab?: HTMLElement
    activePanel?: HTMLElement

    constructor(init?: HTMLElementProps) {
        super(init)

        this.setTab = this.setTab.bind(this)

        this.classList.add("tx-tabs")
        if (this.hasAttribute("vertical")) {
            this.classList.add("tx-vertical")
        }

        this.content = div()

        const tabContainer = ul()
        for (let i = 0; i < this.children.length; ++i) {
            const child = this.children[i]
            if (child.nodeName !== "TX-TAB") {
                console.log(`unexpected <${child.nodeName.toLowerCase()}> within <tabs>`)
                continue
            }
            const tab = child as Tab
            let tabLabel: HTMLElement
            tabContainer.appendChild(
                li(
                    tabLabel = span(
                        text(tab.getAttribute("label")!) as any
                    )
                )
            )
            tabLabel.onpointerdown = (ev: PointerEvent) => {
                ev.stopPropagation()
                ev.preventDefault()
                ev.cancelBubble = true
                this.setTab(tabLabel, tab)
            }

            if (this.activeTab === undefined) {
                this.activeTab = tabLabel
                this.activePanel = tab
            } else {
                tab.style.display = "none"
            }
        }

        this.attachShadow({ mode: 'open' })
        this.shadowRoot!.appendChild(document.importNode(txTabs, true))
        this.shadowRoot!.appendChild(tabContainer)
        this.shadowRoot!.appendChild(this.markerLine = div())
        this.shadowRoot!.appendChild(this.content = div(slot()))
        this.markerLine.classList.add("line")
        this.content.classList.add("content")

        if (this.activeTab) {
            this.setTab(this.activeTab, this.activePanel!)
        }
    }

    setTab(tab: HTMLElement, panel: HTMLElement) {
        const line = this.markerLine
        if (this.hasAttribute("vertical")) {
            line.style.top = `${tab.offsetTop}px`
            line.style.height = `${tab.clientHeight}px`
        } else {
            line.style.left = `${tab.offsetLeft}px`
            line.style.width = `${tab.clientWidth}px`
        }

        this.activeTab!.classList.remove("active")
        this.activeTab = tab
        this.activeTab.classList.add("active")

        this.activePanel!.style.display = "none"
        this.activePanel = panel
        this.activePanel.style.display = ""
    }
}

Tabs.define("tx-tabs", Tabs)

export interface TabProps extends HTMLElementProps {
    label?: string
}

export class Tab extends View {
    label?: string
    constructor(init?: TabProps) {
        super(init)
        this.label = init?.label
    }
}
View.define("tx-tab", Tab)
