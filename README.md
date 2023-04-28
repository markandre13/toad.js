<p align="center">
   <img src="https://markandre13.github.io/toad.js/toad.gif" alt="TOAD" /><br />
   .JS
</p>

<p align="center">
  → <a href="https://markandre13.github.io/toad.js/">Demo</a>
</p>

# About

toad.js supports building platform independent desktop applications as [Progressive Web Apps](https://en.wikipedia.org/wiki/Progressive_Web_Apps).

“desktop application” means
* large amount of input elements with also a significant amount of coupling between them
* large screen, hence support for mobile devices is not being a priority
* mouse and scroll wheel, hence support for touch screens not a priority
* pro users, hence a cooperate identity dependent look is not a priority
* undo/redo support (not yet)

[toad.js](https://github.com/markandre13/toad.js#readme) is based on dozen of UI libraries I looked into for inspiration, my experience creating the TOAD C++ GUI library ([UNIX/X11](https://github.com/markandre13/toad-x11#readme), [macOS/Cocoa](https://github.com/markandre13/toad-macosx#readme)), various applications I wrote and being the architect of the UIMS behind the [Phoenix Contact FL mGuard routers](https://www.phoenixcontact.com/en-us/products/industrial-communication/industrial-routers-and-cybersecurity), which feature different views for web, SNMP and CLI on top of shared application and domain layers.

The idea for a browser version of _toad_ dates back to 1995, when Netscape released JavaScript and I was wondering whether to choose X11/C++ or Netscape/JavaScript as a platform.

# Layered Architecture

toad.js supports two layers of a horizontal architecture (→ <a href="#ref1">DDD</a>, <a href="#ref2">Presentation Model</a>, <a href="#ref3">Application Model</a>)

<table>
  <tr>
    <th>Layer Name (DDD/Clean Architecture)</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>View/Presenters</td>
    <td>
      <p>
        Defines the structure of the User Interface.
      </p>
      <p>
        UX experts with a basic understanding of HTML/CSS should be able to
        work here, so the use of JavaScript or HTML attributes like <i>value</i>,
        <i>enabled</i>, <i>onchange</i>, ... is highly discouraged here.<br/>
        (→ <a href="#ref5">Presenters and Humble Objects</a>)
      </p>
      <p>
        Instead the HTML/JSX views provided by toad.js (e.g. Button, CheckBox, Text, Table ...)
        provide a <i>model</i>/<i>action</i> attribute refering to an Application Model which
        will then handle <i>value</i>, <i>enabled</i>, <i>onchange</i>, ... instead.
      </p>
      <p>
        Example: <br/>
        <code>&lt;Table model={shoppingList}/&gt;<br/>
        &lt;Button action={order}&gt;Buy&lt;/Button&gt;</code>
      </p>
      <p>
        Note for developers: JSX is merely used to be notified about type errors
        ASAP while editing or compiling. It translates directly to DOM with toad.js
        elements being web components.
      </p>
    </td>
    <td></td>
  </tr>
  <tr>
    <td>Application/Use Cases</td>
    <td>
      <p>
        Defines the behaviour of the User Interface using Application Models
        provided by toad.js (e.g. TextModel, NumberModel, BooleanModel, OptionModel, ...)
      </p>
      <p>
        Example:<br/>
        <code>const shoppingList = StringArrayModel(getCurrentShoppingList())</br>
        const order = Action(() => orderCurrentShoppingList())<br/>
        order.enabled = false</code><br/>
        (Action isn't implemented like this yet...)
      </p>
    </td>
  </tr>
  <tr>
    <td>Domain/Entities</td>
    <td>
        <p>
            Enterprise wide business rules, e.g. customer numbers, articles, orders, ... 
            which can be shared among different applications/teams. (→ <a href="#ref4">Business Rules</a>)
        </p>
        <p>
            This part ideally uses only functions/objects which are part of the
            programming language, e.g. string, number, Array, ...
        </p>
        <p>
            For client/server (frontend/backend) applications, this is ideally written
            in a language which can compile to different platforms like browser and
            server so that input validation and business rules can be used to provide
            immediate user feedback in the frontend and enforcing data consistency in
            the backend.
        </p>
    </td>
  </tr>
</table>

# State and Progress

Development is happening in my spare time and focused on the desktop version of Safari to support the development of [workflow](https://github.com/markandre13/workflow#readme) and [makehuman.js](https://github.com/markandre13/makehuman.js#readme).

<hr/>

### References

<ul>
    <li>
        <a id="ref1">[1]</a> Evans, E. (2004) “Layered Architecture,” in <i>Domain Driven Design</i>. Boston, US: Edison Wesley, pp. 68–71. 
    </li>
    <li>
        <a id="ref2">[2]</a> Fowler, M. (2004) <i>Presentation Model</i>, <i>Development of Further Patterns of Enterprise Application Architecture</i>. Available at: <a href="https://martinfowler.com/eaaDev/PresentationModel.html">https://martinfowler.com/eaaDev/PresentationModel.html</a> (Accessed: April 28, 2023). 
    </li>
    <li>
         <a id="ref3">[3]</a> Lewis, S. (1995) “An Extension to MVC,” in <i><a href="https://rmod-files.lille.inria.fr/FreeBooks/Art/artAdded174186187Final.pdf">The Art and Science of Smalltalk</a></i>. London, UK: Prentice Hall, pp. 91–101. 
    </li>
    <li>
         <a id="ref4">[4]</a> Martin, R. (2018) “Business Rules,” in <i>Clean Architecture</i>. Boston, US: Prentice Hall, pp. 190-193.
    </li>
    <li>
         <a id="ref5">[5]</a> Martin, R. (2018) “Presenters and Humble Objects,” in <i>Clean Architecture</i>. Boston, US: Prentice Hall, pp. 212–215.
    </li>
</ul>
