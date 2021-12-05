import { expect } from '@esm-bundle/chai'
import { Signal } from "@toad/Signal"

describe("signal", function () {

    it("works fine", function () {
        let signal = new Signal()
        let objectA = {}, objectB = {}, a = 0, b = 0

        expect(signal.count()).to.equal(0)

        signal.add(() => { ++a }, objectA)

        expect(signal.count()).to.equal(1)

        expect(a).to.equal(0)
        signal.trigger()
        expect(a).to.equal(1)

        signal.add(() => { a += 10 }, objectA)
        signal.add(() => { ++b }, objectB)
        expect(signal.count()).to.equal(3)

        expect(a).to.equal(1)
        expect(b).to.equal(0)
        signal.trigger()
        expect(a).to.equal(12)
        expect(b).to.equal(1)

        signal.remove(objectA)
        expect(signal.count()).to.equal(1)

        expect(a).to.equal(12)
        expect(b).to.equal(1)
        signal.trigger()
        expect(a).to.equal(12)
        expect(b).to.equal(2)

        signal.remove(objectB)
        expect(signal.count()).to.equal(0)
    })
})
