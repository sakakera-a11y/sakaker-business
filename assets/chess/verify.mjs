import assert from 'node:assert/strict';
import {Chess} from './chess-rules.js';
import {chooseMove} from './engine.js';
import {appendMove,replayRoom,trainingResult} from './protocol.js';
const game=new Chess();function perft(g,n){if(!n)return 1;let sum=0;for(const m of g.moves({verbose:true})){g.move(m);sum+=perft(g,n-1);g.undo()}return sum}assert.equal(perft(game,2),400);assert.equal(perft(game,3),8902);
for(const san of ['e4','e5','Nf3','Nc6','Bc4','Nf6','O-O'])assert.ok(game.move(san));assert.equal(game.get('g1').type,'k');assert.equal(game.get('f1').type,'r');
const ep=new Chess();for(const m of ['e4','a6','e5','d5','exd6'])assert.ok(ep.move(m));assert.equal(ep.get('d5'),null);assert.equal(ep.get('d6').type,'p');
const promotion=new Chess('7k/P7/8/8/8/8/8/7K w - - 0 1');assert.ok(promotion.move({from:'a7',to:'a8',promotion:'n'}));assert.equal(promotion.get('a8').type,'n');
const mate=new Chess();for(const m of ['f3','e5','g4','Qh4#'])assert.ok(mate.move(m));assert.equal(mate.in_checkmate(),true);assert.equal(chooseMove(mate.fen()),null);
const repeated=new Chess();for(let i=0;i<2;i++)for(const m of ['Nf3','Nf6','Ng1','Ng8'])repeated.move(m);assert.equal(repeated.in_threefold_repetition(),true);
const ai=new Chess('7k/5Q2/6K1/8/8/8/8/8 w - - 0 1');const choice=chooseMove(ai.fen(),2,1200);assert.ok(ai.move(choice));assert.ok(ai.in_checkmate());
for(const depth of [1,2,4]){const c=new Chess();assert.ok(c.move(chooseMove(c.fen(),depth,80)));}
let room={w:'white',b:'black',wName:'Emerald',bName:'Moon',ply:0,moves:'',lastSAN:'',status:'active',result:''};room=appendMove(room,'white',{from:'e2',to:'e4'});assert.equal(room.lastSAN,'e4');assert.throws(()=>appendMove(room,'white',{from:'d2',to:'d4'}));assert.throws(()=>appendMove(room,'black',{from:'e7',to:'e4'}));room=appendMove(room,'black',{from:'e7',to:'e5'});assert.equal(replayRoom(room).history().join(','),'e4,e5');assert.throws(()=>replayRoom({...room,moves:'e4|e5|Qh5'}));assert.throws(()=>replayRoom({...room,moves:'e4|e4'}));
const rating=trainingResult(null,1,1100);assert.equal(rating.games,1);assert.equal(rating.wins,1);assert.ok(rating.rating>1000);assert.equal(trainingResult(rating,.5,1100).draws,1);
console.log('PASS: 8,902 legal positions, castling, en passant, promotion, mate, repetition, computer levels, room replay/turn validation, and training statistics.');
