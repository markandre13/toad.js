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

import { OptionModelBase } from "../model/OptionModelBase"
import { ModelView, ModelViewProps } from "./ModelView"

import { css } from 'src/util/lsx'

export const toolbuttonStyle = new CSSStyleSheet()
toolbuttonStyle.replaceSync(css`
:host {
    display: inline-block;
    overflow: hidden;
    box-sizing: border-box;
    border: 1px solid #e3dbdb;
    border-radius: 3px;
    background: #e3dbdb;
    width: 32px;
    height: 32px;
    margin: 0;
    padding: 0;
}

:host([selected]) {
    background: #ac9393;
}

:host([disabled]) {
    opacity: 0.5;
}

:host([disabled]) img {
    opacity: 0.5;
}
`)

export interface ToolButtonProps<V> extends ModelViewProps<OptionModelBase<V>> {
    value: V,
    img: string,
}

/**
 * @category View
 */
export class ToolButton<V> extends ModelView<OptionModelBase<V>> {
    protected value?: V
    constructor(init?: ToolButtonProps<V>) {
        super(init)

        // FIXME: this is what lit could take care of, but what we might not need anyway in toad.js
        if (!init) {
            init = {
                value: this.getAttribute("value")! as any,
                img: this.getAttribute("img")!,
            }
        } else {
            this.setAttribute("value", `${init.value}`)
            this.setAttribute("img", init.img)
        }

        this.value = init?.value

        this.onmousedown = (event) => {
            if (this.hasAttribute("disabled")) {
                return
            }
            this.focus()
            event.preventDefault()
            if (this.model !== undefined) {
                // throw Error("yikes")
                this.model.value = this.value!
            }
        }

        let img = document.createElement("img")
        img.src = init.img
        // button.appendChild(img)

        this.attachShadow({mode: 'open', delegatesFocus: true})
        this.shadowRoot!.adoptedStyleSheets = [toolbuttonStyle]
        this.shadowRoot!.appendChild(img) // FIXME: use <slot> when no image was provided
    }

    override connectedCallback() {
        super.connectedCallback()
        if (this.model === undefined) {
            this.setAttribute("disabled", "")
        }
    }
   
    override updateView() {
        if (this.model === undefined) {
            this.setAttribute("disabled", "")
            this.removeAttribute("selected")
            return
        }

        if (!this.model.enabled || !this.model.isEnabledOf(this.value!)) {
            this.removeAttribute("disabled")
        } else {
            this.setAttribute("disabled", "")
        }

        if (this.model.value === this.value) {
            this.setAttribute("selected", "")
        } else {
            this.removeAttribute("selected")
        }
    }
}

ToolButton.define("tx-toolbutton", ToolButton)
