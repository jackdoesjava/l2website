import { useEffect, useRef, useState } from "react";

type Props = {
  url?: string | null;
  className?: string;
  /** Rendered pixel width of the thumbnail (CSS px). Keep it small. */
  width?: number;
};

/**
 * Renders the first page of a PDF into a small canvas thumbnail.
 * Client-only: pdfjs is dynamically imported after mount.
 */
export function PdfThumb({ url, className, width = 220 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "ready" | "error">(
    url ? "loading" : "idle",
  );

  useEffect(() => {
    let cancelled = false;
    if (!url) {
      setState("idle");
      return;
    }
    setState("loading");

    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        const workerSrc = (
          await import("pdfjs-dist/build/pdf.worker.min.mjs?url")
        ).default;
        pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

        const doc = await pdfjs.getDocument({ url }).promise;
        if (cancelled) return;
        const page = await doc.getPage(1);
        const canvas = canvasRef.current;
        if (!canvas || cancelled) return;

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const base = page.getViewport({ scale: 1 });
        const scale = (width / base.width) * dpr;
        const viewport = page.getViewport({ scale });

        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);

        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        await page.render({ canvas, canvasContext: ctx, viewport }).promise;
        if (!cancelled) setState("ready");
      } catch {
        if (!cancelled) setState("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [url, width]);

  return (
    <div
      className={
        "relative overflow-hidden border border-border bg-muted/40 " +
        (className ?? "")
      }
    >
      <canvas
        ref={canvasRef}
        aria-hidden={state !== "ready"}
        className={
          "absolute inset-0 h-full w-full object-contain transition-opacity duration-500 " +
          (state === "ready" ? "opacity-100" : "opacity-0")
        }
      />
      {state !== "ready" && (
        <div className="absolute inset-0 grid place-items-center">
          <span className="font-sans text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
            {state === "loading" ? "Rendering…" : "No preview"}
          </span>
        </div>
      )}
    </div>
  );
}
