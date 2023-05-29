import { NumberModel } from "./NumberModel"


export class FixedNumberModel extends NumberModel {
    override set value(value: number) {
        super.value = Math.round(value)
    }
    override get value(): number { return super.value }
}
