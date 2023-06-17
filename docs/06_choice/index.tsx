import { EnumModel, RadioButton, Search, Select, TextModel } from "@toad"
import { ComboBox } from "@toad/view/Select"
import { code } from "./index.source"

//
// Application Layer
//

enum Color {
    BONDIBLUE = "Bondiblue",
    BLUEBERRY = "Blueberry",
    GRAPE = "Grape",
    STRAWBERRY = "Strawberry",
    TANGERINE = "Tangerine",
    LIME = "Lime",
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
                        <RadioButton model={flavourEnabled} value={Color.BLUEBERRY} />
                    </td>
                    <td>
                        <RadioButton model={flavourEnabled} value={Color.GRAPE} />
                    </td>
                    <td>
                        <RadioButton model={flavourEnabled} value={Color.TANGERINE} />
                    </td>
                    <td>
                        <RadioButton model={flavourDisabled} value={Color.BLUEBERRY} />
                    </td>
                    <td>
                        <RadioButton model={flavourDisabled} value={Color.GRAPE} />
                    </td>
                    <td>
                        <RadioButton model={flavourDisabled} value={Color.TANGERINE} />
                    </td>
                    <td rowspan={2}>enough space to display all options</td>
                </tr>
                <tr>
                    <td>
                        <RadioButton model={flavourEnabled} value={Color.LIME} />
                    </td>
                    <td>
                        <RadioButton model={flavourEnabled} value={Color.STRAWBERRY} />
                    </td>
                    <td>
                        <RadioButton model={flavourEnabled} value={Color.BONDIBLUE} />
                    </td>
                    <td>
                        <RadioButton model={flavourDisabled} value={Color.LIME} />
                    </td>
                    <td>
                        <RadioButton model={flavourDisabled} value={Color.STRAWBERRY} />
                    </td>
                    <td>
                        <RadioButton model={flavourDisabled} value={Color.BONDIBLUE} />
                    </td>
                    <td rowspan={2}>enough space to display all options</td>
                </tr>
                <tr>
                    <th>Select</th>
                    <td colspan={3}>
                        <Select model={flavourEnabled} />
                    </td>
                    <td colspan={3}>
                        <Select model={flavourDisabled} />
                    </td>
                    <td>limited screen space, move through options with scroll wheel</td>
                </tr>
                <tr>
                    <th>ComboBox</th>
                    <td colspan={3}>
                        <ComboBox model={flavourEnabled} text={customFlavour} />
                    </td>
                    <td colspan={3}>
                        <ComboBox model={flavourDisabled} text={customFlavourDisabled} />
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
