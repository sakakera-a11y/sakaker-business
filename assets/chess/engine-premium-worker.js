import {analyse} from './engine-premium.js';
self.onmessage=e=>{const {id,fen,depth=5,budget=1400}=e.data;try{self.postMessage({id,fen,...analyse(fen,depth,budget)})}catch(error){self.postMessage({id,fen,error:String(error)})}};
