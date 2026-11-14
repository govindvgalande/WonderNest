import * as SQLite from 'expo-sqlite';
import * as Crypto from 'expo-crypto';
import type {AgeGroup,Attempt,Challenge,DifficultyState,GameId,Profile,Progress,Settings} from '../core/types';
import {generateChallenge,validateChallenge} from '../core/generate';
import {AGE_BOUNDS} from '../core/catalog';
import {initialDifficulty,nextDifficulty} from '../core/adaptive';
import {earnedBadges} from '../core/rewards';
import {dayKey,canPlay,withinAllowedHours} from '../core/time';
const db=SQLite.openDatabaseSync('wondernest.db');
const initialSettings:Settings={locale:'en',sound:true,music:false,narration:false,volume:0.7,reducedMotion:false,householdLimitMin:45,paused:false,allowedFrom:'07:00',allowedUntil:'20:00',breakReminderMin:15};
let initialized=false;
export function initDatabase(){
  if(initialized)return;
  db.execSync('PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;');
  const version=db.getFirstSync<{user_version:number}>('PRAGMA user_version')?.user_version||0;
  if(version<1){
    db.execSync(`
    CREATE TABLE IF NOT EXISTS profiles(id TEXT PRIMARY KEY, nickname TEXT NOT NULL, age_group TEXT NOT NULL,avatar TEXT NOT NULL,daily_limit INTEGER NOT NULL,session_limit INTEGER NOT NULL,created_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS attempts(id INTEGER PRIMARY KEY AUTOINCREMENT,profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,game_id TEXT NOT NULL,seed INTEGER NOT NULL,level INTEGER NOT NULL,correct INTEGER NOT NULL,mistakes INTEGER NOT NULL,hints INTEGER NOT NULL,duration_sec INTEGER NOT NULL,created_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS difficulty(profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,game_id TEXT NOT NULL, state_json TEXT NOT NULL,PRIMARY KEY(profile_id,game_id));
    CREATE TABLE IF NOT EXISTS rewards(profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,code TEXT NOT NULL,created_at INTEGER NOT NULL,PRIMARY KEY(profile_id,code));
    CREATE TABLE IF NOT EXISTS usage_days(profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,day TEXT NOT NULL,seconds INTEGER NOT NULL DEFAULT 0,PRIMARY KEY(profile_id,day));
    CREATE TABLE IF NOT EXISTS session_state(profile_id TEXT PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,day TEXT NOT NULL,seconds INTEGER NOT NULL DEFAULT 0,last_activity INTEGER NOT NULL DEFAULT 0);
    CREATE TABLE IF NOT EXISTS settings(key TEXT PRIMARY KEY,value TEXT NOT NULL);
    CREATE INDEX IF NOT EXISTS idx_attempts_profile_date ON attempts(profile_id,created_at);
    PRAGMA user_version=1;
    `);
  }
  if(version<2){
    db.execSync("ALTER TABLE profiles ADD COLUMN disabled_games TEXT NOT NULL DEFAULT '[]'; PRAGMA user_version=2;");
  }
  if(version<3){
    db.execSync(`CREATE TABLE IF NOT EXISTS active_runs (
      profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      game_id TEXT NOT NULL,
      payload TEXT NOT NULL,
      updated_at INTEGER NOT NULL,
      PRIMARY KEY(profile_id,game_id)
    ); PRAGMA user_version=3;`);
  }
  if(version<4){
    db.execSync(`CREATE TABLE IF NOT EXISTS household_session (
      id INTEGER PRIMARY KEY CHECK(id=1),
      day TEXT NOT NULL,
      seconds INTEGER NOT NULL DEFAULT 0,
      last_activity INTEGER NOT NULL DEFAULT 0
    ); PRAGMA user_version=4;`);
  }
  initialized=true;
}
function transact<T>(fn:()=>T):T{
  db.execSync('BEGIN IMMEDIATE TRANSACTION');
  try{const result=fn();db.execSync('COMMIT');return result;}
  catch(e){db.execSync('ROLLBACK');throw e;}
}
export function getProfiles():Profile[]{initDatabase();return db.getAllSync<any>('SELECT * FROM profiles ORDER BY created_at ASC').map(x=>({id:x.id,nickname:x.nickname,ageGroup:x.age_group,avatar:x.avatar,dailyLimitMin:x.daily_limit,sessionLimitMin:x.session_limit,createdAt:x.created_at,disabledGames:JSON.parse(x.disabled_games||'[]')}));}
export function createProfile(nickname:string,ageGroup:AgeGroup,avatar='🦊'):Profile{
  initDatabase();const name=nickname.trim().slice(0,18)||'Explorer';const b=AGE_BOUNDS[ageGroup];
  const p:Profile={id:Crypto.randomUUID(),nickname:name,ageGroup,avatar,dailyLimitMin:b.daily,sessionLimitMin:b.session,createdAt:Date.now(),disabledGames:[]};
  db.runSync('INSERT INTO profiles(id,nickname,age_group,avatar,daily_limit,session_limit,created_at) VALUES(?,?,?,?,?,?,?)',p.id,p.nickname,p.ageGroup,p.avatar,p.dailyLimitMin,p.sessionLimitMin,p.createdAt);
  return p;
}
export function updateProfile(p:Profile){initDatabase();if(p.nickname.trim().length>18||p.dailyLimitMin<1||p.dailyLimitMin>240||p.sessionLimitMin<1||p.sessionLimitMin>120)throw new Error('Invalid profile');db.runSync('UPDATE profiles SET nickname=?,age_group=?,avatar=?,daily_limit=?,session_limit=?,disabled_games=? WHERE id=?',p.nickname.trim(),p.ageGroup,p.avatar,p.dailyLimitMin,p.sessionLimitMin,JSON.stringify(p.disabledGames),p.id);}
export function deleteProfile(id:string){initDatabase();db.runSync('DELETE FROM profiles WHERE id=?',id);}
export function deleteAllLocalData(){initDatabase();transact(()=>{db.execSync('DELETE FROM profiles; DELETE FROM settings; DELETE FROM household_session;');});}
export function getSettings():Settings{initDatabase();const row=db.getFirstSync<{value:string}>('SELECT value FROM settings WHERE key=?','prefs');try{return {...initialSettings,...JSON.parse(row?.value||'{}')};}catch{return {...initialSettings};}}
export function saveSettings(settings:Settings){initDatabase();db.runSync('INSERT INTO settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value','prefs',JSON.stringify(settings));}
export function getDifficulty(profileId:string,gameId:GameId,age:AgeGroup):DifficultyState{initDatabase();const row=db.getFirstSync<{state_json:string}>('SELECT state_json FROM difficulty WHERE profile_id=? AND game_id=?',profileId,gameId);if(!row)return initialDifficulty(age);try{const value=JSON.parse(row.state_json) as DifficultyState;const b=AGE_BOUNDS[age];return {...value,level:Math.max(b.min,Math.min(b.max,value.level))};}catch{return initialDifficulty(age);}}
/** Atomic: result, difficulty, and achievements cannot be partly written. */
export function recordAttempt(a:Attempt,age:AgeGroup){initDatabase();return transact(()=>{
  const prior=getDifficulty(a.profileId,a.gameId,age);
  db.runSync('INSERT INTO attempts(profile_id,game_id,seed,level,correct,mistakes,hints,duration_sec,created_at) VALUES(?,?,?,?,?,?,?,?,?)',a.profileId,a.gameId,a.seed,a.level,a.correct?1:0,a.mistakes,a.hints,a.durationSec,Date.now());
  const next=nextDifficulty(age,prior,{success:a.correct,hints:a.hints,mistakes:a.mistakes});
  db.runSync('INSERT INTO difficulty(profile_id,game_id,state_json) VALUES(?,?,?) ON CONFLICT(profile_id,game_id) DO UPDATE SET state_json=excluded.state_json',a.profileId,a.gameId,JSON.stringify(next));
  const stats=db.getFirstSync<{wins:number;unique_games:number}>('SELECT COALESCE(SUM(correct),0) AS wins,COUNT(DISTINCT CASE WHEN correct=1 THEN game_id END) AS unique_games FROM attempts WHERE profile_id=?',a.profileId)!;
  for(const badge of earnedBadges(stats.wins,stats.unique_games))db.runSync('INSERT OR IGNORE INTO rewards(profile_id,code,created_at) VALUES(?,?,?)',a.profileId,badge,Date.now());
  return {next,awards: getRewards(a.profileId)};
});}
export function getRewards(profileId:string):string[]{initDatabase();return db.getAllSync<{code:string}>('SELECT code FROM rewards WHERE profile_id=? ORDER BY created_at ASC',profileId).map(x=>x.code);}
export function getProgress(profileId:string):Progress[]{initDatabase();return db.getAllSync<{game_id:GameId;plays:number;wins:number}>('SELECT game_id,COUNT(*) AS plays,SUM(correct) AS wins FROM attempts WHERE profile_id=? GROUP BY game_id',profileId).map(x=>({gameId:x.game_id,plays:x.plays,wins:x.wins,accuracy:x.plays?Math.round(x.wins/x.plays*100):0,level:getDifficulty(profileId,x.game_id,getProfiles().find(p=>p.id===profileId)?.ageGroup||'3-5').level}));}
export function getWeek(profileId:string){initDatabase();const start=Date.now()-7*86400000;return db.getAllSync<{day:string;plays:number;wins:number}>('SELECT date(created_at/1000,\'unixepoch\',\'localtime\') as day,COUNT(*) as plays,SUM(correct) as wins FROM attempts WHERE profile_id=? AND created_at>=? GROUP BY day ORDER BY day DESC',profileId,start);}
export function getUsage(profileId:string,when=Date.now()){
  initDatabase();const today=dayKey(when);const own=db.getFirstSync<{seconds:number}>('SELECT seconds FROM usage_days WHERE profile_id=? AND day=?',profileId,today)?.seconds||0;
  const total=db.getFirstSync<{seconds:number}>('SELECT COALESCE(SUM(seconds),0) AS seconds FROM usage_days WHERE day=?',today)?.seconds||0;
  const state=db.getFirstSync<{seconds:number;last_activity:number;day:string}>('SELECT seconds,last_activity,day FROM session_state WHERE profile_id=?',profileId);
  const session=state && state.day===today && when-state.last_activity>=0 && when-state.last_activity<300000 ? state.seconds : 0;
  const home=db.getFirstSync<{seconds:number;last_activity:number;day:string}>('SELECT seconds,last_activity,day FROM household_session WHERE id=1');
  const householdSession=home&&home.day===today&&when-home.last_activity>=0&&when-home.last_activity<300000?home.seconds:0;
  return {own,total,session,householdSession};
}
export function addForegroundUsage(profileId:string,seconds:number,when=Date.now()){
  initDatabase();if(!Number.isInteger(seconds)||seconds<0||seconds>5)throw new Error('Invalid heartbeat');if(seconds===0)return;
  const day=dayKey(when);
  transact(()=>{
    db.runSync('INSERT INTO usage_days(profile_id,day,seconds) VALUES(?,?,?) ON CONFLICT(profile_id,day) DO UPDATE SET seconds=usage_days.seconds+excluded.seconds',profileId,day,seconds);
    const prior=db.getFirstSync<{seconds:number;last_activity:number;day:string}>('SELECT seconds,last_activity,day FROM session_state WHERE profile_id=?',profileId);
    const carried=prior&&prior.day===day&&when-prior.last_activity<300000?prior.seconds:0;
    db.runSync('INSERT INTO session_state(profile_id,day,seconds,last_activity) VALUES(?,?,?,?) ON CONFLICT(profile_id) DO UPDATE SET day=excluded.day,seconds=excluded.seconds,last_activity=excluded.last_activity',profileId,day,carried+seconds,when);
    const household=db.getFirstSync<{seconds:number;last_activity:number;day:string}>('SELECT seconds,last_activity,day FROM household_session WHERE id=1');
    const shared=household&&household.day===day&&when-household.last_activity>=0&&when-household.last_activity<300000?household.seconds:0;
    db.runSync('INSERT INTO household_session(id,day,seconds,last_activity) VALUES(1,?,?,?) ON CONFLICT(id) DO UPDATE SET day=excluded.day,seconds=excluded.seconds,last_activity=excluded.last_activity',day,shared+seconds,when);
  });
}
export function isAllowed(profile:Profile,settings:Settings,when=Date.now()):boolean{
  const u=getUsage(profile.id,when);
  return withinAllowedHours(settings.allowedFrom,settings.allowedUntil,when) && canPlay({profileUsed:u.own,householdUsed:u.total,sessionUsed:u.session,householdSessionUsed:u.householdSession,dailyLimitMin:profile.dailyLimitMin,householdLimitMin:settings.householdLimitMin,sessionLimitMin:profile.sessionLimitMin,paused:settings.paused});
}
export function getSelectedProfileId():string|null{initDatabase();return db.getFirstSync<{value:string}>('SELECT value FROM settings WHERE key=?','selected_profile')?.value||null;}
export function setSelectedProfileId(id:string|null){initDatabase();if(id)db.runSync('INSERT INTO settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value','selected_profile',id);else db.runSync('DELETE FROM settings WHERE key=?','selected_profile');}

/** An unfinished puzzle is persisted locally, including its answer state.
 * This allows a child to resume the same challenge after Android terminates the app. */
export interface ActiveRun {
  challenge: Challenge;
  phase: 'preview'|'answer';
  chosen: string[];
  matched: number[];
  mistakes: number;
  hints: number;
  startedAt: number;
}
export function saveActiveRun(profileId:string,gameId:GameId,run:ActiveRun):void{
  initDatabase();
  if(run.challenge.gameId!==gameId||!validateChallenge(run.challenge))throw new Error('Invalid active puzzle');
  db.runSync('INSERT INTO active_runs(profile_id,game_id,payload,updated_at) VALUES(?,?,?,?) ON CONFLICT(profile_id,game_id) DO UPDATE SET payload=excluded.payload,updated_at=excluded.updated_at',
    profileId,gameId,JSON.stringify(run),Date.now());
}
export function getActiveRun(profileId:string,gameId:GameId,ageGroup:AgeGroup):ActiveRun|null{
  initDatabase();
  const row=db.getFirstSync<{payload:string}>('SELECT payload FROM active_runs WHERE profile_id=? AND game_id=?',profileId,gameId);
  if(!row)return null;
  try{
    const run=JSON.parse(row.payload) as ActiveRun;
    const c=run.challenge;
    if(c.gameId!==gameId||c.ageGroup!==ageGroup||!validateChallenge(c)||
      !['preview','answer'].includes(run.phase)||
      !Array.isArray(run.chosen)||!Array.isArray(run.matched)||
      !run.chosen.every(x=>typeof x==='string'&&c.options.includes(x))||
      !run.matched.every(x=>Number.isInteger(x)&&x>=0&&x<(c.board?.length||0))||
      !Number.isInteger(run.mistakes)||run.mistakes<0||
      !Number.isInteger(run.hints)||run.hints<0||
      !Number.isFinite(run.startedAt)||run.startedAt>Date.now())throw new Error('Invalid saved state');
    const regen=generateChallenge(gameId,ageGroup,c.level,c.seed);
    if(JSON.stringify(c)!==JSON.stringify(regen))throw new Error('Stored challenge differs from generator');
    return run;
  }catch{
    clearActiveRun(profileId,gameId);
    return null;
  }
}
export function clearActiveRun(profileId:string,gameId:GameId):void{
  initDatabase();
  db.runSync('DELETE FROM active_runs WHERE profile_id=? AND game_id=?',profileId,gameId);
}
