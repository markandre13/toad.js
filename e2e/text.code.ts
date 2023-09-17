import { NumberModel } from "@toad/model/NumberModel"
import { TextModel } from "@toad/model/TextModel"
import { bindModel } from "@toad/controller/globalController"

export function main() {
    const textString = new TextModel("Hello")
    bindModel("textString", textString)

    const textNumber = new NumberModel(3.14, { min: 0, max: 99 })
    bindModel("textNumber", textNumber)

    const textDisabled = new TextModel("Disabled")
    textDisabled.enabled = false
    bindModel("textDisabled", textDisabled)

    const textError = new TextModel("Error")
    textError.error = "Wrong"
    bindModel("textError", textError)
}
