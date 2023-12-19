import { OptionModelBase } from "@toad/model/OptionModelBase"
import { FormField, FormHelp, FormLabel } from "./Form"
import { Select } from "./Select"

export function FormSelect<V>(props: { model: OptionModelBase<V> }) {
    return (
        <>
            <FormLabel model={props.model} />
            <FormField>
                <Select model={props.model} />
            </FormField>
            <FormHelp model={props.model} />
        </>
    )
}
