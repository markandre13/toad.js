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

export class OptionModelBase extends Model {
  private _stringValue: string

  constructor() {
    super()
    this._stringValue = ""
  }

  set stringValue(v: string) {
    if (this._stringValue === v)
      return
    this._stringValue = v
    this.modified.trigger()
  }

  get stringValue() {
    return this._stringValue
  }

  isValidStringValue(stringValue: string): boolean {
    return false
  }
}
