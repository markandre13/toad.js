import { action, EnumModel, HtmlModel, RadioButton, Search, Select, Text, TextArea, TextModel, TextTool } from "@toad"
import { Button, ButtonVariant } from "@toad/view/Button"
import { ComboBox } from "@toad/view/Select"
import { code } from "./index.source"

//
// Application Layer
//

enum Color {
    BLUEBERRY = 0,
    GRAPE,
    TANGERINE,
    LIME,
    STRAWBERRY,
    BONDIBLUE,
}

const flavourEnabled = new EnumModel<Color>(Color.GRAPE, Color)

const flavourDisabled = new EnumModel<Color>(Color.TANGERINE, Color)
flavourDisabled.enabled = false

const customFlavour = new TextModel("")
const customFlavourDisabled = new TextModel("")

//
// View Layer
//

export default () => (
    <>
        <h1>Choice</h1>

        <div class="section">A list of values out of which one (and only one) can be selected.</div>

        <h3>&lt;RadioButton&gt;, &lt;Select&gt; &amp; &lt;ComboBox&gt;</h3>

        <div class="section">
            <table>
                <tr>
                    <th></th>
                    <th colspan={3}>enabled</th>
                    <th colspan={3}>disabled</th>
                    <th>when to use</th>
                </tr>
                <tr>
                    <th rowspan={2}>RadioButton</th>
                    <td>
                        <RadioButton model={flavourEnabled} value={Color.BLUEBERRY} /> Blueberry
                    </td>
                    <td>
                        <RadioButton model={flavourEnabled} value={Color.GRAPE} /> Grape
                    </td>
                    <td>
                        <RadioButton model={flavourEnabled} value={Color.TANGERINE} /> Tangerine
                    </td>
                    <td>
                        <RadioButton model={flavourEnabled} value={Color.LIME} /> Blueberry
                    </td>
                    <td>
                        <RadioButton model={flavourEnabled} value={Color.STRAWBERRY} /> Strawberry
                    </td>
                    <td>
                        <RadioButton model={flavourEnabled} value={Color.BONDIBLUE} /> Bondiblue
                    </td>
                    <td rowspan={2}>enough space to display all options</td>
                </tr>
                <tr>
                    <td>
                        <RadioButton model={flavourEnabled} value={Color.BLUEBERRY} /> Blueberry
                    </td>
                    <td>
                        <RadioButton model={flavourEnabled} value={Color.GRAPE} /> Grape
                    </td>
                    <td>
                        <RadioButton model={flavourEnabled} value={Color.TANGERINE} /> Tangerine
                    </td>
                    <td>
                        <RadioButton model={flavourEnabled} value={Color.LIME} /> Blueberry
                    </td>
                    <td>
                        <RadioButton model={flavourEnabled} value={Color.STRAWBERRY} /> Strawberry
                    </td>
                    <td>
                        <RadioButton model={flavourEnabled} value={Color.BONDIBLUE} /> Bondiblue
                    </td>
                    <td rowspan={2}>enough space to display all options</td>
                </tr>
                <tr>
                    <th>Select</th>
                    <td colspan={3}>
                        <Select model={flavourEnabled}>
                            {/* <Option value="BLUEBERRY">Blueberry</Option>
                            <option value="GRAPE">Grape</option>
                            <option value="TANGERINE">Tangerine</option>
                            <option value="LIME">Lime</option>
                            <option value="STRAWBERRY">Strawberry</option>
                            <option value="BONDIBLUE">Bondi Blue</option> */}
                        </Select>
                    </td>
                    <td colspan={3}>
                        <Select model={flavourDisabled}>
                            {/* <option value="BLUEBERRY">Blueberry</option>
                            <option value="GRAPE">Grape</option>
                            <option value="TANGERINE">Tangerine</option>
                            <option value="LIME">Lime</option>
                            <option value="STRAWBERRY">Strawberry</option>
                            <option value="BONDIBLUE">Bondi Blue</option> */}
                        </Select>
                    </td>
                    <td>limited screen space, move through options with scroll wheel</td>
                </tr>
                <tr>
                    <th>ComboBox</th>
                    <td colspan={3}>
                        <ComboBox model={flavourEnabled} text={customFlavour}>
                            <option value="BLUEBERRY">Blueberry</option>
                            <option value="GRAPE">Grape</option>
                            <option value="TANGERINE">Tangerine</option>
                            <option value="LIME">Lime</option>
                            <option value="STRAWBERRY">Strawberry</option>
                            <option value="BONDIBLUE">Bondi Blue</option>
                        </ComboBox>
                    </td>
                    <td colspan={3}>
                        <ComboBox model={flavourDisabled} text={customFlavourDisabled}>
                            <option value="BLUEBERRY">Blueberry</option>
                            <option value="GRAPE">Grape</option>
                            <option value="TANGERINE">Tangerine</option>
                            <option value="LIME">Lime</option>
                            <option value="STRAWBERRY">Strawberry</option>
                            <option value="BONDIBLUE">Bondi Blue</option>
                        </ComboBox>
                    </td>
                    <td>combination of select and text</td>
                </tr>
                <tr>
                    <th>search</th>
                    <td colspan={3}>
                        <Search />
                    </td>
                    <td colspan={3}></td>
                    <td>(not ready yet for use)</td>
                </tr>
                <tr>
                    <th>search within</th>
                </tr>
            </table>
        </div>
        {code}
    </>
)
