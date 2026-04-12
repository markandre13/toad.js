import { Model } from "../appkit/Model"
import { TextModel } from "../appkit/TextModel"
import { NumberModel } from "../appkit/NumberModel"
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
