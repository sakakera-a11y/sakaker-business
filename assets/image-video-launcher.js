(()=>{
  'use strict';
  const ID='sakBusinessImageVideoLauncher';
  if(document.getElementById(ID)) return;
  const style=document.createElement('style');
  style.id='sakBusinessImageVideoLauncherStyle';
  style.textContent=`
    #${ID}{position:fixed;left:18px;bottom:92px;z-index:2147483000;width:62px;height:62px;border-radius:50%;border:1px solid rgba(255,226,138,.95);background:radial-gradient(circle at 35% 28%,#ffffff 0 7%,#83fff0 8% 18%,#0b817d 42%,#05252a 72%,#020b0e 100%);box-shadow:0 0 12px rgba(109,255,233,.8),0 0 28px rgba(109,255,233,.4),0 0 38px rgba(255,226,138,.2),inset 0 0 14px rgba(255,255,255,.18);display:grid;place-items:center;color:#fff;font-size:28px;cursor:pointer;user-select:none;transition:transform .2s ease,filter .2s ease;animation:sakIvPulse 2.6s ease-in-out infinite}
    #${ID}:hover{transform:translateY(-3px) scale(1.05);filter:brightness(1.14)}
    #${ID}:focus-visible{outline:2px solid #ffe28a;outline-offset:3px}
    #${ID} span{filter:drop-shadow(0 0 6px rgba(255,255,255,.85))}
    @keyframes sakIvPulse{0%,100%{box-shadow:0 0 12px rgba(109,255,233,.72),0 0 25px rgba(109,255,233,.32),0 0 36px rgba(255,226,138,.16),inset 0 0 14px rgba(255,255,255,.16)}50%{box-shadow:0 0 17px rgba(109,255,233,.95),0 0 34px rgba(109,255,233,.5),0 0 44px rgba(255,226,138,.28),inset 0 0 18px rgba(255,255,255,.22)}}
    @media(max-width:600px){#${ID}{width:54px;height:54px;left:12px;bottom:82px;font-size:24px}}
  `;
  document.head.appendChild(style);
  const b=document.createElement('button');
  b.id=ID;b.type='button';b.innerHTML='<span>🎬</span>';
  function label(){return (document.documentElement.lang||'ar').toLowerCase().startsWith('en')?'Image / Audio to Video':'تحويل الصورة / الصوت إلى فيديو'}
  function sync(){const t=label();b.title=t;b.setAttribute('aria-label',t)}
  sync();
  b.addEventListener('click',()=>{location.href='/audio-video.html'});
  document.body.appendChild(b);
  new MutationObserver(sync).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
})();
