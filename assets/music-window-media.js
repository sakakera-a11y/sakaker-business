(()=>{'use strict';
const STYLE_ID='sak-music-window-media-style-v2';
const SECTION_ID='sakMusicLocalMedia';
let currentURL='';
function en(){return document.documentElement.lang==='en';}
function ensureStyle(){
 let s=document.getElementById(STYLE_ID);if(s)return;
 s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
html body #emeraldMusicHost #emPanel,
html body #emeraldMusicHost #emPanel>.emModal,
html body #emeraldMusicHost #emPanel .emModal,
html body #emeraldMusicHost #emPanel .emBox{
 background:transparent!important;background-image:none!important;
 backdrop-filter:none!important;-webkit-backdrop-filter:none!important;
 box-shadow:none!important;border-color:transparent!important;
}
html body #emeraldMusicHost #emPanel::before,
html body #emeraldMusicHost #emPanel::after,
html body #emeraldMusicHost #emPanel .emModal::before,
html body #emeraldMusicHost #emPanel .emModal::after{content:none!important;display:none!important;background:none!important;box-shadow:none!important;}
html body #emeraldMusicHost #${SECTION_ID}{order:4!important;display:block!important;visibility:visible!important;opacity:1!important;position:relative!important;z-index:20!important;width:100%!important;max-width:100%!important;box-sizing:border-box!important;margin:12px 0 4px!important;padding:12px!important;border:1px solid rgba(109,255,233,.55)!important;border-radius:16px!important;background:rgba(0,0,0,.14)!important;color:#fff!important;}
#${SECTION_ID} h3{margin:0 0 9px!important;font-size:15px!important;color:#eafffb!important;}
#${SECTION_ID} .sak-local-row{display:flex!important;gap:8px!important;flex-wrap:wrap!important;align-items:center!important;}
#${SECTION_ID} input[type=file]{display:block!important;visibility:visible!important;opacity:1!important;width:100%!important;max-width:100%!important;color:#fff!important;}
#${SECTION_ID} audio,#${SECTION_ID} video{display:block;width:100%!important;max-width:100%!important;margin-top:10px!important;border-radius:12px!important;background:#000!important;}
#${SECTION_ID} audio[hidden],#${SECTION_ID} video[hidden]{display:none!important;}
#${SECTION_ID} video{max-height:44vh!important;object-fit:contain!important;}
#${SECTION_ID} .sak-local-help{margin:8px 0 0!important;font-size:11px!important;line-height:1.6!important;color:#d2ece8!important;}
@media(max-width:700px){#${SECTION_ID}{padding:9px!important;border-radius:12px!important;}#${SECTION_ID} video{max-height:34vh!important;}}
`;
 document.head.append(s);
}
function hardTransparent(panel){
 [panel,panel.querySelector(':scope > .emModal'),panel.querySelector('.emModal'),panel.querySelector('.emBox')].filter(Boolean).forEach(el=>{
  el.style.setProperty('background','transparent','important');
  el.style.setProperty('background-image','none','important');
  el.style.setProperty('backdrop-filter','none','important');
  el.style.setProperty('-webkit-backdrop-filter','none','important');
  el.style.setProperty('box-shadow','none','important');
 });
}
function setLabels(section){
 const title=section.querySelector('[data-role=title]'),help=section.querySelector('[data-role=help]'),input=section.querySelector('input');
 if(title)title.textContent=en()?'🎧 Upload audio or video to listen/watch':'🎧 رفع صوت أو فيديو للاستماع أو المشاهدة';
 if(help)help.textContent=en()?'Choose an audio or video file. It stays on your device and is not uploaded.':'اختر ملف صوت أو فيديو من جهازك. يظهر هنا مباشرة للاستماع أو المشاهدة ولا يتم رفعه إلى الموقع.';
 if(input)input.setAttribute('aria-label',en()?'Choose audio or video':'اختر صوتًا أو فيديو');
}
function placeSection(panel,section){
 const recordRow=panel.querySelector('.emRow:has(#emCamRec)');
 const crystal=panel.querySelector('#emCrystalSettings');
 const box=panel.querySelector('.emBox');
 if(crystal&&crystal.parentElement){crystal.insertAdjacentElement('afterend',section);return;}
 if(recordRow&&recordRow.parentElement){recordRow.insertAdjacentElement('afterend',section);return;}
 if(box)box.append(section);
}
function install(){
 ensureStyle();
 const panel=document.getElementById('emPanel');if(!panel)return;
 hardTransparent(panel);
 let section=panel.querySelector('#'+SECTION_ID);
 if(!section){
  section=document.createElement('section');section.id=SECTION_ID;
  section.innerHTML='<h3 data-role="title"></h3><div class="sak-local-row"><input id="sakMusicLocalFile" type="file" accept="audio/*,video/*,.mp3,.m4a,.aac,.wav,.ogg,.flac,.mp4,.webm,.mov,.mkv"></div><audio id="sakMusicLocalAudio" controls hidden></audio><video id="sakMusicLocalVideo" controls playsinline hidden></video><p class="sak-local-help" data-role="help"></p>';
  placeSection(panel,section);
  const input=section.querySelector('#sakMusicLocalFile'),audio=section.querySelector('#sakMusicLocalAudio'),video=section.querySelector('#sakMusicLocalVideo');
  input.addEventListener('change',()=>{
   const file=input.files&&input.files[0];audio.pause();video.pause();audio.hidden=true;video.hidden=true;
   if(currentURL){URL.revokeObjectURL(currentURL);currentURL='';}
   if(!file)return;currentURL=URL.createObjectURL(file);
   if(file.type.startsWith('video/')){video.src=currentURL;video.hidden=false;video.load();}
   else{audio.src=currentURL;audio.hidden=false;audio.load();}
  });
 }
 setLabels(section);
}
let queued=false;function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;install();});}
const observer=new MutationObserver(schedule);observer.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['lang','style','class']});
document.addEventListener('click',e=>{if(e.target.closest('#emOpenBtn'))setTimeout(install,0);},true);
window.addEventListener('pagehide',()=>{if(currentURL)URL.revokeObjectURL(currentURL);observer.disconnect();});
install();
})();