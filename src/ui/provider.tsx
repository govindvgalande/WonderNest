import React,{createContext,useCallback,useContext,useEffect,useMemo,useRef,useState} from 'react';
import {AppState} from 'react-native';
import {usePathname} from 'expo-router';
import type {Profile,Settings,AgeGroup,Attempt} from '../core/types';
import {heartbeatDelta} from '../core/time';
import * as store from '../storage/database';
import {hasParentPin} from '../security/parentGate';
import {setMusicEnabled} from '../audio/sound';
interface AppContextShape{
 ready:boolean;pinExists:boolean;profiles:Profile[];profile:Profile|null;settings:Settings;timeLeftSec:number;blocked:boolean;breakDue:boolean;
 refresh:()=>void;refreshGate:()=>Promise<void>;selectProfile:(id:string)=>void;makeProfile:(name:string,age:AgeGroup,avatar:string)=>void;editProfile:(p:Profile)=>void;removeProfile:(id:string)=>void;savePrefs:(next:Settings)=>void;saveAttempt:(a:Attempt)=>void;wipe:()=>void;
}
const Context=createContext<AppContextShape|null>(null);
export function useApp(){const ctx=useContext(Context);if(!ctx)throw new Error('AppProvider not mounted');return ctx;}
export function AppProvider({children}:{children:React.ReactNode}){
 const pathname=usePathname();const [ready,setReady]=useState(false),[pinExists,setPinExists]=useState(false);
 const [profiles,setProfiles]=useState<Profile[]>([]),[profileId,setProfileId]=useState<string|null>(null),[settings,setSettings]=useState<Settings>(()=>store.getSettings());
 const [used,setUsed]=useState({own:0,total:0,session:0,householdSession:0});const lastHeartbeat=useRef(Date.now());const foreground=useRef(AppState.currentState==='active');
 const profile=profiles.find(p=>p.id===profileId)||null;
 const reload=useCallback(()=>{
  const list=store.getProfiles();setProfiles(list);const saved=store.getSelectedProfileId();
  setProfileId(current=>list.some(p=>p.id===current)?current:list.some(p=>p.id===saved)?saved:null);
  setSettings(store.getSettings());
 },[]);
 const refreshGate=useCallback(async()=>{setPinExists(await hasParentPin());},[]);
 useEffect(()=>{store.initDatabase();reload();void refreshGate().finally(()=>setReady(true));},[reload,refreshGate]);
 useEffect(()=>{
  const sub=AppState.addEventListener('change',state=>{foreground.current=state==='active';lastHeartbeat.current=Date.now();});
  return ()=>sub.remove();
 },[]);
 const refresh=useCallback(()=>{reload();if(profileId)setUsed(store.getUsage(profileId));},[reload,profileId]);
 useEffect(()=>{if(profileId)setUsed(store.getUsage(profileId));},[profileId]);
 useEffect(()=>{const s=AppState.addEventListener('change',next=>{void setMusicEnabled(next==='active'&&settings.music&&!pathname.startsWith('/parent')&&!settings.paused,settings);});return ()=>s.remove();},[settings.music,settings.volume,settings.paused,pathname]);
 useEffect(()=>{void setMusicEnabled(settings.music&&!pathname.startsWith('/parent')&&!settings.paused,settings);return ()=>{void setMusicEnabled(false,settings);};},[settings.music,settings.volume,settings.paused,pathname]);
 useEffect(()=>{
  const timer=setInterval(()=>{
   const now=Date.now();const diff=heartbeatDelta(lastHeartbeat.current,now);
   if(diff>0)lastHeartbeat.current+=diff*1000;else if(now-lastHeartbeat.current<0||now-lastHeartbeat.current>5000)lastHeartbeat.current=now;
   if(!foreground.current||!profile||pathname.startsWith('/parent')||pathname.startsWith('/finish')||!ready)return;
   if(!store.isAllowed(profile,settings,now)){setUsed(store.getUsage(profile.id,now));return;}
   if(diff>0)store.addForegroundUsage(profile.id,diff,now);
   setUsed(store.getUsage(profile.id,now));
  },1000);
  return ()=>clearInterval(timer);
 },[profile,pathname,settings,ready]);
 const selectProfile=useCallback((id:string)=>{store.setSelectedProfileId(id);setProfileId(id);setUsed(store.getUsage(id));},[]);
 const makeProfile=useCallback((name:string,age:AgeGroup,avatar:string)=>{const p=store.createProfile(name,age,avatar);reload();selectProfile(p.id);},[reload,selectProfile]);
 const editProfile=useCallback((p:Profile)=>{store.updateProfile(p);reload();},[reload]);
 const removeProfile=useCallback((id:string)=>{store.deleteProfile(id);if(id===profileId){store.setSelectedProfileId(null);setProfileId(null);}reload();},[reload,profileId]);
 const savePrefs=useCallback((next:Settings)=>{store.saveSettings(next);setSettings(next);},[]);
 const saveAttempt=useCallback((a:Attempt)=>{if(!profile)return;store.recordAttempt(a,profile.ageGroup);},[profile]);
 const wipe=useCallback(()=>{store.deleteAllLocalData();store.setSelectedProfileId(null);setProfiles([]);setProfileId(null);setSettings(store.getSettings());},[]);
 const own=profile?Math.max(0,profile.dailyLimitMin*60-used.own):0;
 const household=Math.max(0,settings.householdLimitMin*60-used.total);
 const session=profile?Math.max(0,profile.sessionLimitMin*60-used.session):0;
 const sharedSession=profile?Math.max(0,profile.sessionLimitMin*60-used.householdSession):0;
 const timeLeftSec=Math.max(0,Math.min(own,household,session,sharedSession));
 const breakSeconds=Math.max(5,settings.breakReminderMin)*60;
 const breakDue=!!profile&&used.session>=breakSeconds&&used.session%breakSeconds<75;
 const blocked=!!profile&&(!store.isAllowed(profile,settings)||timeLeftSec<=0);
 const value=useMemo(()=>({ready,pinExists,profiles,profile,settings,timeLeftSec,blocked,breakDue,refresh,refreshGate,selectProfile,makeProfile,editProfile,removeProfile,savePrefs,saveAttempt,wipe}),[ready,pinExists,profiles,profile,settings,timeLeftSec,blocked,breakDue,refresh,refreshGate,selectProfile,makeProfile,editProfile,removeProfile,savePrefs,saveAttempt,wipe]);
 return <Context.Provider value={value}>{children}</Context.Provider>;
}
