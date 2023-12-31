import { ModelView, ModelViewProps } from "./ModelView"
import { OptionModelBase } from "../model/OptionModelBase"
import { button, svg, path, div, li } from "../util/lsx"
import { placePopupVertical } from "../menu/PopupMenu"
import { style as txCombobox } from "../style/tx-combobox"
import { style as txMenu } from "../style/tx-menu"

/**
 * @category View
 *
 * Base class for Select and ComboBox
 */
export abstract class OptionBase<V> extends ModelView<OptionModelBase<V>> {
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
            (s = svg(
                path(
                    "M3 9.95a.875.875 0 01-.615-1.498L5.88 5 2.385 1.547A.875.875 0 013.615.302L7.74 4.377a.876.876 0 010 1.246L3.615 9.698A.872.872 0 013 9.95z"
                )
            ))
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
        this.attachShadow({ mode: "open" })
        this.shadowRoot!.adoptedStyleSheets = [
            txCombobox,
            txMenu, // menu & popover
        ]
    }

    finalize() {
        // this.onblur = (ev: FocusEvent) => { // ?? but pointerdown moved the focus to the input...?
        //     if (this.hover === undefined) { // tests...
        //         this.close()
        //     }
        // }
        this.displayElement.onwheel = this.button.onwheel = this.wheel
        this.shadowRoot!.replaceChildren(this.displayElement, this.button)
    }

    //
    // KEYS
    //
    keydown(ev: KeyboardEvent) {
        ev.preventDefault()
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
        if (this.model === undefined || !this.model.enabled) {
            return
        }
        this.displayElement.focus()
        // TODO:
        // wacom tablets may fire multiple wheel events to increase scroll speed
        // we do not want this because here we want to flip from one item to the next
        // hence we might wanna look at the timestamp
        if (ev.deltaY > 0) {
            this.model.next()
        }
        if (ev.deltaY < 0) {
            this.model.prev()
        }
    }

    //
    // POINTER EVENTS
    //
    protected pointerdown(ev: PointerEvent) {
        ev.preventDefault()
        if (this.model === undefined || !this.model.enabled) {
            return
        }
        if (this.popup) {
            this.close()
            return
        }
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
            if (e.nodeName === "LI" &&
                e.parentElement?.classList.contains("tx-menu") &&
                e.parentElement?.parentElement?.classList.contains("tx-popover")) {
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
        this.popup = div()
        if (this.model) {
            this.popup.replaceChildren(
                <ul class="tx-menu" aria-roledescription="listbox">
                    {this.model.map((value, key, idx) => {
                        const item = li(this.model!.asHtml(key))
                        item.tabIndex = 0
                        item.ariaRoleDescription = "option"
                        item.dataset["idx"] = `${idx}`
                        item.onpointerdown = (ev: PointerEvent) => {
                            // console.log(`list pointer down ${idx}`)
                            // redirect other events to to our event handle child
                            this.button.setPointerCapture(ev.pointerId)
                            this.hover = item
                            ev.preventDefault()
                        }
                        item.onkeydown = this.keydown
                        return item
                    })}
                </ul>
            )
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
                ; (this.popup.children[0].children[this.model.index!] as HTMLElement).focus()
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
            this.displayElement.classList.add("tx-disabled")
            this.displayElement.setAttribute("disabled", "")
            this.button.setAttribute("disabled", "")
        } else {
            this.displayElement.classList.remove("tx-disabled")
            this.displayElement.removeAttribute("disabled")
            this.button.removeAttribute("disabled")
        }

        if (this.model?.error !== undefined) {
            this.displayElement.classList.add("tx-error")
        } else {
            this.displayElement.classList.remove("tx-error")
        }
    }
}
