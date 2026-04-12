import { expect } from 'chai'
import { OptionModel } from '@toad/appkit/OptionModel'

import { style as txBase } from "@toad/style/tx"
import { style as txStatic } from "@toad/style/tx-static"
import { style as txDark } from "@toad/style/tx-dark"
import { unbind } from '@toad/controller/globalController'
import { RadioButton } from '@toad/viewkit/RadioButton'

describe("Select", function () {

    beforeEach(async function () {
        unbind()
        document.body.replaceChildren()
        document.head.replaceChildren(txBase, txStatic, txDark)
    })

    it("can display options", function () {
        enum A { UP, DOWN, LEFT, RIGHT }
        const model = new OptionModel<A>(A.DOWN, [
            [A.UP, "Up"],
            [A.DOWN, "Down"],
            [A.LEFT, "Left"],
            [A.RIGHT, "Right"]
        ])

        document.body.replaceChildren(<div style={{width: "200px"}}>
            <RadioButton model={model} value={A.UP} /><br />
            <RadioButton model={model} value={A.DOWN} /><br />
            <RadioButton model={model} value={A.LEFT}>
                Lorem ipsum dolor sit amet, consectetur adipisici elit.
            </RadioButton><br />
            <RadioButton model={model} value={A.RIGHT} /><br />
            <RadioButton model={model} value={-1}>Sideways</RadioButton><br />
        </div>)
    })
})
