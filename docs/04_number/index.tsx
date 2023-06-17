import { action, HtmlModel, NumberModel, Slider, Text, TextArea, TextModel, TextTool } from "@toad"
import { RGBModel } from "@toad/model/RGBModel"
import { Button, ButtonVariant } from "@toad/view/Button"
import { ColorSelector } from "@toad/view/ColorSelector"
import { code } from "./index.source"

//
// Application Layer
//

const sliderMin = new NumberModel(0, { min: 0, max: 99 });
const sliderMax = new NumberModel(99, { min: 0, max: 99 });
const sliderMiddle = new NumberModel(42, { min: 0, max: 99 });
const sliderDisabled = new NumberModel(83, { min: 0, max: 99 });
sliderDisabled.enabled = false;

const colorModel = new RGBModel({r: 0, g: 0, b: 0})

let size = new NumberModel(42, { min: 0, max: 99 });

//
// View Layer
//

export default () => (
    <>
        <h1>Number</h1>

        <h3>&lt;Slider&gt;</h3>
        <div class="section">
            <div style={{width: "200px"}}>
                <Slider model={sliderMiddle}/>
                <Slider model={sliderMiddle} minColor="#00f" maxColor="#f00"/>
                <Slider model={sliderDisabled}/>
            </div>
        </div>

        <h3>&lt;Slider orientation="vertical"&gt;</h3>
        <div class="section">
            <div style={{height: "200px;"}}>
                <Slider model={sliderMiddle} orientation="vertical"/>
                <Slider model={sliderMiddle} minColor="#00f" maxColor="#f00" orientation="vertical"/>
                <Slider model={sliderDisabled} orientation="vertical"/>
            </div>
        </div>

        <h3>&lt;ColorSelector&gt;</h3>

        <div class="section">
            <ColorSelector model={colorModel}/>
        </div>

        <h3>&lt;Text&gt; &amp; &lt;Slider&gt;</h3>
        <div class="section">
            <Text model={size}/>
            <Slider model={size}/>
        </div>
        {code}
    </>
)
