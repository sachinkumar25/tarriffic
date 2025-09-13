import clsx from "clsx";

type Side = "left" | "right" | "top" | "bottom";

type DockProps = {
  id: string;
  side?: Side;
  /** Offset along the edge. Number is treated as %, or pass "50%". */
  offset?: number | string;
  /** Dot diameter in px (affects ring + core). */
  size?: number;
  className?: string;
};

const toPct = (v: number | string | undefined) =>
  typeof v === "number" ? `${v}%` : v ?? "50%";

export default function Dock({
  id,
  side = "right",
  offset = "50%",
  size = 12,
  className,
}: DockProps) {
  // position the container so half of it hangs outside the node edge
  let pos: React.CSSProperties = {};
  switch (side) {
    case "left":
      pos = { left: -size / 2, top: toPct(offset), transform: "translateY(-50%)" };
      break;
    case "right":
      pos = { right: -size / 2, top: toPct(offset), transform: "translateY(-50%)" };
      break;
    case "top":
      pos = { top: -size / 2, left: toPct(offset), transform: "translateX(-50%)" };
      break;
    case "bottom":
      pos = { bottom: -size / 2, left: toPct(offset), transform: "translateX(-50%)" };
      break;
  }

  const ringSize = size;
  const coreSize = Math.max(2, size * 0.55);

  return (
    <div
      id={id}
      data-dock-side={side}              
      className={clsx("pointer-events-none absolute", className)}
      style={{ width: ringSize, height: ringSize, ...pos }}
    >
      <span
        className="block rounded-full bg-white/10 ring-1 ring-white/35"
        style={{ width: ringSize, height: ringSize }}
      />
      <span
        className="absolute inset-0 m-auto rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.45)]"
        style={{ width: coreSize, height: coreSize }}
      />
    </div>
  );
}
