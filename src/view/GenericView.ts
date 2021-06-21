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

import { Model } from "../model/Model"
import { View } from "./View"

export abstract class GenericView<T extends Model> extends View {
  model?: T

  constructor() {
    super()
  }

  abstract updateModel(): void
  abstract updateView(): void

  setModel(model?: T): void {
    if (model === this.model)
      return

    let view = this

    if (this.model)
      this.model.modified.remove(view)

    if (model)
      model.modified.add(() => view.updateView(), view)

    this.model = model
    this.updateView()
  }
}
