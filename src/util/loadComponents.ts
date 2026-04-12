import { Button } from "../viewkit/Button"
import { Checkbox } from "../viewkit/Checkbox"
import { Form } from "../viewkit/Form"
import { Menu } from "../menu/Menu"
import { RadioButton } from "../viewkit/RadioButton"
import { Select } from "../viewkit/Select"
import { Slider } from "../viewkit/Slider"
import { Switch } from "../viewkit/Switch"
import { Tab } from "../viewkit/Tab"
import { Table } from "../table/Table"
import { TableTool } from "../table/TableTool"
import { TextField } from "../viewkit/TextField"
import { TextArea } from "../viewkit/TextArea"
import { TextTool } from "../viewkit/TextTool"
import { ToadIf } from "../viewkit/ToadIf"
import { ColorSelector } from "../viewkit/ColorSelector"

/**
 * Only needed when defining the UI via HTML.
 * 
 * This method isn't actually doing anything at runtime but forces the bundler to
 * include all files containing web components.
 * 
 * This function initializes all components part of toad.js 
 */
export function loadComponents() {
    ColorSelector
    Select
    TextField
    Menu
    TextArea
    TextTool
    TableTool
    Button
    RadioButton
    Checkbox
    Tab
    Table
    Slider
    Switch
    ToadIf
    Form
}