import { NumberModel } from '@toad/appkit/NumberModel'
import { TextModel } from '@toad/appkit/TextModel'
import { expect } from 'chai'
import { Fragment, makeRef } from 'toad.jsx'
import { describe, it } from 'vitest'

describe("jsx", function () {
    it("create HTMLElement", function () {
        const element = <div></div> as HTMLElement
        expect(element).to.be.instanceOf(HTMLElement)
        expect(element.nodeName).to.equal("DIV")
    })
    it("create text within HTMLElement", function () {
        const element = <div>hello</div> as HTMLElement
        expect(element).to.be.instanceOf(HTMLElement)
        expect(element.childNodes.length).to.equal(1)
        expect(element.childNodes[0]).to.be.instanceOf(Text)
        const text = element.childNodes[0] as Text
        expect(text.data).to.equal("hello")
    })
    it("create Fragment containing an HTMLElement", function () {
        const element = <><div></div></>
        expect(element).to.be.instanceOf(Fragment)
        const fragment = element as Fragment
        expect(fragment[0]).to.be.instanceOf(HTMLElement)
        expect(fragment[0].nodeName).to.equal("DIV")
    })
    it("create Fragment containing Text", function () {
        const element = <>hello</>
        expect(element).to.be.instanceOf(Fragment)
        const fragment = element as Fragment
        expect(fragment[0]).to.be.instanceOf(Text)
        const text = fragment[0] as Text
        expect(text.data).to.equal("hello")
    })
    it("store reference with: <div ref={reference} />", () => {
        let reference = makeRef()
        const element = <div ref={reference} />
        expect(reference.current).to.equal(element)
    })
    it("create effect for: <div>{() => model.value}</div>", () => {
        const model = new NumberModel(1)
        const element = <div>{() => model.value}</div> as HTMLDivElement
        expect(element.childNodes[0].textContent).to.equal("1")
        model.value = 2
        expect(element.childNodes[0].textContent).to.equal("2")
    })
    it("create effect for: <div title={() => model.value}/>", () => {
        const model = new TextModel("foo")
        const element = <div title={() => model.value}/> as HTMLDivElement
        expect(element.title).to.equal("foo")
        model.value = "bar"
        expect(element.title).to.equal("bar")
    })
})

