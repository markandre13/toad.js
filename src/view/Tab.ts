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
import { ModelView, ModelViewProps } from "./ModelView"
import { OptionModelBase } from "../model/OptionModelBase"

export interface TabsProps<V> extends ModelViewProps<OptionModelBase<V>> {
    orientation?: "horizontal" | "vertical"
}

/**
 * @category View
 */
export class Tabs<V> extends ModelView<OptionModelBase<V>> {
    markerLine: HTMLElement
    content: HTMLElement

    activeTab?: HTMLElement
    activePanel?: Tab<V>

    constructor(init?: TabsProps<V>) {
        super(init)

        this.activateTab = this.activateTab.bind(this)

        this.classList.add("tx-tabs")
        if (this.hasAttribute("vertical") || init?.orientation === "vertical") {
            this.classList.add("tx-vertical")
        }

        this.content = div(slot())
        this.content.classList.add("content")

        const tabContainer = ul()
        for (let i = 0; i < this.children.length; ++i) {
            const child = this.children[i]
            if (!(child instanceof Tab)) {
                console.log(`unexpected <${child.nodeName.toLowerCase()}> within <tabs>`)
                continue
            }
            const tab = child as Tab<V>
            let tabLabel: HTMLElement
            tabContainer.appendChild(li((tabLabel = span(text(tab.getAttribute("label")!) as any))))
            tabLabel.onpointerdown = (ev: PointerEvent) => {
                ev.stopPropagation()
                ev.preventDefault()
                ev.cancelBubble = true
                this.activateTab(tabLabel, tab)
            }

            if (this.activeTab === undefined && (this.model === undefined || this.model.value === tab.value)) {
                this.activeTab = tabLabel
                this.activePanel = tab
            } else {
                tab.style.display = "none"
            }
        }

        this.attachShadow({ mode: "open" })
        this.shadowRoot!.adoptedStyleSheets = [txTabs]
        this.shadowRoot!.replaceChildren(tabContainer, (this.markerLine = div()), this.content)
        this.markerLine.classList.add("line")

        if (this.activeTab) {
            this.activateTab(this.activeTab, this.activePanel!)
        }
    }

    override connectedCallback() {
        super.connectedCallback()
        this.adjustLine()
    }

    protected activateTab(tab: HTMLElement, panel: Tab<V>) {
        if (this.activeTab !== undefined && this.activePanel !== undefined) {
            this.activeTab.classList.remove("active")
            this.activePanel.style.display = "none"
            this.activePanel.close()
        }

        this.activeTab = tab
        this.activePanel = panel

        this.activePanel.open()
        this.activeTab.classList.add("active")
        this.activePanel.style.display = ""

        this.adjustLine()

        if (this.model && panel.value) {
            this.model.value = panel.value
        }
    }

    protected adjustLine() {
        const line = this.markerLine
        const tab = this.activeTab
        if (tab !== undefined) {
            if (this.hasAttribute("vertical")) {
                line.style.top = `${tab.offsetTop}px`
                line.style.height = `${tab.clientHeight}px`
            } else {
                line.style.top = `-2px`
                line.style.left = `${tab.offsetLeft}px`
                line.style.width = `${tab.clientWidth}px`
            }
        }
    }
}
Tabs.define("tx-tabs", Tabs)

export interface TabProps<V> extends HTMLElementProps {
    value?: V
    label?: string
    content?: () => any
}

export class Tab<V> extends View {
    value?: V
    label?: string
    content?: () => any
    constructor(init?: TabProps<V>) {
        super(init)
        this.value = init?.value
        this.label = init?.label
        this.content = init?.content
    }

    // we provide these as methods in case someone want's to override
    // the behaviour, e.g. to create/delete the content
    open() {
        // TODO: total rewrite with tests'n stuff
        if (this.childNodes.length === 0 && this.content !== undefined) {
            const content = this.content()
            if (content instanceof Promise) {
                // console.log(content)
                content.then((module) => {
                    if (typeof module === "object" && "default" in module) {
                        const v = module.default
                        if (typeof v === "function") {
                            const w = v()
                            if (w instanceof Promise) {
                                // console.log("yet another promise")
                                w.then( s => {
                                    // console.log(s)
                                    appendChildren(this, s)
                                })
                            } else {
                                appendChildren(this, v())
                            }
                        } else {
                            appendChildren(this, v)
                        }
                    }
                    // console.log(typeof module)
                    // console.log(module)
                    // console.log(module.default)
                })
            } else {
                appendChildren(this, this.content())
            }
        }
    }
    close() {}
}
View.define("tx-tab", Tab)

// copied from toad.jsx
// improve by replacing element.appendChild() with element.replaceChildren()
function appendChildren(element: HTMLElement | SVGElement, children: Array<any>) {
    for (const child of children) {
        if (child instanceof Array) {
            appendChildren(element, child)
            continue
        }
        if (typeof child === "string") {
            element.appendChild(document.createTextNode(child))
            continue
        }
        element.appendChild(child)
    }
}
