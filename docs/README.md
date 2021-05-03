# toad.js

<p align="center">
   <img src="toad.gif" alt="TOAD" /><br />
   WebComponent/TypeScript Edition
</p>

# Welcome to the TOAD GUI Library.

### About

 * toad.js utilizes ***WebComponents*** and hence doesn't need all the infrastructure code burdening
  React or Angular and therefore fits nicely into 71KB (2KB gzipped).

* toad.js provides ***Model-View-Controller (MVC)*** for WebComponents, encouraging a clear
  separation of view (user interface), model (business data and logic) and controller (code connecting model and view). React's JSX, most likely being inspired by Facebook's former usage of PHP, on the other hand encourages mixing of view (HTML) and code  (Controller & Model), usually resulting in code which is hard to maintain.

* ***MVC Doesn't Scale?*** When Facebook's React team presented Flux as an alternative to "*MVC*",
  they were referring to *JSP Model 2*, a webserver based architecture which has nothing in
  common with *MVC* but the terms _model_, _view_ and _controller_.
  
  The *MVC* concept by
  Trygve Reenskaug is an established and proven object oriented design pattern used in
  many desktop ui frameworks. *MVC* can furthermore be extended by the *DCI*
  (data, context, interaction) pattern to structure complex applications.

  That said, React/Flux basically *is* a *MVC* variant, with React Components providing
  the *View* and Flux's state the *Model*, solving all the issues Facebook struggled to
  fix in their chat implementation.

  Btw. checkout the [React.js with toad.js' models](https://github.com/markandre13/react-with-toad-models) experiment.


* ***No Shadow DOM***: The Shadow DOM approach is fine if your WebApp resembles a document.
  toad.js on the other hand is aimed for highly interactive desktop style WebApps.

  Shadow DOM based libraries like React, Angular or Vue.js mimic the classic webserver
  approach, where the full HTML page is rendered on the server and then send to the client:
  They render a full page into the Shadow DOM and then merge the changes into the browser's DOM.

  Instead of constructing interactive elements like text fields, buttons, lists or tables
  using HTML, toad.js provides a set of WebComponents which update the DOM efficiently on
  their own and which just need to be linked to the application's state (models).

* Support for table and tree views is in active development.

* Support for Routing, Undo/Redo, Dialogs, Copy'n Paste, Drag'n Drop, etc. is on the roadmap.

Please see the <a href="https://markandre13.github.io/toad-demo/">introduction</a> for further
information.

toad.js is currently being written to develop <a href="https://github.com/markandre13/workflow">workflow - A collaborative real-time white- and kanban board</a>.

## Previous versions of TOAD
* [C++ X11](https://github.com/markandre13/toad-x11)
* [C++ Cocoa](https://github.com/markandre13/toad-macosx)