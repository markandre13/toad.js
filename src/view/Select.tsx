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

import { ModelView, ModelViewProps } from "./ModelView"
import { OptionModelBase } from "../model/OptionModelBase"
import { input, button, svg, path, div, ul, li, array, text, span } from "../util/lsx"
import { placePopupVertical } from "../menu/PopupMenu"
import { TextModel } from "../model/TextModel"

import { style as txCombobox } from "../style/tx-combobox"
import { style as txMenu } from "../style/tx-menu"

/**
 * @category View
 */

export abstract class SelectBase<V> extends ModelView<OptionModelBase<V>> {
    protected button: HTMLButtonElement
    protected displayElement!: HTMLInputElement | HTMLSpanElement
    protected popup?: HTMLDivElement
    protected hover?: HTMLLIElement

    constructor(init?: ModelViewProps<OptionModelBase<V>>) {
        super(init)
        this.pointerup = this.pointerup.bind(this)
        this.pointermove = this.pointermove.bind(this)
        this.pointerdown = this.pointerdown.bind(this)
        this.wheel = this.wheel.bind(this)
        this.keydown = this.keydown.bind(this)

        let s
        const b = button(
            s = svg(
                path("M3 9.95a.875.875 0 01-.615-1.498L5.88 5 2.385 1.547A.875.875 0 013.615.302L7.74 4.377a.876.876 0 010 1.246L3.615 9.698A.872.872 0 013 9.95z")
            )
        )

        // BUTTON
        this.button = b
        b.tabIndex = -1
        b.style.outline = "none"
        s.style.width = "100%"
        s.style.height = "100%"

        // that we use the button to capture pointer events has no special
        // meaning other that we use any child for the capture
        b.onpointerdown = this.pointerdown
        b.onpointermove = this.pointermove
        b.onpointerup = this.pointerup

        // SHADOW
        this.classList.add("tx-combobox") // TODO: drop this
        this.attachShadow({ mode: 'open' })
        this.shadowRoot!.adoptedStyleSheets = [
            txCombobox,
            txMenu // menu & popover
        ]
    }

    finalize() {
        this.displayElement.onwheel = this.button.onwheel = this.wheel
        this.shadowRoot!.replaceChildren(this.displayElement, this.button)
    }

    //
    // KEYS
    //

    keydown(ev: KeyboardEvent) {
        // TODO: open popup and navigate it with keys
        // if (this.displayElement.readOnly) {
        //     ev.preventDefault()
        // }
        if (this.model) {
            switch (ev.key) {
                case "ArrowUp":
                    this.model.prev()
                    break
                case "ArrowDown":
                    this.model.next()
                    break
                case "Enter":
                    this.togglePopup()
                    break
                case "Escape":
                    if (this.popup !== undefined) {
                        // TODO: in case of combobox, restore previous value
                        this.close()
                    }
                    break
            }
        }
    }

    //
    // WHEEL
    //

    wheel(ev: WheelEvent) {
        ev.preventDefault()
        this.displayElement.focus()
        // TODO:
        // wacom tablets may fire multiple wheel events to increase scroll speed
        // we do not want this because here we want to flip from one item to the next
        // hence we might wanna look at the timestamp
        if (this.model) {
            if (ev.deltaY > 0) {
                this.model.next()
            }
            if (ev.deltaY < 0) {
                this.model.prev()
            }
        }
    }

    //
    // POINTER EVENTS
    //
    protected pointerdown(ev: PointerEvent) {
        if (this.popup) {
            this.close()
            ev.preventDefault()
            return
        }
        ev.preventDefault()
        this.displayElement.focus()
        this.open()
        this.button.setPointerCapture(ev.pointerId)
    }
    protected pointermove(ev: PointerEvent) {
        if (this.popup === undefined) {
            return
        }
        let newHover = this.findMenuItem(ev)
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

    // when the pointer is captured, we need to find out on our own where we are...
    protected findMenuItem(ev: PointerEvent) {
        let e: Element | null | undefined = this.shadowRoot!.elementFromPoint(ev.clientX, ev.clientY)
        while (e) {
            if (e.nodeName === "LI"
                && e.parentElement?.classList.contains("tx-menu")
                && e.parentElement?.parentElement?.classList.contains("tx-popover")
            ) {
                break
            }
            e = e?.parentElement
        }
        return (e ? e : undefined) as HTMLLIElement | undefined
    }

    protected pointerup(ev: PointerEvent) {
        if (this.hover) {
            const idx = parseInt(this.hover.dataset["idx"]!)
            this.close()
            this.select(idx)
            return
        }
        const e = this.shadowRoot!.elementFromPoint(ev.clientX, ev.clientY)
        if (this.displayElement.contains(e) || this.button.contains(e)) {
            return
        }
        this.close()
    }

    //
    // POPUP
    //
    togglePopup() {
        if (this.popup) {
            this.close()
        } else {
            this.open()
        }
    }

    open() {
        // console.log("OPEN")
        let view = this
        this.popup = div()
        if (this.model) {
            this.popup.replaceChildren(<ul class="tx-menu" aria-roledescription="listbox">
                {
                    this.model.map((value, key, label, idx) => {
                        const l = li(label)
                        l.tabIndex = 0
                        l.ariaRoleDescription = "option"
                        l.dataset["idx"] = `${idx}`
                        l.onpointerdown = (ev: PointerEvent) => {
                            // console.log(`list pointer down ${idx}`)
                            // redirect other events to to our event handle child
                            this.button.setPointerCapture(ev.pointerId)
                            this.hover = l
                            ev.preventDefault()
                        }
                        l.onkeydown = this.keydown
                        return l
                    })
                }
            </ul>)
        }
        this.popup.classList.add("tx-popover")
        this.popup.style.position = "fixed" // this does not scroll well
        this.popup.style.zIndex = "99"
        // u.ariaRoleDescription = "listbox"
        // u.classList.add("tx-menu")
        this.shadowRoot!.appendChild(this.popup)

        placePopupVertical(this, this.popup)

        this.focusToItem()
    }

    focusToItem() {
        if (this.popup && this.model) {
            const index = this.model.index
            if (index !== undefined) {
                (this.popup.children[0].children[this.model.index!] as HTMLElement).focus()
            }
        }
    }

    close() {
        this.hover = undefined
        if (this.popup !== undefined) {
            this.shadowRoot!.removeChild(this.popup!)
            this.popup = undefined
            this.displayElement.focus()
        }
    }

    //
    // LIST ITEMS
    //

    select(index: number) {
        if (this.model) {
            // console.trace("select ${index}")
            this.model.index = index
        }
    }

    override updateView(): void {
        if (!this.model || !this.model.enabled) {
            this.displayElement.setAttribute("disabled", "")
        } else {
            this.displayElement.removeAttribute("disabled")
        }

        if (this.model?.error !== undefined) {
            this.displayElement.classList.add("tx-error")
        } else {
            this.displayElement.classList.remove("tx-error")
        }
    }
}

export class Select<V> extends SelectBase<V> {
    override displayElement: HTMLSpanElement
    constructor(init?: ModelViewProps<OptionModelBase<V>>) {
        super(init)
        this.displayElement = div()
        this.displayElement.tabIndex = 0
        this.displayElement.style.minWidth = "200px"
        this.displayElement.onpointerdown = this.pointerdown
        this.displayElement.onkeydown = this.keydown
        // this.displayElement.onkeydown = this.keydown
        this.finalize()
    }

    override updateView() {
        super.updateView()
        if (this.model !== undefined) {
            this.displayElement.replaceChildren(this.model.html)
        }
        this.focusToItem()
    }

}

interface ComboBoxProps<V> extends ModelViewProps<OptionModelBase<V>> {
    text?: TextModel
}

export class ComboBox extends SelectBase<string | number> {
    override displayElement: HTMLInputElement
    textModel?: TextModel
    constructor(init?: ComboBoxProps<string>) {
        super(init)
        this.textModel = init?.text
        this.displayElement = input()
        this.displayElement.type = "text"
        this.displayElement.onkeydown = (ev: KeyboardEvent) => {
            if (ev.key === "Enter" || this.popup !== undefined) {
                this.keydown(ev)
            }
        }

        this.displayElement.oninput = () => {
            this.updateModel()
        }

        this.finalize()
    }

    override close() {
        super.close()
        if (this.popup === undefined) {
            this.displayElement.focus()
        }
    }

    override updateModel() {
        if (this.model) {
            if (typeof this.model.value === "number") {
                this.model.value = Number.parseFloat(this.displayElement.value)
            } else {
                this.model.value = this.displayElement.value
            }
        }
        if (this.textModel) {
            this.textModel.value = this.displayElement.value
        }
    }

    override updateView() {
        super.updateView()
        if (this.model !== undefined) {
            this.displayElement.value = `${this.model.value}`
        }
        this.focusToItem()
    }
}

Select.define("tx-select", Select)
ComboBox.define("tx-combobox", ComboBox)

// export class Select<V> extends ModelView<OptionModelBase<V>> {

//     // TODO: this override to make it possible to use multiple 'model' attributes
//     //       but this should be rather a feature of View
//     override connectedCallback(): void {
//         if (this.controller)
//             return
//         super.connectedCallback()

//         const text = this.getAttribute("text")
//         if (text !== null) {
//             // console.log(`Select.connectedCallback(): register for model ${text}`)
//             globalController.registerView(`M:${text}`, this)
//             this.asComboBox()
//             this.updateModel()
//         }
//     }

//     override setModel(model?: OptionModelBase<V>): void {
//         if (!model) {
//             if (this.text) {
//                 this.text.modified.remove(this)
//                 this.text = undefined
//             }
//             super.setModel(model)
//             return
//         }

//         if (model instanceof OptionModelBase) {
//             super.setModel(model)
//         }
//         if (model instanceof TextModel) {
//             this.text = model
//             this.text.modified.add(() => {
//                 this.displayElement.value = this.text!.value
//             }, this)
//         }
//     }
// }

