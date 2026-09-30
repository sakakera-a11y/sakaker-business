import {Chess} from './chess-rules.js';
export function replayRoom(room){
 if(!room||!Number.isInteger(room.ply)||room.ply<0||room.ply>600)throw Error('Invalid room');
 const moves=room.moves?room.moves.split('|'):[];if(moves.length!==room.ply)throw Error('Invalid move count');
 const game=new Chess();for(const san of moves)if(!game.move(san,{sloppy:false}))throw Error('Illegal move');return game;
}
export function appendMove(room,uid,move){
 if(room.status!=='active'||!room.b)throw Error('Room not active');const game=replayRoom(room);if(uid!==(game.turn()==='w'?room.w:room.b))throw Error('Wrong turn');const legal=game.move(move);if(!legal)throw Error('Illegal move');
 let result='';if(game.in_checkmate())result=game.turn()==='w'?'0-1':'1-0';else if(game.in_draw())result='1/2-1/2';
 return {...room,ply:room.ply+1,lastSAN:legal.san,moves:room.moves?room.moves+'|'+legal.san:legal.san,status:result?'finished':'active',result};
}
export function trainingResult(profile,score,opponent){
 const p={games:0,wins:0,draws:0,losses:0,rating:1000,...profile};const expected=1/(1+10**((opponent-p.rating)/400));p.rating=Math.max(100,Math.min(3000,Math.round(p.rating+24*(score-expected))));p.games++;if(score===1)p.wins++;else if(score===0)p.losses++;else p.draws++;return p;
}
