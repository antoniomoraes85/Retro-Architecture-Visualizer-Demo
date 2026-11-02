/* Ciência Atratora | Retro Architecture Visualizer MVP 0.1
 * Exibição didática e arquivos importados; NÃO vincula automaticamente Assembly a gameplay real.
 */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const {parseCSV,parseTrace,lastAtOrBefore,timeToFrame,classifyData}=RAVCore;
const canvas=$('stage'),ctx=canvas.getContext('2d'),video=$('sourceVideo');
const W=1600,H=900,K=1.2;
const col={bg:'#071322',panel:'#101f31',edge:'#2c4e63',cyan:'#35d9ff',amber:'#ffca6f',white:'#e8f4fb',muted:'#88a9ba',green:'#7debba',red:'#ff8585'};
const state={t:0,duration:8,playing:false,video:false,telemetry:null,trace:null,traceIndex:null,fps:60,offset:0,lastMs:0,url:null,recorder:null,recordStart:0};
const demoASM=[
 {pc:'$008000',asm:'LDA $4218',note:'Exemplo fictício de consulta ao controle'},
 {pc:'$008004',asm:'AND #$0080',note:'Exemplo fictício de teste de bit'},
 {pc:'$008007',asm:'BEQ $8012',note:'Desvio condicional didático'},
 {pc:'$00800A',asm:'LDA #$D0',note:'Velocidade inicial ilustrativa'},
 {pc:'$00800C',asm:'STA $007D',note:'Escrita didática na memória'},
 {pc:'$008012',asm:'CLC',note:'Limpa carry'},
 {pc:'$008013',asm:'ADC #$02',note:'Soma didática'},
 {pc:'$008015',asm:'STA $007D',note:'Escrita ilustrativa'}
];
const clamp=n=>Math.max(0,Math.min(1,n));
function demoRow(frame){
 const phase=((frame%150)+150)%150,air=phase<60;
 const vy=air?Math.round(-14+phase*.47):0;
 const y=air?Math.round(178-14*phase+.235*phase*phase):178;
 return{frame,x:Math.round(30+frame*1.8),y,vx:air?2:1,vy};
}
function status(s){$('status').textContent=s;}
function updateStatus(){status(classifyData(state.video,!!state.telemetry,!!state.trace)+' · '+(state.telemetry?.length||0)+' registros de memória; '+(state.trace?.length||0)+' eventos Assembly. Origem e sincronização não verificadas.');}
function rect(x,y,w,h,r=14,fill=col.panel,stroke=col.edge){
 ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=fill;ctx.fill();
 if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1.5;ctx.stroke();}
}
function txt(s,x,y,size=18,color=col.white,bold=false,font='Inter, Segoe UI, Arial'){
 ctx.fillStyle=color;ctx.font=(bold?'700':'400')+' '+size+'px '+font;ctx.fillText(String(s),x,y);
}
function line(x,y,x2,y2,color=col.edge,width=2){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x2,y2);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();}
function tag(s,x,y){txt(s,x,y,13,col.amber,true);}
function fmt(v){return Number.isFinite(v)?(v>=0?'+':'')+v:'—';}
function currentFrame(){return timeToFrame(state.t,state.telemetry?.[0]?.frame||0,state.fps,state.offset);}
function rowFor(frame){return state.telemetry?(lastAtOrBefore(state.telemetry,frame)||{frame,x:0,y:0,vx:0,vy:0}):demoRow(frame);}
function recordsFor(frame){return state.traceIndex?.get(frame)||[];}
function drawGame(frame,row){
 rect(24,108,945,470);tag('01  GAMEPLAY / ESTADO OBSERVADO',44,138);
 txt(state.video?'VÍDEO IMPORTADO':'DEMONSTRAÇÃO VISUAL ORIGINAL',705,138,11,col.muted,true);
 const x=42,y=157,w=909,h=322;
 rect(x,y,w,h,8,'#102943',null);
 ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();
 if(state.video&&video.readyState>=2){
   const rw=video.videoWidth,rh=video.videoHeight;
   if(rw&&rh){const s=Math.min(w/rw,h/rh),vw=rw*s,vh=rh*s;ctx.drawImage(video,x+(w-vw)/2,y+(h-vh)/2,vw,vh);}
 }else{
   const sky=ctx.createLinearGradient(x,y,x,y+h);sky.addColorStop(0,'#18365d');sky.addColorStop(1,'#39808c');ctx.fillStyle=sky;ctx.fillRect(x,y,w,h);
   for(let k=0;k<9;k++){const cx=x+((k*193-frame*.22)%1050+1050)%1050-40;ctx.fillStyle='#6ba9aa';ctx.beginPath();ctx.ellipse(cx,y+232,90,90,0,Math.PI,2*Math.PI);ctx.fill();}
   for(let k=0;k<11;k++){const cx=x+((k*116-frame*.55)%1020+1020)%1020-30;ctx.fillStyle='#254e69';ctx.fillRect(cx,y+210,24,90);ctx.fillStyle='#377e91';ctx.fillRect(cx-8,y+195,40,24);}
   ctx.fillStyle='#3b6c61';ctx.fillRect(x,y+274,w,48);ctx.fillStyle='#5cab8c';ctx.fillRect(x,y+270,w,9);
   for(let k=0;k<19;k++){ctx.fillStyle=k%2?'#284d49':'#275c59';ctx.fillRect(x+k*48,y+287,46,35);}
   const px=x+96+((frame*1.5)%700),height=Math.max(0,178-row.y),py=y+236-Math.min(200,height*.9);
   ctx.shadowBlur=18;ctx.shadowColor='#ffd26d';ctx.fillStyle='#ffcd70';ctx.fillRect(px-12,py-20,26,30);ctx.shadowBlur=0;
   ctx.fillStyle='#273f53';ctx.fillRect(px-14,py-28,30,7);ctx.fillRect(px-8,py+10,8,10);ctx.fillRect(px+6,py+10,8,10);
   ctx.fillStyle='#fff0cc';ctx.fillRect(px+7,py-14,5,5);
   ctx.fillStyle='#ffc56d';ctx.fillRect(px-21,py-10,8,8);
   ctx.fillStyle='#152f45';ctx.fillRect(px+11,py-10,5,5);
   txt('Personagem geométrico fictício · não é um jogo comercial',x+15,y+23,13,'#d9e8e6');
 }
 ctx.restore();
 rect(44,498,900,62,9,'#0c1b2c','#28455b');
 [['FRAME',frame],['X',row.x],['Y',row.y],['VX',fmt(row.vx)],['VY',fmt(row.vy)]].forEach((p,i)=>{
   const xx=65+i*174;txt(p[0],xx,521,11,col.muted,true);txt(p[1],xx,547,24,i===4?col.amber:col.cyan,true,'Consolas,monospace');
 });
}
function drawCode(frame){
 rect(987,108,588,470);tag('02  ASSEMBLY / CPU 65C816',1008,138);
 const imported=!!state.trace,events=recordsFor(frame),list=imported?events.slice(-7):demoASM;
 txt(imported?'TRACE IMPORTADO':'EXEMPLO FICTÍCIO',1388,138,12,imported?col.green:col.amber,true);
 if(imported&&!list.length){
   txt('Nenhuma instrução registrada',1015,242,21,col.muted,true);
   txt('para o quadro selecionado.',1015,272,18,col.muted);
   txt('Importe JSONL contendo o campo frame.',1015,305,13,col.muted);
 }else{
   const selected=imported?list.length-1:Math.floor(frame/10)%list.length;
   list.forEach((r,i)=>{const y=174+i*38;
     if(i===selected)rect(1007,y-24,548,33,6,'#1a4b60',null);
     txt(i===selected?'▶':' ',1016,y,16,i===selected?col.amber:col.muted,true,'Consolas');
     txt(r.pc||'—',1038,y,16,col.muted,false,'Consolas');
     txt(r.asm,1178,y,17,i===selected?col.white:col.cyan,true,'Consolas');
   });
 }
 line(1008,467,1553,467,'#2d4758');
 const active=imported?(list[list.length-1]||null):demoASM[Math.floor(frame/10)%demoASM.length];
 txt('PC',1010,497,12,col.muted,true);txt(active?.pc||'—',1044,497,17,col.amber,true,'Consolas');
 txt('A',1230,497,12,col.muted,true);txt(imported?(active?.a||'—'):'D0',1250,497,17,col.cyan,true,'Consolas');
 txt('X',1344,497,12,col.muted,true);txt(imported?(active?.x_reg||'—'):'02',1365,497,17,col.cyan,true,'Consolas');
 txt('Y',1450,497,12,col.muted,true);txt(imported?(active?.y_reg||'—'):'00',1470,497,17,col.cyan,true,'Consolas');
 txt(active?.note||'Última instrução amostrada do quadro; sem prova de causalidade.',1008,538,12,col.muted);
}
function drawMath(frame,row){
 rect(24,596,945,278);tag('03  MATEMÁTICA / MOVIMENTO DISCRETO',44,626);
 txt('v[n+1] = v[n] + g[n]',44,663,25,col.white,true,'Consolas');
 txt('y[n+1] = y[n] + v[n]',44,696,25,col.cyan,true,'Consolas');
 txt('Modelo conceitual: escalas, subpixels e regras variam por jogo.',44,736,12,col.muted);
 const left=508,top=645,gw=423,gh=194;
 for(let i=0;i<5;i++){const yy=top+i*gh/4;line(left,yy,left+gw,yy,'#29445a');}
 for(let i=0;i<7;i++){const xx=left+i*gw/6;line(xx,top,xx,top+gh,'#223b52');}
 ctx.beginPath();
 for(let i=0;i<=120;i++){const f=frame-120+i,v=rowFor(Math.max(0,f)).vy,sy=top+gh*.55-v*4.5,px=left+i/120*gw;i===0?ctx.moveTo(px,sy):ctx.lineTo(px,sy);}
 ctx.strokeStyle=col.cyan;ctx.lineWidth=3;ctx.stroke();
 txt('VELOCIDADE VERTICAL',left+4,top-11,11,col.muted,true);line(left,top+gh*.55,left+gw,top+gh*.55,'#708a9d',1);
 rect(44,770,429,70,8,'#12283a',null);
 txt('vᵧ = '+fmt(row.vy),64,801,25,col.amber,true,'Consolas');txt('Δv por quadro e colisões',64,823,12,col.muted);
}
function drawArchitecture(frame){
 rect(987,596,588,278);tag('04  HARDWARE / FLUXO CONCEITUAL',1008,626);
 const nodes=[
 {x:1012,y:658,w:156,h:65,a:'CPU 65C816',b:'Instruções'},
 {x:1210,y:658,w:155,h:65,a:'WRAM',b:'Estado / dados'},
 {x:1396,y:658,w:156,h:65,a:'PPU',b:'Composição'},
 {x:1210,y:769,w:155,h:62,a:'OAM',b:'Atributos de sprites'},
 {x:1396,y:769,w:156,h:62,a:'VRAM',b:'Tiles / mapas'}];
 nodes.forEach((n,i)=>{rect(n.x,n.y,n.w,n.h,9,i===0?'#16425a':'#17283c','#45617b');txt(n.a,n.x+15,n.y+28,17,col.white,true);txt(n.b,n.x+15,n.y+49,12,col.muted);});
 const links=[[1168,691,1210,691],[1365,691,1396,691],[1287,724,1287,769],[1474,724,1474,769],[1365,797,1396,797]];
 links.forEach(([ax,ay,bx,by],i)=>{line(ax,ay,bx,by,'#346a81',4);const p=(frame/17+i*.23)%1;ctx.beginPath();ctx.arc(ax+(bx-ax)*p,ay+(by-ay)*p,5,0,Math.PI*2);ctx.fillStyle=i%2?col.amber:col.cyan;ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=12;ctx.fill();ctx.shadowBlur=0;});
 txt('Setas ilustrativas ≠ medição física dos barramentos',1009,855,12,col.muted);
}
function timecode(s){const m=Math.floor(s/60),v=(s%60).toFixed(3).padStart(6,'0');return String(m).padStart(2,'0')+':'+v;}
function render(){
 ctx.setTransform(K,0,0,K,0,0);ctx.clearRect(0,0,W,H);ctx.fillStyle=col.bg;ctx.fillRect(0,0,W,H);
 txt('CIÊNCIA ATRATORA / RETRO ARCHITECTURE VISUALIZER',24,37,22,col.white,true);
 const frame=currentFrame(),row=rowFor(frame),label=classifyData(state.video,!!state.telemetry,!!state.trace);
 rect(1124,14,450,42,20,'#1a3243',null);txt(label,1142,39,13,(!state.trace||!state.telemetry)?col.amber:col.green,true);
 txt('FRAME '+frame+' · T='+state.t.toFixed(3)+' s',24,78,19,col.cyan,true,'Consolas');
 txt('VISUALIZAÇÃO CIENTÍFICA | NÃO SUBSTITUI TRACE DE EMULADOR',864,78,13,col.muted,true);
 drawGame(frame,row);drawCode(frame);drawMath(frame,row);drawArchitecture(frame);
 $('clock').textContent=timecode(state.t)+' / '+timecode(state.duration);
 $('seek').value=String(Math.round(1000*clamp(state.t/state.duration)));
}
function setPlaying(on){
 state.playing=on;$('play').textContent=on?'❚❚ Pausar':'▶ Reproduzir';
 if(state.video){if(on)video.play().catch(e=>{state.playing=false;status('Vídeo não pode reproduzir: '+e.message);});else video.pause();}
}
function seek(t){state.t=Math.max(0,Math.min(state.duration,t));if(state.video)video.currentTime=state.t;render();}
$('play').onclick=()=>{if(state.t>=state.duration-.02)seek(0);setPlaying(!state.playing);};
$('back').onclick=()=>{setPlaying(false);seek(state.t-1/state.fps);};
$('next').onclick=()=>{setPlaying(false);seek(state.t+1/state.fps);};
$('seek').oninput=e=>{setPlaying(false);seek(Number(e.target.value)/1000*state.duration);};
$('fps').onchange=e=>{state.fps=Math.max(1,Math.min(240,Number(e.target.value)||60));render();};
$('offset').onchange=e=>{state.offset=Math.trunc(Number(e.target.value)||0);render();};
$('csv').onchange=async e=>{
 const f=e.target.files[0];if(!f)return;
 try{state.telemetry=parseCSV(await f.text());updateStatus();render();}
 catch(err){status('Erro ao importar CSV: '+err.message);}
};
$('trace').onchange=async e=>{
 const f=e.target.files[0];if(!f)return;
 try{state.trace=parseTrace(await f.text());state.traceIndex=new Map();
   for(const row of state.trace){if(!state.traceIndex.has(row.frame))state.traceIndex.set(row.frame,[]);state.traceIndex.get(row.frame).push(row);}
   updateStatus();render();}
 catch(err){status('Erro ao importar trace: '+err.message);}
};
$('video').onchange=e=>{
 const f=e.target.files[0];if(!f)return;
 if(state.url)URL.revokeObjectURL(state.url);
 state.url=URL.createObjectURL(f);video.src=state.url;
 video.onloadedmetadata=()=>{state.video=true;state.duration=video.duration||8;seek(0);updateStatus();};
 video.onerror=()=>status('Erro ao abrir vídeo: formato não suportado no navegador.');
};
$('reset').onclick=()=>{
 setPlaying(false);if(state.url)URL.revokeObjectURL(state.url);state.url=null;video.removeAttribute('src');video.load();
 for(const id of ['video','csv','trace'])$(id).value='';
 Object.assign(state,{video:false,telemetry:null,trace:null,traceIndex:null,duration:8,offset:0,fps:60});
 $('fps').value='60';$('offset').value='0';seek(0);
 status('DEMONSTRAÇÃO: jogo e dados simulados. Importe arquivos reais para análise.');
};
function save(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),15000);}
$('snap').onclick=()=>canvas.toBlob(blob=>{if(blob)save(blob,'ciencia-atratora-frame.png');},'image/png');
$('record').onclick=()=>{
 if(state.recorder?.state==='recording'){state.recorder.stop();return;}
 if(!canvas.captureStream||!window.MediaRecorder){status('Gravação WEBM indisponível. Use Chrome ou OBS.');return;}
 const mime=['video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'].find(t=>MediaRecorder.isTypeSupported(t));
 if(!mime){status('Nenhum codec WEBM suportado.');return;}
 seek(0);const chunks=[],stream=canvas.captureStream(30),rec=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:6000000});
 state.recorder=rec;
 rec.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
 rec.onerror=()=>status('Falha durante a gravação do canvas.');
 rec.onstop=()=>{stream.getTracks().forEach(t=>t.stop());if(chunks.length)save(new Blob(chunks,{type:mime}),'ciencia-atratora-visualizacao.webm');$('record').textContent='● Gravar 10s WEBM';state.recorder=null;setPlaying(false);status('WEBM exportado sem áudio; converta para MP4 se desejar.');};
 rec.start(250);state.recordStart=performance.now();$('record').textContent='■ Encerrar gravação';setPlaying(true);
};
window.addEventListener('keydown',e=>{
 if(['INPUT','BUTTON'].includes(e.target.tagName))return;
 if(e.code==='Space'){e.preventDefault();$('play').click();}
 if(e.code==='ArrowLeft')$('back').click();if(e.code==='ArrowRight')$('next').click();
});
function animate(ms){
 if(state.playing){
   if(state.video){state.t=Math.min(state.duration,video.currentTime);if(video.ended)setPlaying(false);}
   else{state.t=Math.min(state.duration,state.t+(state.lastMs?(ms-state.lastMs)/1000:0));if(state.t>=state.duration)setPlaying(false);}
 }
 if(state.recorder?.state==='recording'&&(ms-state.recordStart>=10000||(!state.playing&&state.t>=state.duration-.001)))state.recorder.stop();
 state.lastMs=ms;render();requestAnimationFrame(animate);
}
render();requestAnimationFrame(animate);
})();