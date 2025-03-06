import { Model } from "../model/Model"
import { TextModel } from "../model/TextModel"
import { NumberModel } from "../model/NumberModel"
import { FormLabel, FormField, FormHelp } from "./Form"
import { Display } from "./Display"

export function FormDisplay(props: { model: TextModel | NumberModel }) {
    return (
        <>
            <FormLabel model={props.model as Model} />
            <FormField>
                <Display model={props.model} />
            </FormField>
            <FormHelp model={props.model as Model} />
        </>
    )
}
