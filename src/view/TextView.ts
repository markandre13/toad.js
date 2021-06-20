/*
 *  The TOAD JavaScript/TypeScript GUI Library
 *  Copyright (C) 2018 Mark-André Hopf <mhopf@mark13.org>
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { TextModel } from "../model/TextModel"
import { GenericView } from "./GenericView"

let textStyle = document.createElement("style")
textStyle.textContent=`
input {
  font-family: var(--toad-font-family, sans-serif);
  font-size: var(--toad-font-size, 12px);
  border: 1px #ccc solid;
  border-radius: 3px;
  margin: 2px;
  padding: 4px 5px;
}

:host(.embedded) input {
  border: none 0;
  border-radius: 0;
  padding: 0;
  margin: 2px;
  width: 100%;
  background: #fff;
}
`

export class TextView extends GenericView<TextModel> {
  input: HTMLInputElement

  constructor() {
    super()
    this.input = document.createElement("input") as HTMLInputElement
    this.input.oninput = () => { this.updateModel() }
    this.attachShadow({mode: 'open'})
    this.shadowRoot!.appendChild(document.importNode(textStyle, true))
    this.shadowRoot!.appendChild(this.input)
  }
  
  override focus() {
    this.input.focus()
  }
  override blur() {
    this.input.blur()
  }
  
  static get observedAttributes() { return ['value'] }
  
  attributeChangedCallback(name: string, oldValue?: string, newValue?: string) {
    switch(name) {
      case "value":
        if (this.model && newValue !== undefined) {
          this.model.value = newValue
        }
        break
    }
  }
  
  updateModel() {
    if (this.model) {
      this.model.value = this.input.value
    }
    this.setAttribute("value", this.input.value)
  }

  updateView() {
    if (this.model && this.input.value != this.model.value) {
      this.input.value = this.model.value
    }
    this.setAttribute("value", this.input.value)
  }
  
  get value() {
    return this.input.value
  }
  set value(value: string) {
    this.input.value = value
    this.updateModel() // FIXME: do we need this?
  }
}
window.customElements.define("toad-text", TextView)
