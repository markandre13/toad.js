import { code } from "./index.source"
import { Menu } from "@toad/menu/Menu"

export default () => (
    <>
        <h1>Menu</h1>
        <Menu
            config={[
                {
                    name: "file",
                    label: "File",
                    sub: [
                        {
                            name: "new",
                            label: "New",
                            sub: [
                                { name: "board", label: "Board" },
                                { name: "card", label: "Card" },
                                { name: "document", label: "Document" },
                            ],
                        },
                        { name: "open", label: "Open" },
                        { name: "save", label: "Save" },
                        { separator: true },
                        { name: "quit", label: "Quit" },
                    ],
                },
                {
                    name: "edit",
                    label: "Edit",
                    sub: [
                        { name: "undo", label: "Undo", shortcut: "Ctrl+Z" },
                        { name: "redo", label: "Redo", shortcut: "Ctrl+Y" },
                        { separator: true },
                        { name: "cut", label: "Cut", shortcut: "Ctrl+X" },
                        { name: "copy", label: "Copy", shortcut: "Ctrl+C" },
                        { name: "paste", label: "Paste", shortcut: "Ctrl+V" },
                        { name: "delete", label: "Delete", shortcut: "Del" },
                    ],
                },
                { space: true },
                {
                    name: "help",
                    label: "Help",
                    sub: [
                        { name: "manual", label: "Manual" },
                    ],
                },
            ]}
        />
        {code}
    </>
)
