import React from 'react';
import {Stack} from 'expo-router';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {StatusBar} from 'expo-status-bar';
import {AppProvider,useApp} from '../src/ui/provider';
function Navigation(){const {settings}=useApp();return <><StatusBar style="dark"/><Stack screenOptions={{headerShown:false,animation:settings.reducedMotion?'none':'fade'}} /></>;}
export default function RootLayout(){return <SafeAreaProvider><AppProvider><Navigation/></AppProvider></SafeAreaProvider>}
