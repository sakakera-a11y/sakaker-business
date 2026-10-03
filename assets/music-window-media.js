(()=>{'use strict';
const STYLE_ID='sak-music-window-media-style';
const SECTION_ID='sakMusicLocalMedia';
let currentURL='';
function en(){return document.documentElement.lang==='en';}
function ensureStyle(){
 if(document.getElementById(STYLE_ID))return;
 const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
html body #emeraldMusicHost #emPanel,
html body #emeraldMusicHost #emPanel>.emModal,
html body #emeraldMusicHost #emPanel .emModal,
html body #emeraldMusicHost #emPanel .emBox{
 background:transparent!important;
 background-image:none!important;
 backdrop-filter:none!important;
 -webkit-backdrop-filter:none!important;
 box-shadow:none!important;
}
html body #emeraldMusicHost #emPanel::before,
html body #emeraldMusicHost #emPanel::after,
html body #emeraldMusicHost #emPanel .emModal::before,
html body #emeraldMusicHost #emPanel .emModal::after{background:none!important;box-shadow:none!important;backdrop-filter:none!important;}
#${SECTION_ID}{margin-top:12px;padding:12px;border:1px solid rgba(109,255,233,.45);border-radius:16px;background:rgba(0,0,0,.16);}
#${SECTION_ID} h3{margin:0 0 9px;font-size:15px;color:#eafffb;}
#${SECTION_ID} .sak-local-row{display:flex;gap:8px;flex-wrap:wrap;align-items:center;}
#${SECTION_ID} input[type=file]{max-width:100%;color:#fff;}
#${SECTION_ID} audio,#${SECTION_ID} video{display:block;width:100%;max-width:100%;margin-top:10px;border-radius:12px;background:#000;}
#${SECTION_ID} video{max-height:44vh;object-fit:contain;}
#${SECTION_ID} .sak-local-help{margin:8px 0 0;font-size:11px;line-height:1.6;color:#d2ece8;}
@media(max-width:700px){#${SECTION_ID}{padding:9px;border-radius:12px;}#${SECTION_ID} video{max-height:34vh;}}
`;
 document.head.append(s);
}
function setLabels(section){
 const title=section.querySelector('[data-role=title]');
 const help=section.querySelector('[data-role=help]');
 const input=section.querySelector('input');
 if(title)title.textContent=en()?'🎧 Listen or watch a local file':'🎧 استماع أو مشاهدة ملف من جهازك';
 if(help)help.textContent=en()?'Choose an audio or video file. It stays on your device and is not uploaded.':'اختر ملف صوت أو فيديو للاستماع أو المشاهدة. يبقى الملف على جهازك ولا يتم رفعه للموقع.';
 if(input)input.setAttribute('aria-label',en()?'Choose audio or video':'اختر صوتًا أو فيديو');
}
function install(){
 ensureStyle();
 const panel=document.getElementById('emPanel');if(!panel)return;
 if(panel.querySelector('#'+SECTION_ID))return;
 const anchor=panel.querySelector('#emCrystalSettings')||panel.querySelector('.emBox');if(!anchor)return;
 const section=document.createElement('section');section.id=SECTION_ID;
 section.innerHTML='<h3 data-role="title"></h3><div class="sak-local-row"><input id="sakMusicLocalFile" type="file" accept="audio/*,video/*,.mp3,.m4a,.aac,.wav,.ogg,.flac,.mp4,.webm,.mov,.mkv"></div><audio id="sakMusicLocalAudio" controls hidden></audio><video id="sakMusicLocalVideo" controls playsinline hidden></video><p class="sak-local-help" data-role="help"></p>';
 if(anchor.id==='emCrystalSettings')anchor.insertAdjacentElement('afterend',section);else anchor.append(section);
 const input=section.querySelector('#sakMusicLocalFile'),audio=section.querySelector('#sakMusicLocalAudio'),video=section.querySelector('#sakMusicLocalVideo');
 input.addEventListener('change',()=>{
  const file=input.files&&input.files[0];
  audio.pause();video.pause();audio.hidden=true;video.hidden=true;
  if(currentURL){URL.revokeObjectURL(currentURL);currentURL='';}
  if(!file)return;
  currentURL=URL.createObjectURL(file);
  if(file.type.startsWith('video/')){video.src=currentURL;video.hidden=false;video.load();}
  else{audio.src=currentURL;audio.hidden=false;audio.load();}
 });
 setLabels(section);
}
const observer=new MutationObserver(()=>install());observer.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['lang']});
window.addEventListener('pagehide',()=>{if(currentURL)URL.revokeObjectURL(currentURL);observer.disconnect();});
install();
})();