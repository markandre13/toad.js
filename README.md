<p align="center">
   <img src="https://markandre13.github.io/toad.js/toad.gif" alt="TOAD" /><br />
   Web Edition
</p>

<p align="center">
  → <a href="https://markandre13.github.io/toad.js/">Demo</a>
</p>

## About

toad.js is for building desktop applications on top of [modern web](https://modern-web.dev/)
technologies with a TypeScript transpiler and a browser being the only dependencies.

With <q>desktop applications</q> refering to:

* complex domain data with a significant amount of coupling
* large screen, mouse and scroll wheel ⇒ support for mobile devices is not a priority
* pro users ⇒ no eye candy, all apps have the same look

For this toad.js provides a toolbox for design patterns like

* Layered Architecture (<a href="#ref1">DDD</a>),
* <a href="#ref5">Presenters and Humble Objects</a> (Clean Architecture),
* <a href="#ref2">Presentation Model</a> (Martin Fowler),
* <a href="#ref3">Application Model</a> (VisualWorks) and
* good ol' <a href="#asterisk">MVC</a>. 😁

While this pattern slices an application horizontally (e.g. presentation, application, domain),
some believe it to be obsolete and replaced by vertical slices (e.g. customer, article, payment, ...).
This, of course, depends. When vertical slices remain too wide because of the coupling imposed
by the domain there is still the option to do both.

## Layered Architecture

Layer names are in the order of DDD / Clean Architecture:

<table>
  <tr>
    <th valign="top">View / Presentation</th>
    <td>
      <p>
        Defines the structure of the User Interface using plain HTML/JSX and CSS aimed at
        UI/UX/Web Designers.
      </p>
      <p>
        All application behaviour/code has been removed from this layer, meaning that
        HTML attributes like <i>value</i>, <i>disabled</i>, <i>onchange</i> are replaced
        by <i>model</i>/<i>action</i> attributes referring to the next layer.
      </p>
    </td>
    <td></td>
  </tr>
  <tr>
    <th valign="top">Application / Use Case</th>
    <td>
      <p>
        Application specific rules which define the behaviour of the user interface.
      </p>
      <p>
        For this toad.js provides a collection of ViewModels, like TextModel, EmailModel,
        or NumberModel, which broker between the View and the Domain layer.
      </p>
      <p>
        Additionally to this they can be enabled/disabled, provide labels and more detailed descriptions, validate input, provide error messages, provide support for undo/redo
        or even perform simple arithmetics, e.g. converting input like 6*7 into 42 or
        10cm+5mm into 105mm. (Not all of it yet implemented.)
      </p>
    </td>
  </tr>
  <tr>
    <th valign="top">Domain / Entities</th>
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

## About me

I've been developing applications on top of my own user interface libraries since [OWL](https://en.wikipedia.org/wiki/Object_Windows_Library) in 1991, always trying to look at how other frameworks worked. With one exception: SmallTalk. While most SmallTalk systems didn't age well, ideas like
live coding or user programmable computers still look like something from the future.

The C++ version of TOAD began in 1995 after having worked with [OSF/Motif](https://en.wikipedia.org/wiki/Motif_(software)) when I realized that

* an ugly user interface framework will most likely result in an ugly user experience
* there is nothing more annoying than being forced to write lots of boilerplate code
* user interface creation should be interactive

Besides the C++ versions of TOAD on top of Java AWT, Fresco, macOS, Windows and X11 and it being the subject of my diploma thesis, toad.js also builds on almost two decades as architect of the [Phoenix Contact mGuard](http://help.mguard.com/)'s frontend, whose device independent application layer is able to serve CLI, SNMP and Web interfaces and which made UI development an absolute no-brainer.

Development is happening in my spare time and focused on the desktop version of Safari to support the development of [workflow](https://github.com/markandre13/workflow#readme) and [makehuman.js](https://github.com/markandre13/makehuman.js#readme).

<hr/>

<a id="asterisk">*</a>) You may recognise that the above accumulates into a pattern known as
Model-View-Controller (MVC), which, undeservedly, got a somewhat bad reputation during recent
years. So let's set the record straight:

* MVC in a nutshell:

  * <q>We can solve any problem by introducing an extra level of indirection.</q><br />
  <cite>[Fundamental Theorem of Software Engineering](https://en.wikipedia.org/wiki/Fundamental_theorem_of_software_engineering)<cite>
  * _Model_ means a model of something, e.g. a shopping cart, inside the computer,
    consiting of data *and* behaviour.
  * _View_ means a visual representation of that model to the user. E.g. a number might be
    represented by a text field and a slider.
  * _MVC_ means to keep View and Model separate. (Think Flux, Redux, MobX, ...)
  * _MVVM_ means to further separate the Model into an application independent domain part
    and an application relevant part.
  
* The MVC you see in Ruby on Rails or Spring Boot are **not** MVC.
  The correct name is [JSP model 2](https://en.wikipedia.org/wiki/JSP_model_2_architecture).

* Forget about the _Controller_ in MVC. The _Controller_ is an aspect of SmallTalk to
  insert the view into the system's message distribution. In contemporary systems they can be
  considered as part of the View.

* The true leverage of MVC/MVVM does not come from the pattern itself, but the vast collection of
  prefabricated Views and ViewModels from which you can assemble your application.

  It should support forms with input validation including dependencies between different values;
  arbitrary sized tables which can be edited, resized, sorted and filtered; arithmetic in numerical
  fields; undo/redo, etc.

* Most MVC/MVVM frameworks are overcomplicated while lacking an adequate collection of Views
  and ViewModels.

* What Facebook's React team got wrong about MVC:

  * <q>Let’s look at what happens to this [MVC] diagram when we add a lot of models and when we add
    a lot of views to the system. There's just an explosion of arrows.</q><br />
    <cite>[Hacker Way: Rethinking Web App Development at Facebook 10:49](https://youtu.be/nYkdrAPrdcw?t=649)</cite>

    What the React team shows here is **NOT** MVC.

  * <q>And if you just look at these arrows, can you tell if there's an infinite loop here?
    Where, you know, the model triggers something in the view and the view triggers something in
    a different model. It goes in a cycle. It’s really hard to tell just by looking at this</q><br />
    <cite>[Hacker Way: Rethinking Web App Development at Facebook 10:49](https://youtu.be/nYkdrAPrdcw?t=649)</cite>

    This does **NOT** happen in MVC. The View changes the Model only on user input. An infinite loop
    of this kind can still happen in both MVC and React/Flux when the View does not adhere to this
    rule.

    Infinite loops may happen in the application layer, e.g. when a RGB triple sets a HSV triple
    which in turn wants to set the RGB triple again and variation in floating point calculation
    results in an endless loop. Explicit locks or implicit locks in the model are a means to get
    rid of these kinds of loops.

  * <q>So we want to do away with all of this. We want, what we propose instead, is something
    called FLUX.</q><br />
    <cite>[Hacker Way: Rethinking Web App Development at Facebook 11:40](https://youtu.be/nYkdrAPrdcw?t=700)</cite>

    FLUX is a rebranded MVC: Action = Message, Store = Model, Dispatcher = Event Loop, View = View.

   * <q>It’s a single directional data flow. Em, and that avoids all of the double arrows that
     are going, that go in both directions, that make it really hard to understand the system.</q><br />
     <cite>[Hacker Way: Rethinking Web App Development at Facebook 11:45](https://youtu.be/nYkdrAPrdcw?t=705)</cite>

     Same as in MVC. Still, both go around in a circle, so both are still bi-directional.

<hr/>

### Development

How to run single test files:

    npm run dev:build

    npm run dev:test --file=./lib/test/view/ToolButton.spec.js

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
