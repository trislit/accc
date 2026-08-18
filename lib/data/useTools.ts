"use client";

import { useEffect, useState } from "react";
import {
  bundledTools,
  readPublishedTools,
  type ClubTool,
} from "./tools";

export function useTools() {
  const [tools, setTools] = useState<ClubTool[]>(bundledTools);

  useEffect(() => {
    function sync() {
      setTools(readPublishedTools());
    }
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("accc-tools-changed", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("accc-tools-changed", sync);
    };
  }, []);

  return tools;
}
