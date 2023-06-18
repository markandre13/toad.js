
import { Button, TextModel, action } from "@toad"
import { code } from "./index.source"
import { ButtonVariant } from "@toad/view/Button"

//
// Application Layer
//

function dummy() {}

let textModel = new TextModel("")

// TODO: get rid of the 'action' function
const hitMe = action("hitMe", () => {
    textModel.value = "Hit me too!"
    hitMeMore.enabled = true
})
const hitMeMore = action("hitMeMore", () => {
    textModel.value = "You hit me!"
    hitMeMore.enabled = false
})

//
// View Layer
//

export default () => (
    <>
        <h1>Action</h1>

        <div class="section">
            <p>
                Actions are models without <em>values</em> (aside from properties like <em>enabled</em>,<em>label</em>,
                etc.)
            </p>

            <p>
                An Action's <em>modfied</em> signal will be triggered on a user interaction, e.g. a push button being
                pressed.
            </p>
        </div>

        <h3>Button</h3>

        <div class="section">
            <Button action={dummy} variant={ButtonVariant.PRIMARY}>
                Primary
            </Button>
            <Button action={dummy} variant={ButtonVariant.SECONDARY}>
                Secondary
            </Button>
            <Button action={dummy} variant={ButtonVariant.ACCENT}>
                Accent
            </Button>
            <Button action={dummy} variant={ButtonVariant.NEGATIVE}>
                Negative
            </Button>

            <br />
            <br />

            <Button variant={ButtonVariant.PRIMARY}>Primary</Button>
            <Button variant={ButtonVariant.SECONDARY}>Secondary</Button>
            <Button variant={ButtonVariant.ACCENT}>Accent</Button>
            <Button variant={ButtonVariant.NEGATIVE}>Negative</Button>

            <br />
            <br />

            <Button action={hitMe}>Hit me!</Button>
            <Button action={hitMeMore}>TODO: get text from model</Button>
        </div>
        {code}
    </>
)
