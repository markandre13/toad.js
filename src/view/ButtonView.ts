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

import { HtmlModel } from "../model"
import { ActionView } from "../view"

let buttonStyle = document.createElement("style")
buttonStyle.textContent=`
  button {
    border: none;
    background-color: var(--toad-primary-color, #0052cc);
    color: #ffffff;
    border-radius: 3px;
    font-size: 14px;
    font-weight: bold;
    height: 32px;
    line-height: 32px;
    min-width: 24px;
    text-shadow: none;
    padding: 0 10px;
    margin-right: 4px;
  }
  
  button:hover {
    background-color: #0065ff;
  }
  
  button:hover:active {
    background-color: #0049b0;
  }
  
  button:disabled, button:disabled:active {
    background-color: #888;
  }
`

export class ButtonView extends ActionView {
  button: HTMLButtonElement
  _observer?: MutationObserver
  _timer?: number

  constructor() {
    super()
    this.button = document.createElement("button") as HTMLButtonElement
    this.button.onclick = () => {
      if (this.action)
        this.action.trigger()
    }
    this.button.disabled = true
    
    this.attachShadow({mode: 'open'})
    this.shadowRoot!.appendChild(document.importNode(buttonStyle, true))
    this.shadowRoot!.appendChild(this.button)
  }

  connectedCallback() {
    super.connectedCallback()
    if (this.children.length===0) {
      // Chrome, Opera invoke connectedCallback() before the children are conected
      this._observer = new MutationObserver((record: MutationRecord[], observer: MutationObserver) => {
        if (this._timer !== undefined)
          clearTimeout(this._timer)
        this._timer = window.setTimeout( () => {
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
  }


  updateModel() {
  }

  updateView() {
    if (this.model && this.model.value) { // FIXME: use updateView only for Model stuff
      if (this.model instanceof HtmlModel)
        this.button.innerHTML = this.model.value
      else
        this.button.innerText = this.model.value
    } else {
      this.button.innerHTML = this.innerHTML
    }

    this.button.disabled = !this.isEnabled()
    // FIXME: set "disabled" property of this
  }
}
window.customElements.define("toad-button", ButtonView)
