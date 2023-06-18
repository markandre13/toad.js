//
// VIEW LAYER
//

export default () => (
    <>
        <style>{`dt { font-weight: bold}`}</style>
        <h1>Introduction</h1>
        <div class="section">
            <p>
                toad.js is build around the idea of horizontal layers (which does not exclude the use of vertical
                layers, e.g. like sales, procurement, ...). For two of those layers toad.js provides separate collections of
                components.
            </p>
        </div>
        <div style={{ textAlign: "center" }}>
            <img srcset="static/ui-architecture-2x.webp 2x" src="static/ui-architecture-1x.webp" />
        </div>
        <div class="section">
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
                        The plan is to provide a middleware to hide the gap between web browser and web server.
                        E.g. to
                        </p>
                        <ul>
                            <li>have one shared ruleset between frontend and backend to validate user input</li>
                            <li>handle paged lists or arbitrary large tables</li>
                        </ul>
                        <p>
                         Also,
                        when handling data which hasn't been loaded from the network yet, the goal is to display the
                        view and enable each input element on it's own once it's data is available.
                    </p>
                </dd>
            </dl>
        </div>
    </>
)
