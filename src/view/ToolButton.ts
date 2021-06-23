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
import { GenericView } from "./GenericView"

let toolbuttonStyle = document.createElement("style")
toolbuttonStyle.textContent=`
div {
    border: 1px solid #e3dbdb;
    border-radius: 5px;
    background: #e3dbdb;
    width: 32px;
    height: 32px;
    padding: 3px;
}

:host([selected]) div {
    background: #ac9393;
}

:host([disabled]) div {
    opacity: 0.5;
}

:host([disabled]) div img {
    opacity: 0.5;
}

:host([checked][disabled]) div {
}
`

export class ToolButton extends GenericView<OptionModelBase> {
    constructor() {
        super()
        
        let button = document.createElement("div")
        // button.setAttribute("tabindex", "0")
        button.onmousedown = (event) => {
            if (this.hasAttribute("disabled"))
                return
            button.focus()
            event.preventDefault()
            if (this.model !== undefined)
                this.model.stringValue = this.getValue()
        }

        let img = document.createElement("img")
        if (this.hasAttribute("img")) {
            img.src = this.getAttribute("img")!
        }
        button.appendChild(img)

        this.attachShadow({mode: 'open'})
        this.shadowRoot!.appendChild(document.importNode(toolbuttonStyle, true))
        this.shadowRoot!.appendChild(button)
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
    
    updateModel() {
    }
    
    updateView() {
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
window.customElements.define("toad-toolbutton", ToolButton)
