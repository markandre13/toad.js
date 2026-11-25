import { Tabs, Tab } from "@toad/viewkit/Tab"
import { code } from "./index.source"

export default () => (
    <>
        <h3>Tabs</h3>

        <h4>Horizontal</h4>

        <Tabs style={{ width: "100%" }}>
            <Tab label="Explore">So much to see. So little time.</Tab>
            <Tab label="Flights">Jump. Up and down.</Tab>
            <Tab label="Trips">Take a trip dude. Odyssey of the Mind</Tab>
        </Tabs>

        <h4>Vertical</h4>

        <Tabs style={{ width: "100%" }} orientation="vertical">
            <Tab label="Explore">So much to see. So little time.</Tab>
            <Tab label="Flights">Jump. Up and down.</Tab>
            <Tab label="Trips">Take a trip dude. Odyssey of the Mind</Tab>
        </Tabs>
        {code}
    </>
)
