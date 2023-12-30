import { BooleanModel } from "../model/BooleanModel"
import { FormField, FormHelp, FormLabel } from "./Form"
import { Switch } from "./Switch"

export function FormSwitch(props: { model: BooleanModel }) {
    return (
        <>
            <FormLabel model={props.model} />
            <FormField>
                <Switch model={props.model} />
            </FormField>
            <FormHelp model={props.model} />
        </>
    )
}