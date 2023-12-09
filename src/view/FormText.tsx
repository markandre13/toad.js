import { Model } from "../model/Model"
import { TextModel } from "@toad/model/TextModel"
import { NumberModel } from "@toad/model/NumberModel"
import { FormLabel, FormField, FormHelp } from "./Form"
import { TextField } from "./TextField"

export function FormText(props: { model: TextModel | NumberModel }) {
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
