import React from 'react';
import {Image,Text,View} from 'react-native';
import {router} from 'expo-router';
import {Action,Card,Head,Page,P} from '../src/ui/atoms';
import {useApp} from '../src/ui/provider';
import {t} from '../src/content/i18n';
import {C} from '../src/ui/theme';

/** First guided card-pair activity, with purely visual instructions for pre-readers.
 * This route is presented after an adult creates the first child profile. */
export default function Tutorial(){
  const {settings,profile,blocked}=useApp();
  const locale=settings.locale;
  if(!profile)return <Page title="WonderNest"><Action label={t(locale,'home')} onPress={()=>router.replace('/')}/></Page>;
  return <Page title={t(locale,'tutorialTitle')} subtitle={t(locale,'tagline')}>
    <Image source={require('../assets/art/fox.png')} resizeMode="contain"
      style={{width:210,height:180,alignSelf:'center'}} />
    <Card style={{backgroundColor:C.mint}}>
      <Head>{t(locale,'game_cards')}</Head>
      <P>{t(locale,'tutorialBody')}</P>
      <View style={{flexDirection:'row',gap:8,justifyContent:'center',marginVertical:12}}>
        {['🦊','🐼','🦊','🐰'].map((icon,i)=>
          <View key={i} accessible accessibilityLabel={icon} style={{width:58,height:72,borderRadius:12,
            backgroundColor:C.white,alignItems:'center',justifyContent:'center',borderWidth:2,
            borderColor:i===0||i===2?C.green:C.border}}>
            <Text style={{fontSize:30}}>{icon}</Text>
          </View>)}
      </View>
      <P>👀 {t(locale,'tutorialStepOne')}</P>
      <P>🧩 {t(locale,'tutorialStepTwo')}</P>
      <P>🌟 {t(locale,'tutorialStepThree')}</P>
    </Card>
    <Action label={t(locale,'tutorialStart')} icon="🃏" disabled={blocked||profile.disabledGames.includes('cards')}
      onPress={()=>router.replace({pathname:'/play/[id]',params:{id:'cards'}})}/>
    <Action kind="soft" label={t(locale,'tutorialLater')} icon="🗺️" onPress={()=>router.replace('/worlds')}/>
  </Page>;
}
