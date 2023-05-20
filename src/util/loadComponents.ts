import { Button } from "@toad/view/Button"
import { Checkbox } from "@toad/view/Checkbox"
import { Form } from "@toad/view/Form"
import { Menu } from "@toad/menu/Menu"
import { RadioButton } from "@toad/view/RadioButton"
import { Select } from "@toad/view/Select"
import { Slider } from "@toad/view/Slider"
import { Switch } from "@toad/view/Switch"
import { Tab } from "@toad/view/Tab"
import { Table } from "@toad/table/Table"
import { TableTool } from "@toad/table/TableTool"
import { Text } from "@toad/view/Text"
import { TextArea } from "@toad/view/TextArea"
import { TextTool } from "@toad/view/TextTool"
import { ToadIf } from "@toad/view/ToadIf"

/**
 * Only needed when defining the UI via HTML.
 * 
 * This method isn't actually doing anything at runtime but forces the bundler to
 * include all files containing web components.
 * 
 * This function initializes all components part of toad.js 
 */
export function loadComponents() {
    Select
    Text
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