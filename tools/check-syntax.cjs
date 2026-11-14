const fs=require('fs'),path=require('path'),ts=require('typescript');const failures=[];
function crawl(dir){for(const n of fs.readdirSync(dir)){const f=path.join(dir,n);if(fs.statSync(f).isDirectory())crawl(f);else if(/\.tsx?$/.test(f)){
 const src=fs.readFileSync(f,'utf8');const file=ts.createSourceFile(f,src,ts.ScriptTarget.Latest,true,f.endsWith('.tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);
 for(const err of file.parseDiagnostics){const p=file.getLineAndCharacterOfPosition(err.start||0);failures.push(`${f}:${p.line+1}: ${ts.flattenDiagnosticMessageText(err.messageText,' ')}`);}
}}}crawl('src');crawl('app');crawl('tests');if(failures.length){console.error(failures.join('\n'));process.exit(1);}console.log('PASS: TS/TSX parser accepted all application and test source files.');
