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

import { ModelOptions } from "./Model"
import { OptionModelBase } from "./OptionModelBase"

/**
 * @category Application Model
 */
export class OptionModel<V, O extends ModelOptions = ModelOptions> extends OptionModelBase<V, O> {
    _mapping: Map<V, string>
    constructor(value: V, mapping: readonly (readonly [V, string] | string)[], options?: O) {
        super(value, options)
        if (mapping[0] instanceof Array) {
            this._mapping = new Map(mapping as [])
        } else {
            this._mapping = new Map()
            mapping.forEach( v => this._mapping.set(v as V, `${v}`))
        }
    }
    forEach(callback: (value: V, key: string, label: any, index: number) => void): void {
        let idx = 0
        this._mapping.forEach((label, value) => {
            callback(value, label, this.asHtml(label), idx++) // FIXME: there is a reason Map has no index!!!
        })
    }
}
