
import { NumberModel } from "@toad/appkit/NumberModel"
import { code } from "./index.source"
import { IntegerModel } from "@toad/appkit/IntegerModel"
import { RGBModel } from "@toad/appkit/RGBModel"
import { ColorSelector } from "@toad/viewkit/ColorSelector"
import { Slider } from "@toad/viewkit/Slider"
import { TextField } from "@toad/viewkit/TextField"

//
// Application Layer
//

let floatModel = new NumberModel(42, { min: 0, max: 99 })
let integerModel = new IntegerModel(42, { min: 0, max: 99 })

const sliderEnabled = new NumberModel(42, { min: 0, max: 99 })
const sliderDisabled = new NumberModel(83, { min: 0, max: 99, enabled: false })

const colorModel = new RGBModel({ r: 255, g: 128, b: 0 })

//
// View Layer
//

export default () => (
    <>
        <h3>Number</h3>

        <h5>&lt;Text&gt; &amp; &lt;Slider&gt; with NumberModel</h5>
        <div class="section">
            <TextField model={floatModel} />
            <Slider model={floatModel} />
        </div>
        <h5>&lt;Text&gt; &amp; &lt;Slider&gt; with IntegerModel</h5>
        <div class="section">
            <TextField model={integerModel} />
            <Slider model={integerModel} />
        </div>

        <h5>&lt;Slider&gt;</h5>
        <div class="section">
            <div style={{ width: "200px" }}>
                <Slider model={sliderEnabled} />
                <Slider model={sliderEnabled} minColor="#00f" maxColor="#f00" />
                <Slider model={sliderDisabled} />
            </div>
        </div>

        <h5>&lt;Slider orientation="vertical"&gt;</h5>
        <div class="section" style={{ height: "200px" }}>
            <Slider model={sliderEnabled} orientation="vertical" />
            <Slider model={sliderEnabled} minColor="#00f" maxColor="#f00" orientation="vertical" />
            <Slider model={sliderDisabled} orientation="vertical" />
        </div>

        <h5>&lt;ColorSelector&gt;</h5>

        <div class="section">
            <ColorSelector model={colorModel} />
        </div>
        {code}
    </>
)
