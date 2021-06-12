import bind from 'bind-decorator'

// TODO: look into cancelAnimationFrame during refactoring
export class AnimationBase {
    static animationFrameCount = 468

    start() {
        this.prepare()
        if (this._stop === true)
            return
        this.requestAnimationFrame(this._firstFrame)
    }

    stop() {
        this._stop = true
        if (this.animator?.current === this)
            this.animator.current = undefined
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

    @bind protected _firstFrame(time: number) {
        this.startTime = time
        this.firstFrame()
        // if (this._stop)
        //     return
        this.animationFrame(0)
        this.requestAnimationFrame(this._animationFrame)
    }

    @bind protected _animationFrame(time: number) {
        if (this.next) {
            this.next._firstFrame(time)
            return
        }

        let elapsed = AnimationBase.animationFrameCount > 0 ? (time - this.startTime) / AnimationBase.animationFrameCount : 1

        elapsed = elapsed > 1 ? 1 : elapsed

        const value = this.ease(elapsed)

        this.animationFrame(value)

        if (value < 1.0) {
            this.requestAnimationFrame(this._animationFrame.bind(this))
        } else {
            this.lastFrame()
            if (this.animator?.current === this)
                this.animator.current = undefined
        }
    }

    protected ease(k: number): number {
        return 0.5 * (1 - Math.cos(Math.PI * k))
    }
}

// FIXME: no tests
export class Animator {
    current?: AnimationBase
    run(animation: AnimationBase) {
        const current = this.current
        this.current = animation
        animation.animator = this
        if (current) {
            current.animator = undefined
            current.replace(animation)
        } else {
            animation.start()
        }
    }
}