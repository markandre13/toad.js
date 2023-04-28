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

/**
 * @category Application Model
 */
export class EnumModel<T extends Object> extends OptionModelBase {

    protected enumClass: any
    protected _value!: T

    // TODO: find a way to replace 'any' with something like 'typeof T'
    constructor(enumClass: any, value?: T) {
        super()
        this.enumClass = enumClass
        if (value !== undefined) {
            this._value = value
        }
    }

    get value() {
        return this._value
    }

    set value(value: T) {
        this.setValue(value)
    }

    override get stringValue() {
        return this.toString()
    }

    override set stringValue(value: string) {
        this.fromString(value)
    }

    getValue(): T {
        return this._value
    }

    setValue(value: T) {
        if (this._value === value) {
            return
        }
        this._value = value
        this.modified.trigger()
    }

    override toString(): string {
        return this.enumClass[this._value]
    }

    fromString(value: string) {
        const x = this.enumClass[value]
        if (x === undefined || typeof this.enumClass[x] !== "string") {
            let allValidValues = ""
            Object.keys(this.enumClass).forEach(
                key => {
                    const validValue = this.enumClass[key]
                    if (typeof validValue === "string") {
                        if (allValidValues.length !== 0) {
                            allValidValues = `${allValidValues}, ${validValue}`
                        } else {
                            allValidValues = validValue
                        }
                    }
                })
            console.trace(`EnumModel<T>.fromString('${value}'): invalid value, must be one of ${allValidValues}`)
            return
        }
        if (this._value === x) {
            return
        }
        this._value = x
        this.modified.trigger()
    }

    override isValidStringValue(value: string): boolean {
        const x = this.enumClass[value]
        return x !== undefined && typeof this.enumClass[x] === "string"
    }
}
