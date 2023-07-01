import { css } from 'src/util/lsx'

export const style = document.createElement("style")
style.textContent = css`
:root {
  font-size: 100%;
  text-size-adjust: none;
  -webkit-text-size-adjust: none;

  --tx-font-family: 'IBM Plex Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  --tx-font-size: calc((12/16) * 1rem); /* equivalent to 12pt on paper */
  --tx-font-size-info: calc((11/16) * 1rem);

  --tx-fg-color: var(--tx-gray-700);
  --tx-bg-color: var(--tx-gray-50);
  --tx-placeholder-fg-color: var(--tx-gray-600);
  --tx-placeholder-fg-color-hover: var(--tx-gray-900);

  --tx-fg-color-disabled: var(--tx-gray-500);
  --tx-bg-color-disabled: var(--tx-gray-100);

  /* Edit */
  --tx-edit-font-size: calc((12/16) * 1rem);
  --tx-edit-font-weight: normal;

  --tx-edit-fg-color: var(--tx-gray-800);
  --tx-edit-fg-color-disabled: var(--tx-gray-500);

  --tx-edit-bg-color: var(--tx-gray-50);
  --tx-edit-bg-color-disabled: var(--tx-gray-100);

  --tx-selection-color: var(--tx-global-blue-500);
  --tx-warning-color: var(--tx-global-red-600);

  /* Border/Outline */

  /* outline indicates that the element has the focus */
  --tx-outline-color: var(--tx-blue-500);
  --tx-border-color: var(--tx-gray-400);
  --tx-border-color-hover: var(--tx-gray-500);
  --tx-border-width: 1px;
  --tx-border-radius: 4px;
}
body {
  font-family: var(--tx-font-family);
  font-size: var(--tx-font-size);
  font-weight: 400;
  line-height: 1.5;
}
p {
    margin: calc((6/16) * 1rem) 0;
}
b      { font-weight: bold }
strong { font-weight: bold }
h1 {
  font-size: calc((24/16) * 1rem);
  font-weight: 600;
}
h2 { 
  font-size: calc((22/16) * 1rem);
  font-weight: 600;
}
h3 {
  font-size: calc((18/16) * 1rem);
  font-weight: 500;
}
h4 {
  font-size: calc((14/16) * 1rem);
  font-weight: 500;
}
pre {
  font-family: "IBM Plex Mono", Courier, monospaced;
  font-size: calc((12/16) * 1rem);
  font-weight: normal;
  line-height: 1.1; /* 1.5625rem 25px */
}

/*
 * COLOR
 */
body {
    background: var(--tx-gray-100);
    color: var(--tx-gray-800);
}
a:link { 
    color: var(--tx-gray-900);
    font-weight: bold;
    text-decoration: none;
    text-decoration-style: solid;
    cursor: auto;
}
a:hover {
    text-decoration: underline; 
}
a:visited { 
    color: var(--tx-gray-900);
    cursor: auto;
}
a:link:active, a:visited:active { 
     color: var(--tx-gray-900);
}
body::-webkit-scrollbar {
    width: 10px;
    height: 10px;
}
body::-webkit-scrollbar-thumb {
    border-radius: 5px;
}
body::-webkit-scrollbar-track {
    background: #1e1e1e;
}
body::-webkit-scrollbar-corner {
    background: #1e1e1e;
}
body::-webkit-scrollbar-thumb {
    background: var(--tx-gray-500);
}
/* a:link::before {
  content: "→";
  text-decoration: none;
} */
`