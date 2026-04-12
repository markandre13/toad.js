
import { TextModel } from "@toad/appkit/TextModel"
import { code } from "./index.source"
import { HtmlModel } from "@toad/appkit/HtmlModel"
import { TextField } from "@toad/viewkit/TextField"
import { TextTool } from "@toad/viewkit/TextTool"
import { TextArea } from "@toad/viewkit/TextArea"

//
// Application Layer
//

const hello = new TextModel("hello")

const markup = new HtmlModel("Salt &amp; Pepper")
markup.signal.add(() => {
    document.getElementById("rawhtml")!.innerText = markup.value
})

//
// View Layer
//

export default () => (
    <>
        <h2>TextModel &amp; HtmlModel</h2>

        <h3>&lt;Text&gt;</h3>
        <TextField model={hello} />
        <TextField model={hello} />

        <h3>&lt;TextTool&gt; &amp; &lt;TextArea&gt;</h3>
        <TextTool />
        <TextArea model={markup} style={{ width: "100%" }} />
        <h3>Raw HTML</h3>
        <pre
            id="rawhtml"
            style={{
                margin: "0px",
                padding: "10px",
                // FIXME: border: "solid var(--tx-gray-600) 1px;",
                borderWidth: "1px",
                borderStyle: "solid",
                borderColor: "var(--tx-gray-600)",
            }}
        />
        {code}
    </>
)
