import { applyMixins, FormField } from "./FieldMixin"
import { TextModel } from "./TextModel"

export class TextFieldModel extends TextModel {}
export interface TextFieldModel extends FormField, TextModel {}
applyMixins(TextFieldModel, [FormField, TextModel])
