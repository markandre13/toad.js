/*
 *  The TOAD JavaScript/TypeScript GUI Library
 *  Copyright (C) 2018-2022 Mark-André Hopf <mhopf@mark13.org>
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

import { HtmlModel } from "../model/HtmlModel"
import { ActionView, ActionViewProps } from "./ActionView"

import { button, span } from "../util/lsx"
import { style as txButton } from  "../style/tx-button"

export enum ButtonVariant {
    PRIMARY,
    SECONDARY,
    ACCENT,
    NEGATIVE
}

export interface ButtonProps extends ActionViewProps {
    variant?: ButtonVariant
}

/**
 * @category View
 */
export class Button extends ActionView {
    button: HTMLButtonElement
    label: HTMLSpanElement
    _observer?: MutationObserver
    _timer?: number

    constructor(init?: ButtonProps) {
        super(init)

        this.button = button(
            this.label = span()
        )
        this.button.classList.add("tx-button")
        this.label.classList.add("tx-label")
        this.button.onclick = () => {
            if (this.action)
                this.action.trigger()
        }

        switch(this.getAttribute("variant")) {
            case "primary":
                this.button.classList.add("tx-default")
                break
            case "secondary":
                break
            case "accent":
                this.button.classList.add("tx-accent")
                break
            case "negative":
                this.button.classList.add("tx-negative")
                break    
        }
        switch(init?.variant) {
            case ButtonVariant.PRIMARY:
                this.button.classList.add("tx-default")
                break
            case ButtonVariant.SECONDARY:
                break
            case ButtonVariant.ACCENT:
                this.button.classList.add("tx-accent")
                break
            case ButtonVariant.NEGATIVE:
                this.button.classList.add("tx-negative")
                break
        }

        this.attachShadow({ mode: 'open' })
        this.shadowRoot!.adoptedStyleSheets = [txButton]
        this.shadowRoot!.appendChild(this.button)
    }

    override connectedCallback() {
        super.connectedCallback()
        if (this.children.length !== 0) {
            return
        }
        // Chrome, Opera invoke connectedCallback() before the children are connected
        this._observer = new MutationObserver((record: MutationRecord[], observer: MutationObserver) => {
            if (this._timer !== undefined)
                clearTimeout(this._timer)
            this._timer = window.setTimeout(() => {
                this._timer = undefined
                this.updateView()
            }, 100)
        })
        this._observer.observe(this, {
            childList: true,
            subtree: true,
            characterData: true
        })
    }

    override updateView() {
        if (!this.isConnected)
            return
        if (this.model && this.model.value) { // FIXME: use updateView only for Model stuff
            if (this.model instanceof HtmlModel)
                this.label.innerHTML = this.model.value
            else
                this.label.innerText = this.model.value
        } else {
            this.label.innerHTML = this.innerHTML
        }

        if (this.isEnabled()) {
            this.removeAttribute("disabled")
        } else {
            this.setAttribute("disabled", "disabled")
        }
    }
}

Button.define("tx-button", Button)