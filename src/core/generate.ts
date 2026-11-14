import {AGE_BOUNDS,NOTES,OBJECTS,PLACES,SHAPES} from './catalog';
import {pick,random,sample,shuffle} from './random';
import type {AgeGroup,Challenge,GameId} from './types';
const adjacent=(a:number,b:number,n:number)=>Math.abs(Math.floor(a/n)-Math.floor(b/n))+Math.abs(a%n-b%n)===1;
const neighbors=(at:number,size:number)=>[at-size,at+size,at%size?at-1:-1,at%size<size-1?at+1:-1].filter(x=>x>=0&&x<size*size);
/** Seeded depth-first search produces the full requested route or fails closed.
 * Induced maze paths cannot touch earlier path squares except the predecessor. */
function route(size:number,length:number,rng:()=>number,induced:boolean):number[]{
  if(!Number.isInteger(size)||size<2||!Number.isInteger(length)||length<2||length>size*size) throw new Error('Invalid route dimensions');
  const path=[0],used=new Set<number>([0]);
  const solve=():boolean=>{
    if(path.length===length)return true;
    const last=path[path.length-1]!;
    for(const n of shuffle(neighbors(last,size),rng)){
      if(used.has(n))continue;
      if(induced&&path.slice(0,-1).some(x=>adjacent(n,x,size)))continue;
      used.add(n);path.push(n);
      if(solve())return true;
      path.pop();used.delete(n);
    }
    return false;
  };
  if(!solve())throw new Error('Unable to generate a complete solvable route');
  return path;
}
function seqItems(count:number,source:readonly string[],rng:()=>number):string[]{return Array.from({length:count},()=>pick(source,rng));}
/** All puzzle data is generated offline with seeded randomness; answers are part of the challenge. */
export function generateChallenge(gameId:GameId,ageGroup:AgeGroup,level:number,seed:number):Challenge{
  const b=AGE_BOUNDS[ageGroup];
  if(!Number.isInteger(seed)||seed<0||seed>0xffffffff)throw new Error('Invalid seed');
  if(!Number.isInteger(level)||level<b.min||level>b.max)throw new Error('Level outside age boundary');
  const rng=random((seed^Math.imul(level,0x9e3779b1))>>>0);
  const base={id:`${gameId}-${ageGroup}-${level}-${seed}`,gameId,ageGroup,level,seed};
  const howMany=(min:number,max:number)=>Math.min(max,min+Math.max(0,level-b.min));
  switch(gameId){
    case 'cards':{
      const count=howMany(2,ageGroup==='9-12'?8:ageGroup==='6-8'?6:4);
      const chosen=sample(OBJECTS,count,rng);
      const board=shuffle([...chosen,...chosen],rng);
      return {...base,mode:'cards',prompt:'match',preview:[],options:board,answer:board,board};
    }
    case 'objects':{
      const count=howMany(2,ageGroup==='9-12'?8:ageGroup==='6-8'?6:4);
      const picked=sample(OBJECTS,count+Math.min(count+2,6),rng);
      return {...base,mode:'multi',prompt:'recall',preview:picked.slice(0,count),options:shuffle(picked,rng),answer:picked.slice(0,count)};
    }
    case 'pattern':{
      const count=howMany(2,ageGroup==='9-12'?10:ageGroup==='6-8'?7:4);
      const items=seqItems(count,SHAPES,rng);
      return {...base,mode:'sequence',prompt:'repeat',preview:items,options:[...SHAPES],answer:items};
    }
    case 'missing':{
      const count=howMany(3,ageGroup==='9-12'?9:ageGroup==='6-8'?7:5);
      const all=sample(OBJECTS,count+3,rng);const miss=pick(all.slice(0,count),rng);
      return {...base,mode:'single',prompt:'missing',preview:all.slice(0,count),board:all.slice(0,count).filter(x=>x!==miss),options:shuffle([miss,...all.slice(count)],rng),answer:[miss]};
    }
    case 'treasure':{
      const size=ageGroup==='3-5'?3:ageGroup==='6-8'?4:5;
      const path=route(size,howMany(3,ageGroup==='9-12'?10:ageGroup==='6-8'?8:5),rng,false);
      return {...base,mode:'route',prompt:'route',preview:path.map(x=>`cell:${x}`),options:Array.from({length:size*size},(_,i)=>`cell:${i}`),answer:path.map(x=>`cell:${x}`),gridSize:size};
    }
    case 'sounds':{
      const items=seqItems(howMany(2,ageGroup==='9-12'?9:ageGroup==='6-8'?6:4),NOTES,rng);
      return {...base,mode:'sequence',prompt:'sound',preview:items,options:[...NOTES],answer:items};
    }
    case 'detective':{
      const count=howMany(2,6);const actors=sample(OBJECTS.slice(0,12),count,rng);const places=sample(PLACES,count,rng);
      const index=Math.floor(rng()*count);const key=places[index]!;
      return {...base,mode:'single',prompt:'observe',preview:actors.map((x,i)=>`${x}@${places[i]}`),options:shuffle(actors,rng),answer:[actors[index]!],cue:key};
    }
    case 'story':{
      const count=howMany(2,ageGroup==='9-12'?5:ageGroup==='6-8'?4:3);
      const actors=sample(OBJECTS.slice(0,12),count,rng);
      const objs=sample(OBJECTS.slice(12),count+2,rng);
      const places=sample(PLACES,count,rng);
      const frames=actors.map((actor,i)=>({actor,object:objs[i]!,place:places[i]!}));
      const asked=Math.floor(rng()*count);
      return {...base,mode:'single',prompt:'story',preview:frames.map(x=>`${x.actor}:${x.object}:${x.place}`),storyFrames:frames,cue:actors[asked],options:shuffle([objs[asked]!,...objs.slice(count)],rng),answer:[objs[asked]!]};
    }
    case 'shapes':{
      const count=howMany(2,ageGroup==='9-12'?9:ageGroup==='6-8'?6:4);
      const items=seqItems(count,SHAPES,rng);
      return {...base,mode:'sequence',prompt:'shapes',preview:items,options:[...SHAPES],answer:items};
    }
    case 'order':{
      const count=howMany(3,ageGroup==='9-12'?9:ageGroup==='6-8'?7:5);
      const items=sample(OBJECTS,count,rng);
      return {...base,mode:'sequence',prompt:'order',preview:items,options:shuffle(items,rng),answer:items};
    }
    case 'maze':{
      const size=ageGroup==='3-5'?3:ageGroup==='6-8'?4:5;
      const path=route(size,howMany(3,ageGroup==='9-12'?8:ageGroup==='6-8'?7:5),rng,true);
      // Include reproducible dead-end branches. Otherwise each visible corridor is
      // the answer and the child need not remember the preview.
      const open=new Set(path);
      const candidates=shuffle(Array.from({length:size*size},(_,i)=>i).filter(n=>!open.has(n)),rng);
      for(const cell of candidates){
        if(neighbors(cell,size).filter(n=>open.has(n)).length===1&&rng()<0.68)open.add(cell);
      }
      const board=Array.from(open).sort((a,b)=>a-b).map(x=>`cell:${x}`);
      return {...base,mode:'maze',prompt:'maze',preview:path.map(x=>`cell:${x}`),options:Array.from({length:size*size},(_,i)=>`cell:${i}`),answer:path.map(x=>`cell:${x}`),board,gridSize:size};
    }
    case 'explorer':{
      const selected=pick(['objects','missing','pattern'] as const,rng);
      const inner=generateChallenge(selected,ageGroup,level,(seed+0xa4093822)>>>0);
      return {...inner,...base,prompt:'explore'};
    }
  }
}
export function validateChallenge(c:Challenge):boolean{
  if(!c.answer.length||!c.options.length)return false;
  if(!c.answer.every(a=>c.options.includes(a))) return false;
  if(c.mode==='cards'){
    if(!c.board||c.board.length%2!==0||c.board.length!==c.options.length)return false;
    const counts=new Map<string,number>();for(const s of c.board)counts.set(s,(counts.get(s)||0)+1);
    return [...counts.values()].every(n=>n===2);
  }
  if(c.mode==='multi')return new Set(c.answer).size===c.answer.length&&c.answer.every(x=>c.preview.includes(x));
  if(c.mode==='single' && c.prompt==='missing')return c.answer.length===1&&!c.board?.includes(c.answer[0]!);
  if((c.mode==='route'||c.mode==='maze')&&c.gridSize){
    const nums=c.answer.map(x=>Number(x.replace('cell:','')));
    if(nums.some(x=>!Number.isInteger(x)||x<0||x>=c.gridSize!*c.gridSize!))return false;
    if(new Set(nums).size!==nums.length)return false;
    return nums.every((n,i)=>i===0||adjacent(n,nums[i-1]!,c.gridSize!));
  }
  if(c.prompt==='story')return !!c.storyFrames?.some(x=>x.actor===c.cue&&x.object===c.answer[0]);
  if(c.prompt==='observe')return c.preview.some(x=>x===`${c.answer[0]}@${c.cue}`);
  return true;
}
export function isMatchingCardPair(c:Challenge,i:number,j:number):boolean{
  if(c.mode!=='cards'||!c.board||!Number.isInteger(i)||!Number.isInteger(j)||i===j)return false;
  return i>=0&&j>=0&&i<c.board.length&&j<c.board.length&&c.board[i]===c.board[j];
}
export function evaluateCardSolution(c:Challenge,indices:number[]):boolean{
  if(c.mode!=='cards'||!c.board||indices.length!==c.board.length)return false;
  if(new Set(indices).size!==indices.length)return false;
  for(let i=0;i<indices.length;i+=2)if(!isMatchingCardPair(c,indices[i]!,indices[i+1]!))return false;
  return true;
}
export function evaluateChallenge(c:Challenge,input:string[]):boolean{
  if(c.mode==='cards'){
    if(input.some(x=>!/^index:\d+$/.test(x)))return false;
    return evaluateCardSolution(c,input.map(x=>Number(x.slice(6))));
  }
  if(c.mode==='multi')return input.length===c.answer.length&&new Set(input).size===input.length&&input.every(x=>c.answer.includes(x));
  return input.length===c.answer.length&&input.every((v,i)=>v===c.answer[i]);
}
export function allowedNextCell(c:Challenge,chosen:string[],next:string):boolean{
  if(!c.gridSize||!c.options.includes(next)||chosen.includes(next))return false;
  if(c.mode==='maze'&&!c.board?.includes(next))return false;
  if(!chosen.length)return next===c.answer[0];
  const prev=Number(chosen[chosen.length-1]!.split(':')[1]);
  const current=Number(next.split(':')[1]);
  return adjacent(prev,current,c.gridSize);
}
