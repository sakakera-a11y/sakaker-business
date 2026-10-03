(()=>{
'use strict';
if(document.getElementById('sakVideoReplaceEditor')) return;

const host=document.querySelector('.wrap')||document.body;
const section=document.createElement('section');
section.id='sakVideoReplaceEditor';
section.className='glass';
section.innerHTML=`
<style>
#sakVideoReplaceEditor{margin-top:18px;padding:16px;border-radius:24px}
#sakVideoReplaceEditor h2{margin:0 0 10px;font-size:21px}
#sakVideoReplaceEditor .vre-grid{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(300px,.7fr);gap:16px}
#sakVideoReplaceEditor .vre-stage{aspect-ratio:16/9;background:#000;border:1px solid #57d8d0;border-radius:18px;overflow:hidden}
#sakVideoReplaceEditor canvas{width:100%;height:100%;display:block}
#sakVideoReplaceEditor .vre-control{margin:10px 0}
#sakVideoReplaceEditor label{display:block;font-weight:800;margin-bottom:6px;color:#dffffa}
#sakVideoReplaceEditor input{width:100%;padding:10px;border-radius:12px;border:1px solid rgba(255,255,255,.22);background:rgba(255,255,255,.08);color:#fff}
#sakVideoReplaceEditor .vre-row{display:flex;gap:8px;flex-wrap:wrap}
#sakVideoReplaceEditor button{border:1px solid #bafff0;border-radius:13px;padding:11px 15px;background:linear-gradient(145deg,#0a7f77,#0ca28f);color:#fff;font-weight:900;cursor:pointer}
#sakVideoReplaceEditor button.vre-export{background:linear-gradient(145deg,#765c17,#b08517);border-color:#ffe99e}
#sakVideoReplaceEditor button:disabled{opacity:.45;cursor:not-allowed}
#sakVideoReplaceEditor .vre-note,#sakVideoReplaceEditor .vre-status{font-size:12px;line-height:1.7;color:#d7f4f1;margin-top:8px}
#sakVideoReplaceEditor .vre-status{color:#fff0a6;font-weight:800;min-height:20px}
@media(max-width:860px){#sakVideoReplaceEditor .vre-grid{grid-template-columns:1fr}}
</style>
<div class="vre-grid">
  <div>
    <h2>🎞️ تعديل فيديو موجود</h2>
    <div class="vre-stage"><canvas id="vreCanvas" width="1280" height="720"></canvas></div>
    <div id="vreStatus" class="vre-status">جاهز</div>
  </div>
  <div>
    <div class="vre-control"><label>🎬 ارفع الفيديو الأساسي</label><input id="vreVideo" type="file" accept="video/*,.mp4,.webm,.mov,.m4v"></div>
    <div class="vre-control"><label>🔊 صوت بديل — اختياري</label><input id="vreAudio" type="file" accept="audio/*,.mp3,.m4a,.aac,.wav,.ogg,.flac"></div>
    <div class="vre-control"><label>🖼️ صورة أو صور بديلة للمشاهد — اختياري</label><input id="vreImages" type="file" accept="image/*" multiple></div>
    <div class="vre-row"><button id="vrePreview" type="button">▶ معاينة</button><button id="vreExport" class="vre-export" type="button">⬇ إنشاء الفيديو المعدّل</button></div>
    <div class="vre-note">إذا أضفت صوتًا فقط: يحتفظ الفيديو بمشاهده ويستبدل صوته. إذا أضفت صورة/صور فقط: تستبدل المشاهد وتبقى مدة الفيديو وصوته الأصلي. وإذا أضفت الاثنين معًا: يستبدل الصوت والمشاهد معًا. الصوت البديل يُقص أو يُعاد تلقائيًا حتى يطابق مدة الفيديو.</div>
  </div>
</div>`;
host.appendChild(section);

const videoInput=section.querySelector('#vreVideo');
const audioInput=section.querySelector('#vreAudio');
const imagesInput=section.querySelector('#vreImages');
const previewBtn=section.querySelector('#vrePreview');
const exportBtn=section.querySelector('#vreExport');
const status=section.querySelector('#vreStatus');
const canvas=section.querySelector('#vreCanvas');
const ctx=canvas.getContext('2d',{alpha:false});

const video=document.createElement('video');
video.playsInline=true;video.preload='metadata';video.crossOrigin='anonymous';
const audio=document.createElement('audio');audio.preload='metadata';
let videoUrl='',audioUrl='',imageObjs=[],previewRAF=0,previewing=false;

function setStatus(ar,en){status.textContent=(document.documentElement.lang||'ar').startsWith('en')?en:ar;}
function cleanupUrls(){if(videoUrl)URL.revokeObjectURL(videoUrl);if(audioUrl)URL.revokeObjectURL(audioUrl);videoUrl='';audioUrl='';}
function loadMedia(el,file){return new Promise((resolve,reject)=>{const on=()=>{el.removeEventListener('loadedmetadata',on);resolve();};el.addEventListener('loadedmetadata',on,{once:true});el.addEventListener('error',reject,{once:true});el.src=URL.createObjectURL(file);el.load();});}
function loadImages(files){return Promise.all([...files].map(file=>new Promise((resolve,reject)=>{const img=new Image();const u=URL.createObjectURL(file);img.onload=()=>{URL.revokeObjectURL(u);resolve(img)};img.onerror=reject;img.src=u;})));}
function contain(sw,sh,dw,dh){const s=Math.min(dw/sw,dh/sh);return[(dw-sw*s)/2,(dh-sh*s)/2,sw*s,sh*s];}
function drawImageContain(img){ctx.fillStyle='#02070d';ctx.fillRect(0,0,canvas.width,canvas.height);const [x,y,w,h]=contain(img.width,img.height,canvas.width,canvas.height);ctx.drawImage(img,x,y,w,h);}
function drawVideo(){ctx.fillStyle='#02070d';ctx.fillRect(0,0,canvas.width,canvas.height);if(video.videoWidth&&video.videoHeight){const [x,y,w,h]=contain(video.videoWidth,video.videoHeight,canvas.width,canvas.height);ctx.drawImage(video,x,y,w,h);}}
function drawAt(t){if(imageObjs.length){const duration=Math.max(video.duration||1,.1);const idx=Math.min(imageObjs.length-1,Math.floor((t/duration)*imageObjs.length));drawImageContain(imageObjs[idx]);}else drawVideo();}
async function ensureReady(){const vf=videoInput.files?.[0];if(!vf){setStatus('اختر فيديو أولًا','Choose a video first');return false;}if(!video.src){videoUrl=URL.createObjectURL(vf);video.src=videoUrl;video.load();await new Promise((r,j)=>{video.onloadedmetadata=r;video.onerror=j;});}
if(audioInput.files?.[0]&&!audio.src){audioUrl=URL.createObjectURL(audioInput.files[0]);audio.src=audioUrl;audio.load();await new Promise((r,j)=>{audio.onloadedmetadata=r;audio.onerror=j;});}
if(imagesInput.files?.length&&!imageObjs.length)imageObjs=await loadImages(imagesInput.files);
return true;}
function stopPreview(){previewing=false;cancelAnimationFrame(previewRAF);video.pause();audio.pause();}
function loopPreview(){if(!previewing)return;drawAt(video.currentTime||0);if(video.ended){stopPreview();setStatus('انتهت المعاينة','Preview finished');return;}previewRAF=requestAnimationFrame(loopPreview);}
videoInput.addEventListener('change',()=>{stopPreview();cleanupUrls();video.removeAttribute('src');video.load();audio.removeAttribute('src');audio.load();imageObjs=[];setStatus('تم اختيار الفيديو','Video selected');});
audioInput.addEventListener('change',()=>{if(audioUrl)URL.revokeObjectURL(audioUrl);audioUrl='';audio.removeAttribute('src');audio.load();setStatus('تم اختيار الصوت البديل','Replacement audio selected');});
imagesInput.addEventListener('change',()=>{imageObjs=[];setStatus('تم اختيار صور بديلة للمشاهد','Replacement images selected');});
previewBtn.addEventListener('click',async()=>{try{stopPreview();if(!await ensureReady())return;video.currentTime=0;video.muted=!!audioInput.files?.[0];if(audioInput.files?.[0]){audio.currentTime=0;audio.loop=true;await Promise.all([video.play(),audio.play()]);}else await video.play();previewing=true;loopPreview();setStatus('جارٍ عرض المعاينة…','Previewing…');}catch(e){setStatus('تعذر تشغيل المعاينة على هذا المتصفح','Preview could not start in this browser');}});

function bestMime(){const types=['video/mp4;codecs=h264,aac','video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'];return types.find(t=>window.MediaRecorder&&MediaRecorder.isTypeSupported(t))||'';}
function download(blob){const ext=blob.type.includes('mp4')?'mp4':'webm';const u=URL.createObjectURL(blob);const a=document.createElement('a');a.href=u;a.download='sakaker-business-edited-video.'+ext;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),5000);}

exportBtn.addEventListener('click',async()=>{let ac,source,dest,recorder,raf;try{stopPreview();if(!await ensureReady())return;exportBtn.disabled=true;previewBtn.disabled=true;setStatus('جارٍ إنشاء الفيديو… أبقِ الصفحة مفتوحة','Creating video… keep this tab open');
video.currentTime=0;video.muted=false;
const audioEl=audioInput.files?.[0]?audio:video;
if(audioInput.files?.[0]){audio.currentTime=0;audio.loop=true;}
ac=new (window.AudioContext||window.webkitAudioContext)();dest=ac.createMediaStreamDestination();source=ac.createMediaElementSource(audioEl);source.connect(dest);
const stream=canvas.captureStream(30);dest.stream.getAudioTracks().forEach(t=>stream.addTrack(t));
const mime=bestMime();recorder=new MediaRecorder(stream,mime?{mimeType:mime,videoBitsPerSecond:6000000}:undefined);const chunks=[];recorder.ondataavailable=e=>{if(e.data&&e.data.size)chunks.push(e.data)};
const done=new Promise(resolve=>recorder.onstop=()=>resolve(new Blob(chunks,{type:recorder.mimeType||mime||'video/webm'})));
recorder.start(1000);await ac.resume();
if(audioInput.files?.[0]){video.muted=true;await Promise.all([video.play(),audio.play()]);}else{video.muted=false;await video.play();}
const start=performance.now();const duration=video.duration||0;
await new Promise(resolve=>{const frame=()=>{drawAt(video.currentTime||0);if(video.ended||(duration&&video.currentTime>=duration-.03)){resolve();return;}raf=requestAnimationFrame(frame);};frame();});
cancelAnimationFrame(raf);video.pause();audio.pause();recorder.stop();const blob=await done;download(blob);setStatus('تم تجهيز الفيديو المعدّل','Edited video is ready');
}catch(e){console.error(e);setStatus('حدث خطأ أثناء إنشاء الفيديو. جرّب Chrome أو Edge','Video creation failed. Try Chrome or Edge');try{recorder&&recorder.state!=='inactive'&&recorder.stop()}catch(_){}}
finally{video.pause();audio.pause();if(ac)try{await ac.close()}catch(_){ }exportBtn.disabled=false;previewBtn.disabled=false;}});

window.addEventListener('beforeunload',cleanupUrls);
})();