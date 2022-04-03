class TXCalendar extends HTMLElement {
    static monthName = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ]

    constructor() {
        super()

        const shadow = this.attachShadow({ mode: 'open' })

        shadow.appendChild(TXCalendar.style.cloneNode(true))

        // unlike the css, we can fetch the icons from the document
        // Adobe nevertheless also loads them dynamically: https://opensource.adobe.com/spectrum-css/js/loadicons/index.js
        const icons = document.body.querySelector("svg#tx-icons")
        shadow.appendChild(icons.cloneNode(true))

        for(let child of this.render()) {
            shadow.appendChild(child)
        }

        // this isn't stable; doesn't use localtime?
        // Spectrum has tooltips like "Friday, August 5, 2017"
        this.now = new Date()
        this.year = this.now.getFullYear()
        this.month = this.now.getMonth()

        this.goToPreviousMonth = this.goToPreviousMonth.bind(this)
        this.goToNextMonth = this.goToNextMonth.bind(this)

        this.button[0].onclick = this.goToPreviousMonth
        this.button[1].onclick = this.goToNextMonth

        this.update()
    }

    goToPreviousMonth() {
        --this.month
        if (this.month < 0) {
            --this.year
            this.month = 11
        }
        this.update()
    }

    goToNextMonth() {
        ++this.month
        if (this.month > 11) {
            ++this.year
            this.month = 0
        }
        this.update()
    }

    render() {
        this.button = new Array(2)
        return [
            div(
                this.titleDiv = div(),
                array(2, (i) =>
                    this.button[i] = button(
                        svg("#chevron")
                    )),
            ),
            table(
                thead(
                    tr(
                        th("SUN"),
                        th("MON"),
                        th("TUE"),
                        th("WED"),
                        th("THU"),
                        th("FRI"),
                        th("SAT")
                    )
                ),
                this.body = tbody(
                    array(6, () => tr(
                        array(7, () => td(span()))
                    ))
                )
            )
        ]
    }

    update() {
        let today
        if (this.month == this.now.getMonth() && this.year == this.now.getFullYear()) {
            today = this.now.getDate()
        }

        let firstDay = new Date(this.year, this.month, 1, 0, 0, 0).getDay()
        let lastDay = new Date(this.year, this.month + 1, 0, 0, 0, 0).getDate()

        this.titleDiv.innerText = TXCalendar.monthName[this.month] + " " + this.year

        let dayOfMonth = 1
        for (let row = 0; row < 6; ++row) {
            for (let col = 0; col < 7; ++col) {
                const span = this.body.children[row].children[col].children[0]
                let text = ''
                let isToday = false
                if (!(row === 0 && col < firstDay) && dayOfMonth <= lastDay) {
                    // if (dayOfMonth == 8) {
                    //     text = '<span class="tx-selected">' + dayOfMonth + '</span>'
                    // } else

                    if (dayOfMonth == today) {
                        isToday = true
                    }
                    text = dayOfMonth++
                }
                if (isToday)
                    span.classList.add("tx-today")
                else
                    span.classList.remove("tx-today")
                span.innerText = text
            }
        }
    }
}

// https://wicg.github.io/construct-stylesheets/
// https://www.npmjs.com/package/construct-style-sheets-polyfill

// this doesn't always work when in the linked stylesheet.
// e.g. safari will sometimes align two calenders vertically insted of horizontally
// let style0 = document.createElement("style")
// style0.textContent = `
//     :host {
//         display: inline-block;
//     }`
// shadow.appendChild(style0)

// sed 's/.tx-calendar/:host/g' tx-calendar.css > tx-calendar.host.css
// const style = document.createElement('link')
// style.setAttribute('rel', 'stylesheet')
// style.setAttribute('href', 'tx-calendar.host.css')
// shadow.appendChild(style)

async function defineElement(cls, name) {
    const link = document.querySelector("link#tx-calendar")
    const styleUrl = link != null ? link.href : `${name}.css`
    console.log(link)
    console.log(styleUrl)
    const response = await fetch(styleUrl)
    const reader = response.body.getReader();
    let { value: chunk, done: readerDone } = await reader.read();
    const utf8Decoder = new TextDecoder('utf-8');
    chunk = chunk ? utf8Decoder.decode(chunk) : '';
    cls.style = document.createElement("style")
    cls.style.textContent = chunk.replaceAll(`.${name}`, ":host")

    window.customElements.define(name, cls)
}
defineElement(TXCalendar, "tx-calendar")

