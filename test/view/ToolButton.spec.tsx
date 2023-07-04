// npm run dev:test --file=./lib/test/view/ToolButton.spec.js

import { expect } from "@esm-bundle/chai"
import { OptionModel, ToolButton } from "@toad"
import { loadFont } from "@toad/util/loadFont"
import { loadStyle } from "@toad/util/loadStyle"

describe("ToolButton", function () {
    beforeEach(async function () {
        document.body.replaceChildren()
        loadFont()
        loadStyle()
    })

    class Tool {}
    class Hammer extends Tool {}
    class Nail extends Tool {}
    class Screw extends Tool {}

    it("uses an OptionModel", function () {
        const hammer = new Hammer()
        const nail = new Nail()
        const screw = new Screw()
        const model = new OptionModel(hammer, [
            [hammer, "hammer"],
            [nail, "nail"],
        ])

        document.body.replaceChildren(
            ...(
                <>
                    <ToolButton id="hammer" model={model} value={hammer}>
                        H
                    </ToolButton>
                    <ToolButton id="nail" model={model} value={nail}>
                        N
                    </ToolButton>
                    <ToolButton id="screw" model={model} value={screw}>
                        S
                    </ToolButton>
                </>
            )
        )
        const hammerButton = document.getElementById("hammer")!
        const nailButton = document.getElementById("nail")!
        const screwButton = document.getElementById("screw")!

        expect(model.value).to.equal(hammer)
        expect(hammerButton?.hasAttribute("selected")).to.be.true
        expect(nailButton?.hasAttribute("selected")).to.be.false
        expect(screwButton?.hasAttribute("selected")).to.be.false

        // pointerdown sets 'selected' and changes the model
        nailButton.dispatchEvent(new PointerEvent("pointerdown"))

        expect(model.value).to.equal(nail)
        expect(hammerButton?.hasAttribute("selected")).to.be.false
        expect(nailButton?.hasAttribute("selected")).to.be.true
        expect(screwButton?.hasAttribute("selected")).to.be.false

        // buttons with values not in the option list are disabled
        expect(screwButton?.hasAttribute("disabled")).to.be.true

        // a disabled button ignores pointerdown events
        screwButton.dispatchEvent(new PointerEvent("pointerdown"))
        expect(model.value).to.equal(nail)
    })
})
