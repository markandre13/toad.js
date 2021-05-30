
import { expect } from 'chai'
import { AnimationBase } from '@toad/util/animation'

class TestAnimation extends AnimationBase {
    callback!: FrameRequestCallback
    trace: string[] = []

    override prepare() { this.trace.push("prepare()") }
    override firstFrame() { this.trace.push("firstFrame()") }
    override animationFrame(value: number) {this.trace.push(`animationFrame(${value.toFixed(2)})`) }
    override lastFrame() { this.trace.push("lastFrame()") }

    override requestAnimationFrame(callback: FrameRequestCallback): void {
        this.trace.push("requestAnimationFrame()")
        this.callback = callback
    }
    dump() {
        this.trace.forEach( (e, i)=> console.log(`${i}: ${e}`) )
    }
}

describe("toad.js", function () {
    describe("util", function () {
        describe("class AnimationBase", function () {
            it("start() cascades through prepare() -> firstFrame() -> animationFrame(0 to 1) -> lastFrame()", async function () {
                const a = new TestAnimation()
                expect(a.trace.length).to.equal(0)
                
                a.start()
                expect(a.trace.length).to.equal(2)
                expect(a.trace[0]).to.equal("prepare()")
                expect(a.trace[1]).to.equal("requestAnimationFrame()")

                a.callback(1000)
                expect(a.trace.length).to.equal(5)
                expect(a.trace[2]).to.equal("firstFrame()")
                expect(a.trace[3]).to.equal("animationFrame(0.00)")
                expect(a.trace[4]).to.equal("requestAnimationFrame()")

                a.callback(1000 + AnimationBase.animationFrameCount/2)
                expect(a.trace.length).to.equal(7)
                expect(a.trace[5]).to.equal("animationFrame(0.50)")
                expect(a.trace[6]).to.equal("requestAnimationFrame()")

                a.callback(1000 + AnimationBase.animationFrameCount)
                expect(a.trace.length).to.equal(9)
                expect(a.trace[7]).to.equal("animationFrame(1.00)")
                expect(a.trace[8]).to.equal("lastFrame()")
            })

            it("replace(next) fast-forwards the animation to the end and starts animation 'next'", function() {
                const a = new TestAnimation()
                expect(a.trace.length).to.equal(0)
                
                a.start()
                expect(a.trace.length).to.equal(2)
                expect(a.trace[0]).to.equal("prepare()")
                expect(a.trace[1]).to.equal("requestAnimationFrame()")

                a.callback(1000)
                expect(a.trace.length).to.equal(5)
                expect(a.trace[2]).to.equal("firstFrame()")
                expect(a.trace[3]).to.equal("animationFrame(0.00)")
                expect(a.trace[4]).to.equal("requestAnimationFrame()")

                a.callback(1000 + AnimationBase.animationFrameCount * 1/4)
                expect(a.trace.length).to.equal(7)
                expect(a.trace[5]).to.equal("animationFrame(0.15)")
                expect(a.trace[6]).to.equal("requestAnimationFrame()")

                const b = new TestAnimation()
                expect(b.trace.length).to.equal(0)

                a.replace(b)

                expect(a.trace.length).to.equal(9)
                expect(a.trace[7]).to.equal("animationFrame(1.00)")
                expect(a.trace[8]).to.equal("lastFrame()")

                // FIXME: need to check that prepare() is called after lastFrame()
                expect(b.trace.length).to.equal(1)
                expect(b.trace[0]).to.equal("prepare()")

                a.callback(1000 + AnimationBase.animationFrameCount * 3/4)
                expect(a.trace.length).to.equal(9)

                expect(b.trace.length).to.equal(4)
                expect(b.trace[1]).to.equal("firstFrame()")
                expect(b.trace[2]).to.equal("animationFrame(0.00)")
                expect(b.trace[3]).to.equal("requestAnimationFrame()")

                b.callback(1000 + AnimationBase.animationFrameCount * 2/4)
                expect(b.trace.length).to.equal(6)
                expect(b.trace[4]).to.equal("animationFrame(0.15)")
                expect(b.trace[5]).to.equal("requestAnimationFrame()")
            })

            it("stop() called from prepare() will skip the animation", function() {
                const a = new class extends TestAnimation {
                    override prepare() {
                        super.prepare()
                        this.stop()
                    }
                }

                a.start()

                expect(a.trace.length).to.equal(1)
                expect(a.trace[0]).to.equal("prepare()")
            })
        })
    })
})