import {chooseMove} from './engine.js';
self.onmessage=e=>{try{const {id,fen,depth}=e.data;self.postMessage({id,fen,move:chooseMove(fen,depth,depth===4?1000:600)})}catch(error){self.postMessage({id:e.data.id,error:String(error)})}};
