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

import { ModelView } from "./ModelView"
import { OptionModelBase } from "@toad/model/OptionModelBase"
import { input, button, svg, path, div, ul, li, array, text } from "@toad/util/lsx"
import { placePopupVertical } from "@toad/menu/PopupMenu"

export class Select extends ModelView<OptionModelBase> {
    input: HTMLInputElement
    button: HTMLButtonElement
    popup?: HTMLElement
    hover?: HTMLLIElement

    constructor() {
        super()
        this.input = input()
        this.input.type = "text"

        // popup vs. combobox
        this.asPopupMenu()

        let view = this
        this.input.oninput = () => {
            view.updateModel()
        }
        this.input.onblur = (ev: FocusEvent) => { // ?? but pointerdown moved the focus to the input...?
            if (this.hover === undefined) {
                this.close()
            }
        }

        let s
        const b = button(
            s = svg(
                path("M3 9.95a.875.875 0 01-.615-1.498L5.88 5 2.385 1.547A.875.875 0 013.615.302L7.74 4.377a.876.876 0 010 1.246L3.615 9.698A.872.872 0 013 9.95z")
            )
        )
        this.button = b
        b.tabIndex = -1
        b.style.outline = "none"
        s.style.width = "100%"
        s.style.height = "100%"

        b.onpointerdown = (ev: PointerEvent) => {
            if (this.popup) {
                // console.log(`button pointerdown`)
                this.close()
                return
            }
            ev.preventDefault()
            this.input.focus()
            this.open()
            b.setPointerCapture(ev.pointerId)
        }
        b.onpointermove = (ev: PointerEvent) => {
            if (this.popup === undefined) {
                return
            }
            const e = this.shadowRoot!.elementFromPoint(ev.clientX, ev.clientY)
            let newHover
            if (e instanceof HTMLLIElement) { // FIXME: this only works when there are no tags within the LI
                newHover = e
            } else {
                newHover = undefined
            }
            if (this.hover !== newHover) {
                if (this.hover) {
                    this.hover.classList.remove("tx-hover")
                }
                this.hover = newHover
                if (this.hover) {
                    this.hover.classList.add("tx-hover")
                }
            }
        }
        b.onpointerup = (ev: PointerEvent) => {
            if (this.hover) {
                const idx = parseInt(this.hover.dataset["idx"]!)
                this.close()
                this.select(idx)
                return
            }

            const e = this.shadowRoot!.elementFromPoint(ev.clientX, ev.clientY)
            if (b.contains(e)) {
                this.input.focus()
                return
            }

            this.close()
        }

        this.keydown = this.keydown.bind(this)
        this.input.onkeydown = this.keydown

        this.wheel = this.wheel.bind(this)
        this.input.onwheel = this.button.onwheel = this.wheel

        this.classList.add("tx-combobox")
        this.attachShadow({ mode: 'open' })
        this.attachStyle("combobox")
        this.attachStyle("menu") // menu & popover
        this.shadowRoot!.appendChild(this.input)
        this.shadowRoot!.appendChild(b)
    }

    keydown(ev: KeyboardEvent) {
        // TODO: open popup and navigate it with keys
        ev.preventDefault()
        switch(ev.key) {
            case "ArrowUp":
                this.previousItem()
                break
            case "ArrowDown":
                this.nextItem()
                break
        }
    }

    wheel(ev: WheelEvent) {
        ev.preventDefault()
        // TODO:
        // wacom tablets may fire multiple wheel events to increase scroll speed
        // we do not want this because here we want to flip from one item to the next
        // hence we might wanna look at the timestamp
        if (ev.deltaY > 0) {
            this.nextItem()
        }
        if (ev.deltaY < 0) {
            this.previousItem()
        }
    }

    // make text field non-editable
    asPopupMenu() {
        this.input.readOnly = true
        for (let property of ["user-select", "-webkit-user-select", "-webkit-touch-callout", "-khtml-user-select"]) {
            this.input.style.setProperty(property, "none")
        }
    }

    // make text field editable
    asComboBox() {
        this.input.readOnly = false
        for (let property of ["user-select", "-webkit-user-select", "-webkit-touch-callout", "-khtml-user-select"]) {
            this.input.style.removeProperty(property)
        }
    }

    override updateModel() {
        // if (this.model)
        //   this.model.value = Number.parseFloat(this.input.value)
    }

    override updateView() {
        if (!this.model || !this.model.enabled) {
            this.input.setAttribute("disabled", "")
        } else {
            this.input.removeAttribute("disabled")
        }

        if (this.model !== undefined) {
            // console.log(`Select.updateView() to ${this.model.stringValue}`)
            this.input.value = this.displayName(this.model.stringValue)
        }
    }

    protected displayName(value: string) {
        for (let i = 0; i < this.children.length; ++i) {
            const child = this.children[i]
            if (child.nodeName === "OPTION") {
                const option = child as HTMLOptionElement
                if (option.value === value) {
                    return option.text // TODO: also allow innerHTML
                }
            }
        }
        let all = ""
        for (let i = 0; i < this.children.length; ++i) {
            const child = this.children[i]
            if (child.nodeName === "OPTION") {
                const option = child as HTMLOptionElement
                all = `${all} '${option.value}'`
            }
        }

        console.log(`Select(model=${this.getAttribute("model")}).displayName('${value}'): not in${all} of`)
        console.trace(this) 
        return ""
    }

    open() {
        let view = this
        let u
        this.popup = div(
            u = ul(
                ...array(this.children.length, (idx) => {
                    const l = li(
                        text(
                            (this.children.item(idx) as HTMLElement).innerText
                        )
                    )
                    l.tabIndex = 0
                    l.ariaRoleDescription = "option"
                    l.dataset["idx"] = `${idx}`
                    l.onpointerdown = (ev: PointerEvent) => {
                        // console.log(`list pointer down ${idx}`)
                        this.button.setPointerCapture(ev.pointerId)
                        this.hover = l
                        ev.preventDefault()
                    }
                    l.onclick = () => {
                        // console.log(`list click ${idx}`)
                        view.select(idx)
                    }
                    this.children[idx]
                    return l
                })
            )
        )
        this.popup.classList.add("tx-popover")
        this.popup.style.position = "fixed" // this does not scroll well
        this.popup.style.zIndex = "99"
        u.ariaRoleDescription = "listbox"
        u.classList.add("tx-menu")
        this.shadowRoot!.appendChild(this.popup)

        placePopupVertical(this, this.popup)
    }

    close() {
        this.hover = undefined
        if (this.popup !== undefined) {
            this.shadowRoot!.removeChild(this.popup!)
            this.popup = undefined
        }
    }

    select(index: number) {
        // console.log(`Select.select(${index})`)
        this.close()
        this.model!.stringValue = (this.children[index] as HTMLOptionElement).value
    }

    getIndex(): number | undefined {
        const v = this.model?.stringValue
        for(let i=0; i<this.children.length; ++i) {
            if ((this.children[i] as HTMLOptionElement).value === v)
                return i
        }
        return undefined
    }

    nextItem() {
        let index = this.getIndex()
        if (index === undefined) {
            index = 0
        } else {
            ++index
        }
        if (index >= this.children.length) {
            return
        }
        this.select(index)
    }

    previousItem() {
        let index = this.getIndex()
        if (index === undefined) {
            index = this.children.length - 1
        } else {
            --index
        }
        if (index < 0) {
            return
        }
        this.select(index)
    }
}

Select.define("tx-select", Select)
