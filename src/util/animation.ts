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

// TODO: look into cancelAnimationFrame during refactoring
export class AnimationBase {
    constructor() {
        this._firstFrame = this._firstFrame.bind(this)
        this._animationFrame = this._animationFrame.bind(this)
    }

    static animationFrameCount = 468

    start() {
        this.prepare()
        if (this._stop === true)
            return
        this.requestAnimationFrame(this._firstFrame)
    }

    stop() {
        this._stop = true
        if (this.animator?.current === this) {
            this.animator.clearCurrent()
        }
    }

    replace(animation: AnimationBase) {
        this.next = animation
        this.animationFrame(1)
        this.lastFrame()
        animation.prepare()
    }

    prepare() { }
    firstFrame() { }
    animationFrame(value: number) { }
    lastFrame() { }

    protected _stop = false
    protected startTime!: number
    protected next?: AnimationBase
    animator?: Animator

    protected requestAnimationFrame(callback: FrameRequestCallback): void {
        window.requestAnimationFrame(callback)
    }

    protected _firstFrame(time: number) {
        this.startTime = time
        this.firstFrame()
        if (this._stop)
            return
        this.animationFrame(0)
        this.requestAnimationFrame(this._animationFrame)
    }

    protected _animationFrame(time: number) {
        if (this.next) {
            this.next._firstFrame(time)
            return
        }

        let elapsed = AnimationBase.animationFrameCount > 0 ? (time - this.startTime) / AnimationBase.animationFrameCount : 1

        elapsed = elapsed > 1 ? 1 : elapsed

        const value = this.ease(elapsed)

        this.animationFrame(value)
        if (this._stop) {
            return
        }

        if (value < 1.0) {
            this.requestAnimationFrame(this._animationFrame.bind(this))
        } else {
            this.lastFrame()
            if (this.animator && this.animator._current === this) {
                this.animator.clearCurrent()
            }
        }
    }

    protected ease(k: number): number {
        return 0.5 * (1 - Math.cos(Math.PI * k))
    }
}

// TODO: get rid of AnimationBase by merging it into Animator
export interface Animation {
    prepare(): void
    firstFrame(): void
    animationFrame(value: number): void
    lastFrame(): void
}

class AnimationWrapper extends AnimationBase {
    animation: Animation
    constructor(animation: Animation) {
        super()
        this.animation = animation
    }

    override prepare() {
        this.animation.prepare()
    }
    override firstFrame() { 
        this.animation.firstFrame()
    }
    override animationFrame(value: number) {
        this.animation.animationFrame(value)
    }
    override lastFrame() {
        this.animation.lastFrame()
    }
}


// FIXME: no tests
export class Animator {
    static halt = false
    _current?: AnimationBase
    get current(): Animation | undefined {
        if (this._current === undefined) {
            return undefined
        }
        if (this._current instanceof AnimationWrapper) {
            return this._current.animation
        }
        return this._current
    }
    clearCurrent() {
        this._current = undefined
    }
    run(animation: AnimationBase | Animation) {
        let animationBase: AnimationBase
        if (!(animation instanceof AnimationBase)) {
            animationBase = new AnimationWrapper(animation)
        } else {
            animationBase = animation
        }
        const previousAnimation = this._current
        this._current = animationBase
        animationBase.animator = this
        if (previousAnimation) {
            previousAnimation.animator = undefined
            previousAnimation.replace(animationBase)
        } else {
            if (Animator.halt) {
                return
            }
            animationBase.start()
        }
    }
}