/*
 *  The TOAD JavaScript/TypeScript GUI Library
 *  Copyright (C) 2018-2025 Mark-André Hopf <mhopf@mark13.org>
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

import { Signal } from "../Signal"
import { evaluateAndDiscoverDependencies, produceValue } from "./Computed"
import { AbstractValueModel, ValueModelOptions } from "./ValueModel"

/**
 * Converter is updated whenever one of it's dependant models changes.
 */
export abstract class Converter<T> extends AbstractValueModel<T, void, ValueModelOptions<T>> {
    constructor(options?: ValueModelOptions<T>) {
        super(options)
        queueMicrotask(() => {
            evaluateAndDiscoverDependencies(this.signal as Signal<void>, () => this.output())
        })
    }
    override get value(): T {
        produceValue(this.signal)
        return evaluateAndDiscoverDependencies(this.signal as Signal<void>, () => this.output())
    }
    override set value(value: T) {
        this.input(value)
    }
    abstract output(): T
    abstract input(value: T): void
}
