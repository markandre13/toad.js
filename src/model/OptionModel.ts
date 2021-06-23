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

import { OptionModelBase } from "./OptionModelBase"

export class OptionModel<T> extends OptionModelBase {
  private _map: Map<string, T>

  constructor() {
    super()
    this._map = new Map<string, T>()
  }

  add(id: string, value: T) {
    this._map.set(id, value)
  }

  override isValidStringValue(stringValue: string): boolean {
    return this._map.has(stringValue)
  }

  get value(): T {
    return this._map.get(this.stringValue)!
  }

}
