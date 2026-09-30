export function departRoom(data,uid,updated){
 if(!data)return;
 if(data.status==='finished')return;
 if(data.status==='waiting'&&data.w===uid&&!data.b)return {...data,status:'finished',result:'1/2-1/2',updated};
 if(data.status==='active'&&[data.w,data.b].includes(uid))return {...data,status:'finished',result:uid===data.w?'0-1':'1-0',updated};
}
export function availableRooms(data,now){return Object.entries(data||{}).filter(([code,r])=>/^[A-F0-9]{16}$/.test(code)&&r&&r.status==='waiting'&&!r.b&&Number.isFinite(r.created)&&now-r.created<7200000&&now>=r.created);}
