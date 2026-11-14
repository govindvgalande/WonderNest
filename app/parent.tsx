import React,{useEffect,useState} from 'react';
import {Alert,AppState,Switch,View} from 'react-native';
import {router,useFocusEffect} from 'expo-router';
import {Action,Card,Entry,Head,Meter,Page,P,Tag,Tile} from '../src/ui/atoms';
import {C} from '../src/ui/theme';
import {useApp} from '../src/ui/provider';
import {getProgress,getWeek,getUsage} from '../src/storage/database';
import {clearParentCredentials,recoverParentPinUsingDeviceLock,verifyParentPin} from '../src/security/parentGate';
import {GAME_IDS} from '../src/core/types';
import {AGE_BOUNDS,GAME_INFO} from '../src/core/catalog';
import type {AgeGroup,Locale,Profile,Settings} from '../src/core/types';
import {t} from '../src/content/i18n';
import {withinAllowedHours} from '../src/core/time';
type Tab='dashboard'|'children'|'limits'|'learning'|'settings'|'privacy'|'help';
function Counter({label,value,onChange,min=1,max=120}:{label:string;value:number;onChange:(n:number)=>void;min?:number;max?:number}){
 return <View style={{marginVertical:8}}><P>{label}: <P style={{fontWeight:'800'}}>{value}</P></P><View style={{flexDirection:'row',alignItems:'center',gap:12}}><View style={{width:70}}><Action kind="soft" label="−" onPress={()=>onChange(Math.max(min,value-1))}/></View><View style={{width:70}}><Action kind="soft" label="+" onPress={()=>onChange(Math.min(max,value+1))}/></View></View></View>;
}
function Toggle({label,value,onChange}:{label:string;value:boolean;onChange:(v:boolean)=>void}){
 return <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingVertical:10}}><P style={{flex:1}}>{label}</P><Switch accessibilityLabel={label} value={value} onValueChange={onChange} trackColor={{true:C.mint,false:C.border}} thumbColor={C.green}/></View>;
}
export default function Parent(){
 const a=useApp(),loc=a.settings.locale;const text=(key:Parameters<typeof t>[1])=>t(loc,key);
 const [authenticated,setAuthenticated]=useState(false),[pin,setPin]=useState(''),[error,setError]=useState(''),[tab,setTab]=useState<Tab>('dashboard');
 const [editing,setEditing]=useState<Profile|null>(null),[newName,setNewName]=useState(''),[newAge,setNewAge]=useState<AgeGroup>('3-5'),[recovering,setRecovering]=useState(false);
 const [from,setFrom]=useState(a.settings.allowedFrom),[to,setTo]=useState(a.settings.allowedUntil);
 const prefs=(changes:Partial<Settings>)=>a.savePrefs({...a.settings,...changes});
 useFocusEffect(React.useCallback(()=>()=>{setAuthenticated(false);setPin('');},[]));
 useEffect(()=>{const sub=AppState.addEventListener('change',state=>{if(state!=='active')setAuthenticated(false);});return ()=>sub.remove();},[]);
 async function authenticate(){try{const result=await verifyParentPin(pin);if(result.ok){setAuthenticated(true);setError('');a.refresh();}else setError(result.lockedSeconds?`${text('locked')} (${result.lockedSeconds}s)`:text('invalidPin'));}catch(e){setError(String(e));}}
 async function recover(){try{const ok=await recoverParentPinUsingDeviceLock(pin);setError(ok?text('pinUpdated'):text('gateHelp'));setRecovering(false);}catch(e){setError(String(e));}}
 const confirmProfileDelete=(p:Profile)=>Alert.alert(text('deleteProfile'),text('deleteConfirm'),[{text:text('cancel'),style:'cancel'},{text:text('yesDelete'),style:'destructive',onPress:()=>{a.removeProfile(p.id);setEditing(null);}}]);
 const deleteAll=()=>Alert.alert(text('resetAll'),text('deleteAllConfirm'),[{text:text('cancel'),style:'cancel'},{text:text('yesDelete'),style:'destructive',onPress:()=>{a.wipe();a.refresh();setTab('dashboard');}}]);
 if(!authenticated)return <Page title={`🔒 ${text('parentArea')}`} subtitle={text('gateHelp')}><Card><Head>{recovering?text('pinRecovery'):text('enterPin')}</Head><Entry testID="parent-pin" value={pin} onChangeText={setPin} placeholder={text('enterPin')} secure numeric/>{error?<P style={{color:C.red}}>{error}</P>:null}<Action testID="parent-unlock" label={recovering?text('recover'):text('unlock')} onPress={()=>void(recovering?recover():authenticate())}/><Action kind="soft" label={recovering?text('back'):text('recover')} onPress={()=>{setRecovering(!recovering);setError('');}}/></Card><Action kind="soft" label={text('home')} onPress={()=>router.replace('/')}/></Page>;
 const tabs:[Tab,string,string][]=[['dashboard','parentDashboard','🏡'],['children','management','👧'],['limits','screenTime','⏰'],['learning','learning','📚'],['settings','settings','⚙️'],['privacy','privacy','🔒'],['help','support','❔']];
 return <Page title={text('parentDashboard')}><Action kind="soft" label={text('home')} onPress={()=>router.replace('/')}/>
  <View style={{flexDirection:'row',flexWrap:'wrap',gap:7,marginBottom:14}}>{tabs.map(([value,key,icon])=><View key={value} style={{width:'48%'}}><Action small kind={tab===value?'secondary':'soft'} label={`${icon} ${text(key as Parameters<typeof t>[1])}`} onPress={()=>{setEditing(null);setTab(value);}}/></View>)}</View>
  {tab==='dashboard'?<><Card style={{backgroundColor:C.mint}}><Head>{a.profiles.length} {text('profiles')}</Head><P>{text('screenTimeInfo')}</P></Card>{a.profiles.map(p=>{const u=getUsage(p.id);const progress=getProgress(p.id);return <Card key={p.id}><Head>{p.avatar} {p.nickname}</Head><P>{text('today')}: {Math.ceil(u.own/60)} {text('minutes')} • {text('gamesPlayed')}: {progress.reduce((sum,x)=>sum+x.plays,0)}</P><Meter label={text('screenTime')} value={u.own} max={p.dailyLimitMin*60}/></Card>})}</>:null}
  {tab==='children'?<>
   <Card><Head>{text('createProfile')}</Head><Entry value={newName} onChangeText={setNewName} placeholder={text('profileName')}/><View style={{flexDirection:'row',gap:7}}>{(['3-5','6-8','9-12'] as const).map(group=><View style={{flex:1}} key={group}><Action small label={group} kind={newAge===group?'secondary':'soft'} onPress={()=>setNewAge(group)}/></View>)}</View><Action label={text('createProfile')} onPress={()=>{a.makeProfile(newName,newAge,'🐼');setNewName('');}}/></Card>
   {a.profiles.map(p=><Card key={p.id}><Head>{p.avatar} {p.nickname} ({p.ageGroup})</Head><Action kind="soft" label={text('edit')} onPress={()=>setEditing(editing?.id===p.id?null:{...p})}/>
    {editing?.id===p.id?<>
     <Entry value={editing.nickname} onChangeText={nickname=>setEditing({...editing,nickname})} placeholder={text('profileName')}/>
     <View style={{flexDirection:'row',gap:4}}>{(['3-5','6-8','9-12'] as const).map(group=><View key={group} style={{flex:1}}><Action small kind={editing.ageGroup===group?'secondary':'soft'} label={group} onPress={()=>setEditing({...editing,ageGroup:group})}/></View>)}</View>
     <View style={{flexDirection:'row',gap:5}}>{['🦊','🦉','🐼','🐰'].map(icon=><View key={icon} style={{flex:1}}><Action kind={editing.avatar===icon?'secondary':'soft'} label={icon} onPress={()=>setEditing({...editing,avatar:icon})}/></View>)}</View>
     <Counter label={text('dailyLimit')} value={editing.dailyLimitMin} onChange={dailyLimitMin=>setEditing({...editing,dailyLimitMin})} max={180}/><Counter label={text('sessionLimit')} value={editing.sessionLimitMin} onChange={sessionLimitMin=>setEditing({...editing,sessionLimitMin})} max={120}/>
     <Head>{text('chooseGame')}</Head>{GAME_IDS.map(id=><Toggle key={id} label={`${GAME_INFO[id].icon} ${t(loc,`game_${id}` as Parameters<typeof t>[1])}`} value={!editing.disabledGames.includes(id)} onChange={allowed=>setEditing({...editing,disabledGames:allowed?editing.disabledGames.filter(x=>x!==id):[...editing.disabledGames,id]})}/>)}
     <Action label={text('save')} onPress={()=>{a.editProfile(editing);setEditing(null);a.refresh();}}/>
    </>:null}<Action kind="danger" label={text('deleteProfile')} onPress={()=>confirmProfileDelete(p)}/></Card>)}
  </>:null}
  {tab==='limits'?<>
   <Card><Head>{text('screenTime')}</Head><Toggle label={text('pauseAll')} value={a.settings.paused} onChange={paused=>prefs({paused})}/><Counter label={text('familyLimit')} value={a.settings.householdLimitMin} onChange={householdLimitMin=>prefs({householdLimitMin})} max={240}/><Counter label={text('breakReminder')} value={a.settings.breakReminderMin} onChange={breakReminderMin=>prefs({breakReminderMin})} min={5} max={60}/>
   <P>{text('playHours')}</P><Entry value={from} onChangeText={setFrom} placeholder="07:00"/><Entry value={to} onChangeText={setTo} placeholder="20:00"/><Action label={text('save')} onPress={()=>{const valid=/^([01]\d|2[0-3]):[0-5]\d$/.test(from)&&/^([01]\d|2[0-3]):[0-5]\d$/.test(to);if(valid)prefs({allowedFrom:from,allowedUntil:to});else Alert.alert(text('errorTitle'),text('invalidHours'));}}/>
   <P>{text('screenTimeInfo')}</P></Card>
   {a.profiles.map(p=>{const u=getUsage(p.id);return <Card key={p.id}><Head>{p.avatar} {p.nickname}</Head><P>{text('dailyLimit')}: {p.dailyLimitMin} • {text('sessionLimit')}: {p.sessionLimitMin}</P><P>{text('today')}: {Math.floor(u.own/60)} {text('minutes')} • {text('sessionLabel')}: {Math.floor(u.session/60)} {text('minutes')}</P><Meter label={text('remaining')} value={u.own} max={p.dailyLimitMin*60}/></Card>})}
  </>:null}
  {tab==='learning'?a.profiles.map(p=>{const progress=getProgress(p.id),week=getWeek(p.id);return <Card key={p.id}><Head>{p.avatar} {p.nickname}</Head><P>{text('gamesPlayed')}: {progress.reduce((s,x)=>s+x.plays,0)} • {text('completed')}: {progress.reduce((s,x)=>s+x.wins,0)}</P>
   {progress.map(s=><View key={s.gameId}><P>{GAME_INFO[s.gameId].icon} {t(loc,`game_${s.gameId}` as Parameters<typeof t>[1])}: {s.accuracy}% • {text('levelLabel')} {s.level}</P><Meter label={text('accuracy')} value={s.accuracy} max={100}/></View>)}<Head>{text('weekly')}</Head>{week.map(d=><P key={d.day}>{d.day}: {d.plays} {text('gamesPlayed')} / {d.wins} {text('completed')}</P>)}{!progress.length?<P>{text('noData')}</P>:null}
  </Card>}):null}
  {tab==='settings'?<Card><Head>{text('language')}</Head><View style={{flexDirection:'row',gap:5}}>{(['en','hi','mr'] as const).map(x=><View style={{flex:1}} key={x}><Action kind={loc===x?'secondary':'soft'} label={{en:'English',hi:'हिंदी',mr:'मराठी'}[x]} onPress={()=>prefs({locale:x})}/></View>)}</View>
   <Toggle label={text('effects')} value={a.settings.sound} onChange={sound=>prefs({sound})}/><Toggle label={text('music')} value={a.settings.music} onChange={music=>prefs({music})}/><Toggle label={text('narration')} value={a.settings.narration} onChange={narration=>prefs({narration})}/><Toggle label={text('reducedMotion')} value={a.settings.reducedMotion} onChange={reducedMotion=>prefs({reducedMotion})}/><Counter label={text('volume')} value={Math.round(a.settings.volume*10)} onChange={v=>prefs({volume:v/10})} min={0} max={10}/><P>{text('soundInfo')}</P>
  </Card>:null}
  {tab==='privacy'?<Card><Head>{text('privacyIntro')}</Head><P>{text('privacyDetails')}</P><P>{text('screenTimeInfo')}</P><Action kind="danger" label={text('resetAll')} onPress={deleteAll}/></Card>:null}
  {tab==='help'?<Card><Head>{text('support')}</Head><P>{text('helpMessage')}</P><P>{text('soundInfo')}</P></Card>:null}
 </Page>;
}
