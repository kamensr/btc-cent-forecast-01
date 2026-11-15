// btc-cent-forecast-01 entry: forecast BTC's close 240 minutes after the checkpoint
// from the 72 hours of 1-minute closes the case gives. Node 22, standard library only,
// offline, deterministic: same input, same output bytes.
//
// Model (fixed a priori, validated by walk-forward on the series itself):
//   guess = last + 0.30 * (median(last 2h) - last) - 0.15 * (median(30m now) - median(30m, 24h ago))
//
// Two plain effects: prices sit slightly closer to their recent 2-hour level than the
// last tick suggests (short-term mean reversion), and a strong 24-hour move partially
// retraces rather than continues (damped contrarian drift). Both shrink the guess
// toward the middle, which is what absolute error rewards. No parameter was tuned on
// any case's answer; the checkpoints scored here are unseen future closes.

import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const INPUT_DIR = process.env.MAKEFUN_INPUT_DIR ?? '/input';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const MIN_PRICE = 0.00001;
const MAX_PRICE = 9_999_999.99999;
const price5 = (x: number): number =>
  Math.round(Math.min(MAX_PRICE, Math.max(MIN_PRICE, x)) * 1e5) / 1e5;

/** Median of a slice of prices. */
function medianOf(a: number[]): number {
  const s = [...a].sort((x, y) => x - y);
  const n = s.length;
  return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
}

const REV_HOURS = 2;   // short-term anchor window
const REV_FRAC = 0.3;  // how far the last tick walks back to it
const MOM_HOURS = 24;  // daily drift window
const MOM_FRAC = -0.15; // damped contrarian: strong 24h moves partially retrace

function forecast(prices: number[]): number {
  const n = prices.length;
  const last = prices[n - 1];
  if (typeof last !== 'number' || !Number.isFinite(last)) throw new Error('bad last price');

  // Short-term reversion: from the last close toward the last 2 hours' median.
  const anchor = medianOf(prices.slice(n - REV_HOURS * 60));
  const rev = (anchor - last) * REV_FRAC;

  // Damped 24h drift: endpoints smoothed by 30-minute medians (robust to spikes).
  const now = medianOf(prices.slice(n - 30));
  const past = medianOf(prices.slice(n - MOM_HOURS * 60 - 30, n - MOM_HOURS * 60));
  const mom = (now - past) * MOM_FRAC;

  return price5(last + rev + mom);
}

mkdirSync(OUTPUT_DIR, { recursive: true });
// One case per run in the grader; read every .in in name order so runs are reproducible.
const inputs = readdirSync(INPUT_DIR).filter((f) => f.endsWith('.in')).sort();
for (const file of inputs) {
  const id = file.slice(0, -'.in'.length);
  const c = JSON.parse(readFileSync(join(INPUT_DIR, file), 'utf8'));
  const markets = c.markets;
  if (!Array.isArray(markets) || markets.length !== 1) throw new Error(`${file}: expected one market`);
  const prices = markets[0].prices as number[];
  if (!Array.isArray(prices) || prices.length === 0) throw new Error(`${file}: no prices`);
  writeFileSync(
    join(OUTPUT_DIR, `${id}.out`),
    JSON.stringify({ forecasts: [{ case: id, price: forecast(prices) }] }) + '\n',
  );
}
