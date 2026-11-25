import { BooleanModel } from "@toad/appkit/BooleanModel"
import { Converter } from "@toad/appkit/Converter"
import { EmailModel } from "@toad/appkit/EmailModel"
import { EnumModel } from "@toad/appkit/EnumModel"
import { HtmlModel } from "@toad/appkit/HtmlModel"
import { IntegerModel } from "@toad/appkit/IntegerModel"
import { NumberModel } from "@toad/appkit/NumberModel"
import { OptionModel } from "@toad/appkit/OptionModel"
import { RGBModel } from "@toad/appkit/RGBModel"
import { TextModel } from "@toad/appkit/TextModel"
import { VALUE_LOADING, VALUE_UNKNOWN } from "@toad/appkit/ValueModel"
import { code } from "./index.source"
import { Checkbox } from "@toad/viewkit/Checkbox"
import { ColorSelector } from "@toad/viewkit/ColorSelector"
import { ComboBox } from "@toad/viewkit/ComboBox"
import { Display } from "@toad/viewkit/Display"
import { RadioButton } from "@toad/viewkit/RadioButton"
import { Select } from "@toad/viewkit/Select"
import { Slider } from "@toad/viewkit/Slider"
import { Switch } from "@toad/viewkit/Switch"
import { TextArea } from "@toad/viewkit/TextArea"
import { TextField } from "@toad/viewkit/TextField"

//
// Application Layer
//

const numberKnown = new NumberModel(42, { min: 0, max: 99 })
const numberUnknown = new NumberModel(VALUE_UNKNOWN, { min: 0, max: 99 })
const numberLoading = new NumberModel(VALUE_LOADING, { min: 0, max: 99 })

const integerKnown = new IntegerModel(42, { min: 0, max: 99 })
const integerUnknown = new IntegerModel(VALUE_UNKNOWN, { min: 0, max: 99 })
const integerLoading = new IntegerModel(VALUE_LOADING, { min: 0, max: 99 })

const textKnown = new TextModel("hello")
const textUnknown = new TextModel(VALUE_UNKNOWN)
const textLoading = new TextModel(VALUE_LOADING)

const emailKnown = new EmailModel("jane@example.com")
const emailUnknown = new EmailModel(VALUE_UNKNOWN)
const emailLoading = new EmailModel(VALUE_LOADING)

const htmlKnown = new HtmlModel("Salt &amp; Pepper")
const htmlUnknown = new HtmlModel(VALUE_UNKNOWN)
const htmlLoading = new HtmlModel(VALUE_LOADING)

const booleanKnown = new BooleanModel(true)
const booleanUnknown = new BooleanModel(VALUE_UNKNOWN)
const booleanLoading = new BooleanModel(VALUE_LOADING)

const colorKnown = new RGBModel({ r: 255, g: 128, b: 0 })
const colorUnknown = new RGBModel(VALUE_UNKNOWN)
const colorLoading = new RGBModel(VALUE_LOADING)

enum Color {
    BLUEBERRY = "Blueberry",
    GRAPE = "Grape",
    TANGERINE = "Tangerine",
    LIME = "Lime",
}

const choiceKnown = new EnumModel<Color>(Color.GRAPE, Color)
const choiceUnknown = new EnumModel<Color>(VALUE_UNKNOWN, Color)
const choiceLoading = new EnumModel<Color>(VALUE_LOADING, Color)

const comboTextKnown = new TextModel("")
const comboTextUnknown = new TextModel("")
const comboTextLoading = new TextModel("")

const optionKnown = new OptionModel<string>("Grape", ["Blueberry", "Grape", "Tangerine", "Lime"])
const optionUnknown = new OptionModel<string>(VALUE_UNKNOWN, ["Blueberry", "Grape", "Tangerine", "Lime"])
const optionLoading = new OptionModel<string>(VALUE_LOADING, ["Blueberry", "Grape", "Tangerine", "Lime"])

const optionTextKnown = new TextModel("")
const optionTextUnknown = new TextModel("")
const optionTextLoading = new TextModel("")

class PercentConverter extends Converter<string> {
    constructor(private source: NumberModel) {
        super()
    }
    output(): string {
        return `${this.source.value} %`
    }
    input(value: string) {
        this.source.value = parseFloat(value)
    }
}

const converterKnown = new PercentConverter(numberKnown)
const converterUnknown = new PercentConverter(numberKnown)
converterUnknown.value = VALUE_UNKNOWN
const converterLoading = new PercentConverter(numberKnown)
converterLoading.value = VALUE_LOADING

//
// View Layer
//

export default () => (
    <>
        <style>{`
            th {
                background-color: var(--tx-gray-300);
            }
        `}</style>

        <h1>Special Values</h1>

        <div class="section">
            A model can hold the special values <em>VALUE_UNKNOWN</em> (the value is not known, the user may provide
            one) and <em>VALUE_LOADING</em> (the value is known, but not available yet). The views show them with a
            checker or stripe pattern and do not show a value. Use <em>isUnknown()</em> and <em>isLoading()</em> to
            check for them. Reading <em>value</em> returns <em>undefined</em> in that case.
        </div>

        <h3>NumberModel</h3>
        <div class="section">
            <table>
                <tr>
                    <th></th>
                    <th>value</th>
                    <th>VALUE_UNKNOWN</th>
                    <th>VALUE_LOADING</th>
                </tr>
                <tr>
                    <th>&lt;TextField&gt;</th>
                    <td><TextField model={numberKnown} /></td>
                    <td><TextField model={numberUnknown} /></td>
                    <td><TextField model={numberLoading} /></td>
                </tr>
                <tr>
                    <th>&lt;Slider&gt;</th>
                    <td><div style={{ width: "200px" }}><Slider model={numberKnown} /></div></td>
                    <td><div style={{ width: "200px" }}><Slider model={numberUnknown} /></div></td>
                    <td><div style={{ width: "200px" }}><Slider model={numberLoading} /></div></td>
                </tr>
                <tr>
                    <th>&lt;Display&gt;</th>
                    <td><Display model={numberKnown} /></td>
                    <td><Display model={numberUnknown} /></td>
                    <td><Display model={numberLoading} /></td>
                </tr>
            </table>
        </div>

        <h3>IntegerModel</h3>
        <div class="section">
            <table>
                <tr>
                    <th></th>
                    <th>value</th>
                    <th>VALUE_UNKNOWN</th>
                    <th>VALUE_LOADING</th>
                </tr>
                <tr>
                    <th>&lt;TextField&gt;</th>
                    <td><TextField model={integerKnown} /></td>
                    <td><TextField model={integerUnknown} /></td>
                    <td><TextField model={integerLoading} /></td>
                </tr>
                <tr>
                    <th>&lt;Slider&gt;</th>
                    <td><div style={{ width: "200px" }}><Slider model={integerKnown} /></div></td>
                    <td><div style={{ width: "200px" }}><Slider model={integerUnknown} /></div></td>
                    <td><div style={{ width: "200px" }}><Slider model={integerLoading} /></div></td>
                </tr>
                <tr>
                    <th>&lt;Display&gt;</th>
                    <td><Display model={integerKnown} /></td>
                    <td><Display model={integerUnknown} /></td>
                    <td><Display model={integerLoading} /></td>
                </tr>
            </table>
        </div>

        <h3>TextModel</h3>
        <div class="section">
            <table>
                <tr>
                    <th></th>
                    <th>value</th>
                    <th>VALUE_UNKNOWN</th>
                    <th>VALUE_LOADING</th>
                </tr>
                <tr>
                    <th>&lt;TextField&gt;</th>
                    <td><TextField model={textKnown} /></td>
                    <td><TextField model={textUnknown} /></td>
                    <td><TextField model={textLoading} /></td>
                </tr>
                <tr>
                    <th>&lt;TextArea&gt;</th>
                    <td><div style={{ width: "200px" }}><TextArea model={textKnown} /></div></td>
                    <td><div style={{ width: "200px" }}><TextArea model={textUnknown} /></div></td>
                    <td><div style={{ width: "200px" }}><TextArea model={textLoading} /></div></td>
                </tr>
                <tr>
                    <th>&lt;Display&gt;</th>
                    <td><Display model={textKnown} /></td>
                    <td><Display model={textUnknown} /></td>
                    <td><Display model={textLoading} /></td>
                </tr>
            </table>
        </div>

        <h3>EmailModel</h3>
        <div class="section">
            <table>
                <tr>
                    <th></th>
                    <th>value</th>
                    <th>VALUE_UNKNOWN</th>
                    <th>VALUE_LOADING</th>
                </tr>
                <tr>
                    <th>&lt;TextField&gt;</th>
                    <td><TextField model={emailKnown} /></td>
                    <td><TextField model={emailUnknown} /></td>
                    <td><TextField model={emailLoading} /></td>
                </tr>
                <tr>
                    <th>&lt;Display&gt;</th>
                    <td><Display model={emailKnown} /></td>
                    <td><Display model={emailUnknown} /></td>
                    <td><Display model={emailLoading} /></td>
                </tr>
            </table>
        </div>

        <h3>HtmlModel</h3>
        <div class="section">
            <table>
                <tr>
                    <th></th>
                    <th>value</th>
                    <th>VALUE_UNKNOWN</th>
                    <th>VALUE_LOADING</th>
                </tr>
                <tr>
                    <th>&lt;TextField&gt;</th>
                    <td><TextField model={htmlKnown} /></td>
                    <td><TextField model={htmlUnknown} /></td>
                    <td><TextField model={htmlLoading} /></td>
                </tr>
                <tr>
                    <th>&lt;TextArea&gt;</th>
                    <td><div style={{ width: "200px" }}><TextArea model={htmlKnown} /></div></td>
                    <td><div style={{ width: "200px" }}><TextArea model={htmlUnknown} /></div></td>
                    <td><div style={{ width: "200px" }}><TextArea model={htmlLoading} /></div></td>
                </tr>
                <tr>
                    <th>&lt;Display&gt;</th>
                    <td><Display model={htmlKnown} /></td>
                    <td><Display model={htmlUnknown} /></td>
                    <td><Display model={htmlLoading} /></td>
                </tr>
            </table>
        </div>

        <h3>BooleanModel</h3>
        <div class="section">
            <table>
                <tr>
                    <th></th>
                    <th>value</th>
                    <th>VALUE_UNKNOWN</th>
                    <th>VALUE_LOADING</th>
                </tr>
                <tr>
                    <th>&lt;Checkbox&gt;</th>
                    <td><Checkbox model={booleanKnown} /></td>
                    <td><Checkbox model={booleanUnknown} /></td>
                    <td><Checkbox model={booleanLoading} /></td>
                </tr>
                <tr>
                    <th>&lt;Switch&gt;</th>
                    <td><Switch model={booleanKnown} /></td>
                    <td><Switch model={booleanUnknown} /></td>
                    <td><Switch model={booleanLoading} /></td>
                </tr>
            </table>
        </div>

        <h3>RGBModel</h3>
        <div class="section">
            <table>
                <tr>
                    <th></th>
                    <th>value</th>
                    <th>VALUE_UNKNOWN</th>
                    <th>VALUE_LOADING</th>
                </tr>
                <tr>
                    <th>&lt;ColorSelector&gt;</th>
                    <td><ColorSelector model={colorKnown} /></td>
                    <td><ColorSelector model={colorUnknown} /></td>
                    <td><ColorSelector model={colorLoading} /></td>
                </tr>
            </table>
        </div>

        <h3>OptionModel</h3>
        <div class="section">
            <table>
                <tr>
                    <th></th>
                    <th>value</th>
                    <th>VALUE_UNKNOWN</th>
                    <th>VALUE_LOADING</th>
                </tr>
                <tr>
                    <th>&lt;RadioButton&gt;</th>
                    <td>
                        <RadioButton model={optionKnown} value="Blueberry" />
                        <RadioButton model={optionKnown} value="Grape" />
                        <RadioButton model={optionKnown} value="Tangerine" />
                    </td>
                    <td>
                        <RadioButton model={optionUnknown} value="Blueberry" />
                        <RadioButton model={optionUnknown} value="Grape" />
                        <RadioButton model={optionUnknown} value="Tangerine" />
                    </td>
                    <td>
                        <RadioButton model={optionLoading} value="Blueberry" />
                        <RadioButton model={optionLoading} value="Grape" />
                        <RadioButton model={optionLoading} value="Tangerine" />
                    </td>
                </tr>
                <tr>
                    <th>&lt;Select&gt;</th>
                    <td><Select model={optionKnown} /></td>
                    <td><Select model={optionUnknown} /></td>
                    <td><Select model={optionLoading} /></td>
                </tr>
                <tr>
                    <th>&lt;ComboBox&gt;</th>
                    <td><ComboBox model={optionKnown} text={optionTextKnown} /></td>
                    <td><ComboBox model={optionUnknown} text={optionTextUnknown} /></td>
                    <td><ComboBox model={optionLoading} text={optionTextLoading} /></td>
                </tr>
            </table>
        </div>

        <h3>EnumModel</h3>
        <div class="section">
            <table>
                <tr>
                    <th></th>
                    <th>value</th>
                    <th>VALUE_UNKNOWN</th>
                    <th>VALUE_LOADING</th>
                </tr>
                <tr>
                    <th>&lt;RadioButton&gt;</th>
                    <td>
                        <RadioButton model={choiceKnown} value={Color.BLUEBERRY} />
                        <RadioButton model={choiceKnown} value={Color.GRAPE} />
                        <RadioButton model={choiceKnown} value={Color.TANGERINE} />
                    </td>
                    <td>
                        <RadioButton model={choiceUnknown} value={Color.BLUEBERRY} />
                        <RadioButton model={choiceUnknown} value={Color.GRAPE} />
                        <RadioButton model={choiceUnknown} value={Color.TANGERINE} />
                    </td>
                    <td>
                        <RadioButton model={choiceLoading} value={Color.BLUEBERRY} />
                        <RadioButton model={choiceLoading} value={Color.GRAPE} />
                        <RadioButton model={choiceLoading} value={Color.TANGERINE} />
                    </td>
                </tr>
                <tr>
                    <th>&lt;Select&gt;</th>
                    <td><Select model={choiceKnown} /></td>
                    <td><Select model={choiceUnknown} /></td>
                    <td><Select model={choiceLoading} /></td>
                </tr>
                <tr>
                    <th>&lt;ComboBox&gt;</th>
                    <td><ComboBox model={choiceKnown} text={comboTextKnown} /></td>
                    <td><ComboBox model={choiceUnknown} text={comboTextUnknown} /></td>
                    <td><ComboBox model={choiceLoading} text={comboTextLoading} /></td>
                </tr>
            </table>
        </div>

        <h3>Converter</h3>
        <div class="section">
            <table>
                <tr>
                    <th></th>
                    <th>value</th>
                    <th>VALUE_UNKNOWN</th>
                    <th>VALUE_LOADING</th>
                </tr>
                <tr>
                    <th>&lt;TextField&gt;</th>
                    <td><TextField model={converterKnown} /></td>
                    <td><TextField model={converterUnknown} /></td>
                    <td><TextField model={converterLoading} /></td>
                </tr>
            </table>
        </div>
        {code}
    </>
)
