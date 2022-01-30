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

let toolbuttonStyle = document.createElement("style")
toolbuttonStyle.textContent=`
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

:host([checked][disabled]) {
}
`

export interface ToolButtonProps extends ModelViewProps<OptionModelBase> {
    value: string,
    img: string,
    disabled?: boolean
}

export class ToolButton extends ModelView<OptionModelBase> {
    constructor(init?: ToolButtonProps) {
        super(init)

        // FIXME: this is what lit could take care of, but what we might not need anyway in toad.js
        if (!init) {
            init = {
                value: this.getAttribute("value")!,
                img: this.getAttribute("img")!,
                disabled: this.hasAttribute("disabled")
            }
        } else {
            this.setAttribute("value", init.value)
            this.setAttribute("img", init.img)
            if (init.disabled === true)
                this.setAttribute("disabled", "disabled")
        }

        // if (init.model)
        //     this.setModel(init.model)
        
        // let button = document.createElement("div")
        // button.setAttribute("tabindex", "0")
        this.onmousedown = (event) => {
            if (this.hasAttribute("disabled")) {
                return
            }
            this.focus()
            event.preventDefault()
            if (this.model !== undefined) {
                this.model.stringValue = this.getValue()
            }
        }

        let img = document.createElement("img")
        img.src = init.img
        // button.appendChild(img)

        this.attachShadow({mode: 'open'})
        this.shadowRoot!.appendChild(document.importNode(toolbuttonStyle, true))
        this.shadowRoot!.appendChild(img) // FIXME: use <slot> when no image was provided
    }

    getValue(): string {
        let value = this.getAttribute("value")
        if (value === null)
            throw Error("no value")
        return value
    }

    override connectedCallback() {
        super.connectedCallback()
        if (this.model === undefined)
            this.setAttribute("disabled", "")
    }
   
    override updateView() {
        if (this.model === undefined) {
            this.setAttribute("disabled", "")
            this.removeAttribute("selected")
            return
        }
        let value = this.getValue()
        if (this.model.isValidStringValue(value)) {
            this.removeAttribute("disabled")
        } else {
            this.setAttribute("disabled", "")
        }
        if (this.model.stringValue === value) {
            this.setAttribute("selected", "")
        } else {
            this.removeAttribute("selected")
        }
    }
}

ToolButton.define("toad-toolbutton", ToolButton)