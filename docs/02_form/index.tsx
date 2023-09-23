
import { NumberModel, TextField, TextModel } from "@toad"
import { code } from "./index.source"
import { EmailModel } from "@toad/model/EmailModel"
import { Form, FormField, FormHelp, FormLabel } from "@toad/view/Form"

//
// APPLICATION LAYER
//

const nameModel = new TextModel("", {
    label: "The Name of Your Avatar",
    description: `An avatar is a computer-enhanced doppelganger; a
computer-generated image that takes your place in a three-dimensional online
encounter.`,
})

const mailModel = new EmailModel("", {
    label: "Email address",
    description: `Contains a locally interpreted string followed by the
at-sign character ("@", ASCII value 64) followed by an Internet domain. The
locally interpreted string is either a quoted-string or a dot-atom.  If the
string can be represented as a dot-atom (that is, it contains no characters
other than atext characters or "." surrounded by atext characters), then the
dot-atom form SHOULD be used and the quoted-string form SHOULD NOT be used.
Comments and folding white space SHOULD NOT be used around the "@" in the addr-spec.`,
})

const birthModel = new NumberModel(1970, {
    min: 1900,
    max: 2025,
    label: "Year of Birth",
    description: `Unlikely and invalid entries should result in an error message.`,
})

//
// VIEW LAYER
//

export default () => (
    <>
        <h1>Form</h1>
        <div class="section">
            <p>
                Forms arrange larger groups of input fields and also make use of the additional label and description
                information on the model.
            </p>
        </div>

        <h3>Wide</h3>

        <Form>
            <FormLabel model={nameModel} />
            <FormField>
                <TextField model={nameModel} />
            </FormField>
            <FormHelp model={nameModel} />

            <FormLabel model={mailModel} />
            <FormField>
                <TextField model={mailModel} />
            </FormField>
            <FormHelp model={mailModel} />

            <FormLabel model={birthModel} />
            <FormField>
                <TextField model={birthModel} />
            </FormField>
            <FormHelp model={birthModel} />
        </Form>

        <h3>Narrow</h3>

        <Form variant="narrow">
            <FormLabel model={nameModel} />
            <FormField>
                <TextField model={nameModel} />
            </FormField>
            <FormHelp model={nameModel} />

            <FormLabel model={mailModel} />
            <FormField>
                <TextField model={mailModel} />
            </FormField>
            <FormHelp model={mailModel} />

            <FormLabel model={birthModel} />
            <FormField>
                <TextField model={birthModel} />
            </FormField>
            <FormHelp model={birthModel} />
        </Form>

        {code}
    </>
)
