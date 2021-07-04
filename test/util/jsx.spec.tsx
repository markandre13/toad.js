import { expect } from 'chai'
import * as toadJSX from '@toad/jsx-runtime'

describe("jsx", function() {
    it("create HTMLElement", function() {
        const x = <div></div>
        expect(x).to.be.instanceOf(HTMLElement)
        expect(x.nodeName).to.equal("DIV")
        console.log(x)
    })
    it("create text within HTMLElement", function() {
        const x = <div>hello</div>
        expect(x.childNodes.length).to.equal(1)
        expect(x.childNodes[0]).to.be.instanceOf(Text)
        const text = x.childNodes[0] as Text
        expect(text.data).to.equal("hello")
    })
    it("create Fragment containing an HTMLElement", function() {
        const x = <><div></div></>
        expect(x).to.be.instanceOf(toadJSX.Fragment)
        const fragment = x as toadJSX.Fragment
        expect(fragment[0]).to.be.instanceOf(HTMLElement)
        expect(fragment[0].nodeName).to.equal("DIV")
    })
    it("create Fragment containing Text", function() {
        const x = <>hello</>
        expect(x).to.be.instanceOf(toadJSX.Fragment)
        const fragment = x as toadJSX.Fragment
        console.log(typeof fragment[0])
        expect(fragment[0]).to.be.instanceOf(Text)
        const text = fragment[0] as Text
        expect(text.data).to.equal("hello")
    })
})
