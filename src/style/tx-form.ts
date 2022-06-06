/* 
 * Form 
 * Available in two variants: labels on the side (wide screen) and labels on the top (narrow screen)
 * This is achieved by using a table for wide screen.
 */
import { css } from 'src/util/lsx'

export const style = document.createElement("style")
style.textContent = css`
.tx-form {
    display: table;
    border-collapse: separate;
    border-spacing: 0 24px 0 0;
    margin: calc(20px * -1) 0;
}

.tx-form>div {
    display: table-row;
    border-collapse: separate;
    border-spacing: 0 24px;
}

.tx-form>div>label {
    display: table-cell;
    padding: 8px 12px 0 0;
    text-align: right;
}

.tx-form>div>input {
    display: table-cell;
}`