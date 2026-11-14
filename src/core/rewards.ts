export function earnedBadges(totalWins:number,uniqueGames:number):string[]{
  const awards:string[]=[];
  if(totalWins>=1) awards.push('first_adventure');
  if(totalWins>=5) awards.push('curious_explorer');
  if(uniqueGames>=4) awards.push('world_wanderer');
  if(uniqueGames>=12) awards.push('memory_navigator');
  return awards;
}
