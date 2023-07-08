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

import { Model } from "./Model"
import { Signal } from "../Signal"

/**
 * @category Application Model
 */
export class Action extends Model {
    signal = new Signal()

    constructor(callback: () => void) {
        super()
        this.signal.add(callback)
    }

    set value(_: any) {
        throw Error("Action.value can not be assigned a value")
    }

    get value(): any {
        throw Error("Action.value can not return a value")
    }

    trigger(data?: any): void {
        if (!this.enabled) {
            return
        }
        this.signal.trigger(data)
    }
}
