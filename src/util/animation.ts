import bind from 'bind-decorator'

export class AnimationBase {
    static animationFrameCount = 468

    start() {
        this.prepare()
        this.requestAnimationFrame(this._firstFrame)
    }

    replace(animation: AnimationBase) { 
        animation.prepare()
        this.next = animation
    }

    prepare() { }
    firstFrame() { }
    animationFrame(value: number) { }
    lastFrame() { }

    protected startTime!: number
    protected next?: AnimationBase

    protected requestAnimationFrame(callback: FrameRequestCallback): void {
        window.requestAnimationFrame(callback)
    }

    @bind protected _firstFrame(time: number) {
        this.startTime = time
        this.firstFrame()
        this.animationFrame(0)
        this.requestAnimationFrame(this._animationFrame)
    }

    @bind protected _animationFrame(time: number) {
        if (this.next) {
            this.animationFrame(1)
            this.lastFrame()
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
        }
    }

    protected ease(k: number): number {
        return 0.5 * (1 - Math.cos(Math.PI * k))
    }
}