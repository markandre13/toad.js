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
export class OptionModel<T> extends OptionModelBase {
    private stringToType = new Map<string, T>()
    private typeToString = new Map<T, string>()

    add(id: string, value: T) {
        this.stringToType.set(id, value)
        this.typeToString.set(value, id)
    }

    override isValidStringValue(stringValue: string): boolean {
        return this.stringToType.has(stringValue)
    }

    get value(): T {
        return this.stringToType.get(this.stringValue)!
    }

    set value(value: T) {
        if (!this.typeToString.has(value)) {
            this.add(`${value}`, value)
            this.stringValue = `${value}`
        } else {
            this.stringValue = this.typeToString.get(value)!
        }
    }
}
