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

import { BooleanModel } from "../model/BooleanModel"
import { GenericView } from "./GenericView"

/* Safari & Chrome can do this and we want this */
// declare global {
//   interface SVGElement extends Element {}
// }

/*
the checkbox can be customized like this (color names are not final yet)

      :root {
        --toad-neutral-color: #000;
        --toad-dark-color: #000;
        --toad-light-color: #fff;
        --toad-primary-color: #000;
      }

      toad-checkbox {
        --border-color: #000;
        --background-color: none;
        --marker-color: none;
        --checked-border-color: #000;
        --checked-background-color: none;
        --checked-marker-color: #000;
      }
*/


let checkboxStyle = document.createElement("style")
checkboxStyle.textContent=`
svg {
  width: 12px;
  height: 12px;
  vertical-align: middle;
  margin: 3px;              /* space for the outline */
  background: none;
}
svg:focus {
  outline-offset: -2px;     /* bring outline in touch with the svg */
  background: #9eccfb;      /* the rectangle is rounded, fill the corners */
  outline-color: 9eccfb;    /* outline shall be the same color used to fill the corners */
}
@media(pointer: coarse) { /* works on Chrome but iOS is never coarse :( */
  svg {
    width: 18px;
    height: 18px;
  }
}
svg rect {
  stroke: var(--border-color, var(--toad-neutral-color, #aaa));
  fill: var(--background-color, #fff);
  stroke-width: 1px;
}
svg path {
  stroke: var(--marker-color, none);
  fill: none;
  stroke-width: 2px;
}
:host([checked]) svg rect {
  stroke: var(--checked-border-color, var(--toad-primary-color, #0052cc));
  fill: var(--checked-background-color, var(--toad-primary-color, #0052cc));
}
:host([checked]) svg path {
  stroke: var(--checked-marker-color, var(--toad-light-color, #fff));
}
:host([disabled]) svg rect {
  stroke: var(--checked-border-color, var(--toad-primary-color, #bdbdbd));
  fill: var(--checked-background-color, var(--toad-primary-color, #fff));
}
:host([disabled]) svg path {
  stroke: var(--checked-marker-color, var(--toad-light-color, none));
}
:host([checked][disabled]) svg path {
  stroke: var(--checked-marker-color, var(--toad-light-color, #bdbdbd));
}`

export class CheckboxView extends GenericView<BooleanModel> {
  constructor() {
    super()
    
    let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
    svg.setAttributeNS("", "viewBox", "0 0 18 18")

    let rect = document.createElementNS("http://www.w3.org/2000/svg", "rect")
    rect.setAttributeNS("", "x", "1")
    rect.setAttributeNS("", "y", "1")
    rect.setAttributeNS("", "width", "16")
    rect.setAttributeNS("", "height", "16")
    rect.setAttributeNS("", "rx", "3")
    rect.setAttributeNS("", "ry", "3")
    
    let checkmark = document.createElementNS("http://www.w3.org/2000/svg", "path")
    checkmark.setAttributeNS("", "d", "M4 9.5 L 7.5 13 L 14.5 4")

    svg.onclick = () => {
      this.toggle()
    }
    svg.setAttributeNS("", "tabindex", "0")
    svg.addEventListener("keydown", (event: Event) => {
      if ((event as KeyboardEvent).key === " ") {
        this.toggle()
      }
    })
    svg.onmousedown = (event) => {
      svg.focus()
      event.preventDefault()
    }
    
    svg.appendChild(rect)
    svg.appendChild(checkmark)
    
    this.attachShadow({mode: 'open'})
    this.shadowRoot!.appendChild(document.importNode(checkboxStyle, true))
    this.shadowRoot!.appendChild(svg)
  }

  override setModel(model?: BooleanModel) {
    if (model !== undefined && !(model instanceof BooleanModel)) {
      throw Error(`CheckBoxView.setModel(): model is not of type BooleanModel`)
    }
    super.setModel(model)
  }
  
  static get observedAttributes() {return ['checked'] }
  
  attributeChangedCallback(name: string, oldValue?: string, newValue?: string) {
    switch(name) {
      case "checked":
        this.updateModel()
        break
    }
  }
  
  toggle() {
    if (this.hasAttribute("disabled"))
      return
    if (this.hasAttribute("checked"))
      this.removeAttribute("checked")
    else
      this.setAttribute("checked", "")
    this.updateModel()
  }

  updateModel() {
    if (this.model) {
      this.model.value = this.hasAttribute("checked")
    }
  }

  updateView() {
    if (!this.model) {
      this.setAttribute("disabled", "")
      this.removeAttribute("checked")
      return
    }
    this.removeAttribute("disabled")

    if (this.model.value)
      this.setAttribute("checked", "")
    else
      this.removeAttribute("checked")
  }
}
window.customElements.define("toad-checkbox", CheckboxView)
