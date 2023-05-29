import { css } from "../util/lsx"

export const style = new CSSStyleSheet()
style.replaceSync(css`
#root {
    position: relative;
    width: 354px;
    height: 344px;
    border: solid 1px #fff;
}
#canvas {
    position: absolute;
    top: 8px;
    left: 8px;
}
#hsv {
    position: absolute;
    border: 2px solid var(--tx-gray-700); /* knob border */
    border-radius: 50%;
    background: var(--tx-gray-75); /* inside knob */
    cursor: pointer;
    width: 14px;
    height: 14px;
    box-sizing: border-box;
    outline-width: 0px;
    border-radius: 50%;
    transform: translate(-50%, -50%);
}
#sv {
    position: absolute;
    top: 8px;
    left: 264px;
    height: 256px;
}
#sr {
    position: absolute;
    top: 8px;
    left: 294px;
    height: 256px;
}
#sg {
    position: absolute;
    top: 8px;
    left: 314px;
    height: 256px;
}
#sb {
    position: absolute;
    top: 8px;
    left: 332px;
    height: 256px;
}
#lh {
    position: absolute;
    top: 272px;
    left: 8px;
    width: 14px;
    height: 28px;
    display: flex;
    justify-content: center;
    flex-direction: column;
}
#th {
    position: absolute;
    top: 272px;
    left: ${8 + 14}px;
    width: 45px;
}
#ls {
    position: absolute;
    top: 272px;
    left: ${8 + 14 + 45 + 8}px;
    width: 14px;
    height: 28px;
    display: flex;
    justify-content: center;
    flex-direction: column;
}
#ts {
    position: absolute;
    top: 272px;
    left: ${8 + 14 + 45 + 8 + 14}px;
    width: 45px;
}
#lv {
    position: absolute;
    top: 272px;
    left: ${8 + 14 + 45 + 8 + 14 + 45 + 8}px;
    width: 14px;
    height: 28px;
    display: flex;
    justify-content: center;
    flex-direction: column;
}
#tv {
    position: absolute;
    top: 272px;
    left: ${8 + 14 + 45 + 8 + 14 + 45 + 8 + 14}px;
    width: 45px;
}

#lr {
    position: absolute;
    top: ${272 + 28 + 8}px;
    left: 8px;
    width: 14px;
    height: 28px;
    display: flex;
    justify-content: center;
    flex-direction: column;
}
#tr {
    position: absolute;
    top: ${272 + 28 + 8}px;
    left: ${8 + 14}px;
    width: 45px;
}
#lg {
    position: absolute;
    top: ${272 + 28 + 8}px;
    left: ${8 + 14 + 45 + 8}px;
    width: 14px;
    height: 28px;
    display: flex;
    justify-content: center;
    flex-direction: column;
}
#tg {
    position: absolute;
    top: ${272 + 28 + 8}px;
    left: ${8 + 14 + 45 + 8 + 14}px;
    width: 45px;
}
#lb {
    position: absolute;
    top: ${272 + 28 + 8}px;
    left: ${8 + 14 + 45 + 8 + 14 + 45 + 8}px;
    width: 14px;
    height: 28px;
    display: flex;
    justify-content: center;
    flex-direction: column;
}
#tb {
    position: absolute;
    top: ${272 + 28 + 8}px;
    left: ${8 + 14 + 45 + 8 + 14 + 45 + 8 + 14}px;
    width: 45px;
}
#oc {
    position: absolute;
    top: 280px;
    left: ${8 + 14 + 45 + 8 + 14 + 45 + 8 + 14 + 48 + 8 + 8 + 16}px;
    width: ${28 - 8 + 28}px;
    height: ${28 - 8 + 28}px;
}
#nc {
    position: absolute;
    top: 280px;
    left: ${8 + 14 + 45 + 8 + 14 + 45 + 8 + 14 + 48 + 8 + 28 + 8 + 28 + 8}px;
    width: ${28 - 8 + 28}px;
    height: ${28 - 8 + 28}px;
}
`)
