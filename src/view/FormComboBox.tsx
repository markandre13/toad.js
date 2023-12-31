import { OptionModelBase } from "../model/OptionModelBase"
import { FormField, FormHelp, FormLabel } from "./Form"
import { ComboBox } from "./ComboBox"
import { TextModel } from "../model/TextModel"

export function FormCombobox(props: { model: OptionModelBase<string>, text?: TextModel }) {
    return (
        <>
            <FormLabel model={props.model} />
            <FormField>
                <ComboBox model={props.model} text={props.text}/>
            </FormField>
            <FormHelp model={props.model} />
        </>
    )
}
