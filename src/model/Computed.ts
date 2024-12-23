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

import { Signal } from "../Signal"

export class Computed<T> {
    signal = new Signal()
    private _out: () => T
    constructor(block: () => T) {
        this._out = block
        evaluateAndDiscoverDependencies(this.signal, this._out)
    }
    get value(): T {
        produceValue(this.signal)
        return evaluateAndDiscoverDependencies(this.signal, this._out)
    }
}

export class Convert<T> extends Computed<T> {
    private _in: (value: T) => void
    constructor(input: (value: T) => void, output: () => T) {
        super(output)
        this._in = input
    }
    // TODO: needed? i think we always needed both...
    override get value(): T {
        return super.value
    }
    override set value(value: T) {
        this._in(value)
    }
}

/**
 * Create a constraint which will be evaluated any time the models
 * it depends on changes.
 * 
 * called effect(...), autorun(...), ... in other web frameworks
 * 
 * @param fn 
 */
export function constraint(fn: () => void) {
    const signal = new Signal()
    signal.add(fn)
    evaluateAndDiscoverDependencies(signal, fn)
}

let currentObserver: Signal | undefined
let currentTrigger: () => void | undefined

/**
 * Called by a potential observer to execute the action start to observe the models used by the action.
 * 
 * We use https://github.com/tc39/proposal-signals' clever approach to discover
 * dependencies.
 * 
 * TODO: async action?
 * 
 * @param observer signal to be called now and later when observed models change
 * @param action action to execute
 * @returns the action's result
 */
function evaluateAndDiscoverDependencies<T>(observer: Signal, action: () => T) {
    const previous = { observer: currentObserver, trigger: currentTrigger }

    // TODO: use WeakRef
    currentObserver = observer
    currentTrigger = () => observer.emit()

    const result = action()

    currentObserver = previous.observer
    currentTrigger = previous.trigger

    return result
}

/**
 * Called when an observable value is to be retrieved.
 * 
 * When called while Compute, Convert (TBD), Effect (TBD) are running,
 * the model will begin to call Compute, et al. when it changes.
 * 
 * @param signal The model's signal which is going to trigger the observer.
 */
export function produceValue(signal: Signal<any>): void {
    if (!currentObserver) {
        return
    }
    // register the observer, but only once
    if (!signal.has(currentObserver)) {
        signal.add(currentTrigger, currentObserver)
    }
}

export function consumeValue(): void {

}