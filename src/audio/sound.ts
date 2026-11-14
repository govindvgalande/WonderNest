import {createAudioPlayer,setAudioModeAsync} from 'expo-audio';
import * as Speech from 'expo-speech';
import type {Locale,Settings} from '../core/types';
const samples={bell:require('../../assets/sounds/bell.wav'),drum:require('../../assets/sounds/drum.wav'),flute:require('../../assets/sounds/flute.wav'),chime:require('../../assets/sounds/chime.wav'),harp:require('../../assets/sounds/harp.wav'),wood:require('../../assets/sounds/wood.wav'),success:require('../../assets/sounds/success.wav')};
type Tone=keyof typeof samples;
let players:Partial<Record<Tone,ReturnType<typeof createAudioPlayer>>>={};
let configured=false;
export async function prepareSounds(){if(configured)return;await setAudioModeAsync({playsInSilentMode:false,shouldPlayInBackground:false,interruptionMode:'mixWithOthers'});configured=true;}
export async function playTone(tone:string,settings:Settings){
 if(!settings.sound||settings.volume<=0||!(tone in samples))return;
 const key=tone as Tone;
 try{
  if(!configured)await prepareSounds();
  if(!players[key])players[key]=createAudioPlayer(samples[key]);
  const player=players[key]!;player.volume=settings.volume;await player.seekTo(0);player.play();
 }catch{ /* visual feedback is always available */ }
}
export function stopSounds(){for(const player of Object.values(players)){try{player?.pause();}catch{}}}
export function disposeSounds(){for(const player of Object.values(players)){try{player?.remove();}catch{}}players={};}
export async function speakInstruction(text:string,locale:Locale,settings:Settings):Promise<boolean>{
 if(!settings.narration||!settings.sound)return false;
 const lang={en:'en-IN',hi:'hi-IN',mr:'mr-IN'}[locale];
 try{
  const voices=await Speech.getAvailableVoicesAsync();
  const matches=voices.filter(v=>v.language.toLowerCase().startsWith(lang.slice(0,2)));
  if(!matches.length)return false;
  Speech.stop();Speech.speak(text,{language:lang,voice:matches[0]!.identifier,volume:settings.volume,rate:0.83});return true;
 }catch{return false;}
}
export function stopVoice(){Speech.stop();}

let musicPlayer:ReturnType<typeof createAudioPlayer>|null=null;
export async function setMusicEnabled(enabled:boolean,settings:Settings){
 try{
  if(!enabled){musicPlayer?.pause();return;}
  if(!configured)await prepareSounds();
  if(!musicPlayer){musicPlayer=createAudioPlayer(require('../../assets/sounds/music.wav'));musicPlayer.loop=true;}
  musicPlayer.volume=settings.volume*.34;
  musicPlayer.play();
 }catch{ /* Never block gameplay due to audio */ }
}
