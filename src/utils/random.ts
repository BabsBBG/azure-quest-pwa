import type { Cert, Question } from "../types";

export function seededRandom(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return () => {
    h += 0x6D2B79F5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(items: T[], seed: string = crypto.randomUUID()) {
  const arr = [...items];
  const rand = seededRandom(seed);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function pickQuestions(args: {
  bank: Question[];
  cert: Cert;
  count: number;
  seed?: string;
  focusTags?: string[];
  focusDomain?: string;
  domainWeights?: Record<string, number>;
}) {
  const { bank, cert, count, focusTags = [], focusDomain, seed = crypto.randomUUID(), domainWeights } = args;
  const matchingCert = bank.filter((q) => q.cert === cert && (!focusDomain || q.domain === focusDomain));
  const focused = focusTags.length
    ? matchingCert.filter((q) => q.tags.some((tag) => focusTags.includes(tag)))
    : matchingCert;


  if (domainWeights && !focusDomain && !focusTags.length) {
    const weighted: Question[] = [];
    const byDomain = new Map<string, Question[]>();
    for (const question of shuffle(matchingCert, seed)) {
      const bucket = byDomain.get(question.domain) ?? [];
      bucket.push(question);
      byDomain.set(question.domain, bucket);
    }
    const domains = Object.entries(domainWeights);
    let remaining = count;
    domains.forEach(([domain, weight], i) => {
      const target = i === domains.length - 1 ? remaining : Math.max(1, Math.round(count * weight));
      remaining -= target;
      const bucket = byDomain.get(domain) ?? [];
      weighted.push(...bucket.slice(0, target));
    });
    if (weighted.length < count) {
      const used = new Set(weighted.map(q => q.id));
      weighted.push(...shuffle(matchingCert.filter(q => !used.has(q.id)), `${seed}:topup`).slice(0, count - weighted.length));
    }
    return shuffleAndRelabel(weighted.slice(0, count), seed);
  }

  const domainBuckets = new Map<string, Question[]>();
  const source = focused.length >= Math.min(count, 5) ? focused : matchingCert;
  for (const question of shuffle(source, seed)) {
    const bucket = domainBuckets.get(question.domain) ?? [];
    bucket.push(question);
    domainBuckets.set(question.domain, bucket);
  }

  const balanced: Question[] = [];
  const buckets = [...domainBuckets.values()];
  let index = 0;
  while (balanced.length < Math.min(count, source.length) && buckets.length) {
    const bucket = buckets[index % buckets.length];
    const next = bucket.shift();
    if (next) balanced.push(next);
    index++;
    for (let i = buckets.length - 1; i >= 0; i--) if (buckets[i].length === 0) buckets.splice(i, 1);
  }

  return shuffleAndRelabel(balanced, seed);
}

function shuffleAndRelabel(balanced: Question[], seed: string) {
  const labels = ["A", "B", "C", "D"] as const;
  return shuffle(balanced, `${seed}:final`).map((q) => {
    const shuffledOptions = shuffle(q.options, `${seed}:${q.id}:options`);
    const correctText = q.options.find((option) => option.id === q.answer)?.text;
    const originalByText = new Map(q.options.map((option) => [option.text, option.id]));
    const options = shuffledOptions.map((option, index) => ({ ...option, id: labels[index] as (typeof labels)[number] }));
    const answer = options.find((option) => option.text === correctText)?.id ?? q.answer;
    const whyWrong = Object.fromEntries(
      options
        .filter((option) => option.id !== answer)
        .map((option) => {
          const originalId = originalByText.get(option.text);
          return [option.id, originalId ? q.whyWrong[originalId] : "Not the best fit here."];
        })
    );
    return { ...q, options, answer, whyWrong };
  });
}
