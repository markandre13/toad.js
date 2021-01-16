import { expect } from 'chai'
import { Matrix } from "../src/Matrix"

describe("toad.js", function () {
    describe("matrix", () => {
        it("new matrix is identity", () => {
            let matrix = new Matrix()
            expect(matrix.m11).to.equal(1.0)
            expect(matrix.m12).to.equal(0.0)
            expect(matrix.m21).to.equal(0.0)
            expect(matrix.m22).to.equal(1.0)
            expect(matrix.tX).to.equal(0.0)
            expect(matrix.tY).to.equal(0.0)
        })

        it("append", () => {
            let m0 = new Matrix()
            m0.rotate(0.2)

            let m1 = new Matrix()
            m1.translate({ x: 3.0, y: 5.0 })

            let m2 = new Matrix()
            m1.rotate(0.5)

            m0.append(m1)
            m0.append(m2)

            expect(m0.m11).to.be.approximately(0.764842, 0.000001)
            expect(m0.m12).to.be.approximately(0.644218, 0.000001)
            expect(m0.m21).to.be.approximately(-0.644218, 0.000001)
            expect(m0.m22).to.be.approximately(0.764842, 0.000001)
            expect(m0.tX).to.be.approximately(0.235620, 0.000001)
            expect(m0.tY).to.be.approximately(5.826190, 0.000001)
        })

        it("prepend", () => {
            let m0 = new Matrix()
            m0.rotate(0.2)

            let m1 = new Matrix()
            m1.translate({ x: 3.0, y: 5.0 })

            let m2 = new Matrix()
            m2.rotate(0.5)

            m0.prepend(m1)
            m0.prepend(m2)

            expect(m0.m11).to.be.approximately(0.764842, 0.000001)
            expect(m0.m12).to.be.approximately(0.644218, 0.000001)
            expect(m0.m21).to.be.approximately(-0.644218, 0.000001)
            expect(m0.m22).to.be.approximately(0.764842, 0.000001)
            expect(m0.tX).to.be.approximately(1.946853, 0.000001)
            expect(m0.tY).to.be.approximately(5.496340, 0.000001)
        })

        it("invert", () => {
            let m0 = new Matrix()
            m0.rotate(0.2)

            let m1 = new Matrix()
            m1.translate({ x: 3.0, y: 5.0 })

            let m2 = new Matrix()
            m1.rotate(0.5)

            m0.append(m1)
            m0.append(m2)
            m0.invert()

            expect(m0.m11).to.be.approximately(0.764842, 0.000001)
            expect(m0.m12).to.be.approximately(-0.644218, 0.000001)
            expect(m0.m21).to.be.approximately(0.644218, 0.000001)
            expect(m0.m22).to.be.approximately(0.764842, 0.000001)
            expect(m0.tX).to.be.approximately(-3.933546, 0.000001)
            expect(m0.tY).to.be.approximately(-4.304324, 0.000001)
        })

        it("transformPoint", () => {
            let m0 = new Matrix()
            m0.rotate(0.2)

            let m1 = new Matrix()
            m1.translate({ x: 3.0, y: 5.0 })

            let m2 = new Matrix()
            m1.rotate(0.5)

            m0.append(m1)
            m0.append(m2)

            let p = m0.transformPoint({ x: 11.0, y: 13.0 })
            expect(p.x).to.be.approximately(0.274054, 0.000001)
            expect(p.y).to.be.approximately(22.855532, 0.000001)
        })

        it("transformArrayPoint", () => {
            let m0 = new Matrix()
            m0.rotate(0.2)

            let m1 = new Matrix()
            m1.translate({ x: 3.0, y: 5.0 })

            let m2 = new Matrix()
            m1.rotate(0.5)

            m0.append(m1)
            m0.append(m2)

            let p = m0.transformArrayPoint([11.0, 13.0])
            expect(p[0]).to.be.approximately(0.274054, 0.000001)
            expect(p[1]).to.be.approximately(22.855532, 0.000001)
        })
    })
})
