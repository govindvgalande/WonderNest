const fs=require('fs');const path=require('path');const ts=require('typescript');
for(const file of [...fs.readdirSync('src/core').filter(x=>x.endsWith('.ts')).map(x=>'src/core/'+x),'tests/core.test.ts','tests/i18n.test.ts','tests/security.test.ts','src/security/parentGate.ts','src/content/i18n.ts']) {
  const source=fs.readFileSync(file,'utf8');
  const js=ts.transpileModule(source,{fileName:file,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
  const target='tools/.test-build/'+file.replace(/\.ts$/,'.js');fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,js);
}

const nodeModules='tools/.test-build/node_modules';fs.mkdirSync(nodeModules,{recursive:true});
const mocks={
 'expo-secure-store':`const items=new Map();exports.getItemAsync=async(k)=>items.get(k)??null;exports.setItemAsync=async(k,v)=>{items.set(k,v)};exports.deleteItemAsync=async(k)=>{items.delete(k)};`,
 'expo-crypto':`const c=require('node:crypto');exports.CryptoDigestAlgorithm={SHA256:'sha256'};exports.randomUUID=()=>c.randomUUID();exports.digestStringAsync=async(_alg,x)=>c.createHash('sha256').update(x).digest('hex');`,
 'expo-local-authentication':`let allowed=false;exports.isEnrolledAsync=async()=>true;exports.authenticateAsync=async()=>({success:allowed});exports.__setAuth=(value)=>{allowed=value;};`
};
for(const [name,body] of Object.entries(mocks)){const p=path.join(nodeModules,name,'index.js');fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,body);}
