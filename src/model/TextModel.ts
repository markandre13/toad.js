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

export type StringFunction = () => string

/**
 * @category Application Model
 */
export class TextModel extends Model {
    protected _value!: string | StringFunction

    constructor(value: string = "", options?: ModelOptions) {
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
    set promise(promise: () => string) {
        this._value = promise
        this.modified.trigger()
    }

    get promise(): StringFunction {
        if (typeof this._value === "string") {
            const value = this._value
            return () => {
                return value
            }
        }
        return this._value
    }

    set value(value: string) {
        if (this._value === value) {
            return
        }
        if (typeof value !== "string") {
            console.trace(`TextModel.set value(value: string): ${typeof value} is not type string`)
            return
        }
        this.modified.withLock(() => {
            this.error = undefined
            this._value = value
            this.modified.trigger()   
        })
    }

    get value(): string {
        switch (typeof this._value) {
            case "number": // ????
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
