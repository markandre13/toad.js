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
import { style as txScrollbar } from "../style/tx-scrollbar"
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

    activeLabel?: HTMLElement
    activePanel?: Tab<V>
    vertical: boolean

    labelMap = new Map<Tab<V>, HTMLElement>()

    constructor(init?: TabsProps<V>) {
        super(init)

        this.activateTab = this.activateTab.bind(this)

        this.classList.add("tx-tabs")
        this.vertical = this.hasAttribute("vertical") || init?.orientation === "vertical"
        if (this.vertical) {
            this.classList.add("tx-vertical")
        }

        this.content = div(slot())
        this.content.classList.add("content")

        let activeLabel: HTMLElement | undefined = this.activeLabel,
            activePanel: Tab<V> | undefined = this.activePanel

        const tabContainer = ul()
        for (let i = 0; i < this.children.length; ++i) {
            const child = this.children[i]
            if (!(child instanceof Tab)) {
                console.log(`unexpected <${child.nodeName.toLowerCase()}> within <tabs>`)
                continue
            }
            const panel = child as Tab<V>
            let tabLabel: HTMLElement
            tabContainer.appendChild(li((tabLabel = span(text(panel.getAttribute("label")!) as any))))
            tabLabel.onpointerdown = (ev: PointerEvent) => {
                ev.stopPropagation()
                ev.preventDefault()
                ev.cancelBubble = true
                this.activateTab(tabLabel, panel)
            }
            this.labelMap.set(panel, tabLabel)

            if (activeLabel === undefined && (this.model === undefined || this.model.value === panel.value)) {
                activeLabel = tabLabel
                activePanel = panel
            } else {
                panel.style.display = "none"
            }
        }

        this.attachShadow({ mode: "open" })
        this.shadowRoot!.adoptedStyleSheets = [txTabs, txScrollbar]
        this.shadowRoot!.replaceChildren(tabContainer, (this.markerLine = div()), this.content)
        this.markerLine.classList.add("line")

        if (activeLabel !== undefined) {
            this.activateTab(activeLabel, activePanel!)
        }
    }

    override updateView(): void {
        if (this.model) {
            // console.log(`<TAB> UPDATE VIEW ${this.model.value}`)
            for (let i = 0; i < this.children.length; ++i) {
                const child = this.children[i]
                if (!(child instanceof Tab)) {
                    console.log(`unexpected <${child.nodeName.toLowerCase()}> within <tabs>`)
                    continue
                }
                const tab = child as Tab<V>
                if (this.model.value === tab.value) {
                    this.activateTab(this.labelMap.get(tab)!, tab)
                    break
                }
            }
        }
    }

    protected activateTab(tabLabel: HTMLElement, panel: Tab<V>) {
        if (this.activePanel === panel) {
            return
        }

        if (this.activeLabel !== undefined && this.activePanel !== undefined) {
            this.activeLabel.classList.remove("active")
            this.activePanel.style.display = "none"
            this.activePanel.close()
        }

        this.activeLabel = tabLabel
        this.activePanel = panel

        this.activePanel.open()
        this.activeLabel.classList.add("active")
        this.activePanel.style.display = ""

        setTimeout(() => this.adjustLine(), 0)

        if (this.model && panel.value !== undefined) {
            this.model.value = panel.value
        }
    }

    protected adjustLine() {
        const line = this.markerLine
        const label = this.activeLabel
        if (label !== undefined) {
            if (this.vertical) {
                line.style.top = `${label.offsetTop}px`
                line.style.height = `${label.clientHeight}px`
            } else {
                line.style.top = `-2px`
                line.style.left = `${label.offsetLeft}px`
                line.style.width = `${label.clientWidth}px`
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
                                w.then((s) => {
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
