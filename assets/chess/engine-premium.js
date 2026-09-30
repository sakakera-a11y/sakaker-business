import {Chess} from './chess-rules.js';
const V={p:100,n:320,b:335,r:500,q:900,k:0},MATE=30000;
// Bounded iterative search. Scores are training estimates in centipawns.
export function analyse(fen,depth=5,budgetMs=1400){
 const game=new Chess(fen),deadline=Date.now()+Math.max(20,budgetMs),tt=new Map(),killers=new Map();let nodes=0;
 const abort=()=>{if((++nodes&31)===0&&Date.now()>=deadline)throw Error('budget')};
 function evaluate(){let score=0,bishops={w:0,b:0},pawns={w:Array(8).fill(0),b:Array(8).fill(0)},pieces=game.board().flat().filter(Boolean);const endgame=pieces.filter(p=>p.type==='q'||p.type==='r').length<3;
  for(const p of pieces){const f=p.square.charCodeAt(0)-97,r=+p.square[1]-1,advance=p.color==='w'?r:7-r,centre=7-Math.abs(3.5-f)-Math.abs(3.5-r);let bonus=0;
   if(p.type==='p'){pawns[p.color][f]++;bonus=advance*8+centre*2;if(!pieces.some(o=>o.type==='p'&&o.color!==p.color&&Math.abs(o.square.charCodeAt(0)-97-f)<=1&&(p.color==='w'?+o.square[1]-1>r:+o.square[1]-1<r)))bonus+=advance*advance*3;}
   if(p.type==='n')bonus=centre*13-(advance===0?15:0);if(p.type==='b'){bishops[p.color]++;bonus=centre*7;}if(p.type==='r')bonus=(advance===6?20:0);if(p.type==='k')bonus=endgame?centre*12:(advance<2&&(f<3||f>5)?25:-centre*6);score+=(p.color==='w'?1:-1)*(V[p.type]+bonus);
  }
  for(const c of ['w','b']){let penalty=0;for(let f=0;f<8;f++){penalty+=Math.max(0,pawns[c][f]-1)*18;if(pawns[c][f]&&!(pawns[c][f-1]||pawns[c][f+1]))penalty+=pawns[c][f]*12;}score+=(c==='w'?1:-1)*((bishops[c]>=2?28:0)-penalty);}
  return score*(game.turn()==='w'?1:-1);
 }
 const key=m=>m.from+m.to+(m.promotion||'');
 function ordered(ply,best){return game.moves({verbose:true}).sort((a,b)=>priority(b)-priority(a));function priority(m){return (key(m)===best?1000000:0)+(m.captured?V[m.captured]*12-V[m.piece]:0)+(m.promotion?V[m.promotion]+700:0)+(m.san.includes('+')||m.san.includes('#')?45:0)+(killers.get(ply)===key(m)?80:0)}}
 function quiet(alpha,beta,ply,qdepth){abort();if(game.in_checkmate())return -MATE+ply;if(game.in_draw())return 0;const check=game.in_check(),stand=evaluate();if(qdepth<=0)return stand;if(!check){if(stand>=beta)return stand;alpha=Math.max(alpha,stand);}const moves=ordered(ply).filter(m=>check||m.captured||m.promotion);for(const m of moves){game.move(m);let s;try{s=-quiet(-beta,-alpha,ply+1,qdepth-1)}finally{game.undo()}if(s>=beta)return s;alpha=Math.max(alpha,s);}return alpha;}
 function search(d,alpha,beta,ply){abort();if(game.in_checkmate())return -MATE+ply;if(game.in_draw())return 0;if(d<=0)return quiet(alpha,beta,ply,5);const pos=game.fen(),old=tt.get(pos),originalAlpha=alpha,originalBeta=beta;if(old&&old.depth>=d){if(old.flag==='exact')return old.score;if(old.flag==='lower')alpha=Math.max(alpha,old.score);else beta=Math.min(beta,old.score);if(alpha>=beta)return old.score;}
  let best=-Infinity,bestMove='';for(const m of ordered(ply,old?.move)){game.move(m);let s;try{s=-search(d-1,-beta,-alpha,ply+1)}finally{game.undo()}if(s>best){best=s;bestMove=key(m);}alpha=Math.max(alpha,s);if(alpha>=beta){if(!m.captured)killers.set(ply,key(m));break;}}
  if(tt.size>15000)tt.clear();if(Math.abs(best)<MATE-100)tt.set(pos,{depth:d,score:best,move:bestMove,flag:best<=originalAlpha?'upper':best>=originalBeta?'lower':'exact'});return best;
 }
 if(game.game_over())return {move:null,score:game.in_checkmate()?-MATE:0,depth:0,nodes};let root=ordered(0),best=root[0],score=evaluate(),completed=0;
 for(let d=1;d<=Math.min(7,Math.max(1,depth));d++){let top=-Infinity,next=best;try{root.sort((a,b)=>(key(b)===key(best)?1:0)-(key(a)===key(best)?1:0));for(const m of root){if(Date.now()>=deadline)throw Error('budget');game.move(m);let s;try{s=-search(d-1,-Infinity,-top,1)}finally{game.undo()}if(s>top){top=s;next=m;}}best=next;score=top;completed=d;if(Math.abs(score)>MATE-100)break;}catch(_){break;}}
 return {move:{from:best.from,to:best.to,...(best.promotion?{promotion:best.promotion}:{})},san:best.san,score,depth:completed,nodes};
}
