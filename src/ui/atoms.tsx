import React from 'react';
import {Image,ImageSourcePropType,Pressable,ScrollView,StyleSheet,Text,TextInput,View,ViewStyle} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {SafeAreaView} from 'react-native-safe-area-context';
import {C} from './theme';
export function Page({children,title,subtitle,scroll=true}:{children:React.ReactNode;title?:string;subtitle?:string;scroll?:boolean}){
 const content=<View style={styles.page}>{title?<Text style={styles.title}>{title}</Text>:null}{subtitle?<Text style={styles.subtitle}>{subtitle}</Text>:null}{children}</View>;
 return <SafeAreaView style={{flex:1,backgroundColor:C.background}}><LinearGradient colors={['#F4FAF7','#FDF7F4','#F8FAFC']} style={{flex:1}}>{scroll?<ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{flexGrow:1}}>{content}</ScrollView>:content}</LinearGradient></SafeAreaView>;
}
export function Head({children}:{children:React.ReactNode}){return <Text style={styles.heading}>{children}</Text>}
export function P({children,style}:{children:React.ReactNode;style?:any}){return <Text style={[styles.paragraph,style]}>{children}</Text>}
export function Action({label,onPress,kind='primary',disabled=false,icon,small=false,testID}:{label:string;onPress:()=>void;kind?:'primary'|'secondary'|'danger'|'soft';disabled?:boolean;icon?:string;small?:boolean;testID?:string}){
 const colors={primary:C.green,secondary:C.violet,danger:C.red,soft:C.mint};
 const color=colors[kind];
 return <Pressable testID={testID} accessibilityRole="button" accessibilityLabel={label} accessibilityState={{disabled}} disabled={disabled} onPress={onPress} style={({pressed})=>[styles.button,{backgroundColor:color,opacity:disabled?.45:pressed?.8:1,paddingVertical:small?10:16}]}>
  <Text style={[styles.buttonText,{color:kind==='soft'?C.green:C.white}]}>{icon?`${icon}  `:''}{label}</Text>
 </Pressable>;
}
export function Card({children,style}:{children:React.ReactNode;style?:ViewStyle}){return <View style={[styles.card,style]}>{children}</View>}
export function Tag({children}:{children:React.ReactNode}){return <View style={styles.tag}><Text style={styles.tagText}>{children}</Text></View>}
export function Tile({emoji,title,subtitle,onPress,selected,style}:{emoji:string;title:string;subtitle?:string;onPress:()=>void;selected?:boolean;style?:ViewStyle}){
 return <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={title} style={({pressed})=>[styles.tile,selected&&{borderColor:C.violet,borderWidth:3,backgroundColor:C.lavender},pressed&&{opacity:.8},style]}>
 <Text style={styles.emoji}>{emoji}</Text><Text style={styles.tileTitle}>{title}</Text>{subtitle?<Text style={styles.tileSubtitle}>{subtitle}</Text>:null}</Pressable>;
}
export function Entry({value,onChangeText,placeholder,secure=false,numeric=false,testID}:{value:string;onChangeText:(s:string)=>void;placeholder:string;secure?:boolean;numeric?:boolean;testID?:string}){
 return <TextInput testID={testID} accessibilityLabel={placeholder} style={styles.input} value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={C.muted} secureTextEntry={secure} keyboardType={numeric?'number-pad':'default'} maxLength={numeric?12:18} autoCapitalize="none" />;
}
export function Banner({source}:{source:ImageSourcePropType}){return <Image source={source} resizeMode="cover" style={styles.banner} accessibilityIgnoresInvertColors/>}
export function Meter({label,value,max}:{label:string;value:number;max:number}){return <View style={{marginBottom:12}}><P>{label}</P><View style={styles.track}><View style={[styles.fill,{width:`${Math.max(0,Math.min(100,100*value/Math.max(1,max)))}%`}]} /></View></View>}
export const styles=StyleSheet.create({
 page:{paddingHorizontal:20,paddingTop:30,paddingBottom:54,alignSelf:'center',width:'100%',maxWidth:750,flexGrow:1},
 title:{fontSize:31,fontWeight:'900',color:C.ink,lineHeight:39,marginBottom:9},
 subtitle:{fontSize:15,color:C.muted,lineHeight:23,marginBottom:18},
 heading:{fontSize:22,fontWeight:'800',color:C.ink,marginBottom:14},
 paragraph:{fontSize:16,lineHeight:24,color:C.ink,marginBottom:10},
 button:{borderRadius:20,paddingHorizontal:18,marginVertical:6,minHeight:52,alignItems:'center',justifyContent:'center',elevation:1},
 buttonText:{fontSize:17,fontWeight:'800',textAlign:'center'},
 card:{borderRadius:25,padding:20,marginBottom:14,backgroundColor:'white',borderColor:C.border,borderWidth:1,elevation:1},
 tag:{alignSelf:'flex-start',backgroundColor:C.lavender,borderRadius:16,paddingVertical:5,paddingHorizontal:11,marginBottom:10},
 tagText:{color:C.violet,fontWeight:'700'},
 tile:{backgroundColor:C.white,borderColor:C.border,borderWidth:1,marginBottom:14,padding:16,borderRadius:23,minHeight:128,flexGrow:1,alignItems:'center',justifyContent:'center'},
 emoji:{fontSize:41,marginBottom:7},tileTitle:{color:C.ink,fontSize:16,fontWeight:'800',textAlign:'center'},tileSubtitle:{color:C.muted,fontSize:13,textAlign:'center',marginTop:3},
 input:{borderWidth:1.5,borderColor:C.border,backgroundColor:C.white,borderRadius:18,padding:16,fontSize:18,color:C.ink,marginBottom:16,minHeight:56},
 banner:{height:180,width:'100%',borderRadius:28,marginBottom:20},
 track:{height:12,backgroundColor:C.border,borderRadius:9,overflow:'hidden'},fill:{backgroundColor:C.green,height:12,borderRadius:9}
});
