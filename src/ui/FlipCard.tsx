import React,{useEffect,useRef} from 'react';
import {Animated,Pressable,StyleSheet,Text} from 'react-native';
import {C} from './theme';
import {TOKEN_ICONS} from '../core/catalog';
import {t,tokenName} from '../content/i18n';
import type {Locale} from '../core/types';
export function FlipCard({faceUp,matched,onPress,id,locale,reducedMotion}:{faceUp:boolean;matched:boolean;onPress:()=>void;id:string;locale:Locale;reducedMotion:boolean}){
 const flip=useRef(new Animated.Value(faceUp?1:0)).current;
 useEffect(()=>{
  if(reducedMotion){flip.setValue(faceUp?1:0);return;}
  Animated.timing(flip,{toValue:faceUp?1:0,duration:270,useNativeDriver:true}).start();
 },[faceUp,reducedMotion,flip]);
 const backRotate=flip.interpolate({inputRange:[0,1],outputRange:['0deg','180deg']});
 const frontRotate=flip.interpolate({inputRange:[0,1],outputRange:['180deg','360deg']});
 return <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={faceUp?tokenName(locale,id):t(locale,'hiddenCard')} accessibilityHint={t(locale,'revealCardHint')} style={styles.wrap}>
  <Animated.View style={[styles.card,{backgroundColor:C.violet,transform:[{perspective:800},{rotateY:backRotate}]}]}><Text style={styles.icon}>✦</Text></Animated.View>
  <Animated.View style={[styles.card,styles.front,{backgroundColor:matched?C.mint:C.yellow,transform:[{perspective:800},{rotateY:frontRotate}]}]}><Text style={styles.icon}>{TOKEN_ICONS[id]||'⭐'}</Text></Animated.View>
 </Pressable>;
}
const styles=StyleSheet.create({wrap:{height:78,width:'100%',marginBottom:2},card:{position:'absolute',left:0,right:0,top:0,bottom:0,borderRadius:14,alignItems:'center',justifyContent:'center',backfaceVisibility:'hidden',borderWidth:2,borderColor:C.white},front:{backfaceVisibility:'hidden'},icon:{fontSize:31,color:C.white}});
