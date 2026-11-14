import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import * as LocalAuthentication from 'expo-local-authentication';
const KEY='wondernest.parent.sha256';const SALT='wondernest.parent.salt';
const FAIL='wondernest.parent.fail';const LOCK='wondernest.parent.lock';
const secure={get:(k:string)=>SecureStore.getItemAsync(k),set:(k:string,v:string)=>SecureStore.setItemAsync(k,v),del:(k:string)=>SecureStore.deleteItemAsync(k)};
export async function hasParentPin(){return !!(await secure.get(KEY));}
function isValid(pin:string){return /^\d{6,12}$/.test(pin);}
async function hash(pin:string,salt:string){return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256,`wondernest-v1:${salt}:${pin}`);}
export async function setupParentPin(pin:string){
  if(!isValid(pin))throw new Error('PIN must be 6–12 digits');
  if(await hasParentPin())throw new Error('Parent PIN already exists');
  const salt=Crypto.randomUUID();await secure.set(SALT,salt);await secure.set(KEY,await hash(pin,salt));await secure.set(FAIL,'0');await secure.set(LOCK,'0');
}
export async function verifyParentPin(pin:string):Promise<{ok:boolean;lockedSeconds:number}>{
  const lockedUntil=Number(await secure.get(LOCK)||'0');if(Date.now()<lockedUntil)return {ok:false,lockedSeconds:Math.ceil((lockedUntil-Date.now())/1000)};
  const saved=await secure.get(KEY);const salt=await secure.get(SALT);
  if(!saved||!salt)return {ok:false,lockedSeconds:0};
  const candidate=await hash(pin,salt);
  // Constant work for matching digests; SECURE STORE provides device-backed at-rest encryption.
  let diff=0;for(let i=0;i<Math.max(candidate.length,saved.length);i++)diff|=(candidate.charCodeAt(i)||0)^(saved.charCodeAt(i)||0);
  if(diff===0){await secure.set(FAIL,'0');await secure.set(LOCK,'0');return {ok:true,lockedSeconds:0};}
  const failures=Number(await secure.get(FAIL)||'0')+1;
  await secure.set(FAIL,String(failures));
  const lockMs=failures>=5?Math.min(3600000,30000*Math.pow(2,Math.min(8,failures-5))):0;
  if(lockMs)await secure.set(LOCK,String(Date.now()+lockMs));
  return {ok:false,lockedSeconds:lockMs/1000};
}
/** Uses Android OS credential/biometric. If unavailable, clearing app data is the only recovery. */
export async function recoverParentPinUsingDeviceLock(newPin:string):Promise<boolean>{
  if(!isValid(newPin))throw new Error('PIN must be 6–12 digits');
  const enrolled=await LocalAuthentication.isEnrolledAsync();if(!enrolled)return false;
  const auth=await LocalAuthentication.authenticateAsync({promptMessage:'Parent PIN recovery',disableDeviceFallback:false});
  if(!auth.success)return false;
  await secure.del(KEY);await secure.del(SALT);await secure.del(FAIL);await secure.del(LOCK);
  await setupParentPin(newPin);return true;
}
/** Only call after successful authenticated parent action. */
export async function clearParentCredentials(){for(const k of [KEY,SALT,FAIL,LOCK])await secure.del(k);}
