/*
 *  The TOAD JavaScript/TypeScript GUI Library
 *  Copyright (C) 2018-2024 Mark-André Hopf <mhopf@mark13.org>
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

import { Model, ModelOptions, ModelEvent } from "./Model"
import { produceValue } from "./Computed"

export const VALUE = Symbol("VALUE")
export const DEFAULT_VALUE = Symbol("DEFAULT_VALUE")
export type ValueEvent = { type: typeof VALUE }
export type DefaultValueEvent = { type: typeof DEFAULT_VALUE }
export type ValueModelEvent = ModelEvent | ValueEvent | DefaultValueEvent

export interface ValueModelOptions<V> extends ModelOptions {
    /**
     * a default value
     *
     * might be used give an indication when number equals the default value,
     * or to reset the value to the default value, e.g. with a double click
     */
    default?: V

    /**
     * persist value in local storage
     * 
     * when set, the model is persisted in local storage during browser sessions
     */
    local?: string
}

/**
 * @category Application Model
 *
 */
export abstract class AbstractValueModel<V, E = void, O extends ValueModelOptions<V> = ValueModelOptions<V>>
    extends Model<ValueModelEvent | E, O> {

    abstract set value(value: V)
    abstract get value(): V

    set default(aDefault: V | undefined) {
        if (this.options?.default === aDefault) return
        if (this.options === undefined) {
            this.options = {}
        }
        this.options.default = aDefault
        this.signal.emit({ type: DEFAULT_VALUE })
    }
    get default(): V | undefined {
        return this.options?.default
    }

    resetToDefault() {
        const d = this.default
        if (d !== undefined) {
            this.value = d
        }
    }
}

/**
 * @category Application Model
 *
 */
export class ValueModel<V, E = void, O extends ValueModelOptions<V> = ValueModelOptions<V>>
    extends AbstractValueModel<V, E, O> {
    protected _value: V

    constructor(value: V, options?: O) {
        super(options)
        this._value = value
        this.setFromLocalStorage()
    }

    protected setFromLocalStorage() {
        if (this.options?.local === undefined) {
            return
        }
        const name = this.options.local
        const value = localStorage.getItem(this.options.local)
        if (value !== null) {
            try {
                this._value = JSON.parse(value)
                return
            } catch (error) {
                console.log(`ValueModel.constructor(): failed to restore "${name}" = "${value}" from local`)
            }
        } else {
            localStorage.setItem(name, JSON.stringify(this._value))
        }
    }
    protected persistToLocalStorage() {
        if (this.options?.local === undefined) {
            return
        }
        try {
            const name = this.options.local
            const value = JSON.stringify(this._value)
            // console.log(`ValueModel.set value(): store "${name}" = "${value}" to local`)
            localStorage.setItem(name, value)
        } catch (e) { }
    }

    override set value(value: V) {
        if (this._value === value) return
        this._value = value
        this.persistToLocalStorage()
        this.signal.emit({ type: VALUE })
    }
    override get value(): V {
        produceValue(this.signal)
        return this._value
    }
}
