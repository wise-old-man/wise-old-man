"use client";

import { PropsWithChildren, createContext, useContext, useEffect, useState } from "react";

export const CHALLENGER_PREFIX = "/c";

const InteractionDetectedContext = createContext(false);

export function useInteractionDetected() {
  return useContext(InteractionDetectedContext);
}

export function LinkChallengerProvider(props: PropsWithChildren) {
  const [interactionDetected, setInteractionDetected] = useState(false);

  useEffect(() => {
    function cleanup() {
      window.document.removeEventListener("mousemove", handleInteraction);
      window.document.removeEventListener("keydown", handleInteraction);
      window.document.removeEventListener("touchstart", handleInteraction);
    }

    function handleInteraction() {
      cleanup();
      setInteractionDetected(true);
    }

    window.document.addEventListener("mousemove", handleInteraction);
    window.document.addEventListener("keydown", handleInteraction);
    window.document.addEventListener("touchstart", handleInteraction);

    return () => {
      cleanup();
    };
  }, []);

  return (
    <InteractionDetectedContext.Provider value={interactionDetected}>
      {props.children}
    </InteractionDetectedContext.Provider>
  );
}
