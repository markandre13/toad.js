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

import { Model, ModelOptions } from "./Model"

/**
 * @category Application Model
 * 
 * This class dates back from before adding JSX to toad.js and the stringValue was introduced
 * to support <option value="...">.
 * 
 * All of this has to go away.
 * 
 * What we actually want now is a user defined type for the options and a HTML/JSX fragment
 * to represent it in the UI.
 */
export class OptionModelBase<O extends ModelOptions = ModelOptions> extends Model<string, O> {
  private _stringValue: string

  constructor() {
    super()
    this._stringValue = ""
  }

  set stringValue(v: string) {
    if (this.error === undefined && this._stringValue === v)
      return
    this.error = undefined
    this._stringValue = v
    try {
        this.modified.trigger(v)
    }
    catch(ex) {
        this.error = `${ex}`
        try {
            this.modified.trigger(v)
        }
        catch(ex) {}
    }
  }

  get stringValue() {
    return this._stringValue
  }

  isValidStringValue(stringValue: string): boolean {
    return false
  }
}
