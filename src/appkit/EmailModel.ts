/*
 *  The TOAD JavaScript/TypeScript GUI Library
 *  Copyright (C) 2018-2023 Mark-André Hopf <mhopf@mark13.org>
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

import { TextModel } from "./TextModel"
import { isSpecialValue, type SpecialValue } from "./ValueModel"

/**
 * @category Application Model
 */
export class EmailModel extends TextModel {
    override set value(value: string | SpecialValue) {
        if (isSpecialValue(value)) {
            super.value = value
            return
        }
        this.signal.withLock(() => {
            if (this._special === undefined && this._value === value) {
                return
            }
            const email = value.trim()
            super.value = email
            if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
                this.error = `The value is not a valid email address.`
            }
        })
    }
    override get value(): string {
        return super.value
    }
}
