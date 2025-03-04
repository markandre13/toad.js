/*
 *  The TOAD JavaScript/TypeScript GUI Library
 *  Copyright (C) 2018-2021, 2024 Mark-André Hopf <mhopf@mark13.org>
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

/**
 * @category Observer Pattern
 */
export class SignalLink {
    callback: (data?: any) => void
    id?: any
    constructor(callback: (data?: any) => void, id?: any) {
        this.callback = callback
        this.id = id
    }
}

/**
 * The backbone of toad.js' Observer Pattern implementation.
 *
 * [Usage Example](https://github.com/markandre13/toad.js/blob/master/test/Signal.spec.ts)
 *
 * @category Observer Pattern
 */
export class Signal<T = void> {
    protected locked: boolean = false
    protected busy: boolean = false
    protected triggered?: any
    callbacks?: Array<SignalLink>

    add(callback: (data: T) => void): void
    add(callback: (data: T) => void, id: any): void
    add(callback: (data: T) => void, id?: any) {
        if (!this.callbacks) {
            this.callbacks = new Array<SignalLink>()
        }
        this.callbacks.push(new SignalLink(callback, id))
    }
    has(id: any): boolean {
        if (!this.callbacks) {
            return false
        }
        if (id instanceof WeakRef) {
            id = id.deref()
        }
        for (let callback of this.callbacks) {
            if (id !== undefined && callback.id instanceof WeakRef && callback.id.deref() === id) {
                return true
            }
            if (callback.id === id) {
                return true
            }
        }
        return false
    }

    remove(id: any) {
        if (!this.callbacks) {
            return
        }
        for (let i = this.callbacks.length - 1; i >= 0; --i) {
            if (this.callbacks[i].id === id) {
                this.callbacks.splice(i, 1)
            }
        }
    }

    count(): number {
        if (!this.callbacks) {
            return 0
        }
        return this.callbacks.length
    }

    lock(): void {
        this.locked = true
    }

    unlock(): void {
        this.locked = false
        if (this.triggered) {
            let data = this.triggered.data
            this.triggered = undefined
            this.emit(data)
        }
    }

    withLock<R>(closure: () => R) {
        this.lock()
        const r = closure()
        this.unlock()
        return r
    }

    async withLockAsync<R>(closure: () => Promise<R>) {
        this.lock()
        try {
            const r = await closure()
            this.unlock()
            return r
        } catch (e) {
            this.unlock()
            throw e
        }
    }

    emit(data: T): void {
        if (this.busy) {
            return
        }
        this.busy = true
        if (this.locked) {
            this.triggered = { data: data }
            this.busy = false
            return
        }
        if (!this.callbacks) {
            this.busy = false
            return
        }
        let error: any
        for (let i = 0; i < this.callbacks.length; ++i) {
            const callback = this.callbacks[i]
            if (callback.id instanceof WeakRef && callback.id.deref() === undefined) {
                this.callbacks.splice(i, 1)
                --i
                continue
            }
            try {
                callback.callback(data)
            } catch (e) {
                error = e
            }
        }
        this.busy = false
        if (error !== undefined) {
            throw error
        }
    }
}
