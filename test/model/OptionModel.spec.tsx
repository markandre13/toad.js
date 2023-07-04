import { expect } from "@esm-bundle/chai"
import { span, text } from "@toad/util/lsx"
import { EnumModel } from "@toad/model/EnumModel"
import { OptionModel } from "@toad/model/OptionModel"

describe("OptionModel", function () {
    describe("forEach(callback: (value: V, key: string, label: any) => void): void", function () {
        it(`[ "Up", ...]`, function () {
            const model = new OptionModel("Down", ["Up", "Down", "Left", "Right"])
            expect(model.value).equals("Down")

            const out: any[][] = []
            model.forEach((value, key, label) => {
                out.push([value, key, label])
            })

            expect(out).to.deep.equal([
                ["Up", "Up", span(text("Up"))],
                ["Down", "Down", span(text("Down"))],
                ["Left", "Left", span(text("Left"))],
                ["Right", "Right", span(text("Right"))],
            ])
        })
        it(`[ [0, "Up"], ...]`, function () {
            enum A {
                UP,
                DOWN,
                LEFT,
                RIGHT,
            }
            const model = new OptionModel<A>(A.DOWN, [
                [A.UP, "Up"],
                [A.DOWN, "Down"],
                [A.LEFT, "Left"],
                [A.RIGHT, "Right"],
            ])
            expect(model.value).equals(A.DOWN)

            const out: any[][] = []
            model.forEach((value, key, label) => {
                out.push([value, key, label])
            })

            expect(out).to.deep.equal([
                [A.UP, "Up", span(text("Up"))],
                [A.DOWN, "Down", span(text("Down"))],
                [A.LEFT, "Left", span(text("Left"))],
                [A.RIGHT, "Right", span(text("Right"))],
            ])
        })
        it("[ [0, <>Up</>], ...]", function () {
            enum A {
                UP,
                DOWN,
                LEFT,
                RIGHT,
            }
            const model = new OptionModel<A>(A.DOWN, [
                [A.UP, <i>Up</i>],
                [A.DOWN, <i>Down</i>],
                [A.LEFT, <i>Left</i>],
                [A.RIGHT, <i>Right</i>],
            ])
            expect(model.value).equals(A.DOWN)

            const out: any[][] = []
            model.forEach((value, key, label) => {
                out.push([value, key, label])
            })

            expect(out).to.deep.equal([
                [A.UP, <i>Up</i>, <i style={{ height: "100%", width: "100%" }}>Up</i>],
                [A.DOWN, <i>Down</i>, <i style={{ height: "100%", width: "100%" }}>Down</i>],
                [A.LEFT, <i>Left</i>, <i style={{ height: "100%", width: "100%" }}>Left</i>],
                [A.RIGHT, <i>Right</i>, <i style={{ height: "100%", width: "100%" }}>Right</i>],
            ])
        })
    })
})

describe("EnumModel automatically maps all the value in an enum to the UI", function () {
    describe("forEach(callbackfn: (value, label) => void)", function () {
        it("enum Direction { UP, ... }", function () {
            enum A {
                UP,
                DOWN,
                LEFT,
                RIGHT,
            }
            const model = new EnumModel(A.UP, A)

            const out: any[][] = []
            model.forEach((value, key, label) => {
                out.push([value, key, label])
            })

            expect(out).to.deep.equal([
                [A.UP, "UP", <span>UP</span>],
                [A.DOWN, "DOWN", <span>DOWN</span>],
                [A.LEFT, "LEFT", <span>LEFT</span>],
                [A.RIGHT, "RIGHT", <span>RIGHT</span>],
            ])
        })
        it("enum Direction { UP = 100, ... }", function () {
            enum A {
                UP = 100,
                DOWN = 101,
                LEFT = 102,
                RIGHT = 103,
            }
            const model = new EnumModel(A.UP, A)

            const out: any[][] = []
            model.forEach((value, key, label) => {
                out.push([value, key, label])
            })

            expect(out).to.deep.equal([
                [A.UP, "UP", <span>UP</span>],
                [A.DOWN, "DOWN", <span>DOWN</span>],
                [A.LEFT, "LEFT", <span>LEFT</span>],
                [A.RIGHT, "RIGHT", <span>RIGHT</span>],
            ])
        })
        it('enum Direction { UP = "Up", ... }', function () {
            enum A {
                UP = "Up",
                DOWN = "Down",
                LEFT = "Left",
                RIGHT = "Right",
            }
            const model = new EnumModel(A.UP, A)

            const out: any[][] = []
            model.forEach((value, key, label) => {
                out.push([value, key, label])
            })

            console.log(out)

            expect(out).to.deep.equal([
                [A.UP, "UP", <span>Up</span>],
                [A.DOWN, "DOWN", <span>Down</span>],
                [A.LEFT, "LEFT", <span>Left</span>],
                [A.RIGHT, "RIGHT", <span>Right</span>],
            ])
        })
        it("enum Direction { UP = <>Up</>, ... }", function () {
            enum A {
                UP = (<i>Up</i>),
                DOWN = (<i>Down</i>),
                LEFT = (<i>Left</i>),
                RIGHT = (<i>Right</i>),
            }
            const model = new EnumModel(A.UP, A)

            const out: any[][] = []
            model.forEach((value, key, label) => {
                out.push([value, key, label])
            })

            expect(out).to.deep.equal([
                [A.UP, "UP", <i style={{ height: "100%", width: "100%" }}>Up</i>],
                [A.DOWN, "DOWN", <i style={{ height: "100%", width: "100%" }}>Down</i>],
                [A.LEFT, "LEFT", <i style={{ height: "100%", width: "100%" }}>Left</i>],
                [A.RIGHT, "RIGHT", <i style={{ height: "100%", width: "100%" }}>Right</i>],
            ])
        })
    })
    describe("map<R>(callback: (value: V, label: any) => R): R[]", function () {
        it('enum Direction { UP = "Up", ... }', function () {
            enum A {
                UP = "Up",
                DOWN = "Down",
                LEFT = "Left",
                RIGHT = "Right",
            }
            const model = new EnumModel(A.UP, A)

            const out: any[][] = []
            model.forEach((value, key, label) => {
                out.push([value, key, label])
            })

            expect(out).to.deep.equal([
                [A.UP, "UP", <span>Up</span>],
                [A.DOWN, "DOWN", <span>Down</span>],
                [A.LEFT, "LEFT", <span>Left</span>],
                [A.RIGHT, "RIGHT", <span>Right</span>],
            ])
        })
    })
    describe("index", function () {
        it("get index()", function () {
            enum A {
                UP = "Up",
                DOWN = "Down",
                LEFT = "Left",
                RIGHT = "Right",
            }
            const model = new EnumModel(A.LEFT, A)

            expect(model.index).equals(2)
        })
        it("set index()", function () {
            enum A {
                UP = "Up",
                DOWN = "Down",
                LEFT = "Left",
                RIGHT = "Right",
            }
            const model = new EnumModel(A.UP, A)

            model.index = 2

            expect(model.value).equals(A.LEFT)
        })
        it("next()", function () {
            enum A {
                UP = "Up",
                DOWN = "Down",
                LEFT = "Left",
                RIGHT = "Right",
            }
            const model = new EnumModel(A.LEFT, A)

            model.next()
            expect(model.value).equals(A.RIGHT)

            model.next()
            expect(model.value).equals(A.RIGHT)
        })
        it("prev()", function () {
            enum A {
                UP = "Up",
                DOWN = "Down",
                LEFT = "Left",
                RIGHT = "Right",
            }
            const model = new EnumModel(A.DOWN, A)
            model.prev()
            expect(model.value).equals(A.UP)

            model.prev()
            expect(model.value).equals(A.UP)
        })
    })
})
