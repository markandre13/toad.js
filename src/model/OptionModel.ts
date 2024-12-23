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

import { deepEqual } from "../util/deepEqual"
import { ALL, ModelEvent, ModelOptions } from "./Model"
import { OptionModelBase } from "./OptionModelBase"

/**
 * @category Application Model
 */
export class OptionModel<V, E = void, O extends ModelOptions = ModelOptions> extends OptionModelBase<
    V,
    E | ModelEvent,
    O
> {
    protected _mapping!: readonly (readonly [V, string])[]
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
        this.setMapping(mapping)
    }
    setMapping(mapping: readonly (readonly [V, string | number | HTMLElement] | string)[]) {
        if (mapping === this._mapping) {
            return
        }

        let newMapping
        if (mapping[0] instanceof Array) {
            newMapping = mapping as readonly (readonly [V, string])[]
        } else {
            const array: [V, string | number | HTMLElement][] = []
            mapping.forEach((v) => {
                array.push([v as V, `${v}`])
            })
            newMapping = array as readonly (readonly [V, string])[]
        }
        if (this._mapping !== undefined) {
            if (deepEqual(this._mapping, newMapping)) {
                this._mapping = newMapping
                return
            }
        }

        this._mapping = newMapping
        this.signal.emit({ type: ALL })
    }
    forEach(callback: (value: V, label: string | number | HTMLElement, index: number) => void): void {
        this._mapping.forEach(([value, label], index) => {
            callback(value, label, index)
        })
    }
}
