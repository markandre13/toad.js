import { Model } from "../model/Model"
import { FormLabel, FormField, FormHelp } from "./Form"
import { TextField, TextFieldModel } from "./TextField"

export function FormText(props: { model: TextFieldModel }) {
    return (
        <>
            <FormLabel model={props.model as Model} />
            <FormField>
                <TextField model={props.model} />
            </FormField>
            <FormHelp model={props.model as Model} />
        </>
    )
}
