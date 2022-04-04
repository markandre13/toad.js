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

import { View } from "./View"
import { ModelView } from "./ModelView"
import { OptionModelBase } from "@toad/model/OptionModelBase"
import { input, button, svg, path, div, ul, li, array, text } from "@toad/util/lsx"
import { placePopupVertical } from "@toad/menu/PopupMenu"

export class Select extends ModelView<OptionModelBase> {
    input: HTMLInputElement
    popup?: HTMLElement

    constructor() {
        super()
        this.input = input()
        this.input.type = "text"
        let view = this
        this.input.oninput = () => {
            view.updateModel()
        }

        let s
        const b = button(
            s = svg(
                path("M3 9.95a.875.875 0 01-.615-1.498L5.88 5 2.385 1.547A.875.875 0 013.615.302L7.74 4.377a.876.876 0 010 1.246L3.615 9.698A.872.872 0 013 9.95z")
            )
        )
        b.tabIndex = -1
        s.style.width = "100%"
        s.style.height = "100%"
        b.onclick = () => {
            if (this.popup === undefined) {
                this.open()
            } else {
                this.close()
            }
        }
        this.classList.add("tx-combobox")
        this.attachShadow({ mode: 'open' })
        this.attachStyle("combobox")
        this.attachStyle("menu") // menu & popover
        this.shadowRoot!.appendChild(this.input)
        this.shadowRoot!.appendChild(b)
    }

    override updateModel() {
        // if (this.model)
        //   this.model.value = Number.parseFloat(this.input.value)
    }

    override updateView() {
        if (!this.model)
            return
        if (!this.model || !this.model.enabled) {
            this.input.setAttribute("disabled", "")
        } else {
            this.input.removeAttribute("disabled")
        }

        if (this.model) {
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
                    l.onclick = () => {
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
        this.shadowRoot!.removeChild(this.popup!)
        // document.body.removeChild(this.popup!)
        this.popup = undefined
    }

    select(index: number) {
        this.model!.stringValue = (this.children[index] as HTMLOptionElement).value
        this.close()
    }
}

Select.define("tx-select", Select)
