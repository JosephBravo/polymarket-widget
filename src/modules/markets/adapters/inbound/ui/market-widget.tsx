"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import type { Market } from "@/modules/markets/domain/market";
import type { OrderBook } from "@/modules/markets/domain/order-book";
import type { Prediction } from "@/modules/predictions/domain/prediction";
import type { OrderPreview, PlacedOrder } from "@/modules/trading/application/ports/trading-gateway";
import { OutcomeSide } from "@/modules/shared/domain/outcome";
import {
  apiRequest,
  formatApiError,
  type MarketDetailsResponse,
  type PlaceResponse,
  type PreviewResponse,
  type PredictionResponse,
  type SearchResponse,
  type StatusResponse,
} from "./api-client";
import { VpnNotice } from "./vpn-notice";
import { ThemeToggle } from "@/modules/shared/adapters/inbound/ui/theme-toggle";

export function MarketWidget() {
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [query, setQuery] = useState("");
  const [markets, setMarkets] = useState<Market[]>([]);
  const [selected, setSelected] = useState<Market | null>(null);
  const [book, setBook] = useState<OrderBook | null>(null);
  const [outcome, setOutcome] = useState<OutcomeSide>(OutcomeSide.YES);
  const [quantity, setQuantity] = useState("1");
  const [limitPrice, setLimitPrice] = useState("0.50");
  const [preview, setPreview] = useState<OrderPreview | null>(null);
  const [placed, setPlaced] = useState<PlacedOrder | null>(null);
  const [aiPrompt, setAiPrompt] = useState("");
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [marketsLoading, setMarketsLoading] = useState(true);

  useEffect(() => {
    apiRequest<StatusResponse>("/api/status")
      .then(setStatus)
      .catch(() => setStatus(null));

    apiRequest<SearchResponse>("/api/markets/search?q=&limit=20")
      .then((data) => setMarkets(data.markets))
      .catch((err) => {
        setError(
          formatApiError(err) ||
            "Could not load markets. Connect to a VPN if Polymarket US is blocked in your region.",
        );
      })
      .finally(() => setMarketsLoading(false));
  }, []);

  const search = useCallback(async (event?: FormEvent) => {
    event?.preventDefault();
    setError(null);
    setBusy("search");
    try {
      const data = await apiRequest<SearchResponse>(
        `/api/markets/search?q=${encodeURIComponent(query)}&limit=20`,
      );
      setMarkets(data.markets);
      if (data.markets.length === 0) {
        setSelected(null);
        setBook(null);
      }
    } catch (err) {
      setError(formatApiError(err) || "Search failed");
    } finally {
      setBusy(null);
    }
  }, [query]);

  const selectMarket = useCallback(
    async (market: Market, options?: { manageBusy?: boolean }) => {
      const manageBusy = options?.manageBusy ?? true;
      setError(null);
      setPreview(null);
      setPlaced(null);
      setSelected(market);
      setBook(null);
      if (manageBusy) {
        setBusy("market");
      }
      try {
        const data = await apiRequest<MarketDetailsResponse>(
          `/api/markets/${encodeURIComponent(market.slug)}`,
        );
        setSelected(data.market);
        setBook(data.book);
        if (data.book.bestAsk) {
          setLimitPrice(data.book.bestAsk);
        } else if (data.book.asks[0]) {
          setLimitPrice(data.book.asks[0].price);
        }
      } catch (err) {
        setError(formatApiError(err) || "Failed to load market");
      } finally {
        if (manageBusy) {
          setBusy(null);
        }
      }
    },
    [],
  );

  const submitOrder = useCallback(async (mode: "preview" | "place") => {
    if (!selected) {
      setError("Select a market first");
      return;
    }
    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty < 1) {
      setError("Quantity must be a whole number of at least 1");
      return;
    }
    setError(null);
    setBusy(mode);
    try {
      const payload = {
        marketSlug: selected.slug,
        outcome,
        quantity: qty,
        limitPrice,
      };
      if (mode === "preview") {
        const data = await apiRequest<PreviewResponse>("/api/orders/preview", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setPreview(data.preview);
        setPlaced(null);
      } else {
        const data = await apiRequest<PlaceResponse>("/api/orders", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setPlaced(data.order);
      }
    } catch (err) {
      setError(formatApiError(err) || "Order request failed");
    } finally {
      setBusy(null);
    }
  }, [selected, outcome, quantity, limitPrice]);

  const requestPrediction = useCallback(async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setBusy("ai");
    try {
      const data = await apiRequest<PredictionResponse>("/api/predictions", {
        method: "POST",
        body: JSON.stringify({ prompt: aiPrompt, query: query || undefined }),
      });
      setPrediction(data.prediction);
      setMarkets(data.candidates);
      const match = data.candidates.find(
        (market) => market.slug === data.prediction.marketSlug,
      );
      if (match) {
        await selectMarket(match, { manageBusy: false });
        setOutcome(data.prediction.outcome);
        setLimitPrice(data.prediction.suggestedLimitPrice);
      }
    } catch (err) {
      setError(formatApiError(err) || "Prediction failed");
    } finally {
      setBusy(null);
    }
  }, [aiPrompt, query, selectMarket]);

  const orderBusy = busy === "preview" || busy === "place";

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <VpnNotice />
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400">
            Polymarket US
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
            Market Widget
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            Search live markets, inspect the book, and place a YES/NO limit bet.
            AI can suggest a market and outcome from your prompt.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ThemeToggle />
          <StatusPills status={status} />
        </div>
      </header>

      {error ? (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200"
        >
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <section className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-5">
          <form onSubmit={search} className="flex flex-col gap-3 sm:flex-row">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search markets (bitcoin, election, Super Bowl…)"
              className="h-11 w-full rounded-xl border border-zinc-300 bg-transparent px-3 text-sm outline-none ring-emerald-500/40 focus:ring-2 dark:border-zinc-700"
            />
            <button
              type="submit"
              disabled={busy === "search"}
              className="h-11 shrink-0 cursor-pointer rounded-xl bg-zinc-900 px-4 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
            >
              {busy === "search" ? "Searching…" : "Search"}
            </button>
          </form>

          <div className="flex max-h-[28rem] flex-col gap-2 overflow-auto pr-1">
            {marketsLoading ? (
              <p className="px-1 py-8 text-center text-sm text-zinc-500">
                Loading markets…
              </p>
            ) : markets.length === 0 ? (
              <p className="px-1 py-8 text-center text-sm text-zinc-500">
                Search for a topic or leave the box empty to load active markets.
              </p>
            ) : (
              markets.map((market) => (
                <button
                  key={market.slug}
                  type="button"
                  onClick={() => selectMarket(market)}
                  className={`cursor-pointer rounded-xl border px-3 py-3 text-left transition ${
                    selected?.slug === market.slug
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40"
                      : "border-zinc-200 hover:border-zinc-400 dark:border-zinc-800"
                  }`}
                >
                  <p className="text-sm font-medium">{market.title}</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {market.outcome}
                    {market.eventTitle ? ` · ${market.eventTitle}` : ""}
                  </p>
                </button>
              ))
            )}
          </div>
        </section>

        <div className="flex flex-col gap-4">
          <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-5">
            {selected && book ? (
              <>
                <h2 className="text-lg font-semibold">{selected.title}</h2>
                <p className="mt-1 text-sm text-zinc-500">{selected.outcome}</p>
                <BookTable book={book} />
              </>
            ) : (
              <p className="py-10 text-center text-sm text-zinc-500">
                {busy === "market" ? "Loading market…" : "Select a market to view the book."}
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Place a bet
            </h3>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <OutcomeButton
                label="YES"
                active={outcome === OutcomeSide.YES}
                onClick={() => setOutcome(OutcomeSide.YES)}
              />
              <OutcomeButton
                label="NO"
                active={outcome === OutcomeSide.NO}
                tone="rose"
                onClick={() => setOutcome(OutcomeSide.NO)}
              />
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-medium text-zinc-500">
                Contracts
                <input
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                  type="number"
                  min={1}
                  step={1}
                  className="mt-1 h-11 w-full rounded-xl border border-zinc-300 bg-transparent px-3 text-sm dark:border-zinc-700"
                />
              </label>
              <label className="text-xs font-medium text-zinc-500">
                Limit price (0–1)
                <input
                  value={limitPrice}
                  onChange={(event) => setLimitPrice(event.target.value)}
                  className="mt-1 h-11 w-full rounded-xl border border-zinc-300 bg-transparent px-3 text-sm dark:border-zinc-700"
                />
              </label>
            </div>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <TradeButton
                label={busy === "preview" ? "Previewing…" : "Preview"}
                blocked={selected === null || book === null || orderBusy}
                onClick={() => submitOrder("preview")}
                variant="outline"
              />
              <TradeButton
                label={busy === "place" ? "Placing…" : "Place bet"}
                blocked={selected === null || book === null || orderBusy}
                onClick={() => submitOrder("place")}
                variant="primary"
              />
            </div>
            {preview ? (
              <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
                Preview {preview.quantity} @ {preview.limitPrice}
                {preview.estimatedCost ? ` · est. ${preview.estimatedCost} USD` : ""}
              </p>
            ) : null}
            {placed ? (
              <p className="mt-2 text-sm text-emerald-700 dark:text-emerald-400">
                Order {placed.id} submitted{placed.state ? ` (${placed.state})` : ""}.
              </p>
            ) : null}
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
              AI prediction
            </h3>
            <form onSubmit={requestPrediction} className="mt-3 flex flex-col gap-3">
              <textarea
                value={aiPrompt}
                onChange={(event) => setAiPrompt(event.target.value)}
                rows={3}
                placeholder="e.g. Which active market is the best YES bet on Bitcoin this month?"
                className="w-full rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-sm outline-none ring-emerald-500/40 focus:ring-2 dark:border-zinc-700"
              />
              <button
                type="submit"
                disabled={busy === "ai"}
                className="h-11 cursor-pointer rounded-xl bg-zinc-900 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
              >
                {busy === "ai" ? "Asking AI…" : "Predict market and outcome"}
              </button>
            </form>
            {prediction ? (
              <div className="mt-4 rounded-xl bg-zinc-50 p-3 text-sm dark:bg-zinc-900">
                <p className="font-medium">
                  {prediction.outcome} on {prediction.marketSlug} @{" "}
                  {prediction.suggestedLimitPrice}
                </p>
                <p className="mt-1 text-zinc-500">
                  Confidence {(prediction.confidence * 100).toFixed(0)}%
                </p>
                <p className="mt-2 leading-6 text-zinc-700 dark:text-zinc-300">
                  {prediction.rationale}
                </p>
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
}

function TradeButton({
  label,
  blocked,
  onClick,
  variant,
}: {
  label: string;
  blocked: boolean;
  onClick: () => void;
  variant: "outline" | "primary";
}) {
  return (
    <button
      type="button"
      disabled={blocked}
      onClick={onClick}
      className={`h-11 flex-1 rounded-xl text-sm font-medium ${
        variant === "primary"
          ? "bg-emerald-600 text-white"
          : "border border-zinc-300 dark:border-zinc-700"
      } ${
        blocked
          ? "cursor-not-allowed opacity-60"
          : "cursor-pointer"
      }`}
    >
      {label}
    </button>
  );
}

function StatusPills({ status }: { status: StatusResponse | null }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Pill
        label="Trading keys"
        state={
          status === null
            ? "checking"
            : status.tradingConfigured
              ? "ready"
              : "missing"
        }
      />
      <Pill
        label="AI keys"
        state={
          status === null
            ? "checking"
            : status.aiConfigured
              ? "ready"
              : "missing"
        }
      />
    </div>
  );
}

function Pill({
  label,
  state,
}: {
  label: string;
  state: "checking" | "ready" | "missing";
}) {
  const className =
    state === "ready"
      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
      : state === "checking"
        ? "bg-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-500"
        : "bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400";

  const text =
    state === "ready" ? "ready" : state === "checking" ? "checking…" : "missing";

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${className}`}>
      {label}: {text}
    </span>
  );
}

function OutcomeButton({
  label,
  active,
  onClick,
  tone = "emerald",
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  tone?: "emerald" | "rose";
}) {
  const activeClass =
    tone === "emerald"
      ? "border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
      : "border-rose-500 bg-rose-50 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-11 cursor-pointer rounded-xl border text-sm font-semibold ${
        active ? activeClass : "border-zinc-300 dark:border-zinc-700"
      }`}
    >
      {label}
    </button>
  );
}

function BookTable({ book }: { book: OrderBook }) {
  const rows = Math.max(book.bids.length, book.asks.length, 1);
  const visible = Math.min(rows, 6);

  return (
    <div className="mt-4 overflow-x-auto">
      <div className="mb-2 flex gap-4 text-xs text-zinc-500">
        <span>Best bid {book.bestBid ?? "—"}</span>
        <span>Best ask {book.bestAsk ?? "—"}</span>
      </div>
      <table className="w-full text-left text-xs">
        <thead className="text-zinc-500">
          <tr>
            <th className="pb-2 font-medium">Bid px</th>
            <th className="pb-2 font-medium">Bid size</th>
            <th className="pb-2 font-medium">Ask px</th>
            <th className="pb-2 font-medium">Ask size</th>
          </tr>
        </thead>
        <tbody className="font-mono">
          {Array.from({ length: visible }).map((_, index) => (
            <tr key={index} className="border-t border-zinc-100 dark:border-zinc-800">
              <td className="py-1.5 text-emerald-700 dark:text-emerald-400">
                {book.bids[index]?.price ?? "—"}
              </td>
              <td className="py-1.5">{book.bids[index]?.size ?? "—"}</td>
              <td className="py-1.5 text-rose-700 dark:text-rose-400">
                {book.asks[index]?.price ?? "—"}
              </td>
              <td className="py-1.5">{book.asks[index]?.size ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
