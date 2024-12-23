import { Button } from "../view/Button"
import { Checkbox } from "../view/Checkbox"
import { Form } from "../view/Form"
import { Menu } from "../menu/Menu"
import { RadioButton } from "../view/RadioButton"
import { Select } from "../view/Select"
import { Slider } from "../view/Slider"
import { Switch } from "../view/Switch"
import { Tab } from "../view/Tab"
import { Table } from "../table/Table"
import { TableTool } from "../table/TableTool"
import { TextField } from "../view/TextField"
import { TextArea } from "../view/TextArea"
import { TextTool } from "../view/TextTool"
import { ToadIf } from "../view/ToadIf"
import { ColorSelector } from "../view/ColorSelector"

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