import{N as n,G as s,c as a,M as t,d as p,e,t as o,j as l,a as c,F as i}from"./main.js";import{p as u,T as k,d as r,h as d,e as h}from"./TableTool-8f68368a.js";const m=document.createElement("pre");m.className="language-tsx",m.innerHTML='\n<span class="token keyword">import</span> <span class="token punctuation">{</span> NumberModel<span class="token punctuation">,</span> Slider<span class="token punctuation">,</span> Text <span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">"@toad"</span>\n<span class="token keyword">import</span> <span class="token punctuation">{</span> FixedNumberModel <span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">"@toad/model/FixedNumberModel"</span>\n<span class="token keyword">import</span> <span class="token punctuation">{</span> RGBModel <span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">"@toad/model/RGBModel"</span>\n<span class="token keyword">import</span> <span class="token punctuation">{</span> ColorSelector <span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">"@toad/view/ColorSelector"</span>\n\n<span class="token comment">//</span>\n<span class="token comment">// Application Layer</span>\n<span class="token comment">//</span>\n\n<span class="token keyword">let</span> floatModel <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">NumberModel</span><span class="token punctuation">(</span><span class="token number">42</span><span class="token punctuation">,</span> <span class="token punctuation">{</span> min<span class="token operator">:</span> <span class="token number">0</span><span class="token punctuation">,</span> max<span class="token operator">:</span> <span class="token number">99</span> <span class="token punctuation">}</span><span class="token punctuation">)</span>\n<span class="token keyword">let</span> integerModel <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">FixedNumberModel</span><span class="token punctuation">(</span><span class="token number">42</span><span class="token punctuation">,</span> <span class="token punctuation">{</span> min<span class="token operator">:</span> <span class="token number">0</span><span class="token punctuation">,</span> max<span class="token operator">:</span> <span class="token number">99</span> <span class="token punctuation">}</span><span class="token punctuation">)</span>\n\n<span class="token keyword">const</span> sliderEnabled <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">NumberModel</span><span class="token punctuation">(</span><span class="token number">42</span><span class="token punctuation">,</span> <span class="token punctuation">{</span> min<span class="token operator">:</span> <span class="token number">0</span><span class="token punctuation">,</span> max<span class="token operator">:</span> <span class="token number">99</span> <span class="token punctuation">}</span><span class="token punctuation">)</span>\n<span class="token keyword">const</span> sliderDisabled <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">NumberModel</span><span class="token punctuation">(</span><span class="token number">83</span><span class="token punctuation">,</span> <span class="token punctuation">{</span> min<span class="token operator">:</span> <span class="token number">0</span><span class="token punctuation">,</span> max<span class="token operator">:</span> <span class="token number">99</span><span class="token punctuation">,</span> enabled<span class="token operator">:</span> <span class="token boolean">false</span> <span class="token punctuation">}</span><span class="token punctuation">)</span>\n\n<span class="token keyword">const</span> colorModel <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">RGBModel</span><span class="token punctuation">(</span><span class="token punctuation">{</span> r<span class="token operator">:</span> <span class="token number">255</span><span class="token punctuation">,</span> g<span class="token operator">:</span> <span class="token number">128</span><span class="token punctuation">,</span> b<span class="token operator">:</span> <span class="token number">0</span> <span class="token punctuation">}</span><span class="token punctuation">)</span>\n\n<span class="token comment">//</span>\n<span class="token comment">// View Layer</span>\n<span class="token comment">//</span>\n\n<span class="token keyword">export</span> <span class="token keyword">default</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">(</span>\n    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span></span><span class="token punctuation">></span></span><span class="token plain-text">\n        </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>h1</span><span class="token punctuation">></span></span><span class="token plain-text">Number</span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>h1</span><span class="token punctuation">></span></span><span class="token plain-text">\n\n        </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>h3</span><span class="token punctuation">></span></span><span class="token plain-text">&amp;lt;Text&amp;gt; &amp;amp; &amp;lt;Slider&amp;gt; with NumberModel</span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>h3</span><span class="token punctuation">></span></span><span class="token plain-text">\n        </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>div</span> <span class="token attr-name">class</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>section<span class="token punctuation">"</span></span><span class="token punctuation">></span></span><span class="token plain-text">\n            </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">Text</span></span> <span class="token attr-name">model</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span>floatModel<span class="token punctuation">}</span></span> <span class="token punctuation">/></span></span><span class="token plain-text">\n            </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">Slider</span></span> <span class="token attr-name">model</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span>floatModel<span class="token punctuation">}</span></span> <span class="token punctuation">/></span></span><span class="token plain-text">\n        </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>div</span><span class="token punctuation">></span></span><span class="token plain-text">\n        </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>h3</span><span class="token punctuation">></span></span><span class="token plain-text">&amp;lt;Text&amp;gt; &amp;amp; &amp;lt;Slider&amp;gt; with FixedNumberModel</span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>h3</span><span class="token punctuation">></span></span><span class="token plain-text">\n        </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>div</span> <span class="token attr-name">class</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>section<span class="token punctuation">"</span></span><span class="token punctuation">></span></span><span class="token plain-text">\n            </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">Text</span></span> <span class="token attr-name">model</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span>integerModel<span class="token punctuation">}</span></span> <span class="token punctuation">/></span></span><span class="token plain-text">\n            </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">Slider</span></span> <span class="token attr-name">model</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span>integerModel<span class="token punctuation">}</span></span> <span class="token punctuation">/></span></span><span class="token plain-text">\n        </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>div</span><span class="token punctuation">></span></span><span class="token plain-text">\n\n        </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>h3</span><span class="token punctuation">></span></span><span class="token plain-text">&amp;lt;Slider&amp;gt;</span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>h3</span><span class="token punctuation">></span></span><span class="token plain-text">\n        </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>div</span> <span class="token attr-name">class</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>section<span class="token punctuation">"</span></span><span class="token punctuation">></span></span><span class="token plain-text">\n            </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>div</span> <span class="token attr-name">style</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span><span class="token punctuation">{</span> width<span class="token operator">:</span> <span class="token string">"200px"</span> <span class="token punctuation">}</span><span class="token punctuation">}</span></span><span class="token punctuation">></span></span><span class="token plain-text">\n                </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">Slider</span></span> <span class="token attr-name">model</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span>sliderEnabled<span class="token punctuation">}</span></span> <span class="token punctuation">/></span></span><span class="token plain-text">\n                </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">Slider</span></span> <span class="token attr-name">model</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span>sliderEnabled<span class="token punctuation">}</span></span> <span class="token attr-name">minColor</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>#00f<span class="token punctuation">"</span></span> <span class="token attr-name">maxColor</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>#f00<span class="token punctuation">"</span></span> <span class="token punctuation">/></span></span><span class="token plain-text">\n                </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">Slider</span></span> <span class="token attr-name">model</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span>sliderDisabled<span class="token punctuation">}</span></span> <span class="token punctuation">/></span></span><span class="token plain-text">\n            </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>div</span><span class="token punctuation">></span></span><span class="token plain-text">\n        </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>div</span><span class="token punctuation">></span></span><span class="token plain-text">\n\n        </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>h3</span><span class="token punctuation">></span></span><span class="token plain-text">&amp;lt;Slider orientation="vertical"&amp;gt;</span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>h3</span><span class="token punctuation">></span></span><span class="token plain-text">\n        </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>div</span> <span class="token attr-name">class</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>section<span class="token punctuation">"</span></span> <span class="token attr-name">style</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span><span class="token punctuation">{</span> height<span class="token operator">:</span> <span class="token string">"200px"</span> <span class="token punctuation">}</span><span class="token punctuation">}</span></span><span class="token punctuation">></span></span><span class="token plain-text">\n            </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">Slider</span></span> <span class="token attr-name">model</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span>sliderEnabled<span class="token punctuation">}</span></span> <span class="token attr-name">orientation</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>vertical<span class="token punctuation">"</span></span> <span class="token punctuation">/></span></span><span class="token plain-text">\n            </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">Slider</span></span> <span class="token attr-name">model</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span>sliderEnabled<span class="token punctuation">}</span></span> <span class="token attr-name">minColor</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>#00f<span class="token punctuation">"</span></span> <span class="token attr-name">maxColor</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>#f00<span class="token punctuation">"</span></span> <span class="token attr-name">orientation</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>vertical<span class="token punctuation">"</span></span> <span class="token punctuation">/></span></span><span class="token plain-text">\n            </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">Slider</span></span> <span class="token attr-name">model</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span>sliderDisabled<span class="token punctuation">}</span></span> <span class="token attr-name">orientation</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>vertical<span class="token punctuation">"</span></span> <span class="token punctuation">/></span></span><span class="token plain-text">\n        </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>div</span><span class="token punctuation">></span></span><span class="token plain-text">\n\n        </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>h3</span><span class="token punctuation">></span></span><span class="token plain-text">&amp;lt;ColorSelector&amp;gt;</span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>h3</span><span class="token punctuation">></span></span><span class="token plain-text">\n\n        </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>div</span> <span class="token attr-name">class</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>section<span class="token punctuation">"</span></span><span class="token punctuation">></span></span><span class="token plain-text">\n            </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">ColorSelector</span></span> <span class="token attr-name">model</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span>colorModel<span class="token punctuation">}</span></span> <span class="token punctuation">/></span></span><span class="token plain-text">\n        </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>div</span><span class="token punctuation">></span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span></span><span class="token punctuation">></span></span>\n<span class="token punctuation">)</span>\n';class g extends n{set value(n){super.value=Math.round(n)}get value(){return super.value}}const x=new CSSStyleSheet;x.replaceSync(a`
#root {
    display: inline-block;
    position: relative;
    width: 354px;
    height: 344px;
}
#canvas {
    position: absolute;
    top: 8px;
    left: 8px;
}
#hsv {
    position: absolute;
    border: 2px solid var(--tx-gray-700); /* knob border */
    border-radius: 50%;
    background: var(--tx-gray-75); /* inside knob */
    cursor: pointer;
    width: 14px;
    height: 14px;
    box-sizing: border-box;
    outline-width: 0px;
    border-radius: 50%;
    transform: translate(-50%, -50%);
}
#sv {
    position: absolute;
    top: 8px;
    left: 264px;
    height: 256px;
}
#sr {
    position: absolute;
    top: 8px;
    left: 294px;
    height: 256px;
}
#sg {
    position: absolute;
    top: 8px;
    left: 314px;
    height: 256px;
}
#sb {
    position: absolute;
    top: 8px;
    left: 332px;
    height: 256px;
}
#lh {
    position: absolute;
    top: 272px;
    left: 8px;
    width: 14px;
    height: 28px;
    display: flex;
    justify-content: center;
    flex-direction: column;
}
#th {
    position: absolute;
    top: 272px;
    left: ${22}px;
    width: 45px;
}
#ls {
    position: absolute;
    top: 272px;
    left: ${75}px;
    width: 14px;
    height: 28px;
    display: flex;
    justify-content: center;
    flex-direction: column;
}
#ts {
    position: absolute;
    top: 272px;
    left: ${89}px;
    width: 45px;
}
#lv {
    position: absolute;
    top: 272px;
    left: ${142}px;
    width: 14px;
    height: 28px;
    display: flex;
    justify-content: center;
    flex-direction: column;
}
#tv {
    position: absolute;
    top: 272px;
    left: ${156}px;
    width: 45px;
}

#lr {
    position: absolute;
    top: ${308}px;
    left: 8px;
    width: 14px;
    height: 28px;
    display: flex;
    justify-content: center;
    flex-direction: column;
}
#tr {
    position: absolute;
    top: ${308}px;
    left: ${22}px;
    width: 45px;
}
#lg {
    position: absolute;
    top: ${308}px;
    left: ${75}px;
    width: 14px;
    height: 28px;
    display: flex;
    justify-content: center;
    flex-direction: column;
}
#tg {
    position: absolute;
    top: ${308}px;
    left: ${89}px;
    width: 45px;
}
#lb {
    position: absolute;
    top: ${308}px;
    left: ${142}px;
    width: 14px;
    height: 28px;
    display: flex;
    justify-content: center;
    flex-direction: column;
}
#tb {
    position: absolute;
    top: ${308}px;
    left: ${156}px;
    width: 45px;
}
#oc {
    position: absolute;
    top: 280px;
    left: ${236}px;
    width: ${48}px;
    height: ${48}px;
}
#nc {
    position: absolute;
    top: 280px;
    left: ${284}px;
    width: ${48}px;
    height: ${48}px;
}
`);class v extends t{constructor(n){super(n),this.h=new g(0,{min:0,max:360,step:1}),this.s=new g(0,{min:0,max:100,step:1}),this.v=new g(0,{min:0,max:100,step:1}),this.r=new g(0,{min:0,max:255,step:1}),this.g=new g(0,{min:0,max:255,step:1}),this.b=new g(0,{min:0,max:255,step:1}),this.block=!1,this.hsCaret=p(),this.oldColor=e(),this.newColor=e(),this.rgbChanged=this.rgbChanged.bind(this),this.hsvChanged=this.hsvChanged.bind(this),this.attachShadow({mode:"open"});const s=document.createElement("canvas");let a;s.id="canvas",s.width=256,s.height=256,this.drawHueSaturation(s),this.hsCaret.id="hsv",this.s.modified.add(this.hsvChanged),this.h.modified.add(this.hsvChanged),this.v.modified.add(this.hsvChanged),this.r.modified.add(this.rgbChanged),this.g.modified.add(this.rgbChanged),this.b.modified.add(this.rgbChanged),this.hsCaret.onpointerdown=n=>{a=1,this.hsCaret.setPointerCapture(n.pointerId),n.preventDefault()},this.hsCaret.onpointermove=n=>{if(void 0===a)return;n.preventDefault();const t=s.getBoundingClientRect();let p=n.clientX-t.x,e=n.clientY-t.y;p-=128,e-=128,p<=-128&&(p=-128),p>128&&(p=128),e<=-128&&(e=-128),e>128&&(e=128);let o=Math.hypot(p,e);o>128&&(o=128);const l=(Math.atan2(e,p)+Math.PI)/(2*Math.PI)*360;this.h.value=l,this.s.value=100*o/128},this.hsCaret.onpointerup=()=>{a=void 0},this.oldColor.id="oc",this.newColor.id="nc";const t=e(o("H")),l=e(o("S")),c=e(o("V")),i=e(o("R")),u=e(o("G")),d=e(o("B"));t.id="lh",l.id="ls",c.id="lv",i.id="lr",u.id="lg",d.id="lb";const h=new k({model:this.h,id:"th"}),m=new k({model:this.s,id:"ts"}),v=new k({model:this.v,id:"tv"}),b=new k({model:this.r,id:"tr"}),f=new k({model:this.g,id:"tg"}),w=new k({model:this.b,id:"tb"}),C=new r({orientation:"vertical",minColor:"#000",maxColor:"#fff",id:"sv",model:this.v}),y=new r({orientation:"vertical",minColor:"#000",maxColor:"#f00",id:"sr",model:this.r}),M=new r({orientation:"vertical",minColor:"#000",maxColor:"#0f0",id:"sg",model:this.g}),S=new r({orientation:"vertical",minColor:"#000",maxColor:"#00f",id:"sb",model:this.b}),$=e();$.id="root",this.shadowRoot.adoptedStyleSheets=[x],$.replaceChildren(s,C,y,M,S,t,l,c,i,u,d,h,m,v,b,f,w,this.oldColor,this.newColor,this.hsCaret),this.shadowRoot.appendChild($)}updateModel(){if(!this.model)return;const n={r:this.r.value,g:this.g.value,b:this.b.value};this.model.value=n}updateView(){if(!this.model)return;this.block=!0;const n=this.model.value;""===this.oldColor.style.backgroundColor&&(this.oldColor.style.backgroundColor=`rgb(${n.r},${n.g},${n.b})`),this.r.value=n.r,this.g.value=n.g,this.b.value=n.b,this.block=!1,this.rgbChanged()}hsvChanged(){if(this.block)return;const n=d(this.h.value,this.s.value/100,this.v.value/100);this.block=!0,this.r.value=255*n.r,this.g.value=255*n.g,this.b.value=255*n.b,this.placeHSV(),this.updateModel(),this.block=!1}rgbChanged(){if(this.block)return;const n=h(this.r.value/255,this.g.value/255,this.b.value/255);this.block=!0,this.h.value=n.h,this.s.value=100*n.s,this.v.value=100*n.v,this.placeHSV(),this.updateModel(),this.block=!1}placeHSV(){const n=this.h.value/360*2*Math.PI-Math.PI,s=this.s.value/100*128;let a=Math.round(s*Math.cos(n))+8+128,t=Math.round(s*Math.sin(n))+8+128;this.hsCaret.style.left=`${a}px`,this.hsCaret.style.top=`${t}px`;const p=d(this.h.value,this.s.value/100,1);this.hsCaret.style.backgroundColor=`rgb(${255*p.r}, ${255*p.g}, ${255*p.b})`,this.newColor.style.backgroundColor=`rgb(${this.r.value}, ${this.g.value}, ${this.b.value})`}drawHueSaturation(n){const s=n.getContext("2d"),a=s.createImageData(256,256);for(let n=0,s=-1;n<256;++n,s+=2/255)for(let t=0,p=-1;t<256;++t,p+=2/255){let e=Math.hypot(p,s);if(e<=1){const{r:o,g:l,b:c}=d((Math.atan2(s,p)+Math.PI)/(2*Math.PI)*360,e,1),i=4*(t+n*a.width);a.data[i]=Math.round(255*o),a.data[i+1]=Math.round(255*l),a.data[i+2]=Math.round(255*c),a.data[i+3]=255}}s.putImageData(a,0,0)}}v.define("tx-color",v);let b=new n(42,{min:0,max:99}),f=new g(42,{min:0,max:99});const w=new n(42,{min:0,max:99}),C=new n(83,{min:0,max:99,enabled:!1}),y=new class extends s{constructor(n,s){if("string"==typeof n){let s=u(n);if(void 0===s)throw Error(`failed to parse color '${n}'`);n=s}super(Object.assign({},n),s)}set value(n){if("string"==typeof n){let s=u(n);if(void 0===s)throw Error(`failed to parse color '${n}'`);n=s}this._value!=n&&(this._value.r=n.r,this._value.g=n.g,this._value.b=n.b,this.modified.trigger(this._value))}get value(){return this._value}}({r:255,g:128,b:0});var M=()=>l(i,{children:[c("h1",{children:"Number"}),c("h3",{children:"<Text> & <Slider> with NumberModel"}),l("div",{class:"section",children:[c(k,{model:b}),c(r,{model:b})]}),c("h3",{children:"<Text> & <Slider> with FixedNumberModel"}),l("div",{class:"section",children:[c(k,{model:f}),c(r,{model:f})]}),c("h3",{children:"<Slider>"}),c("div",{class:"section",children:l("div",{style:{width:"200px"},children:[c(r,{model:w}),c(r,{model:w,minColor:"#00f",maxColor:"#f00"}),c(r,{model:C})]})}),c("h3",{children:'<Slider orientation="vertical">'}),l("div",{class:"section",style:{height:"200px"},children:[c(r,{model:w,orientation:"vertical"}),c(r,{model:w,minColor:"#00f",maxColor:"#f00",orientation:"vertical"}),c(r,{model:C,orientation:"vertical"})]}),c("h3",{children:"<ColorSelector>"}),c("div",{class:"section",children:c(v,{model:y})}),m]});export{M as default};
