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

import { HtmlModel } from "../model/HtmlModel"
import { ActionView, ActionViewProps } from "./ActionView"

import { button, span } from "../util/lsx"

// let buttonStyle = document.createElement("style")
// buttonStyle.textContent=`
//   button {
//     border: none;
//     background-color: var(--toad-primary-color, #0052cc);
//     color: #ffffff;
//     border-radius: 3px;
//     font-size: 14px;
//     font-weight: bold;
//     height: 32px;
//     line-height: 32px;
//     min-width: 24px;
//     text-shadow: none;
//     padding: 0 10px;
//     margin-right: 4px;
//   }
  
//   button:hover {
//     background-color: #0065ff;
//   }
  
//   button:hover:active {
//     background-color: #0049b0;
//   }
  
//   button:disabled, button:disabled:active {
//     background-color: #888;
//   }
// `

export class Button extends ActionView {
  button: HTMLButtonElement
  label: HTMLSpanElement
  _observer?: MutationObserver
  _timer?: number

  constructor(init?: ActionViewProps) {
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
    this.button.disabled = true
    
    this.attachShadow({mode: 'open'})
    this.attachStyle("button")
    this.shadowRoot!.appendChild(this.button)
  }

  override connectedCallback() {
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

    this.button.disabled = !this.isEnabled()
    // FIXME: set "disabled" property of this
  }
}

Button.define("toad-button", Button)