const FLIGHT_PATH = 'M12,90.5 C20,58 55,42 88,10.5';

// The Bangladesh-to-Germany flight animation from the app's initial loading
// screen (see App.tsx), factored out so any page's own "data still
// loading" state can show the same animation instead of bare "Loading…"
// text. `fullScreen` centers it in the viewport (used once, for the
// app-level loading gate) — otherwise it just centers within its parent.
interface FlightLoaderProps {
  fullScreen?: boolean;
}

export default function FlightLoader({ fullScreen = false }: FlightLoaderProps) {
  const flight = (
    <div className="app-flight">
      <svg className="app-flight-svg" viewBox="0 0 100 110" width="100" height="110" aria-hidden="true">
        {/* Decorative clouds scattered across the sky */}
        <g className="app-flight-cloud" transform="translate(38, 62)">
          <circle cx="0" cy="5" r="3.5" />
          <circle cx="4.5" cy="2.5" r="4.5" />
          <circle cx="10" cy="5" r="3.5" />
        </g>
        <g className="app-flight-cloud" transform="translate(56, 34) scale(0.8)">
          <circle cx="0" cy="5" r="3.5" />
          <circle cx="4.5" cy="2.5" r="4.5" />
          <circle cx="10" cy="5" r="3.5" />
        </g>
        <g className="app-flight-cloud" transform="translate(14, 24) scale(0.6)">
          <circle cx="0" cy="5" r="3.5" />
          <circle cx="4.5" cy="2.5" r="4.5" />
          <circle cx="10" cy="5" r="3.5" />
        </g>
        <g className="app-flight-cloud" transform="translate(72, 62) scale(0.65)">
          <circle cx="0" cy="5" r="3.5" />
          <circle cx="4.5" cy="2.5" r="4.5" />
          <circle cx="10" cy="5" r="3.5" />
        </g>
        <g className="app-flight-cloud" transform="translate(28, 82) scale(0.5)">
          <circle cx="0" cy="5" r="3.5" />
          <circle cx="4.5" cy="2.5" r="4.5" />
          <circle cx="10" cy="5" r="3.5" />
        </g>
        <g className="app-flight-cloud" transform="translate(86, 42) scale(0.55)">
          <circle cx="0" cy="5" r="3.5" />
          <circle cx="4.5" cy="2.5" r="4.5" />
          <circle cx="10" cy="5" r="3.5" />
        </g>
        <g className="app-flight-cloud" transform="translate(6, 52) scale(0.45)">
          <circle cx="0" cy="5" r="3.5" />
          <circle cx="4.5" cy="2.5" r="4.5" />
          <circle cx="10" cy="5" r="3.5" />
        </g>

        <path className="app-flight-route" d={FLIGHT_PATH} />
        <defs>
          <mask id="app-flight-trail-mask">
            <path d={FLIGHT_PATH} className="app-flight-trail-reveal" pathLength={100} />
          </mask>
        </defs>
        <path className="app-flight-trail" d={FLIGHT_PATH} pathLength={100} mask="url(#app-flight-trail-mask)" />

        {/* Bangladesh — departure */}
        <g transform="translate(2, 84)">
          <rect width="20" height="13" fill="#006a4e" />
          <circle cx="8.7" cy="6.5" r="4.4" fill="#f42a41" />
        </g>

        {/* Germany — destination, with an arrival glow timed to the plane */}
        <circle className="app-flight-glow" cx="88" cy="10.5" r="16" />
        <g transform="translate(78, 4)">
          <rect width="20" height="13" fill="#000000" />
          <rect y="4.33" width="20" height="4.34" fill="#dd0000" />
          <rect y="8.67" width="20" height="4.33" fill="#ffce00" />
        </g>
      </svg>
      {/* A real airplane silhouette (top-down), nose-up in its own
          coordinate space — .app-flight-plane rotates it 90deg so the
          nose points along +x, matching offset-rotate: auto's convention
          (see theme.css). Small circles behind the tail form an exhaust
          trail that fades in sync with the flight. */}
      <svg className="app-flight-plane" viewBox="0 0 24 26" width="18" height="19.5" aria-hidden="true">
        <circle className="app-flight-smoke app-flight-smoke-1" cx="12" cy="22.3" r="1.1" />
        <circle className="app-flight-smoke app-flight-smoke-2" cx="12" cy="23.9" r="0.85" />
        <circle className="app-flight-smoke app-flight-smoke-3" cx="12" cy="25.2" r="0.6" />
        <path
          d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2.5 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"
          fill="currentColor"
        />
      </svg>
    </div>
  );

  return <div className={fullScreen ? 'app-loading-screen' : 'app-flight-inline'}>{flight}</div>;
}
