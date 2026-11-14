import React,{useState} from 'react';
import {Image,View,Text} from 'react-native';
import {router} from 'expo-router';
import {Action,Card,Entry,Head,Page,P,Tag,Tile} from '../src/ui/atoms';
import {C} from '../src/ui/theme';
import {useApp} from '../src/ui/provider';
import {setupParentPin} from '../src/security/parentGate';
import {AGE_BOUNDS} from '../src/core/catalog';
import type {AgeGroup,Locale} from '../src/core/types';
import {t} from '../src/content/i18n';
export default function Home(){
 const a=useApp();const [step,setStep]=useState(0),[pin,setPin]=useState(''),[confirm,setConfirm]=useState(''),[name,setName]=useState('');
 const [age,setAge]=useState<AgeGroup>('3-5'),[avatar,setAvatar]=useState('🦊'),[error,setError]=useState(''),[justCreatedPin,setJustCreatedPin]=useState(false);
 const text=(key:Parameters<typeof t>[1])=>t(a.settings.locale,key);
 if(!a.ready)return <Page title="WonderNest"><P>🌱</P></Page>;
 if(!a.pinExists){
  return <Page title={text('welcome')} subtitle={text('tagline')}>
   {step===0?<><Image source={require('../assets/art/fox.png')} style={{width:225,height:225,alignSelf:'center'}} resizeMode="contain"/><Card><Head>{text('parentSetup')}</Head><P>{text('privacyIntro')}</P><P>{text('privacyDetails')}</P></Card><Action label={text('continue')} onPress={()=>setStep(1)}/></>:
    <Card><Head>{text('pinTitle')}</Head><P>{text('pinHelp')}</P><Entry value={pin} onChangeText={setPin} placeholder={text('pinTitle')} secure numeric/><Entry value={confirm} onChangeText={setConfirm} placeholder={text('pinConfirm')} secure numeric/>{error?<P style={{color:C.red}}>{error}</P>:null}<Action label={text('continue')} onPress={async()=>{if(pin!==confirm){setError(text('invalidPin'));return;}try{await setupParentPin(pin);setJustCreatedPin(true);await a.refreshGate();setError('');}catch(e){setError(String(e));}}}/></Card>}
   <Action kind="soft" label="English / हिंदी / मराठी" onPress={()=>a.savePrefs({...a.settings,locale:({en:'hi',hi:'mr',mr:'en'} as Record<Locale,Locale>)[a.settings.locale]})}/>
  </Page>;
 }
 if(a.profiles.length===0&&!justCreatedPin)return <Page title={text('parentSetup')}><P>{text('gateHelp')}</P><Action label={text('parentArea')} onPress={()=>router.push('/parent')}/></Page>;
 if(a.profiles.length===0)return <Page title={text('createProfile')} subtitle={text('privacyIntro')}><Head>{text('avatar')}</Head><View style={{flexDirection:'row',gap:9}}>{['🦊','🐼','🐰','🦉'].map(icon=><Tile key={icon} emoji={icon} title="" selected={avatar===icon} onPress={()=>setAvatar(icon)}/>)}</View><Head>{text('ageGroup')}</Head><View style={{flexDirection:'row',gap:9}}>{(['3-5','6-8','9-12'] as const).map(group=><Tile key={group} emoji="🌱" title={group} selected={age===group} onPress={()=>setAge(group)}/>)}</View><Entry placeholder={text('profileName')} value={name} onChangeText={setName}/><P>{text('sessionLimit')}: {AGE_BOUNDS[age].session} {text('minutes')}</P><Action label={text('createProfile')} onPress={()=>a.makeProfile(name,age,avatar)}/><Action kind="soft" label={text('parentArea')} onPress={()=>router.push('/parent')}/></Page>;
 if(!a.profile)return <Page title={text('profiles')}><View style={{flexDirection:'row',flexWrap:'wrap',gap:10}}>{a.profiles.map(p=><Tile key={p.id} emoji={p.avatar} title={p.nickname} subtitle={p.ageGroup} onPress={()=>a.selectProfile(p.id)}/>)}</View><Action kind="secondary" label={text('parentArea')} onPress={()=>router.push('/parent')}/></Page>;
 return <Page title={`${a.profile.avatar} ${a.profile.nickname}!`} subtitle={text('tagline')}>
  <Image source={require('../assets/art/forest.png')} style={{width:'100%',height:176,borderRadius:24,marginBottom:15}} resizeMode="cover"/>
  <Card style={{backgroundColor:C.mint}}><Tag>{a.profile.ageGroup}</Tag><Head>🌟 {text('welcome')}</Head><P>⏳ {text('remaining')}: {Math.ceil(a.timeLeftSec/60)} {text('minutes')}</P></Card>
  {a.breakDue&&!a.blocked?<Card style={{backgroundColor:C.yellow}}><P>💧 {text('breakNow')}</P></Card>:null}
  {a.blocked?<Card><Head>{text('timeUp')}</Head><P>{text('timeUpBody')}</P></Card>:<><Action label={text('adventures')} icon="🗺️" onPress={()=>router.push('/worlds')}/><Action kind="secondary" label={text('chooseGame')} icon="🎮" onPress={()=>router.push('/games')}/></>}
  <View style={{flexDirection:'row',gap:8}}><View style={{flex:1}}><Action kind="soft" label={text('rewardTitle')} onPress={()=>router.push('/rewards')}/></View><View style={{flex:1}}><Action kind="soft" label={text('progressTitle')} onPress={()=>router.push('/progress')}/></View></View>
  <Action kind="soft" label={text('switchProfile')} onPress={()=>a.selectProfile('')}/><Action kind="soft" label={`🔒 ${text('parentArea')}`} onPress={()=>router.push('/parent')}/>
 </Page>;
}
