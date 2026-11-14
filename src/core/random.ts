/** Deterministic, dependency-free seeded PRNG. No Math.random in puzzle generation. */
export function random(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function shuffle<T>(data: readonly T[], rng: () => number): T[] {
  const copy = [...data];
  for (let i=copy.length-1; i>0; i--) {
    const j=Math.floor(rng()*(i+1));
    [copy[i],copy[j]]=[copy[j]!,copy[i]!];
  }
  return copy;
}
export function sample<T>(data: readonly T[], count: number, rng: () => number): T[] {
  if (count>data.length || count<0) throw new Error('Invalid sample size');
  return shuffle(data,rng).slice(0,count);
}
export function pick<T>(data: readonly T[],rng:()=>number): T {
  if (!data.length) throw new Error('Empty choice');
  return data[Math.floor(rng()*data.length)]!;
}
