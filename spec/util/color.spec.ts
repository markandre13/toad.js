import { hsl2rgb, parseColor, rgb2hex, rgb2hsl, rgba2hex } from "@toad/util/color"
import { expect } from "chai"
import { describe, it } from "vitest"

describe("color", () => {
    describe("parseColor", () => {
        it("#rgb", () => {
            expect(parseColor("#48b")).to.deep.equal({ r: 68, g: 136, b: 187, a: 1 })
        })
        it("#RGB", () => {
            expect(parseColor("#48B")).to.deep.equal({ r: 68, g: 136, b: 187, a: 1 })
        })
        it("#rgba", () => {
            expect(parseColor("#48ba")).to.deep.equal({ r: 68, g: 136, b: 187, a: 0.6666666666666666 })
        })
        it("#RGBA", () => {
            expect(parseColor("#48BA")).to.deep.equal({ r: 68, g: 136, b: 187, a: 0.6666666666666666 })
        })
        it("#rrggbb", () => {
            expect(parseColor("#4284b9")).to.deep.equal({ r: 66, g: 132, b: 185, a: 1 })
        })
        it("#RRGGBB", () => {
            expect(parseColor("#4284B9")).to.deep.equal({ r: 66, g: 132, b: 185, a: 1 })
        })
        it("#rrggbbaa", () => {
            expect(parseColor("#4284b9a0")).to.deep.equal({ r: 66, g: 132, b: 185, a: 0.6274509803921569 })
        })
        it("#RRGGBBAA", () => {
            expect(parseColor("#4284B9A0")).to.deep.equal({ r: 66, g: 132, b: 185, a: 0.6274509803921569 })
        })
        it("rgb(32,64,96)", () => {
            expect(parseColor("rgb(32,64,96)")).to.deep.equal({ r: 32, g: 64, b: 96, a: 1 })
        })
        it("rgba(32,64,96,0.4)", () => {
            expect(parseColor("rgba(32,64,96,0.4)")).to.deep.equal({ r: 32, g: 64, b: 96, a: 0.4 })
        })
        it("hsl(20, 60, 49)", () => {
            expect(parseColor("hsl(20, 60, 49)")).to.deep.equal({ r: 200, g: 100, b: 50, a: 1 })
        })
        it("hsl(20, 60%, 49%)", () => {
            expect(parseColor("hsl(20, 60%, 49%)")).to.deep.equal({ r: 200, g: 100, b: 50, a: 1 })
        })
    })
    describe("rgb <-> hsl", () => {
        it("hsl2rgb()", () => {
            const rgb = hsl2rgb({ h: 20, s: 60, l: 49 })
            expect(rgb.r).closeTo(200, 0.1)
            expect(rgb.g).closeTo(100, 0.1)
            expect(rgb.b).closeTo(50, 0.1)
        })
        it("rgb2hsl()", () => {
            const hsl = rgb2hsl({ r: 200, g: 100, b: 50 })
            expect(hsl.h).closeTo(20, 0.1)
            expect(hsl.s).closeTo(60, 0.1)
            expect(hsl.l).closeTo(49, 0.1)
        })
    })
    describe("rgb -> hex", () => {
        it("rgb2hex()", () => {
            expect(rgb2hex({ r: 1, g: 128, b: 255 })).to.equal("#0180ff")
        })
        it("rgba2hex()", () => {
            expect(rgba2hex({ r: 1, g: 128, b: 255, a: 0.5 })).to.equal("#0180ff80")
        })
    })
})