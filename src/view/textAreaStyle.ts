export let textAreaStyle = document.createElement("style")
textAreaStyle.textContent=`

/* try to follow material ui: when active render button labels in black, otherwise in gray */
svg .fill {
  fill: #ccc;
  stroke: #ccc;
}
svg .stroke {
  fill: none;
  stroke: #ccc;
}
svg .strokeFill {
  fill: #fff;
  stroke: #ccc;
}

.toolbar.active svg .fill {
  fill: #000;
  stroke: #000;
}
.toolbar.active svg .stroke {
  fill: none;
  stroke: #000;
}
.toolbar.active svg .strokeFill {
  fill: #fff;
  stroke: #000;
}

.toolbar button {
    background: #fff;
    color: #000;
    border: 1px #ccc;
    border-style: solid solid solid none;
    padding: 5;
    margin: 0;
    vertical-align: middle;
    height: 22px;
}

.toolbar button:active:hover {
  background: linear-gradient(to bottom, #7abcff 0%,#0052cc 100%,#4096ee 100%);
}

.toolbar button.left {
    border-style: solid;
    border-radius: 3px 0 0 3px;
}

.toolbar button.right {
    border: 1px #ccc;
    border-style: solid solid solid none;
    border-radius: 0 3px 3px 0;
}

.toolbar button.active {
    background: linear-gradient(to bottom, #7abcff 0%,#0052cc 100%,#4096ee 100%);
    border: 1px #0052cc solid;
    color: #fff;
}

div.textarea {
  font-family: var(--toad-font-family, sans-serif);
  font-size: var(--toad-font-size, 12px);
  border: 1px #ccc solid;
  border-radius: 3px;
  margin: 2px;
  padding: 4px 5px;
  outline-offset: -2px;
}

div.textarea h1 {
  font-size: 22px;
  margin: 0;
  padding: 4px 0 4px 0;
}

div.textarea h2 {
  font-size: 18px;
  margin: 0;
  padding: 4px 0 4px 0;
}

div.textarea h3 {
  font-size: 16px;
  margin: 0;
  padding: 4px 0 4px 0;
}

div.textarea h4 {
  font-size: 14px;
  margin: 0;
  padding: 4px 0 4px 0;
}

div.textarea div {
  padding: 2px 0 2px 0;
}
`
