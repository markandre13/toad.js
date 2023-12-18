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
export class OptionModel<V, R = void, O extends ModelOptions = ModelOptions> extends OptionModelBase<V, R, O> {
    _mapping: readonly (readonly [V, string])[]
    /**
     * Examples:
     *
     * Value is a string and options an array of strings:
     * 
     *     const model = new OptionModel("Down", ["Up", "Down", "Left", "Right"])
     * 
     * Value is an enum and options a list of enum to label mappings:
     * 
     *     enum A { UP, DOWN, LEFT, RIGHT }
     *     const model = new OptionModel(A.DOWN, [
     *       [A.UP, "Up"],
     *       [A.DOWN, "Down"],
     *       [A.LEFT, "Left"],
     *       [A.RIGHT, "Right"],
     *     ])
     * 
     * @param value current value
     * @param mapping 
     * @param options 
     */
    constructor(value: V, mapping: readonly (readonly [V, string | number | HTMLElement] | string)[], options?: O) {
        super(value, options)
        if (mapping[0] instanceof Array) {
            this._mapping = mapping as readonly (readonly [V, string])[]
        } else {
            const a: [V, string | number | HTMLElement][] = []
            mapping.forEach((v) => a.push([v as V, `${v}`]))
            this._mapping = a as readonly (readonly [V, string])[]
        }
    }
    forEach(callback: (value: V, label: string | number | HTMLElement, index: number) => void): void {
        this._mapping.forEach(([value, label], index) => {
            callback(value, label, index)
        })
    }
}
