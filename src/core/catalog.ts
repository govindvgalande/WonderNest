import type {AgeGroup,GameId} from './types';
export const OBJECTS = [
  'fox','owl','panda','rabbit','elephant','cat','dog','fish','butterfly','frog','bear','bee',
  'apple','banana','grape','orange','pear','cherry','carrot','strawberry',
  'car','train','plane','boat','bicycle','bus','rocket','truck',
  'star','sun','moon','cloud','rainbow','flower','tree','mushroom'
] as const;
export const SHAPES = ['red_circle','blue_square','yellow_star','green_triangle','purple_heart','orange_diamond'] as const;
export const NOTES = ['bell','drum','flute','chime','harp','wood'] as const;
export const PLACES = ['tree','house','pond','bridge','hill','garden'] as const;
export const GAME_INFO: Record<GameId,{icon:string; world:string; skills:string[]}> = {
  cards:{icon:'🃏',world:'forest',skills:['visualMemory']},
  objects:{icon:'🧺',world:'forest',skills:['recall']},
  pattern:{icon:'🌈',world:'rainbow',skills:['sequence']},
  missing:{icon:'🔎',world:'forest',skills:['observation']},
  treasure:{icon:'🗺️',world:'treasure',skills:['spatial']},
  sounds:{icon:'🎶',world:'rainbow',skills:['auditory']},
  detective:{icon:'🕵️',world:'castle',skills:['observation']},
  story:{icon:'📖',world:'castle',skills:['recall']},
  shapes:{icon:'🔶',world:'rainbow',skills:['sequence']},
  order:{icon:'🔢',world:'mountain',skills:['workingMemory']},
  maze:{icon:'🏰',world:'treasure',skills:['spatial']},
  explorer:{icon:'🚀',world:'mountain',skills:['reasoning']}
};
export const AGE_BOUNDS: Record<AgeGroup,{min:number;max:number;session:number;daily:number}>={
  '3-5':{min:1,max:3,session:8,daily:15},
  '6-8':{min:2,max:6,session:12,daily:20},
  '9-12':{min:3,max:9,session:15,daily:25}
};
export const TOKEN_ICONS: Record<string,string> = {
  fox:'🦊',owl:'🦉',panda:'🐼',rabbit:'🐰',elephant:'🐘',cat:'🐱',dog:'🐶',fish:'🐟',butterfly:'🦋',frog:'🐸',bear:'🐻',bee:'🐝',apple:'🍎',banana:'🍌',grape:'🍇',orange:'🍊',pear:'🍐',cherry:'🍒',carrot:'🥕',strawberry:'🍓',car:'🚗',train:'🚂',plane:'✈️',boat:'⛵',bicycle:'🚲',bus:'🚌',rocket:'🚀',truck:'🚚',star:'⭐',sun:'☀️',moon:'🌙',cloud:'☁️',rainbow:'🌈',flower:'🌻',tree:'🌳',mushroom:'🍄',red_circle:'🔴',blue_square:'🟦',yellow_star:'🌟',green_triangle:'🔺',purple_heart:'💜',orange_diamond:'🔶',bell:'🔔',drum:'🥁',flute:'🎵',chime:'✨',harp:'🎼',wood:'🪵',house:'🏠',pond:'💧',bridge:'🌉',hill:'⛰️',garden:'🌷'
};
