import { useId } from "react";

const WAVE_VIEWBOX_WIDTH = 920;
const WAVE_CURVE_COUNT = 27;
const WAVE_PATTERN_WIDTH = WAVE_VIEWBOX_WIDTH / WAVE_CURVE_COUNT;

function createWavePath(baseline: number, crest: number) {
  const quarterWidth = WAVE_PATTERN_WIDTH / 4;
  const halfWidth = WAVE_PATTERN_WIDTH / 2;
  const threeQuarterWidth = (WAVE_PATTERN_WIDTH * 3) / 4;

  return `M0 ${baseline} C${quarterWidth} ${baseline} ${quarterWidth} ${crest} ${halfWidth} ${crest} S${threeQuarterWidth} ${baseline} ${WAVE_PATTERN_WIDTH} ${baseline}`;
}

export function WaveDivider({
  className = "relative isolate h-10 w-full sm:h-14 md:h-36 lg:h-44",
  variant = "outline",
}: {
  className?: string;
  variant?: "outline" | "scallop";
}) {
  const patternId = useId().replaceAll(":", "");

  if (variant === "scallop") {
    const scallopWidth = 18;
    const scallopCurve = `M0 10 C4.5 10 4.5 2 9 2 S13.5 10 18 10`;

    return (
      <div className={className}>
        <svg
          aria-hidden="true"
          className="absolute inset-0 block size-full"
          preserveAspectRatio="none"
          viewBox="0 0 972 18"
        >
          <defs>
            <pattern
              id={`${patternId}-scallop`}
              width={scallopWidth}
              height="18"
              patternUnits="userSpaceOnUse"
            >
              <path d={`${scallopCurve} L18 18 L0 18 Z`} fill="white" />
              <path
                d={scallopCurve}
                fill="none"
                stroke="#dfe4e1"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="972" height="18" fill={`url(#${patternId}-scallop)`} />
        </svg>
      </div>
    );
  }

  return (
    <div className={className}>
      <svg
        aria-hidden="true"
        className="absolute left-0 top-1/2 block h-9 w-full -translate-y-1/2"
        preserveAspectRatio="none"
        viewBox={`0 0 ${WAVE_VIEWBOX_WIDTH} 48`}
      >
        <defs>
          <pattern
            id={`${patternId}-light`}
            width={WAVE_PATTERN_WIDTH}
            height="48"
            patternUnits="userSpaceOnUse"
          >
            <path
              d={createWavePath(40, 20)}
              fill="none"
              stroke="#3D4042"
              strokeOpacity="0.1"
              strokeWidth="2"
            />
          </pattern>
          <pattern
            id={`${patternId}-dark`}
            width={WAVE_PATTERN_WIDTH}
            height="48"
            patternUnits="userSpaceOnUse"
          >
            <path
              d={createWavePath(28, 8)}
              fill="none"
              stroke="#3D4042"
              strokeWidth="2"
            />
          </pattern>
        </defs>
        <rect
          width={WAVE_VIEWBOX_WIDTH}
          height="48"
          fill={`url(#${patternId}-light)`}
        />
        <rect
          width={WAVE_VIEWBOX_WIDTH}
          height="48"
          fill={`url(#${patternId}-dark)`}
        />
      </svg>
    </div>
  );
}
