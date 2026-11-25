import { NumberModel } from "@toad/appkit/NumberModel"
import { code } from "./index.source"
import { Form } from "@toad/viewkit/Form"
import { FormText } from "@toad/viewkit/FormText"
import { VALUE_UNKNOWN, VALUE_LOADING } from "@toad/appkit/ValueModel"

const knownValue = new NumberModel(1, {
    label: "Known Value"
})
const unknownValue = new NumberModel(VALUE_UNKNOWN, {
    label: "Unknown Amount",
    description: "The value is unknown and the user may provide one."
})
const unloadedAmount = new NumberModel(VALUE_LOADING, {
    label: "Value being loaded",
    description: "The value is known but not available yet, e.g. because it is being loaded from a remote server or calculated."
})

export default () => (
    <>
        <h1>Special Values</h1>

        <Form>
            <FormText model={knownValue} />
            <FormText model={unknownValue} />
            <FormText model={unloadedAmount} />
        </Form>

        {code}
    </>
)
