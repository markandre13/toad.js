import { Switch, Checkbox, RadioButton, ToadIf, BooleanModel } from "@toad"
import { code } from "./index.source"

//
// Application Layer
//

const off = new BooleanModel(false)
const on = new BooleanModel(true)
// FIXME: disable via options
const offDisabled = new BooleanModel(false)
offDisabled.enabled = false
const onDisabled = new BooleanModel(true)
onDisabled.enabled = false

//
// View Layer
//

export default () => (
    <>
        <h1>Boolean</h1>

        <div class="section">
            A Boolean can either be <em>true</em> or <em>false</em>.
        </div>

        <h3>&lt;Checkbox&gt;, &lt;Switch&gt; and &lt;ToadIf&gt;</h3>

        <div class="section">
            <table>
                <tr>
                    <th></th>
                    <th colspan={2}>enabled</th>
                    <th colspan={2}>disabled</th>
                </tr>
                <tr>
                    <th></th>
                    <th>false</th>
                    <th>true</th>
                    <th>false</th>
                    <th>true</th>
                    <th>when to use</th>
                </tr>
                <tr>
                    <th>Checkbox</th>
                    <td>
                        <Checkbox model={off} />
                    </td>
                    <td>
                        <Checkbox model={on} />
                    </td>
                    <td>
                        <Checkbox model={offDisabled} />
                    </td>
                    <td>
                        <Checkbox model={onDisabled} />
                    </td>
                    <td>multiple choice lists</td>
                </tr>
                <tr>
                    <th>Switch</th>
                    <td>
                        <Switch model={off} />
                    </td>
                    <td>
                        <Switch model={on} />
                    </td>
                    <td>
                        <Switch model={offDisabled} />
                    </td>
                    <td>
                        <Switch model={onDisabled} />
                    </td>
                    <td>switching something on/off</td>
                </tr>
            </table>
        </div>
        <div class="section">
            The answer to life, the universe and everything?
            <ToadIf model={off}>
                <p>What is 6 &times; 7?</p>
            </ToadIf>
        </div>
        {code}
    </>
)
