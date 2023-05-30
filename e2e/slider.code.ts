import { NumberModel } from "@toad/model/NumberModel"
import { bindModel } from "@toad/controller/globalController"

export function main() {
    let sliderMin = new NumberModel(0, { min: 0, max: 99 })
    bindModel("sliderMin", sliderMin)

    let sliderMax = new NumberModel(99, { min: 0, max: 99 })
    bindModel("sliderMax", sliderMax)

    let sliderMiddle = new NumberModel(42, { min: 0, max: 99 })
    bindModel("sliderMiddle", sliderMiddle)

    let sliderDisabled = new NumberModel(83, { min: 0, max: 99 })
    sliderDisabled.enabled = false
    bindModel("sliderDisabled", sliderDisabled)
}