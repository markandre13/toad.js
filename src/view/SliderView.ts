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

import { NumberModel } from "../model/NumberModel"
import { GenericView } from "./GenericView"

export class SliderView extends GenericView<NumberModel> {
  input: HTMLInputElement

  constructor() {
    super()
    this.input = document.createElement("input") as HTMLInputElement
    this.input.type = "range"
    let view = this
    this.input.oninput = () => { view.updateModel() }
    this.attachShadow({mode: 'open'})
        .appendChild(this.input)
  }
  
  updateModel() {
    if (this.model)
      this.model.value = Number.parseFloat(this.input.value)
  }

  updateView() {
    if (!this.model)
      return
    if (this.model.step === undefined && this.model.min !== undefined && this.model.max !== undefined)
      this.input.step = `${(this.model.max - this.model.min)/100}`
    else
      this.input.step = String(this.model.step)
    this.input.min = String(this.model.min)
    this.input.max = String(this.model.max)
    this.input.value = String(this.model.value)
  }
}
window.customElements.define("toad-slider", SliderView)
