// wireframe-kit.jsx — primitives + theme + flow bridge
// Low-fi structured wireframe primitives, hand-drawn vibe.
// Exports primitives onto window so all screen files can use them.

const wkTheme = {
  paper:    '#f5efde',
  ink:      '#1f1c18',
  ink2:     '#5b554a',
  ink3:     '#8e8773',
  rule:     '#1f1c18',
  faint:    '#d8cfb8',
  fill:     '#e8dfc4',
  fill2:    '#dcd2b6',
  noteY:    '#f5d76a',
  noteC:    '#e89171',
  noteG:    '#9ec48a',
  primary:  '#1f8a4e', // toned-down brief green for accents
  primaryFg:'#fff',
  fontHand: '"Caveat","Bradley Hand",cursive',
  fontUi:   '"Architects Daughter","Patrick Hand",cursive',
  fontMono: '"JetBrains Mono",ui-monospace,monospace',
};
window.wkTheme = wkTheme;

// Inject baseline styles once.
if (typeof document !== 'undefined' && !document.getElementById('wk-styles')) {
  const s = document.createElement('style');
  s.id = 'wk-styles';
  s.textContent = `
    .wk{font-family:${wkTheme.fontUi};color:${wkTheme.ink};
        background:${wkTheme.paper};line-height:1.25;
        position:absolute;inset:0;overflow:hidden;
        --wk-stroke:1.5px;--wk-radius:6px;--wk-ann-opa:1}
    .wk.wk-clean{font-family:ui-sans-serif,system-ui,-apple-system,sans-serif;--wk-radius:8px}
    .wk *{box-sizing:border-box}
    .wk-paper{background:${wkTheme.paper}}
    .wk-dark{background:#161210;color:#ece7d6;--wk-line:#ece7d6}
    .wk-dark .wk-box{border-color:#ece7d6}
    .wk-dark .wk-rule{background:#ece7d6}
    .wk-dark .wk-fill{background:#221d18}
    .wk-dark .wk-fill2{background:#2c251f}
    .wk-box{border:var(--wk-stroke) solid ${wkTheme.rule};border-radius:var(--wk-radius);background:transparent}
    .wk-box.wk-fill{background:${wkTheme.fill}}
    .wk-box.wk-fill2{background:${wkTheme.fill2}}
    .wk-box.wk-dashed{border-style:dashed}
    .wk-rule{height:1.5px;background:${wkTheme.rule};border:0}
    .wk-rule.wk-faint{background:${wkTheme.faint};height:1px}
    .wk-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;
            padding:8px 14px;border:var(--wk-stroke) solid ${wkTheme.rule};
            border-radius:var(--wk-radius);background:transparent;
            font-family:inherit;font-size:15px;color:inherit;cursor:pointer;
            white-space:nowrap}
    .wk-btn.wk-pri{background:var(--wk-primary,${wkTheme.primary});color:${wkTheme.primaryFg};border-color:var(--wk-primary,${wkTheme.primary})}
    .wk-btn.wk-ghost{border-style:dashed;color:${wkTheme.ink2}}
    .wk-btn.wk-icon{padding:6px 9px;font-size:14px}
    .wk-pill{display:inline-flex;align-items:center;gap:4px;padding:2px 9px;
             border:1.2px solid ${wkTheme.rule};border-radius:999px;
             font-size:13px;background:transparent}
    .wk-pill.wk-fill{background:${wkTheme.fill}}
    .wk-tag{font-family:${wkTheme.fontMono};font-size:11px;letter-spacing:.02em}
    .wk-mono{font-family:${wkTheme.fontMono}}
    .wk-hand{font-family:${wkTheme.fontHand};letter-spacing:.005em}
    .wk-h1{font-size:28px;font-weight:400;line-height:1.05;font-family:${wkTheme.fontHand}}
    .wk-h2{font-size:21px;font-weight:400;line-height:1.1;font-family:${wkTheme.fontHand}}
    .wk-h3{font-size:16px;font-weight:400;line-height:1.15;font-family:${wkTheme.fontUi}}
    .wk-lbl{font-size:12px;color:${wkTheme.ink2};letter-spacing:.04em;text-transform:uppercase}
    .wk-link{text-decoration:underline;text-underline-offset:3px;cursor:pointer}
    .wk-row{display:flex;align-items:center}
    .wk-col{display:flex;flex-direction:column}
    .wk-img{display:flex;align-items:center;justify-content:center;
            background:repeating-linear-gradient(135deg,${wkTheme.fill} 0 8px,${wkTheme.fill2} 8px 16px);
            border:var(--wk-stroke) solid ${wkTheme.rule};border-radius:var(--wk-radius);
            color:${wkTheme.ink2};font-family:${wkTheme.fontMono};font-size:11px;
            position:relative;overflow:hidden}
    .wk-img::before,.wk-img::after{content:"";position:absolute;left:6%;right:6%;top:50%;height:1.2px;background:${wkTheme.ink};opacity:.55;transform-origin:center}
    .wk-img::before{transform:rotate(15deg)}
    .wk-img::after{transform:rotate(-15deg)}
    .wk-img > span{position:relative;z-index:1;background:${wkTheme.paper};padding:2px 6px;border:1px solid ${wkTheme.rule};border-radius:3px}
    .wk-dark .wk-img > span{background:#221d18}
    .wk-input{display:flex;align-items:center;gap:8px;padding:10px 12px;
              border:var(--wk-stroke) solid ${wkTheme.rule};border-radius:var(--wk-radius);
              background:rgba(255,255,255,.4);font-family:${wkTheme.fontUi};color:${wkTheme.ink2};
              min-height:38px}
    .wk-dark .wk-input{background:rgba(255,255,255,.05);color:#bfb6a0}
    .wk-input.wk-focus{box-shadow:0 0 0 2px var(--wk-primary,${wkTheme.primary})}
    .wk-grid{display:grid;gap:8px}
    .wk-spec{display:grid;grid-template-columns:auto 1fr;gap:4px 12px;font-size:13px;align-items:baseline}
    .wk-spec dt{font-family:${wkTheme.fontUi};color:${wkTheme.ink2}}
    .wk-spec dd{font-family:${wkTheme.fontMono};margin:0;font-size:12px;color:${wkTheme.ink}}
    .wk-dark .wk-spec dd{color:#ece7d6}
    .wk-dark .wk-spec dt{color:#bfb6a0}

    /* Annotations layer */
    .wk-ann{opacity:var(--wk-ann-opa);transition:opacity .2s}
    .wk-note{position:absolute;font-family:${wkTheme.fontHand};font-size:14px;
             padding:8px 12px;border-radius:3px;color:#3a2c10;
             box-shadow:1px 2px 0 rgba(0,0,0,.18);transform:rotate(-1.3deg);
             max-width:200px;line-height:1.15}
    .wk-note.y{background:${wkTheme.noteY}}
    .wk-note.c{background:${wkTheme.noteC};color:#fff}
    .wk-note.g{background:${wkTheme.noteG};color:#1d3a1d}
    .wk-note .wk-num{font-family:${wkTheme.fontMono};font-size:10px;
             background:${wkTheme.ink};color:${wkTheme.paper};border-radius:3px;
             padding:1px 4px;margin-right:4px;letter-spacing:.05em}
    .wk-callout{position:absolute;font-family:${wkTheme.fontHand};font-size:15px;
                color:${wkTheme.ink};line-height:1.05;max-width:160px}
    .wk-callout svg{position:absolute;overflow:visible;pointer-events:none}

    /* Sketchy mode jiggle */
    .wk-sketchy .wk-box{transform:rotate(-.15deg)}
    .wk-sketchy .wk-input{transform:rotate(.15deg)}
    .wk-sketchy .wk-btn{transform:rotate(-.2deg)}
    .wk-sketchy .wk-img{transform:rotate(.1deg)}

    /* Annotations off */
    .wk-no-ann .wk-ann{display:none}

    /* Color directions: applied on .wk root via class */
    .wk-c-neutral{--wk-primary:${wkTheme.primary}}
    .wk-c-brief{--wk-primary:#1DB954}     /* per brief: dark + green */
    .wk-c-light{--wk-primary:#1f8a4e}     /* light + green */
    .wk-c-amber{--wk-primary:#c87a14}     /* amber alt */
    .wk-c-brief.wk-paper-themed{background:#0B0F19;color:#E6EAF2}
    .wk-c-brief.wk-paper-themed .wk-box{border-color:#E6EAF2}
    .wk-c-brief.wk-paper-themed .wk-rule{background:#E6EAF2}
    .wk-c-brief.wk-paper-themed .wk-fill{background:#121A2A}
    .wk-c-brief.wk-paper-themed .wk-fill2{background:#1a2540}
    .wk-c-brief.wk-paper-themed .wk-input{background:rgba(255,255,255,.04);color:#bfc7d9}
    .wk-c-brief.wk-paper-themed .wk-spec dt{color:#9aa3b8}
    .wk-c-brief.wk-paper-themed .wk-spec dd{color:#E6EAF2}
    .wk-c-brief.wk-paper-themed .wk-img{background:repeating-linear-gradient(135deg,#121A2A 0 8px,#1a2540 8px 16px);color:#9aa3b8}
    .wk-c-brief.wk-paper-themed .wk-img > span{background:#0B0F19}
    .wk-c-amber.wk-paper-themed{background:#1a1410;color:#f0e3d4}
    .wk-c-amber.wk-paper-themed .wk-box{border-color:#f0e3d4}
    .wk-c-amber.wk-paper-themed .wk-rule{background:#f0e3d4}
    .wk-c-amber.wk-paper-themed .wk-fill{background:#241a13}
    .wk-c-amber.wk-paper-themed .wk-fill2{background:#2e2218}
    .wk-c-amber.wk-paper-themed .wk-img{background:repeating-linear-gradient(135deg,#241a13 0 8px,#2e2218 8px 16px);color:#bfa988}
    .wk-c-amber.wk-paper-themed .wk-img > span{background:#1a1410}
  `;
  document.head.appendChild(s);
}

// ─────────────────────────────────────────────────────────────
// Primitives
// ─────────────────────────────────────────────────────────────

const WBox = ({ x, y, w, h, fill, dashed, style, children, className = '', ...rest }) => (
  <div className={`wk-box ${fill ? 'wk-fill' : ''} ${dashed ? 'wk-dashed' : ''} ${className}`}
       style={{ position: 'absolute', left: x, top: y, width: w, height: h, ...style }} {...rest}>
    {children}
  </div>
);

const WFill = ({ x, y, w, h, color = wkTheme.fill, style, children }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, background: color, ...style }}>{children}</div>
);

const WLine = ({ x, y, w, h = 1.5, faint, style }) => (
  <div className={`wk-rule ${faint ? 'wk-faint' : ''}`}
       style={{ position: 'absolute', left: x, top: y, width: w, height: h, ...style }} />
);

const WText = ({ x, y, w, children, style, className = '' }) => (
  <div className={className}
       style={{ position: 'absolute', left: x, top: y, width: w, ...style }}>{children}</div>
);

// Placeholder text lines (skeleton bars)
const WLines = ({ x, y, w, count = 3, gap = 8, h = 8, last = 0.6 }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: w, display: 'flex', flexDirection: 'column', gap }}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} style={{
        height: h, background: wkTheme.faint, borderRadius: 2,
        width: i === count - 1 ? `${last * 100}%` : '100%',
      }} />
    ))}
  </div>
);

const WBtn = ({ x, y, w, h = 38, kind, children, style, onClick, hint }) => (
  <button className={`wk-btn ${kind === 'pri' ? 'wk-pri' : ''} ${kind === 'ghost' ? 'wk-ghost' : ''}`}
          onClick={onClick}
          style={{ position: 'absolute', left: x, top: y, width: w, height: h, ...style }}
          data-hint={hint}>
    {children}
  </button>
);

const WInput = ({ x, y, w, h = 38, label, value, placeholder, focus, style }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: w, ...style }}>
    {label && <div className="wk-lbl" style={{ marginBottom: 4 }}>{label}</div>}
    <div className={`wk-input ${focus ? 'wk-focus' : ''}`} style={{ height: h }}>
      <span style={{ opacity: value ? 1 : .55 }}>{value || placeholder || ''}</span>
    </div>
  </div>
);

const WImg = ({ x, y, w, h, label = 'cover', style }) => (
  <div className="wk-img" style={{ position: 'absolute', left: x, top: y, width: w, height: h, ...style }}>
    <span>{label}</span>
  </div>
);

const WPill = ({ children, fill, style }) => (
  <span className={`wk-pill ${fill ? 'wk-fill' : ''}`} style={style}>{children}</span>
);

const WTag = ({ children, style }) => (
  <span className="wk-pill wk-tag" style={style}>{children}</span>
);

// Annotation: yellow sticky note with optional number
const WNote = ({ x, y, w = 180, n, color = 'y', children, rotate }) => (
  <div className={`wk-note ${color} wk-ann`}
       style={{ left: x, top: y, width: w, transform: rotate != null ? `rotate(${rotate}deg)` : undefined }}>
    {n != null && <span className="wk-num">{n}</span>}{children}
  </div>
);

// Floating handwritten callout with arrow line. Pass arrow={[dx,dy,dx2,dy2]} relative to callout origin.
const WCallout = ({ x, y, w = 140, arrow, children, style }) => (
  <div className="wk-callout wk-ann" style={{ left: x, top: y, width: w, ...style }}>
    <div>{children}</div>
    {arrow && (
      <svg style={{ left: arrow[0], top: arrow[1], width: 1, height: 1 }}>
        <defs>
          <marker id="wk-arr" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,0 L8,4 L0,8 z" fill="currentColor" />
          </marker>
        </defs>
        <path d={`M0,0 Q${arrow[2] / 2 + 6},${arrow[3] / 2 - 8} ${arrow[2]},${arrow[3]}`}
              fill="none" stroke="currentColor" strokeWidth="1.4" markerEnd="url(#wk-arr)" />
      </svg>
    )}
  </div>
);

// Page chrome (top app bar) shared across logged-in screens.
const WTopbar = ({ width, active = 'Catàleg', user = 'jdoe' }) => {
  const items = ['Catàleg', 'Fòrum', 'Contribuir', 'Perfil'];
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width, height: 56,
                  display: 'flex', alignItems: 'center', gap: 24, padding: '0 28px',
                  borderBottom: `1.5px solid ${wkTheme.rule}` }}>
      <div className="wk-row" style={{ gap: 8 }}>
        <div style={{ width: 26, height: 26, border: `1.5px solid ${wkTheme.rule}`,
                      borderRadius: 6, display: 'grid', placeItems: 'center',
                      fontFamily: wkTheme.fontMono, fontSize: 13 }}>P</div>
        <span className="wk-h2" style={{ fontSize: 20 }}>PKGVault</span>
      </div>
      <div className="wk-row" style={{ gap: 16, marginLeft: 16 }}>
        {items.map((it) => (
          <span key={it} className={it === active ? 'wk-link' : ''}
                style={{ fontFamily: wkTheme.fontUi, fontSize: 15, opacity: it === active ? 1 : .7 }}>{it}</span>
        ))}
      </div>
      <div style={{ flex: 1 }} />
      <div className="wk-input" style={{ width: 280, height: 34, padding: '0 12px' }}>
        <span className="wk-mono" style={{ fontSize: 12, opacity: .55 }}>⌕  cerca títol, hash, tag…</span>
      </div>
      <div className="wk-pill wk-fill" style={{ fontSize: 13, cursor: 'pointer' }}
           onClick={() => window.dcGoto && window.dcGoto('account/menu')}>👤 {user} ▾</div>
    </div>
  );
};

// Goto helper — focus another artboard via canvas context
const WGoto = ({ to, children, style, className = '' }) => (
  <span className={`wk-link ${className}`}
        style={{ cursor: 'pointer', ...style }}
        onClick={(e) => { e.stopPropagation(); window.dcGoto && window.dcGoto(to); }}>
    {children}
  </span>
);

// Inside-canvas bridge that registers window.dcGoto using DCCtx.
function WFlowBridge() {
  const ctx = React.useContext(window.DCCtx);
  React.useEffect(() => {
    window.dcGoto = (slot) => ctx && ctx.setFocus(slot);
    return () => { if (window.dcGoto && ctx == null) delete window.dcGoto; };
  }, [ctx]);
  return null;
}

Object.assign(window, {
  WBox, WFill, WLine, WText, WLines, WBtn, WInput, WImg, WPill, WTag,
  WNote, WCallout, WTopbar, WGoto, WFlowBridge,
});
