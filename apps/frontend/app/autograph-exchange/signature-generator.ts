export type SignaturePreset = {
  label: string;
  hueStart: number;
  hueEnd: number;
  strokeA: string;
  strokeB: string;
};

function hashString(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function makeRng(seed: number): () => number {
  let t = seed + 0x6d2b79f5;
  return () => {
    t += 0x6d2b79f5;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function buildStroke(rng: () => number, baseline: number): string {
  const c1x = 42 + rng() * 24;
  const c1y = baseline - (12 + rng() * 14);
  const c2x = 102 + rng() * 24;
  const c2y = baseline + (8 + rng() * 10);
  const e1x = 166 + rng() * 20;
  const e1y = baseline - (5 + rng() * 10);

  const c4x = 286 + rng() * 20;
  const c4y = baseline - (10 + rng() * 13);
  const e2x = 350 + rng() * 24;
  const e2y = baseline + (2 + rng() * 9);

  return `M 18 ${baseline.toFixed(1)} C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${e1x.toFixed(1)} ${e1y.toFixed(1)} S ${c4x.toFixed(1)} ${c4y.toFixed(1)}, ${e2x.toFixed(1)} ${e2y.toFixed(1)}`;
}

export function buildSignaturePreset(userKey: string, displayName: string): SignaturePreset {
  const seed = hashString(`${userKey}:${displayName.toLowerCase()}`);
  const rngA = makeRng(seed);
  const rngB = makeRng(seed ^ 0x9e3779b9);
  const word = (displayName || "Seeker").trim();
  const label = word.length > 22 ? `${word.slice(0, 22)}.` : word;

  return {
    label,
    hueStart: 24 + Math.floor(rngA() * 90),
    hueEnd: 170 + Math.floor(rngB() * 120),
    strokeA: buildStroke(rngA, 46 + rngA() * 9),
    strokeB: buildStroke(rngB, 60 + rngB() * 8),
  };
}
