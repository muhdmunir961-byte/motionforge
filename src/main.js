import './style.css';
const app=document.querySelector('#app');
let layers=[{id:1,type:'text',text:'MOVE WITH INTENT',x:50,y:45,color:'#e7d5ba',size:28},{id:2,type:'shape',text:'',x:50,y:65,color:'#c69a70',size:55}];
let selected=1,frame=0,playing=false,keys={},duration=150,drag=null;
const uid=()=>Math.max(0,...layers.map(x=>x.id))+1;
function view(){app.innerHTML=`
<header><div class="logo">M<span>•</span>F <small>ATELIER</small></div><div class="headRight"><span class="pill">PROJECT 001</span><button id="save">SAVE</button></div></header>
<div class="sectionHead"><span>COMPOSITION</span><span>1080 × 1920 / 30 FPS</span></div>
<section class="stage"><div class="canvas" id="canvas">${layers.map(l=>`<div class="object ${l.id===selected?'selected':''}" data-id="${l.id}" style="left:${l.x}%;top:${l.y}%;color:${l.color};font-size:${l.size}px">${l.type==='text'?escapeHtml(l.text):'<div class="vector" style="width:80px;height:80px;background:'+l.color+'"></div>'}</div>`).join('')}</div></section>
<div class="transport"><button id="back">◀◀</button><button id="play">${playing?'Ⅱ':'▶'}</button><button id="next">▶▶</button><span id="clock">${(frame/30).toFixed(2)}s</span><span class="frames">${frame} / ${duration}</span></div>
<section class="timeline"><div class="row"><span>TIMELINE</span><button id="key">+ KEYFRAME</button></div><input id="scrub" aria-label="Timeline position" type="range" min="0" max="${duration}" value="${frame}"><div id="tracks">${[...layers].reverse().map(l=>`<button class="track ${l.id===selected?'active':''}" data-layer="${l.id}"><b>${l.type==='text'?'T':'◇'}</b><span>${l.type==='text'?escapeHtml(l.text.slice(0,20)):'Vector shape'}</span><i>${Object.keys(keys[l.id]||{}).length} ◆</i></button>`).join('')}</div></section>
<section class="tools"><div class="row"><span>TOOLS / INSPECTOR</span><span class="muted">LAYER ${selected}</span></div><div class="toolrow"><button id="text">+ TEXT</button><button id="shape">+ SHAPE</button><button id="duplicate">DUPLICATE</button><button id="remove">DELETE</button></div><div id="inspector"></div></section><footer>MotionForge Studio · Rust + Tauri · Experimental preview</footer>`;
document.querySelectorAll('[data-id]').forEach(el=>el.onclick=()=>{selected=+el.dataset.id;view()});
document.querySelectorAll('[data-layer]').forEach(el=>el.onclick=()=>{selected=+el.dataset.layer;view()});
document.querySelector('#text').onclick=()=>{selected=uid();layers.push({id:selected,type:'text',text:'NEW TITLE',x:50,y:50,color:'#f1ddbe',size:24});view()};
document.querySelector('#shape').onclick=()=>{selected=uid();layers.push({id:selected,type:'shape',text:'',x:50,y:50,color:'#c69a70',size:40});view()};
document.querySelector('#duplicate').onclick=()=>{let l=layers.find(x=>x.id===selected);if(l){selected=uid();layers.push({...l,id:selected,x:l.x+5,y:l.y+5});view()}};
document.querySelector('#remove').onclick=()=>{layers=layers.filter(x=>x.id!==selected);selected=layers[0]?.id||0;view()};
document.querySelector('#scrub').oninput=e=>{frame=+e.target.value;applyKeys();view()};
document.querySelector('#key').onclick=()=>{const l=layers.find(x=>x.id===selected);if(!l)return;(keys[l.id]??={})[frame]={x:l.x,y:l.y,size:l.size};view()};
document.querySelector('#back').onclick=()=>{frame=0;applyKeys();view()};
document.querySelector('#next').onclick=()=>{frame=duration;applyKeys();view()};
document.querySelector('#play').onclick=()=>{playing=!playing;view()};
document.querySelector('#save').onclick=()=>{const blob=new Blob([JSON.stringify({layers,keys,duration},null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='motionforge-project.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)};
const l=layers.find(x=>x.id===selected);if(l){const inspect=document.querySelector('#inspector');inspect.innerHTML=`${l.type==='text'?'<label>TEXT <input id="txt" type="text"></label>':''}<div class="fields"><label>X POSITION <input id="x" type="range" min="0" max="100" value="${l.x}"></label><label>Y POSITION <input id="y" type="range" min="0" max="100" value="${l.y}"></label><label>SIZE <input id="size" type="range" min="8" max="130" value="${l.size}"></label><label>COLOR <input id="color" type="color" value="${l.color}"></label></div>`;if(l.type==='text'){document.querySelector('#txt').value=l.text;document.querySelector('#txt').onchange=e=>{l.text=e.target.value;view()}};['x','y','size','color'].forEach(k=>document.querySelector('#'+k).oninput=e=>{l[k]=k==='color'?e.target.value:Number(e.target.value);view()})}
const canvas=document.querySelector('#canvas');canvas.addEventListener('pointerdown',e=>{const target=e.target.closest('[data-id]');if(target){selected=+target.dataset.id;drag=selected;canvas.setPointerCapture(e.pointerId)}});canvas.addEventListener('pointermove',e=>{if(!drag)return;const rect=canvas.getBoundingClientRect(),l=layers.find(x=>x.id===drag);if(l){l.x=Math.max(0,Math.min(100,(e.clientX-rect.left)/rect.width*100));l.y=Math.max(0,Math.min(100,(e.clientY-rect.top)/rect.height*100));const el=canvas.querySelector('[data-id="'+drag+'"]');if(el){el.style.left=l.x+'%';el.style.top=l.y+'%'}}});canvas.addEventListener('pointerup',()=>{if(drag){drag=null;view()}});
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function applyKeys(){for(const l of layers){let k=keys[l.id];if(!k)continue;let times=Object.keys(k).map(Number).sort((a,b)=>a-b);if(!times.length)continue;let a=times.filter(t=>t<=frame).at(-1)??times[0],b=times.find(t=>t>=frame)??times.at(-1);for(const prop of ['x','y','size']){const u=a===b?0:(frame-a)/(b-a);l[prop]=k[a][prop]*(1-u)+k[b][prop]*u}}}
setInterval(()=>{if(playing){frame=(frame+1)%(duration+1);applyKeys();view()}},1000/30);view();
