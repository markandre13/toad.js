import { parseColor, RGB } from "@toad/util/color"
import { GenericModel } from "./GenericModel"
import { ModelOptions } from "./Model"

export class RGBModel extends GenericModel<RGB, ModelOptions> {
    constructor(value: RGB | string, options?: ModelOptions) {
        if (typeof value === "string") {
            let v = parseColor(value)
            if (v === undefined) {
                throw Error(`failed to parse color '${value}'`)
            }
            value = v
        }
        super(Object.assign({}, value), options)
    }
    override set value(value: RGB | string) {
        if (typeof value === "string") {
            let v = parseColor(value)
            if (v === undefined) {
                throw Error(`failed to parse color '${value}'`)
            }
            value = v
        }
        if (this._value == value)
            return
        this._value.r = value.r
        this._value.g = value.g
        this._value.b = value.b
        this.modified.trigger()
    }

    override get value(): RGB {
        return this._value
    }
}
