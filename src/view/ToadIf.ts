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
import { ModelView } from "./ModelView"

// <toad-if> requires correct HTML otherwise <toad-if> and it's content might
// be separated by stuff like an </p> inserted automatically by the browser
// so one should use stuff like htmltidy or htmlhint
export class ToadIf extends ModelView<BooleanModel> {
  override updateView() {
    if (this.model) {
      this.style.display = this.model.value ? "" : "none"
    }
  }
}

ToadIf.define("toad-if", ToadIf)
