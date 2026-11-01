import Image from "next/image";
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

export function WaveDivider() {
  const patternId = useId().replaceAll(":", "");

  return (
    <div className="relative isolate h-10 w-full sm:h-14 md:h-36 lg:h-44">
      <Image
        src="/images/homepage-leaf-right-top.png"
        alt=""
        aria-hidden="true"
        width={361}
        height={279}
        className="pointer-events-none absolute right-0 bottom-1/2 z-10 hidden h-auto w-36 object-contain md:block lg:w-44"
      />
      <Image
        src="/images/homepage-leaf-left-bottom.png"
        alt=""
        aria-hidden="true"
        width={374}
        height={279}
        className="pointer-events-none absolute left-0 top-1/2 z-10 hidden h-auto w-36 object-contain md:block lg:w-44"
      />

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
