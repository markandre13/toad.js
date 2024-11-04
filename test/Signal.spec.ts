import { expect } from 'chai'
import { Signal } from "@toad/Signal"

describe("signal", function () {
    describe("add(...)", function () {
        it("adds observers", function () {
            const signal = new Signal()
            expect(signal.count()).to.equal(0)
            signal.add(() => { })
            expect(signal.count()).to.equal(1)
            signal.add(() => { })
            expect(signal.count()).to.equal(2)
        })
    })
    describe("trigger(...)", function () {
        it("trigger() calls observers", function () {
            const signal = new Signal()
            let counter = 9
            signal.add(() => ++counter)
            expect(counter).to.equal(9)

            signal.trigger()

            expect(counter).to.equal(10)
        })
        it("trigger(arg: T) calls observers with the provided argument", function () {
            const signal = new Signal<number>()
            let counter = 7
            signal.add((n: number) => counter += n)
            expect(counter).to.equal(7)

            signal.trigger(3)

            expect(counter).to.equal(10)
        })
    })
    describe("remove(...)", function () {
        it("remove(add(...))", function () {
            const signal = new Signal()
            let counter = 9
            const link = signal.add(() => ++counter)

            signal.remove(link)

            signal.trigger()
            expect(counter).to.equal(9)
        })
        it("add(..., obj); remove(obj);", function () {
            const signal = new Signal()
            let counter = 9

            const obj = {}
            signal.add(() => ++counter, obj)
            signal.remove(obj)

            signal.trigger()
            expect(counter).to.equal(9)
        })
    })
    describe("lock()/unlock()", function () {
        it("multiple triggers() after lock() will result in a single signal at unlock()", function () {
            let signal = new Signal()
            let counter = 0
            signal.add(() => ++counter)

            signal.lock()
            signal.trigger()
            signal.trigger()
            signal.trigger()
            signal.unlock()

            expect(counter).to.equal(1)
        })
    })
})
