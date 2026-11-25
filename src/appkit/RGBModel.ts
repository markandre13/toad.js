import { parseColor, type RGB } from "../util/color"
import { isSpecialValue, VALUE, ValueModel, type SpecialValue, type ValueModelOptions } from "./ValueModel"
import { type ModelOptions } from "./Model"

export class RGBModel extends ValueModel<RGB, void, ValueModelOptions<RGB>> {
    constructor(value: RGB | string | SpecialValue, options?: ModelOptions) {
        if (typeof value === "string") {
            let v = parseColor(value)
            if (v === undefined) {
                throw Error(`failed to parse color '${value}'`)
            }
            value = v
        }
        super(isSpecialValue(value) ? value : Object.assign({}, value), options)
    }
    override set value(value: RGB | string | SpecialValue) {
        if (isSpecialValue(value)) {
            super.value = value
            return
        }
        if (typeof value === "string") {
            let v = parseColor(value)
            if (v === undefined) {
                throw Error(`failed to parse color '${value}'`)
            }
            value = v
        }
        if (isSpecialValue(this._value)) {
            this._value = Object.assign({}, value)
            this.signal.emit({ type: VALUE })
            return
        }
        if (this._value == value) return
        if (this._value.r === value.r && this._value.g === value.g && this._value.b === value.b) return
        this._value.r = value.r
        this._value.g = value.g
        this._value.b = value.b
        this.signal.emit({ type: VALUE })
    }
    override get value(): RGB {
        return super.value
    }
}
