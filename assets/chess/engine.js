import {Chess} from './chess-rules.js';
const value={p:100,n:320,b:330,r:500,q:900,k:0};
export function chooseMove(fen,depth=2,budgetMs=650){
 const game=new Chess(fen),end=Date.now()+budgetMs;let nodes=0;
 function score(){let s=0;for(const row of game.board())for(const p of row)if(p){const file=p.square.charCodeAt(0)-97,rank=+p.square[1]-1;const centre=7-(Math.abs(3.5-file)+Math.abs(3.5-rank));const bonus=p.type==='p'?(p.color==='w'?rank:7-rank)*7:p.type==='n'||p.type==='b'?centre*8:0;s+=(p.color==='w'?1:-1)*(value[p.type]+bonus)}return s*(game.turn()==='w'?1:-1)}
 function order(){return game.moves({verbose:true}).sort((a,b)=>(value[b.captured]||0)+(b.promotion?800:0)-(value[a.captured]||0)-(a.promotion?800:0))}
 function search(d,alpha,beta,ply){if(++nodes%64===0&&Date.now()>end)throw Error('time');if(game.in_checkmate())return -100000+ply;if(game.in_draw())return 0;if(!d)return score();let best=-Infinity;for(const m of order()){game.move(m);let v;try{v=-search(d-1,-beta,-alpha,ply+1)}finally{game.undo()}best=Math.max(best,v);alpha=Math.max(alpha,v);if(alpha>=beta)break}return best}
 const moves=order();if(!moves.length)return null;let best=moves[0];for(let d=1;d<=Math.max(1,Math.min(4,depth));d++){let round=best,top=-Infinity;try{for(const m of moves){if(Date.now()>end)throw Error('time');game.move(m);let s;try{s=-search(d-1,-Infinity,Infinity,1)}finally{game.undo()}if(s>top){top=s;round=m}}best=round}catch(_){break}}return {from:best.from,to:best.to,promotion:best.promotion||'q'};
}
