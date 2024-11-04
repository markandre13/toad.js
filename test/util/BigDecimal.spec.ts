import { expect } from 'chai'
import { BigDecimal } from 'src/util/BigDecimal'

describe("BigDecimal", function() {
    it("regression", function() {
        const a = new BigDecimal(0)
        const b = new BigDecimal(0.01)
        const c = a.sub(b)
        expect(c.toFloat()).to.equal(-0.01)
    })
})
