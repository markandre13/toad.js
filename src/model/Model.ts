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

import { Signal } from "../Signal"

export type InferModelParameter<M> = M extends Model<infer T> ? T : never

export abstract class Model<T = void> {
  modified: Signal<T>
  _enabled = true

  constructor() {
    this.modified = new Signal<T>()
  }

  set enabled(enabled: boolean) {
    if (this._enabled == enabled)
      return
    this._enabled = enabled
    this.modified.trigger(undefined as any)
  }
  
  get enabled(): boolean {
    return this._enabled
  }
}
