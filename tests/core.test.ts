import {test} from 'node:test';
import assert from 'node:assert/strict';
import {generateChallenge,validateChallenge,evaluateChallenge,allowedNextCell,evaluateCardSolution,isMatchingCardPair} from '../src/core/generate';
import {nextDifficulty,initialDifficulty} from '../src/core/adaptive';
import {GAME_IDS} from '../src/core/types';
import {AGE_BOUNDS} from '../src/core/catalog';
import {canPlay,heartbeatDelta,dayKey,withinAllowedHours} from '../src/core/time';
import {earnedBadges} from '../src/core/rewards';
for(const age of ['3-5','6-8','9-12'] as const){
  for(const id of GAME_IDS){
    test(`${id} ${age}: 250 deterministic valid generated puzzles with correct solutions`,()=>{
      const {min,max}=AGE_BOUNDS[age];
      const unique=new Set<string>();
      for(let seed=0;seed<250;seed++){
        const level=min+(seed%(max-min+1));
        const c=generateChallenge(id,age,level,seed);
        assert.ok(validateChallenge(c),JSON.stringify(c));
        assert.deepEqual(generateChallenge(id,age,level,seed),c);
        if(c.mode==='cards'){
          const groups=new Map<string,number[]>();c.board!.forEach((token,index)=>groups.set(token,[...(groups.get(token)||[]),index]));
          const matching=[...groups.values()].flat();
          assert.ok(evaluateCardSolution(c,matching));
          assert.ok(evaluateChallenge(c,matching.map(x=>`index:${x}`)));
          assert.equal(evaluateCardSolution(c,[...matching].reverse().slice(1)),false);
          assert.equal(isMatchingCardPair(c,0,0),false);
          assert.equal(isMatchingCardPair(c,0,999),false);
          assert.equal(evaluateChallenge(c,c.answer),false);
        }else assert.ok(evaluateChallenge(c,c.answer));
        unique.add(JSON.stringify(c));
        if(c.mode==='route'||c.mode==='maze'){
          const pathMax=c.mode==='maze'?(age==='3-5'?5:age==='6-8'?7:8):(age==='3-5'?5:age==='6-8'?8:10);
          const expectedLength=Math.min(pathMax,3+level-min);
          assert.equal(c.answer.length,expectedLength,`Incomplete route for ${id}/${age}/${seed}`);
          assert.equal(new Set(c.answer).size,c.answer.length);
          for(let i=0;i<c.answer.length;i++) assert.equal(allowedNextCell(c,c.answer.slice(0,i),c.answer[i]!),true);
        }
        if(c.mode!=='cards'){
          const wrong=c.mode==='multi'?[]:c.answer.slice(0,-1);
          assert.equal(evaluateChallenge(c,wrong),false);
        }
      }
      assert.ok(unique.size>180,`Insufficient variation for ${id}/${age}: ${unique.size}`);
    });
  }
  test(`adaptive bounded, deterministic: ${age}`,()=>{
    let d=initialDifficulty(age);const min=AGE_BOUNDS[age].min;const max=AGE_BOUNDS[age].max;
    for(let i=0;i<100;i++)d=nextDifficulty(age,d,{success:true,hints:0,mistakes:0});
    assert.equal(d.level,max);
    for(let i=0;i<100;i++)d=nextDifficulty(age,d,{success:false,hints:1,mistakes:3});
    assert.equal(d.level,min);
    d=initialDifficulty(age);
    for(let i=0;i<10;i++)d=nextDifficulty(age,d,{success:true,hints:1,mistakes:0});
    assert.equal(d.level,min);
  });
}
test('Shape & Color Memory uses position-based reconstruction, not another sequence challenge',()=>{
  for(const age of ['3-5','6-8','9-12'] as const){
    const b=AGE_BOUNDS[age];
    for(let seed=0;seed<250;seed++){
      const level=b.min+(seed%(b.max-b.min+1));
      const shape=generateChallenge('shapes',age,level,seed);
      const pattern=generateChallenge('pattern',age,level,seed);
      assert.equal(shape.mode,'reconstruct');
      assert.equal(pattern.mode,'sequence');
      assert.ok(shape.gridSize===2||shape.gridSize===3);
      assert.ok(shape.answer.length<=shape.gridSize!*shape.gridSize!);
      assert.deepEqual(shape.preview,shape.answer);
      assert.ok(validateChallenge(shape));
      assert.ok(evaluateChallenge(shape,shape.answer));
      assert.equal(evaluateChallenge(shape,shape.answer.slice().reverse().slice(1)),false);
    }
  }
});
test('Brain Explorer never loses the instructions for a generated challenge',()=>{
 for(const age of ['3-5','6-8','9-12'] as const){
   for(let seed=0;seed<750;seed++){
     const c=generateChallenge('explorer',age,AGE_BOUNDS[age].min,seed);
     assert.ok(['recall','missing','repeat'].includes(c.prompt),`Unknown Explorer prompt: ${c.prompt}`);
     if(c.mode==='single'){
       assert.equal(c.prompt,'missing');
       assert.ok(c.board?.length);
       assert.equal(c.board?.includes(c.answer[0]!),false);
     }
     if(c.mode==='multi')assert.equal(c.prompt,'recall');
     if(c.mode==='sequence')assert.equal(c.prompt,'repeat');
     assert.ok(validateChallenge(c));
   }
 }
});
test('usage bounds and limits, no negative usage',()=>{
  assert.equal(heartbeatDelta(1000,6300),5);assert.equal(heartbeatDelta(9000,1000),0);
  assert.equal(canPlay({profileUsed:899,householdUsed:899,sessionUsed:100,dailyLimitMin:15,householdLimitMin:20,sessionLimitMin:5,paused:false}),true);
  assert.equal(canPlay({profileUsed:900,householdUsed:0,sessionUsed:0,dailyLimitMin:15,householdLimitMin:20,sessionLimitMin:5,paused:false}),false);
  assert.equal(canPlay({profileUsed:0,householdUsed:1200,sessionUsed:0,dailyLimitMin:15,householdLimitMin:20,sessionLimitMin:5,paused:false}),false);
  assert.equal(canPlay({profileUsed:0,householdUsed:0,sessionUsed:300,dailyLimitMin:15,householdLimitMin:20,sessionLimitMin:5,paused:false}),false);
  assert.equal(canPlay({profileUsed:0,householdUsed:0,sessionUsed:0,dailyLimitMin:15,householdLimitMin:20,sessionLimitMin:5,paused:true}),false);
  // Switching from child A to child B does not reset the household session clock.
  assert.equal(canPlay({profileUsed:0,householdUsed:0,sessionUsed:0,householdSessionUsed:300,dailyLimitMin:15,householdLimitMin:20,sessionLimitMin:5,paused:false}),false);
  assert.equal(canPlay({profileUsed:0,householdUsed:0,sessionUsed:0,householdSessionUsed:299,dailyLimitMin:15,householdLimitMin:20,sessionLimitMin:5,paused:false}),true);
  assert.match(dayKey(Date.now()),/^\d{4}-\d{2}-\d{2}$/);
});
test('reward requirements deterministic, no unintended awards',()=>{
  assert.deepEqual(earnedBadges(0,0),[]);assert.deepEqual(earnedBadges(1,1),['first_adventure']);
  assert.deepEqual(earnedBadges(5,4),['first_adventure','curious_explorer','world_wanderer']);
  assert.equal(new Set(earnedBadges(100,12)).size,4);
});

test('Play-hour boundaries work and support crossing midnight',()=>{
 const today=new Date(2026,10,14,9,30).getTime();const night=new Date(2026,10,14,23,30).getTime();
 assert.equal(withinAllowedHours('07:00','20:00',today),true);
 assert.equal(withinAllowedHours('07:00','20:00',night),false);
 assert.equal(withinAllowedHours('21:00','02:00',night),true);
 assert.equal(withinAllowedHours('21:00','02:00',today),false);
 assert.equal(withinAllowedHours('00:00','00:00',night),true);
 assert.equal(withinAllowedHours('99:00','20:00',night),false);
});
