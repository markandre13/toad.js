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

import { Model } from "./Model"

/**
 * @category Application Model
 */
export class TextModel extends Model {
  protected _value: string | Function

  constructor(value: string = "") {
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
    if (this._value === value)
      return
    if (typeof value !== "string") {
      console.trace(`TextModel.set value(value: string): ${typeof value} is not type string`)
      return
    }
    this._value = value
    this.modified.trigger()
  }

  get value(): string {
    switch(typeof this._value) {
      case "number":
      case "string":
        this._value = `${this._value}`
        break
      case "function":
        this._value = this._value()
        break
    }
    return this._value as string
  }
}
