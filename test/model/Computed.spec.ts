import { expect } from "chai"
import { NumberModel } from "@toad"
import { Computed, constraint } from "@toad/model/Computed"

describe("models", () => {
    describe("Computed", () => {
        it("evaluates when one of it's dependencies changes", () => {
            const a = new NumberModel(6)
            const b = new NumberModel(7)
            const c = new Computed(() => a.value * b.value)
            expect(c.value).to.equal(6 * 7)

            const log: string[] = []
            a.signal.add(() => {
                log.push(`a = ${a.value}`)
            })
            b.signal.add(() => {
                log.push(`b = ${b.value}`)
            })
            c.signal.add(() => {
                log.push(`c = ${c.value}`)
            })

            a.value = 2
            expect(log).to.deep.equal(["c = 14", "a = 2"])
            log.length = 0

            b.value = 4
            expect(log).to.deep.equal(["c = 8", "b = 4"])
        })
    })
    describe("constraint()", () => {
        it("evaluates when one of it's dependencies changes", () => {
            const a = new NumberModel(6)
            const log: number[] = []
            constraint(() => log.push(a.value))
            expect(log).to.deep.equal([6])
            a.value = 9
            expect(log).to.deep.equal([6, 9])
        })
    })
    // TODO: observe not just ValueModel
    // TODO: circular dependencies (this also needs to detect were we write to?)
    // TODO: addDependencyToObserverFor(): create dependency graph here?
    // TODO: cache computed value
    // TODO: test Converter
    // TODO: make Converter drop-in for Model
    // TODO: provide information on what has change (Signal can already do that)
    // TODO: try to use terminology from https://github.com/tc39/proposal-signals
    //   producer
    //   consumer
    //   sink
    //   SignalLink <-> SignalNode
    //  get value(): T {
    //     producerAccessed(node)
    //     return node.value
    //  }
    //  set value(value: T): void {
    //     this._value = value
    //     signalValueChanged(node)
    //  }
})
