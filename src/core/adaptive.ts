import {AGE_BOUNDS} from './catalog';
import type {AgeGroup,DifficultyState} from './types';
export function initialDifficulty(age:AgeGroup): DifficultyState {
  return {level:AGE_BOUNDS[age].min,recent:[]};
}
/** Adjust at most one level per full 4-result window. Hints/mistakes block upward moves, not downward support. */
export function nextDifficulty(age:AgeGroup, state:DifficultyState, outcome:{success:boolean;hints:number;mistakes:number}): DifficultyState {
  const b=AGE_BOUNDS[age];
  const recent=[...state.recent,outcome].slice(-4);
  let level=Math.min(b.max,Math.max(b.min,state.level));
  if(recent.length===4){
    if(recent.every(x=>x.success && x.mistakes===0 && x.hints===0)) level=Math.min(b.max,level+1);
    else if(recent.filter(x=>!x.success||x.mistakes>=2).length>=3) level=Math.max(b.min,level-1);
    // Clear the window after an actual change; otherwise roll to adapt after subsequent attempts.
    if(level!==state.level) return {level,recent:[]};
  }
  return {level,recent};
}
