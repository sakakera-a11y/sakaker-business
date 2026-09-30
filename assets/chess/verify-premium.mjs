import assert from 'node:assert/strict';
import {Chess} from './chess-rules.js';
import {analyse} from './engine-premium.js';
const mate=new Chess('7k/5Q2/6K1/8/8/8/8/8 w - - 0 1');
const winning=analyse(mate.fen(),4,1800);assert.ok(mate.move(winning.move));assert.ok(mate.in_checkmate());
assert.equal(analyse(mate.fen(),4,100).move,null);
const capture=new Chess('6k1/8/8/3q4/8/8/3R4/6K1 w - - 0 1');
const tactical=analyse(capture.fen(),4,900);assert.ok(capture.move(tactical.move));assert.equal(tactical.move.to,'d5');
const inCheck=new Chess('4k3/8/8/8/8/8/4r3/4K3 w - - 0 1');
assert.ok(inCheck.move(analyse(inCheck.fen(),4,450).move));assert.ok(!inCheck.in_check());
for(const [depth,budget] of [[1,180],[3,850],[6,2400]]){const g=new Chess(),start=Date.now(),result=analyse(g.fen(),depth,budget);assert.ok(g.move(result.move));assert.ok(Date.now()-start<budget+1200);console.log({depth,completed:result.depth,nodes:result.nodes,elapsed:Date.now()-start,move:result.san});}
const g=new Chess();for(let ply=0;ply<24&&!g.game_over();ply++){const fen=g.fen();const result=analyse(fen,3,75);assert.equal(g.fen(),fen);assert.ok(g.move(result.move));}
console.log('PASS: premium engine mate, terminal state, winning capture, check evasion, bounded levels, and 24 legal plies.');
