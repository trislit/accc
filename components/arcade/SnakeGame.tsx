"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Atmosphere } from "@/components/art/Atmosphere";

const SIZE = 16;
const TICK = 140;
type Point = { x: number; y: number };
type Dir = "up" | "down" | "left" | "right";

function eq(a: Point, b: Point) {
  return a.x === b.x && a.y === b.y;
}

function next(head: Point, dir: Dir): Point {
  if (dir === "up") return { x: head.x, y: head.y - 1 };
  if (dir === "down") return { x: head.x, y: head.y + 1 };
  if (dir === "left") return { x: head.x - 1, y: head.y };
  return { x: head.x + 1, y: head.y };
}

function spawn(snake: Point[]): Point {
  for (let i = 0; i < 80; i += 1) {
    const point = {
      x: Math.floor(Math.random() * SIZE),
      y: Math.floor(Math.random() * SIZE),
    };
    if (!snake.some((part) => eq(part, point))) return point;
  }
  return { x: 0, y: 0 };
}

export function SnakeGame({ wallpaper }: { wallpaper: string }) {
  const [snake, setSnake] = useState<Point[]>([{ x: 8, y: 8 }]);
  const [food, setFood] = useState<Point>({ x: 12, y: 8 });
  const [alive, setAlive] = useState(false);
  const [score, setScore] = useState(0);
  const dirRef = useRef<Dir>("right");
  const nextDir = useRef<Dir>("right");

  const reset = useCallback(() => {
    const start = [{ x: 8, y: 8 }];
    setSnake(start);
    setFood(spawn(start));
    dirRef.current = "right";
    nextDir.current = "right";
    setScore(0);
    setAlive(true);
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const map: Record<string, Dir> = {
        ArrowUp: "up",
        ArrowDown: "down",
        ArrowLeft: "left",
        ArrowRight: "right",
        w: "up",
        s: "down",
        a: "left",
        d: "right",
      };
      const wanted = map[event.key];
      if (!wanted) return;
      event.preventDefault();
      const current = dirRef.current;
      const opposite =
        (current === "up" && wanted === "down") ||
        (current === "down" && wanted === "up") ||
        (current === "left" && wanted === "right") ||
        (current === "right" && wanted === "left");
      if (!opposite) nextDir.current = wanted;
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!alive) return;
    const id = window.setInterval(() => {
      dirRef.current = nextDir.current;
      setSnake((current) => {
        const head = next(current[0], dirRef.current);
        const hitWall =
          head.x < 0 || head.y < 0 || head.x >= SIZE || head.y >= SIZE;
        const hitSelf = current.some((part) => eq(part, head));
        if (hitWall || hitSelf) {
          setAlive(false);
          return current;
        }
        const eating = eq(head, food);
        const body = eating ? current : current.slice(0, -1);
        if (eating) {
          setScore((value) => value + 1);
          setFood(spawn([head, ...body]));
        }
        return [head, ...body];
      });
    }, TICK);
    return () => window.clearInterval(id);
  }, [alive, food]);

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-lg border border-border">
        <Atmosphere id={wallpaper} className="aspect-square opacity-40" rounded="rounded-none" />
        <div className="absolute inset-0 grid p-3" style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)` }}>
          {Array.from({ length: SIZE * SIZE }, (_, index) => {
            const x = index % SIZE;
            const y = Math.floor(index / SIZE);
            const onSnake = snake.some((part) => part.x === x && part.y === y);
            const head = eq(snake[0], { x, y });
            const onFood = eq(food, { x, y });
            return (
              <div
                key={index}
                className={
                  head
                    ? "rounded-[1px] bg-forge-green"
                    : onSnake
                      ? "rounded-[1px] bg-forge-green/60"
                      : onFood
                        ? "rounded-full bg-[#e6dcc4]"
                        : ""
                }
              />
            );
          })}
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-text-secondary">Eat the chips. Don’t hit a wall or yourself.</p>
        <p className="tabular text-sm">Score {score}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={reset}>
          {alive ? "Restart" : "Play snake"}
        </Button>
        <Pad onDir={(value) => {
          const current = dirRef.current;
          const opposite =
            (current === "up" && value === "down") ||
            (current === "down" && value === "up") ||
            (current === "left" && value === "right") ||
            (current === "right" && value === "left");
          if (!opposite) nextDir.current = value;
        }} />
      </div>
    </div>
  );
}

function Pad({ onDir }: { onDir: (dir: Dir) => void }) {
  return (
    <div className="ml-auto grid grid-cols-3 gap-1">
      <span />
      <Button size="sm" variant="secondary" onClick={() => onDir("up")}>
        ↑
      </Button>
      <span />
      <Button size="sm" variant="secondary" onClick={() => onDir("left")}>
        ←
      </Button>
      <Button size="sm" variant="secondary" onClick={() => onDir("down")}>
        ↓
      </Button>
      <Button size="sm" variant="secondary" onClick={() => onDir("right")}>
        →
      </Button>
    </div>
  );
}
