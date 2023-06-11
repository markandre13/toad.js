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

import { Model, ModelOptions } from "./Model"

/**
 * @category Application Model
 * 
 * a better name would be ValueModel
 */
export class GenericModel<T, O extends ModelOptions = ModelOptions> extends Model<T, O> {
    protected _value: T

    constructor(value: T, options?: O) {
        super(options)
        this._value = value
    }

    set value(value:  T) {
        if (this._value == value)
            return
        this._value = value
        this.modified.trigger(this._value)
    }

    get value(): T {
        return this._value
    }
}
