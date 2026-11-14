import {test} from 'node:test';import assert from 'node:assert/strict';
import {setupParentPin,hasParentPin,verifyParentPin,recoverParentPinUsingDeviceLock,clearParentCredentials} from '../src/security/parentGate';
import * as DeviceAuth from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
test('parent gate: six digits, correct/wrong unlock, persisted lockout, device recovery',async()=>{
 await clearParentCredentials();assert.equal(await hasParentPin(),false);
 await assert.rejects(()=>setupParentPin('12'));await assert.rejects(()=>setupParentPin('abc123'));
 await setupParentPin('123456');assert.equal(await hasParentPin(),true);
 await assert.rejects(()=>setupParentPin('888888'));
 assert.equal((await verifyParentPin('123457')).ok,false);
 assert.equal((await verifyParentPin('123456')).ok,true);
 for(let i=0;i<4;i++)assert.equal((await verifyParentPin('000000')).ok,false);
 const fifth=await verifyParentPin('000000');assert.ok(fifth.lockedSeconds>=30);
 const saved=await SecureStore.getItemAsync('wondernest.parent.lock');assert.ok(Number(saved)>Date.now());
 assert.equal((await verifyParentPin('123456')).ok,false);
 // Recovery explicitly requires successful device authentication.
 (DeviceAuth as any).__setAuth(false);
 assert.equal(await recoverParentPinUsingDeviceLock('654321'),false);
 (DeviceAuth as any).__setAuth(true);
 assert.equal(await recoverParentPinUsingDeviceLock('654321'),true);
 assert.equal((await verifyParentPin('654321')).ok,true);
 assert.equal((await verifyParentPin('123456')).ok,false);
});
