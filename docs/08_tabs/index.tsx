import { Tabs, Tab } from "@toad/view/Tab"
import { code } from "./index.source"

export default () => (
    <>
        <h1>Tabs</h1>

        <h2>Horizontal</h2>

        <Tabs style={{ width: "100%" }}>
            <Tab label="Explore">So much to see. So little time.</Tab>
            <Tab label="Flights">Jump. Up and down.</Tab>
            <Tab label="Trips">Take a trip dude. Odyssey of the Mind</Tab>
        </Tabs>

        <h2>Vertical</h2>

        <Tabs style={{ width: "100%" }} orientation="vertical">
            <Tab label="Explore">So much to see. So little time.</Tab>
            <Tab label="Flights">Jump. Up and down.</Tab>
            <Tab label="Trips">Take a trip dude. Odyssey of the Mind</Tab>
        </Tabs>
        {code}
    </>
)
