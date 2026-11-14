export function dayKey(ms:number):string {const d=new Date(ms);const y=d.getFullYear();const m=String(d.getMonth()+1).padStart(2,'0');const day=String(d.getDate()).padStart(2,'0');return `${y}-${m}-${day}`;}
export function secondsLeft(used:number, limitMinutes:number): number {return Math.max(0,limitMinutes*60-used);}
export function canPlay(input:{profileUsed:number;householdUsed:number;sessionUsed:number;dailyLimitMin:number;householdLimitMin:number;sessionLimitMin:number;paused:boolean}):boolean{
  return !input.paused && secondsLeft(input.profileUsed,input.dailyLimitMin)>0 && secondsLeft(input.householdUsed,input.householdLimitMin)>0 && secondsLeft(input.sessionUsed,input.sessionLimitMin)>0;
}
/** Foreground-only heartbeat; bounds credit for time skipped on background or forced termination. */
export function heartbeatDelta(previousMs:number,nowMs:number):number{
  if(!Number.isFinite(previousMs)||!Number.isFinite(nowMs)) return 0;
  return Math.max(0,Math.min(5,Math.floor((nowMs-previousMs)/1000)));
}

/** Allowed local-time interval, with wrap-around support and 24h interval as from==until. */
export function withinAllowedHours(from:string,to:string,now:number):boolean{
  if(!/^\d{2}:\d{2}$/.test(from)||!/^\d{2}:\d{2}$/.test(to))return false;
  const minutes=(s:string)=>Number(s.slice(0,2))*60+Number(s.slice(3));
  const start=minutes(from),end=minutes(to),d=new Date(now),current=d.getHours()*60+d.getMinutes();
  if(start>1439||end>1439)return false;
  return start===end||start<end?(start===end?true:current>=start&&current<end):current>=start||current<end;
}
