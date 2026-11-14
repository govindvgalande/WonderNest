import React,{useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {Alert,Pressable,ScrollView,Text,View,useWindowDimensions} from 'react-native';
import * as Crypto from 'expo-crypto';
import {router,useLocalSearchParams} from 'expo-router';
import type {Challenge,GameId} from '../../src/core/types';
import {GAME_IDS} from '../../src/core/types';
import {GAME_INFO,TOKEN_ICONS} from '../../src/core/catalog';
import {allowedNextCell,evaluateChallenge,isMatchingCardPair,generateChallenge} from '../../src/core/generate';
import {getDifficulty,getActiveRun,saveActiveRun,clearActiveRun} from '../../src/storage/database';
import {useApp} from '../../src/ui/provider';
import {Action,Card,Head,Page,P,Tag,Tile} from '../../src/ui/atoms';
import {C} from '../../src/ui/theme';
import {FlipCard} from '../../src/ui/FlipCard';
import {t,tokenName} from '../../src/content/i18n';
import {playTone,speakInstruction,stopSounds,stopVoice} from '../../src/audio/sound';
const newSeed=()=>parseInt(Crypto.randomUUID().replace(/-/g,'').slice(0,8),16)>>>0;
function Item({id,locale,selected=false,onPress,disabled=false,dim=false,highlight=false}:{id:string;locale:'en'|'hi'|'mr';selected?:boolean;onPress:()=>void;disabled?:boolean;dim?:boolean;highlight?:boolean}){
 return <View style={{width:'30%',marginHorizontal:'1%',marginVertical:5,opacity:dim?.35:1,transform:[{scale:highlight?1.05:1}]}}><Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={tokenName(locale,id)} accessibilityState={{selected,disabled}} style={({pressed})=>({backgroundColor:selected?C.lavender:C.white,borderWidth:selected?3:1,borderColor:selected?C.violet:C.border,borderRadius:18,paddingVertical:12,paddingHorizontal:2,minHeight:85,alignItems:'center',justifyContent:'center',opacity:pressed?.7:1})}>
  <Text style={{fontSize:32}}>{TOKEN_ICONS[id]||'⭐'}</Text><Text style={{fontSize:12,fontWeight:'700',color:C.ink,textAlign:'center',paddingHorizontal:3}}>{tokenName(locale,id)}</Text>
 </Pressable></View>;
}
function Grid({challenge,preview,chosen,onSelect,locale}:{challenge:Challenge;preview:boolean;chosen:string[];onSelect:(id:string)=>void;locale:'en'|'hi'|'mr'}){
 const size=challenge.gridSize||3;const {width}=useWindowDimensions();const side=Math.max(42,Math.min(80,(Math.min(width,620)-72)/size-6));
 return <View style={{alignItems:'center',marginVertical:15}}><View style={{width:(side+5)*size,flexDirection:'row',flexWrap:'wrap',justifyContent:'center'}}>{challenge.options.map((cell,index)=>{
  const step=(preview?challenge.preview:chosen).indexOf(cell);const wall=challenge.mode==='maze'&&!challenge.board?.includes(cell);
  const isStart=index===0;const end=challenge.answer[challenge.answer.length-1]===cell;
  return <Pressable key={cell} onPress={()=>onSelect(cell)} disabled={preview||wall} accessibilityLabel={`${isStart?t(locale,'startLabel'):end?t(locale,'goalLabel'):t(locale,'squareLabel')} ${index+1}${wall?' '+t(locale,'wallLabel'):''}`} accessibilityRole="button" style={{margin:2,width:side,height:side,alignItems:'center',justifyContent:'center',borderRadius:13,borderWidth:2,borderColor:step>=0?C.green:C.border,backgroundColor:wall?'#CCD5DB':step>=0?C.mint:C.white}}>
   <Text style={{fontWeight:'900',fontSize:step>=0?19:15,color:C.ink}}>{step>=0?`${step+1}`:isStart?'🚩':end?'🎁':'·'}</Text>
  </Pressable>;
 })}</View></View>;
}
/** Non-animated spatial memory board: shapes occupy fixed locations, unlike
 * Pattern Memory's timed sequence. Blank slots remain visible to show progress. */
function ShapeGrid({items,cols,locale}:{items:string[];cols:number;locale:'en'|'hi'|'mr'}){
 const slots=Array.from({length:cols*cols},(_,i)=>items[i]);
 return <View style={{flexDirection:'row',flexWrap:'wrap',justifyContent:'center',marginVertical:12,gap:7}}>
   {slots.map((item,i)=><View key={i} accessible accessibilityLabel={item?tokenName(locale,item):`${t(locale,'squareLabel')} ${i+1}`}
     style={{width:cols===2?'43%':'29%',height:78,backgroundColor:item?C.white:C.mint,borderColor:item?C.green:C.border,
       borderWidth:2,borderRadius:18,alignItems:'center',justifyContent:'center'}}>
     <Text style={{fontSize:34}}>{item?TOKEN_ICONS[item]||'⭐':'·'}</Text>
   </View>)}
 </View>;
}
export default function Game(){
 const params=useLocalSearchParams<{id:string}>();const gameId=GAME_IDS.find(x=>x===params.id);const a=useApp();const p=a.profile;const loc=a.settings.locale;
 const [challenge,setChallenge]=useState<Challenge|null>(null);
 const [phase,setPhase]=useState<'preview'|'answer'|'completed'>('preview');
 const [chosen,setChosen]=useState<string[]>([]),[flipped,setFlipped]=useState<number[]>([]),[matched,setMatched]=useState<number[]>([]);
 const [hintText,setHintText]=useState(''),[mistakes,setMistakes]=useState(0),[hints,setHints]=useState(0),[feedback,setFeedback]=useState('');
 const [success,setSuccess]=useState(false),[paused,setPaused]=useState(false),[lit,setLit]=useState(-1),[narrationError,setNarrationError]=useState(false),[soundBusy,setSoundBusy]=useState(false),[showSoundVisual,setShowSoundVisual]=useState(false);
 const lock=useRef(false),finished=useRef(false),seqToken=useRef(0),started=useRef(Date.now());
 const timeouts=useRef<ReturnType<typeof setTimeout>[]>([]);
 const schedule=(fn:()=>void,ms:number)=>{const tid=setTimeout(()=>{timeouts.current=timeouts.current.filter(t=>t!==tid);fn();},ms);timeouts.current.push(tid);};
 useEffect(()=>()=>{for(const t of timeouts.current)clearTimeout(t);timeouts.current=[];},[]);
 const title=gameId?t(loc,`game_${gameId}` as Parameters<typeof t>[1]):'';
 useEffect(()=>{
  if(!p||!gameId)return;
  const saved=getActiveRun(p.id,gameId,p.ageGroup);
  const diff=getDifficulty(p.id,gameId,p.ageGroup);
  const c=saved?.challenge||generateChallenge(gameId,p.ageGroup,diff.level,newSeed());
  setChallenge(c);setPhase(saved?.phase||(c.mode==='cards'?'answer':'preview'));
  setChosen(saved?.chosen||[]);setMatched(saved?.matched||[]);
  setMistakes(saved?.mistakes||0);setHints(saved?.hints||0);
  setFlipped([]);setFeedback('');setHintText('');setShowSoundVisual(false);
  started.current=saved?.startedAt||Date.now();
  return ()=>{seqToken.current++;stopSounds();stopVoice();};
 },[p?.id,gameId]);
 useEffect(()=>{if((a.blocked||!!(gameId&&p?.disabledGames.includes(gameId)))&&phase!=='completed')router.replace('/');},[a.blocked,phase]);
 // Save completed navigation/selection state to local SQLite after each interaction.
 useEffect(()=>{
  if(!p||!gameId||!challenge||challenge.gameId!==gameId||challenge.ageGroup!==p.ageGroup||phase==='completed'||finished.current)return;
  saveActiveRun(p.id,gameId,{challenge,phase,chosen,matched,mistakes,hints,startedAt:started.current});
 },[p?.id,p?.ageGroup,gameId,challenge,phase,chosen,matched,mistakes,hints]);
 // Visual sequence highlighting, no stressful countdown. Children decide when ready.
 useEffect(()=>{
  if(!challenge||phase!=='preview'||paused||a.settings.reducedMotion||!(challenge.mode==='sequence'))return;
  let i=0;const tid=setInterval(()=>{setLit(i%challenge.preview.length);i++;},750);
  return ()=>{clearInterval(tid);setLit(-1);};
 },[challenge?.id,phase,paused]);
 const say=useCallback(async(text:string)=>{const available=await speakInstruction(text,loc,a.settings);if(!available)setNarrationError(true);},[loc,a.settings]);
 const playSequence=useCallback(async()=>{
  if(!challenge||challenge.gameId!=='sounds'||soundBusy)return;
  const token=++seqToken.current;setSoundBusy(true);
  for(let i=0;i<challenge.preview.length;i++){
   if(token!==seqToken.current)break;
   await playTone(challenge.preview[i]!,a.settings);
   await new Promise(resolve=>setTimeout(resolve,650));
  }
  if(token===seqToken.current)setSoundBusy(false);
 },[challenge,soundBusy,a.settings]);
 useEffect(()=>{
  if(challenge?.gameId==='sounds'&&phase==='preview'&&!paused&&a.settings.sound&&a.settings.volume>0){
    void playSequence();
  }
 // Run once for a new preview. The player itself handles cancellation on leave.
 },[challenge?.id,phase]);
 useEffect(()=>{if(paused){seqToken.current++;stopSounds();setSoundBusy(false);}},[paused]);
 const reset=()=>{
  if(!p||!gameId)return;
  seqToken.current++;stopSounds();for(const t of timeouts.current)clearTimeout(t);timeouts.current=[];finished.current=false;lock.current=false;
  const diff=getDifficulty(p.id,gameId,p.ageGroup);const c=generateChallenge(gameId,p.ageGroup,diff.level,newSeed());
  setChallenge(c);setPhase(c.mode==='cards'?'answer':'preview');setChosen([]);setFlipped([]);setMatched([]);setMistakes(0);setHints(0);setHintText('');setFeedback('');setSuccess(false);setPaused(false);setSoundBusy(false);setShowSoundVisual(false);started.current=Date.now();
 };
 const complete=(correct:boolean,overrideMistakes=mistakes)=>{
  if(!challenge||!p||finished.current)return;
  finished.current=true;seqToken.current++;stopSounds();stopVoice();
  clearActiveRun(p.id,challenge.gameId);
  a.saveAttempt({profileId:p.id,gameId:challenge.gameId,seed:challenge.seed,level:challenge.level,correct,mistakes:overrideMistakes,hints,durationSec:Math.max(1,Math.floor((Date.now()-started.current)/1000))});
  setSuccess(correct);setPhase('completed');if(correct)void playTone('success',a.settings);
 };
 const onCard=(index:number)=>{
  if(!challenge?.board||lock.current||matched.includes(index)||flipped.includes(index)||phase!=='answer')return;
  const newFlip=[...flipped,index];setFlipped(newFlip);
  if(newFlip.length===2){
   lock.current=true;const [i,j]=newFlip;
   if(isMatchingCardPair(challenge,i!,j!)){
    schedule(()=>{
     const updated=[...matched,i!,j!];setMatched(updated);setFlipped([]);lock.current=false;
     if(updated.length===challenge.board!.length)complete(true);
    },350);
   }else{
    setMistakes(m=>m+1);setFeedback(t(loc,'feedbackFail'));void playTone('wood',a.settings);
    schedule(()=>{setFlipped([]);lock.current=false;},950);
   }
  }
 };
 const onChoice=(item:string)=>{
  if(!challenge||phase!=='answer'||finished.current||paused)return;
  if(challenge.mode==='cards')return;
  if(challenge.mode==='multi'){
   setChosen(old=>old.includes(item)?old.filter(x=>x!==item):[...old,item]);return;
  }
  if(challenge.mode==='single'){
   if(evaluateChallenge(challenge,[item]))complete(true);
   else{setMistakes(m=>m+1);setFeedback(t(loc,'wrong'));void playTone('wood',a.settings);}
   return;
  }
  if((challenge.mode==='route'||challenge.mode==='maze')&&!allowedNextCell(challenge,chosen,item)){
   setFeedback(t(loc,'wrong'));setMistakes(m=>m+1);return;
  }
  if(challenge.gameId==='sounds')void playTone(item,a.settings);
  const attempted=[...chosen,item];
  if(attempted.length===challenge.answer.length){
   if(evaluateChallenge(challenge,attempted))complete(true);
   else{setMistakes(m=>m+1);setFeedback(t(loc,'wrong'));setChosen([]);}
  }else{setChosen(attempted);setFeedback('');}
 };
 const useHint=()=>{
  if(!challenge||phase!=='answer')return;
  setHints(x=>x+1);
  if(challenge.mode==='cards'){
   const board=challenge.board||[];const first=board.findIndex((_,i)=>!matched.includes(i));
   if(first<0)return;
   const second=board.findIndex((v,i)=>i!==first&&!matched.includes(i)&&v===board[first]);
   lock.current=true;setFlipped([first,second]);schedule(()=>{setFlipped([]);lock.current=false;},1500);
  }else {
   let answer=challenge.answer.find(x=>challenge.mode==='multi'?!chosen.includes(x):false)||challenge.answer[chosen.length]||challenge.answer[0];
   if(answer?.startsWith('cell:'))answer=`${Number(answer.split(':')[1])+1}`;
   setHintText(`${t(loc,chosen.length?'hintNext':'hintFirst')}: ${TOKEN_ICONS[answer||'']||''} ${tokenName(loc,answer||'')}`);
  }
 };
 const goBack=()=>Alert.alert(title,t(loc,'confirmFinish'),[{text:t(loc,'cancel'),style:'cancel'},{text:t(loc,'finish'),onPress:()=>router.replace('/finish')}]);
 if(!p||!gameId)return <Page title="WonderNest"><Action label={t(loc,'home')} onPress={()=>router.replace('/')}/></Page>;
 if(!challenge)return <Page title={title}><P>🌈</P></Page>;
 const instruction=t(loc,`prompt_${challenge.prompt}` as Parameters<typeof t>[1]);
 const selectionMode=challenge.mode==='multi'||challenge.mode==='single'||challenge.mode==='sequence'||challenge.mode==='reconstruct';
 return <Page title={`${GAME_INFO[gameId].icon} ${title}`} subtitle={`${t(loc,'ageGroup')}: ${p.ageGroup}  •  ${t(loc,'levelLabel')} ${challenge.level}`}>
  <View style={{flexDirection:'row',gap:10}}><View style={{flex:1}}><Action kind="soft" label={t(loc,'back')} onPress={goBack} small/></View><View style={{flex:1}}><Action kind="soft" label={paused?t(loc,'resume'):t(loc,'pause')} onPress={()=>setPaused(!paused)} small/></View></View>
  {a.breakDue&&!a.blocked?<Card style={{backgroundColor:C.yellow}}><P>💧 {t(loc,'breakNow')}</P></Card>:null}
  {paused?<Card><Head>{t(loc,'pause')}</Head><Action label={t(loc,'resume')} onPress={()=>setPaused(false)}/><Action kind="soft" label={t(loc,'finish')} onPress={()=>router.replace('/finish')}/></Card>:
  phase==='completed'?<Card style={{backgroundColor:C.mint}}><Text style={{textAlign:'center',fontSize:65}}>{success?'🌟':'🌱'}</Text><Head>{success?t(loc,'great'):t(loc,'tryAgainMessage')}</Head><P>{t(loc,'youTried')}</P><P>🧠 {t(loc,'attempts')}: {mistakes+1} • {t(loc,'hint')}: {hints}</P><Action label={t(loc,'done')} onPress={()=>router.replace('/finish')}/><Action kind="soft" label={t(loc,'again')} onPress={reset}/></Card>:
  <>
   <Card><Head>{instruction}</Head><P>{phase==='preview'?t(loc,'ready'):challenge.mode==='multi'?t(loc,'selectAll'):challenge.mode==='single'?t(loc,'selectOne'):(challenge.mode==='route'||challenge.mode==='maze')?t(loc,'tapRoute'):challenge.mode==='reconstruct'?t(loc,'tapGrid'):t(loc,'tapOrder')}</P>
    {a.settings.narration?<Action kind="soft" small label={t(loc,'readInstruction')} onPress={()=>void say(instruction)}/>:null}
    {narrationError?<P style={{color:C.muted}}>{t(loc,'noVoice')}</P>:null}
    {challenge.gameId==='sounds'?<Action kind="secondary" label={t(loc,'listenAgain')} disabled={soundBusy||!a.settings.sound||a.settings.volume===0} onPress={()=>void playSequence()}/>:null}
   </Card>
   {phase==='preview'?<Card style={{backgroundColor:C.blue}}>
      {challenge.gameId==='sounds'&&a.settings.sound&&a.settings.volume>0&&!showSoundVisual?
        <View style={{alignItems:'center',paddingVertical:18}}><Text style={{fontSize:70}}>🎶</Text><P style={{textAlign:'center'}}>{t(loc,'soundPreviewHelp')}</P>
         <Action kind="soft" label={t(loc,'soundVisual')} onPress={()=>setShowSoundVisual(true)}/></View>:
       challenge.mode==='reconstruct'?<ShapeGrid items={challenge.preview} cols={challenge.gridSize||2} locale={loc}/>:challenge.gridSize?<Grid challenge={challenge} chosen={[]} preview locale={loc} onSelect={()=>{}}/>:
       challenge.prompt==='observe'?<View style={{flexDirection:'row',flexWrap:'wrap',justifyContent:'center'}}>{challenge.preview.map((line,i)=>{
        const [actor,place]=line.split('@');return <View key={i} style={{width:'46%',backgroundColor:C.white,borderRadius:17,margin:5,padding:12,alignItems:'center'}}><Text style={{fontSize:42}}>{TOKEN_ICONS[actor!]}</Text><Text style={{fontSize:32}}>{TOKEN_ICONS[place!]}</Text><P style={{textAlign:'center'}}>{t(loc,'scenePlace',{actor:tokenName(loc,actor!),place:tokenName(loc,place!)})}</P></View>;
       })}</View>:
       challenge.storyFrames?<View>{challenge.storyFrames.map((frame,i)=><Card key={i}><P>{`${i+1}.  ${TOKEN_ICONS[frame.actor]}  ${TOKEN_ICONS[frame.object]}  ${TOKEN_ICONS[frame.place]}`}</P><P>{t(loc,'sceneStory',{actor:tokenName(loc,frame.actor),object:tokenName(loc,frame.object),place:tokenName(loc,frame.place)})}</P></Card>)}</View>:
       <View style={{flexDirection:'row',flexWrap:'wrap',justifyContent:'center'}}>{challenge.preview.map((id,i)=><Item key={i} id={id} locale={loc} dim={lit!==-1&&lit!==i} highlight={lit===i} disabled onPress={()=>{}}/>)}</View>}
     <Action label={t(loc,'ready')} onPress={()=>{seqToken.current++;stopSounds();setPhase('answer');setLit(-1);setSoundBusy(false);}}/>
    </Card>:
    <>
     {challenge.prompt==='missing'&&challenge.board?<Card style={{backgroundColor:C.blue}}><View style={{flexDirection:'row',flexWrap:'wrap',justifyContent:'center'}}>{challenge.board.map(id=><Item key={id} id={id} locale={loc} disabled onPress={()=>{}}/>)}</View></Card>:null}
     {challenge.prompt==='observe'?<Card><Head>{t(loc,'questionObserve',{item:tokenName(loc,challenge.cue||'')})}</Head></Card>:null}
     {challenge.prompt==='story'?<Card><Head>{t(loc,'questionStory',{item:tokenName(loc,challenge.cue||'')})}</Head></Card>:null}
     {(challenge.mode==='route'||challenge.mode==='maze')?<Card><Grid challenge={challenge} preview={false} chosen={chosen} locale={loc} onSelect={onChoice}/><P>{chosen.length} / {challenge.answer.length}</P></Card>:null}
     {challenge.mode==='cards'?<Card><View style={{flexDirection:'row',flexWrap:'wrap',justifyContent:'center'}}>{(challenge.board||[]).map((id,i)=>{
      const faceUp=flipped.includes(i)||matched.includes(i);
      return <View key={i} style={{width:'24%',padding:3}}><FlipCard id={id} locale={loc} faceUp={faceUp} matched={matched.includes(i)} reducedMotion={a.settings.reducedMotion} onPress={()=>onCard(i)}/></View>;
     })}</View><P>{matched.length/2} / {(challenge.board?.length||0)/2}</P></Card>:null}
     {selectionMode?<Card>
      {challenge.mode==='reconstruct'?<ShapeGrid items={chosen} cols={challenge.gridSize||2} locale={loc}/>:chosen.length>0?<P>✓ {chosen.map(x=>TOKEN_ICONS[x]||tokenName(loc,x)).join('  →  ')}</P>:null}
      <View style={{flexDirection:'row',flexWrap:'wrap',justifyContent:'center'}}>{challenge.options.map(id=><Item key={id} id={id} locale={loc} selected={chosen.includes(id)} disabled={challenge.mode==='sequence'&&gameId==='order'&&chosen.includes(id)} onPress={()=>onChoice(id)}/>)}</View>
      {challenge.mode==='multi'?<Action label={t(loc,'submit')} disabled={!chosen.length} onPress={()=>{if(evaluateChallenge(challenge,chosen))complete(true);else{setMistakes(m=>m+1);setFeedback(t(loc,'wrong'));void playTone('wood',a.settings);}}}/>:null}
      {(challenge.mode==='sequence'||challenge.mode==='reconstruct')&&chosen.length>0?<Action kind="soft" label={t(loc,'clear')} onPress={()=>setChosen([])}/>:null}
     </Card>:null}
     {(challenge.mode==='route'||challenge.mode==='maze')&&chosen.length>0?<Action kind="soft" label={t(loc,'clear')} onPress={()=>{setChosen([]);setFeedback('');setHintText('');}}/>:null}
     {feedback?<P style={{color:C.red,textAlign:'center'}}>{feedback}</P>:null}
     {hintText?<Card style={{backgroundColor:C.yellow}}><P>{hintText}</P></Card>:null}
     <Action kind="soft" label={t(loc,'hint')} onPress={useHint}/>
     {mistakes>=2?<Action kind="secondary" label={t(loc,'again')} onPress={()=>complete(false)}/>:null}
    </>}
  </>}
 </Page>;
}
