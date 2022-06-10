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

import { NumberModel } from "../model/NumberModel"
import { ModelView, ModelViewProps } from "./ModelView"
import { style as txSlider } from "../style/tx-slider"

export class Slider extends ModelView<NumberModel> {
  input: HTMLInputElement

  constructor(init?: ModelViewProps<NumberModel>) {
    super(init)
    this.input = document.createElement("input") as HTMLInputElement
    this.input.type = "range"
    let view = this
    this.input.oninput = () => { 
        view.updateModel()
    }
    this.classList.add("tx-slider")
    this.attachShadow({mode: 'open'})
    this.attachStyle(txSlider)
    this.shadowRoot!.appendChild(this.input)
  }
  
  override updateModel() {
    if (this.model)
      this.model.value = Number.parseFloat(this.input.value)
  }

  override updateView() {
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

Slider.define("tx-slider", Slider)