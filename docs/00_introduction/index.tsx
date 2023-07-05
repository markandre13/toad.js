//
// VIEW LAYER
//

export default () => (
    <>
        <style>{`dt { font-weight: bold}`}</style>
        <h1>Introduction</h1>

        <div style={{ display: "grid", gridTemplateColumns: "auto auto", gridTemplateRows: "1" }}>
            <div class="section">
                <h3>Foundations</h3>
                <dl>
                    <dt>Web Components &amp; ESM</dt>
                    <dd>
                        “Modern browsers are a powerful platform for building websites and applications. We try to work
                        with what's available in the browser first before reaching for custom solutions.”
                        <br />
                        <a href="https://modern-web.dev/discover/about/">https://modern-web.dev/discover/about/</a>
                    </dd>
                    <dt>TypeScript</dt>
                    <dd>Allows to catch a variety of errors at compile time.</dd>
                    <dt>JSX</dt>
                    <dd>
                        Leverages TypeScript's type-safety into HTML. No Virtual DOM, JSX is directly translated into DOM
                        nodes. While using code and style attributes is possible, it should be avoided.
                    </dd>
                </dl>
            </div>
            <div class="section">
                <h3>Look</h3>
                <dl>
                    <dt>
                        <a href="https://spectrum.adobe.com">Adobe's Spectrum design system</a>
                    </dt>
                    <dd>
                        Choosen for it's spartan look and platform agnostic appearance. (Adobe has three different
                        implementations and naturally toad.js also has it's own implementation.)
                    </dd>
                    <dt>
                        <a href="https://www.ibm.com/plex/">IBM's Plex typeface</a>
                    </dt>
                    <dd>
                        Choosen for it's coverage of sans, sans-serif and monospaced fonts, it's broad variety of
                        weights and languages and being provided under the
                        <a href="https://scripts.sil.org/OFL">SIL Open Font License 1.1</a>.
                    </dd>
                </dl>
            </div>
        </div>
        <div style={{ textAlign: "center" }}>
            <img
                srcset="static/ui-architecture-2x.webp 2x"
                src="static/ui-architecture-1x.webp"
                style={{
                    objectFit: "scale-down",
                    width: "100%",
                    height: "auto",
                    maxHeight: "552px",
                }}
            />
        </div>
        <div class="section">
            <h3>Architecture</h3>
            <p>
                toad.js is build around the idea of horizontal layers (which does not exclude the use of vertical
                layers, e.g. like sales, procurement, ...). For two of those layers toad.js provides separate
                collections of components.
            </p>
            <dl>
                <dt>View Layer (Look &amp; Structure)</dt>
                <dd>
                    <p>
                        This layer defines the <u>look and structure of the user interface</u> and uses <u>HTML/CSS</u>,
                        for which toad.js provides a collection of buttons, sliders, text, numbers, tables, etc..
                    </p>
                    <p>
                        Unlike plain HTML there is <u>no need to write JavaScript code</u>. Instead a <em>model</em>{" "}
                        attribute will connect the HTML element to the next layer, which then defines the behaviour of
                        the element.
                    </p>
                    <p>
                        This approach lets <u>designers, users and domain experts pair</u> during the implementation of
                        the user interface. The idea is to open a browser window on one side of the screen and a text
                        editor on the other and then interactively tweak the design during a pairing/mob programming
                        session.
                    </p>
                    <p>
                        Since there is no application code in this layer, there is <u>no need to write unit tests</u>{" "}
                        for it. Visual regressions tests are sufficient. This pattern is known as{" "}
                        <em>Humble Presenter</em> and even approved by TDD advocate Robert 'Uncle Bob' Martin in his
                        'Clean Architecture' book.
                    </p>
                    <p>
                        Other names for this layer are <em>User Interface Layer</em> or <em>Presentation Layer</em>.
                    </p>
                </dd>
                <dt>Application Layer (Behaviour)</dt>
                <dd>
                    <p>
                        This layer defines the <u>behaviour of the user interface</u> and uses TypeScript, for which
                        toad.js provides a collection of pre-defined models for text, floating and fixed point numbers,
                        colors, tables, email addresses, etc. (Different people call these <em>View Models</em>,{" "}
                        <em>Presentation Models</em> or <em>Application Models</em>).
                    </p>
                    <p>
                        These models contain the data shown and modified by the user and can be enabled/disabled, create
                        error messages, define colors (e.g. when negative number should be shown in red and positive
                        numbers in black.)
                    </p>
                    <p>
                        In the future the will also be models for ISBNs, IBANs, quantities like distances, weight,
                        currency and some of them will even be able to evaluate expressions like "1kg + 5g".
                    </p>
                    <p>
                        Other names for this layer are <em>View Model</em> Layer or <em>Use-Case Layer</em> or{" "}
                        <em>Application Business Rule Layer</em>.
                    </p>
                </dd>
                <dt>Domain Layer</dt>
                <dd>
                    <p>This is completely left to the user.</p>
                    <p>
                        Other names for this layer are <em>Entity Layer</em>, or{" "}
                        <em>Enterprise Business Rules Layer</em>.
                    </p>
                </dd>
                <dt>Infrastructure Layer</dt>
                <dd>
                    <p>toad.js doesn't provide anything on this layer yet.</p>
                    <p>
                        The plan is to provide a middleware to hide the gap between web browser and web server. E.g. to
                    </p>
                    <ul>
                        <li>have one shared ruleset between frontend and backend to validate user input</li>
                        <li>handle paged lists or arbitrary large tables</li>
                    </ul>
                    <p>
                        Also, when handling data which hasn't been loaded from the network yet, the goal is to display
                        the view and enable each input element on it's own once it's data is available.
                    </p>
                </dd>
            </dl>
        </div>
    </>
)
