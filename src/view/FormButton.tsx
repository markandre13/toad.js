import { Action } from "../model/Action"
import { Button } from "./Button"
import { FormField, FormHelp } from "./Form"

export function FormButton(props: { action: Action }) {
    return (
        <>
            <FormField>
                <Button action={props.action} />
            </FormField>
            <FormHelp model={props.action} />
        </>
    )
}