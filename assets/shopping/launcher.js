(function(){
'use strict';
if(document.getElementById('sakShoppingLauncherStyle'))return;
const style=document.createElement('style');style.id='sakShoppingLauncherStyle';style.textContent=`
html body #sakakerAllIconsDock #sakShoppingIcon{position:relative!important;inset:auto!important;flex:0 0 74px!important;width:74px!important;height:80px!important;min-width:0!important;min-height:0!important;margin:0!important;padding:0!important;border:0!important;background:transparent!important;box-shadow:none!important;color:#e2fff3!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;cursor:pointer!important;pointer-events:auto!important;touch-action:manipulation!important;overflow:visible!important;transform:none!important}
#sakShoppingIcon svg{width:58px;height:58px;filter:drop-shadow(0 0 7px #7effd2)}
#sakShoppingIcon small{font:700 10px/1.2 Tahoma,Arial,sans-serif!important;color:#d0ffec;text-align:center;white-space:normal!important;text-shadow:0 0 7px #00dfab}
#sakShoppingIcon:focus-visible{outline:2px solid #ffe399!important;border-radius:10px!important}
@media(max-width:700px){html body #sakakerAllIconsDock #sakShoppingIcon{flex-basis:54px!important;width:54px!important;height:62px!important}#sakShoppingIcon svg{width:43px;height:43px}#sakShoppingIcon small{font-size:8px!important}}
`;document.head.append(style);
let button;
function label(){if(!button)return;const text=document.documentElement.lang==='en'?'Shopping & offers':'التسوق والعروض';button.setAttribute('aria-label',text);button.title=text;button.querySelector('small').textContent=text}
function mount(){const dock=document.getElementById('sakakerAllIconsDock');if(!dock)return false;if(document.getElementById('sakShoppingIcon'))return true;button=document.createElement('button');button.id='sakShoppingIcon';button.type='button';button.setAttribute('aria-haspopup','dialog');button.innerHTML='<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="sakShopMetal" x2="0" y2="1"><stop stop-color="#fff6cc"/><stop offset=".45" stop-color="#d8fff2"/><stop offset="1" stop-color="#559d8b"/></linearGradient></defs><path d="M15 22h34l5 33H10z" fill="url(#sakShopMetal)" stroke="#dfffed" stroke-width="2"/><path d="M23 25V17a9 9 0 0 1 18 0v8" fill="none" stroke="#fff0b7" stroke-width="4"/><path d="m32 30 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" fill="#08725c"/></svg><small></small>';const chess=document.getElementById('sakEmeraldChessIcon');if(chess)chess.after(button);else dock.append(button);label();button.addEventListener('click',async()=>{button.disabled=true;try{const app=await import('/assets/shopping/shop.js?v=20260930-amazon-4');app.openShop()}catch(e){alert(document.documentElement.lang==='en'?'Could not load shopping. Please retry.':'تعذر تحميل التسوق. حاول مرة أخرى.')}finally{button.disabled=false}});return true}
if(!mount()){const observer=new MutationObserver(()=>{if(mount())observer.disconnect()});observer.observe(document.body,{childList:true,subtree:true})}
new MutationObserver(label).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
})();
