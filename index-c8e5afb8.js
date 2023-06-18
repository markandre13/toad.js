import{j as n,a,F as s,T as t,H as p}from"./main.js";import{T as o,b as e,c}from"./TableTool-8f68368a.js";const l=document.createElement("pre");l.className="language-tsx",l.innerHTML='\n<span class="token keyword">import</span> <span class="token punctuation">{</span> HtmlModel<span class="token punctuation">,</span> Text<span class="token punctuation">,</span> TextArea<span class="token punctuation">,</span> TextModel<span class="token punctuation">,</span> TextTool <span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">"@toad"</span>\n\n<span class="token comment">//</span>\n<span class="token comment">// Application Layer</span>\n<span class="token comment">//</span>\n\n<span class="token keyword">const</span> hello <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">TextModel</span><span class="token punctuation">(</span><span class="token string">"hello"</span><span class="token punctuation">)</span>\n\n<span class="token keyword">const</span> markup <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">HtmlModel</span><span class="token punctuation">(</span><span class="token string">"Salt &amp;amp; Pepper"</span><span class="token punctuation">)</span>\nmarkup<span class="token punctuation">.</span>modified<span class="token punctuation">.</span><span class="token function">add</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">{</span>\n    document<span class="token punctuation">.</span><span class="token function">getElementById</span><span class="token punctuation">(</span><span class="token string">"rawhtml"</span><span class="token punctuation">)</span><span class="token operator">!</span><span class="token punctuation">.</span>innerText <span class="token operator">=</span> markup<span class="token punctuation">.</span>value\n<span class="token punctuation">}</span><span class="token punctuation">)</span>\n\n<span class="token comment">//</span>\n<span class="token comment">// View Layer</span>\n<span class="token comment">//</span>\n\n<span class="token keyword">export</span> <span class="token keyword">default</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">(</span>\n    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span></span><span class="token punctuation">></span></span><span class="token plain-text">\n        </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>h2</span><span class="token punctuation">></span></span><span class="token plain-text">TextModel &amp;amp; HtmlModel</span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>h2</span><span class="token punctuation">></span></span><span class="token plain-text">\n\n        </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>h3</span><span class="token punctuation">></span></span><span class="token plain-text">&amp;lt;Text&amp;gt;</span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>h3</span><span class="token punctuation">></span></span><span class="token plain-text">\n        </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">Text</span></span> <span class="token attr-name">model</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span>hello<span class="token punctuation">}</span></span> <span class="token punctuation">/></span></span><span class="token plain-text">\n        </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">Text</span></span> <span class="token attr-name">model</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span>hello<span class="token punctuation">}</span></span> <span class="token punctuation">/></span></span><span class="token plain-text">\n\n        </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>h3</span><span class="token punctuation">></span></span><span class="token plain-text">&amp;lt;TextTool&amp;gt; &amp;amp; &amp;lt;TextArea&amp;gt;</span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>h3</span><span class="token punctuation">></span></span><span class="token plain-text">\n        </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">TextTool</span></span> <span class="token punctuation">/></span></span><span class="token plain-text">\n        </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">TextArea</span></span> <span class="token attr-name">model</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span>markup<span class="token punctuation">}</span></span> <span class="token attr-name">style</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span><span class="token punctuation">{</span> width<span class="token operator">:</span> <span class="token string">"100%"</span> <span class="token punctuation">}</span><span class="token punctuation">}</span></span> <span class="token punctuation">/></span></span><span class="token plain-text">\n        </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>h3</span><span class="token punctuation">></span></span><span class="token plain-text">Raw HTML</span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>h3</span><span class="token punctuation">></span></span><span class="token plain-text">\n        </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>pre</span>\n            <span class="token attr-name">id</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>rawhtml<span class="token punctuation">"</span></span>\n            <span class="token attr-name">style</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span><span class="token punctuation">{</span>\n                margin<span class="token operator">:</span> <span class="token string">"0px"</span><span class="token punctuation">,</span>\n                padding<span class="token operator">:</span> <span class="token string">"10px"</span><span class="token punctuation">,</span>\n                <span class="token comment">// FIXME: border: "solid var(--tx-gray-600) 1px;",</span>\n                borderWidth<span class="token operator">:</span> <span class="token string">"1px"</span><span class="token punctuation">,</span>\n                borderStyle<span class="token operator">:</span> <span class="token string">"solid"</span><span class="token punctuation">,</span>\n                borderColor<span class="token operator">:</span> <span class="token string">"var(--tx-gray-600)"</span><span class="token punctuation">,</span>\n            <span class="token punctuation">}</span><span class="token punctuation">}</span></span>\n        <span class="token punctuation">/></span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span></span><span class="token punctuation">></span></span>\n<span class="token punctuation">)</span>\n';const u=new t("hello"),k=new p("Salt &amp; Pepper");k.modified.add((()=>{document.getElementById("rawhtml").innerText=k.value}));var i=()=>n(s,{children:[a("h2",{children:"TextModel & HtmlModel"}),a("h3",{children:"<Text>"}),a(o,{model:u}),a(o,{model:u}),a("h3",{children:"<TextTool> & <TextArea>"}),a(c,{}),a(e,{model:k,style:{width:"100%"}}),a("h3",{children:"Raw HTML"}),a("pre",{id:"rawhtml",style:{margin:"0px",padding:"10px",borderWidth:"1px",borderStyle:"solid",borderColor:"var(--tx-gray-600)"}}),l]});export{i as default};
