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

import { Model } from "./Model"

export class TextModel extends Model {
  _value: string | Function

  constructor(value: string) {
    super()
    this._value = value
  }

  set promise(promise: Function) {
    this._value = promise
    this.modified.trigger()
  }

  get promise(): Function {
    if (typeof this._value === "string") {
      return () => {
        return this._value
      }
    }
    return this._value
  }

  set value(value: string) {
    if (this._value == value)
      return
    this._value = value
    this.modified.trigger()
  }

  get value(): string {
    if (typeof this._value === "number") {
      this._value = String(this._value)
    }
    else if (typeof this._value !== "string") {
      this._value = this._value() as string
    }
    return this._value
  }
}
