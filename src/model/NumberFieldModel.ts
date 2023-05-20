import { applyMixins, FormField } from "./FieldMixin"
import { NumberModel } from "./NumberModel"

export class NumberFieldModel extends NumberModel {}
export interface NumberFieldModel extends FormField, NumberModel {}
applyMixins(NumberFieldModel, [FormField, NumberModel])
