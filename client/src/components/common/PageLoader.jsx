const PageLoader = () => {
  return (
    <div className="pl-root" role="status" aria-label="Loading">
      <style>{`
        .pl-root {
          height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fafafa;
        }

        .pl-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 18px;
        }

        .pl-frame {
          position: relative;
          width: 64px;
          height: 64px;
        }

        .pl-corner {
          position: absolute;
          width: 16px;
          height: 16px;
          border: 2px solid #0f172a;
          opacity: 0.85;
          animation: pl-breathe 1.6s ease-in-out infinite;
        }

        .pl-label {
          font-family: -apple-system, "Segoe UI", Roboto, sans-serif;
          font-size: 12px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #64748b;
        }

        .pl-corner:nth-child(1) {
          top: 0; left: 0;
          border-right: none;
          border-bottom: none;
        }
        .pl-corner:nth-child(2) {
          top: 0; right: 0;
          border-left: none;
          border-bottom: none;
          animation-delay: 0.15s;
        }
        .pl-corner:nth-child(3) {
          bottom: 0; right: 0;
          border-left: none;
          border-top: none;
          animation-delay: 0.3s;
        }
        .pl-corner:nth-child(4) {
          bottom: 0; left: 0;
          border-right: none;
          border-top: none;
          animation-delay: 0.45s;
        }

        .pl-dot {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 6px;
          height: 6px;
          margin: -3px 0 0 -3px;
          border-radius: 50%;
          background: #0f172a;
          animation: pl-pulse 1.6s ease-in-out infinite;
        }

        @keyframes pl-breathe {
          0%, 100% { transform: scale(1); opacity: 0.85; }
          50% { transform: scale(0.82); opacity: 0.4; }
        }

        @keyframes pl-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.6); opacity: 0.3; }
        }

        @media (prefers-reduced-motion: reduce) {
          .pl-corner, .pl-dot {
            animation: none !important;
          }
        }
      `}</style>

      <div className="pl-wrap">
        <div className="pl-frame">
          <span className="pl-corner" />
          <span className="pl-corner" />
          <span className="pl-corner" />
          <span className="pl-corner" />
          <span className="pl-dot" />
        </div>
        <span className="pl-label">Loading</span>
      </div>
    </div>
  );
};

export default PageLoader;
