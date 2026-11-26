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

import { produceValue } from "../reactive/Computed"
import { AbstractValueModel, isSpecialValue, VALUE, type SpecialValue, type ValueModelOptions } from "./ValueModel"

export type StringFunction = () => string

/**
 * @category Application Model
 */
export class TextModel extends AbstractValueModel<string, void, ValueModelOptions<string>> {
    protected override _value!: string | SpecialValue | undefined
    private _promise?: StringFunction

    constructor(value: string | SpecialValue = "", options?: ValueModelOptions<string>) {
        super(options)
        this.value = value
    }

    /**
     * alternative to set value(string): in some cases is might be expensive
     * to copy the value from it's source into the model everytime a change is
     * made.
     * 
     * hence set promise(...) allows to set a value and trigger a change event
     * with the actual value only retrieved when needed.
     */
    set promise(promise: StringFunction) {
        this._promise = promise
        this._value = undefined
        this.signal.emit({type: VALUE})
    }

    get promise(): StringFunction {
        if (this._promise !== undefined) {
            return this._promise
        }
        const value = this._value
        return () => {
            return value as string
        }
    }

    override set value(value: string | SpecialValue) {
        if (isSpecialValue(value)) {
            this._promise = undefined
            this.setSpecialValue(value)
            return
        }
        if (typeof value !== "string") {
            console.trace(`TextModel.set value(value: string): ${typeof value} is not type string`)
            return
        }
        this._promise = undefined
        if (this._value === value) {
            return
        }
        this.signal.withLock(() => {
            this.error = undefined
            this._value = value
            this.signal.emit({type:VALUE})   
        })
    }

    override get value(): string {
        produceValue(this.signal)
        if (this.hasSpecialValue()) {
            return undefined as unknown as string
        }
        if (this._value === undefined) {
            this._value = this._promise!()
        }
        return this._value as string
    }
}
