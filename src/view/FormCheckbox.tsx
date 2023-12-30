import { BooleanModel } from "../model/BooleanModel"
import { Checkbox } from "./Checkbox"
import { FormField, FormHelp, FormLabel } from "./Form"

export function FormSelect<V>(props: { model: BooleanModel }) {
    return (
        <>
            <FormLabel model={props.model} />
            <FormField>
                <Checkbox model={props.model} />
            </FormField>
            <FormHelp model={props.model} />
        </>
    )
}