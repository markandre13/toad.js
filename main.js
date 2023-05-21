var example=function(t){"use strict";class e{constructor(t,e){this.callback=t,this.id=e}}class i{add(t,i){this.callbacks||(this.callbacks=new Array),this.callbacks.push(new e(t,i))}remove(t){if(this.callbacks)for(let e=this.callbacks.length-1;e>=0;--e)this.callbacks[e].id===t&&this.callbacks.splice(e,1)}count(){return this.callbacks?this.callbacks.length:0}lock(){this.locked=!0}unlock(){if(this.locked=void 0,this.triggered){let t=this.triggered.data;this.triggered=void 0,this.trigger(t)}}withLock(t){this.lock();const e=t();return this.unlock(),e}trigger(t){if(this.locked)this.triggered={data:t};else if(this.callbacks)for(let e=0;e<this.callbacks.length;++e)this.callbacks[e].callback(t)}}class s{constructor(t){this.modified=new i,this.options=t}set enabled(t){this.options?.enabled!==t&&(void 0===this.options&&(this.options={}),this.options.enabled=t,this.modified.trigger(void 0))}get enabled(){return!1!==this.options?.enabled}set color(t){this.options?.color!==t&&(void 0===this.options&&(this.options={}),this.options.color=t,this.modified.trigger(void 0))}get color(){return this.options?.color}set label(t){this.options?.label!==t&&(void 0===this.options&&(this.options={}),this.options.label=t,this.modified.trigger(void 0))}get label(){return this.options?.label}set description(t){this.options?.description!==t&&(void 0===this.options&&(this.options={}),this.options.description=t,this.modified.trigger(void 0))}get description(){return this.options?.description}set error(t){this.options?.error!==t&&(void 0===this.options&&(this.options={}),this.options.error=t,this.modified.trigger(void 0))}get error(){return this.options?.error}}class o extends s{constructor(t="",e){super(e),this.value=t}set promise(t){this._value=t,this.modified.trigger()}get promise(){if("string"==typeof this._value){const t=this._value;return()=>t}return this._value}set value(t){this._value!==t&&("string"==typeof t?this.modified.withLock((()=>{this.error=void 0,this._value=t,this.modified.trigger()})):console.trace(`TextModel.set value(value: string): ${typeof t} is not type string`))}get value(){switch(typeof this._value){case"number":case"string":this._value=`${this._value}`;break;case"function":this._value=this._value()}return this._value}}class n extends o{constructor(t){super(t)}}class l extends s{constructor(t,e){super(e),this._value=t}set value(t){this._value!=t&&(this._value=t,this.modified.trigger())}get value(){return this._value}}class r extends l{constructor(t){super(t)}}class a extends l{constructor(t,e){super(t,e)}increment(){void 0!==this.step&&(this.value+=this.step)}decrement(){void 0!==this.step&&(this.value-=this.step)}set value(t){this.modified.withLock((()=>{let e;void 0!==this.min&&t<this.min&&(this.autocorrect?t=this.min:e=`The value must not be below ${this.min}.`),void 0!==this.max&&t>this.max&&(this.autocorrect?t=this.max:e=`The value must not be above ${this.max}.`),super.value=t,this.error=e}))}get value(){return super.value}set min(t){this.options?.min!==t&&(void 0===this.options&&(this.options={}),this.options.min=t,this.modified.trigger(void 0))}get min(){return this.options?.min}set max(t){this.options?.max!==t&&(void 0===this.options&&(this.options={}),this.options.max=t,this.modified.trigger(void 0))}get max(){return this.options?.max}set step(t){this.options?.step!==t&&(void 0===this.options&&(this.options={}),this.options.step=t,this.modified.trigger(void 0))}get step(){return this.options?.step}set autocorrect(t){this.options?.autocorrect!==t&&(void 0===this.options&&(this.options={}),this.options.autocorrect=t,this.modified.trigger(void 0))}get autocorrect(){return!0===this.options?.autocorrect}}class h extends s{constructor(t,e){super(),this.signal=new i,this.title=e}set value(t){throw Error("Action.value can not be assigned a value")}get value(){throw Error("Action.value can not return a value")}trigger(t){this.enabled&&this.signal.trigger(t)}}class d{constructor(){this.modelId2Models=new Map,this.modelId2Views=new Map,this.view2ModelIds=new Map,this.sigChanged=new i}registerAction(t,e){let i=new h(void 0,t);return i.signal.add(e),this._registerModel("A:"+t,i),i}registerModel(t,e){this._registerModel("M:"+t,e)}_registerModel(t,e){let i=this.modelId2Models.get(t);i||(i=new Set,this.modelId2Models.set(t,i)),i.add(e);let s=this.modelId2Views.get(t);if(s)for(let t of s)t.setModel(e)}registerView(t,e){if(e.controller&&e.controller!==this)return void console.log("error: attempt to register view more than once at different controllers");e.controller=this;let i=this.view2ModelIds.get(e);i||(i=new Set,this.view2ModelIds.set(e,i)),i.add(t);let s=this.modelId2Views.get(t);s||(s=new Set,this.modelId2Views.set(t,s)),s.add(e);let o=this.modelId2Models.get(t);if(o)for(let t of o)e.setModel(t)}unregisterView(t){if(!t.controller)return;if(t.controller!==this)throw Error("attempt to unregister view from wrong controller");let e=this.view2ModelIds.get(t);if(e)for(let i of e){let e=this.modelId2Views.get(i);e&&(e.delete(t),0===e.size&&this.modelId2Views.delete(i),t.setModel(void 0))}}clear(){for(let t of this.view2ModelIds)t[0].setModel(void 0);this.modelId2Models.clear(),this.modelId2Views.clear(),this.view2ModelIds.clear()}bind(t,e){this.registerModel(t,e)}action(t,e){return this.registerAction(t,e)}text(t,e){let i=new o(e);return this.bind(t,i),i}html(t,e){let i=new n(e);return this.bind(t,i),i}boolean(t,e){let i=new r(e);return this.bind(t,i),i}number(t,e,i){let s=new a(e,i);return this.bind(t,s),s}}let c=new d;function p(t,e){c.bind(t,e)}function u(t,e){return c.registerAction(t,e)}class g{constructor(t,e){this.object=t,this.attribute=e.toString()}get(){return this.object[this.attribute]}set(t){Object.defineProperty(this.object,this.attribute,{value:t})}toString(){return`${this.object[this.attribute]}`}fromString(t){const e=typeof this.object[this.attribute];let i;switch(e){case"string":i=t;break;case"number":i=Number.parseFloat(t);break;default:throw Error(`Reference.fromString() isn't yet supported for type ${e}`)}Object.defineProperty(this.object,this.attribute,{value:i})}}function b(t,e,i){return void 0!==e&&void 0!==e.children&&(e.children=[e.children]),m(t,e)}function m(t,e,i){let s;if("string"!=typeof t)return new t(e);const o=t;switch(o){case"svg":case"line":case"rect":case"circle":case"path":case"text":s="http://www.w3.org/2000/svg";break;default:s="http://www.w3.org/1999/xhtml"}const n=document.createElementNS(s,o);return x(n,e,s),n}function x(t,e,i){if(null!=e){for(let[s,o]of Object.entries(e))switch(s){case"children":break;case"action":t.setAction(o);break;case"model":t.setModel(o);break;case"class":t.classList.add(o);break;case"style":for(let[e,i]of Object.entries(o)){const s=/[A-Z]/g;e=e.replace(s,(t=>"-"+t.toLowerCase())),"number"==typeof i&&(i=`${i}`),t.style.setProperty(e,i)}break;case"set":Object.defineProperty(e.set.object,e.set.attribute,{value:t});break;default:if("on"===s.substring(0,2))t.addEventListener(s.substr(2),o);else if("object"!=typeof o){if("http://www.w3.org/2000/svg"===i){const t=/[A-Z]/g;s=s.replace(t,(t=>"-"+t.toLowerCase()))}t.setAttributeNS(null,s,`${o}`)}}if(void 0!==e.children)for(let i of e.children)"string"==typeof i?t.appendChild(document.createTextNode(i)):t.appendChild(i)}}class f extends HTMLElement{static define(t,e,i){const s=window.customElements.get(t);void 0===s?window.customElements.define(t,e,i):s!==e&&console.trace(`View::define(${t}, ...): attempt to redefine view with different constructor`)}constructor(t){super(),x(this,t)}attachStyle(t){this.shadowRoot.appendChild(document.importNode(t,!0))}setModel(t){console.trace("Please note that View.setModel(model) has no implementation.")}getModelId(){if(!this.hasAttribute("model"))throw Error("no 'model' attribute");let t=this.getAttribute("model");if(!t)throw Error("no model id");return"M:"+t}getActionId(){if(!this.hasAttribute("action"))throw Error("no 'action' attribute");let t=this.getAttribute("action");if(!t)throw Error("no action id");return"A:"+t}connectedCallback(){if(this.controller)return;let t="";try{t=this.getModelId()}catch(t){}""!=t&&c.registerView(t,this)}disconnectedCallback(){this.controller&&this.controller.unregisterView(this)}}class w extends f{constructor(t){super(t),void 0!==t?.model&&this.setModel(t.model)}updateModel(){}updateView(t){}setModel(t){if(t===this.model)return;const e=this;this.model&&this.model.modified.remove(e),t&&t.modified.add((t=>e.updateView(t)),e),this.model=t,this.isConnected&&this.updateView(void 0)}connectedCallback(){super.connectedCallback(),this.model&&this.updateView(void 0)}}class v extends w{constructor(t){super(t)}connectedCallback(){if(this.controller)this.updateView();else{try{c.registerView(this.getActionId(),this)}catch(t){}try{c.registerView(this.getModelId(),this)}catch(t){}this.updateView()}}disconnectedCallback(){super.disconnectedCallback(),this.controller&&this.controller.unregisterView(this)}setModel(t){if(!t)return this.model&&this.model.modified.remove(this),this.action&&this.action.modified.remove(this),this.model=void 0,this.action=void 0,void this.updateView();if(t instanceof h)this.action=t,this.action.modified.add((()=>{this.updateView()}),this);else{if(!(t instanceof o))throw Error("unexpected model of type "+t.constructor.name);this.model=t,this.model.modified.add((()=>{this.updateView()}),this)}this.updateView()}setAction(t){if(t instanceof Function){const e=new h(void 0,"");e.signal.add(t),this.setModel(e)}else this.setModel(t)}isEnabled(){return void 0!==this.action&&this.action.enabled}}function y(t,...e){let i=t[0];return e.forEach(((e,s)=>{i=i.concat(e).concat(t[s+1])})),i}function C(t,e){const i=document.createElement(t);for(let t=0;t<e.length;++t){let s=e[t];s instanceof Array&&(e.splice(t,1,...s),s=e[t]),"string"!=typeof s?i.appendChild(s):i.appendChild(document.createTextNode(s))}return i}function k(t){return document.createTextNode(t)}const H=(...t)=>C("div",t),S=(...t)=>C("span",t),E=(...t)=>C("slot",t),A=(...t)=>C("input",t),T=(...t)=>C("button",t),_=(...t)=>C("ul",t),R=(...t)=>C("li",t),N="http://www.w3.org/2000/svg";function M(t){const e=document.createElementNS(N,"svg");return void 0!==t&&e.appendChild(t),e}function B(t){const e=document.createElementNS(N,"path");return void 0!==t&&e.setAttributeNS(null,"d",t),e}function L(t,e,i,s,o,n){const l=document.createElementNS(N,"line");return l.setAttributeNS(null,"x1",`${t}`),l.setAttributeNS(null,"y1",`${e}`),l.setAttributeNS(null,"x2",`${i}`),l.setAttributeNS(null,"y2",`${s}`),void 0!==o&&l.setAttributeNS(null,"stroke",o),void 0!==n&&l.setAttributeNS(null,"fill",n),l}const D=document.createElement("style");var I;D.textContent=y`
.tx-button {
    padding: 2px 14px 2px 14px;
    margin: 0;
    color: var(--tx-gray-800);
    transition: background-color 130ms ease-in-out;
    background-color: var(--tx-gray-300);
    border: 0 none;
    height: 28px;
    border-radius: 16px;
    box-shadow: none;
    font-family: inherit;
}

.tx-button:hover, .tx-button:active {
    color: var(--tx-gray-900);
    background-color: var(--tx-gray-400);
}

.tx-button:hover:active > span {
    transition: transform 130ms ease-in-out;
}
:host > .tx-button:hover:active {
    transform: translate(1px, 1px);
}
:host([disabled]) > .tx-button:hover:active {
    transform: translate(0px, 0px);
}

/* accent */

.tx-button.tx-accent {
    color: var(--tx-static-white);
    background-color: var(--tx-static-blue-600);
}
.tx-button.tx-accent:hover, .tx-button.tx-accent:active {
    color: var(--tx-static-white);
    background-color: var(--tx-static-blue-700);
}
.tx-button.tx-accent:hover:active {
    color: var(--tx-static-white);
    background-color: var(--tx-static-blue-500);
}

/* negative */

.tx-button.tx-negative {
    color: var(--tx-static-white);
    background-color: var(--tx-static-red-600);
}
.tx-button.tx-negative:hover, .tx-button.tx-negative:active {
    color: var(--tx-static-white);
    background-color: var(--tx-static-red-700);
}
.tx-button.tx-negative:hover:active {
    color: var(--tx-static-white);
    background-color: var(--tx-static-red-500);
}

/* primary */

.tx-button.tx-default {
    color: var(--tx-gray-50);
    background-color: var(--tx-gray-800);
}

.tx-button.tx-default:hover, .tx-button.tx-default:hover:active {
    color: var(--tx-gray-50);
    background-color: var(--tx-gray-900);
}

.tx-button.tx-default:active {
    color: var(--tx-gray-50);
    background-color: var(--tx-gray-900);
}

.tx-label {
    font-weight: bold;
    padding: 4px 0 6px 0;
    /* override parent flex/grid's align-items property to align in the center */
    align-self: center;
    /* adjust sides in container to look centered...? */
    justify-self: center;
    /* align children in the center */
    text-align: center;
}

:host([disabled]) > .tx-button, :host([disabled]) > .tx-button:active {
    color: var(--tx-fg-color-disabled);
    background-color: var(--tx-gray-200);
}
`,function(t){t[t.PRIMARY=0]="PRIMARY",t[t.SECONDARY=1]="SECONDARY",t[t.ACCENT=2]="ACCENT",t[t.NEGATIVE=3]="NEGATIVE"}(I||(I={}));class z extends v{constructor(t){switch(super(t),this.button=T(this.label=S()),this.button.classList.add("tx-button"),this.label.classList.add("tx-label"),this.button.onclick=()=>{this.action&&this.action.trigger()},this.getAttribute("variant")){case"primary":this.button.classList.add("tx-default");break;case"secondary":break;case"accent":this.button.classList.add("tx-accent");break;case"negative":this.button.classList.add("tx-negative")}switch(t?.variant){case I.PRIMARY:this.button.classList.add("tx-default");break;case I.SECONDARY:break;case I.ACCENT:this.button.classList.add("tx-accent");break;case I.NEGATIVE:this.button.classList.add("tx-negative")}this.attachShadow({mode:"open"}),this.attachStyle(D),this.shadowRoot.appendChild(this.button)}connectedCallback(){super.connectedCallback(),0===this.children.length&&(this._observer=new MutationObserver(((t,e)=>{void 0!==this._timer&&clearTimeout(this._timer),this._timer=window.setTimeout((()=>{this._timer=void 0,this.updateView()}),100)})),this._observer.observe(this,{childList:!0,subtree:!0,characterData:!0}))}updateView(){this.isConnected&&(this.model&&this.model.value?this.model instanceof n?this.label.innerHTML=this.model.value:this.label.innerText=this.model.value:this.label.innerHTML=this.innerHTML,this.isEnabled()?this.removeAttribute("disabled"):this.setAttribute("disabled","disabled"))}}z.define("tx-button",z);class $ extends w{setModel(t){if(void 0!==t&&!(t instanceof r))throw Error("BooleanView.setModel(): model is not of type BooleanModel");super.setModel(t)}updateModel(){this.model&&(this.model.value=this.input.checked)}updateView(){this.model&&this.model.enabled?this.input.removeAttribute("disabled"):this.input.setAttribute("disabled",""),this.model&&(this.input.checked=this.model.value)}}const O=document.createElement("style");O.textContent=y`
:host(.tx-checkbox) {
    display: inline-block;
    position: relative;
    box-shadow: none;
    box-sizing: border-box;
    padding: 0;
    margin: 2px; /* leave space for the focus ring */
    border: none 0;
    height: 14px;
    width: 14px;
}

:host(.tx-checkbox) > input {
    box-sizing: border-box;
    width: 14px;
    height: 14px;
    outline: none;
    padding: 0;
    margin: 0;
    border: 2px solid;
    border-radius: 2px;
    border-color: var(--tx-gray-700);
    /* border-radius: var(--tx-border-radius); */
    color: var(--tx-edit-fg-color);
    background-color: var(--tx-edit-bg-color);
    -webkit-appearance: none;
}

/* this is a svg 2 feature, works with firefox, chrome and edge, but not safari */
/* :host(.tx-checkbox) > svg > path {
    d: path("M3.5 9.5a.999.999 0 01-.774-.368l-2.45-3a1 1 0 111.548-1.264l1.657 2.028 4.68-6.01A1 1 0 019.74 2.114l-5.45 7a1 1 0 01-.777.386z");
} */

/* focus ring */
:host(.tx-checkbox) > input:focus-visible {
    outline: 2px solid;
    outline-color: var(--tx-outline-color);
    outline-offset: 2px;
}

:host(.tx-checkbox) > svg {
    position: absolute;
    left: 2px;
    top: 2px;
    stroke: none;
    fill: var(--tx-edit-bg-color);
    width: 10px;
    height: 10px;
    pointer-events: none;
}

:host(.tx-checkbox) > input:hover {
    border-color: var(--tx-gray-800);
}
.tx-checkbox > input:focus {
    border-color: var(--tx-outline-color);
}

:host(.tx-checkbox) > input:checked {
    background-color: var(--tx-gray-700);
}
:host(.tx-checkbox) > input:hover:checked {
    background-color: var(--tx-gray-800);
}

:host(.tx-checkbox) > input:disabled {
    color: var(--tx-gray-400);
    border-color: var(--tx-gray-400);
}
:host(.tx-checkbox) > input:checked:disabled {
    background-color: var(--tx-gray-400);
}
`;class V extends ${constructor(t){super(t),this.classList.add("tx-checkbox"),this.input=A(),this.input.type="checkbox",this.input.onchange=()=>{this.updateModel()};const e=M(B("M3.5 9.5a.999.999 0 01-.774-.368l-2.45-3a1 1 0 111.548-1.264l1.657 2.028 4.68-6.01A1 1 0 019.74 2.114l-5.45 7a1 1 0 01-.777.386z"));this.attachShadow({mode:"open"}),this.attachStyle(O),this.shadowRoot.appendChild(this.input),this.shadowRoot.appendChild(e)}}V.define("tx-checkbox",V);const W=document.createElement("style");W.textContent=y`
:host {
    display: grid;
    background-color: var(--tx-gray-100);
    border-radius: var(--tx-border-radius);
    border: var(--tx-border-radius);
    margin: 4px;
    padding: 16px;
    row-gap: 6px;
}

::slotted(tx-formlabel) {
    grid-column: 1 / span 1;
    font-size: var(--tx-font-size-info);
    font-weight: bolder;
    text-align: right;
    padding-top: 4px;
    padding-right: 12px;
}

::slotted(tx-formfield) {
    grid-column: 2 / span 1;
    text-align: left;
}

::slotted(tx-formhelp) {
    display: flex;
    grid-column: 2 / span 1;
    font-size: var(--tx-font-size-info);
    color: var(--tx-gray-700);
    fill: var(--tx-gray-700);
}

::slotted(tx-formhelp.tx-error) {
    color: var(--tx-warning-color);
    fill: var(--tx-warning-color);
}

::slotted(tx-formhelp.tx-error)::before {
    content: url("data:image/svg+xml,%3Csvg viewBox='0 0 36 36' width='18' height='18' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='rgb(247,109,116)' d='M17.127 2.579L.4 32.512A1 1 0 001.272 34h33.456a1 1 0 00.872-1.488L18.873 2.579a1 1 0 00-1.746 0zM20 29.5a.5.5 0 01-.5.5h-3a.5.5 0 01-.5-.5v-3a.5.5 0 01.5-.5h3a.5.5 0 01.5.5zm0-6a.5.5 0 01-.5.5h-3a.5.5 0 01-.5-.5v-12a.5.5 0 01.5-.5h3a.5.5 0 01.5.5z' /%3E%3C/svg%3E");
    width: 18px;
    height: 18px;
    padding-bottom: 3px;
    margin: 0 8px 0 0;
}

::slotted(tx-formhelp) > svg {
    flex-shrink: 0;
    width: 18px;
    height: 18px;
    padding-bottom: 3px;
    margin: 0 8px 0 0;
}`;const F=document.createElement("style");F.textContent=y`
:host {
    padding-top: 8px;
    padding-bottom: 8px;
}

::slotted(tx-formlabel) {
    text-align: left;
}

::slotted(tx-formfield) {
    grid-column: 1 / span 1;
}

::slotted(tx-formhelp) {
    grid-column: 1 / span 1;
}`;function P(t){return function(t){let e=document.querySelector('template[id="'+t+'"]');if(!e)throw new Error("failed to find template '"+t+"'");let i=e.content;return document.importNode(i,!0)}(t)}function U(t,e){let i=t.getAttribute(e);if(null===i)throw console.log("missing attribute '"+e+"' in ",t),Error("missing attribute '"+e+"' in "+t.nodeName);return i}function j(t,e){let i=t.getAttribute(e);return null===i?void 0:i}f.define("tx-form",class extends f{constructor(t){super(t),this.attachShadow({mode:"open"}),this.attachStyle(W),"narrow"===this.getAttribute("variant")&&this.attachStyle(F),this.shadowRoot.appendChild(E())}}),f.define("tx-formlabel",class extends w{constructor(t){super(t)}updateView(){this.model?.label?this.innerHTML=this.model.label:this.innerHTML=""}},{extends:"label"}),f.define("tx-formfield",class extends f{},{extends:"div"}),f.define("tx-formhelp",class extends w{constructor(t){super(t)}updateView(){if(this.model?.error){this.classList.add("tx-error");let t=this.model.error;return this.model.description&&(t+="<br/>"+this.model.description),void(this.innerHTML=t)}this.classList.remove("tx-error"),this.model?.description?this.innerHTML=this.model.description:this.innerHTML=""}},{extends:"div"});const G=document.createElement("style");var Y;G.textContent=`\n  :host(.menu-button) {\n    font-family: var(--tx-font-family);\n    font-size: var(--tx-edit-font-size);\n    font-weight: var(--tx-edit-font-weight);\n    padding: 7px;\n    vertical-align: center;\n  \n    background: var(--tx-gray-200);\n    color: var(--tx-gray-900);\n    cursor: default;\n  }\n  :host(.menu-button:hover) {\n    background: var(--tx-gray-300);\n  }\n  :host(.menu-button.active) {\n    background: var(--tx-gray-400);\n    color: var(--tx-gray-900);\n  }\n  :host(.menu-button.disabled) {\n    color: var(--tx-gray-500);\n  }\n  :host(.menu-button.active.disabled) {\n    color: var(--tx-gray-700);\n  }\n  :host(.menu-button.menu-down) {\n    padding-right: 20px;\n    background-image: url("data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" width="15" height="14"><path d="M 0 4 l 10 0 l -5 5 Z" fill="#fff" stroke="none"/></svg>')}");\n    background-repeat: no-repeat;\n    background-position: right center;\n  }\n  :host(.menu-button.active.menu-down) {\n    background-image: url("data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" width="15" height="14"><path d="M 0 4 l 10 0 l -5 5 Z" fill="#fff" stroke="none"/></svg>')}");\n    background-repeat: no-repeat;\n    background-position: right center;\n  }\n  :host(.menu-button.menu-side) {\n    padding-right: 20px;\n    background-image: url("data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" width="15" height="14"><path d="M 0 2 l 0 10 l 5 -5 Z" fill="#fff" stroke="none"/></svg>')}");\n    background-repeat: no-repeat;\n    background-position: right center;\n  }\n  :host(.menu-button.active.menu-side) {\n    background-image: url("data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" width="15" height="14"><path d="M 0 2 l 0 10 l 5 -5 Z" fill="#fff" stroke="none"/></svg>')}");\n    background-repeat: no-repeat;\n    background-position: right center;\n  }\n  .menu-bar {\n    display: flex;\n    flex-direction: row;\n    justify-content: flex-start;\n    align-items: center;\n    background-color: var(--tx-gray-200);\n  }\n  .menu-popup {\n    position: fixed;\n    display: flex;\n    flex-direction: column;\n    box-shadow: 2px 2px 5px var(--tx-gray-50);\n  }\n`,function(t){t[t.WAIT=0]="WAIT",t[t.DOWN=1]="DOWN",t[t.UP_N_HOLD=2]="UP_N_HOLD",t[t.DOWN_N_HOLD=3]="DOWN_N_HOLD",t[t.DOWN_N_OUTSIDE=4]="DOWN_N_OUTSIDE",t[t.DOWN_N_INSIDE_AGAIN=5]="DOWN_N_INSIDE_AGAIN"}(Y||(Y={}));class J extends f{constructor(t){super(t),this.vertical=!0,this.closeOnClose=!1,this.state=Y.WAIT}}class q extends J{constructor(t,e){super(),this.vertical=!0,this.root=t,this.parentButton=e,this.popup=document.createElement("div"),this.popup.classList.add("menu-popup");let i=t.down;for(;i;)i.isAvailable()?i.createWindowAt(this,this.popup):i.deleteWindow(),i=i.next;this.appendChild(this.popup),this.show()}show(){this.parentButton.master.vertical?function(t,e){let i=t.getBoundingClientRect();e.style.opacity="0",e.style.left=i.left+i.width+"px",e.style.top=i.top+"px",setTimeout((function(){let t=e.getBoundingClientRect();i.top+t.height>window.innerHeight&&(e.style.top=i.top+i.height-t.height+"px"),i.left+i.width+t.width>window.innerWidth&&(e.style.left=i.left-t.width+"px"),e.style.opacity="1"}),0)}(this.parentButton,this.popup):X(this.parentButton,this.popup),this.style.display=""}hide(){this.style.display="none"}}function X(t,e){let i=t.getBoundingClientRect();e.style.opacity="0",e.style.left=i.left+"px",e.style.top=i.top+i.height+"px",setTimeout((function(){let t=e.getBoundingClientRect();i.top+i.height+t.height>window.innerHeight&&(e.style.top=i.top-t.height+"px"),i.left+t.width>window.innerWidth&&(e.style.left=i.left+i.width-t.width+"px"),e.style.opacity="1"}),0)}f.define("tx-popupmenu",q);class Z extends w{constructor(t,e){super(),this.master=t,this.node=e;let i=this;if(this.classList.add("menu-button"),e.down&&(t.vertical?this.classList.add("menu-side"):this.classList.add("menu-down")),this.updateView(),this.onmousedown=t=>{t.stopPropagation();let e=function(t){document.removeEventListener("mouseup",e,{capture:!0}),t.preventDefault(),setTimeout((()=>{Z.buttonDown&&i.dispatchEvent(new MouseEvent("mouseup",t))}),0)};if(document.addEventListener("mouseup",e,{capture:!0}),Z.buttonDown=!0,!this.master)throw Error("yikes");switch(this.master.state){case Y.WAIT:this.master.state=Y.DOWN,this.activate();break;case Y.UP_N_HOLD:this.master.active!==this?(this.master.state=Y.DOWN,this.activate()):this.master.state=Y.DOWN_N_HOLD;break;default:throw Error("unexpected state "+this.master.state)}return!1},this.onmouseup=t=>{if(t.stopPropagation(),Z.buttonDown){if(Z.buttonDown=!1,!this.master)throw Error("yikes");if(!this.node)throw Error("yikes");switch(this.master.state){case Y.DOWN:this.node.isEnabled()&&!this.node.down?(this.trigger(),this.master.state=Y.WAIT):(this.master.state=Y.UP_N_HOLD,Z.documentMouseDown&&document.removeEventListener("mousedown",Z.documentMouseDown,{capture:!1}),Z.documentMouseDown=function(t){Z.documentMouseDown&&document.removeEventListener("mousedown",Z.documentMouseDown,{capture:!1}),Z.documentMouseDown=void 0,"TOAD-MENUBUTTON"!==t.target.tagName&&i.collapse()},document.addEventListener("mousedown",Z.documentMouseDown,{capture:!1}));break;case Y.DOWN_N_HOLD:case Y.DOWN_N_OUTSIDE:this.master.state=Y.WAIT,this.deactivate(),this.collapse(),this.master.closeOnClose;break;case Y.DOWN_N_INSIDE_AGAIN:this.trigger();break;default:throw Error("unexpected state "+this.master.state)}return!1}},this.onmouseout=t=>{if(t.stopPropagation(),!this.master)throw Error("yikes");switch(Z.inside=void 0,this.master.state){case Y.WAIT:case Y.DOWN_N_OUTSIDE:case Y.UP_N_HOLD:case Y.DOWN_N_HOLD:break;case Y.DOWN:case Y.DOWN_N_INSIDE_AGAIN:this.master.state=Y.DOWN_N_OUTSIDE,this.updateView();break;default:throw Error("unexpected state")}return!1},this.onmouseover=t=>{if(t.stopPropagation(),!i.master)throw Error("yikes");switch(Z.inside=i,i.master.state){case Y.WAIT:case Y.UP_N_HOLD:case Y.DOWN_N_OUTSIDE:case Y.DOWN_N_HOLD:case Y.DOWN:case Y.DOWN_N_INSIDE_AGAIN:if(!Z.buttonDown)break;if(!this.master)throw Error("yikes");this.master.active&&this.master.active.deactivate(),this.master.state=Y.DOWN_N_INSIDE_AGAIN,this.activate();break;default:throw Error("unexpected state "+i.master.state)}return!1},this.attachShadow({mode:"open"}),!this.shadowRoot)throw Error("yikes");this.shadowRoot.appendChild(document.importNode(G,!0)),this.node.modelId||this.shadowRoot.appendChild(document.createTextNode(e.label))}connectedCallback(){if(!this.controller){if(void 0===this.node.down){let t=this.node.title;for(let e=this.node.parent;e&&e.title.length;e=e.parent)t=e.title+"|"+t;t="A:"+t,c.registerView(t,this)}if(void 0!==this.node.modelId)if("string"==typeof this.node.modelId){let t="M:"+this.node.modelId;c.registerView(t,this)}else this.setModel(this.node.modelId)}}disconnectedCallback(){this.controller&&this.controller.unregisterView(this)}setModel(t){if(!t)return this.action&&this.action.modified.remove(this),this.model=void 0,this.action=void 0,void this.updateView();if(t instanceof h)this.action=t,this.action.modified.add((()=>{this.updateView()}),this);else{if(!(t instanceof o))throw Error("unexpected model of type "+t.constructor.name);this.model=t}this.updateView()}updateView(){if(this.model&&this.model.value){if(!this.shadowRoot)throw Error("yikes");let t=document.createElement("span");this.model instanceof n?t.innerHTML=this.model.value:t.innerText=this.model.value,this.shadowRoot.children.length>1&&this.shadowRoot.removeChild(this.shadowRoot.children[1]),this.shadowRoot.children.length>1?this.shadowRoot.insertBefore(t,this.shadowRoot.children[1]):this.shadowRoot.appendChild(t)}if(!this.master)throw Error("yikes");let t=!1;if(this.master.active==this)switch(this.master.state){case Y.DOWN:case Y.UP_N_HOLD:case Y.DOWN_N_HOLD:case Y.DOWN_N_INSIDE_AGAIN:t=!0;break;case Y.DOWN_N_OUTSIDE:if(!this.node)throw Error("yikes");t=void 0!==this.node.down&&this.node.isEnabled()}this.classList.toggle("active",t),this.classList.toggle("disabled",!this.isEnabled())}isEnabled(){return void 0!==this.node.down||void 0!==this.action&&this.action.enabled}trigger(){this.collapse(),this.action&&this.action.trigger()}collapse(){if(!this.master)throw Error("yikes");this.master.parentButton?this.master.parentButton.collapse():this.deactivate()}openPopup(){if(this.node&&this.node.down){if(!this.shadowRoot)throw Error("yikes");this.popup?this.popup.show():(this.popup=new q(this.node,this),this.shadowRoot.appendChild(this.popup))}}closePopup(){this.popup&&(this.popup.active&&this.popup.active.deactivate(),this.popup.hide())}activate(){if(!this.master)throw Error("yikes");if(!this.node)throw Error("yikes");let t=this.master.active;this.master.active=this,t&&t!==this&&(t.closePopup(),t.updateView()),this.updateView(),this.openPopup()}deactivate(){if(!this.master)throw Error("yikes");this.master.active===this&&(this.master.active.closePopup(),this.master.active=void 0,this.master.state=Y.WAIT,this.updateView())}}Z.define("tx-menubutton",Z);class K{constructor(t,e,i,s,o){this.title=t,this.label=e,this.shortcut=i,this.type=s||"entry",this.modelId=o}isEnabled(){return!0}isAvailable(){return!0}createWindowAt(t,e){if("spacer"==this.type){let t=document.createElement("span");return t.style.flexGrow="1",void e.appendChild(t)}this.view=new Z(t,this),e.appendChild(this.view)}deleteWindow(){}}class Q extends J{constructor(t){super(t),this.config=t?.config,this.vertical=!1,this.root=new K("","",void 0,void 0)}connectedCallback(){if(super.connectedCallback(),this.tabIndex=0,this.config)return this.config2nodes(this.config,this.root),this.referenceActions(),void this.createShadowDOM();0===this.children.length?(this._observer=new MutationObserver(((t,e)=>{void 0!==this._timer&&clearTimeout(this._timer),this._timer=window.setTimeout((()=>{this._timer=void 0,this.layout2nodes(this.children,this.root),this.referenceActions(),this.createShadowDOM()}),100)})),this._observer.observe(this,{childList:!0,subtree:!0})):(this.layout2nodes(this.children,this.root),this.referenceActions(),this.createShadowDOM())}layout2nodes(t,e){let i=e.down;for(let s of t){let t;switch(s.nodeName){case"TX-MENUSPACER":t=new K("","","","spacer");break;case"TX-MENUENTRY":t=new K(U(s,"name"),U(s,"label"),j(s,"shortcut"),j(s,"type"),j(s,"model"))}if(t&&(t.parent=e,i?i.next=t:e.down=t,i=t),!i)throw Error("yikes");this.layout2nodes(s.children,i)}}config2nodes(t,e){let i=e.down;for(let s of t){let t;if(t=!0===s.space?new K("","","","spacer"):new K(s.name,s.label,s.shortcut,s.type,s.model),t&&(t.parent=e,i?i.next=t:e.down=t,i=t),!i)throw Error("yikes");s.sub&&this.config2nodes(s.sub,i)}}referenceActions(){}findNode(t,e){let i=t.indexOf("|"),s=-1==i?t:t.substr(0,i),o=-1==i?"":t.substr(i+1);e||(e=this.root);for(let t=e.down;t;t=t.next)if(t.title==s)return t.down?this.findNode(o,t):t}createShadowDOM(){this.view=document.createElement("div"),this.view.classList.add("menu-bar");let t=this.root.down;for(;t;)t.isAvailable()?t.createWindowAt(this,this.view):t.deleteWindow(),t=t.next;this.attachShadow({mode:"open"}),this.shadowRoot.appendChild(document.importNode(G,!0)),this.shadowRoot.appendChild(this.view)}}Q.define("tx-menu",Q);const tt=document.createElement("style");tt.textContent=y`
:host(.tx-radio) {
    display: inline-flex;
    align-items: flex-start;
    position: relative;
    vertical-align: top;
}
/* an invisible radiobutton will overlay everything, handling input and state */
:host(.tx-radio) > input {
    display: inline-block;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    box-sizing: absolute;
    margin: 0;
    padding: 0;
    opacity: 0;
    z-index: 1;
}

/* the span provides the visual appearance */
:host(.tx-radio) > span {
    display: block;
    position: relative;
    left: 0;
    top: 0;
    box-sizing: border-box;
    flex-grow: 0;
    flex-shrink: 0;

    border: 2px solid var(--tx-gray-700);
    border-radius: 7px;

    width: 14px;
    height: 14px;
    background: none;
}

/* focus ring */
:host(.tx-radio) > input:focus-visible + span {
    outline: 2px solid;
    outline-color: var(--tx-outline-color);
    outline-offset: 2px;
}
/* this is the knob on the switch */
:host(.tx-radio) > span:before {
    display: block;
    position: absolute;
    left: 0px;
    top: 0px;
    width: 10px;
    height: 10px;
    background: var(--tx-gray-75);
    border: 2px solid var(--tx-gray-75);
    border-radius: 7px;
    content: "";
    box-sizing: border-box;

    /* 'transform' usually can be GPU acclerated while 'left' can not */
    transition: opacity 130ms ease-in-out;
}
:host(.tx-radio) > input:checked + span:before {
    background: var(--tx-gray-700);
}
:host(.tx-radio) > input:checked:hover + span:before {
    background: var(--tx-gray-900);
}
:host(.tx-radio) > input:hover + span {
    border-color: var(--tx-gray-900);
}

:host(.tx-radio) > input:checked:disabled + span:before {
    background: var(--tx-gray-500);
}
:host(.tx-radio) > input:disabled + span {
    border-color: var(--tx-gray-500);
}
`;class et extends w{constructor(t){super(t),this.classList.add("tx-radio"),this.input=A(),this.input.type="radio",this.input.value=this.getAttribute("value");let e=this;this.input.onchange=()=>{e.updateModel()},this.attachShadow({mode:"open"}),this.attachStyle(tt),this.shadowRoot.appendChild(this.input),this.shadowRoot.appendChild(S())}updateModel(){this.model&&(this.model.stringValue=this.input.value)}updateView(){if(this.model){let t=et.radioGroups.get(this.model);void 0===t&&(t=++et.radioGroupCounter,et.radioGroups.set(this.model,t)),this.input.name=`radioGroup${t}`}else this.input.name="";this.model&&this.model.enabled?this.input.removeAttribute("disabled"):this.input.setAttribute("disabled",""),this.model&&(this.input.checked=this.model.stringValue===this.input.value)}}et.radioGroupCounter=0,et.radioGroups=new WeakMap,et.define("tx-radiobutton",et);class it extends s{constructor(){super(),this._stringValue=""}set stringValue(t){this._stringValue!==t&&(this._stringValue=t,this.modified.trigger())}get stringValue(){return this._stringValue}isValidStringValue(t){return!1}}const st=document.createElement("style");st.textContent=y`
:host(.tx-combobox) {
    display: inline-flex;
    align-items: flex-start;
    position: relative;
    vertical-align: top;
}
:host(.tx-combobox) > input {
    box-sizing: border-box;
    width: 100%;
    height: 32px;
    margin: 0;
    padding: 3px 32px 5px 11px;
    vertical-align: top;
    overflow: visible;
    outline: none;
    display: inline-block;
    border: 1px solid var(--tx-gray-400);
    border-radius: 4px;
    background-color: var(--tx-gray-50);

    color: var(--tx-gray-900);  
    font-weight: var(--tx-edit-font-weight);
    font-size: var(--tx-edit-font-size);
    line-height: 18px;
}
:host(.tx-combobox) > input::placeholder {
    color: var(--tx-placeholder-fg-color);
    font-style: italic;
    font-weight: 300;
}

:host(.tx-combobox) > button {
    position: absolute;
    right: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    border-style: none;
    box-sizing: border-box;
    overflow: visible;
    margin: 0;
    text-transform: none;

    width: 32px;
    height: 32px;
    background-color: var(--tx-gray-75);
    border-radius: 0 4px 4px 0;
    border: 1px solid var(--tx-gray-400);
}
:host(.tx-combobox) > button > svg {
    fill: var(--tx-gray-700);
    transform: rotate(90deg) translate(5px, 8px);
}

:host(.tx-combobox) > input:hover {
    border-color: var(--tx-gray-500);
}
:host(.tx-combobox) > button:hover {
    border-color: var(--tx-gray-500);
    background-color: var(--tx-gray-50);
}
:host(.tx-combobox) > button:hover > svg {
    fill: var(--tx-gray-900);
}

:host(.tx-combobox) > input:focus {
    border-color: var(--tx-outline-color);
}
:host(.tx-combobox) > input:focus + button {
    border-color: var(--tx-outline-color);
}
/* spectrum use a 1px focus ring when the focus was set by mouse
 * and a 2px focus ring when the focus was set by keyboard
 * no clue how to do that with css
 *
/* :host(.tx-combobox) > input:focus-visible {
    outline: 1px solid var(--tx-outline-color);
}
:host(.tx-combobox) > input:focus-visible + button {
    outline: 1px solid var(--tx-outline-color);
    border-left: none;
} */

:host(.tx-combobox) > input:disabled {
    color: var(--tx-gray-700);
    background-color: var(--tx-gray-200);
    border-color: var(--tx-gray-200);
}
:host(.tx-combobox) > input:disabled + button {
    background-color: var(--tx-gray-200);
    border-color: var(--tx-gray-200);
}
:host(.tx-combobox) > input:disabled + button > svg {
    fill: var(--tx-gray-400);
}
`;const ot=document.createElement("style");ot.textContent=y`
.tx-popover {
    background-color: var(--tx-gray-50);
    border: 1px solid var(--tx-gray-400);
    border-radius: 4px;
    display: inline-flex;
    flex-direction: column;
    filter: drop-shadow(rgba(0, 0, 0, 0.5) 0px 1px 4px);
}
.tx-menu {
    display: inline-block;
    padding: 0;
    margin: 4px 0 4px 0;
}
.tx-menu > li {
    cursor: pointer;
    display: flex;
    border: none;
    border-left: 2px solid var(--tx-gray-50);
    border-right: 2px solid var(--tx-gray-50);
    padding: 7px 11px 7px 10px;
    margin: 0;
    font-weight: 500;
    outline: none;
}
.tx-menu > li:hover {
    background-color: var(--tx-gray-100);
    border-color: var(--tx-gray-100);
}
.tx-menu > li.tx-hover {
    background-color: var(--tx-gray-100);
    border-color: var(--tx-gray-100);
}
.tx-menu > li:focus {
    border-left-color: var(--tx-outline-color);
}
.tx-menu > li[role=separator] {
    display: block;
    box-sizing: content-box;
    overflow: visible;
    cursor: default;
    height: 2px;
    padding: 0px;
    margin: 1.5px 7px 1.5px 7px;
    background-color: var(--tx-gray-100);
    white-space: pre;
    list-style-type: none;
}
.tx-menu > li.tx-disabled {
    color: var(--tx-gray-500);
}
.tx-menu > li.tx-disabled:hover {
    background-color: var(--tx-gray-50);
}`;class nt extends w{constructor(t){super(t),this.input=A(),this.input.type="text",this.asPopupMenu();let e,i=this;this.input.oninput=()=>{i.updateModel()},this.input.onblur=t=>{void 0===this.hover&&this.close()};const s=T(e=M(B("M3 9.95a.875.875 0 01-.615-1.498L5.88 5 2.385 1.547A.875.875 0 013.615.302L7.74 4.377a.876.876 0 010 1.246L3.615 9.698A.872.872 0 013 9.95z")));this.button=s,s.tabIndex=-1,s.style.outline="none",e.style.width="100%",e.style.height="100%",s.onpointerdown=t=>{this.popup?this.close():(t.preventDefault(),this.input.focus(),this.open(),s.setPointerCapture(t.pointerId))},s.onpointermove=t=>{if(void 0===this.popup)return;const e=this.shadowRoot.elementFromPoint(t.clientX,t.clientY);let i;i=e instanceof HTMLLIElement?e:void 0,this.hover!==i&&(this.hover&&this.hover.classList.remove("tx-hover"),this.hover=i,this.hover&&this.hover.classList.add("tx-hover"))},s.onpointerup=t=>{if(this.hover){const t=parseInt(this.hover.dataset.idx);return this.close(),void this.select(t)}const e=this.shadowRoot.elementFromPoint(t.clientX,t.clientY);s.contains(e)?this.input.focus():this.close()},this.keydown=this.keydown.bind(this),this.input.onkeydown=this.keydown,this.wheel=this.wheel.bind(this),this.input.onwheel=this.button.onwheel=this.wheel,this.classList.add("tx-combobox"),this.attachShadow({mode:"open"}),this.attachStyle(st),this.attachStyle(ot),this.shadowRoot.appendChild(this.input),this.shadowRoot.appendChild(s)}connectedCallback(){if(this.controller)return;super.connectedCallback();const t=this.getAttribute("text");null!==t&&(c.registerView(`M:${t}`,this),this.asComboBox(),this.updateModel())}setModel(t){if(!t)return this.text&&(this.text.modified.remove(this),this.text=void 0),void super.setModel(t);t instanceof it&&super.setModel(t),t instanceof o&&(this.text=t,this.text.modified.add((()=>{this.input.value=this.text.value}),this))}keydown(t){switch(this.input.readOnly&&t.preventDefault(),t.key){case"ArrowUp":this.previousItem();break;case"ArrowDown":this.nextItem()}}wheel(t){t.preventDefault(),this.input.focus(),t.deltaY>0&&this.nextItem(),t.deltaY<0&&this.previousItem()}asPopupMenu(){this.input.readOnly=!0;for(let t of["user-select","-webkit-user-select","-webkit-touch-callout","-khtml-user-select"])this.input.style.setProperty(t,"none")}asComboBox(){this.input.readOnly=!1;for(let t of["user-select","-webkit-user-select","-webkit-touch-callout","-khtml-user-select"])this.input.style.removeProperty(t)}updateModel(){this.text&&(this.text.value=this.input.value)}updateView(){this.model&&this.model.enabled?this.input.removeAttribute("disabled"):this.input.setAttribute("disabled",""),void 0!==this.model&&(this.input.value=this.displayName(this.model.stringValue),this.updateModel())}displayName(t){if(0===this.children.length)return t;for(let e=0;e<this.children.length;++e){const i=this.children[e];if("OPTION"===i.nodeName){const e=i;if(e.value===t)return e.text}}let e="";for(let t=0;t<this.children.length;++t){const i=this.children[t];if("OPTION"===i.nodeName){e=`${e} '${i.value}'`}}return 0===e.length&&(e=" empty option list"),console.log(`'${t}' is not in${e} of <tx-select model="${this.model}">`),t}open(){let t,e=this;this.popup=H(t=_(...function(t,e){let i=[];for(let s=0;s<t;++s){const t=e(s);t instanceof Array?i.push(...t):i.push(t)}return i}(this.getLength(),(t=>{const i=R(k(this.getLabel(t)));return i.tabIndex=0,i.ariaRoleDescription="option",i.dataset.idx=`${t}`,i.onpointerdown=t=>{this.button.setPointerCapture(t.pointerId),this.hover=i,t.preventDefault()},i.onclick=()=>{e.select(t)},i})))),this.popup.classList.add("tx-popover"),this.popup.style.position="fixed",this.popup.style.zIndex="99",t.ariaRoleDescription="listbox",t.classList.add("tx-menu"),this.shadowRoot.appendChild(this.popup),X(this,this.popup)}close(){this.hover=void 0,void 0!==this.popup&&(this.shadowRoot.removeChild(this.popup),this.popup=void 0)}getLength(){if(0!==this.children.length)return this.children.length;return this.model.list.length}getLabel(t){if(0!==this.children.length)return this.children.item(t).innerText;return this.model.list[t]}select(t){if(void 0!==this.model)if(this.close(),0!==this.children.length){const e=this.children[t];if(!(e instanceof HTMLOptionElement))return void console.log(`<tx-select>: unpexected element <${e.nodeName.toLowerCase()}> instead of <option>`);this.model.stringValue=e.value}else{const e=this.model;this.model.stringValue=e.list[t]}else console.log(`<tx-select model='${this.getAttribute("model")}'> has no model`)}getIndex(){const t=this.model?.stringValue;if(0!==this.children.length){for(let e=0;e<this.children.length;++e)if(this.children[e].value===t)return e}else{const e=this.model;for(let i=0;i<e.list.length;++i)if(e.list[i]===t)return i}}nextItem(){let t=this.getIndex();void 0===t?t=0:++t,t>=this.getLength()||this.select(t)}previousItem(){let t=this.getIndex();void 0===t?t=this.getLength()-1:--t,t<0||this.select(t)}}nt.define("tx-select",nt);const lt=document.createElement("style");lt.textContent=y`

:host(.tx-slider) {
    height: 14px;
    position: relative;
    width: 100%;
    display: inline-block;
}
:host(.tx-slider) > input {
    position: absolute;
    top: 4px;
    -webkit-appearance: none;
    width: 100%;
    height: 2px;
    border: none;
    background: var(--tx-gray-700); /* track */
    outline: none;
}

:host(.tx-slider) > input::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 14px;
    height: 14px;
    border: 2px solid var(--tx-gray-700); /* knob border */
    border-radius: 50%;
    background: var(--tx-gray-75); /* inside knob */
    cursor: pointer;
    box-sizing: border-box;
}
:host(.tx-slider) > input::-moz-range-thumb {
    width: 14px;
    height: 14px;
    border: 2px solid var(--tx-gray-700); /* knob border */
    border-radius: 50%;
    background: var(--tx-gray-75); /* inside knob */
    box-sizing: border-box;
}

/* focus ring */
:host(.tx-slider) > input:focus::-webkit-slider-thumb {
    outline: 2px solid;
    outline-color: var(--tx-outline-color);
    outline-offset: 2px;
}
:host(.tx-slider) > input:focus::-moz-range-thumb {
    outline: 2px solid;
    outline-color: var(--tx-outline-color);
    outline-offset: 2px;
}

:host(.tx-slider) > input::-moz-focus-outer {
    border: 0;
}

:host(.tx-slider) > input:hover {
    background: var(--tx-gray-800); /* track */
}
:host(.tx-slider) > input:hover::-webkit-slider-thumb {
    border: 2px solid var(--tx-gray-800); /* knob border */
}
:host(.tx-slider) > input:hover::-moz-range-thumb {
    border: 2px solid var(--tx-gray-800); /* knob border */
}

:host(.tx-slider) > input:disabled {
    background: var(--tx-gray-500); /* track */
}
:host(.tx-slider) > input:disabled::-webkit-slider-thumb {
    border: 2px solid var(--tx-gray-500); /* knob border */
}
:host(.tx-slider) > input:disabled::-moz-range-thumb {
    border: 2px solid var(--tx-gray-500); /* knob border */
}
`;class rt extends w{constructor(t){super(t),this.input=document.createElement("input"),this.input.type="range";let e=this;this.input.oninput=()=>{e.updateModel()},this.classList.add("tx-slider"),this.attachShadow({mode:"open"}),this.attachStyle(lt),this.shadowRoot.appendChild(this.input)}updateModel(){this.model&&(this.model.value=Number.parseFloat(this.input.value))}updateView(){this.model&&(void 0===this.model.step&&void 0!==this.model.min&&void 0!==this.model.max?this.input.step=""+(this.model.max-this.model.min)/100:this.input.step=String(this.model.step),this.input.min=String(this.model.min),this.input.max=String(this.model.max),this.input.value=String(this.model.value))}}rt.define("tx-slider",rt);const at=document.createElement("style");at.textContent=y`
/* a div on top serves as the container for elements used for the switch*/
:host(.tx-switch) {
    display: inline-flex;
    align-items: flex-start;
    position: relative;
    vertical-align: top;
}
/* an invisible checkbox will overlay everything, handling input and state */
:host(.tx-switch) > input {
    display: inline-block;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    box-sizing: absolute;
    margin: 0;
    padding: 0;
    opacity: 0;
    z-index: 1;
}
/* the span provides the visual appearance */
:host(.tx-switch) > span {
    display: block;
    position: relative;
    left: 0;
    top: 0;
    box-sizing: border-box;
    flex-grow: 0;
    flex-shrink: 0;

    border: 0px none;
    border-radius: 7px;

    width: 26px;
    height: 14px;
    background: var(--tx-gray-300);
}

/* focus ring */
:host(.tx-switch) > input:focus-visible + span {
    outline: 2px solid;
    outline-color: var(--tx-outline-color);
    outline-offset: 2px;
}

/* this is the knob on the switch */
:host(.tx-switch) > span:before {
    display: block;
    position: absolute;
    left: 0;
    top: 0;
    width: 14px;
    height: 14px;
    background: var(--tx-gray-75);
    border: 2px solid var(--tx-gray-700);
    border-radius: 7px;
    content: "";
    box-sizing: border-box;

    /* 'transform' usually can be GPU acclerated while 'left' can not */
    transition: transform 130ms ease-in-out;
}
:host(.tx-switch) > input:hover + span:before {
    border-color: var(--tx-gray-900);
}

:host(.tx-switch) > input:checked + span:before {
    /* border-color: var(--tx-gray-700); */
    transform: translateX(calc(100% - 2px));
}

:host(.tx-switch) > input:checked + span {
    background: var(--tx-gray-700);
}
:host(.tx-switch) > input:checked:hover + span {
    background: var(--tx-gray-900);
}
:host(.tx-switch) > input:hover + span + label {
    color: var(--tx-gray-900);
}

:host(.tx-switch) > input:checked:disabled + span {
    background: var(--tx-gray-400);
}
:host(.tx-switch) > input:disabled + span:before {
    border-color: var(--tx-gray-400);
}
:host(.tx-switch) > input:disabled + span + label {
    color: var(--tx-gray-400);
}`;class ht extends ${constructor(t){super(t),this.classList.add("tx-switch"),this.input=A(),this.input.type="checkbox",this.input.onchange=()=>{this.updateModel()},this.attachShadow({mode:"open"}),this.attachStyle(at),this.shadowRoot.appendChild(this.input),this.shadowRoot.appendChild(S())}}ht.define("tx-switch",ht);const dt=document.createElement("style");dt.textContent=y`
/*
  tabs, line, content
*/
:host(.tx-tabs) {
    position: relative;
    display: flex;
    flex-wrap: nowrap;
    box-sizing: border-box;
}
:host(.tx-tabs:not(.tx-vertical)) {
    flex-direction: column;
}
:host(.tx-tabs.tx-vertical) {
    flex-direction: row;
}

/*
 * tabs
 */
:host(.tx-tabs) > ul {
    display: flex;
    flex-wrap: nowrap;
    list-style: none;
    box-sizing: border-box;
    padding: 0;
    margin: 0;
}
:host(.tx-tabs:not(.tx-vertical)) > ul {
    flex-direction: row;
    border-bottom: 2px solid var(--tx-gray-200);
}
:host(.tx-tabs.tx-vertical) > ul {
    border-left: 2px solid var(--tx-gray-200);
    flex-direction: column;
}
:host(.tx-tabs) > ul > li {
    box-sizing: border-box;
    list-style: none;
}

/*
 * label
 */
:host(.tx-tabs) > ul > li > span {
    display: block;
    list-style: none;
    font-weight: 500;
    margin: 8px 12px 8px 12px;
    color: var(--tx-gray-700);
    cursor: pointer;
}
:host(.tx-tabs.tx-vertical) > ul > li > span {
    margin: 0;
    padding: 12px 8px 12px 8px;
}
:host(.tx-tabs) > ul > li > span.active {
    color: var(--tx-gray-900);
}
:host(.tx-tabs) > ul > li > span:hover {
    color: var(--tx-gray-900);
}

/*
 * line
 */
:host(.tx-tabs) > div.line {
    background-color: var(--tx-gray-900);
    pointer-events: none;
}
:host(.tx-tabs:not(.tx-vertical)) > div.line  {
    transition: left 0.5s ease-in-out, width 0.5s 0.10s;
    position: relative; /* below labels */
    top: 0px;
    height: 2px;
    left: 12px;
    width: 0px;
}
:host(.tx-tabs.tx-vertical) > div.line  {
    transition: top 0.5s ease-in-out, width 0.5s 0.10s;
    position: absolute; left: 0; /* before labels */
    height: 0px;
    width: 2px;
}

.content {
    flex-grow: 1;
}

`;class ct extends w{constructor(t){super(t),this.setTab=this.setTab.bind(this),this.classList.add("tx-tabs"),this.hasAttribute("vertical")&&this.classList.add("tx-vertical"),this.content=H(E()),this.content.classList.add("content");const e=_();for(let t=0;t<this.children.length;++t){const i=this.children[t];if("TX-TAB"!==i.nodeName){console.log(`unexpected <${i.nodeName.toLowerCase()}> within <tabs>`);continue}const s=i;let o;e.appendChild(R(o=S(k(s.getAttribute("label"))))),o.onpointerdown=t=>{t.stopPropagation(),t.preventDefault(),t.cancelBubble=!0,this.setTab(o,s)},void 0===this.activeTab?(this.activeTab=o,this.activePanel=s):s.style.display="none"}this.attachShadow({mode:"open"}),this.shadowRoot.appendChild(document.importNode(dt,!0)),this.shadowRoot.appendChild(e),this.shadowRoot.appendChild(this.markerLine=H()),this.shadowRoot.appendChild(this.content),this.markerLine.classList.add("line"),this.activeTab&&this.setTab(this.activeTab,this.activePanel)}connectedCallback(){super.connectedCallback(),this.adjustLine()}setTab(t,e){this.activeTab.classList.remove("active"),this.activeTab=t,this.activeTab.classList.add("active"),this.activePanel.style.display="none",this.activePanel=e,this.activePanel.style.display="",this.adjustLine(),this.model&&e.value&&(this.model.stringValue=e.value)}adjustLine(){const t=this.markerLine,e=this.activeTab;void 0!==e&&(this.hasAttribute("vertical")?(t.style.top=`${e.offsetTop}px`,t.style.height=`${e.clientHeight}px`):(t.style.top="-2px",t.style.left=`${e.offsetLeft}px`,t.style.width=`${e.clientWidth}px`))}}ct.define("tx-tabs",ct);f.define("tx-tab",class extends f{constructor(t){super(t),this.label=t?.label,this.value=t?.value}});class pt extends s{isEmpty(){return 0===this.colCount&&0===this.rowCount}}var ut,gt,bt;!function(t){t[t.EDIT_CELL=0]="EDIT_CELL",t[t.SELECT_CELL=1]="SELECT_CELL",t[t.SELECT_ROW=2]="SELECT_ROW"}(ut||(ut={}));class mt{constructor(t,e){this.col=t,this.row=e}toString(){return`TablePos { col:${this.col}, row:${this.row} }`}}class xt extends s{constructor(t=ut.EDIT_CELL){super(),this.mode=t,this._value=new mt(0,0)}set col(t){this._value.col!==t&&(this._value.col=t,this.modified.trigger())}get col(){return this._value.col}set row(t){this._value.row!==t&&(this._value.row=t,this.modified.trigger())}get row(){return this._value.row}set value(t){this._value.col===t.col&&this._value.row===t.row||(this._value=t,this.modified.trigger())}get value(){return this._value}toString(){return`SelectionModel {enabled: ${this.enabled}, mode: ${ut[this.mode]}, value: ${this._value}}`}}class ft extends pt{constructor(t,e){super(),this.nodeClass=t}}!function(t){t[t.EDIT_ON_FOCUS=0]="EDIT_ON_FOCUS",t[t.EDIT_ON_ENTER=1]="EDIT_ON_ENTER"}(gt||(gt={}));class wt{constructor(){this.editMode=gt.EDIT_ON_FOCUS,this.seamless=!1,this.expandColumn=!1,this.expandRow=!1}}class vt{constructor(t){this.config=new wt,this.model=t}get colCount(){return void 0===this.model?0:this.model.colCount}get rowCount(){return void 0===this.model?0:this.model.rowCount}getColumnHead(t){}getRowHead(t){}showCell(t,e){}saveCell(t,e){}editCell(t,e){}isViewCompact(){return!1}static register(t,e,i){let s=vt.modelToAdapter.get(e);if(void 0===s&&(s=new Map,vt.modelToAdapter.set(e,s)),void 0!==i){if(s.has(i))throw Error("attempt to redefine existing table adapter");s.set(i,t)}else{if(s.has(null))throw Error("attempt to redefine existing table adapter");s.set(null,t)}}static unbind(){vt.modelToAdapter.clear()}static lookup(t){let e;e=t instanceof ft?t.nodeClass:null;const i=vt.modelToAdapter.get(Object.getPrototypeOf(t).constructor);let s=i?.get(e);if(void 0===s)for(let i of vt.modelToAdapter.keys())if(t instanceof i){s=vt.modelToAdapter.get(i)?.get(e);break}if(void 0===s){let i=`TableAdapter.lookup(): Did not find an adapter for model of type ${t.constructor.name}`;if(i+=`\n    Requested adapter: model=${t.constructor.name}, type=${e?.name}\n    Available adapters:`,0===vt.modelToAdapter.size)i+=" none.";else for(const[t,e]of vt.modelToAdapter)for(const[s,o]of e)i+=`\n        model=${t.name}`,null!=s&&(i+=`, type=${s.name}`);throw Error(i)}return s}}vt.modelToAdapter=new Map,function(t){t[t.INSERT_ROW=0]="INSERT_ROW",t[t.REMOVE_ROW=1]="REMOVE_ROW",t[t.INSERT_COL=2]="INSERT_COL",t[t.REMOVE_COL=3]="REMOVE_COL",t[t.CELL_CHANGED=4]="CELL_CHANGED",t[t.RESIZE_ROW=5]="RESIZE_ROW",t[t.RESIZE_COL=6]="RESIZE_COL",t[t.CHANGED=7]="CHANGED"}(bt||(bt={}));class yt{constructor(){this._stop=!1,this._firstFrame=this._firstFrame.bind(this),this._animationFrame=this._animationFrame.bind(this)}start(){this.prepare(),!0!==this._stop&&this.requestAnimationFrame(this._firstFrame)}stop(){this._stop=!0,this.animator?.current===this&&this.animator.clearCurrent()}replace(t){this.next=t,this.animationFrame(1),this.lastFrame(),t.prepare()}prepare(){}firstFrame(){}animationFrame(t){}lastFrame(){}requestAnimationFrame(t){window.requestAnimationFrame(t)}_firstFrame(t){this.startTime=t,this.firstFrame(),this._stop||(this.animationFrame(0),this.requestAnimationFrame(this._animationFrame))}_animationFrame(t){if(this.next)return void this.next._firstFrame(t);let e=yt.animationFrameCount>0?(t-this.startTime)/yt.animationFrameCount:1;e=e>1?1:e;const i=this.ease(e);this.animationFrame(i),this._stop||(i<1?this.requestAnimationFrame(this._animationFrame.bind(this)):(this.lastFrame(),this.animator&&this.animator._current===this&&this.animator.clearCurrent()))}ease(t){return.5*(1-Math.cos(Math.PI*t))}}yt.animationFrameCount=468;class Ct extends yt{constructor(t){super(),this.animation=t}prepare(){this.animation.prepare()}firstFrame(){this.animation.firstFrame()}animationFrame(t){this.animation.animationFrame(t)}lastFrame(){this.animation.lastFrame()}}class kt{get current(){if(void 0!==this._current)return this._current instanceof Ct?this._current.animation:this._current}clearCurrent(){this._current=void 0}run(t){let e;e=t instanceof yt?t:new Ct(t);const i=this._current;if(this._current=e,e.animator=this,i)i.animator=void 0,i.replace(e);else{if(kt.halt)return;e.start()}}}kt.halt=!1;class Ht{constructor(t){this.table=t}get adapter(){return this.table.adapter}get root(){return this.table.root}get measure(){return this.table.measure}getStaging(){const t=this.table.animator;if(void 0===t.current)return;return t.current.bodyStaging}getHeadStaging(){const t=this.table.animator;if(void 0===t.current)return;return t.current.headStaging}get body(){return this.table.body}get splitBody(){return this.table.splitBody}get colHeads(){return this.table.colHeads}set colHeads(t){this.table.colHeads=t}get rowHeads(){return this.table.rowHeads}set rowHeads(t){this.table.rowHeads=t}get colResizeHandles(){return this.table.colResizeHandles}set colResizeHandles(t){this.table.colResizeHandles=t}get rowResizeHandles(){return this.table.rowResizeHandles}set rowResizeHandles(t){this.table.rowResizeHandles=t}set animationDone(t){this.table.animationDone=t}get selection(){return this.table.selection}get style(){return this.table.style}setCellSize(t,e,i,s,o){this.table.setCellSize(t,e,i,s,o)}clearAnimation(){this.table.animation=void 0}}class St extends Ht{constructor(t){super(t)}prepareStagingWithRows(){this.prepareBodyStaging(),this.prepareRowHeadStaging(),this.table.addStaging(this.bodyStaging,this.headStaging),this.scrollStaging()}prepareStagingWithColumns(){this.prepareBodyStaging(),this.prepareColHeadStaging(),this.table.addStaging(this.bodyStaging,this.headStaging),this.scrollStaging()}prepareBodyStaging(){this.bodyStaging=H(),this.bodyStaging.className="staging",this.bodyStaging.style.left=this.body.style.left,this.bodyStaging.style.top=this.body.style.top}prepareRowHeadStaging(){void 0!==this.rowHeads&&(this.headStaging=H(),this.headStaging.classList.add("staging"),this.headStaging.style.top=this.rowHeads.style.top,this.headStaging.style.width=this.rowHeads.style.width)}prepareColHeadStaging(){void 0!==this.colHeads&&(this.headStaging=H(),this.headStaging.classList.add("staging"),this.headStaging.classList.add("colHack"),this.headStaging.style.left=this.colHeads.style.left,this.headStaging.style.height=this.colHeads.style.height)}disposeStaging(){this.table.removeStaging(this.bodyStaging,this.headStaging)}scrollStaging(){}makeRowMask(t,e){const i=S();return i.style.boxSizing="content-box",i.style.top=`${t}px`,i.style.height=`${e}px`,i.style.left="0",i.style.right="0",i.style.border="none",i.style.backgroundColor=jt.maskColor,i}makeColumnMask(t,e){const i=S();return i.style.boxSizing="content-box",i.style.left=`${t}px`,i.style.width=`${e}px`,i.style.top="0",i.style.bottom="0",i.style.border="none",i.style.backgroundColor=jt.maskColor,i}}class Et extends St{constructor(t,e){super(t),this.done=!1,this.event=e}prepare(){this.prepareCellsToBeMeasured(),this.prepareStaging()}firstFrame(){this.arrangeInStaging(),this.split()}animationFrame(t){this.animate(this.animationStart+t*this.totalSize)}lastFrame(){this.animate(this.animationStart+this.totalSize),this.join(),this.disposeStaging()}join(){this.done||(this.done=!0,this.joinHeader(),this.joinBody(),this.table.animationDone&&this.table.animationDone())}}class At extends Et{constructor(t,e){super(t,e),this.join=this.join.bind(this),this.initialRowCount=this.adapter.rowCount-e.size,At.current=this}prepareStaging(){this.prepareStagingWithRows()}animate(t){this.splitBody.style.top=`${t}px`,this.mask.style.top=`${t}px`,void 0!==this.rowHeads&&(this.splitHead.style.top=`${t}px`,this.headMask.style.top=`${t}px`)}prepareCellsToBeMeasured(){this.table.prepareMinCellSize();let t=new Array(this.event.size);for(let e=this.event.index;e<this.event.index+this.event.size;++e){const i=this.adapter.getRowHead(e);void 0===this.rowHeads&&void 0!==i&&(this.rowHeads=H(),this.rowHeads.className="rows",this.root.appendChild(this.rowHeads),this.rowResizeHandles=H(),this.rowResizeHandles.className="rows",this.root.appendChild(this.rowResizeHandles)),t[e-this.event.index]=i}if(void 0!==this.rowHeads)for(let e=0;e<this.event.size;++e){const i=S(t[e]);i.className="head",this.measure.appendChild(i)}if(void 0===this.colHeads&&this.adapter.colCount===this.event.size){let t=new Array(this.adapter.colCount);for(let e=0;e<this.adapter.colCount;++e){const i=this.adapter.getColumnHead(e);void 0===this.colHeads&&void 0!==i&&(this.colHeads=H(),this.colHeads.className="cols",this.root.appendChild(this.colHeads),this.colResizeHandles=H(),this.colResizeHandles.className="cols",this.root.appendChild(this.colResizeHandles)),t[e]=i}if(void 0!==this.colHeads)for(let e=0;e<this.adapter.colCount;++e){const i=S(t[e]);i.className="head",this.measure.appendChild(i)}}for(let t=this.event.index;t<this.event.index+this.event.size;++t)for(let e=0;e<this.adapter.colCount;++e){const i=this.table.createCell();this.table.showCell(new mt(e,t),i),this.measure.appendChild(i)}}arrangeInStaging(){this.table.calculateMinCellSize();const t=this.adapter.config.seamless?0:1;let e=0,i=this.event.index*this.adapter.colCount;if(0!==this.body.children.length)if(i<this.body.children.length){e=Pt(this.body.children[i].style.top)}else{let i=this.body.children[this.body.children.length-1],s=i.getBoundingClientRect();e=Pt(i.style.top)+s.height-t}let s=new Array(this.adapter.colCount);if(this.body.children.length>0)for(let t=0;t<this.adapter.colCount;++t){const e=this.body.children[t].getBoundingClientRect();s[t]=e.width,this.adapter.config.seamless&&(s[t]+=2)}else s.fill(this.table.minCellWidth);let o=this.table.minCellWidth;if(this.rowHeads&&this.rowHeads.children.length>0){const t=this.rowHeads.children[0].getBoundingClientRect();o=Math.max(o,t.width),this.adapter.config.seamless&&(o+=2)}let n=new Array(this.event.size);if(n.fill(this.table.minCellHeight),this.totalSize=0,i=0,void 0!==this.rowHeads)for(let t=0;t<this.event.size;++t){const e=this.measure.children[i++].getBoundingClientRect();n[t]=Math.max(n[t],e.height),o=Math.max(o,e.width)}o=Math.ceil(o);let l=0;if(void 0!==this.colHeads&&0===this.colHeads.children.length&&this.adapter.rowCount==this.event.size){l=this.table.minCellHeight;for(let t=0;t<this.adapter.colCount;++t){const e=this.measure.children[i++].getBoundingClientRect();s[t]=Math.max(s[t],e.width-this.table.WIDTH_ADJUST),l=Math.max(l,e.height-this.table.HEIGHT_ADJUST)}}else if(void 0!==this.colHeads){l=this.colHeads.children[0].getBoundingClientRect().height-this.table.HEIGHT_ADJUST}l=Math.ceil(l),this.rowHeads&&(this.rowHeads.style.top=0===l?"0px":l+this.table.HEIGHT_ADJUST-t+"px",this.rowHeads.style.bottom="0px",this.rowHeads.style.width=`${o}px`,this.body.style.left=o-t+"px",this.bodyStaging.style.left=o-t+"px");for(let e=0;e<this.event.size;++e){for(let t=0;t<this.adapter.colCount;++t){const o=this.measure.children[i++].getBoundingClientRect();n[e]=Math.max(n[e],o.height),this.adapter.config.expandColumn?s[t]=Math.ceil(Math.max(s[t],o.width)):0===e&&0===this.body.children.length&&(s[t]=Math.ceil(o.width))}this.totalSize+=n[e]-t}if(this.adapter.config.expandColumn){i=0;let e=0,o=0;for(;i<this.body.children.length;){const n=this.body.children[i];n.style.left=`${e}px`,n.style.width=s[o]-this.table.WIDTH_ADJUST+"px",e+=s[o]-t,this.adapter.config.seamless&&(e-=2),++o,++i,o>=this.adapter.colCount&&(e=0,o=0)}}this.totalSize+=t,this.adapter.config.seamless&&(this.totalSize-=2*this.event.size);let r=e;if(void 0!==this.rowHeads)for(let e=0;e<this.event.size;++e){const i=this.measure.children[0];this.setCellSize(i,0,r,o,n[e]),this.headStaging.appendChild(i),r+=n[e]-t,this.adapter.config.seamless&&(r-=2)}if(void 0!==this.colHeads&&0===this.colHeads.children.length&&this.adapter.rowCount==this.event.size){let e=0;for(let i=0;i<this.adapter.colCount;++i){const o=this.measure.children[0];o.style.left=`${e}px`,o.style.width=s[i]-this.table.WIDTH_ADJUST+"px",o.style.height=`${l}px`,this.colHeads.appendChild(o),e+=s[i]-t}l+=this.table.HEIGHT_ADJUST,this.body.style.top=l-t+"px",this.bodyStaging.style.top=l-t+"px",this.headStaging.style.top=l-t+"px",this.rowHeads.style.top=l-t+"px",this.colHeads.style.left=o-t+"px",this.colHeads.style.right="0px",this.colHeads.style.height=`${l}px`}r=e;for(let e=0;e<this.event.size;++e){let i=0;for(let o=0;o<this.adapter.colCount;++o){const l=this.measure.children[0];this.setCellSize(l,i,r,s[o],n[e]),this.bodyStaging.appendChild(l),i+=s[o]-t,this.adapter.config.seamless&&(i-=2)}r+=n[e]-t,this.adapter.config.seamless&&(r-=2)}if(this.mask=this.makeRowMask(e,this.totalSize),this.bodyStaging.appendChild(this.mask),void 0!==this.rowHeads&&(this.headMask=this.makeRowMask(e,this.totalSize),this.headStaging.appendChild(this.headMask)),0!==this.initialRowCount){const t=this.adapter.config.seamless?0:1;this.totalSize-=t}}split(){this.table.splitHorizontalNew(this.event.index),void 0!==this.rowHeads&&(this.splitHead=this.rowHeads.lastElementChild),this.animationStart=Pt(this.splitBody.style.top)}joinHeader(){if(void 0!==this.rowHeads){for(this.headStaging.removeChild(this.headMask),this.rowHeads.removeChild(this.splitHead);this.headStaging.children.length>0;)this.rowHeads.appendChild(this.headStaging.children[0]);if(this.splitHead.children.length>0){let t=Pt(this.splitHead.style.top);for(;this.splitHead.children.length>0;){const e=this.splitHead.children[0];e.style.top=`${Pt(e.style.top)+t}px`,this.rowHeads.appendChild(e)}}}}joinBody(){for(this.bodyStaging.removeChild(this.mask),this.body.removeChild(this.splitBody);this.bodyStaging.children.length>0;)this.body.appendChild(this.bodyStaging.children[0]);if(this.splitBody.children.length>0){let t=Pt(this.splitBody.style.top);for(;this.splitBody.children.length>0;){const e=this.splitBody.children[0];e.style.top=`${Pt(e.style.top)+t}px`,this.body.appendChild(e)}}}}class Tt extends St{constructor(t,e){if(super(t),this.event=e,this.joinHorizontal=this.joinHorizontal.bind(this),0===this.body.children.length)this.initialHeight=0;else{const t=this.body.children[this.body.children.length-1],e=Pt(t.style.top),i=t.getBoundingClientRect();this.initialHeight=e+i.height}this.overlap=this.adapter.config.seamless?0:1,this.removeAll=this.event.index>=this.adapter.rowCount,Tt.current=this}prepare(){this.prepareStagingWithRows(),this.arrangeRowsInStaging(),this.splitHorizontal()}firstFrame(){}animationFrame(t){this.splitBody.style.top=this.topSplitBody-t*this.animationHeight+"px",this.mask.style.top=this.topMask-t*this.animationHeight+"px",void 0!==this.rowHeads&&(this.splitHead.style.top=this.topSplitBody-t*this.animationHeight+"px",this.headMask.style.top=this.topMask-t*this.animationHeight+"px")}lastFrame(){this.joinHorizontal(),this.disposeStaging()}arrangeRowsInStaging(){const t=this.event.index*this.adapter.colCount,e=this.event.size*this.adapter.colCount,i=Pt(this.body.children[t].style.top);for(let i=0;i<e;++i)this.bodyStaging.appendChild(this.body.children[t]);let s;if(t<this.body.children.length)s=Pt(this.body.children[t].style.top);else{const t=this.bodyStaging.children[this.bodyStaging.children.length-1];s=Pt(t.style.top)+Pt(t.style.height)+this.table.HEIGHT_ADJUST}if(this.animationHeight=s-i,this.mask=this.makeRowMask(s,this.animationHeight),this.bodyStaging.appendChild(this.mask),void 0!==this.rowHeads){for(let t=0;t<this.event.size;++t)this.headStaging.appendChild(this.rowHeads.children[this.event.index]);this.headMask=this.makeRowMask(s,this.animationHeight),this.headStaging.appendChild(this.headMask)}}splitHorizontal(){this.table.splitHorizontalNew(this.event.index),void 0!==this.rowHeads&&(this.splitHead=this.rowHeads.lastElementChild),this.topSplitBody=Pt(this.splitBody.style.top),this.topMask=Pt(this.mask.style.top)}joinHorizontal(){this.bodyStaging.removeChild(this.mask),this.body.removeChild(this.splitBody),this.bodyStaging.replaceChildren(),this.moveSplitBodyToBody(),this.rowHeads&&(this.headStaging.removeChild(this.headMask),this.rowHeads.removeChild(this.splitHead),this.headStaging.replaceChildren(),this.moveSplitHeadToHead()),this.table.animationDone&&this.table.animationDone()}moveSplitHeadToHead(){if(0===this.splitHead.children.length)return;let t=Pt(this.splitHead.style.top);for(;this.splitHead.children.length>0;){const e=this.splitHead.children[0];e.style.top=`${Pt(e.style.top)+t}px`,this.rowHeads.appendChild(e)}}moveSplitBodyToBody(){if(0===this.splitBody.children.length)return;let t=Pt(this.splitBody.style.top);for(;this.splitBody.children.length>0;){const e=this.splitBody.children[0];e.style.top=`${Pt(e.style.top)+t}px`,this.body.appendChild(e)}}}class _t extends Et{constructor(t,e){super(t,e),this.event=e,this.join=this.join.bind(this),this.colCount=this.adapter.colCount,this.rowCount=this.adapter.rowCount,_t.current=this}prepareStaging(){this.prepareStagingWithColumns()}animate(t){this.mask.style.left=`${t}px`,this.splitBody.style.left=`${t}px`,void 0!==this.colHeads&&(this.splitHead.style.left=`${t}px`,this.headMask.style.left=`${t}px`)}prepareCellsToBeMeasured(){this.table.prepareMinCellSize();let t=new Array(this.event.size);for(let e=this.event.index;e<this.event.index+this.event.size;++e){const i=this.adapter.getColumnHead(e);void 0===this.colHeads&&void 0!==i&&(this.colHeads=H(),this.colHeads.className="cols",this.root.appendChild(this.colHeads),this.colResizeHandles=H(),this.colResizeHandles.className="cols",this.root.appendChild(this.colResizeHandles)),t[e-this.event.index]=i}if(void 0!==this.colHeads)for(let e=0;e<this.event.size;++e){const i=S(t[e]);i.className="head",this.measure.appendChild(i)}if(void 0===this.rowHeads&&this.adapter.rowCount===this.event.size){let t=new Array(this.adapter.rowCount);for(let e=0;e<this.adapter.rowCount;++e){const i=this.adapter.getRowHead(e);void 0===this.rowHeads&&void 0!==i&&(this.rowHeads=H(),this.rowHeads.className="rows",this.root.appendChild(this.rowHeads),this.rowResizeHandles=H(),this.rowResizeHandles.className="rows",this.root.appendChild(this.rowResizeHandles)),t[e]=i}if(void 0!==this.rowHeads)for(let e=0;e<this.adapter.rowCount;++e){const i=S(t[e]);i.className="head",this.measure.appendChild(i)}}for(let t=this.event.index;t<this.event.index+this.event.size;++t)for(let e=0;e<this.rowCount;++e){const i=S();this.table.showCell(new mt(t,e),i),this.measure.appendChild(i)}}arrangeInStaging(){this.table.calculateMinCellSize();const t=this.colCount-this.event.size,e=this.adapter.config.seamless?0:1;let i,s=this.event.index;if(s<t){i=Ft(this.body.children[s].style.left)}else if(0===this.body.children.length)i=0;else{const s=this.body.children[t-1];i=Ft(s.style.left)+Ft(s.style.width)+this.table.WIDTH_ADJUST-e}this.animationStart=i;let o=new Array(this.adapter.rowCount);if(0!==this.body.children.length)for(let e=0;e<this.adapter.rowCount;++e){const i=this.body.children[e*t].getBoundingClientRect();o[e]=i.height,this.adapter.config.seamless&&(o[e]+=2)}else o.fill(this.table.minCellHeight);let n=this.table.minCellHeight;if(this.colHeads&&this.colHeads.children.length>0){n=this.colHeads.children[0].getBoundingClientRect().height,this.adapter.config.seamless&&(n+=2)}let l=new Array(this.event.size);if(l.fill(this.table.minCellWidth),this.totalSize=0,s=0,void 0!==this.colHeads)for(let t=0;t<this.event.size;++t){const e=this.measure.children[s++].getBoundingClientRect();l[t]=Math.max(l[t],e.width),n=Math.max(n,e.height)}n=Math.ceil(n);let r=0;if(void 0!==this.rowHeads&&0===this.rowHeads.children.length&&this.adapter.colCount==this.event.size){r=this.table.minCellWidth;for(let t=0;t<this.adapter.rowCount;++t){const e=this.measure.children[s++].getBoundingClientRect();o[t]=Math.max(o[t],e.height-this.table.HEIGHT_ADJUST),r=Math.max(r,e.width-this.table.WIDTH_ADJUST)}}else if(void 0!==this.rowHeads){r=this.rowHeads.children[0].getBoundingClientRect().width-this.table.WIDTH_ADJUST}r=Math.ceil(r),this.colHeads&&(this.colHeads.style.left=0===r?"0px":r+this.table.WIDTH_ADJUST+2-e+"px",this.colHeads.style.right="0px",this.colHeads.style.height=`${n}px`,this.body.style.top=n-1+"px",this.bodyStaging.style.top=n-1+"px");for(let t=0;t<this.event.size;++t){for(let e=0;e<this.adapter.rowCount;++e){const i=this.measure.children[s++].getBoundingClientRect();l[t]=Math.ceil(Math.max(l[t],i.width)-2),this.adapter.config.expandRow?o[t]=Math.ceil(Math.max(o[e],i.height)):0===t&&0===this.body.children.length&&(o[e]=Math.ceil(i.height))}this.totalSize+=l[t]-e}l.forEach(((t,e)=>l[e]=t+4)),this.totalSize+=e,this.adapter.config.seamless&&(this.totalSize-=2*this.event.size);let a=i;if(void 0!==this.colHeads)for(let t=0;t<this.event.size;++t){const i=this.measure.children[0];this.setCellSize(i,a,0,l[t],n),this.headStaging.appendChild(i),a+=l[t]-e,this.adapter.config.seamless&&(a-=2)}if(void 0!==this.rowHeads&&0===this.rowHeads.children.length&&this.adapter.colCount==this.event.size){let t=0;for(let i=0;i<this.adapter.rowCount;++i){const s=this.measure.children[0];s.style.top=`${t}px`,s.style.height=o[i]-this.table.HEIGHT_ADJUST+"px",s.style.width=`${r}px`,this.rowHeads.appendChild(s),t+=o[i]-e}r+=this.table.WIDTH_ADJUST,this.body.style.left=r-e+"px",this.bodyStaging.style.left=r-e+"px",this.headStaging.style.left=r-e+"px",this.colHeads.style.left=r-e+"px",this.rowHeads.style.top=n-e+"px",this.rowHeads.style.bottom="0px",this.rowHeads.style.width=`${r}px`}let h=0;a=i;for(let t=this.event.index;t<this.event.index+this.event.size;++t){let i=l[t-this.event.index],s=0;for(let t=0;t<this.rowCount;++t){const n=this.measure.children[0];this.setCellSize(n,a,s,i,o[t]),this.bodyStaging.appendChild(n),s+=o[t]-e,this.adapter.config.seamless&&(s-=2)}a+=i-e-2,this.adapter.config.seamless||(a+=2),h+=i-2}this.totalSize=h+2,this.mask=this.makeColumnMask(i,this.totalSize),this.bodyStaging.appendChild(this.mask),void 0!==this.colHeads&&(this.headMask=this.makeColumnMask(i,this.totalSize),this.headStaging.appendChild(this.headMask))}split(){this.table.splitVerticalNew(this.event.index),void 0!==this.colHeads&&(this.splitHead=this.colHeads.lastElementChild)}joinHeader(){if(void 0!==this.colHeads){for(this.headStaging.removeChild(this.headMask),this.colHeads.removeChild(this.splitHead);this.headStaging.children.length>0;)this.colHeads.appendChild(this.headStaging.children[0]);if(this.splitHead.children.length>0){let t=Pt(this.splitHead.style.left);for(;this.splitHead.children.length>0;){const e=this.splitHead.children[0];e.style.left=`${Pt(e.style.left)+t}px`,this.colHeads.appendChild(e)}}}}joinBody(){this.bodyStaging.removeChild(this.mask),this.body.removeChild(this.splitBody);const t=this.adapter.model.colCount,e=this.event.index,i=this.event.size,s=t-i-this.event.index;for(let t=0;t<i;++t)for(let s=0;s<this.rowCount;++s){const o=this.bodyStaging.children[0],n=s*(e+i)+e+t;this.bodyInsertAt(o,n)}let o=this.totalSize+this.animationStart;for(let n=0;n<this.rowCount;++n)for(let l=0;l<s;++l){const s=this.splitBody.children[0];s.style.left=`${Pt(s.style.left)+o}px`;const r=n*t+e+i+l;this.bodyInsertAt(s,r)}}bodyInsertAt(t,e){let i;i=e<this.body.children.length?this.body.children[e]:null,this.body.insertBefore(t,i)}}class Rt extends St{constructor(t,e){if(super(t),this.done=!1,this.colCount=this.adapter.colCount,this.rowCount=this.adapter.rowCount,this.event=e,this.joinVertical=this.joinVertical.bind(this),0===this.body.children.length)this.initialWidth=0;else{const t=this.body.children[this.body.children.length-1],e=Pt(t.style.left),i=t.getBoundingClientRect();this.initialWidth=e+i.width}Rt.current=this}prepare(){this.prepareStagingWithColumns(),this.arrangeColumnsInStaging(),this.splitVertical()}firstFrame(){}animationFrame(t){let e=0;this.adapter.config.seamless&&(e=1),this.splitBody.style.left=`${this.leftSplitBody-t*this.animationWidth+e}px`,this.mask.style.left=this.leftMask-t*this.animationWidth+"px",void 0!==this.colHeads&&(this.splitHead.style.left=`${this.leftSplitBody-t*this.animationWidth+e}px`,this.headMask.style.left=this.leftMask-t*this.animationWidth+"px")}lastFrame(){this.joinVertical(),this.disposeStaging()}arrangeColumnsInStaging(){let t=this.event.index;for(let e=0;e<this.adapter.rowCount;++e){for(let e=0;e<this.event.size;++e)this.bodyStaging.appendChild(this.body.children[t]);t+=this.colCount}const e=this.bodyStaging.children[0],i=this.bodyStaging.children[this.bodyStaging.children.length-1];let s=Pt(i.style.left)+Pt(i.style.width)+this.table.WIDTH_ADJUST;s-=1;let o=s-Pt(e.style.left);if(this.animationWidth=o,this.mask=this.makeColumnMask(s,o),this.bodyStaging.appendChild(this.mask),void 0!==this.colHeads){for(let t=0;t<this.event.size;++t)this.headStaging.appendChild(this.colHeads.children[this.event.index]);this.headMask=this.makeColumnMask(s,o),this.headStaging.appendChild(this.headMask)}}splitVertical(){this.table.splitVerticalNew(this.event.index),void 0!==this.colHeads&&(this.splitHead=this.colHeads.lastElementChild);const t=Pt(this.splitBody.style.left);this.splitBody.style.width=this.initialWidth-t-1+"px",this.leftSplitBody=t,this.leftMask=Pt(this.mask.style.left),void 0!==this.colHeads&&(this.splitHead.style.left=`${t}px`,this.splitHead.style.width=this.initialWidth-t-1+"px")}joinVertical(){this.bodyStaging.removeChild(this.mask),this.body.removeChild(this.splitBody),this.bodyStaging.replaceChildren(),this.moveSplitBodyToBody(),this.colHeads&&(this.headStaging.removeChild(this.headMask),this.colHeads.removeChild(this.splitHead),this.headStaging.replaceChildren(),this.moveSplitHeadToHead()),this.table.animationDone&&this.table.animationDone()}moveSplitHeadToHead(){if(0===this.splitHead.children.length)return;let t=Pt(this.splitHead.style.left);for(;this.splitHead.children.length>0;){const e=this.splitHead.children[0];e.style.left=`${Pt(e.style.left)+t}px`,this.colHeads.appendChild(e)}}moveSplitBodyToBody(){if(0===this.splitBody.children.length)return;let t=Pt(this.splitBody.style.left);for(let e=0;e<this.rowCount;++e)for(let i=0;i<this.colCount-this.event.index;++i){const s=this.splitBody.children[0];s.style.left=`${Pt(s.style.left)+t}px`;const o=e*this.adapter.colCount+this.event.index+i;this.bodyInsertAt(s,o)}}bodyInsertAt(t,e){let i;i=e<this.body.children.length?this.body.children[e]:null,this.body.insertBefore(t,i)}}let Nt=468;function Mt(t){if(void 0===t)return;const e=function(t){for(;t!==document.body&&!1===$t(t);){if(null===t.parentElement)return;t=t.parentElement}return t}(t);if(void 0===e)return;const i=e.getBoundingClientRect(),s=t.getBoundingClientRect();if(e!==document.body){const{x:t,y:o}=function(t,e,i){const s=16,o=i.left+t.scrollLeft-e.left-s,n=i.right+t.scrollLeft-e.left+s,l=i.top+t.scrollTop-e.top-s,r=i.bottom+t.scrollTop-e.top+s,a=t.clientWidth,h=t.clientHeight;var d=t.scrollLeft,c=t.scrollTop;n-o-2*s>a?d=o:n>t.scrollLeft+a?d=n-a:o<t.scrollLeft&&(d=o);r-l-2*s>h?c=l:r>t.scrollTop+h?c=r-h:l<t.scrollTop&&(c=l);return d=Math.max(0,d),c=Math.max(0,c),{x:d,y:c}}(e,i,s);!function(t,e,i){let s,o,n=Bt.get(t);void 0===n?(n={x:e,y:i},Bt.set(t,n)):(n.x=e,n.y=i);t===document.body?(s=window.scrollX||window.pageXOffset,o=window.scrollY||window.pageYOffset):(s=t.scrollLeft,o=t.scrollTop);const l=e-s,r=i-o;if(0===l&&0===r)return void Bt.delete(t);a=a=>{if(n.x!==e||n.y!==i)return!1;const h=s+a*l,d=o+a*r;return t===document.body?window.scrollTo(h,d):(t.scrollLeft=h,t.scrollTop=d),1===a&&Bt.delete(t),!0},setTimeout((()=>{window.requestAnimationFrame(Dt.bind(window,a,void 0,void 0))}),0);var a}(e,t,o),"fixed"!==window.getComputedStyle(e).position&&window.scrollBy({left:i.left,top:i.top,behavior:"smooth"})}else window.scrollBy({left:s.left,top:s.top,behavior:"smooth"})}const Bt=new Map;let Lt=0;function Dt(t,e,i){void 0===e&&(e=Date.now(),i=++Lt);let s=(Date.now()-e)/Nt;s=s>1?1:s;const o=(n=s,.5*(1-Math.cos(Math.PI*n)));var n;!1!==t(o)&&o<1&&window.requestAnimationFrame(Dt.bind(window,t,e,i))}var It,zt=(It=window.navigator.userAgent,new RegExp(["MSIE ","Trident/","Edge/"].join("|")).test(It)?1:0);function $t(t){const e=Ot(t,"Y")&&Vt(t,"Y"),i=Ot(t,"X")&&Vt(t,"X");return e||i}function Ot(t,e){return"X"===e?t.clientWidth+zt<t.scrollWidth:t.clientHeight+zt<t.scrollHeight}function Vt(t,e){const i=window.getComputedStyle(t,null)["overflow"+e];return"auto"===i||"scroll"===i}const Wt=document.createElement("style");function Ft(t){return parseInt(t.substring(0,t.length-2))}function Pt(t){return parseFloat(t.substring(0,t.length-2))}function Ut(t){return!1!==t.isConnected&&("none"!==window.getComputedStyle(t).display&&(!t.parentElement||Ut(t.parentElement)))}Wt.textContent=y`
:host {
    position: relative;
    display: inline-block;
    border: 1px solid var(--tx-gray-300);
    border-radius: 3px;
    /* outline-offset: -2px; */
    outline: none;
    font-family: var(--tx-font-family);
    font-size: var(--tx-font-size);
    background: #1e1e1e;

    /* not sure about these */
    /*
    width: 100%;
    width: -moz-available;
    width: -webkit-fill-available;
    width: fill-available;
    height: 100%;
    height: -moz-available;
    height: -webkit-fill-available;
    height: fill-available;
    */

    min-height: 50px;
    min-width: 50px;
}

.staging, .body, .splitBody, .cols, .rows {
    position: absolute;
}

.cols {
    right: 0;
    top: 0;
}

.rows {
    left: 0;
    bottom: 0;
}

.staging {
    overflow: hidden;
    inset: 0;
}

.body {
    overflow: auto;
    inset: 0;
}

.cols, .rows {
    overflow: hidden;
}

/*
::-webkit-scrollbar the scrollbar.
::-webkit-scrollbar-button the buttons on the scrollbar (arrows pointing upwards and downwards).
::-webkit-scrollbar-thumb the draggable scrolling handle.
::-webkit-scrollbar-track the track (progress bar) of the scrollbar.
::-webkit-scrollbar-track-piece the track (progress bar) NOT covered by the handle.
::-webkit-scrollbar-corner the bottom corner of the scrollbar, where both horizontal and vertical scrollbars meet.
::-webkit-resizer the draggable resizing handle that appears at the bottom corner of some elements.
*/

/* TODO: this doesn't support all browsers */
.body::-webkit-scrollbar {
    width: 10px;
    height: 10px;
}
.body::-webkit-scrollbar-thumb {
    border-radius: 5px;
}
.body::-webkit-scrollbar-track {
    background: #1e1e1e;
}
.body::-webkit-scrollbar-corner {
    background: #1e1e1e;
}
.body::-webkit-scrollbar-thumb {
    background: var(--tx-gray-500);
}

.body > span,
.splitBody > span,
.cols > span,
.rows > span,
.measure > span,
.staging > span {
    position: absolute;
    box-sizing: content-box;
    white-space: nowrap;
    outline: none;
    border: solid 1px var(--tx-gray-200);
    padding: 0 2px 0 2px;
    margin: 0;
    background-color: #080808;
    font-weight: 400;
    overflow: hidden;
    cursor: default;
    caret-color: transparent;
}

.seamless > .body > span,
.seamless > .body > .splitBody > span,
.seamless > .cols > span,
.seamless > .rows > span,
.seamless > .cols > .splitBody > span,
.seamless > .rows > .splitBody > span,
.seamless > .measure > span,
.seamless > .staging > span {
    border: none 0px;
}

.body > span:hover {
    background: #1a1a1a;
}

.body > span.error, .splitBody > span.error {
    border-color: var(--tx-global-red-600);
    z-index: 1;
}

.body > span:focus, .splitBody > span:focus {
    background: #0e2035;
    border-color: #2680eb;
    z-index: 2;
}

.body > span:focus:hover {
    background: #112d4d;
}

.body > span.error, .splitBody > span.error {
    background-color: #522426;
}

.body > span.error:hover {
    background: #401111;
}

.cols > span.handle,
.rows > span.handle {
    padding: 0;
    border: 0 none;
    opacity: 0;
    background-color: #08f;
}
.fill {
    opacity: 0;
}

.cols > span.handle {
    cursor: col-resize;
}
.rows > span.handle {
    cursor: row-resize;
}

.staging span.head,
.cols span.head,
.rows span.head,
.measure span.head {
    background: #1e1e1e;
    font-weight: 600;
}

.colHack > span,
.cols > span {
    text-align: center;
}

.measure {
    position: absolute;
    opacity: 0;
}

.body > span.edit, .splitBody > span.edit, .body > span.edit:hover, .splitBody > span.edit:hover {
    caret-color: currentcolor;
}
`;class jt extends f{constructor(t){super(),this.WIDTH_ADJUST=6,this.HEIGHT_ADJUST=2,this.HANDLE_SIZE=5,this.HANDLE_SKEW=3,this.visible=!1,this.animator=new kt,this.arrangeAllMeasuredInGrid=this.arrangeAllMeasuredInGrid.bind(this),this.hostKeyDown=this.hostKeyDown.bind(this),this.cellKeyDown=this.cellKeyDown.bind(this),this.cellFocus=this.cellFocus.bind(this),this.focusIn=this.focusIn.bind(this),this.focusOut=this.focusOut.bind(this),this.pointerDown=this.pointerDown.bind(this),this.handleDown=this.handleDown.bind(this),this.handleMove=this.handleMove.bind(this),this.handleUp=this.handleUp.bind(this),this.setHeadingFillerSizeToScrollbarSize=this.setHeadingFillerSizeToScrollbarSize.bind(this),this.selectionChanged=this.selectionChanged.bind(this),this.modelChanged=this.modelChanged.bind(this),this.root=H(this.body=H()),this.root.className="root",this.body.className="body",this.measure=H(),this.measure.classList.add("measure"),this.onkeydown=this.hostKeyDown,this.addEventListener("focusin",this.focusIn),this.addEventListener("focusout",this.focusOut),this.body.onresize=this.setHeadingFillerSizeToScrollbarSize,this.body.onscroll=()=>{this.animator.current&&this.animator.current instanceof St&&this.animator.current.scrollStaging(),this.setHeadingFillerSizeToScrollbarSize(),this.colHeads&&(this.colHeads.scrollLeft=this.body.scrollLeft,this.colResizeHandles.scrollLeft=this.body.scrollLeft),this.rowHeads&&(this.rowHeads.scrollTop=this.body.scrollTop,this.rowResizeHandles.scrollTop=this.body.scrollTop)},this.body.onpointerdown=this.pointerDown,this.attachShadow({mode:"open",delegatesFocus:!0}),this.attachStyle(Wt),this.shadowRoot.appendChild(this.root),this.shadowRoot.appendChild(this.measure),t&&(x(this,t),t.selectionModel&&this.setModel(t.selectionModel)),void 0===jt.observer&&(jt.observer=new MutationObserver(((t,e)=>{jt.allTables.forEach((t=>{Ut(t)&&(jt.allTables.delete(t),t.prepareCells())}))})),jt.observer.observe(document.body,{attributes:!0,subtree:!0}))}connectedCallback(){setTimeout((()=>{Ut(this)?this.prepareCells():jt.allTables.add(this)}),0),super.connectedCallback(),void 0===this.selection&&(this.selection=new xt(ut.SELECT_CELL),this.selection.modified.add(this.selectionChanged,this))}disconnectedCallback(){jt.allTables.delete(this)}addStaging(...t){for(const e of t)void 0!==e&&this.root.insertBefore(e,this.root.children[0])}removeStaging(...t){for(const e of t)void 0!==e&&this.root.removeChild(e)}hostKeyDown(t){if(this.selection)switch(this.selection.mode){case ut.SELECT_ROW:{let e=this.selection.value.row;switch(t.key){case"ArrowDown":e+1<this.adapter.rowCount&&++e;break;case"ArrowUp":e>0&&--e}this.selection.row=e}break;case ut.SELECT_CELL:{let e={col:this.selection.col,row:this.selection.row};switch(t.key){case"ArrowRight":void 0===this.editing&&e.col+1<this.adapter.colCount&&(++e.col,t.preventDefault(),t.stopPropagation());break;case"ArrowLeft":void 0===this.editing&&e.col>0&&(--e.col,t.preventDefault(),t.stopPropagation());break;case"ArrowDown":e.row+1<this.adapter.rowCount&&(++e.row,t.preventDefault(),t.stopPropagation());break;case"ArrowUp":e.row>0&&(--e.row,t.preventDefault(),t.stopPropagation());break;case"Enter":void 0===this.editing?this.adapter?.config.editMode===gt.EDIT_ON_ENTER&&this.editCell():(this.saveCell(),e.row+1<this.adapter.rowCount&&(++e.row,this.selection.value=e,this.editCell())),t.preventDefault(),t.stopPropagation()}this.selection.value=e}}}cellKeyDown(t){const e=t.target;if("Enter"===t.key)return this.hostKeyDown(t),void t.preventDefault();if(!e.classList.contains("edit")&&void 0===this.editing)switch(t.key){case"ArrowDown":case"ArrowUp":case"ArrowRight":case"ArrowLeft":case"Tab":case"Enter":break;default:this.adapter?.config.editMode===gt.EDIT_ON_ENTER&&t.preventDefault()}}cellFocus(t){const e=t.target;if(e instanceof HTMLElement){const t=e.getBoundingClientRect(),i=this.clientPosToTablePos(t.x+t.width/2,t.y+t.height/2);void 0!==i&&(this.selection.value=i)}}focusIn(t){}focusOut(t){}editCell(){if(void 0!==this.editing){if(this.editing.col===this.selection.value.col&&this.editing.row===this.selection.value.row)return;console.log("WARN: Table.editCell(): already editing ANOTHER cell")}console.log("Table.editCell()");const t=this.selection.value.col,e=this.selection.value.row,i=this.body.children[t+e*this.adapter.colCount];this.editing=new mt(t,e),i.classList.add("edit"),this.adapter.editCell(this.editing,i)}saveCell(){if(void 0===this.editing)return;console.log("Table.saveCell()");const t=this.editing.col,e=this.editing.row,i=this.body.children[t+e*this.adapter.colCount];i.classList.remove("edit"),this.adapter.saveCell(this.editing,i),this.editing=void 0,this.focus()}pointerDown(t){}getModel(){return this.model}setModel(t){if(void 0===t)return this.selection&&this.selection.modified.remove(this),this.model=void 0,this.selection=new xt,void this.selection.modified.add(this.selectionChanged,this);if(t instanceof xt)return this.selection&&this.selection.modified.remove(this),this.selection=t,void this.selection.modified.add(this.selectionChanged,this);if(t instanceof pt){this.model=t,this.model.modified.add(this.modelChanged,this);const e=vt.lookup(t);try{this.adapter=new e(t)}catch(t){throw console.log(`Table.setModel(): failed to instantiate table adapter: ${t}`),console.log("setting TypeScript's target to 'es6' might help"),t}this.prepareCells()}else if(t instanceof Object)throw Error("Table.setModel(): unexpected model of type "+t.constructor.name)}selectionChanged(){if(void 0!==this.selection)switch(this.saveCell(),this.selection.mode){case ut.EDIT_CELL:if(document.activeElement===this){const t=this.body.children[this.selection.col+this.selection.row*this.adapter.colCount];(function(t){if(!document.hasFocus())return!1;let e=document.activeElement;for(;null!==e;){if(e===t)return!0;if(null===e.shadowRoot)break;e=e.shadowRoot.activeElement}return!1})(t)||t.focus(),Mt(t),this.adapter?.config.editMode===gt.EDIT_ON_FOCUS&&this.editCell()}break;case ut.SELECT_CELL:case ut.SELECT_ROW:if(document.activeElement===this){const t=this.body.children[this.selection.col+this.selection.row*this.adapter.colCount];t.focus(),Mt(t)}}}modelChanged(t){switch(t.type){case bt.CELL_CHANGED:{const e=this.body.children[t.col+t.row*this.adapter.colCount];this.showCell(t,e)}break;case bt.INSERT_ROW:this.animator.run(new At(this,t));break;case bt.REMOVE_ROW:this.animator.run(new Tt(this,t));break;case bt.INSERT_COL:this.animator.run(new _t(this,t));break;case bt.REMOVE_COL:this.animator.run(new Rt(this,t));break;default:console.log(`Table.modelChanged(): ${t} is not implemented`)}}prepareCells(){this.adapter&&(this.visible=Ut(this),this.visible&&0!==this.adapter.colCount&&0!==this.adapter.rowCount&&(this.adapter.config.seamless&&this.root.classList.add("seamless"),this.prepareMinCellSize(),this.prepareColumnHeads(),this.prepareRowHeads(),this.prepareBody(),setTimeout(this.arrangeAllMeasuredInGrid,0)))}arrangeAllMeasuredInGrid(){this.calculateMinCellSize();let{colWidths:t,colHeadHeight:e}=this.calculateColumnWidths(),{rowHeights:i,rowHeadWidth:s}=this.calculateRowHeights();this.placeColumnHeads(t,e,s),this.placeRowHeads(i,e,s),this.placeBody(s,e),this.placeBodyCells(t,i,e,s),this.setHeadingFillerSizeToScrollbarSize()}prepareMinCellSize(){if(void 0!==this.minCellHeight)return;const t=S(k("Tg"));this.measure.appendChild(t)}calculateMinCellSize(){if(void 0!==this.minCellHeight)return;const t=this.measure.children[0],e=t.getBoundingClientRect();this.minCellWidth=Math.ceil(e.width-this.WIDTH_ADJUST),this.minCellHeight=Math.ceil(e.height-this.HEIGHT_ADJUST),this.measure.removeChild(t)}prepareColumnHeads(){const t=new Array(this.adapter.colCount);for(let e=0;e<this.adapter.colCount;++e){const i=this.adapter.getColumnHead(e);void 0===this.colHeads&&void 0!==i&&(this.colHeads=H(),this.colHeads.className="cols",this.root.appendChild(this.colHeads),this.colResizeHandles=H(),this.colResizeHandles.className="cols",this.root.appendChild(this.colResizeHandles)),t[e]=i}if(void 0!==this.colHeads)for(let e=0;e<this.adapter.colCount;++e){const i=S(t[e]);i.className="head",this.measure.appendChild(i)}}prepareRowHeads(){let t=new Array(this.adapter.rowCount);for(let e=0;e<this.adapter.rowCount;++e){const i=this.adapter.getRowHead(e);void 0===this.rowHeads&&void 0!==i&&(this.rowHeads=H(),this.rowHeads.className="rows",this.root.appendChild(this.rowHeads),this.rowResizeHandles=H(),this.rowResizeHandles.className="rows",this.root.appendChild(this.rowResizeHandles)),t[e]=i}if(this.rowHeads)for(let e=0;e<this.adapter.rowCount;++e){const i=S(t[e]);i.className="head",this.measure.appendChild(i)}}prepareBody(){for(let t=0;t<this.adapter.rowCount;++t)for(let e=0;e<this.adapter.colCount;++e){const i=this.createCell();this.showCell(new mt(e,t),i),this.measure.appendChild(i)}}createCell(){const t=S();return t.onfocus=this.cellFocus,t.onkeydown=this.cellKeyDown,t.tabIndex=0,t.setAttribute("contenteditable",""),t}setCellSize(t,e,i,s,o){t.style.left=`${e}px`,t.style.top=`${i}px`,t.style.width=s-this.WIDTH_ADJUST+"px",t.style.height=o-this.HEIGHT_ADJUST+"px"}showCell(t,e){this.adapter.showCell(t,e),0!==e.children.length&&(e.style.caretColor="currentcolor")}calculateRowHeights(){let t=this.colHeads?this.adapter.colCount:0,e=0;const i=Array(this.adapter.rowCount);if(this.rowHeads)for(let s=0;s<this.adapter.rowCount;++s){const o=this.measure.children[t++].getBoundingClientRect();i[s]=Math.max(o.height,this.minCellHeight),e=Math.max(e,o.width)}else i.fill(this.minCellHeight);t=(this.colHeads?this.adapter.colCount:0)+(this.rowHeads?this.adapter.rowCount:0);for(let e=0;e<this.adapter.rowCount;++e){let s=i[e];for(let i=0;i<this.adapter.colCount;++i){const o=this.measure.children[t+i+e*this.adapter.colCount].getBoundingClientRect();s=Math.max(s,o.height)}i[e]=Math.ceil(s)}return e=Math.ceil(e),{rowHeights:i,rowHeadWidth:e}}calculateColumnWidths(t=!1){let e=0;const i=Array(this.adapter.colCount);if(this.colHeads)for(let t=0;t<this.adapter.colCount;++t){const s=this.measure.children[t].getBoundingClientRect();i[t]=Math.max(s.width,this.minCellWidth),e=Math.max(e,s.height)}else i.fill(this.minCellWidth);let s;e=Math.ceil(e),s=t?0:(this.colHeads?this.adapter.colCount:0)+(this.rowHeads?this.adapter.rowCount:0);for(let e=0;e<this.adapter.colCount;++e){let o=i[e];for(let i=0;i<this.adapter.rowCount;++i){let n,l=s+e+i*this.adapter.colCount;n=t?this.body.children[l]:this.measure.children[l];const r=n.getBoundingClientRect();o=Math.max(o,r.width)}i[e]=Math.ceil(o)}return{colWidths:i,colHeadHeight:e}}placeColumnHeads(t,e,i){if(void 0===this.colHeads)return;const s=this.adapter.config.seamless?0:1;let o=0;for(let i=0;i<this.adapter.colCount;++i){const n=this.measure.children[0];this.setCellSize(n,o,0,t[i],e),this.colHeads.appendChild(n),o+=t[i]-1-1+s}let n=S();n.classList.add("head"),n.classList.add("fill"),n.style.left=`${o}px`,n.style.top="0",n.style.width="256px",n.style.height=`${e}px`,this.colHeads.appendChild(n),this.colResizeHandles.style.left=`${i}px`,this.colResizeHandles.style.height=`${e}px`,o=-this.HANDLE_SKEW;for(let i=0;i<this.adapter.colCount;++i){o+=t[i]-1;const s=this.createHandle(i,o,0,this.HANDLE_SIZE,e);this.colResizeHandles.appendChild(s)}o+=this.HANDLE_SIZE,n=S(),n.classList.add("head"),n.classList.add("fill"),n.style.left=`${o}px`,n.style.top="0",n.style.width="256px",n.style.height=`${e}px`,this.colResizeHandles.appendChild(n)}placeRowHeads(t,e,i){if(void 0===this.rowHeads)return;const s=this.adapter.config.seamless?0:1;let o=0;for(let e=0;e<this.adapter.rowCount;++e){const n=this.measure.children[0];this.setCellSize(n,0,o,i,t[e]),this.rowHeads.appendChild(n),o+=t[e]-1-1+s}let n=S();n.classList.add("head"),n.classList.add("fill"),n.style.left="0",n.style.top=`${o}px`,n.style.width=`${i}px`,n.style.height="256px",this.rowHeads.appendChild(n),this.rowResizeHandles.style.top=`${e}px`,this.rowResizeHandles.style.width=`${i}px`,o=-this.HANDLE_SKEW;for(let e=0;e<this.adapter.rowCount;++e){o+=t[e]-1;const s=this.createHandle(e,0,o,i,this.HANDLE_SIZE);this.rowResizeHandles.appendChild(s)}o+=this.HANDLE_SIZE,n=S(),n.classList.add("head"),n.classList.add("fill"),n.style.left="0",n.style.top=`${o}0px`,n.style.width=`${i}px`,n.style.height="256px",this.rowResizeHandles.appendChild(n)}placeBody(t,e){return void 0!==this.colHeads&&(this.adapter?.config.seamless?(this.colHeads.style.height=e-2+"px",this.colHeads.style.left=t-(null==this.rowHeads?0:2)+"px"):(this.colHeads.style.height=`${e}px`,this.colHeads.style.left=t-(null==this.rowHeads?0:1)+"px")),void 0!==this.rowHeads&&(this.adapter?.config.seamless?(this.rowHeads.style.width=t-2+"px",this.rowHeads.style.top=e-(null==this.colHeads?0:2)+"px"):(this.rowHeads.style.width=`${t}px`,this.rowHeads.style.top=e-(null==this.colHeads?0:1)+"px")),--t,--e,this.adapter?.config.seamless&&(--t,--e),t<0&&(t=0),e<0&&(e=0),this.body.style.left=`${t}px`,this.body.style.top=`${e}px`,{rowHeadWidth:t,colHeadHeight:e}}placeBodyCells(t,e,i,s){const o=this.adapter.config.seamless?0:1;let n=0;for(let i=0;i<this.adapter.rowCount;++i){let s=0;for(let l=0;l<this.adapter.colCount;++l){const r=this.measure.children[0];this.setCellSize(r,s,n,t[l],e[i]),this.body.appendChild(r),s+=t[l]-2+o}n+=e[i]-2+o}}createHandle(t,e,i,s,o){const n=S();return n.className="handle",n.style.left=`${e}px`,n.style.top=`${i}px`,n.style.width=`${s}px`,n.style.height=`${o}px`,n.dataset.idx=`${t}`,n.onpointerdown=this.handleDown,n.onpointermove=this.handleMove,n.onpointerup=this.handleUp,n}handleDown(t){t.preventDefault(),this.handle=t.target,this.handleIndex=parseInt(this.handle.dataset.idx)+1,this.handle.setPointerCapture(t.pointerId);if(this.handle.parentElement===this.colResizeHandles){this.deltaHandle=t.clientX-Ft(this.handle.style.left),this.deltaSplitBody=t.clientX,this.deltaSplitHead=t.clientX-Pt(this.body.style.left);const e=this.colHeads.children[this.handleIndex-1];this.deltaColumn=t.clientX-Pt(e.style.width),this.splitVertical(this.handleIndex)}else{this.deltaHandle=t.clientY-Pt(this.handle.style.top),this.deltaSplitBody=t.clientY,this.deltaSplitHead=t.clientY-Pt(this.body.style.top);const e=this.rowHeads.children[this.handleIndex-1];this.deltaColumn=t.clientY-Pt(e.style.height),this.splitHorizontal(this.handleIndex)}}handleMove(t){if(void 0===this.handle)return;if(this.handle.parentElement===this.colResizeHandles){let e=t.clientX;const i=this.deltaColumn+8;e<i&&(e=i),this.handle.style.left=e-this.deltaHandle+"px",this.splitHead.style.left=e-this.deltaSplitHead+"px",this.splitBody.style.left=e-this.deltaSplitBody+"px";const s=this.handleIndex;this.colHeads.children[s-1].style.width=e-this.deltaColumn+"px";for(let t=0;t<this.adapter.rowCount;++t)this.body.children[s-1+t*s].style.width=e-this.deltaColumn+"px"}else{let e=t.clientY;const i=this.deltaColumn+8;e<i&&(e=i),this.handle.style.top=e-this.deltaHandle+"px",this.splitHead.style.top=e-this.deltaSplitHead+"px",this.splitBody.style.top=e-this.deltaSplitBody+"px";const s=this.handleIndex;this.rowHeads.children[s-1].style.height=e-this.deltaColumn+"px";let o=(s-1)*this.adapter.colCount;for(let t=0;t<this.adapter.colCount;++t)this.body.children[o+t].style.height=e-this.deltaColumn+"px"}}handleUp(t){if(void 0===this.handle)return;this.handleMove(t);if(this.handle.parentElement===this.colResizeHandles){let e=t.clientX;const i=this.deltaColumn+8;e<i&&(e=i),this.joinVertical(this.handleIndex,e-this.deltaSplitBody)}else{let e=t.clientY;const i=this.deltaColumn+8;e<i&&(e=i),this.joinHorizontal(this.handleIndex,e-this.deltaSplitBody)}this.handle=void 0}splitVerticalNew(t){this.splitHeadVertical(t),this.splitBodyVertical(t)}splitHeadVertical(t){if(void 0===this.colHeads)return;const e=this.adapter.config.seamless?0:1;this.splitHead=H(),this.splitHead.className="splitBody colHack",this.splitHead.style.top="0",this.splitHead.style.bottom="0",this.splitHead.style.backgroundColor=jt.splitColor;const i=t;if(0===this.body.children.length)this.splitHead.style.left="0px",this.splitHead.style.width="1px";else if(i<this.colHeads.children.length){let t=this.colHeads.children[i],s=0;const o=Pt(t.style.left);for(;i<this.colHeads.children.length;){t=this.colHeads.children[i];s+=t.getBoundingClientRect().width-e;let n=Pt(t.style.left);t.style.left=n-o+"px",this.splitHead.appendChild(t)}this.adapter.config.seamless&&(s+=e),this.splitHead.style.left=`${o}px`,this.splitHead.style.width=`${s}px`}else{let t=this.colHeads.children[this.body.children.length-1],i=t.getBoundingClientRect(),s=Pt(t.style.left)+i.width-e;this.splitHead.style.left=`${s}px`,this.splitHead.style.width="1px"}this.colHeads.appendChild(this.splitHead)}splitBodyVertical(t){const e=this.adapter.config.seamless?0:1;if(this.splitBody=H(),this.splitBody.className="splitBody",this.splitBody.style.top="0",this.splitBody.style.bottom="0",this.splitBody.style.backgroundColor=jt.splitColor,0===this.body.children.length)this.splitBody.style.left="0px",this.splitBody.style.width="1px";else{if(t<this.body.children.length/this.adapter.rowCount){let i=this.body.children[t];const s=Pt(i.style.left);let o=0;const n=this.body.children.length/this.adapter.rowCount-t;let l=t;for(let r=0;r<this.adapter.rowCount;++r){for(let t=0;t<n;++t){if(i=this.body.children[l],0===r){o+=i.getBoundingClientRect().width-e}i.style.left=Pt(i.style.left)-s+"px",this.splitBody.appendChild(i)}l+=t}this.splitBody.style.left=`${s}px`,this.splitBody.style.width=`${o}px`}else{let t=this.body.children[this.body.children.length-1],i=t.getBoundingClientRect(),s=Pt(t.style.left)+i.width-e;this.splitBody.style.left=`${s}px`,this.splitBody.style.width="1px"}}this.body.appendChild(this.splitBody)}splitVertical(t,e=0){void 0!==this.colHeads&&(this.splitHead=H(),this.splitHead.className="cols",this.splitHead.style.left=this.colHeads.style.left,this.splitHead.style.height=this.colHeads.style.height,this.root.appendChild(this.splitHead),setTimeout((()=>{this.splitHead.scrollTop=this.colHeads.scrollTop,this.splitHead.scrollLeft=this.colHeads.scrollLeft}),0)),this.splitBody=H(),this.splitBody.className="splitBody";const i=this.body.getBoundingClientRect();this.splitBody.style.width=`${i.width}px`,this.splitBody.style.height=`${i.height}px`,this.body.appendChild(this.splitBody);const s=t,o=this.adapter.colCount-t+e;if(void 0!==this.splitHead){for(let e=0;e<o;++e)this.splitHead.appendChild(this.colHeads.children[t]);this.splitHead.appendChild(this.colHeads.children[this.colHeads.children.length-1].cloneNode())}let n=t;for(let t=0;t<this.adapter.rowCount;++t){for(let t=0;t<o;++t)this.splitBody.appendChild(this.body.children[n]);n+=s}}joinVertical(t,e,i=0,s,o){void 0===s&&(s=this.adapter.colCount),void 0===o&&(o=this.adapter.rowCount);const n=s-t+i;let l=t-i;if(void 0!==this.colHeads){const t=this.colHeads.children[this.colHeads.children.length-1];for(let i=0;i<n;++i){const i=this.splitHead.children[0],s=Pt(i.style.left);i.style.left=`${s+e}px`,this.colHeads.insertBefore(i,t)}const i=Pt(t.style.left);t.style.left=`${i+e}px`;for(let t=l;t<=s;++t){const i=this.colResizeHandles.children[t],s=Pt(i.style.left);i.style.left=`${s+e}px`}}for(let t=0;t<o;++t){let t=this.body.children[l];for(let i=0;i<n;++i){const i=this.splitBody.children[0],s=Pt(i.style.left);i.style.left=`${s+e}px`,this.body.insertBefore(i,t)}l+=s}void 0!==this.colHeads&&(this.root.removeChild(this.splitHead),this.splitHead=void 0),this.body.removeChild(this.splitBody),this.splitBody=void 0}splitHorizontalNew(t){this.splitHeadHorizontal(t),this.splitBodyHorizontal(t)}splitHeadHorizontal(t){if(void 0===this.rowHeads)return;const e=this.adapter.config.seamless?0:1;this.splitHead=H(),this.splitHead.className="splitBody",this.splitHead.style.left="0",this.splitHead.style.right="0",this.splitHead.style.backgroundColor=jt.splitColor;const i=t;if(0===this.body.children.length)this.splitHead.style.top="0px",this.splitHead.style.height="1px";else if(i<this.rowHeads.children.length){let t=this.rowHeads.children[i],s=0;const o=Pt(t.style.top);for(;i<this.rowHeads.children.length;){t=this.rowHeads.children[i];s+=t.getBoundingClientRect().height-e;let n=Pt(t.style.top);t.style.top=n-o+"px",this.splitHead.appendChild(t)}this.adapter.config.seamless&&(s+=e),this.splitHead.style.top=`${o}px`,this.splitHead.style.height=`${s}px`}else{let t=this.rowHeads.children[this.body.children.length-1],i=t.getBoundingClientRect(),s=Pt(t.style.top)+i.height-e;this.splitHead.style.top=`${s}px`,this.splitHead.style.height="1px"}this.rowHeads.appendChild(this.splitHead)}splitBodyHorizontal(t){const e=this.adapter.config.seamless?0:1;this.splitBody=H(),this.splitBody.className="splitBody",this.splitBody.style.left="0",this.splitBody.style.right="0",this.splitBody.style.backgroundColor=jt.splitColor;const i=t*this.adapter.colCount;if(0===this.body.children.length)this.splitBody.style.top="0px",this.splitBody.style.height="1px";else if(i<this.body.children.length){let t=this.body.children[i],s=this.adapter.colCount,o=0;const n=Pt(t.style.top);for(;i<this.body.children.length;){if(t=this.body.children[i],--s,0===s){o+=t.getBoundingClientRect().height-e,s=this.adapter.colCount}let l=Pt(t.style.top);t.style.top=l-n+"px",this.splitBody.appendChild(t)}o+=e,this.splitBody.style.top=`${n}px`,this.splitBody.style.height=`${o}px`}else{let t=this.body.children[this.body.children.length-1],i=t.getBoundingClientRect(),s=Pt(t.style.top)+i.height-e;this.splitBody.style.top=`${s}px`,this.splitBody.style.height="1px"}this.body.appendChild(this.splitBody)}splitHorizontal(t,e=0,i){void 0!==this.rowHeads&&(this.splitHead=H(),this.splitHead.className="rows",this.splitHead.style.top=this.rowHeads.style.top,this.splitHead.style.width=this.rowHeads.style.width,this.root.appendChild(this.splitHead),setTimeout((()=>{this.splitHead.scrollTop=this.rowHeads.scrollTop,this.splitHead.scrollLeft=this.rowHeads.scrollLeft}),0)),this.splitBody=H(),this.splitBody.className="splitBody",this.splitBody.style.backgroundColor="rgba(255,128,0,0.5)";const s=this.body.getBoundingClientRect();this.splitBody.style.width=`${s.width}px`,this.splitBody.style.height=`${s.height}px`,this.body.appendChild(this.splitBody);const o=this.adapter.rowCount-t+e;if(void 0!==this.splitHead){for(let e=0;e<o;++e)this.splitHead.appendChild(this.rowHeads.children[t]);this.splitHead.appendChild(this.rowHeads.children[this.rowHeads.children.length-1].cloneNode())}let n=this.adapter.colCount*t;for(let t=0;t<o;++t)for(let t=0;t<this.adapter.colCount;++t)this.splitBody.appendChild(this.body.children[n]);if(this.splitBody.children.length>0){n=this.splitBody.children.length-1;const t=Ft(this.splitBody.children[n].style.top);for(let e=0;e<this.splitBody.children.length;++e){const i=this.splitBody.children[e],s=Ft(i.style.top);i.style.top=s-t+"px"}this.splitBody.style.backgroundColor="#f80",this.splitBody.style.top=`${t}px`,this.splitBody.style.height=s.height-t+"px"}else if(void 0!==i&&this.body.children.length>0){n=i.index*this.adapter.colCount;const t=Ft(this.body.children[n].style.top);this.splitBody.style.top=`${t}px`,this.splitBody.style.height=s.height-t+"px"}else if(this.body.children.length>0){const t=S();n=this.body.children.length-2;const e=this.body.children[n],i=this.body.children[n].getBoundingClientRect();t.style.border="none",t.style.backgroundColor="#1e1e1e";const o=Ft(e.style.top)+i.height;t.style.top=`${o}px`,t.style.left="0px",t.style.width=s.width-2+"px",t.style.height=s.height-o+"px",this.splitBody.appendChild(t)}}joinHorizontal(t,e,i=0,s,o){void 0===s&&(s=this.adapter.colCount),void 0===o&&(o=this.adapter.rowCount);const n=o-t+i;if(void 0!==this.rowHeads){const i=this.rowHeads.children[this.rowHeads.children.length-1];for(let t=0;t<n;++t){const t=this.splitHead.children[0],s=Pt(t.style.top);t.style.top=`${s+e}px`,this.rowHeads.insertBefore(t,i)}const s=Pt(i.style.top);i.style.top=`${s+e}px`;for(let i=t;i<=o;++i){const t=this.rowResizeHandles.children[i],s=Pt(t.style.top);t.style.top=`${s+e}px`}}for(let t=0;t<n;++t)for(let t=0;t<s;++t){const t=this.splitBody.children[0],i=Pt(t.style.top);t.style.top=`${i+e}px`,this.body.appendChild(t)}void 0!==this.rowHeads&&(this.root.removeChild(this.splitHead),this.splitHead=void 0),this.body.removeChild(this.splitBody),this.splitBody=void 0}setHeadingFillerSizeToScrollbarSize(){const t=this.body.getBoundingClientRect();if(void 0!==this.colHeads){const e=Math.ceil(t.width-this.body.clientWidth);this.colHeads.children[this.colHeads.children.length-1].style.width=`${e}px`,this.colHeads.style.right=`${e}px`}if(void 0!==this.rowHeads){const e=Math.ceil(t.height-this.body.clientHeight);this.rowHeads.children[this.rowHeads.children.length-1].style.height=`${e}px`,this.rowHeads.style.bottom=`${e}px`}}clientPosToTablePos(t,e){let i,s;for(i=0;i<this.adapter.colCount;++i){const e=this.body.children[i].getBoundingClientRect();if(e.x<=t&&t<e.x+e.width)break}if(i>=this.adapter.colCount)return;let o=0;for(s=0;s<this.adapter.rowCount;++s){const t=this.body.children[o].getBoundingClientRect();if(t.y<=e&&e<t.y+t.height)break;o+=this.adapter.colCount}return s>=this.adapter.rowCount?void 0:new mt(i,s)}}jt.maskColor="#1e1e1e",jt.splitColor="#1e1e1e",jt.allTables=new Set,jt.define("tx-table",jt);class Gt extends f{static focusIn(t){const e=new Map;for(let i=t.parentElement,s=0;null!==i;i=i.parentElement,++s)e.set(i,s);let i,s,o=Number.MAX_SAFE_INTEGER,n=new Array;for(const s of this.allTools.values())if(s.canHandle(t))for(let t=s.parentElement,l=0;null!==t;t=t.parentElement,++l){const l=e.get(t);void 0!==l&&(o<l||(o>l&&(n.length=0),o=l,i=t,n.push(s)))}if(!i)return;const l=Gt.getIndex(t,i);let r=Number.MIN_SAFE_INTEGER;for(let t of n){const e=Gt.getIndex(t,i);e<l&&e>r&&(r=e,s=t)}this.setActive(s,t)}static getIndex(t,e){void 0===e&&console.trace(`GenericTool.getIndex(${t}, ${e})`);let i=t;for(;i.parentElement!==e;)i=i.parentElement;return Array.from(e.childNodes).indexOf(i)}static setActive(t,e){this.activeTool&&this.activeTool.deactivate(),this.activeTool=t,this.activeView=e,t&&t.activate()}static focusOut(t){this.activeView===t&&this.setActive(void 0,void 0)}connectedCallback(){super.connectedCallback(),Gt.allTools.add(this)}disconnectedCallback(){Gt.activeTool===this&&Gt.setActive(void 0,void 0),Gt.allTools.delete(this),super.disconnectedCallback()}}Gt.allTools=new Set,window.addEventListener("focusin",(t=>{t.target instanceof Gt||(t.relatedTarget instanceof f&&Gt.focusOut(t.relatedTarget),t.target instanceof f&&Gt.focusIn(t.target))}));let Yt=document.createElement("style");Yt.textContent="\n\n/* try to follow material ui: when active render button labels in black, otherwise in gray */\nsvg .fill {\n  fill: var(--tx-gray-700);\n  stroke: var(--tx-gray-700);\n}\nsvg .stroke {\n  fill: none;\n  stroke: var(--tx-gray-700);\n}\nsvg .strokeFill {\n  fill: var(--tx-gray-200);\n  stroke: var(--tx-gray-700);\n}\n\n/*\nthese don't seem to be in use anymore\n.toolbar.active svg .fill {\n  fill: #000;\n  stroke: #000;\n}\n.toolbar.active svg .stroke {\n  fill: none;\n  stroke: #000;\n}\n.toolbar.active svg .strokeFill {\n  fill: #fff;\n  stroke: #000;\n}\n*/\n\n.toolbar button {\n    background: var(--tx-gray-75);\n    color: var(--tx-gray-800);\n    border: 1px var(--tx-gray-400);\n    border-style: solid solid solid none;\n    padding: 5;\n    margin: 0;\n    vertical-align: middle;\n    height: 22px;\n}\n\n.toolbar button:active:hover {\n    background: linear-gradient(to bottom, var(--tx-gray-600) 0%,var(--tx-gray-50) 100%,var(--tx-gray-500) 100%);\n}\n\n.toolbar button.left {\n    border-style: solid;\n    border-radius: 3px 0 0 3px;\n}\n\n.toolbar button.right {\n    border: 1px var(--tx-gray-400);\n    border-style: solid solid solid none;\n    border-radius: 0 3px 3px 0;\n}\n\n.toolbar button.active {\n    background: linear-gradient(to bottom, var(--tx-gray-600) 0%,var(--tx-gray-50) 100%,var(--tx-gray-500) 100%);\n    border: 1px var(--tx-global-blue-500) solid;\n    color: var(--tx-gray-900);\n}\n\ndiv.textarea {\n  font-family: var(--tx-font-family);\n  font-size: var(--tx-font-size);\n  border: 1px var(--tx-gray-400) solid;\n  border-radius: 3px;\n  margin: 2px;\n  padding: 4px 5px;\n  outline-offset: -2px;\n}\n\ndiv.textarea h1 {\n  font-size: 22px;\n  margin: 0;\n  padding: 4px 0 4px 0;\n}\n\ndiv.textarea h2 {\n  font-size: 18px;\n  margin: 0;\n  padding: 4px 0 4px 0;\n}\n\ndiv.textarea h3 {\n  font-size: 16px;\n  margin: 0;\n  padding: 4px 0 4px 0;\n}\n\ndiv.textarea h4 {\n  font-size: 14px;\n  margin: 0;\n  padding: 4px 0 4px 0;\n}\n\ndiv.textarea div {\n  padding: 2px 0 2px 0;\n}\n";function Jt(t){return void 0!==t&&"insertRow"in t&&"removeRow"in t}function qt(t){return void 0!==t&&"insertColumn"in t&&"removeColumn"in t}f.define("tx-tabletool",class extends Gt{constructor(){super(),this.toolbar=b("div",{class:"toolbar"}),this.buttonAddRowAbove=b("button",{class:"left",title:"add row above",children:m("svg",{style:{display:"block"},viewBox:"0 0 13 13",width:"13",height:"13",children:[b("rect",{x:"0.5",y:"0.5",width:"12",height:"12",class:"strokeFill"}),b("line",{x1:"0.5",y1:"8.5",x2:"12.5",y2:"8.5",class:"stroke"}),b("line",{x1:"4.5",y1:"8.5",x2:"4.5",y2:"13.5",class:"stroke"}),b("line",{x1:"8.5",y1:"8.5",x2:"8.5",y2:"13.5",class:"stroke"}),b("line",{x1:"6.5",y1:"2",x2:"6.5",y2:"7",class:"stroke"}),b("line",{x1:"4",y1:"4.5",x2:"9",y2:"4.5",class:"stroke"})]})}),this.buttonAddRowAbove.onclick=()=>{this.lastActiveTable?.focus();const t=this.lastActiveTable?.model,e=this.lastActiveTable?.selection;e&&Jt(t)&&t.insertRow(e.row)},this.toolbar.appendChild(this.buttonAddRowAbove),this.buttonAddRowBelow=b("button",{title:"add row below",children:m("svg",{viewBox:"0 0 13 13",width:"13",height:"13",children:[b("rect",{x:"0.5",y:"0.5",width:"12",height:"12",class:"strokeFill"}),b("line",{x1:"0.5",y1:"4.5",x2:"12.5",y2:"4.5",class:"stroke"}),b("line",{x1:"4.5",y1:"0.5",x2:"4.5",y2:"4.5",class:"stroke"}),b("line",{x1:"8.5",y1:"0.5",x2:"8.5",y2:"4.5",class:"stroke"}),b("line",{x1:"6.5",y1:"6",x2:"6.5",y2:"11",class:"stroke"}),b("line",{x1:"4",y1:"8.5",x2:"9",y2:"8.5",class:"stroke"})]})}),this.buttonAddRowBelow.onclick=()=>{this.lastActiveTable?.focus();const t=this.lastActiveTable?.model,e=this.lastActiveTable?.selection;e&&Jt(t)&&t.insertRow(e.row+1)},this.toolbar.appendChild(this.buttonAddRowBelow),this.buttonDeleteRow=b("button",{class:"right",title:"delete row",children:m("svg",{viewBox:"0 0 13 13",width:"13",height:"13",children:[b("rect",{x:"0.5",y:"0.5",width:"12",height:"12",class:"strokeFill"}),b("line",{x1:"0.5",y1:"4.5",x2:"12.5",y2:"4.5",class:"stroke"}),b("line",{x1:"0.5",y1:"8.5",x2:"12.5",y2:"8.5",class:"stroke"}),b("line",{x1:"5.5",y1:"3.5",x2:"11.5",y2:"9.5",class:"stroke","stroke-width":"1.5"}),b("line",{x1:"11.5",y1:"3.5",x2:"5.5",y2:"9.5",class:"stroke","stroke-width":"1.5"})]})}),this.buttonDeleteRow.onclick=()=>{this.lastActiveTable?.focus();const t=this.lastActiveTable?.model,e=this.lastActiveTable?.selection;e&&Jt(t)&&t.removeRow(e.row,1)},this.toolbar.appendChild(this.buttonDeleteRow),this.toolbar.appendChild(document.createTextNode(" ")),this.buttonAddColumnLeft=b("button",{class:"left",title:"add column left",children:m("svg",{viewBox:"0 0 13 13",width:"13",height:"13",children:[b("rect",{x:"0.5",y:"0.5",width:"12",height:"12",class:"strokeFill"}),b("line",{x1:"8.5",y1:"0.5",x2:"8.5",y2:"12.5",class:"stroke"}),b("line",{x1:"8.5",y1:"4.5",x2:"12.5",y2:"4.5",class:"stroke"}),b("line",{x1:"8.5",y1:"8.5",x2:"12.5",y2:"8.5",class:"stroke"}),b("line",{x1:"2",y1:"6.5",x2:"7",y2:"6.5",class:"stroke"}),b("line",{x1:"4.5",y1:"4",x2:"4.5",y2:"9",class:"stroke"})]})}),this.buttonAddColumnLeft.onclick=()=>{this.lastActiveTable?.focus();const t=this.lastActiveTable?.model,e=this.lastActiveTable?.selection;e&&qt(t)&&t.insertColumn(e.col)},this.toolbar.appendChild(this.buttonAddColumnLeft),this.buttonAddColumnRight=b("button",{title:"add column right",children:m("svg",{viewBox:"0 0 13 13",width:"13",height:"13",children:[b("rect",{x:"0.5",y:"0.5",width:"12",height:"12",class:"strokeFill"}),b("line",{x1:"4.5",y1:"0.5",x2:"4.5",y2:"12.5",class:"stroke"}),b("line",{x1:"0.5",y1:"4.5",x2:"4.5",y2:"4.5",class:"stroke"}),b("line",{x1:"0.5",y1:"8.5",x2:"4.5",y2:"8.5",class:"stroke"}),b("line",{x1:"6",y1:"6.5",x2:"11",y2:"6.5",class:"stroke"}),b("line",{x1:"8.5",y1:"4",x2:"8.5",y2:"9",class:"stroke"})]})}),this.buttonAddColumnRight.onclick=()=>{this.lastActiveTable?.focus();const t=this.lastActiveTable?.model,e=this.lastActiveTable?.selection;e&&qt(t)&&t.insertColumn(e.col+1)},this.toolbar.appendChild(this.buttonAddColumnRight),this.buttonDeleteColumn=b("button",{class:"right",title:"delete column",children:m("svg",{viewBox:"0 0 13 13",width:"13",height:"13",children:[b("rect",{x:"0.5",y:"0.5",width:"12",height:"12",class:"strokeFill"}),b("line",{x1:"4.5",y1:"0.5",x2:"4.5",y2:"12.5",class:"stroke"}),b("line",{x1:"8.5",y1:"0.5",x2:"8.5",y2:"12.5",class:"stroke"}),b("line",{x1:"3.5",y1:"5.5",x2:"9.5",y2:"11.5",class:"stroke","stroke-width":"1.5"}),b("line",{x1:"3.5",y1:"11.5",x2:"9.5",y2:"5.5",class:"stroke","stroke-width":"1.5"})]})}),this.buttonDeleteColumn.onclick=()=>{this.lastActiveTable?.focus();const t=this.lastActiveTable?.model,e=this.lastActiveTable?.selection;e&&qt(t)&&t.removeColumn(e.col,1)},this.toolbar.appendChild(this.buttonDeleteColumn),this.toolbar.appendChild(document.createTextNode(" ")),this.buttonAddNodeAbove=b("button",{class:"left",title:"add node above",children:m("svg",{style:{display:"block",border:"none"},viewBox:"0 0 8 17",width:"8",height:"17",children:[b("rect",{x:"0.5",y:"1.5",width:"6",height:"6",class:"strokeFill"}),b("rect",{x:"0.5",y:"9.5",width:"6",height:"6",class:"fill"}),b("line",{x1:"3.5",y1:"3",x2:"3.5",y2:"6",class:"stroke"}),b("line",{x1:"2",y1:"4.5",x2:"5",y2:"4.5",class:"stroke"}),b("line",{x1:"3.5",y1:"0",x2:"3.5",y2:"1",class:"stroke"}),b("line",{x1:"3.5",y1:"8",x2:"3.5",y2:"17",class:"stroke"})]})}),this.toolbar.appendChild(this.buttonAddNodeAbove),this.buttonAddNodeBelow=b("button",{title:"add node below",children:m("svg",{style:{display:"block",border:"none"},viewBox:"0 0 8 17",width:"8",height:"17",children:[b("rect",{x:"0.5",y:"1.5",width:"6",height:"6",class:"fill"}),b("rect",{x:"0.5",y:"9.5",width:"6",height:"6",class:"strokeFill"}),b("line",{x1:"3.5",y1:"11",x2:"3.5",y2:"14",class:"stroke"}),b("line",{x1:"2",y1:"12.5",x2:"5",y2:"12.5",class:"stroke"}),b("line",{x1:"3.5",y1:"0",x2:"3.5",y2:"9",class:"stroke"}),b("line",{x1:"3.5",y1:"16",x2:"3.5",y2:"17",class:"stroke"})]})}),this.toolbar.appendChild(this.buttonAddNodeBelow),this.buttonAddNodeParent=b("button",{title:"add node parent",children:m("svg",{viewBox:"0 0 13 17",width:"13",height:"17",children:[b("rect",{x:"0.5",y:"1.5",width:"6",height:"6",class:"strokeFill"}),b("rect",{x:"6.5",y:"9.5",width:"6",height:"6",class:"fill"}),b("line",{x1:"7",y1:"4.5",x2:"10",y2:"4.5",class:"stroke"}),b("line",{x1:"9.5",y1:"4",x2:"9.5",y2:"9",class:"stroke"}),b("line",{x1:"3.5",y1:"3",x2:"3.5",y2:"6",class:"stroke"}),b("line",{x1:"2",y1:"4.5",x2:"5",y2:"4.5",class:"stroke"}),b("line",{x1:"3.5",y1:"0",x2:"3.5",y2:"1",class:"stroke"}),b("line",{x1:"3.5",y1:"8",x2:"3.5",y2:"17",class:"stroke"})]})}),this.buttonAddNodeParent.onclick=()=>{},this.toolbar.appendChild(this.buttonAddNodeParent),this.buttonAddNodeChild=b("button",{title:"add node child",children:m("svg",{viewBox:"0 0 13 17",width:"13",height:"17",children:[b("rect",{x:"0.5",y:"1.5",width:"6",height:"6",class:"fill"}),b("rect",{x:"6.5",y:"9.5",width:"6",height:"6",class:"strokeFill"}),b("line",{x1:"7",y1:"4.5",x2:"10",y2:"4.5",class:"stroke"}),b("line",{x1:"9.5",y1:"4",x2:"9.5",y2:"9",class:"stroke"}),b("line",{x1:"9.5",y1:"11",x2:"9.5",y2:"14",class:"stroke"}),b("line",{x1:"8",y1:"12.5",x2:"11",y2:"12.5",class:"stroke"}),b("line",{x1:"3.5",y1:"0",x2:"3.5",y2:"17",class:"stroke"})]})}),this.toolbar.appendChild(this.buttonAddNodeChild),this.buttonDeleteNode=b("button",{class:"right",title:"delete node",children:m("svg",{viewBox:"0 0 10 17",width:"10",height:"17",children:[b("rect",{x:"1.5",y:"5.5",width:"6",height:"6",class:"strokeFill"}),b("line",{x1:"4.5",y1:"2",x2:"4.5",y2:"5",class:"stroke"}),b("line",{x1:"4.5",y1:"12",x2:"4.5",y2:"15",class:"stroke"}),b("line",{x1:"0.5",y1:"4.5",x2:"8.5",y2:"12.5",class:"stroke","stroke-width":"1.5"}),b("line",{x1:"8.5",y1:"4.5",x2:"0.5",y2:"12.5",class:"stroke","stroke-width":"1.5"})]})}),this.toolbar.appendChild(this.buttonDeleteNode),this.attachShadow({mode:"open"}),this.shadowRoot.appendChild(document.importNode(Yt,!0)),this.shadowRoot.appendChild(this.toolbar)}canHandle(t){return t instanceof jt}activate(){this.lastActiveTable=Gt.activeView,this.toolbar.classList.add("active")}deactivate(){this.lastActiveTable=void 0,this.toolbar.classList.remove("active")}});const Xt=document.createElement("style");Xt.textContent=y`
:host {
    display: inline-block;
}

.tx-text {
    width: 100%;
    box-shadow: none;
    box-sizing: border-box;
    color: var(--tx-edit-fg-color);
    background-color: var(--tx-edit-bg-color);

    /* we use the border instead of an outline to indicate the focus */
    outline: none;
    border-width: var(--tx-border-width);
    border-style: solid;
    border-color: var(--tx-border-color);
    border-radius: var(--tx-border-radius);

    font-weight: var(--tx-edit-font-weight);
    font-size: var(--tx-edit-font-size);
    line-height: 18px;

    padding: 4px 8px 4px 8px;
    text-indent: 0;
    vertical-align: top;
    margin: 0;
    overflow: visible;
    text-overflow: ellipsis;
}
.tx-text:hover {
    border-color: var(--tx-border-color-hover);
}
.tx-text:disabled {
    color: var(--tx-fg-color-disabled);
    background-color: var(--tx-bg-color-disabled);
    border-color: var(--tx-bg-color-disabled);
}
.tx-text::placeholder {
    color: var(--tx-placeholder-fg-color);
    font-style: italic;
    font-weight: 300;
}
.tx-text:hover::placeholder {
    color: var(--tx-placeholder-fg-color-hover);
}
.tx-text:focus {
    border-color: var(--tx-outline-color);
}
.tx-text.tx-error {
    border-color: var(--tx-warning-color)
}
`;class Zt extends w{constructor(t){super(t),this.input=document.createElement("input"),this.input.classList.add("tx-text"),this.input.oninput=()=>{this.updateModel()},this.wheel=this.wheel.bind(this),this.input.onwheel=this.wheel,this.attachShadow({mode:"open"}),this.attachStyle(Xt),this.shadowRoot.appendChild(this.input)}wheel(t){this.model instanceof a&&(t.deltaY>0&&(this.model.decrement(),t.preventDefault()),t.deltaY<0&&(this.model.increment(),t.preventDefault()))}focus(){this.input.focus()}blur(){this.input.blur()}static get observedAttributes(){return["value"]}attributeChangedCallback(t,e,i){if("value"===t)this.model&&void 0!==i&&(this.model.value=i)}updateModel(){this.model&&(this.model.value=this.input.value),this.setAttribute("value",this.input.value)}updateView(){if(!this.model)return;const t=`${this.model.value}`;this.input.value!==t&&(this.input.value=t,this.setAttribute("value",t)),void 0!==this.model.error?this.input.classList.add("tx-error"):this.input.classList.remove("tx-error")}get value(){return this.input.value}set value(t){this.input.value=t,this.updateModel()}}Zt.define("tx-text",Zt);class Kt extends w{constructor(){super(),Kt.texttool=this;let t=b("div",{class:"toolbar"});this.buttonH1=b("button",{class:"left",children:"H1"}),this.buttonH1.onclick=()=>{document.execCommand("formatBlock",!1,"<h1>"),this.update()},t.appendChild(this.buttonH1),this.buttonH2=b("button",{children:"H2"}),this.buttonH2.onclick=()=>{document.execCommand("formatBlock",!1,"<h2>"),this.update()},t.appendChild(this.buttonH2),this.buttonH3=b("button",{children:"H3"}),this.buttonH3.onclick=()=>{document.execCommand("formatBlock",!1,"<h3>"),this.update()},t.appendChild(this.buttonH3),this.buttonH4=b("button",{class:"right",children:"H4"}),this.buttonH4.onclick=()=>{document.execCommand("formatBlock",!1,"<h4>"),this.update()},t.appendChild(this.buttonH4),t.appendChild(document.createTextNode(" ")),this.buttonBold=b("button",{class:"left",children:b("b",{children:"B"})}),this.buttonBold.onclick=()=>{document.execCommand("bold",!1),this.update()},t.appendChild(this.buttonBold),this.buttonItalic=b("button",{children:b("i",{children:"I"})}),this.buttonItalic.onclick=()=>{document.execCommand("italic",!1),this.update()},t.appendChild(this.buttonItalic),this.buttonUnderline=b("button",{children:b("u",{children:"U"})}),this.buttonUnderline.onclick=()=>{document.execCommand("underline",!1),this.update()},t.appendChild(this.buttonUnderline),this.buttonStrikeThrough=b("button",{children:b("strike",{children:"S"})}),this.buttonStrikeThrough.onclick=()=>{document.execCommand("strikeThrough",!1),this.update()},t.appendChild(this.buttonStrikeThrough),this.buttonSubscript=b("button",{children:"x₂"}),this.buttonSubscript.onclick=()=>{document.execCommand("subscript",!1),this.update()},t.appendChild(this.buttonSubscript),this.buttonSuperscript=b("button",{class:"right",children:"x²"}),this.buttonSuperscript.onclick=()=>{document.execCommand("superscript",!1),this.update()},t.appendChild(this.buttonSuperscript),t.appendChild(document.createTextNode(" ")),this.buttonJustifyLeft=b("button",{class:"left",children:m("svg",{viewBox:"0 0 10 9",width:"10",height:"9",children:[b("line",{x1:"0",y1:"0.5",x2:"10",y2:"0.5",class:"stroke"}),b("line",{x1:"0",y1:"2.5",x2:"6",y2:"2.5",class:"stroke"}),b("line",{x1:"0",y1:"4.5",x2:"10",y2:"4.5",class:"stroke"}),b("line",{x1:"0",y1:"6.5",x2:"6",y2:"6.5",class:"stroke"}),b("line",{x1:"0",y1:"8.5",x2:"10",y2:"8.5",class:"stroke"})]})}),this.buttonJustifyLeft.onclick=()=>{document.execCommand("justifyLeft",!1),this.update()},t.appendChild(this.buttonJustifyLeft),this.buttonJustifyCenter=b("button",{children:m("svg",{viewBox:"0 0 10 9",width:"10",height:"9",children:[b("line",{x1:"0",y1:"0.5",x2:"10",y2:"0.5",class:"stroke"}),b("line",{x1:"2",y1:"2.5",x2:"8",y2:"2.5",class:"stroke"}),b("line",{x1:"0",y1:"4.5",x2:"10",y2:"4.5",class:"stroke"}),b("line",{x1:"2",y1:"6.5",x2:"8",y2:"6.5",class:"stroke"}),b("line",{x1:"0",y1:"8.5",x2:"10",y2:"8.5",class:"stroke"})]})}),this.buttonJustifyCenter.onclick=()=>{document.execCommand("justifyCenter",!1),this.update()},t.appendChild(this.buttonJustifyCenter),this.buttonJustifyRight=b("button",{class:"right",children:m("svg",{viewBox:"0 0 10 9",width:"10",height:"9",children:[b("line",{x1:"0",y1:"0.5",x2:"10",y2:"0.5",class:"stroke"}),b("line",{x1:"4",y1:"2.5",x2:"10",y2:"2.5",class:"stroke"}),b("line",{x1:"0",y1:"4.5",x2:"10",y2:"4.5",class:"stroke"}),b("line",{x1:"4",y1:"6.5",x2:"10",y2:"6.5",class:"stroke"}),b("line",{x1:"0",y1:"8.5",x2:"10",y2:"8.5",class:"stroke"})]})}),this.buttonJustifyRight.onclick=()=>{document.execCommand("justifyRight",!1),this.update()},t.appendChild(this.buttonJustifyRight),this.attachShadow({mode:"open"}),this.shadowRoot.appendChild(document.importNode(Yt,!0)),this.shadowRoot.appendChild(t)}update(){this.buttonH1.classList.toggle("active","h1"===document.queryCommandValue("formatBlock")),this.buttonH2.classList.toggle("active","h2"===document.queryCommandValue("formatBlock")),this.buttonH3.classList.toggle("active","h3"===document.queryCommandValue("formatBlock")),this.buttonH4.classList.toggle("active","h4"===document.queryCommandValue("formatBlock")),this.buttonBold.classList.toggle("active",document.queryCommandState("bold")),this.buttonItalic.classList.toggle("active",document.queryCommandState("italic")),this.buttonUnderline.classList.toggle("active",document.queryCommandState("underline")),this.buttonStrikeThrough.classList.toggle("active",document.queryCommandState("strikeThrough")),this.buttonSubscript.classList.toggle("active",document.queryCommandState("subscript")),this.buttonSuperscript.classList.toggle("active",document.queryCommandState("superscript")),this.buttonJustifyLeft.classList.toggle("active",document.queryCommandState("justifyLeft")),this.buttonJustifyCenter.classList.toggle("active",document.queryCommandState("justifyCenter")),this.buttonJustifyRight.classList.toggle("active",document.queryCommandState("justifyRight"))}}Kt.define("tx-texttool",Kt);class Qt extends w{constructor(t){super(t);let e=document.createElement("div");this.content=e,e.classList.add("tx-text"),e.contentEditable="true",e.oninput=t=>{if(this.model instanceof n){let i=t.target.firstChild;i&&3===i.nodeType?document.execCommand("formatBlock",!1,"<div>"):"<br>"===e.innerHTML&&(e.innerHTML="")}this.updateModel()},e.onkeydown=t=>{this.model instanceof n&&(!0===t.metaKey&&"b"===t.key?(t.preventDefault(),document.execCommand("bold",!1),this.updateTextTool()):!0===t.metaKey&&"i"===t.key?(t.preventDefault(),document.execCommand("italic",!1),this.updateTextTool()):!0===t.metaKey&&"u"===t.key?(t.preventDefault(),document.execCommand("underline",!1),this.updateTextTool()):"Tab"===t.key?t.preventDefault():"Enter"===t.key&&!0!==t.shiftKey&&"blockquote"===document.queryCommandValue("formatBlock")&&document.execCommand("formatBlock",!1,"<p>"))},e.onkeyup=()=>{this.updateTextTool()},e.onmouseup=()=>{this.updateTextTool()},this.attachShadow({mode:"open"}),this.attachStyle(Xt),this.shadowRoot.appendChild(e)}updateTextTool(){void 0!==Kt.texttool&&Kt.texttool.update()}updateModel(){this.model&&(this.model.promise=()=>this.model instanceof n?this.content.innerHTML:this.content.innerText)}updateView(){this.model&&(this.model instanceof n?this.content.innerHTML!==this.model.value&&(this.content.innerHTML=this.model.value):this.content.innerText!==this.model.value&&(this.content.innerText=this.model.value))}}Qt.define("tx-textarea",Qt);class te extends w{constructor(t){super(t)}updateView(){this.model&&(this.style.display=this.model.value?"":"none")}}te.define("tx-if",te);class ee extends it{constructor(t,e){super(),this.enumClass=t,void 0!==e&&(this._value=e)}get value(){return this._value}set value(t){this.setValue(t)}get stringValue(){return this.toString()}set stringValue(t){this.fromString(t)}getValue(){return this._value}setValue(t){this._value!==t&&(this._value=t,this.modified.trigger())}toString(){return this.enumClass[this._value]}fromString(t){const e=this.enumClass[t];if(void 0===e||"string"!=typeof this.enumClass[e]){let e="";return Object.keys(this.enumClass).forEach((t=>{const i=this.enumClass[t];"string"==typeof i&&(e=0!==e.length?`${e}, ${i}`:i)})),void console.trace(`EnumModel<T>.fromString('${t}'): invalid value, must be one of ${e}`)}this._value!==e&&(this._value=e,this.modified.trigger())}isValidStringValue(t){const e=this.enumClass[t];return void 0!==e&&"string"==typeof this.enumClass[e]}}class ie{constructor(t,e,i){this.type=t,this.index=e,this.size=i}get col(){return this.index}get row(){return this.size}toString(){return`TableEvent {type: ${bt[this.type]}, index: ${this.index}, size: ${this.size}}`}}class se{constructor(t,e,i=!0){this.node=t,this.depth=e,this.open=i}}class oe extends ft{constructor(t,e){super(t),this.rows=new Array,void 0!==e&&this.createRowInfoHelper(this.rows,e,0)}get colCount(){return 1}get rowCount(){return this.rows.length}getRow(t){for(let e=0;e<this.rows.length;++e)if(this.rows[e].node===t)return e}addSiblingBefore(t){const e=this.createNode();return 0===this.rows.length?(t=0,this.setRoot(e),this.rows.push(new se(e,0))):0===t?(this.setNext(e,this.getRoot()),this.setRoot(e),this.rows.unshift(new se(e,0))):(this.setNext(e,this.rows[t].node),this.getNext(this.rows[t-1].node)===this.rows[t].node?this.setNext(this.rows[t-1].node,e):this.setDown(this.rows[t-1].node,e),this.rows.splice(t,0,new se(e,this.rows[t].depth))),this.modified.trigger(new ie(bt.INSERT_ROW,t,1)),t}addSiblingAfter(t){const e=this.createNode();if(0===this.rows.length)t=0,this.setRoot(e),this.rows.push(new se(e,0));else{this.setNext(e,this.getNext(this.rows[t].node)),this.setNext(this.rows[t].node,e);const i=this.nodeCount(this.getDown(this.rows[t].node)),s=this.rows[t].depth;t+=i+1,this.rows.splice(t,0,new se(e,s))}return this.modified.trigger(new ie(bt.INSERT_ROW,t,1)),t}addChildAfter(t){const e=this.createNode();if(0===this.rows.length)this.setRoot(e),this.rows.push(new se(e,0)),this.modified.trigger(new ie(bt.INSERT_ROW,0,1));else{const i=this.getDown(this.rows[t].node),s=this.nodeCount(i);for(let e=0;e<s;++e)++this.rows[t+1+e].depth;this.setDown(e,i),this.setDown(this.rows[t].node,e),this.rows.splice(t+1,0,new se(e,this.rows[t].depth+1)),this.modified.trigger(new ie(bt.INSERT_ROW,t+1,1))}return t}addParentBefore(t){const e=this.createNode();if(0===t){for(let e=0;e<this.rows.length;++e)++this.rows[t+e].depth;this.setDown(e,this.getRoot()),this.setRoot(e),this.rows.unshift(new se(e,0))}else{const i=this.rows[t].depth,s=this.nodeCount(this.getDown(this.rows[t].node))+1;for(let e=0;e<s;++e)++this.rows[t+e].depth;this.setDown(e,this.rows[t].node),this.setNext(e,this.getNext(this.rows[t].node)),this.setNext(this.rows[t].node,void 0),this.getNext(this.rows[t-1].node)===this.rows[t].node?this.setNext(this.rows[t-1].node,e):this.setDown(this.rows[t-1].node,e),this.rows.splice(t,0,new se(e,i))}return this.modified.trigger(new ie(bt.INSERT_ROW,t,1)),t}deleteAt(t){let e=this.getDown(this.rows[t].node);if(void 0!==e){const i=this.nodeCount(e)+1;for(let e=0;e<i;++e)--this.rows[t+e].depth;this.append(e,this.getNext(this.rows[t].node)),this.setNext(this.rows[t].node,void 0),0===t?this.setRoot(e):this.setNext(this.rows[t-1].node,e)}else if(0===t){const e=this.getNext(this.rows[t].node);this.setNext(this.rows[t].node,void 0),this.setRoot(e)}else{const e=this.getNext(this.rows[t].node);this.setNext(this.rows[t].node,void 0),this.getNext(this.rows[t-1].node)===this.rows[t].node?this.setNext(this.rows[t-1].node,e):this.setDown(this.rows[t-1].node,e)}return this.rows.splice(t,1),this.modified.trigger(new ie(bt.REMOVE_ROW,t,1)),t}init(){}toggleAt(t){this.rows[t].open?this.closeAt(t):this.openAt(t)}isOpen(t){return this.rows[t].open}openAt(t){let e=this.rows[t];if(e.open||void 0===this.getDown(e.node))return;e.open=!0;const i=this.createRowInfo(t);this.rows.splice(t+1,0,...i),this.modified.trigger(new ie(bt.INSERT_ROW,t+1,i.length))}closeAt(t){let e=this.rows[t];if(!e.open||void 0===this.getDown(e.node))return;const i=this.getVisibleChildCount(t);e.open=!1,this.rows.splice(t+1,i),this.modified.trigger(new ie(bt.REMOVE_ROW,t+1,i))}collapse(){let t=0;for(;t<this.rowCount;)this.closeAt(t),++t;for(let t of this.rows)t.open=!1}createRowInfo(t){const e=new Array;let i=this.rows[t];return i.open&&this.getDown(i.node)&&this.createRowInfoHelper(e,this.getDown(i.node),i.depth+1),e}createRowInfoHelper(t,e,i){const s=new se(e,i,!1);t.push(s),s.open&&this.getDown(e)&&this.createRowInfoHelper(t,this.getDown(e),s.depth+1),this.getNext(e)&&this.createRowInfoHelper(t,this.getNext(e),s.depth)}getVisibleChildCount(t){let e=this.rows[t],i=1;if(e.open&&this.getDown(e.node)){const e=this.getVisibleChildCountHelper(t+1);t+=e,i+=e}return i-1}getVisibleChildCountHelper(t){let e=this.rows[t],i=1;if(e.open&&this.getDown(e.node)){const e=this.getVisibleChildCountHelper(t+1);t+=e,i+=e}if(this.getNext(e.node)){const e=this.getVisibleChildCountHelper(t+1);t+=e,i+=e}return i}append(t,e){if(void 0===e)return;let i,s=t;for(;i=this.getNext(s),void 0!==i;)s=i;this.setNext(s,e)}nodeCount(t){return void 0===t?0:1+this.nodeCount(this.getDown(t))+this.nodeCount(this.getNext(t))}}class ne extends oe{constructor(t,e){super(t,e),this.root=e}createNode(){return new this.nodeClass}deleteNode(t){}getRoot(){return this.root}setRoot(t){this.root=t}getDown(t){return t.down}setDown(t,e){t.down=e}getNext(t){return t.next}setNext(t,e){t.next=e}}class le extends vt{}class re extends le{}class ae extends re{constructor(t){super(t),this.config.seamless=!0}treeCell(t,e,i){this._showCell(t,e);const s=S(k(i));s.style.verticalAlign="middle",s.style.padding="2px",e.appendChild(s)}showCell(t,e){this._showCell(t,e)}_showCell(t,e){if(void 0===this.model)return void console.log("no model");const i=this.model.rows[t.row],s=12,o=3.5,n=Math.round(2)-.5,l=i.depth*s+s+o,r=M();r.setAttributeNS(null,"width",`${l}`),r.setAttributeNS(null,"height","12"),r.style.verticalAlign="middle",r.style.background="none";const a=i.depth;if(void 0!==this.model.getDown(i.node)){const t=a*s+o,e=function(t,e,i,s,o,n){const l=document.createElementNS(N,"rect");return l.setAttributeNS(null,"x",`${t}`),l.setAttributeNS(null,"y",`${e}`),l.setAttributeNS(null,"width",`${i}`),l.setAttributeNS(null,"height",`${s}`),void 0!==o&&l.setAttributeNS(null,"stroke",o),void 0!==n&&l.setAttributeNS(null,"fill",n),l}(t,n,8,8,"#000","#fff");e.style.cursor="pointer",r.appendChild(e);const l=L(t+2,n+4,t+8-2,n+4,"#000");l.style.cursor="pointer",r.appendChild(l);const h=L(t+4,n+2,t+4,n+8-2,"#000");h.style.cursor="pointer",h.style.display=i.open?"none":"",r.appendChild(h),r.appendChild(L(t+8,n+4,t+8+3,n+4,"#f80")),r.onpointerdown=e=>{e.preventDefault(),e.stopPropagation();const s=this.model.getRow(i.node);if(void 0===s)return void console.log("  ==> couldn't find row number for node");const o=r.getBoundingClientRect(),l=e.clientX-o.left,a=e.clientY-o.top;t<=l&&l<=t+8&&n<=a&&a<=n+8&&(this.model?.toggleAt(s),h.style.display=this.model.isOpen(s)?"none":"")}}else r.appendChild(L(a*s+o+4-.5,0,a*s+o+4,n+4,"#f80")),r.appendChild(L(a*s+o+4,n+4,a*s+o+8+3,n+4,"#f80"));let h="";for(let e=0;e<=a;++e){const n=e*s+o+4+2;for(let s=t.row+1;s<this.model.rowCount&&!(this.model.rows[s].depth<e);++s)if(e===this.model.rows[s].depth){(e!==a||void 0!==this.model.getNext(i.node))&&(h+=`<line x1='${n}' y1='0' x2='${n}' y2='100%' stroke='%23f80' />`);break}}if(void 0===this.model.getDown(i.node)||void 0===this.model.getNext(i.node)){const t=a*s+o+4+2;h+=`<line x1='${t}' y1='0' x2='${t}' y2='4' stroke='%23f80' />`}e.style.background=`url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' style='background: %23000;'>${h}</svg>")`,e.style.backgroundRepeat="repeat-y",e.replaceChildren(r)}}class he extends d{constructor(t){super(),this.root=P(t),this.registerViews()}registerViews(){let t=this.root.querySelectorAll("[model]");for(let e of t){let t=e;if(t)try{this.registerView(t.getModelId(),t)}catch(t){}}t=this.root.querySelectorAll("[action]");for(let e of t){let t=e;if(t)try{this.registerView(t.getActionId(),t)}catch(t){}}}openHref(t){}}class de extends ft{constructor(t,e=0,i=0,s){super(t),this._cols=e,this._rows=i;const o=e*i;if(s)this._data=s;else{this._data=void 0===s?new Array(o):s;for(let t=0;t<o;++t)this._data[t]=new this.nodeClass}}asArray(){return this._data}get colCount(){return this._cols}get rowCount(){return this._rows}getCell(t,e){const i=t+e*this._cols;if(i>=this._data.length)throw Error(`GridTableModel.getCell(${t}, ${e}) is out of range in grid of size ${this.colCount} x ${this.rowCount}`);return this._data[i]}setCell(t,e,i){this._data[t+e*this._cols]=i}insertRow(t,e,i=this._cols){if(0===this._data.length&&(this._cols=i),void 0===e){e=new Array(this._cols);for(let t=0;t<this._cols;++t)e[t]=new this.nodeClass}const s=e.length/this._cols;return this._data.splice(t*this._cols,0,...e),this._rows+=s,this.modified.trigger(new ie(bt.INSERT_ROW,t,s)),t}removeRow(t,e=1){return this._data.splice(t*this._cols,this._cols*e),this._rows-=e,this.modified.trigger(new ie(bt.REMOVE_ROW,t,e)),t}insertColumn(t,e,i=this._rows){if(0===this._data.length&&(this._rows=i),void 0===e){e=new Array(this._rows);for(let t=0;t<this._rows;++t)e[t]=new this.nodeClass}const s=e.length/this._rows;let o=t+this._cols*(this._rows-1),n=e.length;for(let t=0;t<this._rows;++t){for(let t=0;t<s;++t)this._data.splice(o,0,e[--n]);o-=this._cols}return this._cols+=s,this.modified.trigger(new ie(bt.INSERT_COL,t,s)),t}removeColumn(t,e=1){let i=t+this._cols*(this._rows-1);for(let t=0;t<this._rows;++t)this._data.splice(i,e),i-=this._cols;return this._cols-=e,this.modified.trigger(new ie(bt.REMOVE_COL,t,e)),t}}class ce{constructor(t){this.value=t}eval(t){if("number"==typeof this.value)return this.value;if(this.value instanceof Array){if(void 0===t)throw Error(`yikes: no model to get cell [${this.value[0]},${this.value[1]}]`);return t.getCell(this.value[0],this.value[1])._calculatedValue}switch(this.value){case"+":return this.down.eval(t)+this.down.next.eval(t);case"-":return this.down?.next?this.down.eval(t)-this.down.next.eval(t):-this.down.eval(t);case"*":return this.down.eval(t)*this.down.next.eval(t);case"/":return this.down.eval(t)/this.down.next.eval(t);default:throw Error(`unexpected token '${this.value}'`)}}append(t){if(void 0===this.down)this.down=t;else{let e=this.down;for(;e.next;)e=e.next;e.next=t}}dependencies(t=[]){return this.value instanceof Array&&t.push(this.value),this.next&&this.next.dependencies(t),this.down&&this.down.dependencies(t),t}toString(){return this._toString()}_toString(t="\n",e=0){for(let i=0;i<e;++i)t+="    ";t+=this.value,t+="\n";for(let i=this.down;i;i=i.next)t=i._toString(t,e+1);return t}}class pe{constructor(t){this.i=0,this.stack=[],this.str=t}isspace(t){return" "==t||"\n"==t||"\r"==t||"\t"==t||"\t"==t}isnumber(t){const e=t.charCodeAt(0);return e>=48&&e<=57}isalpha(t){const e=t.charCodeAt(0);return e>=65&&e<=90||e>=145&&e<=122}isalnum(t){return this.isnumber(t)||this.isalpha(t)}unlex(t){this.stack.push(t)}lex(){if(this.stack.length>0)return this.stack.pop();let t=0,e=0,i=0;if(this.i>=this.str.length)return;const s=this.i;for(;;){let o=this.str.at(this.i);switch(i){case 0:if(void 0===o)return;if(this.isspace(o)){++this.i;break}if(this.isnumber(o)){++this.i,i=1;break}if(this.isalpha(o)){t=0,i=3;break}switch(o){case"+":case"-":case"*":case"/":case"(":case")":case"=":return++this.i,new ce(o)}return;case 1:if(void 0!==o&&this.isnumber(o)){++this.i;break}if("."===o||"e"==o||"E"==o){++this.i,i=2;break}return new ce(parseFloat(this.str.substring(s,this.i)));case 2:if(void 0!==o&&this.isnumber(o)){++this.i;break}return new ce(parseFloat(this.str.substring(s,this.i)));case 3:if(void 0!==o){const s=o.charCodeAt(0);if(s>=48&&s<=57){e=s-48,i=4,++this.i;break}if(s>=65&&s<=90){t*=26,t+=s-64,++this.i;break}if(s>=145&&s<=122){t*=26,t+=s-144,++this.i;break}}return new ce(this.str.substring(s,this.i));case 4:if(void 0!==o){const t=o.charCodeAt(0);if(t>=48&&t<=57){e*=10,e+=t-48,++this.i;break}}return new ce([t-1,e-1])}}}}function ue(t){const e=ge(t);if(void 0===e)return;const i=t.lex();if(void 0===i)return e;if("+"===i.value||"-"===i.value){const s=ue(t);return void 0===s?(t.unlex(i),e):(i.append(e),i.append(s),i)}return t.unlex(i),e}function ge(t){const e=be(t);if(void 0===e)return;const i=t.lex();if(void 0===i)return e;if("*"===i.value||"/"===i.value){const s=ge(t);if(void 0===s)throw Error(`expexted expression after ${i.value}`);return i.append(e),i.append(s),i}return t.unlex(i),e}function be(t){const e=t.lex();if(void 0!==e){if("number"==typeof e.value)return e;if(e.value instanceof Array)return e;if("("===e.value){const e=ue(t);if(void 0===e)throw Error("Unexpected end after '(");const i=t.lex();if(")"!==i?.value)throw Error("Excepted ')");return e}if("-"===e.value){const i=be(t);if(void 0!==i)return e.append(i),e}t.unlex(e)}}class me{constructor(t){void 0!==t&&0!==t.trim().length&&(this.value=t)}eval(t){void 0!==this._node&&(this._calculatedValue=this._node.eval(t))}set value(t){this._node=function(t){const e=t.lex();if(void 0!==e&&"="===e.value)return ue(t)}(new pe(t)),this._inputValue=t}get value(){return this._error&&void 0!==this._inputValue?this._inputValue:this._node?`${this._calculatedValue}`:void 0!==this._inputValue?this._inputValue:""}getDependencies(){return void 0!==this._node?this._node.dependencies():[]}}class xe extends de{constructor(t,e){super(me,t,e),this.dependencies=new Map}getField(t,e){const i=this.getCell(t,e);return void 0===i?"":`${i.value}`}setField(t,e,i){const s=t+e*this._cols;let o=this._data[s];void 0===o?(o=new me(i),this._data[t+e*this._cols]=o):(this.unobserve(o),o.value=i),this.observe(o),this.eval(o,new Set)}sendCellChanged(t){let e=0;for(let i=0;i<this._rows;++i)for(let s=0;s<this._cols;++s)if(t===this._data[e++])return void this.modified.trigger(new ie(bt.CELL_CHANGED,s,i))}eval(t,e){if(e.has(t))return void e.forEach((t=>{t._error="Cycle: This formula can't reference its own cell, or depend on another formula that references this cell.",this.sendCellChanged(t)}));t._error&&(t._error=void 0,this.sendCellChanged(t)),e.add(t);const i=t._calculatedValue;t.eval(this),i!=t._calculatedValue&&this.sendCellChanged(t);const s=this.dependencies.get(t);void 0!==s&&s.forEach((t=>{this.eval(t,e)}))}observe(t){t.getDependencies().forEach((e=>{const i=e[0]+e[1]*this._cols;let s=this._data[i];void 0===s&&(s=new me,this._data[i]=s);let o=this.dependencies.get(s);void 0===o&&(o=new Set,this.dependencies.set(s,o)),o.add(t)}))}unobserve(t){t.getDependencies().forEach((e=>{const i=e[0]+e[1]*this._cols;let s=this._data[i];if(void 0!==s){let e=this.dependencies.get(s);void 0!==e&&e.delete(t)}}))}}class fe extends w{constructor(t){super(t)}updateView(){void 0!==this.model?this.model instanceof o?this.innerText=this.model.value:this.model instanceof n?this.innerHTML=this.model.value:this.model instanceof a&&(this.innerText=`${this.model.value}`):this.innerText=""}}fe.define("tx-display",fe);const we=document.createElement("style");we.textContent=y`
.tx-search {
    display: inline-block;
    position: relative;
}
.tx-search > div {
    display: inline-flex;
    position: relative;
}
.tx-search > div > svg {
    display: block;
    position: absolute;
    height: 18px;
    width: 18px;
    top: 7px;
    left: 10px;
    pointer-events: none;
    overflow: hidden;
    fill: var(--tx-gray-700);
}
.tx-search > div > input {
    box-sizing: border-box;
    padding: 3px 12px 5px 35px;
    margin: 0;
    border: 1px solid var(--tx-gray-400);
    border-radius: 4px;
    -webkit-appearance: none;
    outline-offset: -2px;
    outline: none;
    width: 100%;
    height: 32px;
    overflow: visible;
    background: var(--tx-gray-50);

    color: var(--tx-gray-900);  
    font-weight: var(--tx-edit-font-weight);
    font-size: var(--tx-edit-font-size);
    line-height: 18px;
}
/* the button is transparent so that the border of the input field remains visible */
.tx-search > button {
    display: inline-flex;
    position: absolute;
    box-sizing: border-box;
    right: 0;
    top: 0;
    bottom: 0;
    width: 32px;
    padding: 0;
    margin: 1px;
    border: none;
    align-items: center;
    justify-content: center;
    overflow: visible;
    vertical-align: top;
    cursor: pointer;
    border-radius: 0 4px 4px 0;
    text-align: center;
    outline: none;

    background-color: var(--tx-gray-50);
    border-radius: 0 4px 4px 0;

}
.tx-search > button > svg {
    display: inline-block;
    pointer-events: none;
    height: 10px;
    width: 10px;
    padding: 0;
    margin: 0;
    border: none;
    fill: var(--tx-gray-700);
}
.tx-search > div > input:hover {
    border-color: var(--tx-gray-500);
}

.tx-search > div > input:focus {
    border-color: var(--tx-outline-color);
}
.tx-search > button:focus > svg {
    fill: var(--tx-outline-color);
}

.tx-search > div > input:disabled {
    color: var(--tx-gray-700);
    background-color: var(--tx-gray-200);
    border-color: var(--tx-gray-200);
}
.tx-search > button:disabled {
    background-color: var(--tx-gray-200);
}
.tx-search > button:disabled > svg {
    fill: var(--tx-gray-400);
}`;class ve extends w{constructor(t){let e,i,s,o;super(t);const n=((...t)=>C("form",t))(H(e=M(o=B("M33.173 30.215L25.4 22.443a12.826 12.826 0 10-2.957 2.957l7.772 7.772a2.1 2.1 0 002.958-2.958zM6 15a9 9 0 119 9 9 9 0 01-9-9z")),s=A()),T(i=M(B("M6.548 5L9.63 1.917A1.094 1.094 0 008.084.371L5.001 3.454 1.917.37A1.094 1.094 0 00.371 1.917L3.454 5 .37 8.085A1.094 1.094 0 101.917 9.63l3.084-3.083L8.084 9.63a1.094 1.094 0 101.547-1.546z"))));e.setAttributeNS(null,"width","100%"),e.setAttributeNS(null,"height","100%"),o.setAttributeNS(null,"transform","scale(0.5, 0.5)"),i.setAttributeNS(null,"width","100%"),i.setAttributeNS(null,"height","100%"),s.type="search",s.placeholder="Search",s.autocomplete="off",n.classList.add("tx-search"),this.attachShadow({mode:"open"}),this.attachStyle(we),this.shadowRoot.appendChild(n)}}ve.define("tx-search",ve);let ye=document.createElement("style");ye.textContent="\n:host {\n    display: inline-block;\n    overflow: hidden;\n    box-sizing: border-box;\n    border: 1px solid #e3dbdb;\n    border-radius: 3px;\n    background: #e3dbdb;\n    width: 32px;\n    height: 32px;\n    margin: 0;\n    padding: 0;\n}\n\n:host([selected]) {\n    background: #ac9393;\n}\n\n:host([disabled]) {\n    opacity: 0.5;\n}\n\n:host([disabled]) img {\n    opacity: 0.5;\n}\n\n:host([checked][disabled]) {\n}\n";class Ce extends w{constructor(t){super(t),t?(this.setAttribute("value",t.value),this.setAttribute("img",t.img),!0===t.disabled&&this.setAttribute("disabled","disabled")):t={value:this.getAttribute("value"),img:this.getAttribute("img"),disabled:this.hasAttribute("disabled")},this.onmousedown=t=>{this.hasAttribute("disabled")||(this.focus(),t.preventDefault(),void 0!==this.model&&(this.model.stringValue=this.getValue()))};let e=document.createElement("img");e.src=t.img,this.attachShadow({mode:"open"}),this.shadowRoot.appendChild(document.importNode(ye,!0)),this.shadowRoot.appendChild(e)}getValue(){let t=this.getAttribute("value");if(null===t)throw Error("no value");return t}connectedCallback(){super.connectedCallback(),void 0===this.model&&this.setAttribute("disabled","")}updateView(){if(void 0===this.model)return this.setAttribute("disabled",""),void this.removeAttribute("selected");let t=this.getValue();this.model.isValidStringValue(t)?this.removeAttribute("disabled"):this.setAttribute("disabled",""),this.model.stringValue===t?this.setAttribute("selected",""):this.removeAttribute("selected")}}Ce.define("tx-toolbutton",Ce);class ke extends w{constructor(t){super(t)}updateView(){if(!this.model)return;let t=void 0===this.model.value?"":this.model.value;this.model instanceof n?this.innerHTML=t:this.innerText=t}}ke.define("tx-slot",ke);class He extends HTMLElement{}f.define("tx-menuspacer",He);class Se extends ft{constructor(t,e){super(e),this.data=t}get rowCount(){return this.data?this.data.length:0}createRow(){return new this.nodeClass}insertRow(t,e){if(t>this.rowCount)throw Error(`ArrayTableModel.insert(${t}) is out of range, model size is ${this.colCount}, ${this.rowCount}`);let i;return void 0===e&&(e=this.createRow()),i=e instanceof Array?e:[e],this.data.splice(t,0,...i),this.modified.trigger(new ie(bt.INSERT_ROW,t,i.length)),t}removeRow(t,e=1){if(t>=this.rowCount||t+e>this.rowCount)throw Error(`ArrayTableModel.remove(${t}, ${e}) is out of range, model size is ${this.colCount}, ${this.rowCount}`);return this.data.splice(t,e),this.modified.trigger(new ie(bt.REMOVE_ROW,t,e)),t}}class Ee extends Se{constructor(t,e){super(t,e)}get colCount(){throw Error("ArrayModel.colCount() should not be called. Override TableAdapter.colCount() instead.")}}class Ae extends re{getColumnHead(t){const e=this.getColumnHeads();if(void 0!==e)return document.createTextNode(e[t])}getRowHead(t){}get colCount(){return this.getRow(this.model?.data[0]).length}showCell(t,e){const i=this.getField(t.col,t.row);void 0!==i&&e.replaceChildren(document.createTextNode(i))}editCell(t,e){}getField(t,e){if(!this.model)return;const i=this.model.data[e];return this.getRow(i)[t].toString()}setField(t,e,i){this.model&&(this.getRow(this.model.data[e])[t].fromString(i),this.model.modified.trigger(new ie(bt.CELL_CHANGED,t,e)))}}class Te extends re{showCell(t,e){if(!this.model)return;const i=this.model.getCell(t.col,t.row);void 0!==i?e.replaceChildren(k(i.value)):e.replaceChildren()}getRowHead(t){return k(`${t+1}`)}getColumnHead(t){let e="",i=t;for(;e=`${String.fromCharCode(i%26+65)}${e}`,i=Math.floor(i/26),0!==i;)i-=1;return k(e)}}const _e=["AL","LE","XE","GE","ZA","CE","BI","SO","US","ES","AR","MA","IN","DI","RE","A","ER","AT","EN","BE","RA","LA","VE","TI","ED","OR","QU","AN","TE","IS","RI","ON"],Re=["Anarchy","Feudal","Multi-government","Dictatorship","Communist","Confederacy","Democracy","Corporate State"],Ne=["Rich","Average","Poor","Mainly"],Me=[" Industrial"," Agricultural"],Be=["Large ","Fierce ","Small "],Le=["Green ","Red ","Yellow ","Blue ","Black ","Harmless "],De=["Slimy ","Bug-Eyed ","Horned ","Bony ","Fat ","Furry "],Ie=["Rodents ","Frogs","Lizards","Lobsters","Birds","Humanoids","Felines","Insects"];class ze extends pt{constructor(){super()}get colCount(){return 4}get rowCount(){return 64}get(t,e){return ze.get(t,e)}static get(t,e){let i=this.hash(`${e}`);switch(t){case 0:{let t="",s=i%6+1;for(let o=0;o<s;++o)i=this.hash(`${e}`,i),t+=_e[i%_e.length];return t.charAt(0)+t.toLowerCase().substring(1)}case 1:return Re[i%Re.length];case 2:{i>>>=3;const t=i%Ne.length;i>>>=2;return Ne[t]+Me[i%Me.length]}case 3:{i>>>=6;let t=i%Be.length;i>>>=2;const e=i%Le.length;i>>>=3;const s=i%De.length;i>>>=3;return Be[t]+Le[e]+De[s]+Ie[(i%4+s)%Ie.length]}}throw Error(`unreachable col ${t}, row ${e}`)}static hash(t,e=0){let i=3735928559^e,s=1103547991^e;for(let e,o=0;o<t.length;o++)e=t.charCodeAt(o),i=Math.imul(i^e,2654435761),s=Math.imul(s^e,1597334677);return i=Math.imul(i^i>>>16,2246822507)^Math.imul(s^s>>>13,3266489909),s=Math.imul(s^s>>>16,2246822507)^Math.imul(i^i>>>13,3266489909),4294967296*(2097151&s)+(i>>>0)}}class $e extends vt{constructor(t){super(t)}getColumnHead(t){switch(t){case 0:return k("Name");case 1:return k("Government");case 2:return k("Economy");case 3:return k("Species")}}getRowHead(t){return k(`${t+1}`)}showCell(t,e){e.replaceChildren(k(this.model.get(t.col,t.row)))}}class Oe{constructor(){this.name="New Name",this.government="New Government",this.economy="New Economy",this.species="New Species"}}class Ve extends Ae{getColumnHeads(){return["Name","Government","Economy","Species"]}getRow(t){return function(t,...e){return e.map((e=>new g(t,e)))}(t,"name","government","economy","species")}}function We(){!function(){let t;!function(t){t[t.CLASSIC=0]="CLASSIC",t[t.CHERRY=1]="CHERRY",t[t.VANILLA=2]="VANILLA"}(t||(t={}));const e=document.getElementById("soda");e.onanimationend=()=>{e.classList.remove("animated")};const i=new ee(t);i.value=t.CLASSIC,p("flavour",i);const s=new a(330,{min:0,max:1500});p("quantity",s),u("fill",(()=>{const o=s.value/s.max;switch(document.documentElement.style.setProperty("--soda-height",`${o}`),i.value){case t.CLASSIC:document.documentElement.style.setProperty("--soda-color","#420");break;case t.CHERRY:document.documentElement.style.setProperty("--soda-color","#d44");break;case t.VANILLA:document.documentElement.style.setProperty("--soda-color","#d80")}e.classList.add("animated")}))}(),function(){vt.register($e,ze),p("fixedSystem",new ze);const t=Array(64);for(let e=0;e<64;++e)t[e]={name:ze.get(0,e),government:ze.get(1,e),economy:ze.get(2,e),species:ze.get(3,e)};vt.register(Ve,Ee,Oe),p("dynamicSystem",new Ee(t,Oe))}(),function(){ae.register(oi,ne,si);let t=new ne(si);t.addSiblingAfter(0),t.addChildAfter(0),t.addChildAfter(1),t.addSiblingAfter(2),t.addSiblingAfter(1),t.addChildAfter(4),t.addSiblingAfter(0),p("tree",t)}()}window.onload=()=>{We()};const Fe=new o("",{label:"The Name of Your Avatar",description:"An avatar is a computer-enhanced doppelganger; a\ncomputer-generated image that takes your place in a three-dimensional online\nencounter."}),Pe=new class extends o{set value(t){this.modified.withLock((()=>{this._value!==t&&(t=t.trim(),super.value=t,/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(t)||(this.error="The value is not a valid email address."))}))}get value(){return super.value}}("",{label:"Email address",description:'Contains a locally interpreted string followed by the\nat-sign character ("@", ASCII value 64) followed by an Internet domain. The\nlocally interpreted string is either a quoted-string or a dot-atom.  If the\nstring can be represented as a dot-atom (that is, it contains no characters\nother than atext characters or "." surrounded by atext characters), then the\ndot-atom form SHOULD be used and the quoted-string form SHOULD NOT be used.\nComments and folding white space SHOULD NOT be used around the "@" in the addr-spec.'}),Ue=new a(1970,{min:1900,max:2025,label:"Year of Birth",description:"Unlikely and invalid entries should result in an error message."});p("nameModel",Fe),p("mailModel",Pe),p("birthModel",Ue);let je=new o("");p("hello",je);let Ge=new n("");Ge.modified.add((()=>{document.getElementById("rawhtml").innerText=Ge.value})),p("markup",Ge),u("hitMe",(()=>{je.value="Hit me too!",Ye.enabled=!0}));var Ye=u("hitMeMore",(()=>{je.value="You hit me!",Ye.enabled=!1}));u("dummy",(()=>{}));const Je=new r(!1),qe=new r(!0),Xe=new r(!1);Xe.enabled=!1;const Ze=new r(!0);var Ke;Ze.enabled=!1,p("off",Je),p("on",qe),p("offDisabled",Xe),p("onDisabled",Ze),function(t){t[t.BLUEBERRY=0]="BLUEBERRY",t[t.GRAPE=1]="GRAPE",t[t.TANGERINE=2]="TANGERINE",t[t.LIME=3]="LIME",t[t.STRAWBERRY=4]="STRAWBERRY",t[t.BONDIBLUE=5]="BONDIBLUE"}(Ke||(Ke={}));const Qe=new ee(Ke);Qe.value=Ke.GRAPE,p("flavourEnabled",Qe);const ti=new ee(Ke);ti.enabled=!1,ti.value=Ke.TANGERINE,p("flavourDisabled",ti);p("customFlavour",new o(""));p("customFlavourDisabled",new o("")),p("size",new a(42,{min:0,max:99})),u("file|logout",(()=>{alert("You are about to logout")})),u("help",(()=>{alert("Please.")}));const ei=[["Name","Pieces","Price/Piece","Price"],["Apple","=4","=0.98","=B2*C2"],["Banana","=2","=1.98","=B3*C3"],["Citrus","=1","=1.48","=B4*C4"],["SUM","","","=D2+D3+D4"]],ii=new xe(25,25);for(let t=0;t<ii.rowCount;++t)for(let e=0;e<ii.colCount;++e)t<ei.length&&e<ei[t].length&&ii.setField(e,t,ei[t][e]);vt.register(class extends Te{constructor(t){super(t),this.config.editMode=gt.EDIT_ON_ENTER}showCell(t,e){if(!this.model)return;const i=this.model.getCell(t.col,t.row);i._error?(e.classList.add("error"),e.title=i._error):(e.classList.remove("error"),e.title=""),super.showCell(t,e)}editCell(t,e){const i=this.model.getCell(t.col,t.row);void 0!==i&&void 0!==i._inputValue&&(e.innerText=i._inputValue)}saveCell(t,e){try{this.model.setField(t.col,t.row,e.innerText);const i=this.model.getCell(t.col,t.row);e.innerText=i.value}catch(t){console.log("saveCell caught error")}}},xe,me),p("spreadsheet",ii);class si{constructor(){this.label="#"+si.counter++}}si.counter=0;class oi extends ae{constructor(t){super(t),this.config.seamless=!0}showCell(t,e){if(void 0===this.model)return void console.log("no model");const i=this.model.rows[t.row].node.label;super.treeCell(t,e,i)}}class ni extends HTMLElement{constructor(){super(),this.condition=new r(!1);let t=new he("my-code-button"),e=t.text("label","Show Code");t.action("action",(()=>{this.condition.value?(this.condition.value=!1,e.value="Show Code"):(this.condition.value=!0,e.value="Hide Code")})),this.attachShadow({mode:"open"}),this.shadowRoot.appendChild(t.root)}connectedCallback(){p(this.getAttribute("condition"),this.condition)}}return window.customElements.define("my-code-button",ni),t.main=We,t}({});
