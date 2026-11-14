import {test} from 'node:test';import assert from 'node:assert/strict';
import {translations,t,tokenName} from '../src/content/i18n';
import {OBJECTS,SHAPES,NOTES,PLACES} from '../src/core/catalog';
test('Three text catalogs have identical keys and nonempty translations',()=>{
 const reference=Object.keys(translations.en).sort();
 for(const locale of ['en','hi','mr'] as const){
  assert.deepEqual(Object.keys(translations[locale]).sort(),reference);
  for(const [k,v] of Object.entries(translations[locale]))assert.ok(v.trim(),`${locale}:${k}`);
  for(const id of [...OBJECTS,...SHAPES,...NOTES,...PLACES])assert.notEqual(tokenName(locale,id),id,`${locale}/${id}`);
  assert.ok(t(locale,'questionObserve',{item:'TEST'}).includes('TEST'));
 }
});
