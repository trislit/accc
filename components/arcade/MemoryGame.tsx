"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Atmosphere } from "@/components/art/Atmosphere";

const FACES = ["Ash", "Iron", "Gate", "Seat", "Mark", "Cabal", "Yield", "Desk"];

function shuffledDeck() {
  const pairs = [...FACES, ...FACES];
  for (let i = pairs.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
  }
  return pairs.map((face, index) => ({ id: index, face, open: false, matched: false }));
}

export function MemoryGame({ wallpaper }: { wallpaper: string }) {
  const [deck, setDeck] = useState(shuffledDeck);
  const [picked, setPicked] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const won = useMemo(() => deck.every((card) => card.matched), [deck]);

  function reset() {
    setDeck(shuffledDeck());
    setPicked([]);
    setMoves(0);
  }

  function flip(index: number) {
    const card = deck[index];
    if (card.open || card.matched || picked.length === 2) return;
    const nextPicked = [...picked, index];
    const nextDeck = deck.map((item, i) =>
      i === index ? { ...item, open: true } : item,
    );
    setDeck(nextDeck);
    if (nextPicked.length < 2) {
      setPicked(nextPicked);
      return;
    }
    setMoves((value) => value + 1);
    const [a, b] = nextPicked;
    if (nextDeck[a].face === nextDeck[b].face) {
      setDeck(
        nextDeck.map((item, i) =>
          i === a || i === b ? { ...item, matched: true } : item,
        ),
      );
      setPicked([]);
      return;
    }
    window.setTimeout(() => {
      setDeck((current) =>
        current.map((item, i) =>
          i === a || i === b ? { ...item, open: false } : item,
        ),
      );
      setPicked([]);
    }, 700);
  }

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-lg border border-border p-3">
        <div className="pointer-events-none absolute inset-0 opacity-30">
          <Atmosphere id={wallpaper} className="h-full w-full" rounded="rounded-none" />
        </div>
        <div className="relative grid grid-cols-4 gap-2">
          {deck.map((card, index) => (
            <button
              key={card.id}
              type="button"
              onClick={() => flip(index)}
              className={`flex aspect-square items-center justify-center rounded-md border text-xs font-semibold ${
                card.matched || card.open
                  ? "border-forge-green/40 bg-surface-1 text-text-primary"
                  : "border-border bg-surface-3 text-transparent"
              }`}
            >
              {card.open || card.matched ? card.face : "•"}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-text-secondary">
          Flip two cards. Match the pairs.
        </p>
        <p className="tabular text-sm">{won ? "Cleared" : `${moves} moves`}</p>
      </div>
      <Button size="sm" onClick={reset}>
        {won ? "Play again" : "New shuffle"}
      </Button>
    </div>
  );
}
