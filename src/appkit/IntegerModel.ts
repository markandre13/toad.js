import { NumberModel } from "./NumberModel"
import { isSpecialValue, type SpecialValue } from "./ValueModel"

export class IntegerModel extends NumberModel {
    override set value(value: number | SpecialValue) {
        super.value = isSpecialValue(value) ? value : Math.round(value)
    }
    override get value(): number { return super.value }
}
