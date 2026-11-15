# Validation notes

Walk-forward backtest inside each practice case's own 72h series (checkpoints
every 2h from t=24h, guess vs actual 240 minutes later, same series):

- model  (reversion 2h x0.30, damped 24h drift x -0.15): 36,340 cents mean
- persistence (house baseline shape):                    40,950 cents mean
- hold-out subset (last third of each case): model 40,846c vs persist 43,131c

On the six official practice checkpoints (answers not in the kit; evaluated on
a correlated public BTC series as a proxy), the model scores ~41,080 cents vs
~41,907 for persistence and 44,522 for the official house baseline.

Direction is consistent across all three views: shrink the last tick toward
the recent level, fade the 24h move slightly. The final is scored on unseen
future closes, so the edge is small and not guaranteed.
