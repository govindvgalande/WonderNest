import React from 'react';
import {Image,View} from 'react-native';
import {router} from 'expo-router';
import {Action,Card,Head,Page,P} from '../src/ui/atoms';
import {useApp} from '../src/ui/provider';
import {GAME_IDS} from '../src/core/types';
import {GAME_INFO} from '../src/core/catalog';
import {t} from '../src/content/i18n';
const worlds={forest:require('../assets/art/forest.png'),rainbow:require('../assets/art/rainbow.png'),treasure:require('../assets/art/treasure.png'),castle:require('../assets/art/castle.png'),mountain:require('../assets/art/mountain.png')};
export default function Worlds(){const {settings,blocked,profile}=useApp();const loc=settings.locale;
 return <Page title={t(loc,'adventures')}><Action kind="soft" label={t(loc,'back')} onPress={()=>router.back()}/>{Object.entries(worlds).map(([world,image])=><Card key={world}>
  <Image source={image} resizeMode="cover" style={{height:150,width:'100%',borderRadius:19,marginBottom:12}}/><Head>{t(loc,`world_${world}` as Parameters<typeof t>[1])}</Head><View style={{gap:4}}>{GAME_IDS.filter(id=>GAME_INFO[id].world===world).map(id=><Action key={id} kind="soft" disabled={blocked||!!profile?.disabledGames.includes(id)} label={`${GAME_INFO[id].icon} ${t(loc,`game_${id}` as Parameters<typeof t>[1])}`} onPress={()=>router.push({pathname:'/play/[id]',params:{id}})}/>)}</View>
 </Card>)}</Page>;
}
