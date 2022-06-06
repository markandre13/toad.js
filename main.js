var example=function(t){"use strict";class e{constructor(t,e){this.callback=t,this.id=e}}class i{add(t,i){this.callbacks||(this.callbacks=new Array),this.callbacks.push(new e(t,i))}remove(t){if(this.callbacks)for(let e=this.callbacks.length-1;e>=0;--e)this.callbacks[e].id===t&&this.callbacks.splice(e,1)}count(){return this.callbacks?this.callbacks.length:0}lock(){this.locked=!0}unlock(){if(this.triggered){for(;this.triggered.length>0;)this.trigger(this.triggered[0]),this.triggered.shift();this.triggered=void 0}this.locked=void 0}trigger(t){if(this.locked)return void 0===this.triggered&&(this.triggered=[]),void this.triggered.push(t);if(this.callbacks)for(let e=0;e<this.callbacks.length;++e)this.callbacks[e].callback(t)}}class s{constructor(){this._enabled=!0,this.modified=new i}set enabled(t){this._enabled!=t&&(this._enabled=t,this.modified.trigger(void 0))}get enabled(){return this._enabled}}class o extends s{constructor(t){super(),this._value=t}set value(t){this._value!=t&&(this._value=t,this.modified.trigger())}get value(){return this._value}}class n extends o{constructor(t){super(t)}}class r extends o{constructor(t,e){super(t),e&&(this.min=e.min,this.max=e.max,this.step=e.step)}}class l extends s{constructor(t=""){super(),this._value=t}set promise(t){this._value=t,this.modified.trigger()}get promise(){return"string"==typeof this._value?()=>this._value:this._value}set value(t){this._value!==t&&("string"==typeof t?(this._value=t,this.modified.trigger()):console.trace(`TextModel.set value(value: string): ${typeof t} is not type string`))}get value(){switch(typeof this._value){case"number":case"string":this._value=`${this._value}`;break;case"function":this._value=this._value()}return this._value}}class a extends l{constructor(t){super(t)}}class d extends s{constructor(t,e){super(),this.signal=new i,this.title=e,this._enabled=!0}set value(t){throw Error("Action.value can not be assigned a value")}get value(){throw Error("Action.value can not return a value")}trigger(t){this._enabled&&this.signal.trigger(t)}}class h{constructor(){this.modelId2Models=new Map,this.modelId2Views=new Map,this.view2ModelIds=new Map,this.sigChanged=new i}registerAction(t,e){let i=new d(void 0,t);return i.signal.add(e),this._registerModel("A:"+t,i),i}registerModel(t,e){this._registerModel("M:"+t,e)}_registerModel(t,e){let i=this.modelId2Models.get(t);i||(i=new Set,this.modelId2Models.set(t,i)),i.add(e);let s=this.modelId2Views.get(t);if(s)for(let t of s)t.setModel(e)}registerView(t,e){if(e.controller&&e.controller!==this)return void console.log("error: attempt to register view more than once at different controllers");e.controller=this;let i=this.view2ModelIds.get(e);i||(i=new Set,this.view2ModelIds.set(e,i)),i.add(t);let s=this.modelId2Views.get(t);s||(s=new Set,this.modelId2Views.set(t,s)),s.add(e);let o=this.modelId2Models.get(t);if(o)for(let t of o)e.setModel(t)}unregisterView(t){if(!t.controller)return;if(t.controller!==this)throw Error("attempt to unregister view from wrong controller");let e=this.view2ModelIds.get(t);if(e)for(let i of e){let e=this.modelId2Views.get(i);e&&(e.delete(t),0===e.size&&this.modelId2Views.delete(i),t.setModel(void 0))}}clear(){for(let t of this.view2ModelIds)t[0].setModel(void 0);this.modelId2Models.clear(),this.modelId2Views.clear(),this.view2ModelIds.clear()}bind(t,e){this.registerModel(t,e)}action(t,e){return this.registerAction(t,e)}text(t,e){let i=new l(e);return this.bind(t,i),i}html(t,e){let i=new a(e);return this.bind(t,i),i}boolean(t,e){let i=new n(e);return this.bind(t,i),i}number(t,e,i){let s=new r(e,i);return this.bind(t,s),s}}let c=new h;function u(t,e){c.bind(t,e)}function p(t,e){return c.registerAction(t,e)}class b{constructor(t,e){this.object=t,this.attribute=e.toString()}get(){return this.object[this.attribute]}set(t){Object.defineProperty(this.object,this.attribute,{value:t})}toString(){return`${this.object[this.attribute]}`}fromString(t){const e=typeof this.object[this.attribute];let i;switch(e){case"string":i=t;break;case"number":i=Number.parseFloat(t);break;default:throw Error(`Reference.fromString() isn't yet supported for type ${e}`)}Object.defineProperty(this.object,this.attribute,{value:i})}}function x(t,e,i){return void 0!==e&&void 0!==e.children&&(e.children=[e.children]),g(t,e)}function g(t,e,i){let s;if("string"!=typeof t)return new t(e);const o=t;switch(o){case"svg":case"line":case"rect":case"circle":case"path":case"text":s="http://www.w3.org/2000/svg";break;default:s="http://www.w3.org/1999/xhtml"}const n=document.createElementNS(s,o);return m(n,e,s),n}function m(t,e,i){if(null!=e){for(let[s,o]of Object.entries(e))switch(s){case"children":break;case"action":t.setAction(o);break;case"model":t.setModel(o);break;case"class":t.classList.add(o);break;case"style":for(let[e,i]of Object.entries(o)){const s=/[A-Z]/g;e=e.replace(s,(t=>"-"+t.toLowerCase())),t.style.setProperty(e,i)}break;case"set":Object.defineProperty(e.set.object,e.set.attribute,{value:t});break;default:if("on"===s.substring(0,2))t.addEventListener(s.substr(2),o);else if("object"!=typeof o){if("http://www.w3.org/2000/svg"===i){const t=/[A-Z]/g;s=s.replace(t,(t=>"-"+t.toLowerCase()))}t.setAttributeNS(null,s,`${o}`)}}if(void 0!==e.children)for(let i of e.children)"string"==typeof i?t.appendChild(document.createTextNode(i)):t.appendChild(i)}}class v extends HTMLElement{constructor(t){super(),m(this,t)}static define(t,e,i){const s=window.customElements.get(t);void 0===s?window.customElements.define(t,e,i):s!==e&&console.trace(`View::define(${t}, ...): attempt to redefine view with different constructor`)}attachStyle(t){this.shadowRoot.appendChild(document.importNode(t,!0))}setModel(t){console.trace("Please note that View.setModel(model) has no implementation.")}getModelId(){if(!this.hasAttribute("model"))throw Error("no 'model' attribute");let t=this.getAttribute("model");if(!t)throw Error("no model id");return"M:"+t}getActionId(){if(!this.hasAttribute("action"))throw Error("no 'action' attribute");let t=this.getAttribute("action");if(!t)throw Error("no action id");return"A:"+t}connectedCallback(){if(this.controller)return;let t="";try{t=this.getModelId()}catch(t){}""!=t&&c.registerView(t,this)}disconnectedCallback(){this.controller&&this.controller.unregisterView(this)}}class w extends v{constructor(t){super(t),void 0!==t?.model&&this.setModel(t.model)}updateModel(){}updateView(t){}setModel(t){if(t===this.model)return;const e=this;this.model&&this.model.modified.remove(e),t&&t.modified.add((t=>e.updateView(t)),e),this.model=t,this.isConnected&&this.updateView(void 0)}connectedCallback(){super.connectedCallback(),this.model&&this.updateView(void 0)}}class f extends s{constructor(){super(),this._stringValue=""}set stringValue(t){this._stringValue!==t&&(this._stringValue=t,this.modified.trigger())}get stringValue(){return this._stringValue}isValidStringValue(t){return!1}}function y(t,...e){let i=t[0];return e.forEach(((e,s)=>{i=i.concat(e).concat(t[s+1])})),i}function C(t,e){const i=document.createElement(t);for(let t=0;t<e.length;++t){let s=e[t];s instanceof Array&&(e.splice(t,1,...s),s=e[t]),"string"!=typeof s?i.appendChild(s):i.appendChild(document.createTextNode(s))}return i}function k(t){return document.createTextNode(t)}const E=(...t)=>C("div",t),H=(...t)=>C("span",t),A=(...t)=>C("input",t),R=(...t)=>C("button",t),N=(...t)=>C("ul",t),_=(...t)=>C("li",t),T="http://www.w3.org/2000/svg";function S(t){const e=document.createElementNS(T,"svg");return void 0!==t&&e.appendChild(t),e}function D(t){const e=document.createElementNS(T,"path");return void 0!==t&&e.setAttributeNS(null,"d",t),e}function L(t,e,i,s,o,n){const r=document.createElementNS(T,"line");return r.setAttributeNS(null,"x1",`${t}`),r.setAttributeNS(null,"y1",`${e}`),r.setAttributeNS(null,"x2",`${i}`),r.setAttributeNS(null,"y2",`${s}`),void 0!==o&&r.setAttributeNS(null,"stroke",o),void 0!==n&&r.setAttributeNS(null,"fill",n),r}var M;!function(t){t[t.WAIT=0]="WAIT",t[t.DOWN=1]="DOWN",t[t.UP_N_HOLD=2]="UP_N_HOLD",t[t.DOWN_N_HOLD=3]="DOWN_N_HOLD",t[t.DOWN_N_OUTSIDE=4]="DOWN_N_OUTSIDE",t[t.DOWN_N_INSIDE_AGAIN=5]="DOWN_N_INSIDE_AGAIN"}(M||(M={}));class I extends v{constructor(t){super(t),this.vertical=!0,this.closeOnClose=!1,this.state=M.WAIT}}class B extends I{constructor(t,e){super(),this.vertical=!0,this.root=t,this.parentButton=e,this.popup=document.createElement("div"),this.popup.classList.add("menu-popup");let i=t.down;for(;i;)i.isAvailable()?i.createWindowAt(this,this.popup):i.deleteWindow(),i=i.next;this.appendChild(this.popup),this.show()}show(){this.parentButton.master.vertical?function(t,e){let i=t.getBoundingClientRect();e.style.opacity="0",e.style.left=i.left+i.width+"px",e.style.top=i.top+"px",setTimeout((function(){let t=e.getBoundingClientRect();i.top+t.height>window.innerHeight&&(e.style.top=i.top+i.height-t.height+"px"),i.left+i.width+t.width>window.innerWidth&&(e.style.left=i.left-t.width+"px"),e.style.opacity="1"}),0)}(this.parentButton,this.popup):z(this.parentButton,this.popup),this.style.display=""}hide(){this.style.display="none"}}function z(t,e){let i=t.getBoundingClientRect();e.style.opacity="0",e.style.left=i.left+"px",e.style.top=i.top+i.height+"px",setTimeout((function(){let t=e.getBoundingClientRect();i.top+i.height+t.height>window.innerHeight&&(e.style.top=i.top-t.height+"px"),i.left+t.width>window.innerWidth&&(e.style.left=i.left+i.width-t.width+"px"),e.style.opacity="1"}),0)}v.define("tx-popupmenu",B);const O=document.createElement("style");O.textContent=y`
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
`;const V=document.createElement("style");V.textContent=y`
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
}`;class $ extends w{constructor(){super(),this.input=A(),this.input.type="text",this.asPopupMenu();let t,e=this;this.input.oninput=()=>{e.updateModel()},this.input.onblur=t=>{void 0===this.hover&&this.close()};const i=R(t=S(D("M3 9.95a.875.875 0 01-.615-1.498L5.88 5 2.385 1.547A.875.875 0 013.615.302L7.74 4.377a.876.876 0 010 1.246L3.615 9.698A.872.872 0 013 9.95z")));this.button=i,i.tabIndex=-1,i.style.outline="none",t.style.width="100%",t.style.height="100%",i.onpointerdown=t=>{this.popup?this.close():(t.preventDefault(),this.input.focus(),this.open(),i.setPointerCapture(t.pointerId))},i.onpointermove=t=>{if(void 0===this.popup)return;const e=this.shadowRoot.elementFromPoint(t.clientX,t.clientY);let i;i=e instanceof HTMLLIElement?e:void 0,this.hover!==i&&(this.hover&&this.hover.classList.remove("tx-hover"),this.hover=i,this.hover&&this.hover.classList.add("tx-hover"))},i.onpointerup=t=>{if(this.hover){const t=parseInt(this.hover.dataset.idx);return this.close(),void this.select(t)}const e=this.shadowRoot.elementFromPoint(t.clientX,t.clientY);i.contains(e)?this.input.focus():this.close()},this.keydown=this.keydown.bind(this),this.input.onkeydown=this.keydown,this.wheel=this.wheel.bind(this),this.input.onwheel=this.button.onwheel=this.wheel,this.classList.add("tx-combobox"),this.attachShadow({mode:"open"}),this.attachStyle(O),this.attachStyle(V),this.shadowRoot.appendChild(this.input),this.shadowRoot.appendChild(i)}connectedCallback(){if(this.controller)return;super.connectedCallback();const t=this.getAttribute("text");null!==t&&(c.registerView(`M:${t}`,this),this.asComboBox(),this.updateModel())}setModel(t){if(!t)return this.text&&(this.text.modified.remove(this),this.text=void 0),void super.setModel(t);t instanceof f&&super.setModel(t),t instanceof l&&(this.text=t,this.text.modified.add((()=>{this.input.value=this.text.value}),this))}keydown(t){switch(this.input.readOnly&&t.preventDefault(),t.key){case"ArrowUp":this.previousItem();break;case"ArrowDown":this.nextItem()}}wheel(t){t.preventDefault(),this.input.focus(),t.deltaY>0&&this.nextItem(),t.deltaY<0&&this.previousItem()}asPopupMenu(){this.input.readOnly=!0;for(let t of["user-select","-webkit-user-select","-webkit-touch-callout","-khtml-user-select"])this.input.style.setProperty(t,"none")}asComboBox(){this.input.readOnly=!1;for(let t of["user-select","-webkit-user-select","-webkit-touch-callout","-khtml-user-select"])this.input.style.removeProperty(t)}updateModel(){this.text&&(this.text.value=this.input.value)}updateView(){this.model&&this.model.enabled?this.input.removeAttribute("disabled"):this.input.setAttribute("disabled",""),void 0!==this.model&&(this.input.value=this.displayName(this.model.stringValue),this.updateModel())}displayName(t){for(let e=0;e<this.children.length;++e){const i=this.children[e];if("OPTION"===i.nodeName){const e=i;if(e.value===t)return e.text}}let e="";for(let t=0;t<this.children.length;++t){const i=this.children[t];if("OPTION"===i.nodeName){e=`${e} '${i.value}'`}}return 0===e.length&&(e=" empty option list"),console.log(`'${t}' is not in${e} of <tx-select model="${this.getAttribute("model")}">`),console.trace(this),""}open(){let t,e=this;this.popup=E(t=N(...function(t,e){let i=[];for(let s=0;s<t;++s){const t=e(s);t instanceof Array?i.push(...t):i.push(t)}return i}(this.children.length,(t=>{const i=_(k(this.children.item(t).innerText));return i.tabIndex=0,i.ariaRoleDescription="option",i.dataset.idx=`${t}`,i.onpointerdown=t=>{this.button.setPointerCapture(t.pointerId),this.hover=i,t.preventDefault()},i.onclick=()=>{e.select(t)},this.children[t],i})))),this.popup.classList.add("tx-popover"),this.popup.style.position="fixed",this.popup.style.zIndex="99",t.ariaRoleDescription="listbox",t.classList.add("tx-menu"),this.shadowRoot.appendChild(this.popup),z(this,this.popup)}close(){this.hover=void 0,void 0!==this.popup&&(this.shadowRoot.removeChild(this.popup),this.popup=void 0)}select(t){if(void 0===this.model)return void console.log(`<tx-select model='${this.getAttribute("model")}'> has no model`);this.close();const e=this.children[t];e instanceof HTMLOptionElement?this.model.stringValue=e.value:console.log(`<tx-select>: unpexected element <${e.nodeName.toLowerCase()}> instead of <option>`)}getIndex(){const t=this.model?.stringValue;for(let e=0;e<this.children.length;++e)if(this.children[e].value===t)return e}nextItem(){let t=this.getIndex();void 0===t?t=0:++t,t>=this.children.length||this.select(t)}previousItem(){let t=this.getIndex();void 0===t?t=this.children.length-1:--t,t<0||this.select(t)}}$.define("tx-select",$);const W=document.createElement("style");W.textContent=y`
.tx-text {
    /* display: inline-block; */
    box-shadow: none;
    box-sizing: border-box;
    color: var(--tx-edit-fg-color);
    background-color: var(--tx-edit-bg-color);

    /* we'll use the border instead of an outline to indicate the focus */
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
`;class P extends w{constructor(t){super(t),this.input=document.createElement("input"),this.input.classList.add("tx-text"),this.input.oninput=()=>{this.updateModel()},this.attachShadow({mode:"open"}),this.attachStyle(W),this.shadowRoot.appendChild(this.input)}focus(){this.input.focus()}blur(){this.input.blur()}static get observedAttributes(){return["value"]}attributeChangedCallback(t,e,i){if("value"===t)this.model&&void 0!==i&&(this.model.value=i)}updateModel(){this.model&&(this.model.value=this.input.value),this.setAttribute("value",this.input.value)}updateView(){if(!this.model)return;const t=`${this.model.value}`;this.input.value!==t&&(this.input.value=t,this.setAttribute("value",this.input.value))}get value(){return this.input.value}set value(t){this.input.value=t,this.updateModel()}}function j(t){return function(t){let e=document.querySelector('template[id="'+t+'"]');if(!e)throw new Error("failed to find template '"+t+"'");let i=e.content;return document.importNode(i,!0)}(t)}function F(t,e){let i=t.getAttribute(e);if(null===i)throw console.log("missing attribute '"+e+"' in ",t),Error("missing attribute '"+e+"' in "+t.nodeName);return i}function G(t,e){let i=t.getAttribute(e);return null===i?void 0:i}P.define("tx-text",P);const U=document.createElement("style");U.textContent=`\n  :host(.menu-button) {\n    font-family: var(--tx-font-family);\n    font-size: var(--tx-edit-font-size);\n    font-weight: var(--tx-edit-font-weight);\n    padding: 7px;\n    vertical-align: center;\n  \n    background: var(--tx-gray-200);\n    color: var(--tx-gray-900);\n    cursor: default;\n  }\n  :host(.menu-button:hover) {\n    background: var(--tx-gray-300);\n  }\n  :host(.menu-button.active) {\n    background: var(--tx-gray-400);\n    color: var(--tx-gray-900);\n  }\n  :host(.menu-button.disabled) {\n    color: var(--tx-gray-500);\n  }\n  :host(.menu-button.active.disabled) {\n    color: var(--tx-gray-700);\n  }\n  :host(.menu-button.menu-down) {\n    padding-right: 20px;\n    background-image: url("data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" width="15" height="14"><path d="M 0 4 l 10 0 l -5 5 Z" fill="#fff" stroke="none"/></svg>')}");\n    background-repeat: no-repeat;\n    background-position: right center;\n  }\n  :host(.menu-button.active.menu-down) {\n    background-image: url("data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" width="15" height="14"><path d="M 0 4 l 10 0 l -5 5 Z" fill="#fff" stroke="none"/></svg>')}");\n    background-repeat: no-repeat;\n    background-position: right center;\n  }\n  :host(.menu-button.menu-side) {\n    padding-right: 20px;\n    background-image: url("data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" width="15" height="14"><path d="M 0 2 l 0 10 l 5 -5 Z" fill="#fff" stroke="none"/></svg>')}");\n    background-repeat: no-repeat;\n    background-position: right center;\n  }\n  :host(.menu-button.active.menu-side) {\n    background-image: url("data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" width="15" height="14"><path d="M 0 2 l 0 10 l 5 -5 Z" fill="#fff" stroke="none"/></svg>')}");\n    background-repeat: no-repeat;\n    background-position: right center;\n  }\n  .menu-bar {\n    display: flex;\n    flex-direction: row;\n    justify-content: flex-start;\n    align-items: center;\n    background-color: var(--tx-gray-200);\n  }\n  .menu-popup {\n    position: fixed;\n    display: flex;\n    flex-direction: column;\n    box-shadow: 2px 2px 5px var(--tx-gray-50);\n  }\n`;class Y extends w{constructor(t,e){super(),this.master=t,this.node=e;let i=this;if(this.classList.add("menu-button"),e.down&&(t.vertical?this.classList.add("menu-side"):this.classList.add("menu-down")),this.updateView(),this.onmousedown=t=>{t.stopPropagation();let e=function(t){document.removeEventListener("mouseup",e,{capture:!0}),t.preventDefault(),setTimeout((()=>{Y.buttonDown&&i.dispatchEvent(new MouseEvent("mouseup",t))}),0)};if(document.addEventListener("mouseup",e,{capture:!0}),Y.buttonDown=!0,!this.master)throw Error("yikes");switch(this.master.state){case M.WAIT:this.master.state=M.DOWN,this.activate();break;case M.UP_N_HOLD:this.master.active!==this?(this.master.state=M.DOWN,this.activate()):this.master.state=M.DOWN_N_HOLD;break;default:throw Error("unexpected state "+this.master.state)}return!1},this.onmouseup=t=>{if(t.stopPropagation(),Y.buttonDown){if(Y.buttonDown=!1,!this.master)throw Error("yikes");if(!this.node)throw Error("yikes");switch(this.master.state){case M.DOWN:this.node.isEnabled()&&!this.node.down?(this.trigger(),this.master.state=M.WAIT):(this.master.state=M.UP_N_HOLD,Y.documentMouseDown&&document.removeEventListener("mousedown",Y.documentMouseDown,{capture:!1}),Y.documentMouseDown=function(t){Y.documentMouseDown&&document.removeEventListener("mousedown",Y.documentMouseDown,{capture:!1}),Y.documentMouseDown=void 0,"TOAD-MENUBUTTON"!==t.target.tagName&&i.collapse()},document.addEventListener("mousedown",Y.documentMouseDown,{capture:!1}));break;case M.DOWN_N_HOLD:case M.DOWN_N_OUTSIDE:this.master.state=M.WAIT,this.deactivate(),this.collapse(),this.master.closeOnClose;break;case M.DOWN_N_INSIDE_AGAIN:this.trigger();break;default:throw Error("unexpected state "+this.master.state)}return!1}},this.onmouseout=t=>{if(t.stopPropagation(),!this.master)throw Error("yikes");switch(Y.inside=void 0,this.master.state){case M.WAIT:case M.DOWN_N_OUTSIDE:case M.UP_N_HOLD:case M.DOWN_N_HOLD:break;case M.DOWN:case M.DOWN_N_INSIDE_AGAIN:this.master.state=M.DOWN_N_OUTSIDE,this.updateView();break;default:throw Error("unexpected state")}return!1},this.onmouseover=t=>{if(t.stopPropagation(),!i.master)throw Error("yikes");switch(Y.inside=i,i.master.state){case M.WAIT:case M.UP_N_HOLD:case M.DOWN_N_OUTSIDE:case M.DOWN_N_HOLD:case M.DOWN:case M.DOWN_N_INSIDE_AGAIN:if(!Y.buttonDown)break;if(!this.master)throw Error("yikes");this.master.active&&this.master.active.deactivate(),this.master.state=M.DOWN_N_INSIDE_AGAIN,this.activate();break;default:throw Error("unexpected state "+i.master.state)}return!1},this.attachShadow({mode:"open"}),!this.shadowRoot)throw Error("yikes");this.shadowRoot.appendChild(document.importNode(U,!0)),this.node.modelId||this.shadowRoot.appendChild(document.createTextNode(e.label))}connectedCallback(){if(!this.controller){if(void 0===this.node.down){let t=this.node.title;for(let e=this.node.parent;e&&e.title.length;e=e.parent)t=e.title+"|"+t;t="A:"+t,c.registerView(t,this)}if(void 0!==this.node.modelId)if("string"==typeof this.node.modelId){let t="M:"+this.node.modelId;c.registerView(t,this)}else this.setModel(this.node.modelId)}}disconnectedCallback(){this.controller&&this.controller.unregisterView(this)}setModel(t){if(!t)return this.action&&this.action.modified.remove(this),this.model=void 0,this.action=void 0,void this.updateView();if(t instanceof d)this.action=t,this.action.modified.add((()=>{this.updateView()}),this);else{if(!(t instanceof l))throw Error("unexpected model of type "+t.constructor.name);this.model=t}this.updateView()}updateView(){if(this.model&&this.model.value){if(!this.shadowRoot)throw Error("yikes");let t=document.createElement("span");this.model instanceof a?t.innerHTML=this.model.value:t.innerText=this.model.value,this.shadowRoot.children.length>1&&this.shadowRoot.removeChild(this.shadowRoot.children[1]),this.shadowRoot.children.length>1?this.shadowRoot.insertBefore(t,this.shadowRoot.children[1]):this.shadowRoot.appendChild(t)}if(!this.master)throw Error("yikes");let t=!1;if(this.master.active==this)switch(this.master.state){case M.DOWN:case M.UP_N_HOLD:case M.DOWN_N_HOLD:case M.DOWN_N_INSIDE_AGAIN:t=!0;break;case M.DOWN_N_OUTSIDE:if(!this.node)throw Error("yikes");t=void 0!==this.node.down&&this.node.isEnabled()}this.classList.toggle("active",t),this.classList.toggle("disabled",!this.isEnabled())}isEnabled(){return void 0!==this.node.down||void 0!==this.action&&this.action.enabled}trigger(){this.collapse(),this.action&&this.action.trigger()}collapse(){if(!this.master)throw Error("yikes");this.master.parentButton?this.master.parentButton.collapse():this.deactivate()}openPopup(){if(this.node&&this.node.down){if(!this.shadowRoot)throw Error("yikes");this.popup?this.popup.show():(this.popup=new B(this.node,this),this.shadowRoot.appendChild(this.popup))}}closePopup(){this.popup&&(this.popup.active&&this.popup.active.deactivate(),this.popup.hide())}activate(){if(!this.master)throw Error("yikes");if(!this.node)throw Error("yikes");let t=this.master.active;this.master.active=this,t&&t!==this&&(t.closePopup(),t.updateView()),this.updateView(),this.openPopup()}deactivate(){if(!this.master)throw Error("yikes");this.master.active===this&&(this.master.active.closePopup(),this.master.active=void 0,this.master.state=M.WAIT,this.updateView())}}Y.define("tx-menubutton",Y);class q{constructor(t,e,i,s,o){this.title=t,this.label=e,this.shortcut=i,this.type=s||"entry",this.modelId=o}isEnabled(){return!0}isAvailable(){return!0}createWindowAt(t,e){if("spacer"==this.type){let t=document.createElement("span");return t.style.flexGrow="1",void e.appendChild(t)}this.view=new Y(t,this),e.appendChild(this.view)}deleteWindow(){}}class X extends I{constructor(t){super(t),this.config=t?.config,this.vertical=!1,this.root=new q("","",void 0,void 0)}connectedCallback(){if(super.connectedCallback(),this.tabIndex=0,this.config)return this.config2nodes(this.config,this.root),this.referenceActions(),void this.createShadowDOM();0===this.children.length?(this._observer=new MutationObserver(((t,e)=>{void 0!==this._timer&&clearTimeout(this._timer),this._timer=window.setTimeout((()=>{this._timer=void 0,this.layout2nodes(this.children,this.root),this.referenceActions(),this.createShadowDOM()}),100)})),this._observer.observe(this,{childList:!0,subtree:!0})):(this.layout2nodes(this.children,this.root),this.referenceActions(),this.createShadowDOM())}layout2nodes(t,e){let i=e.down;for(let s of t){let t;switch(s.nodeName){case"TX-MENUSPACER":t=new q("","","","spacer");break;case"TX-MENUENTRY":t=new q(F(s,"name"),F(s,"label"),G(s,"shortcut"),G(s,"type"),G(s,"model"))}if(t&&(t.parent=e,i?i.next=t:e.down=t,i=t),!i)throw Error("yikes");this.layout2nodes(s.children,i)}}config2nodes(t,e){let i=e.down;for(let s of t){let t;if(t=!0===s.space?new q("","","","spacer"):new q(s.name,s.label,s.shortcut,s.type,s.model),t&&(t.parent=e,i?i.next=t:e.down=t,i=t),!i)throw Error("yikes");s.sub&&this.config2nodes(s.sub,i)}}referenceActions(){}findNode(t,e){let i=t.indexOf("|"),s=-1==i?t:t.substr(0,i),o=-1==i?"":t.substr(i+1);e||(e=this.root);for(let t=e.down;t;t=t.next)if(t.title==s)return t.down?this.findNode(o,t):t}createShadowDOM(){this.view=document.createElement("div"),this.view.classList.add("menu-bar");let t=this.root.down;for(;t;)t.isAvailable()?t.createWindowAt(this,this.view):t.deleteWindow(),t=t.next;this.attachShadow({mode:"open"}),this.shadowRoot.appendChild(document.importNode(U,!0)),this.shadowRoot.appendChild(this.view)}}X.define("tx-menu",X);let K=document.createElement("style");K.textContent="\n\n/* try to follow material ui: when active render button labels in black, otherwise in gray */\nsvg .fill {\n  fill: var(--tx-gray-700);\n  stroke: var(--tx-gray-700);\n}\nsvg .stroke {\n  fill: none;\n  stroke: var(--tx-gray-700);\n}\nsvg .strokeFill {\n  fill: var(--tx-gray-200);\n  stroke: var(--tx-gray-700);\n}\n\n/*\nthese don't seem to be in use anymore\n.toolbar.active svg .fill {\n  fill: #000;\n  stroke: #000;\n}\n.toolbar.active svg .stroke {\n  fill: none;\n  stroke: #000;\n}\n.toolbar.active svg .strokeFill {\n  fill: #fff;\n  stroke: #000;\n}\n*/\n\n.toolbar button {\n    background: var(--tx-gray-75);\n    color: var(--tx-gray-800);\n    border: 1px var(--tx-gray-400);\n    border-style: solid solid solid none;\n    padding: 5;\n    margin: 0;\n    vertical-align: middle;\n    height: 22px;\n}\n\n.toolbar button:active:hover {\n    background: linear-gradient(to bottom, var(--tx-gray-600) 0%,var(--tx-gray-50) 100%,var(--tx-gray-500) 100%);\n}\n\n.toolbar button.left {\n    border-style: solid;\n    border-radius: 3px 0 0 3px;\n}\n\n.toolbar button.right {\n    border: 1px var(--tx-gray-400);\n    border-style: solid solid solid none;\n    border-radius: 0 3px 3px 0;\n}\n\n.toolbar button.active {\n    background: linear-gradient(to bottom, var(--tx-gray-600) 0%,var(--tx-gray-50) 100%,var(--tx-gray-500) 100%);\n    border: 1px var(--tx-global-blue-500) solid;\n    color: var(--tx-gray-900);\n}\n\ndiv.textarea {\n  font-family: var(--tx-font-family);\n  font-size: var(--tx-font-size);\n  border: 1px var(--tx-gray-400) solid;\n  border-radius: 3px;\n  margin: 2px;\n  padding: 4px 5px;\n  outline-offset: -2px;\n}\n\ndiv.textarea h1 {\n  font-size: 22px;\n  margin: 0;\n  padding: 4px 0 4px 0;\n}\n\ndiv.textarea h2 {\n  font-size: 18px;\n  margin: 0;\n  padding: 4px 0 4px 0;\n}\n\ndiv.textarea h3 {\n  font-size: 16px;\n  margin: 0;\n  padding: 4px 0 4px 0;\n}\n\ndiv.textarea h4 {\n  font-size: 14px;\n  margin: 0;\n  padding: 4px 0 4px 0;\n}\n\ndiv.textarea div {\n  padding: 2px 0 2px 0;\n}\n";class J extends w{constructor(){super(),J.texttool=this;let t=x("div",{class:"toolbar"});this.buttonH1=x("button",{class:"left",children:"H1"}),this.buttonH1.onclick=()=>{document.execCommand("formatBlock",!1,"<h1>"),this.update()},t.appendChild(this.buttonH1),this.buttonH2=x("button",{children:"H2"}),this.buttonH2.onclick=()=>{document.execCommand("formatBlock",!1,"<h2>"),this.update()},t.appendChild(this.buttonH2),this.buttonH3=x("button",{children:"H3"}),this.buttonH3.onclick=()=>{document.execCommand("formatBlock",!1,"<h3>"),this.update()},t.appendChild(this.buttonH3),this.buttonH4=x("button",{class:"right",children:"H4"}),this.buttonH4.onclick=()=>{document.execCommand("formatBlock",!1,"<h4>"),this.update()},t.appendChild(this.buttonH4),t.appendChild(document.createTextNode(" ")),this.buttonBold=x("button",{class:"left",children:x("b",{children:"B"})}),this.buttonBold.onclick=()=>{document.execCommand("bold",!1),this.update()},t.appendChild(this.buttonBold),this.buttonItalic=x("button",{children:x("i",{children:"I"})}),this.buttonItalic.onclick=()=>{document.execCommand("italic",!1),this.update()},t.appendChild(this.buttonItalic),this.buttonUnderline=x("button",{children:x("u",{children:"U"})}),this.buttonUnderline.onclick=()=>{document.execCommand("underline",!1),this.update()},t.appendChild(this.buttonUnderline),this.buttonStrikeThrough=x("button",{children:x("strike",{children:"S"})}),this.buttonStrikeThrough.onclick=()=>{document.execCommand("strikeThrough",!1),this.update()},t.appendChild(this.buttonStrikeThrough),this.buttonSubscript=x("button",{children:"x₂"}),this.buttonSubscript.onclick=()=>{document.execCommand("subscript",!1),this.update()},t.appendChild(this.buttonSubscript),this.buttonSuperscript=x("button",{class:"right",children:"x²"}),this.buttonSuperscript.onclick=()=>{document.execCommand("superscript",!1),this.update()},t.appendChild(this.buttonSuperscript),t.appendChild(document.createTextNode(" ")),this.buttonJustifyLeft=x("button",{class:"left",children:g("svg",{viewBox:"0 0 10 9",width:"10",height:"9",children:[x("line",{x1:"0",y1:"0.5",x2:"10",y2:"0.5",class:"stroke"}),x("line",{x1:"0",y1:"2.5",x2:"6",y2:"2.5",class:"stroke"}),x("line",{x1:"0",y1:"4.5",x2:"10",y2:"4.5",class:"stroke"}),x("line",{x1:"0",y1:"6.5",x2:"6",y2:"6.5",class:"stroke"}),x("line",{x1:"0",y1:"8.5",x2:"10",y2:"8.5",class:"stroke"})]})}),this.buttonJustifyLeft.onclick=()=>{document.execCommand("justifyLeft",!1),this.update()},t.appendChild(this.buttonJustifyLeft),this.buttonJustifyCenter=x("button",{children:g("svg",{viewBox:"0 0 10 9",width:"10",height:"9",children:[x("line",{x1:"0",y1:"0.5",x2:"10",y2:"0.5",class:"stroke"}),x("line",{x1:"2",y1:"2.5",x2:"8",y2:"2.5",class:"stroke"}),x("line",{x1:"0",y1:"4.5",x2:"10",y2:"4.5",class:"stroke"}),x("line",{x1:"2",y1:"6.5",x2:"8",y2:"6.5",class:"stroke"}),x("line",{x1:"0",y1:"8.5",x2:"10",y2:"8.5",class:"stroke"})]})}),this.buttonJustifyCenter.onclick=()=>{document.execCommand("justifyCenter",!1),this.update()},t.appendChild(this.buttonJustifyCenter),this.buttonJustifyRight=x("button",{class:"right",children:g("svg",{viewBox:"0 0 10 9",width:"10",height:"9",children:[x("line",{x1:"0",y1:"0.5",x2:"10",y2:"0.5",class:"stroke"}),x("line",{x1:"4",y1:"2.5",x2:"10",y2:"2.5",class:"stroke"}),x("line",{x1:"0",y1:"4.5",x2:"10",y2:"4.5",class:"stroke"}),x("line",{x1:"4",y1:"6.5",x2:"10",y2:"6.5",class:"stroke"}),x("line",{x1:"0",y1:"8.5",x2:"10",y2:"8.5",class:"stroke"})]})}),this.buttonJustifyRight.onclick=()=>{document.execCommand("justifyRight",!1),this.update()},t.appendChild(this.buttonJustifyRight),this.attachShadow({mode:"open"}),this.shadowRoot.appendChild(document.importNode(K,!0)),this.shadowRoot.appendChild(t)}update(){this.buttonH1.classList.toggle("active","h1"===document.queryCommandValue("formatBlock")),this.buttonH2.classList.toggle("active","h2"===document.queryCommandValue("formatBlock")),this.buttonH3.classList.toggle("active","h3"===document.queryCommandValue("formatBlock")),this.buttonH4.classList.toggle("active","h4"===document.queryCommandValue("formatBlock")),this.buttonBold.classList.toggle("active",document.queryCommandState("bold")),this.buttonItalic.classList.toggle("active",document.queryCommandState("italic")),this.buttonUnderline.classList.toggle("active",document.queryCommandState("underline")),this.buttonStrikeThrough.classList.toggle("active",document.queryCommandState("strikeThrough")),this.buttonSubscript.classList.toggle("active",document.queryCommandState("subscript")),this.buttonSuperscript.classList.toggle("active",document.queryCommandState("superscript")),this.buttonJustifyLeft.classList.toggle("active",document.queryCommandState("justifyLeft")),this.buttonJustifyCenter.classList.toggle("active",document.queryCommandState("justifyCenter")),this.buttonJustifyRight.classList.toggle("active",document.queryCommandState("justifyRight"))}}J.define("tx-texttool",J);class Z extends w{constructor(){super();let t=document.createElement("div");this.content=t,t.classList.add("tx-text"),t.contentEditable="true",t.oninput=e=>{if(this.model instanceof a){let i=e.target.firstChild;i&&3===i.nodeType?document.execCommand("formatBlock",!1,"<div>"):"<br>"===t.innerHTML&&(t.innerHTML="")}this.updateModel()},t.onkeydown=t=>{this.model instanceof a&&(!0===t.metaKey&&"b"===t.key?(t.preventDefault(),document.execCommand("bold",!1),this.updateTextTool()):!0===t.metaKey&&"i"===t.key?(t.preventDefault(),document.execCommand("italic",!1),this.updateTextTool()):!0===t.metaKey&&"u"===t.key?(t.preventDefault(),document.execCommand("underline",!1),this.updateTextTool()):"Tab"===t.key?t.preventDefault():"Enter"===t.key&&!0!==t.shiftKey&&"blockquote"===document.queryCommandValue("formatBlock")&&document.execCommand("formatBlock",!1,"<p>"))},t.onkeyup=()=>{this.updateTextTool()},t.onmouseup=()=>{this.updateTextTool()},this.attachShadow({mode:"open"}),this.attachStyle(W),this.shadowRoot.appendChild(t)}updateTextTool(){void 0!==J.texttool&&J.texttool.update()}updateModel(){this.model&&(this.model.promise=()=>this.model instanceof a?this.content.innerHTML:this.content.innerText)}updateView(){this.model&&(this.model instanceof a?this.content.innerHTML!==this.model.value&&(this.content.innerHTML=this.model.value):this.content.innerText!==this.model.value&&(this.content.innerText=this.model.value))}}Z.define("tx-textarea",Z);class Q extends v{static focusIn(t){const e=new Map;for(let i=t.parentElement,s=0;null!==i;i=i.parentElement,++s)e.set(i,s);let i,s,o=Number.MAX_SAFE_INTEGER,n=new Array;for(const s of this.allTools.values())if(s.canHandle(t))for(let t=s.parentElement,r=0;null!==t;t=t.parentElement,++r){const r=e.get(t);void 0!==r&&(o<r||(o>r&&(n.length=0),o=r,i=t,n.push(s)))}if(!i)return;const r=Q.getIndex(t,i);let l=Number.MIN_SAFE_INTEGER;for(let t of n){const e=Q.getIndex(t,i);e<r&&e>l&&(l=e,s=t)}this.setActive(s,t)}static getIndex(t,e){void 0===e&&console.trace(`GenericTool.getIndex(${t}, ${e})`);let i=t;for(;i.parentElement!==e;)i=i.parentElement;return Array.from(e.childNodes).indexOf(i)}static setActive(t,e){this.activeTool&&this.activeTool.deactivate(),this.activeTool=t,this.activeView=e,t&&t.activate()}static focusOut(t){this.activeView===t&&this.setActive(void 0,void 0)}connectedCallback(){super.connectedCallback(),Q.allTools.add(this)}disconnectedCallback(){Q.activeTool===this&&Q.setActive(void 0,void 0),Q.allTools.delete(this),super.disconnectedCallback()}}Q.allTools=new Set,window.addEventListener("focusin",(t=>{t.target instanceof Q||(t.relatedTarget instanceof v&&Q.focusOut(t.relatedTarget),t.target instanceof v&&Q.focusIn(t.target))}));class tt extends s{isEmpty(){return 0===this.colCount&&0===this.rowCount}}var et,it,st;!function(t){t[t.EDIT_CELL=0]="EDIT_CELL",t[t.SELECT_CELL=1]="SELECT_CELL",t[t.SELECT_ROW=2]="SELECT_ROW"}(et||(et={}));class ot{constructor(t,e){this.col=t,this.row=e}toString(){return`TablePos { col:${this.col}, row:${this.row}}`}}class nt extends s{constructor(t=et.EDIT_CELL){super(),this.mode=t,this._value=new ot(0,0)}set col(t){this._value.col!==t&&(this._value.col=t,this.modified.trigger())}get col(){return this._value.col}set row(t){this._value.row!==t&&(this._value.row=t,this.modified.trigger())}get row(){return this._value.row}set value(t){this._value.col===t.col&&this._value.row===t.row||(this._value=t,this.modified.trigger())}get value(){return this._value}toString(){return`SelectionModel {enabled: ${this._enabled}, mode: ${et[this.mode]}, value: ${this._value}}`}}class rt extends tt{constructor(t,e){super(),this.nodeClass=t}}!function(t){t[t.EDIT_ON_FOCUS=0]="EDIT_ON_FOCUS",t[t.EDIT_ON_ENTER=1]="EDIT_ON_ENTER"}(it||(it={}));class lt{constructor(t){this.model=t}get editMode(){return it.EDIT_ON_FOCUS}get isSeamless(){return!1}get colCount(){return void 0===this.model?0:this.model.colCount}get rowCount(){return void 0===this.model?0:this.model.rowCount}setModel(t){this.model=t}getColumnHead(t){}getRowHead(t){}showCell(t,e){}editCell(t,e){}saveCell(t,e){}isViewCompact(){return!1}static register(t,e,i){let s=lt.modelToAdapter.get(e);if(void 0===s&&(s=new Map,lt.modelToAdapter.set(e,s)),void 0!==i){if(s.has(i))throw Error("attempt to redefine existing table adapter");s.set(i,t)}else{if(s.has(null))throw Error("attempt to redefine existing table adapter");s.set(null,t)}}static unbind(){lt.modelToAdapter.clear()}static lookup(t){let e;e=t instanceof rt?t.nodeClass:null;let i=lt.modelToAdapter.get(Object.getPrototypeOf(t).constructor)?.get(e);if(void 0===i)for(let s of lt.modelToAdapter.keys())if(t instanceof s){i=lt.modelToAdapter.get(s)?.get(e);break}if(void 0===i){let i=`TableAdapter.lookup(): Did not find an adapter for model of type ${t.constructor.name}`;if(i+=`\n    Requested adapter: model=${t.constructor.name}, type=${e?.name}\n    Available adapters:`,0===lt.modelToAdapter.size)i+=" none.";else for(const[t,e]of lt.modelToAdapter)for(const[s,o]of e)i+=`\n        model=${t.name}`,null!=s&&(i+=`, type=${s.name}`);throw Error(i)}return i}}lt.modelToAdapter=new Map,function(t){t[t.INSERT_ROW=0]="INSERT_ROW",t[t.REMOVE_ROW=1]="REMOVE_ROW",t[t.INSERT_COL=2]="INSERT_COL",t[t.REMOVE_COL=3]="REMOVE_COL",t[t.CELL_CHANGED=4]="CELL_CHANGED",t[t.RESIZE_ROW=5]="RESIZE_ROW",t[t.RESIZE_COL=6]="RESIZE_COL",t[t.CHANGED=7]="CHANGED"}(st||(st={}));class at extends class{constructor(t){this.table=t}get adapter(){return this.table.adapter}get measure(){return this.table.measure}get body(){return this.table.body}get splitBody(){return this.table.splitBody}get colHeads(){return this.table.colHeads}get rowHeads(){return this.table.rowHeads}get colResizeHandles(){return this.table.colResizeHandles}get rowResizeHandles(){return this.table.rowResizeHandles}set animationDone(t){this.table.animationDone=t}get selection(){return this.table.selection}clearAnimation(){this.table.animation=void 0}}{constructor(t){super(t)}}class dt extends at{constructor(t,e){super(t),this.done=!1,this.event=e,this.joinHorizontal=this.joinHorizontal.bind(this),this.colCount=this.adapter.colCount,this.rowCount=this.adapter.rowCount}run(){this.prepareCells(),setTimeout((()=>{this.arrangeMeasuredRowsInGrid(),this.splitHorizontal(this.event.index+this.event.size),this.splitBody.style.transitionProperty="transform",this.splitBody.style.transitionDuration=At.transitionDuration,this.splitBody.ontransitionend=this.joinHorizontal,this.splitBody.ontransitioncancel=this.joinHorizontal,setTimeout((()=>{this.splitBody.style.transform=`translateY(${this.totalHeight}px)`}),At.renderDelay)}))}stop(){this.joinHorizontal(),this.clearAnimation()}splitHorizontal(t,e=0){this.table.splitHorizontal(t,e)}joinHorizontal(){this.done||(this.done=!0,this.table.joinHorizontal(this.event.index+this.event.size,this.totalHeight,0,this.colCount,this.rowCount),this.table.animationDone&&this.table.animationDone())}prepareCells(){for(let t=this.event.index;t<this.event.index+this.event.size;++t)for(let e=0;e<this.colCount;++e){const i=H();this.adapter.showCell({col:e,row:t},i),this.measure.appendChild(i)}}arrangeMeasuredRowsInGrid(){const t=this.adapter.isSeamless?1:0;let e,i,s=this.event.index*this.colCount;if(s<this.body.children.length)e=this.body.children[s],i=kt(e.style.top);else{if(e=null,0===this.body.children.length)i=0;else{i=kt(this.body.children[this.body.children.length-1].style.top)}if(this.event.index+1>=this.rowCount){i+=kt(this.body.children[this.body.children.length-1].style.height)+2-1}}let o=0;for(let s=this.event.index;s<this.event.index+this.event.size;++s){let n=this.table.minCellHeight;for(let t=0;t<this.colCount;++t){const e=this.measure.children[t].getBoundingClientRect();n=Math.max(n,e.height)}if(n=Math.ceil(n-2),this.rowHeads){const t=H(this.adapter.getRowHead(s));t.className="head",t.style.left="0px",t.style.top=`${i}px`,t.style.width=kt(this.rowHeads.style.width)-6+"px",t.style.height=`${n}px`,this.rowHeads.insertBefore(t,this.rowHeads.children[s]);const e=this.table.createHandle(s,0,i+n-2,Et(this.rowHeads.style.width),5);this.rowResizeHandles.insertBefore(e,this.rowResizeHandles.children[s]);for(let t=s+1;t<this.rowCount;++t)this.rowHeads.children[t].replaceChildren(this.adapter.getRowHead(t)),this.rowResizeHandles.children[t].dataset.idx=`${t}`}for(let t=0;t<this.colCount;++t){const o=this.measure.children[0];let r;r=0===s&&0===this.event.index?this.body.children[2*t]:this.body.children[t],o.style.left=r.style.left,o.style.top=`${i}px`,o.style.width=r.style.width,o.style.height=`${n}px`,this.body.insertBefore(o,e)}i+=n+1-t,o+=n}this.totalHeight=o+1-t}}class ht extends at{constructor(t,e){super(t),this.done=!1,this.event=e,this.joinHorizontal=this.joinHorizontal.bind(this),this.colCount=this.adapter.colCount,this.rowCount=this.adapter.rowCount}run(){const t=this.adapter.isSeamless?1:0;let e=0,i=this.event.index*this.colCount;for(let s=this.event.index;s<this.event.index+this.event.size;++s){const s=this.body.children[i];e+=Math.ceil(Et(s.style.height)+1)-t}this.totalHeight=e;let s=this.body.querySelectorAll(".selected");for(let t of s)t.classList.remove("selected");this.splitHorizontal(this.event.index+this.event.size,this.event.size),this.splitBody.style.transitionProperty="transform",this.splitBody.style.transitionDuration=At.transitionDuration,this.splitBody.ontransitionend=this.joinHorizontal,this.splitBody.ontransitioncancel=this.joinHorizontal,setTimeout((()=>{this.splitBody.style.transform=`translateY(${-this.totalHeight}px)`}),At.renderDelay)}stop(){this.joinHorizontal(),this.clearAnimation()}splitHorizontal(t,e=0){this.table.splitHorizontal(t,e)}joinHorizontal(){if(!this.done){this.done=!0;let t=this.event.index*this.colCount;for(let e=0;e<this.event.size;++e)for(let e=0;e<this.colCount;++e)this.body.removeChild(this.body.children[t]);if(this.table.joinHorizontal(this.event.index+this.event.size,-this.totalHeight,this.event.size,this.colCount,this.rowCount),this.rowHeads){for(let t=0;t<this.event.size;++t)this.rowHeads.removeChild(this.rowHeads.children[this.event.index]),this.rowResizeHandles.removeChild(this.rowResizeHandles.children[this.event.index]);for(let t=this.event.index;t<this.rowCount;++t)this.rowHeads.children[t].replaceChildren(this.adapter.getRowHead(t)),this.rowResizeHandles.children[t].dataset.idx=`${t}`}this.table.animationDone&&this.table.animationDone()}}}class ct extends at{constructor(t,e){super(t),this.done=!1,this.event=e,this.joinVertical=this.joinVertical.bind(this),this.colCount=this.adapter.colCount,this.rowCount=this.adapter.rowCount}run(){this.prepareCells(),setTimeout((()=>{this.arrangeMeasuredColumnsInGrid(),this.splitVertical(this.event.index+this.event.size),this.splitBody.style.transitionProperty="transform",this.splitBody.style.transitionDuration=At.transitionDuration,this.splitBody.ontransitionend=this.joinVertical,this.splitBody.ontransitioncancel=this.joinVertical,setTimeout((()=>{this.splitBody.style.transform=`translateX(${this.totalWidth}px)`}),At.renderDelay)}))}stop(){this.joinVertical(),this.clearAnimation()}splitVertical(t,e=0){this.table.splitVertical(t,e)}joinVertical(){this.done||(this.done=!0,this.table.joinVertical(this.event.index+this.event.size,this.totalWidth,0,this.colCount,this.rowCount),this.table.animationDone&&this.table.animationDone())}prepareCells(){for(let t=0;t<this.rowCount;++t)for(let e=this.event.index;e<this.event.index+this.event.size;++e){const i=H();this.adapter.showCell({col:e,row:t},i),this.measure.appendChild(i)}}arrangeMeasuredColumnsInGrid(){let t,e=this.event.index;if(e<this.colCount-1){t=kt(this.body.children[e].style.left)}else if(0===this.body.children.length)t=0;else{const e=this.body.children[this.colCount-2];e.getBoundingClientRect(),t=kt(e.style.left)+kt(e.style.width)+6-1}let i=0;for(let s=this.event.index;s<this.event.index+this.event.size;++s){let o=this.table.minCellHeight;for(let t=0;t<this.rowCount;++t){const e=this.measure.children[t].getBoundingClientRect();o=Math.max(o,e.width)}if(o=Math.ceil(o-2),this.colHeads){const e=H(this.adapter.getColumnHead(s));e.className="head",e.style.left=`${t}px`,e.style.top="0px",e.style.width=o-5+"px",e.style.height=kt(this.colHeads.style.height)-2+"px",this.colHeads.insertBefore(e,this.colHeads.children[s]);const i=this.table.createHandle(s,t+o-3,0,5,Et(this.colHeads.style.height));this.colResizeHandles.insertBefore(i,this.colResizeHandles.children[s]);for(let t=s+1;t<this.colCount;++t)this.colHeads.children[t].replaceChildren(this.adapter.getColumnHead(t)),this.colResizeHandles.children[t].dataset.idx=`${t}`}for(let i=0;i<this.rowCount;++i){const s=this.measure.children[0];let n;s.style.left=`${t}px`,s.style.top=this.body.children[i*this.colCount].style.top,s.style.width=o-5+"px",s.style.height=this.body.children[i*this.colCount].style.height,n=e<this.body.children.length?this.body.children[e]:null,this.body.insertBefore(s,n),e+=this.colCount}t+=o,i+=o}this.totalWidth=i}}class ut extends at{constructor(t,e){super(t),this.done=!1,this.event=e,this.joinVertical=this.joinVertical.bind(this),this.colCount=this.adapter.colCount,this.rowCount=this.adapter.rowCount}run(){let t=0;for(let e=this.event.index;e<this.event.index+this.event.size;++e){const i=this.body.children[e];t+=Math.ceil(Et(i.style.width)+5)}this.totalWidth=t;let e=this.body.querySelectorAll(".selected");for(let t of e)t.classList.remove("selected");this.splitVertical(this.event.index+this.event.size,this.event.size),this.splitBody.style.transitionProperty="transform",this.splitBody.style.transitionDuration=At.transitionDuration,this.splitBody.ontransitionend=this.joinVertical,this.splitBody.ontransitioncancel=this.joinVertical,setTimeout((()=>{this.splitBody.style.transform=`translateX(${-this.totalWidth}px)`}),At.renderDelay)}stop(){this.joinVertical(),this.clearAnimation()}splitVertical(t,e=0){this.table.splitVertical(t,e)}joinVertical(){if(!this.done){this.done=!0;let t=this.event.index;for(let e=0;e<this.rowCount;++e){for(let e=0;e<this.event.size;++e)this.body.children[t],this.body.removeChild(this.body.children[t]);t+=this.event.index-this.event.size+1}if(this.table.joinVertical(this.event.index+this.event.size,-this.totalWidth,this.event.size,this.colCount,this.rowCount),this.colHeads){for(let t=0;t<this.event.size;++t)this.colHeads.removeChild(this.colHeads.children[this.event.index]),this.colResizeHandles.removeChild(this.colResizeHandles.children[this.event.index]);for(let t=this.event.index;t<this.colCount;++t)this.colHeads.children[t].replaceChildren(this.adapter.getColumnHead(t)),this.colResizeHandles.children[t].dataset.idx=`${t}`}this.table.animationDone&&this.table.animationDone()}}}function pt(t){if(void 0===t)return;const e=function(t){for(;t!==document.body&&!1===wt(t);){if(null===t.parentElement)return;t=t.parentElement}return t}(t);if(void 0===e)return;const i=e.getBoundingClientRect(),s=t.getBoundingClientRect();if(e!==document.body){const{x:t,y:o}=function(t,e,i){const s=16,o=i.left+t.scrollLeft-e.left-s,n=i.right+t.scrollLeft-e.left+s,r=i.top+t.scrollTop-e.top-s,l=i.bottom+t.scrollTop-e.top+s,a=t.clientWidth,d=t.clientHeight;var h=t.scrollLeft,c=t.scrollTop;n-o-2*s>a?h=o:n>t.scrollLeft+a?h=n-a:o<t.scrollLeft&&(h=o);l-r-2*s>d?c=r:l>t.scrollTop+d?c=l-d:r<t.scrollTop&&(c=r);return h=Math.max(0,h),c=Math.max(0,c),{x:h,y:c}}(e,i,s);!function(t,e,i){let s,o,n=bt.get(t);void 0===n?(n={x:e,y:i},bt.set(t,n)):(n.x=e,n.y=i);t===document.body?(s=window.scrollX||window.pageXOffset,o=window.scrollY||window.pageYOffset):(s=t.scrollLeft,o=t.scrollTop);const r=e-s,l=i-o;if(0===r&&0===l)return void bt.delete(t);a=a=>{if(n.x!==e||n.y!==i)return!1;const d=s+a*r,h=o+a*l;return t===document.body?window.scrollTo(d,h):(t.scrollLeft=d,t.scrollTop=h),1===a&&bt.delete(t),!0},setTimeout((()=>{window.requestAnimationFrame(gt.bind(window,a,void 0,void 0))}),0);var a}(e,t,o),"fixed"!==window.getComputedStyle(e).position&&window.scrollBy({left:i.left,top:i.top,behavior:"smooth"})}else window.scrollBy({left:s.left,top:s.top,behavior:"smooth"})}const bt=new Map;let xt=0;function gt(t,e,i){void 0===e&&(e=Date.now(),i=++xt);let s=(Date.now()-e)/468;s=s>1?1:s;const o=(n=s,.5*(1-Math.cos(Math.PI*n)));var n;!1!==t(o)&&o<1&&window.requestAnimationFrame(gt.bind(window,t,e,i))}var mt,vt=(mt=window.navigator.userAgent,new RegExp(["MSIE ","Trident/","Edge/"].join("|")).test(mt)?1:0);function wt(t){const e=ft(t,"Y")&&yt(t,"Y"),i=ft(t,"X")&&yt(t,"X");return e||i}function ft(t,e){return"X"===e?t.clientWidth+vt<t.scrollWidth:t.clientHeight+vt<t.scrollHeight}function yt(t,e){const i=window.getComputedStyle(t,null)["overflow"+e];return"auto"===i||"scroll"===i}const Ct=document.createElement("style");function kt(t){return parseInt(t.substring(0,t.length-2))}function Et(t){return parseFloat(t.substring(0,t.length-2))}function Ht(t){return"none"!==window.getComputedStyle(t).display&&(!t.parentElement||Ht(t.parentElement))}Ct.textContent=y`
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

    height: 200px;
    width: 200px;
}

.body, .cols, .rows {
    position: absolute;
}

.splitBody {
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

.body {
    overflow: auto;
    right: 0;
    bottom: 0;
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

.body > span, .splitBody > span, .cols > span, .rows > span, .measure > span {
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
.seamless > .measure > span {
    border: none 0px;
}

.splitBody {
    transition: transform 5s;
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

.cols > span.handle, .rows > span.handle {
    padding: 0;
    border: 0 none;
    opacity: 0;
    background-color: #08f;
}

.cols > span.handle {
    cursor: col-resize;
}
.rows > span.handle {
    cursor: row-resize;
}

.cols > span.head, .rows > span.head, .measure > span.head {
    background: #1e1e1e;
    font-weight: 600;
}

.cols > span {
    text-align: center;
}

.measure {
    position: absolute;
    opacity: 0;
}

.body > span.edit, .splitBody > span.edit {
    caret-color: currentcolor;
}
`;class At extends v{constructor(){super(),this.visible=!1,this.minCellHeight=0,this.minCellWidth=80,void 0===At.observer&&(At.observer=new MutationObserver(((t,e)=>{At.allTables.forEach((t=>{!1===t.visible&&t.prepareCells()}))})),At.observer.observe(document.body,{attributes:!0,subtree:!0})),this.arrangeAllMeasuredInGrid=this.arrangeAllMeasuredInGrid.bind(this),this.hostKeyDown=this.hostKeyDown.bind(this),this.cellKeyDown=this.cellKeyDown.bind(this),this.cellFocus=this.cellFocus.bind(this),this.focusIn=this.focusIn.bind(this),this.focusOut=this.focusOut.bind(this),this.pointerDown=this.pointerDown.bind(this),this.handleDown=this.handleDown.bind(this),this.handleMove=this.handleMove.bind(this),this.handleUp=this.handleUp.bind(this),this.setHeadingFillerSizeToScrollbarSize=this.setHeadingFillerSizeToScrollbarSize.bind(this),this.selectionChanged=this.selectionChanged.bind(this),this.modelChanged=this.modelChanged.bind(this),this.root=E(this.body=E()),this.root.className="root",this.body.className="body",this.measure=E(),this.measure.classList.add("measure"),this.onkeydown=this.hostKeyDown,this.addEventListener("focusin",this.focusIn),this.addEventListener("focusout",this.focusOut),this.body.onresize=this.setHeadingFillerSizeToScrollbarSize,this.body.onscroll=()=>{this.setHeadingFillerSizeToScrollbarSize(),this.colHeads&&(this.colHeads.scrollLeft=this.body.scrollLeft,this.colResizeHandles.scrollLeft=this.body.scrollLeft),this.rowHeads&&(this.rowHeads.scrollTop=this.body.scrollTop,this.rowResizeHandles.scrollTop=this.body.scrollTop)},this.body.onpointerdown=this.pointerDown,this.attachShadow({mode:"open"}),this.attachStyle(Ct),this.shadowRoot.appendChild(this.root),this.shadowRoot.appendChild(this.measure)}connectedCallback(){At.allTables.add(this),super.connectedCallback(),void 0===this.selection&&(this.selection=new nt(et.SELECT_CELL),this.selection.modified.add(this.selectionChanged,this))}disconnectedCallback(){At.allTables.delete(this)}hostKeyDown(t){if(this.selection&&this.selection.mode===et.SELECT_CELL){let e={col:this.selection.col,row:this.selection.row};switch(t.key){case"ArrowRight":void 0===this.editing&&e.col+1<this.adapter.colCount&&(++e.col,t.preventDefault(),t.stopPropagation());break;case"ArrowLeft":void 0===this.editing&&e.col>0&&(--e.col,t.preventDefault(),t.stopPropagation());break;case"ArrowDown":e.row+1<this.adapter.rowCount&&(++e.row,t.preventDefault(),t.stopPropagation());break;case"ArrowUp":e.row>0&&(--e.row,t.preventDefault(),t.stopPropagation());break;case"Enter":if(this.adapter?.editMode!==it.EDIT_ON_ENTER)break;void 0===this.editing?this.editCell():(this.saveCell(),e.row+1<this.adapter.rowCount&&(++e.row,this.selection.value=e,this.editCell())),t.preventDefault(),t.stopPropagation()}this.selection.value=e}}cellKeyDown(t){const e=t.target;if("Enter"===t.key)return this.hostKeyDown(t),void t.preventDefault();if(!e.classList.contains("edit")&&void 0===this.editing)switch(t.key){case"ArrowDown":case"ArrowUp":case"ArrowRight":case"ArrowLeft":case"Tab":case"Enter":break;default:t.preventDefault()}}cellFocus(t){const e=t.target;if(e instanceof HTMLElement){const t=e.getBoundingClientRect(),i=this.clientPosToTablePos(t.x+t.width/2,t.y+t.height/2);void 0!==i&&(this.selection.value=i)}}focusIn(t){}focusOut(t){}editCell(){const t=this.selection.value.col,e=this.selection.value.row,i=this.body.children[t+e*this.adapter.colCount];this.editing=new ot(t,e),i.classList.add("edit"),this.adapter.editCell(this.editing,i)}saveCell(){if(void 0===this.editing)return;const t=this.editing.col,e=this.editing.row,i=this.body.children[t+e*this.adapter.colCount];i.classList.remove("edit"),this.adapter.saveCell(this.editing,i),this.editing=void 0,this.focus()}pointerDown(t){}getModel(){return this.model}setModel(t){if(void 0===t)return this.selection&&this.selection.modified.remove(this),this.model=void 0,this.selection=new nt,void this.selection.modified.add(this.selectionChanged,this);if(t instanceof nt)return this.selection&&this.selection.modified.remove(this),this.selection=t,void this.selection.modified.add(this.selectionChanged,this);if(t instanceof tt){this.model=t,this.model.modified.add(this.modelChanged,this);const e=lt.lookup(t);try{this.adapter=new e(t)}catch(t){throw console.log(`Table.setModel(): failed to instantiate table adapter: ${t}`),console.log("setting TypeScript's target to 'es6' might help"),t}this.prepareCells()}else if(t instanceof Object)throw Error("Table.setModel(): unexpected model of type "+t.constructor.name)}selectionChanged(){if(void 0!==this.selection)switch(this.saveCell(),this.selection.mode){case et.EDIT_CELL:if(document.activeElement===this){const t=this.body.children[this.selection.col+this.selection.row*this.adapter.colCount];t.focus(),pt(t)}break;case et.SELECT_CELL:if(document.activeElement===this){const t=this.body.children[this.selection.col+this.selection.row*this.adapter.colCount];t.focus(),pt(t)}case et.SELECT_ROW:}}modelChanged(t){switch(t.type){case st.CELL_CHANGED:{const e=this.body.children[t.col+t.row*this.adapter.colCount];this.adapter.showCell(t,e)}break;case st.INSERT_ROW:this.animation&&this.animation.stop(),this.animation=new dt(this,t),this.animation.run();break;case st.REMOVE_ROW:this.animation&&this.animation.stop(),this.animation=new ht(this,t),this.animation.run();break;case st.INSERT_COL:this.animation&&this.animation.stop(),this.animation=new ct(this,t),this.animation.run();break;case st.REMOVE_COL:this.animation&&this.animation.stop(),this.animation=new ut(this,t),this.animation.run();break;default:console.log(`Table.modelChanged(): ${t} is not implemented`)}}prepareCells(){if(this.visible=Ht(this),!this.visible)return;this.adapter.isSeamless&&this.root.classList.add("seamless");const t=H(k("Tg"));this.measure.appendChild(t);let e=new Array(this.adapter.colCount);for(let t=0;t<this.adapter.colCount;++t){const i=this.adapter.getColumnHead(t);void 0===this.colHeads&&void 0!==i&&(this.colHeads=E(),this.colHeads.className="cols",this.root.appendChild(this.colHeads),this.colResizeHandles=E(),this.colResizeHandles.className="cols",this.root.appendChild(this.colResizeHandles)),e[t]=i}if(this.colHeads)for(let t=0;t<this.adapter.colCount;++t){const i=H(e[t]);i.className="head",this.measure.appendChild(i)}let i=new Array(this.adapter.rowCount);for(let t=0;t<this.adapter.rowCount;++t){const e=this.adapter.getRowHead(t);void 0===this.rowHeads&&void 0!==e&&(this.rowHeads=E(),this.rowHeads.className="rows",this.root.appendChild(this.rowHeads),this.rowResizeHandles=E(),this.rowResizeHandles.className="rows",this.root.appendChild(this.rowResizeHandles)),i[t]=e}if(this.rowHeads)for(let t=0;t<this.adapter.rowCount;++t){const e=H(i[t]);e.className="head",this.measure.appendChild(e)}for(let t=0;t<this.adapter.rowCount;++t)for(let e=0;e<this.adapter.colCount;++e){const i=H();i.onfocus=this.cellFocus,i.onkeydown=this.cellKeyDown,i.tabIndex=0,this.adapter?.editMode===it.EDIT_ON_ENTER&&i.setAttribute("contenteditable",""),this.adapter.showCell({col:e,row:t},i),this.measure.appendChild(i)}setTimeout(this.arrangeAllMeasuredInGrid,0)}arrangeAllMeasuredInGrid(){const t=this.adapter.isSeamless?0:1,e=this.measure.children[0].getBoundingClientRect();this.minCellHeight=Math.ceil(e.height),this.measure.removeChild(this.measure.children[0]);let i=0,s=0;const o=Array(this.adapter.colCount);if(this.colHeads)for(let t=0;t<this.adapter.colCount;++t){const e=this.measure.children[i++].getBoundingClientRect();o[t]=Math.max(e.width,this.minCellWidth),s=Math.max(s,e.height)}else o.fill(this.minCellWidth);s=Math.ceil(s);let n=0;const r=Array(this.adapter.rowCount);if(this.rowHeads)for(let t=0;t<this.adapter.rowCount;++t){const e=this.measure.children[i++].getBoundingClientRect();r[t]=Math.max(e.height,this.minCellHeight),n=Math.max(n,e.width)}else r.fill(this.minCellHeight);n=Math.ceil(n);for(let t=0;t<this.adapter.colCount;++t){let e=o[t];for(let s=0;s<this.adapter.rowCount;++s){const o=this.measure.children[i+t+s*this.adapter.colCount].getBoundingClientRect();e=Math.max(e,o.width)}o[t]=Math.ceil(e)}for(let t=0;t<this.adapter.rowCount;++t){let e=r[t];for(let s=0;s<this.adapter.colCount;++s){const o=this.measure.children[i+s+t*this.adapter.colCount].getBoundingClientRect();e=Math.max(e,o.height)}r[t]=Math.ceil(e)}let l,a;if(this.colHeads){l=0;for(let e=0;e<this.adapter.colCount;++e){const i=this.measure.children[0];i.style.left=`${l}px`,i.style.top="0px",i.style.width=o[e]-6+"px",i.style.height=s-2+"px",this.colHeads.appendChild(i),l+=o[e]-1-1+t}let e=H();e.className="head",e.style.left=`${l}px`,e.style.top="0",e.style.width="256px",e.style.height=`${s}px`,this.colHeads.appendChild(e),this.colHeads.style.left=n-1+"px",this.colHeads.style.height=`${s}px`,this.colResizeHandles.style.left=`${n}px`,this.colResizeHandles.style.height=`${s}px`,l=-3;for(let t=0;t<this.adapter.colCount;++t){l+=o[t]-1;const e=this.createHandle(t,l,0,5,s);this.colResizeHandles.appendChild(e)}l+=5,e=H(),e.className="head",e.style.left=`${l}px`,e.style.top="0",e.style.width="256px",e.style.height=`${s}px`,this.colResizeHandles.appendChild(e)}if(this.rowHeads){a=0;for(let e=0;e<this.adapter.rowCount;++e){const i=this.measure.children[0];i.style.left="0px",i.style.top=`${a}px`,i.style.width=n-6+"px",i.style.height=r[e]-2+"px",this.rowHeads.appendChild(i),a+=r[e]-1-1+t}let e=H();e.className="head",e.style.left="0",e.style.top=`${a}px`,e.style.width=`${n}px`,e.style.height="256px",this.rowHeads.appendChild(e),this.rowHeads.style.top=s-1+"px",this.rowHeads.style.width=`${n}px`,this.rowResizeHandles.style.top=`${s}px`,this.rowResizeHandles.style.width=`${n}px`,a=-3;for(let t=0;t<this.adapter.rowCount;++t){a+=r[t]-1;const e=this.createHandle(t,0,a,n,5);this.rowResizeHandles.appendChild(e)}a+=5,e=H(),e.className="head",e.style.left="0",e.style.top=`${a}0px`,e.style.width=`${n}px`,e.style.height="256px",this.rowResizeHandles.appendChild(e)}a=0;for(let e=0;e<this.adapter.rowCount;++e){l=0;for(let i=0;i<this.adapter.colCount;++i){const s=this.measure.children[0];s.style.left=`${l}px`,s.style.top=`${a}px`,s.style.width=o[i]-6+"px",s.style.height=r[e]-2+"px",this.body.appendChild(s),l+=o[i]-1-1+t}a+=r[e]-1-1+t}n>0&&--n,s>0&&--s,this.body.style.left=`${n}px`,this.body.style.top=`${s}px`,this.setHeadingFillerSizeToScrollbarSize()}createHandle(t,e,i,s,o){const n=H();return n.className="handle",n.style.left=`${e}px`,n.style.top=`${i}px`,n.style.width=`${s}px`,n.style.height=`${o}px`,n.dataset.idx=`${t}`,n.onpointerdown=this.handleDown,n.onpointermove=this.handleMove,n.onpointerup=this.handleUp,n}handleDown(t){t.preventDefault(),this.handle=t.target,this.handleIndex=parseInt(this.handle.dataset.idx)+1,this.handle.setPointerCapture(t.pointerId);if(this.handle.parentElement===this.colResizeHandles){this.deltaHandle=t.clientX-kt(this.handle.style.left),this.deltaSplitBody=t.clientX,this.deltaSplitHead=t.clientX-Et(this.body.style.left);const e=this.colHeads.children[this.handleIndex-1];this.deltaColumn=t.clientX-Et(e.style.width),this.splitVertical(this.handleIndex)}else{this.deltaHandle=t.clientY-Et(this.handle.style.top),this.deltaSplitBody=t.clientY,this.deltaSplitHead=t.clientY-Et(this.body.style.top);const e=this.rowHeads.children[this.handleIndex-1];this.deltaColumn=t.clientY-Et(e.style.height),this.splitHorizontal(this.handleIndex)}}handleMove(t){if(void 0===this.handle)return;if(this.handle.parentElement===this.colResizeHandles){let e=t.clientX;const i=this.deltaColumn+8;e<i&&(e=i),this.handle.style.left=e-this.deltaHandle+"px",this.splitHead.style.left=e-this.deltaSplitHead+"px",this.splitBody.style.left=e-this.deltaSplitBody+"px";const s=this.handleIndex;this.colHeads.children[s-1].style.width=e-this.deltaColumn+"px";for(let t=0;t<this.adapter.rowCount;++t)this.body.children[s-1+t*s].style.width=e-this.deltaColumn+"px"}else{let e=t.clientY;const i=this.deltaColumn+8;e<i&&(e=i),this.handle.style.top=e-this.deltaHandle+"px",this.splitHead.style.top=e-this.deltaSplitHead+"px",this.splitBody.style.top=e-this.deltaSplitBody+"px";const s=this.handleIndex;this.rowHeads.children[s-1].style.height=e-this.deltaColumn+"px";let o=(s-1)*this.adapter.colCount;for(let t=0;t<this.adapter.colCount;++t)this.body.children[o+t].style.height=e-this.deltaColumn+"px"}}handleUp(t){if(void 0===this.handle)return;this.handleMove(t);if(this.handle.parentElement===this.colResizeHandles){let e=t.clientX;const i=this.deltaColumn+8;e<i&&(e=i),this.joinVertical(this.handleIndex,e-this.deltaSplitBody)}else{let e=t.clientY;const i=this.deltaColumn+8;e<i&&(e=i),this.joinHorizontal(this.handleIndex,e-this.deltaSplitBody)}this.handle=void 0}splitVertical(t,e=0){void 0!==this.colHeads&&(this.splitHead=E(),this.splitHead.className="cols",this.splitHead.style.left=this.colHeads.style.left,this.splitHead.style.height=this.colHeads.style.height,this.root.appendChild(this.splitHead),setTimeout((()=>{this.splitHead.scrollTop=this.colHeads.scrollTop,this.splitHead.scrollLeft=this.colHeads.scrollLeft}),0)),this.splitBody=E(),this.splitBody.className="splitBody";const i=this.body.getBoundingClientRect();this.splitBody.style.width=`${i.width}px`,this.splitBody.style.height=`${i.height}px`,this.body.appendChild(this.splitBody);const s=t,o=this.adapter.colCount-t+e;if(void 0!==this.splitHead){for(let e=0;e<o;++e)this.splitHead.appendChild(this.colHeads.children[t]);this.splitHead.appendChild(this.colHeads.children[this.colHeads.children.length-1].cloneNode())}let n=t;for(let t=0;t<this.adapter.rowCount;++t){for(let t=0;t<o;++t)this.splitBody.appendChild(this.body.children[n]);n+=s}}joinVertical(t,e,i=0,s,o){void 0===s&&(s=this.adapter.colCount),void 0===o&&(o=this.adapter.rowCount);const n=s-t+i;let r=t-i;if(void 0!==this.colHeads){const t=this.colHeads.children[this.colHeads.children.length-1];for(let i=0;i<n;++i){const i=this.splitHead.children[0],s=Et(i.style.left);i.style.left=`${s+e}px`,this.colHeads.insertBefore(i,t)}const i=Et(t.style.left);t.style.left=`${i+e}px`;for(let t=r;t<=s;++t){const i=this.colResizeHandles.children[t],s=Et(i.style.left);i.style.left=`${s+e}px`}}for(let t=0;t<o;++t){let t=this.body.children[r];for(let i=0;i<n;++i){const i=this.splitBody.children[0],s=Et(i.style.left);i.style.left=`${s+e}px`,this.body.insertBefore(i,t)}r+=s}void 0!==this.colHeads&&(this.root.removeChild(this.splitHead),this.splitHead=void 0),this.body.removeChild(this.splitBody),this.splitBody=void 0}splitHorizontal(t,e=0){void 0!==this.rowHeads&&(this.splitHead=E(),this.splitHead.className="rows",this.splitHead.style.top=this.rowHeads.style.top,this.splitHead.style.width=this.rowHeads.style.width,this.root.appendChild(this.splitHead),setTimeout((()=>{this.splitHead.scrollTop=this.rowHeads.scrollTop,this.splitHead.scrollLeft=this.rowHeads.scrollLeft}),0)),this.splitBody=E(),this.splitBody.className="splitBody";const i=this.body.getBoundingClientRect();this.splitBody.style.width=`${i.width}px`,this.splitBody.style.height=`${i.height}px`,this.body.appendChild(this.splitBody);const s=this.adapter.rowCount-t+e;if(void 0!==this.splitHead){for(let e=0;e<s;++e)this.splitHead.appendChild(this.rowHeads.children[t]);this.splitHead.appendChild(this.rowHeads.children[this.rowHeads.children.length-1].cloneNode())}let o=this.adapter.colCount*t;for(let t=0;t<s;++t)for(let t=0;t<this.adapter.colCount;++t)this.splitBody.appendChild(this.body.children[o]);if(this.splitBody.children.length>0){const t=H();o=this.splitBody.children.length-1;const e=this.splitBody.children[o],s=this.splitBody.children[o].getBoundingClientRect();t.style.border="none",t.style.backgroundColor="#1e1e1e",t.style.top=`${kt(e.style.top)+s.height}px`,t.style.left="0px",t.style.width=`${i.width}px`,t.style.height=i.height-kt(e.style.top)+"px",this.splitBody.appendChild(t)}}joinHorizontal(t,e,i=0,s,o){void 0===s&&(s=this.adapter.colCount),void 0===o&&(o=this.adapter.rowCount);const n=o-t+i;if(void 0!==this.rowHeads){const i=this.rowHeads.children[this.rowHeads.children.length-1];for(let t=0;t<n;++t){const t=this.splitHead.children[0],s=Et(t.style.top);t.style.top=`${s+e}px`,this.rowHeads.insertBefore(t,i)}const s=Et(i.style.top);i.style.top=`${s+e}px`;for(let i=t;i<=o;++i){const t=this.rowResizeHandles.children[i],s=Et(t.style.top);t.style.top=`${s+e}px`}}for(let t=0;t<n;++t)for(let t=0;t<s;++t){const t=this.splitBody.children[0],i=Et(t.style.top);t.style.top=`${i+e}px`,this.body.appendChild(t)}void 0!==this.rowHeads&&(this.root.removeChild(this.splitHead),this.splitHead=void 0),this.body.removeChild(this.splitBody),this.splitBody=void 0}setHeadingFillerSizeToScrollbarSize(){const t=this.body.getBoundingClientRect();if(void 0!==this.colHeads){const e=Math.ceil(t.width-this.body.clientWidth);this.colHeads.children[this.colHeads.children.length-1].style.width=`${e}px`,this.colHeads.style.right=`${e}px`}if(void 0!==this.rowHeads){const e=Math.ceil(t.height-this.body.clientHeight);this.rowHeads.children[this.rowHeads.children.length-1].style.height=`${e}px`,this.rowHeads.style.bottom=`${e}px`}}clientPosToTablePos(t,e){let i,s;for(i=0;i<this.adapter.colCount;++i){const e=this.body.children[i].getBoundingClientRect();if(e.x<=t&&t<e.x+e.width)break}if(i>=this.adapter.colCount)return;let o=0;for(s=0;s<this.adapter.rowCount;++s){const t=this.body.children[o].getBoundingClientRect();if(t.y<=e&&e<t.y+t.height)break;o+=this.adapter.colCount}return s>=this.adapter.rowCount?void 0:new ot(i,s)}}At.allTables=new Set,At.transitionDuration="500ms",At.renderDelay=50,At.define("tx-table",At);v.define("tx-tabletool",class extends Q{constructor(){super(),this.toolbar=x("div",{class:"toolbar"}),this.buttonAddRowAbove=x("button",{class:"left",title:"add row above",children:g("svg",{style:{display:"block"},viewBox:"0 0 13 13",width:"13",height:"13",children:[x("rect",{x:"0.5",y:"0.5",width:"12",height:"12",class:"strokeFill"}),x("line",{x1:"0.5",y1:"8.5",x2:"12.5",y2:"8.5",class:"stroke"}),x("line",{x1:"4.5",y1:"8.5",x2:"4.5",y2:"13.5",class:"stroke"}),x("line",{x1:"8.5",y1:"8.5",x2:"8.5",y2:"13.5",class:"stroke"}),x("line",{x1:"6.5",y1:"2",x2:"6.5",y2:"7",class:"stroke"}),x("line",{x1:"4",y1:"4.5",x2:"9",y2:"4.5",class:"stroke"})]})}),this.buttonAddRowAbove.onclick=()=>{this.lastActiveTable?.focus();const t=this.lastActiveTable?.model,e=this.lastActiveTable?.selection;e&&t&&"insertRow"in t&&t.insertRow(e.row)},this.toolbar.appendChild(this.buttonAddRowAbove),this.buttonAddRowBelow=x("button",{title:"add row below",children:g("svg",{viewBox:"0 0 13 13",width:"13",height:"13",children:[x("rect",{x:"0.5",y:"0.5",width:"12",height:"12",class:"strokeFill"}),x("line",{x1:"0.5",y1:"4.5",x2:"12.5",y2:"4.5",class:"stroke"}),x("line",{x1:"4.5",y1:"0.5",x2:"4.5",y2:"4.5",class:"stroke"}),x("line",{x1:"8.5",y1:"0.5",x2:"8.5",y2:"4.5",class:"stroke"}),x("line",{x1:"6.5",y1:"6",x2:"6.5",y2:"11",class:"stroke"}),x("line",{x1:"4",y1:"8.5",x2:"9",y2:"8.5",class:"stroke"})]})}),this.buttonAddRowBelow.onclick=()=>{this.lastActiveTable?.focus();const t=this.lastActiveTable?.model,e=this.lastActiveTable?.selection;e&&t&&"insertRow"in t&&t.insertRow(e.row+1)},this.toolbar.appendChild(this.buttonAddRowBelow),this.buttonDeleteRow=x("button",{class:"right",title:"delete row",children:g("svg",{viewBox:"0 0 13 13",width:"13",height:"13",children:[x("rect",{x:"0.5",y:"0.5",width:"12",height:"12",class:"strokeFill"}),x("line",{x1:"0.5",y1:"4.5",x2:"12.5",y2:"4.5",class:"stroke"}),x("line",{x1:"0.5",y1:"8.5",x2:"12.5",y2:"8.5",class:"stroke"}),x("line",{x1:"5.5",y1:"3.5",x2:"11.5",y2:"9.5",class:"stroke","stroke-width":"1.5"}),x("line",{x1:"11.5",y1:"3.5",x2:"5.5",y2:"9.5",class:"stroke","stroke-width":"1.5"})]})}),this.buttonDeleteRow.onclick=()=>{this.lastActiveTable?.focus();const t=this.lastActiveTable?.model,e=this.lastActiveTable?.selection;e&&t&&"removeRow"in t&&t.removeRow(e.row,1)},this.toolbar.appendChild(this.buttonDeleteRow),this.toolbar.appendChild(document.createTextNode(" ")),this.buttonAddColumnLeft=x("button",{class:"left",title:"add column left",children:g("svg",{viewBox:"0 0 13 13",width:"13",height:"13",children:[x("rect",{x:"0.5",y:"0.5",width:"12",height:"12",class:"strokeFill"}),x("line",{x1:"8.5",y1:"0.5",x2:"8.5",y2:"12.5",class:"stroke"}),x("line",{x1:"8.5",y1:"4.5",x2:"12.5",y2:"4.5",class:"stroke"}),x("line",{x1:"8.5",y1:"8.5",x2:"12.5",y2:"8.5",class:"stroke"}),x("line",{x1:"2",y1:"6.5",x2:"7",y2:"6.5",class:"stroke"}),x("line",{x1:"4.5",y1:"4",x2:"4.5",y2:"9",class:"stroke"})]})}),this.buttonAddColumnLeft.onclick=()=>{this.lastActiveTable?.focus();const t=this.lastActiveTable?.model,e=this.lastActiveTable?.selection;e&&t&&"insertColumn"in t&&t.insertColumn(e.col)},this.toolbar.appendChild(this.buttonAddColumnLeft),this.buttonAddColumnRight=x("button",{title:"add column right",children:g("svg",{viewBox:"0 0 13 13",width:"13",height:"13",children:[x("rect",{x:"0.5",y:"0.5",width:"12",height:"12",class:"strokeFill"}),x("line",{x1:"4.5",y1:"0.5",x2:"4.5",y2:"12.5",class:"stroke"}),x("line",{x1:"0.5",y1:"4.5",x2:"4.5",y2:"4.5",class:"stroke"}),x("line",{x1:"0.5",y1:"8.5",x2:"4.5",y2:"8.5",class:"stroke"}),x("line",{x1:"6",y1:"6.5",x2:"11",y2:"6.5",class:"stroke"}),x("line",{x1:"8.5",y1:"4",x2:"8.5",y2:"9",class:"stroke"})]})}),this.buttonAddColumnRight.onclick=()=>{this.lastActiveTable?.focus();const t=this.lastActiveTable?.model,e=this.lastActiveTable?.selection;e&&t&&"insertColumn"in t&&t.insertColumn(e.col+1)},this.toolbar.appendChild(this.buttonAddColumnRight),this.buttonDeleteColumn=x("button",{class:"right",title:"delete column",children:g("svg",{viewBox:"0 0 13 13",width:"13",height:"13",children:[x("rect",{x:"0.5",y:"0.5",width:"12",height:"12",class:"strokeFill"}),x("line",{x1:"4.5",y1:"0.5",x2:"4.5",y2:"12.5",class:"stroke"}),x("line",{x1:"8.5",y1:"0.5",x2:"8.5",y2:"12.5",class:"stroke"}),x("line",{x1:"3.5",y1:"5.5",x2:"9.5",y2:"11.5",class:"stroke","stroke-width":"1.5"}),x("line",{x1:"3.5",y1:"11.5",x2:"9.5",y2:"5.5",class:"stroke","stroke-width":"1.5"})]})}),this.buttonDeleteColumn.onclick=()=>{this.lastActiveTable?.focus();const t=this.lastActiveTable?.model,e=this.lastActiveTable?.selection;e&&t&&"removeRow"in t&&t.removeColumn(e.col,1)},this.toolbar.appendChild(this.buttonDeleteColumn),this.toolbar.appendChild(document.createTextNode(" ")),this.buttonAddNodeAbove=x("button",{class:"left",title:"add node above",children:g("svg",{style:{display:"block",border:"none"},viewBox:"0 0 8 17",width:"8",height:"17",children:[x("rect",{x:"0.5",y:"1.5",width:"6",height:"6",class:"strokeFill"}),x("rect",{x:"0.5",y:"9.5",width:"6",height:"6",class:"fill"}),x("line",{x1:"3.5",y1:"3",x2:"3.5",y2:"6",class:"stroke"}),x("line",{x1:"2",y1:"4.5",x2:"5",y2:"4.5",class:"stroke"}),x("line",{x1:"3.5",y1:"0",x2:"3.5",y2:"1",class:"stroke"}),x("line",{x1:"3.5",y1:"8",x2:"3.5",y2:"17",class:"stroke"})]})}),this.toolbar.appendChild(this.buttonAddNodeAbove),this.buttonAddNodeBelow=x("button",{title:"add node below",children:g("svg",{style:{display:"block",border:"none"},viewBox:"0 0 8 17",width:"8",height:"17",children:[x("rect",{x:"0.5",y:"1.5",width:"6",height:"6",class:"fill"}),x("rect",{x:"0.5",y:"9.5",width:"6",height:"6",class:"strokeFill"}),x("line",{x1:"3.5",y1:"11",x2:"3.5",y2:"14",class:"stroke"}),x("line",{x1:"2",y1:"12.5",x2:"5",y2:"12.5",class:"stroke"}),x("line",{x1:"3.5",y1:"0",x2:"3.5",y2:"9",class:"stroke"}),x("line",{x1:"3.5",y1:"16",x2:"3.5",y2:"17",class:"stroke"})]})}),this.toolbar.appendChild(this.buttonAddNodeBelow),this.buttonAddNodeParent=x("button",{title:"add node parent",children:g("svg",{viewBox:"0 0 13 17",width:"13",height:"17",children:[x("rect",{x:"0.5",y:"1.5",width:"6",height:"6",class:"strokeFill"}),x("rect",{x:"6.5",y:"9.5",width:"6",height:"6",class:"fill"}),x("line",{x1:"7",y1:"4.5",x2:"10",y2:"4.5",class:"stroke"}),x("line",{x1:"9.5",y1:"4",x2:"9.5",y2:"9",class:"stroke"}),x("line",{x1:"3.5",y1:"3",x2:"3.5",y2:"6",class:"stroke"}),x("line",{x1:"2",y1:"4.5",x2:"5",y2:"4.5",class:"stroke"}),x("line",{x1:"3.5",y1:"0",x2:"3.5",y2:"1",class:"stroke"}),x("line",{x1:"3.5",y1:"8",x2:"3.5",y2:"17",class:"stroke"})]})}),this.buttonAddNodeParent.onclick=()=>{},this.toolbar.appendChild(this.buttonAddNodeParent),this.buttonAddNodeChild=x("button",{title:"add node child",children:g("svg",{viewBox:"0 0 13 17",width:"13",height:"17",children:[x("rect",{x:"0.5",y:"1.5",width:"6",height:"6",class:"fill"}),x("rect",{x:"6.5",y:"9.5",width:"6",height:"6",class:"strokeFill"}),x("line",{x1:"7",y1:"4.5",x2:"10",y2:"4.5",class:"stroke"}),x("line",{x1:"9.5",y1:"4",x2:"9.5",y2:"9",class:"stroke"}),x("line",{x1:"9.5",y1:"11",x2:"9.5",y2:"14",class:"stroke"}),x("line",{x1:"8",y1:"12.5",x2:"11",y2:"12.5",class:"stroke"}),x("line",{x1:"3.5",y1:"0",x2:"3.5",y2:"17",class:"stroke"})]})}),this.toolbar.appendChild(this.buttonAddNodeChild),this.buttonDeleteNode=x("button",{class:"right",title:"delete node",children:g("svg",{viewBox:"0 0 10 17",width:"10",height:"17",children:[x("rect",{x:"1.5",y:"5.5",width:"6",height:"6",class:"strokeFill"}),x("line",{x1:"4.5",y1:"2",x2:"4.5",y2:"5",class:"stroke"}),x("line",{x1:"4.5",y1:"12",x2:"4.5",y2:"15",class:"stroke"}),x("line",{x1:"0.5",y1:"4.5",x2:"8.5",y2:"12.5",class:"stroke","stroke-width":"1.5"}),x("line",{x1:"8.5",y1:"4.5",x2:"0.5",y2:"12.5",class:"stroke","stroke-width":"1.5"})]})}),this.toolbar.appendChild(this.buttonDeleteNode),this.attachShadow({mode:"open"}),this.shadowRoot.appendChild(document.importNode(K,!0)),this.shadowRoot.appendChild(this.toolbar)}canHandle(t){return t instanceof At}activate(){this.lastActiveTable=Q.activeView,this.toolbar.classList.add("active")}deactivate(){this.lastActiveTable=void 0,this.toolbar.classList.remove("active")}});class Rt extends w{constructor(t){super(t)}connectedCallback(){if(this.controller)this.updateView();else{try{c.registerView(this.getActionId(),this)}catch(t){}try{c.registerView(this.getModelId(),this)}catch(t){}this.updateView()}}disconnectedCallback(){super.disconnectedCallback(),this.controller&&this.controller.unregisterView(this)}setModel(t){if(!t)return this.model&&this.model.modified.remove(this),this.action&&this.action.modified.remove(this),this.model=void 0,this.action=void 0,void this.updateView();if(t instanceof d)this.action=t,this.action.modified.add((()=>{this.updateView()}),this);else{if(!(t instanceof l))throw Error("unexpected model of type "+t.constructor.name);this.model=t,this.model.modified.add((()=>{this.updateView()}),this)}this.updateView()}setAction(t){if(t instanceof Function){const e=new d(void 0,"");e.signal.add(t),this.setModel(e)}else this.setModel(t)}isEnabled(){return void 0!==this.action&&this.action.enabled}}const Nt=document.createElement("style");Nt.textContent=y`
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
}

:host(.tx-default) > .tx-button {
    color: var(--tx-gray-50);
    background-color: var(--tx-gray-800);
}

/* accent */

:host(.tx-accent) > .tx-button {
    color: var(--tx-static-white);
    background-color: var(--tx-static-blue-600);
}

:host(.tx-accent) > .tx-button:hover, :host(.tx-accent) > .tx-button:active {
    color: var(--tx-static-white);
    background-color: var(--tx-static-blue-700);
}
:host(.tx-accent) > .tx-button:hover:active {
    color: var(--tx-static-white);
    background-color: var(--tx-static-blue-500);
}

/* negative */

:host(.tx-negative) > .tx-button {
    color: var(--tx-static-white);
    background-color: var(--tx-static-red-600);
}
:host(.tx-negative) > :hover, :host(.tx-negative) > :active {
    color: var(--tx-static-white);
    background-color: var(--tx-static-red-700);
}
:host(.tx-negative) > :hover:active {
    color: var(--tx-static-white);
    background-color: var(--tx-static-red-500);
}

.tx-button:hover, .tx-button:active {
    color: var(--tx-gray-900);
    background-color: var(--tx-gray-400);
}
:host(.tx-default) > .tx-button:hover, :host(.tx-default) > .tx-button:hover:active {
    color: var(--tx-gray-50);
    background-color: var(--tx-gray-900);
}

.tx-button:hover:active {
    color: var(--tx-gray-900);
    background-color: var(--tx-gray-500);
}

.tx-button:hover:active > span {
    transition: transform 130ms ease-in-out;
    transform: translate(1px, 1px);
}

:host(.tx-default) > .tx-button:active {
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
`;class _t extends Rt{constructor(t){super(t),this.button=R(this.label=H()),this.button.classList.add("tx-button"),this.label.classList.add("tx-label"),this.button.onclick=()=>{this.action&&this.action.trigger()},this.button.disabled=!0,this.attachShadow({mode:"open"}),this.attachStyle(Nt),this.shadowRoot.appendChild(this.button)}connectedCallback(){super.connectedCallback(),0===this.children.length&&(this._observer=new MutationObserver(((t,e)=>{void 0!==this._timer&&clearTimeout(this._timer),this._timer=window.setTimeout((()=>{this._timer=void 0,this.updateView()}),100)})),this._observer.observe(this,{childList:!0,subtree:!0,characterData:!0}))}updateView(){this.isConnected&&(this.model&&this.model.value?this.model instanceof a?this.label.innerHTML=this.model.value:this.label.innerText=this.model.value:this.label.innerHTML=this.innerHTML,this.button.disabled=!this.isEnabled())}}_t.define("tx-button",_t);const Tt=document.createElement("style");Tt.textContent=y`
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
`;class St extends w{constructor(t){super(t),this.classList.add("tx-radio"),this.input=A(),this.input.type="radio",this.input.value=this.getAttribute("value");let e=this;this.input.onchange=()=>{e.updateModel()},this.attachShadow({mode:"open"}),this.attachStyle(Tt),this.shadowRoot.appendChild(this.input),this.shadowRoot.appendChild(H())}updateModel(){this.model&&(this.model.stringValue=this.input.value)}updateView(){if(this.model){let t=St.radioGroups.get(this.model);void 0===t&&(t=++St.radioGroupCounter,St.radioGroups.set(this.model,t)),this.input.name=`radioGroup${t}`}else this.input.name="";this.model&&this.model.enabled?this.input.removeAttribute("disabled"):this.input.setAttribute("disabled",""),this.model&&(this.input.checked=this.model.stringValue===this.input.value)}}St.radioGroupCounter=0,St.radioGroups=new WeakMap,St.define("tx-radiobutton",St);class Dt extends w{setModel(t){if(void 0!==t&&!(t instanceof n))throw Error("BooleanView.setModel(): model is not of type BooleanModel");super.setModel(t)}updateModel(){this.model&&(this.model.value=this.input.checked)}updateView(){this.model&&this.model.enabled?this.input.removeAttribute("disabled"):this.input.setAttribute("disabled",""),this.model&&(this.input.checked=this.model.value)}}const Lt=document.createElement("style");Lt.textContent=y`
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
`;class Mt extends Dt{constructor(){super(),this.classList.add("tx-checkbox"),this.input=A(),this.input.type="checkbox",this.input.onchange=()=>{this.updateModel()};const t=S(D("M3.5 9.5a.999.999 0 01-.774-.368l-2.45-3a1 1 0 111.548-1.264l1.657 2.028 4.68-6.01A1 1 0 019.74 2.114l-5.45 7a1 1 0 01-.777.386z"));this.attachShadow({mode:"open"}),this.attachStyle(Lt),this.shadowRoot.appendChild(this.input),this.shadowRoot.appendChild(t)}}Mt.define("tx-checkbox",Mt);const It=document.createElement("style");It.textContent=y`
/* Layout */

:host(.tx-tabs) {
    position: relative;
    display: inline-grid;
    box-sizing: border-box;
}

:host(.tx-tabs.tx-vertical) {
    grid-template-columns: min-content auto;
}

:host(.tx-tabs.tx-vertical) > ul {
    grid-column: 1/1;
    grid-row: 1/1;
}

:host(.tx-tabs.tx-vertical) > .content {
    grid-column: 2/2;
    grid-row: 1/1;
    padding-left: 15px;
}

:host(.tx-tabs:not(.tx-vertical)) > ul {
    grid-column: 1/1;
    grid-row: 1/1;
}

:host(.tx-tabs:not(.tx-vertical)) > .content {
    grid-column: 1/1;
    grid-row: 2/2;
    padding-top: 15px;
}

/* Look */

:host(.tx-tabs) > ul {
    display: inline-flex;
    flex-wrap: wrap;
    list-style: none;
    box-sizing: border-box;
    padding: 0;
    margin: 0;
    background-color: var(--tx-gray-50);
}

:host(.tx-tabs.tx-vertical) > ul {
    border-left: 2px solid var(--tx-gray-200);
}

:host(.tx-tabs:not(.tx-vertical)) > ul {
    border-bottom: 2px solid var(--tx-gray-200);
}

:host(.tx-tabs.tx-vertical) > ul {
    flex-direction: column;
}

:host(.tx-tabs) > ul > li {
    box-sizing: border-box;
    list-style: none;
}

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

/* the line to mark the active tab */

:host(.tx-tabs:not(.tx-vertical)) > div.line  {
    grid-row: 1/1;
    position: absolute;
    bottom: 0;
    transition: left 0.5s ease-in-out, width 0.5s 0.10s;
    height: 2px;
    background-color: var(--tx-gray-900);
    left: 12px;
    width: 0px;
    pointer-events: none;
}

:host(.tx-tabs.tx-vertical) > div.line  {
    grid-column: 1/1;
    position: absolute;
    left: 0;
    transition: top 0.5s ease-in-out, height 0.5s 0.10s;
    height: 0px;
    background-color: var(--tx-gray-900);
    top: 8px;
    width: 2px;
    pointer-events: none;
}
`;class Bt extends v{constructor(){super(),this.setTab=this.setTab.bind(this),this.classList.add("tx-tabs"),this.hasAttribute("vertical")&&this.classList.add("tx-vertical"),this.content=E();const t=N();for(let e=0;e<this.children.length;++e){const i=this.children[e];if("TX-TAB"!==i.nodeName){console.log(`unexpected <${i.nodeName.toLowerCase()}> within <tabs>`);continue}const s=i;let o;t.appendChild(_(o=H(k(s.getAttribute("label"))))),o.onpointerdown=t=>{t.stopPropagation(),t.preventDefault(),t.cancelBubble=!0,this.setTab(o,s)},void 0===this.activeTab?(this.activeTab=o,this.activePanel=s):s.style.display="none"}this.attachShadow({mode:"open"}),this.shadowRoot.appendChild(document.importNode(It,!0)),this.shadowRoot.appendChild(t),this.shadowRoot.appendChild(this.markerLine=E()),this.shadowRoot.appendChild(this.content=E(((...t)=>C("slot",t))())),this.markerLine.classList.add("line"),this.content.classList.add("content"),this.activeTab&&this.setTab(this.activeTab,this.activePanel)}setTab(t,e){const i=this.markerLine;this.hasAttribute("vertical")?(i.style.top=`${t.offsetTop}px`,i.style.height=`${t.clientHeight}px`):(i.style.left=`${t.offsetLeft}px`,i.style.width=`${t.clientWidth}px`),this.activeTab.classList.remove("active"),this.activeTab=t,this.activeTab.classList.add("active"),this.activePanel.style.display="none",this.activePanel=e,this.activePanel.style.display=""}}Bt.define("tx-tabs",Bt);class zt extends HTMLElement{}v.define("tx-tab",zt);const Ot=document.createElement("style");Ot.textContent=y`
:host(.tx-slider) {
    height: 14px;
    position: relative;
    width: 270px;
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
`;class Vt extends w{constructor(t){super(t),this.input=document.createElement("input"),this.input.type="range";let e=this;this.input.oninput=()=>{e.updateModel()},this.classList.add("tx-slider"),this.attachShadow({mode:"open"}),this.attachStyle(Ot),this.shadowRoot.appendChild(this.input)}updateModel(){this.model&&(this.model.value=Number.parseFloat(this.input.value))}updateView(){this.model&&(void 0===this.model.step&&void 0!==this.model.min&&void 0!==this.model.max?this.input.step=""+(this.model.max-this.model.min)/100:this.input.step=String(this.model.step),this.input.min=String(this.model.min),this.input.max=String(this.model.max),this.input.value=String(this.model.value))}}Vt.define("tx-slider",Vt);const $t=document.createElement("style");$t.textContent=y`
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
}`;class Wt extends Dt{constructor(){super(),this.classList.add("tx-switch"),this.input=A(),this.input.type="checkbox",this.input.onchange=()=>{this.updateModel()},this.attachShadow({mode:"open"}),this.attachStyle($t),this.shadowRoot.appendChild(this.input),this.shadowRoot.appendChild(H())}}Wt.define("tx-switch",Wt);class Pt extends w{updateView(){this.model&&(this.style.display=this.model.value?"":"none")}}Pt.define("tx-if",Pt);class jt extends f{constructor(t,e){super(),this.enumClass=t,void 0!==e&&(this._value=e)}get value(){return this._value}set value(t){this.setValue(t)}get stringValue(){return this.toString()}set stringValue(t){this.fromString(t)}getValue(){return this._value}setValue(t){this._value!==t&&(this._value=t,this.modified.trigger())}toString(){return this.enumClass[this._value]}fromString(t){const e=this.enumClass[t];if(void 0===e||"string"!=typeof this.enumClass[e]){let e="";return Object.keys(this.enumClass).forEach((t=>{const i=this.enumClass[t];"string"==typeof i&&(e=0!==e.length?`${e}, ${i}`:i)})),void console.trace(`EnumModel<T>.fromString('${t}'): invalid value, must be one of ${e}`)}this._value!==e&&(this._value=e,this.modified.trigger())}isValidStringValue(t){const e=this.enumClass[t];return void 0!==e&&"string"==typeof this.enumClass[e]}}class Ft{constructor(t,e,i){this.type=t,this.index=e,this.size=i}get col(){return this.index}get row(){return this.size}toString(){return`TableEvent {type: ${st[this.type]}, index: ${this.index}, size: ${this.size}}`}}class Gt{constructor(t,e,i=!0){this.node=t,this.depth=e,this.open=i}}class Ut extends rt{constructor(t,e){super(t),this.rows=new Array,void 0!==e&&this.createRowInfoHelper(this.rows,e,0)}get colCount(){return 1}get rowCount(){return this.rows.length}getRow(t){for(let e=0;e<this.rows.length;++e)if(this.rows[e].node===t)return e}addSiblingBefore(t){const e=this.createNode();return 0===this.rows.length?(t=0,this.setRoot(e),this.rows.push(new Gt(e,0))):0===t?(this.setNext(e,this.getRoot()),this.setRoot(e),this.rows.unshift(new Gt(e,0))):(this.setNext(e,this.rows[t].node),this.getNext(this.rows[t-1].node)===this.rows[t].node?this.setNext(this.rows[t-1].node,e):this.setDown(this.rows[t-1].node,e),this.rows.splice(t,0,new Gt(e,this.rows[t].depth))),this.modified.trigger(new Ft(st.INSERT_ROW,t,1)),t}addSiblingAfter(t){const e=this.createNode();if(0===this.rows.length)t=0,this.setRoot(e),this.rows.push(new Gt(e,0));else{this.setNext(e,this.getNext(this.rows[t].node)),this.setNext(this.rows[t].node,e);const i=this.nodeCount(this.getDown(this.rows[t].node)),s=this.rows[t].depth;t+=i+1,this.rows.splice(t,0,new Gt(e,s))}return this.modified.trigger(new Ft(st.INSERT_ROW,t,1)),t}addChildAfter(t){const e=this.createNode();if(0===this.rows.length)this.setRoot(e),this.rows.push(new Gt(e,0)),this.modified.trigger(new Ft(st.INSERT_ROW,0,1));else{const i=this.getDown(this.rows[t].node),s=this.nodeCount(i);for(let e=0;e<s;++e)++this.rows[t+1+e].depth;this.setDown(e,i),this.setDown(this.rows[t].node,e),this.rows.splice(t+1,0,new Gt(e,this.rows[t].depth+1)),this.modified.trigger(new Ft(st.INSERT_ROW,t+1,1))}return t}addParentBefore(t){const e=this.createNode();if(0===t){for(let e=0;e<this.rows.length;++e)++this.rows[t+e].depth;this.setDown(e,this.getRoot()),this.setRoot(e),this.rows.unshift(new Gt(e,0))}else{const i=this.rows[t].depth,s=this.nodeCount(this.getDown(this.rows[t].node))+1;for(let e=0;e<s;++e)++this.rows[t+e].depth;this.setDown(e,this.rows[t].node),this.setNext(e,this.getNext(this.rows[t].node)),this.setNext(this.rows[t].node,void 0),this.getNext(this.rows[t-1].node)===this.rows[t].node?this.setNext(this.rows[t-1].node,e):this.setDown(this.rows[t-1].node,e),this.rows.splice(t,0,new Gt(e,i))}return this.modified.trigger(new Ft(st.INSERT_ROW,t,1)),t}deleteAt(t){let e=this.getDown(this.rows[t].node);if(void 0!==e){const i=this.nodeCount(e)+1;for(let e=0;e<i;++e)--this.rows[t+e].depth;this.append(e,this.getNext(this.rows[t].node)),this.setNext(this.rows[t].node,void 0),0===t?this.setRoot(e):this.setNext(this.rows[t-1].node,e)}else if(0===t){const e=this.getNext(this.rows[t].node);this.setNext(this.rows[t].node,void 0),this.setRoot(e)}else{const e=this.getNext(this.rows[t].node);this.setNext(this.rows[t].node,void 0),this.getNext(this.rows[t-1].node)===this.rows[t].node?this.setNext(this.rows[t-1].node,e):this.setDown(this.rows[t-1].node,e)}return this.rows.splice(t,1),this.modified.trigger(new Ft(st.REMOVE_ROW,t,1)),t}init(){}toggleAt(t){this.rows[t].open?this.closeAt(t):this.openAt(t)}isOpen(t){return this.rows[t].open}openAt(t){let e=this.rows[t];if(e.open||void 0===this.getDown(e.node))return;e.open=!0;const i=this.createRowInfo(t);this.rows.splice(t+1,0,...i),this.modified.trigger(new Ft(st.INSERT_ROW,t+1,i.length))}closeAt(t){let e=this.rows[t];if(!e.open||void 0===this.getDown(e.node))return;const i=this.getVisibleChildCount(t);e.open=!1,this.rows.splice(t+1,i),this.modified.trigger(new Ft(st.REMOVE_ROW,t+1,i))}createRowInfo(t){const e=new Array;let i=this.rows[t];return i.open&&this.getDown(i.node)&&this.createRowInfoHelper(e,this.getDown(i.node),i.depth+1),e}createRowInfoHelper(t,e,i){const s=new Gt(e,i,!1);t.push(s),s.open&&this.getDown(e)&&this.createRowInfoHelper(t,this.getDown(e),s.depth+1),this.getNext(e)&&this.createRowInfoHelper(t,this.getNext(e),s.depth)}getVisibleChildCount(t){let e=this.rows[t],i=1;if(e.open&&this.getDown(e.node)){const e=this.getVisibleChildCountHelper(t+1);t+=e,i+=e}return i-1}getVisibleChildCountHelper(t){let e=this.rows[t],i=1;if(e.open&&this.getDown(e.node)){const e=this.getVisibleChildCountHelper(t+1);t+=e,i+=e}if(this.getNext(e.node)){const e=this.getVisibleChildCountHelper(t+1);t+=e,i+=e}return i}append(t,e){if(void 0===e)return;let i,s=t;for(;i=this.getNext(s),void 0!==i;)s=i;this.setNext(s,e)}nodeCount(t){return void 0===t?0:1+this.nodeCount(this.getDown(t))+this.nodeCount(this.getNext(t))}}class Yt extends Ut{constructor(t,e){super(t,e),this.root=e}createNode(){return new this.nodeClass}deleteNode(t){}getRoot(){return this.root}setRoot(t){this.root=t}getDown(t){return t.down}setDown(t,e){t.down=e}getNext(t){return t.next}setNext(t,e){t.next=e}}class qt extends lt{}class Xt extends qt{}class Kt extends Xt{get isSeamless(){return!0}showCell(t,e){if(void 0===this.model)return void console.log("no model");const i=this.model.rows[t.row],s=12,o=3.5,n=Math.round(2)-.5,r=i.depth*s+s+o,l=S();l.setAttributeNS(null,"width",`${r}`),l.setAttributeNS(null,"height","12"),l.style.verticalAlign="middle",l.style.background="none";const a=i.depth;if(this.model.getDown(i.node)){const t=a*s+o,e=function(t,e,i,s,o,n){const r=document.createElementNS(T,"rect");return r.setAttributeNS(null,"x",`${t}`),r.setAttributeNS(null,"y",`${e}`),r.setAttributeNS(null,"width",`${i}`),r.setAttributeNS(null,"height",`${s}`),void 0!==o&&r.setAttributeNS(null,"stroke",o),void 0!==n&&r.setAttributeNS(null,"fill",n),r}(t,n,8,8,"#000","#fff");e.style.cursor="pointer",l.appendChild(e);const r=L(t+2,n+4,t+8-2,n+4,"#000");r.style.cursor="pointer",l.appendChild(r);const d=L(t+4,n+2,t+4,n+8-2,"#000");d.style.cursor="pointer",d.style.display=i.open?"none":"",l.appendChild(d),l.appendChild(L(t+8,n+4,t+8+3,n+4,"#f80")),l.onpointerdown=e=>{e.preventDefault(),e.stopPropagation();const s=this.model.getRow(i.node);if(void 0===s)return void console.log("  ==> couldn't find row number for node");const o=l.getBoundingClientRect(),r=e.clientX-o.left,a=e.clientY-o.top;t<=r&&r<=t+8&&n<=a&&a<=n+8&&(this.model?.toggleAt(s),d.style.display=this.model.isOpen(s)?"none":"")}}else l.appendChild(L(a*s+o+4-.5,0,a*s+o+4,n+4,"#f80")),l.appendChild(L(a*s+o+4,n+4,a*s+o+8+3,n+4,"#f80"));let d="";for(let e=0;e<=a;++e){const n=e*s+o+4+2;for(let s=t.row+1;s<this.model.rowCount&&!(this.model.rows[s].depth<e);++s)if(e===this.model.rows[s].depth){(e!==a||void 0!==this.model.getNext(i.node))&&(d+=`<line x1='${n}' y1='0' x2='${n}' y2='100%' stroke='%23f80' />`);break}}if(void 0===this.model.getDown(i.node)||void 0===this.model.getNext(i.node)){const t=a*s+o+4+2;d+=`<line x1='${t}' y1='0' x2='${t}' y2='50%' stroke='%23f80' />`}e.style.background=`url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' style='background: %23000;'>${d}</svg>")`,e.style.backgroundRepeat="repeat-y",e.replaceChildren(l)}}class Jt extends h{constructor(t){super(),this.root=j(t),this.registerViews()}registerViews(){let t=this.root.querySelectorAll("[model]");for(let e of t){let t=e;if(t)try{this.registerView(t.getModelId(),t)}catch(t){}}t=this.root.querySelectorAll("[action]");for(let e of t){let t=e;if(t)try{this.registerView(t.getActionId(),t)}catch(t){}}}openHref(t){}}class Zt extends w{constructor(t){super(t)}updateView(){void 0!==this.model?this.model instanceof l?this.innerText=this.model.value:this.model instanceof a?this.innerHTML=this.model.value:this.model instanceof r&&(this.innerText=`${this.model.value}`):this.innerText=""}}Zt.define("tx-display",Zt);const Qt=document.createElement("style");Qt.textContent=y`
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
}`;class te extends w{constructor(){let t,e,i,s;super();const o=((...t)=>C("form",t))(E(t=S(s=D("M33.173 30.215L25.4 22.443a12.826 12.826 0 10-2.957 2.957l7.772 7.772a2.1 2.1 0 002.958-2.958zM6 15a9 9 0 119 9 9 9 0 01-9-9z")),i=A()),R(e=S(D("M6.548 5L9.63 1.917A1.094 1.094 0 008.084.371L5.001 3.454 1.917.37A1.094 1.094 0 00.371 1.917L3.454 5 .37 8.085A1.094 1.094 0 101.917 9.63l3.084-3.083L8.084 9.63a1.094 1.094 0 101.547-1.546z"))));t.setAttributeNS(null,"width","100%"),t.setAttributeNS(null,"height","100%"),s.setAttributeNS(null,"transform","scale(0.5, 0.5)"),e.setAttributeNS(null,"width","100%"),e.setAttributeNS(null,"height","100%"),i.type="search",i.placeholder="Search",i.autocomplete="off",o.classList.add("tx-search"),this.attachShadow({mode:"open"}),this.attachStyle(Qt),this.shadowRoot.appendChild(o)}}te.define("tx-search",te);let ee=document.createElement("style");ee.textContent="\n:host {\n    display: inline-block;\n    overflow: hidden;\n    box-sizing: border-box;\n    border: 1px solid #e3dbdb;\n    border-radius: 3px;\n    background: #e3dbdb;\n    width: 32px;\n    height: 32px;\n    margin: 0;\n    padding: 0;\n}\n\n:host([selected]) {\n    background: #ac9393;\n}\n\n:host([disabled]) {\n    opacity: 0.5;\n}\n\n:host([disabled]) img {\n    opacity: 0.5;\n}\n\n:host([checked][disabled]) {\n}\n";class ie extends w{constructor(t){super(t),t?(this.setAttribute("value",t.value),this.setAttribute("img",t.img),!0===t.disabled&&this.setAttribute("disabled","disabled")):t={value:this.getAttribute("value"),img:this.getAttribute("img"),disabled:this.hasAttribute("disabled")},this.onmousedown=t=>{this.hasAttribute("disabled")||(this.focus(),t.preventDefault(),void 0!==this.model&&(this.model.stringValue=this.getValue()))};let e=document.createElement("img");e.src=t.img,this.attachShadow({mode:"open"}),this.shadowRoot.appendChild(document.importNode(ee,!0)),this.shadowRoot.appendChild(e)}getValue(){let t=this.getAttribute("value");if(null===t)throw Error("no value");return t}connectedCallback(){super.connectedCallback(),void 0===this.model&&this.setAttribute("disabled","")}updateView(){if(void 0===this.model)return this.setAttribute("disabled",""),void this.removeAttribute("selected");let t=this.getValue();this.model.isValidStringValue(t)?this.removeAttribute("disabled"):this.setAttribute("disabled",""),this.model.stringValue===t?this.setAttribute("selected",""):this.removeAttribute("selected")}}ie.define("tx-toolbutton",ie);class se extends w{constructor(){super()}updateView(){if(!this.model)return;let t=void 0===this.model.value?"":this.model.value;this.model instanceof a?this.innerHTML=t:this.innerText=t}}se.define("tx-slot",se);class oe extends HTMLElement{}v.define("tx-menuspacer",oe);class ne extends rt{constructor(t,e){super(e),this.data=t}get rowCount(){return this.data?this.data.length:0}createRow(){return new this.nodeClass}insertRow(t,e){if(t>this.rowCount)throw Error(`ArrayTableModel.insert(${t}) is out of range, model size is ${this.colCount}, ${this.rowCount}`);let i;return void 0===e&&(e=this.createRow()),i=e instanceof Array?e:[e],this.data.splice(t,0,...i),this.modified.trigger(new Ft(st.INSERT_ROW,t,i.length)),t}removeRow(t,e=1){if(t>=this.rowCount||t+e>this.rowCount)throw Error(`ArrayTableModel.remove(${t}, ${e}) is out of range, model size is ${this.colCount}, ${this.rowCount}`);return this.data.splice(t,e),this.modified.trigger(new Ft(st.REMOVE_ROW,t,e)),t}}class re extends ne{constructor(t,e){super(t,e)}get colCount(){throw Error("ArrayModel.colCount() should not be called. Use ArrayAdapter.colCount() instead.")}}class le extends Xt{getColumnHead(t){const e=this.getColumnHeads();return document.createTextNode(e[t])}get colCount(){return this.getRow(this.model?.data[0]).length}getRowHead(t){}showCell(t,e){const i=this.getField(t.col,t.row);void 0!==i&&e.replaceChildren(document.createTextNode(i))}editCell(t,e){}getField(t,e){if(!this.model)return;const i=this.model.data[e];return this.getRow(i)[t].toString()}setField(t,e,i){this.model&&(this.getRow(this.model.data[e])[t].fromString(i),this.model.modified.trigger(new Ft(st.CELL_CHANGED,t,e)))}}class ae extends rt{constructor(t,e,i){super(t),this._cols=e,this._rows=i;const s=e*i;this._data=new Array(s);for(let t=0;t<s;++t)this._data[t]=new this.nodeClass}get colCount(){return this._cols}get rowCount(){return this._rows}getCell(t,e){return this._data[t+e*this._cols]}setCell(t,e,i){this._data[t+e*this._cols]=i}insertRow(t,e){if(void 0===e){e=new Array(this._cols);for(let t=0;t<this._cols;++t)e[t]=new this.nodeClass}return this._data.splice(t*this._cols,0,...e),++this._rows,this.modified.trigger(new Ft(st.INSERT_ROW,t,1)),t}removeRow(t,e=1){return this._data.splice(t*this._cols,this._cols*e),this._rows-=e,this.modified.trigger(new Ft(st.REMOVE_ROW,t,e)),t}insertColumn(t,e){if(void 0===e){e=new Array(this._rows);for(let t=0;t<this._rows;++t)e[t]=new this.nodeClass}++this._cols;for(let i=0;i<this._rows;++i)this._data.splice(t+i*this._cols,0,e[i]);return this.modified.trigger(new Ft(st.INSERT_COL,t,1)),t}removeColumn(t,e=1){--this._cols;for(let i=0;i<this._rows;++i)this._data.splice(t+i*this._cols,e);return this.modified.trigger(new Ft(st.REMOVE_COL,t,e)),t}}class de{constructor(t){this.value=t}eval(t){if("number"==typeof this.value)return this.value;if(this.value instanceof Array){if(void 0===t)throw Error(`yikes: no model to get cell [${this.value[0]},${this.value[1]}]`);return t.getCell(this.value[0],this.value[1])._calculatedValue}switch(this.value){case"+":return this.down.eval(t)+this.down.next.eval(t);case"-":return this.down?.next?this.down.eval(t)-this.down.next.eval(t):-this.down.eval(t);case"*":return this.down.eval(t)*this.down.next.eval(t);case"/":return this.down.eval(t)/this.down.next.eval(t);default:throw Error(`unexpected token '${this.value}'`)}}append(t){if(void 0===this.down)this.down=t;else{let e=this.down;for(;e.next;)e=e.next;e.next=t}}dependencies(t=[]){return this.value instanceof Array&&t.push(this.value),this.next&&this.next.dependencies(t),this.down&&this.down.dependencies(t),t}toString(){return this._toString()}_toString(t="\n",e=0){for(let i=0;i<e;++i)t+="    ";t+=this.value,t+="\n";for(let i=this.down;i;i=i.next)t=i._toString(t,e+1);return t}}class he{constructor(t){this.i=0,this.stack=[],this.str=t}isspace(t){return" "==t||"\n"==t||"\r"==t||"\t"==t||"\t"==t}isnumber(t){const e=t.charCodeAt(0);return e>=48&&e<=57}isalpha(t){const e=t.charCodeAt(0);return e>=65&&e<=90||e>=145&&e<=122}isalnum(t){return this.isnumber(t)||this.isalpha(t)}unlex(t){this.stack.push(t)}lex(){if(this.stack.length>0)return this.stack.pop();let t=0,e=0,i=0;if(this.i>=this.str.length)return;const s=this.i;for(;;){let o=this.str.at(this.i);switch(i){case 0:if(void 0===o)return;if(this.isspace(o)){++this.i;break}if(this.isnumber(o)){++this.i,i=1;break}if(this.isalpha(o)){t=0,i=3;break}switch(o){case"+":case"-":case"*":case"/":case"(":case")":case"=":return++this.i,new de(o)}return;case 1:if(void 0!==o&&this.isnumber(o)){++this.i;break}if("."===o||"e"==o||"E"==o){++this.i,i=2;break}return new de(parseFloat(this.str.substring(s,this.i)));case 2:if(void 0!==o&&this.isnumber(o)){++this.i;break}return new de(parseFloat(this.str.substring(s,this.i)));case 3:if(void 0!==o){const s=o.charCodeAt(0);if(s>=48&&s<=57){e=s-48,i=4,++this.i;break}if(s>=65&&s<=90){t*=26,t+=s-64,++this.i;break}if(s>=145&&s<=122){t*=26,t+=s-144,++this.i;break}}return new de(this.str.substring(s,this.i));case 4:if(void 0!==o){const t=o.charCodeAt(0);if(t>=48&&t<=57){e*=10,e+=t-48,++this.i;break}}return new de([t-1,e-1])}}}}function ce(t){const e=ue(t);if(void 0===e)return;const i=t.lex();if(void 0===i)return e;if("+"===i.value||"-"===i.value){const s=ce(t);return void 0===s?(t.unlex(i),e):(i.append(e),i.append(s),i)}return t.unlex(i),e}function ue(t){const e=pe(t);if(void 0===e)return;const i=t.lex();if(void 0===i)return e;if("*"===i.value||"/"===i.value){const s=ue(t);if(void 0===s)throw Error(`expexted expression after ${i.value}`);return i.append(e),i.append(s),i}return t.unlex(i),e}function pe(t){const e=t.lex();if(void 0!==e){if("number"==typeof e.value)return e;if(e.value instanceof Array)return e;if("("===e.value){const e=ce(t);if(void 0===e)throw Error("Unexpected end after '(");if(")"!==t.lex()?.value)throw Error("Excepted ')");return e}if("-"===e.value){const i=pe(t);if(void 0!==i)return e.append(i),e}t.unlex(e)}}class be{constructor(t){void 0!==t&&0!==t.trim().length&&(this.value=t)}eval(t){void 0!==this._node&&(this._calculatedValue=this._node.eval(t))}set value(t){this._node=function(t){const e=t.lex();if(void 0!==e&&"="===e.value)return ce(t)}(new he(t)),this._inputValue=t}get value(){return this._error&&void 0!==this._inputValue?this._inputValue:this._node?`${this._calculatedValue}`:void 0!==this._inputValue?this._inputValue:""}getDependencies(){return void 0!==this._node?this._node.dependencies():[]}}class xe extends ae{constructor(t,e){super(be,t,e),this.dependencies=new Map}getField(t,e){const i=this.getCell(t,e);return void 0===i?"":`${i.value}`}setField(t,e,i){const s=t+e*this._cols;let o=this._data[s];void 0===o?(o=new be(i),this._data[t+e*this._cols]=o):(this.unobserve(o),o.value=i),this.observe(o),this.eval(o,new Set)}sendCellChanged(t){let e=0;for(let i=0;i<this._rows;++i)for(let s=0;s<this._cols;++s)if(t===this._data[e++])return void this.modified.trigger(new Ft(st.CELL_CHANGED,s,i))}eval(t,e){if(e.has(t))return void e.forEach((t=>{t._error="Cycle: This formula can't reference its own cell, or depend on another formula that references this cell.",this.sendCellChanged(t)}));t._error&&(t._error=void 0,this.sendCellChanged(t)),e.add(t);const i=t._calculatedValue;t.eval(this),i!=t._calculatedValue&&this.sendCellChanged(t);const s=this.dependencies.get(t);void 0!==s&&s.forEach((t=>{this.eval(t,e)}))}observe(t){t.getDependencies().forEach((e=>{const i=e[0]+e[1]*this._cols;let s=this._data[i];void 0===s&&(s=new be,this._data[i]=s);let o=this.dependencies.get(s);void 0===o&&(o=new Set,this.dependencies.set(s,o)),o.add(t)}))}unobserve(t){t.getDependencies().forEach((e=>{const i=e[0]+e[1]*this._cols;let s=this._data[i];if(void 0!==s){let e=this.dependencies.get(s);void 0!==e&&e.delete(t)}}))}}class ge extends Xt{showCell(t,e){if(!this.model)return;const i=this.model.getCell(t.col,t.row);void 0!==i?e.replaceChildren(k(i.value)):e.replaceChildren()}getRowHead(t){return k(`${t+1}`)}getColumnHead(t){let e="",i=t;for(;e=`${String.fromCharCode(i%26+65)}${e}`,i=Math.floor(i/26),0!==i;)i-=1;return k(e)}}const me=["AL","LE","XE","GE","ZA","CE","BI","SO","US","ES","AR","MA","IN","DI","RE","A","ER","AT","EN","BE","RA","LA","VE","TI","ED","OR","QU","AN","TE","IS","RI","ON"],ve=["Anarchy","Feudal","Multi-government","Dictatorship","Communist","Confederacy","Democracy","Corporate State"],we=["Rich","Average","Poor","Mainly"],fe=[" Industrial"," Agricultural"],ye=["Large ","Fierce ","Small "],Ce=["Green ","Red ","Yellow ","Blue ","Black ","Harmless "],ke=["Slimy ","Bug-Eyed ","Horned ","Bony ","Fat ","Furry "],Ee=["Rodents ","Frogs","Lizards","Lobsters","Birds","Humanoids","Felines","Insects"];class He extends tt{constructor(){super()}get colCount(){return 4}get rowCount(){return 64}get(t,e){return He.get(t,e)}static get(t,e){let i=this.hash(`${e}`);switch(t){case 0:{let t="",s=i%6+1;for(let o=0;o<s;++o)i=this.hash(`${e}`,i),t+=me[i%me.length];return t.charAt(0)+t.toLowerCase().substring(1)}case 1:return ve[i%ve.length];case 2:{i>>>=3;const t=i%we.length;i>>>=2;return we[t]+fe[i%fe.length]}case 3:{i>>>=6;let t=i%ye.length;i>>>=2;const e=i%Ce.length;i>>>=3;const s=i%ke.length;i>>>=3;return ye[t]+Ce[e]+ke[s]+Ee[(i%4+s)%Ee.length]}}throw Error(`unreachable col ${t}, row ${e}`)}static hash(t,e=0){let i=3735928559^e,s=1103547991^e;for(let e,o=0;o<t.length;o++)e=t.charCodeAt(o),i=Math.imul(i^e,2654435761),s=Math.imul(s^e,1597334677);return i=Math.imul(i^i>>>16,2246822507)^Math.imul(s^s>>>13,3266489909),s=Math.imul(s^s>>>16,2246822507)^Math.imul(i^i>>>13,3266489909),4294967296*(2097151&s)+(i>>>0)}}class Ae extends lt{constructor(t){super(t)}getColumnHead(t){switch(t){case 0:return k("Name");case 1:return k("Government");case 2:return k("Economy");case 3:return k("Species")}}getRowHead(t){return k(`${t+1}`)}showCell(t,e){e.replaceChildren(k(this.model.get(t.col,t.row)))}}class Re{constructor(){this.name="New Name",this.government="New Government",this.economy="New Economy",this.species="New Species"}}class Ne extends le{getColumnHeads(){return["Name","Government","Economy","Species"]}getRow(t){return function(t,...e){return e.map((e=>new b(t,e)))}(t,"name","government","economy","species")}}function _e(){!function(){let t;!function(t){t[t.CLASSIC=0]="CLASSIC",t[t.CHERRY=1]="CHERRY",t[t.VANILLA=2]="VANILLA"}(t||(t={}));const e=document.getElementById("soda");e.onanimationend=()=>{e.classList.remove("animated")};const i=new jt(t);i.value=t.CLASSIC,u("flavour",i);const s=new r(330,{min:0,max:1500});u("quantity",s),p("fill",(()=>{const o=s.value/s.max;switch(document.documentElement.style.setProperty("--soda-height",`${o}`),i.value){case t.CLASSIC:document.documentElement.style.setProperty("--soda-color","#420");break;case t.CHERRY:document.documentElement.style.setProperty("--soda-color","#d44");break;case t.VANILLA:document.documentElement.style.setProperty("--soda-color","#d80")}e.classList.add("animated")}))}(),function(){lt.register(Ae,He),u("fixedSystem",new He);const t=Array(64);for(let e=0;e<64;++e)t[e]={name:He.get(0,e),government:He.get(1,e),economy:He.get(2,e),species:He.get(3,e)};lt.register(Ne,re,Re),u("dynamicSystem",new re(t,Re))}(),function(){Kt.register(je,Yt,Pe);let t=new Yt(Pe);t.addSiblingAfter(0),t.addChildAfter(0),t.addChildAfter(1),t.addSiblingAfter(2),t.addSiblingAfter(1),t.addChildAfter(4),t.addSiblingAfter(0),u("tree",t)}()}window.onload=()=>{_e()};let Te=new l("");u("hello",Te);let Se=new a("");Se.modified.add((()=>{document.getElementById("rawhtml").innerText=Se.value})),u("markup",Se),p("hitMe",(()=>{Te.value="Hit me too!",De.enabled=!0}));var De=p("hitMeMore",(()=>{Te.value="You hit me!",De.enabled=!1}));const Le=new n(!1),Me=new n(!0),Ie=new n(!1);Ie.enabled=!1;const Be=new n(!0);var ze;Be.enabled=!1,u("off",Le),u("on",Me),u("offDisabled",Ie),u("onDisabled",Be),function(t){t[t.BLUEBERRY=0]="BLUEBERRY",t[t.GRAPE=1]="GRAPE",t[t.TANGERINE=2]="TANGERINE",t[t.LIME=3]="LIME",t[t.STRAWBERRY=4]="STRAWBERRY",t[t.BONDIBLUE=5]="BONDIBLUE"}(ze||(ze={}));const Oe=new jt(ze);Oe.value=ze.GRAPE,u("flavourEnabled",Oe);const Ve=new jt(ze);Ve.enabled=!1,Ve.value=ze.TANGERINE,u("flavourDisabled",Ve);u("customFlavour",new l(""));u("customFlavourDisabled",new l("")),u("size",new r(42,{min:0,max:99})),p("file|logout",(()=>{alert("You are about to logout")})),p("help",(()=>{alert("Please.")}));const $e=[["Name","Pieces","Price/Piece","Price"],["Apple","=4","=0.98","=B2*C2"],["Banana","=2","=1.98","=B3*C3"],["Citrus","=1","=1.48","=B4*C4"],["SUM","","","=D2+D3+D4"]],We=new xe(25,25);for(let t=0;t<We.rowCount;++t)for(let e=0;e<We.colCount;++e)t<$e.length&&e<$e[t].length&&We.setField(e,t,$e[t][e]);lt.register(class extends ge{get editMode(){return it.EDIT_ON_ENTER}showCell(t,e){if(!this.model)return;const i=this.model.getCell(t.col,t.row);i._error?(e.classList.add("error"),e.title=i._error):(e.classList.remove("error"),e.title=""),super.showCell(t,e)}editCell(t,e){const i=this.model.getCell(t.col,t.row);void 0!==i&&void 0!==i._inputValue&&(e.innerText=i._inputValue)}saveCell(t,e){try{this.model.setField(t.col,t.row,e.innerText);const i=this.model.getCell(t.col,t.row);e.innerText=i.value}catch(t){console.log("saveCell caught error")}}},xe,be),u("spreadsheet",We);class Pe{constructor(){this.label="#"+Pe.counter++}}Pe.counter=0;class je extends Kt{get isSeamless(){return!0}showCell(t,e){if(void 0===this.model)return void console.log("no model");super.showCell(t,e);const i=this.model.rows[t.row].node.label,s=H(k(i));s.style.verticalAlign="middle",s.style.padding="2px",e.appendChild(s)}}class Fe extends HTMLElement{constructor(){super(),this.condition=new n(!1);let t=new Jt("my-code-button"),e=t.text("label","Show Code");t.action("action",(()=>{this.condition.value?(this.condition.value=!1,e.value="Show Code"):(this.condition.value=!0,e.value="Hide Code")})),this.attachShadow({mode:"open"}),this.shadowRoot.appendChild(t.root)}connectedCallback(){u(this.getAttribute("condition"),this.condition)}}return window.customElements.define("my-code-button",Fe),t.main=_e,Object.defineProperty(t,"__esModule",{value:!0}),t}({});
