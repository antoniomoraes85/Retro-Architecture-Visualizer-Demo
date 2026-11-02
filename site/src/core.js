/* Retro Architecture Visualizer — transformações de dados sem dependências */
(function(root,factory){
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  if(root)root.RAVCore=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
  "use strict";
  const MAX_ROWS=150000;
  function parseCSV(text){
    if(typeof text!=="string")throw new TypeError("CSV inválido");
    const lines=text.replace(/^\uFEFF/,"").split(/\r?\n/).filter(s=>s.trim()&&!s.trim().startsWith("#"));
    if(lines.length<2)throw new Error("CSV sem dados");
    const delimiter=lines[0].includes(";")?";":",";
    const cols=lines[0].split(delimiter).map(s=>s.trim().toLowerCase());
    for(const key of ["frame","x","y","vx","vy"])if(!cols.includes(key))throw new Error("Coluna obrigatória ausente: "+key);
    if(lines.length>MAX_ROWS+1)throw new Error("Arquivo excede "+MAX_ROWS+" registros");
    const rows=[];
    for(let i=1;i<lines.length;i++){
      const parts=lines[i].split(delimiter),row={};
      for(const key of ["frame","x","y","vx","vy"]){
        const raw=parts[cols.indexOf(key)];
        if(raw===undefined||!raw.trim())throw new Error("Número inválido na linha "+(i+1)+": "+key);
        row[key]=Number(raw.trim());
        if(!Number.isFinite(row[key]))throw new Error("Número inválido na linha "+(i+1)+": "+key);
      }
      if(!Number.isSafeInteger(row.frame)||row.frame<0)throw new Error("Frame inválido na linha "+(i+1));
      rows.push(row);
    }
    rows.sort((a,b)=>a.frame-b.frame);
    for(let i=1;i<rows.length;i++)if(rows[i].frame===rows[i-1].frame)throw new Error("Frame duplicado: "+rows[i].frame);
    return rows;
  }
  function parseTrace(text){
    if(typeof text!=="string")throw new TypeError("Trace inválido");
    const lines=text.replace(/^\uFEFF/,"").split(/\r?\n/).filter(s=>s.trim());
    if(lines.length>MAX_ROWS)throw new Error("Trace excede "+MAX_ROWS+" eventos");
    const rows=[];
    for(let i=0;i<lines.length;i++){
      let row;
      try{row=JSON.parse(lines[i]);}catch(_){throw new Error("JSON inválido na linha "+(i+1));}
      if(!row||!Number.isSafeInteger(row.frame)||row.frame<0)throw new Error("Frame inválido na linha "+(i+1));
      if(typeof row.asm!=="string"||!row.asm.trim()||row.asm.length>120)throw new Error("Assembly inválido na linha "+(i+1));
      const clean={frame:row.frame,pc:String(row.pc||"—").slice(0,32),asm:row.asm.trim(),a:String(row.a??"—").slice(0,32),x_reg:String(row.x_reg??"—").slice(0,32),y_reg:String(row.y_reg??"—").slice(0,32),cycles:row.cycles==null?null:Number(row.cycles),note:String(row.note||"").slice(0,120)};
      if(clean.cycles!==null&&!Number.isFinite(clean.cycles))throw new Error("Ciclos inválidos na linha "+(i+1));
      rows.push(clean);
    }
    rows.sort((a,b)=>a.frame-b.frame||(a.cycles??0)-(b.cycles??0));
    return rows;
  }
  function lastAtOrBefore(rows,frame){
    if(!rows?.length)return null;
    let lo=0,hi=rows.length-1,best=-1;
    while(lo<=hi){let m=(lo+hi)>>1;if(rows[m].frame<=frame){best=m;lo=m+1;}else hi=m-1;}
    return best>=0?rows[best]:null;
  }
  function frameToTime(frame,firstFrame,fps,offset=0){return(frame-firstFrame-offset)/fps;}
  function timeToFrame(seconds,firstFrame,fps,offset=0){return Math.max(0,Math.round(seconds*fps)+firstFrame+offset);}
  function classifyData(hasVideo,hasTelemetry,hasTrace){
    if(!hasTelemetry&&!hasTrace)return"SIMULAÇÃO DIDÁTICA";
    if(hasTelemetry&&hasTrace&&hasVideo)return"ARQUIVOS IMPORTADOS • SINCRONIA A CONFERIR";
    return"DADOS MISTOS • SINCRONIA NÃO VERIFICADA";
  }
  return{parseCSV,parseTrace,lastAtOrBefore,frameToTime,timeToFrame,classifyData};
});
