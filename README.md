<p align="center">
   <img src="https://markandre13.github.io/toad.js/toad.gif" alt="TOAD" /><br />
   WebComponent/TypeScript Edition
</p>

<p align="center">
  <a href="https://markandre13.github.io/toad.js/">Take look at the upcoming 0.1.0 release! 👀</a>
</p>

## Welcome to the TOAD GUI Library

TOAD is a collection of Views and [Presentation/View Models](https://martinfowler.com/eaaDev/PresentationModel.html)
based on open standards and design patterns intended for the creation of [Progressive Web Apps](https://en.wikipedia.org/wiki/Progressive_Web_Apps).

The following table illustrates what is meant with _open standards_ by comparing them to the properitary approaches offered by React:

|              | Open Standard                         | React                                                                                      |
|--------------|---------------------------------------|--------------------------------------------------------------------------------------------|
| Components   | JavaScript classes (WebComponents)    | functions as classes, class variables via state hooks, class methods via side effect hooks |
| Reactivity   | Observer Pattern                      | when replacing immutable state owned by the view, the view is updated                      |
| Binding      | JSX (returns DOM and update function*)| JSX (returns Virtual DOM)                                                                  |
| DOM update   | update directly aka. Incremental DOM  | updates DOM by merging the Virtual DOM into the DOM                                        |
| Domain Model | no restrictions                       | restricted to React state or separating it into Redux, MobX, ...                           |

*) Returning an update function from JSX isn't included yet. It started as an experiment to see if JSX could be used in a similar way to Svelte's pre-compiler to create an Incremental DOM.

Development is happening in my spare time and focused on Safari, the Desktop and to support the development of [workflow](https://github.com/markandre13/workflow#readme) and [makehuman.js](https://github.com/markandre13/makehuman.js#readme).

But it _should_ basically work on any other modern browser.

Please see Github for more information:

* [README](https://github.com/markandre13/toad.js#readme)

[toad.js](https://github.com/markandre13/toad.js#readme) is based on my experience creating the TOAD C++ GUI library ([UNIX/X11](https://github.com/markandre13/toad-x11#readme), [macOS/Cocoa](https://github.com/markandre13/toad-macosx#readme)), dozen other UI libraries I looked up to for inspiration as well as the various applications written with it
over mode than two decades.
