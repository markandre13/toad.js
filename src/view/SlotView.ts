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

import { HtmlModel } from "../model/HtmlModel"
import { TextModel } from "../model/TextModel"
import { GenericView } from "./GenericView"

export class SlotView extends GenericView<TextModel> {
  constructor() { super() }
  updateModel() { }
  updateView() {
    if (!this.model)
      return

    let value = this.model.value === undefined ? "" : this.model.value
    if (this.model instanceof HtmlModel)
      this.innerHTML = value

    else
      this.innerText = value
  }
}
window.customElements.define("toad-slot", SlotView)