# btc-cent-forecast-01

Entry for make.fun's btc-cent-forecast-01: forecast BTC's close 240 minutes after a
checkpoint from 72 hours of 1-minute closes (make.fun/btc-cent-forecast-01).

## Model

    guess = last + 0.30 * (median(last 2h) - last) - 0.15 * (median(now 30m) - median(30m, 24h ago))

Short-term mean reversion toward the last two hours' median, plus a damped
contrarian term on the 24-hour move. Parameters fixed a priori and validated
walk-forward on the series itself; nothing is tuned on any case's answer.

## Run

    mkdir -p out && MAKEFUN_INPUT_DIR=input MAKEFUN_OUTPUT_DIR=out node main.ts

Reads every `*.in` case, writes `out/<id>.out` per case. Node 22, standard
library only, offline, deterministic. MIT licensed.
