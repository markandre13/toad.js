import { Select } from "@toad/view/Select"
import { Text } from "@toad/view/Text"
import { Menu } from "@toad/menu/Menu"
import { TextArea } from "@toad/view/TextArea"
import { TextTool } from "@toad/view/TextTool"
import { TableTool } from "@toad/table/TableTool"
import { Button } from "@toad/view/Button"
import { RadioButton } from "@toad/view/RadioButton"
import { Checkbox } from "@toad/view/Checkbox"
import { Tab } from "@toad/view/Tab"
import { Table } from "@toad/table/Table"
import { Slider } from "@toad/view/Slider"
import { Switch } from "@toad/view/Switch"
import { ToadIf } from "@toad/view/ToadIf"

/**
 * Initialize all web components.
 * 
 * When JSX is used, all the necessary web components are initialized automatically.
 * 
 * When HTML is used, the code must include the components to initialize them.
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
}