import { DEFAULT_VALUE, VALUE, VALUE_LOADING, VALUE_UNKNOWN, ValueModel } from "@toad/appkit/ValueModel"
import { setUrlHashValue, getUrlHashValue } from "@toad/util/urlHash"
import { expect } from "chai"
import { afterEach, describe, it } from "vitest"

function collectEvents(model: ValueModel<any, any, any>): any[] {
    const events: any[] = []
    model.signal.add((ev) => {
        events.push(ev)
    })
    return events
}

let keySequence = 0

/**
 * local and fragment keys may only be used by one model per page, so every test needs its own key
 */
function uniqueKey(prefix: string): string {
    return `${prefix}${++keySequence}`
}

describe("models", () => {
    describe("ValueModel", () => {
        afterEach(() => {
            history.replaceState(null, "", location.pathname + location.search)
        })

        describe("value", () => {
            it("initialized via constructor", () => {
                const model = new ValueModel(42)
                expect(model.value).to.equal(42)
            })
            it("get, set and change event", () => {
                const model = new ValueModel(42)
                let event: any
                model.signal.add((ev) => {
                    event = ev
                })
                model.value = 24
                expect(model.value).to.equal(24)
                expect(event.type).to.equal(VALUE)
            })
            it("setting the same value emits no event", () => {
                const model = new ValueModel(42)
                const events = collectEvents(model)
                model.value = 42
                expect(events).to.have.length(0)
            })
            it("setting an object value replaces the value", () => {
                const model = new ValueModel<{ a: number }>({ a: 1 })
                const next = { a: 2 }
                model.value = next
                expect(model.value).to.equal(next)
            })
        })

        describe("special values", () => {
            it("VALUE_UNKNOWN makes value undefined and isUnknown true", () => {
                const model = new ValueModel<number>(42)
                model.value = VALUE_UNKNOWN
                expect(model.value).to.be.undefined
                expect(model.isUnknown()).to.be.true
                expect(model.isLoading()).to.be.false
            })
            it("VALUE_LOADING makes value undefined and isLoading true", () => {
                const model = new ValueModel<number>(42)
                model.value = VALUE_LOADING
                expect(model.value).to.be.undefined
                expect(model.isLoading()).to.be.true
                expect(model.isUnknown()).to.be.false
            })
            it("constructor accepts a special value", () => {
                const model = new ValueModel<number>(VALUE_UNKNOWN)
                expect(model.value).to.be.undefined
                expect(model.isUnknown()).to.be.true
            })
            it("setting a special value emits a VALUE event", () => {
                const model = new ValueModel<number>(42)
                const events = collectEvents(model)
                model.value = VALUE_LOADING
                expect(events).to.have.length(1)
                expect(events[0].type).to.equal(VALUE)
            })
            it("setting the same special value again emits no event", () => {
                const model = new ValueModel<number>(42)
                model.value = VALUE_UNKNOWN
                const events = collectEvents(model)
                model.value = VALUE_UNKNOWN
                expect(events).to.have.length(0)
            })
            it("switching between special values emits an event", () => {
                const model = new ValueModel<number>(42)
                model.value = VALUE_UNKNOWN
                const events = collectEvents(model)
                model.value = VALUE_LOADING
                expect(events).to.have.length(1)
                expect(model.isLoading()).to.be.true
                expect(model.isUnknown()).to.be.false
            })
            it("setting a real value clears the special value", () => {
                const model = new ValueModel<number>(42)
                model.value = VALUE_LOADING
                model.value = 7
                expect(model.value).to.equal(7)
                expect(model.isLoading()).to.be.false
                expect(model.isUnknown()).to.be.false
            })
            it("a loading model is disabled", () => {
                const model = new ValueModel<number>(42)
                model.enabled = true
                expect(model.enabled).to.be.true
                model.value = VALUE_LOADING
                expect(model.enabled).to.be.false
                model.value = 1
                expect(model.enabled).to.be.true
            })
            it("an unknown model stays enabled", () => {
                const model = new ValueModel<number>(42)
                model.enabled = true
                model.value = VALUE_UNKNOWN
                expect(model.enabled).to.be.true
            })
            it("applySpecialStyle marks the element with tx-unknown", () => {
                const model = new ValueModel<number>(42)
                const element = document.createElement("div")
                model.value = VALUE_UNKNOWN
                model.applySpecialStyle(element)
                expect(element.classList.contains("tx-unknown")).to.be.true
                expect(element.classList.contains("tx-loading")).to.be.false
            })
            it("applySpecialStyle marks the element with tx-loading", () => {
                const model = new ValueModel<number>(42)
                const element = document.createElement("div")
                model.value = VALUE_LOADING
                model.applySpecialStyle(element)
                expect(element.classList.contains("tx-loading")).to.be.true
                expect(element.classList.contains("tx-unknown")).to.be.false
            })
            it("applySpecialStyle removes the marks for a real value", () => {
                const model = new ValueModel<number>(42)
                const element = document.createElement("div")
                element.classList.add("tx-unknown", "tx-loading")
                model.applySpecialStyle(element)
                expect(element.classList.contains("tx-unknown")).to.be.false
                expect(element.classList.contains("tx-loading")).to.be.false
            })
        })

        describe("default", () => {
            it("initially undefined", () => {
                const model = new ValueModel(42)
                expect(model.default).to.be.undefined
            })
            it("initializable via constructor", () => {
                const model = new ValueModel(42, { default: 50 })
                expect(model.default).to.equal(50)
            })
            it("get, set and change event", () => {
                const model = new ValueModel(42)
                let event: any
                model.signal.add((ev) => {
                    event = ev
                })
                model.default = 50
                expect(model.default).to.equal(50)
                expect(event.type).to.equal(DEFAULT_VALUE)
            })
            it("setting the same default emits no event", () => {
                const model = new ValueModel(42, { default: 50 })
                const events = collectEvents(model)
                model.default = 50
                expect(events).to.have.length(0)
            })
            it("does not change the value", () => {
                const model = new ValueModel(42)
                model.default = 50
                expect(model.value).to.equal(42)
            })
        })

        describe("resetToDefault", () => {
            it("sets the value to the default", () => {
                const model = new ValueModel(42, { default: 50 })
                model.resetToDefault()
                expect(model.value).to.equal(50)
            })
            it("clears a special value", () => {
                const model = new ValueModel(42, { default: 50 })
                model.value = VALUE_UNKNOWN
                model.resetToDefault()
                expect(model.value).to.equal(50)
                expect(model.isUnknown()).to.be.false
            })
            it("does nothing without a default", () => {
                const model = new ValueModel(42)
                const events = collectEvents(model)
                model.resetToDefault()
                expect(model.value).to.equal(42)
                expect(events).to.have.length(0)
            })
        })

        describe("local", () => {
            it("persists the value on set", () => {
                const key = uniqueKey("localspec")
                const model = new ValueModel(42, { local: key })
                model.value = 24
                expect(localStorage.getItem(key)).to.equal("24")
            })
            it("persists the initial value when nothing is stored", () => {
                const key = uniqueKey("localspec")
                new ValueModel(42, { local: key })
                expect(localStorage.getItem(key)).to.equal("42")
            })
            it("restores the value from storage on construction", () => {
                const key = uniqueKey("localspec")
                localStorage.setItem(key, "13")
                const model = new ValueModel(42, { local: key })
                expect(model.value).to.equal(13)
            })
            it("does not persist a special value", () => {
                const key = uniqueKey("localspec")
                const model = new ValueModel(42, { local: key })
                model.value = 24
                model.value = VALUE_UNKNOWN
                expect(localStorage.getItem(key)).to.equal("24")
            })
        })

        describe("fragment", () => {
            it("persists the value in the url hash on set", () => {
                const key = uniqueKey("vmspec")
                const model = new ValueModel(42, { fragment: key })
                model.value = 24
                expect(getUrlHashValue(key)).to.equal("24")
            })
            it("writes the initial value into the url hash when none is set", () => {
                const key = uniqueKey("vmspec")
                new ValueModel(42, { fragment: key })
                expect(getUrlHashValue(key)).to.equal("42")
            })
            it("restores the value from the url hash on construction", () => {
                const key = uniqueKey("vmspec")
                setUrlHashValue(key, "13", false)
                const model = new ValueModel(42, { fragment: key })
                expect(model.value).to.equal(13)
            })
            it("does not change the url hash for a special value", () => {
                const key = uniqueKey("vmspec")
                const model = new ValueModel(42, { fragment: key })
                model.value = 24
                model.value = VALUE_LOADING
                expect(getUrlHashValue(key)).to.equal("24")
            })
            it("keeps other keys in the url hash", () => {
                const key = uniqueKey("vmspec")
                setUrlHashValue("other", "x", false)
                const model = new ValueModel(42, { fragment: key })
                model.value = 24
                expect(getUrlHashValue("other")).to.equal("x")
                expect(getUrlHashValue(key)).to.equal("24")
            })

            describe("multiple instances", () => {
                function nextHashChange(): Promise<void> {
                    return new Promise((resolve) => {
                        window.addEventListener("hashchange", () => resolve(), { once: true })
                    })
                }

                it("models with different keys keep their own hash entries", () => {
                    const keyA = uniqueKey("vma")
                    const keyB = uniqueKey("vmb")
                    const a = new ValueModel(1, { fragment: keyA })
                    const b = new ValueModel(2, { fragment: keyB })
                    a.value = 10
                    expect(getUrlHashValue(keyA)).to.equal("10")
                    expect(getUrlHashValue(keyB)).to.equal("2")
                    expect(b.value).to.equal(2)
                    b.value = 20
                    expect(a.value).to.equal(10)
                    expect(getUrlHashValue(keyA)).to.equal("10")
                    expect(getUrlHashValue(keyB)).to.equal("20")
                })
                it("each model restores its own value on construction", () => {
                    const keyA = uniqueKey("vma")
                    const keyB = uniqueKey("vmb")
                    setUrlHashValue(keyA, "11", false)
                    setUrlHashValue(keyB, "22", false)
                    const a = new ValueModel(1, { fragment: keyA })
                    const b = new ValueModel(2, { fragment: keyB })
                    expect(a.value).to.equal(11)
                    expect(b.value).to.equal(22)
                })
                it("a special value of one model leaves the other's value alone", () => {
                    const keyA = uniqueKey("vma")
                    const keyB = uniqueKey("vmb")
                    const a = new ValueModel(1, { fragment: keyA })
                    const b = new ValueModel(2, { fragment: keyB })
                    a.value = VALUE_UNKNOWN
                    expect(a.isUnknown()).to.be.true
                    expect(b.isUnknown()).to.be.false
                    expect(b.value).to.equal(2)
                    expect(getUrlHashValue(keyA)).to.equal("1")
                    expect(getUrlHashValue(keyB)).to.equal("2")
                })
                it("a hash change restores all models", async () => {
                    const keyA = uniqueKey("vma")
                    const keyB = uniqueKey("vmb")
                    const a = new ValueModel(1, { fragment: keyA })
                    const b = new ValueModel(2, { fragment: keyB })
                    const changed = nextHashChange()
                    location.hash = `${keyA}-5_${keyB}-6`
                    await changed
                    expect(a.value).to.equal(5)
                    expect(b.value).to.equal(6)
                })
                it("a hash change without a model's key resets it to its default", async () => {
                    const keyA = uniqueKey("vma")
                    const keyB = uniqueKey("vmb")
                    const a = new ValueModel(1, { fragment: keyA, default: 0 })
                    const b = new ValueModel(2, { fragment: keyB, default: 9 })
                    const changed = nextHashChange()
                    location.hash = `${keyA}-5`
                    await changed
                    expect(a.value).to.equal(5)
                    expect(b.value).to.equal(9)
                })
            })
        })

        describe("restrictions", () => {
            it("local and fragment cannot be used together", () => {
                expect(() => new ValueModel(1, { local: uniqueKey("localspec"), fragment: uniqueKey("vmspec") }))
                    .to.throw(/local and fragment/)
            })
            it("a rejected model does not claim its keys", () => {
                const local = uniqueKey("localspec")
                const fragment = uniqueKey("vmspec")
                expect(() => new ValueModel(1, { local, fragment })).to.throw()
                expect(() => new ValueModel(1, { local })).not.to.throw()
                expect(() => new ValueModel(1, { fragment })).not.to.throw()
            })
            it("two models cannot share a local key", () => {
                const key = uniqueKey("localspec")
                new ValueModel(1, { local: key })
                expect(() => new ValueModel(2, { local: key })).to.throw(/local key/)
            })
            it("two models cannot share a fragment key", () => {
                const key = uniqueKey("vmspec")
                new ValueModel(1, { fragment: key })
                expect(() => new ValueModel(2, { fragment: key })).to.throw(/fragment key/)
            })
        })
    })
})
