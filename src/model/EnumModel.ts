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
export type EnumType<T> = {
    [id: string]: T | string;
    [nu: number]: string
}

export class EnumModel<V, O extends ModelOptions = ModelOptions> extends OptionModelBase<V, O>
{
    protected enumType: EnumType<V>
    constructor(value: V, enumType: EnumType<V>, options?: O) {
        super(value, options)
        this.enumType = enumType
    }
    forEach(callback: (value: V, key: string | number | HTMLElement, index: number) => void): void {
        let type = "string"
        const entries = Object.entries(this.enumType)
        for (const v0 of entries) {
            if (typeof v0[1] === "object") {
                type = "object"
                break
            }
            if (typeof v0[1] === "number") {
                type = "number"
                break
            }
        }

        let idx = 0
        switch (type) {
            case "object":
                for (const v of entries) {
                    if (typeof v[1] === "object") {
                        callback(v[1] as any, v[1] as any, idx++)
                    }
                }
                break
            case "number":
                for (const v of entries) {
                    if (typeof v[1] === "number") {
                        callback(v[1] as any, v[0], idx++)
                    }
                }
                break
            default:
                for (const v of entries) {
                    if (typeof v[0] === "string") {
                        callback(v[1] as any, v[1] as any, idx++)
                    }
                }
        }
    }
}
