
import { NumberModel, Slider, TextField } from "@toad"
import { code } from "./index.source"
import { IntegerModel } from "@toad/model/IntegerModel"
import { RGBModel } from "@toad/model/RGBModel"
import { ColorSelector } from "@toad/view/ColorSelector"

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
        <h1>Number</h1>

        <h3>&lt;Text&gt; &amp; &lt;Slider&gt; with NumberModel</h3>
        <div class="section">
            <TextField model={floatModel} />
            <Slider model={floatModel} />
        </div>
        <h3>&lt;Text&gt; &amp; &lt;Slider&gt; with IntegerModel</h3>
        <div class="section">
            <TextField model={integerModel} />
            <Slider model={integerModel} />
        </div>

        <h3>&lt;Slider&gt;</h3>
        <div class="section">
            <div style={{ width: "200px" }}>
                <Slider model={sliderEnabled} />
                <Slider model={sliderEnabled} minColor="#00f" maxColor="#f00" />
                <Slider model={sliderDisabled} />
            </div>
        </div>

        <h3>&lt;Slider orientation="vertical"&gt;</h3>
        <div class="section" style={{ height: "200px" }}>
            <Slider model={sliderEnabled} orientation="vertical" />
            <Slider model={sliderEnabled} minColor="#00f" maxColor="#f00" orientation="vertical" />
            <Slider model={sliderDisabled} orientation="vertical" />
        </div>

        <h3>&lt;ColorSelector&gt;</h3>

        <div class="section">
            <ColorSelector model={colorModel} />
        </div>
        {code}
    </>
)
