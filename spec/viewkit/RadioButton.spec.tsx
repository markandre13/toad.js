import { expect } from 'chai'
import { styleBase as txBase, styleDark as txDark, styleStatic as txStatic } from "@toad/util/loadStyle"
import { OptionModel } from '@toad/appkit/OptionModel'

import { RadioButton } from '@toad/viewkit/RadioButton'
import { replaceChildren } from 'toad.jsx'
import { beforeEach, describe, it } from 'vitest'

describe("Select", function () {

    beforeEach(async function () {
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

        replaceChildren(document.body, <div style={{width: "200px"}}>
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
