// screens-catalog.jsx — 4 catalog wireframe variants

const catData = [
  ['BloodGarden',  'PS4', 'v1.04', 'EU', '4.2 GB',  'OK'],
  ['Aetherframe',  'PS4', 'v1.00', 'US', '6.8 GB',  'OK'],
  ['NeonRift',     'PS5', 'v2.10', 'JP', '12.1 GB', 'OK'],
  ['CipherWalker', 'PS3', 'v1.02', 'EU', '1.7 GB',  '!'],
  ['Halcyon Drift','PS4', 'v1.01', 'US', '8.3 GB',  'OK'],
  ['Voidlung',     'PS5', 'v1.00', 'EU', '14.0 GB', 'OK'],
  ['Saltwheel',    'PS3', 'v1.10', 'JP', '0.9 GB',  'OK'],
  ['Quietfield',   'PS4', 'v2.00', 'US', '5.1 GB',  '!'],
  ['Ironpetal',    'PS5', 'v1.05', 'EU', '9.4 GB',  'OK'],
  ['Mothlight',    'PS4', 'v1.00', 'JP', '3.8 GB',  'OK'],
  ['Rustcoast',    'PS3', 'v1.00', 'EU', '1.2 GB',  'OK'],
  ['Embergrove',   'PS5', 'v3.00', 'US', '18.6 GB', 'OK'],
];

function CatalogA_Grid() {
  const W = 1100, H = 720;
  return (
    <div className="wk wk-paper">
      <WTopbar width={W} active="Catàleg" />

      {/* Heading row */}
      <div style={{ position: 'absolute', left: 28, top: 76, right: 28, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div className="wk-h1">Catàleg públic · 1.248 PKGs</div>
          <div style={{ fontFamily: wkTheme.fontUi, fontSize: 13, color: wkTheme.ink2 }}>biblioteca de la comunitat · cada paquet revisat manualment abans de publicar-se.</div>
        </div>
        <div className="wk-row" style={{ gap: 8 }}>
          <button className="wk-btn">Filtres ▾</button>
          <button className="wk-btn">Ordena ▾</button>
          <button className="wk-btn wk-pri" onClick={() => window.dcGoto && window.dcGoto('upload/long')}>＋ Pujar PKG</button>
        </div>
      </div>

      {/* Active filters chips */}
      <div style={{ position: 'absolute', left: 28, top: 152, display: 'flex', gap: 6, alignItems: 'center', fontSize: 13 }}>
        <span style={{ color: wkTheme.ink2, fontFamily: wkTheme.fontUi }}>filtres actius:</span>
        <WPill fill>plataforma · PS4 ✕</WPill>
        <WPill fill>regió · EU ✕</WPill>
        <span className="wk-link" style={{ color: wkTheme.ink2, fontSize: 12 }}>esborra-ho tot</span>
      </div>

      {/* Grid */}
      <div style={{ position: 'absolute', left: 28, top: 192, right: 28, bottom: 28,
                    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {catData.slice(0, 8).map(([t, p, v, r, s, h], i) => (
          <div key={i}
               className="wk-box"
               onClick={() => window.dcGoto && window.dcGoto('detail/hero')}
               style={{ position: 'static', padding: 0, overflow: 'hidden', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}>
            <WImg x={0} y={0} w={'100%'} h={140} label={t.toLowerCase()}
                  style={{ position: 'static', borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0 }} />
            <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div className="wk-row" style={{ justifyContent: 'space-between' }}>
                <div className="wk-h3" style={{ fontSize: 14 }}>{t}</div>
                <span style={{ fontFamily: wkTheme.fontMono, fontSize: 11,
                               color: h === 'OK' ? wkTheme.primary : wkTheme.noteC }}>
                  {h === 'OK' ? '✓' : '!'}
                </span>
              </div>
              <div className="wk-row" style={{ gap: 4, flexWrap: 'wrap' }}>
                <WTag>{p}</WTag>
                <WTag>{r}</WTag>
                <span className="wk-mono" style={{ fontSize: 11, color: wkTheme.ink2, marginLeft: 'auto' }}>{v}</span>
              </div>
              <span className="wk-mono" style={{ fontSize: 11 }}>{s}</span>
            </div>
          </div>
        ))}
      </div>

      <WNote x={W - 248} y={80} n="1" w={210}>
        Cards = forma més visual. Tap a la card → detall.
      </WNote>
      <WNote x={28} y={H - 110} n="2" color="c" w={220}>
        El badge "!" indica hash NO verificat (recalc pendent o falla).
      </WNote>
    </div>
  );
}

function CatalogB_Table() {
  const W = 1100, H = 720;
  return (
    <div className="wk wk-paper">
      <WTopbar width={W} active="Catàleg" />

      <div style={{ position: 'absolute', left: 28, top: 76, right: 28, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div className="wk-h1">Catàleg</div>
        <div className="wk-row" style={{ gap: 8 }}>
          <div className="wk-input" style={{ width: 220, height: 34 }}>
            <span className="wk-mono" style={{ fontSize: 12, opacity: .55 }}>⌕  cerca…</span>
          </div>
          <button className="wk-btn">Plataforma ▾</button>
          <button className="wk-btn">Regió ▾</button>
          <button className="wk-btn wk-pri" onClick={() => window.dcGoto && window.dcGoto('upload/wizard')}>＋ Pujar</button>
        </div>
      </div>

      {/* Table */}
      <div style={{ position: 'absolute', left: 28, top: 140, right: 28, bottom: 28,
                    border: `1.5px solid ${wkTheme.rule}`, borderRadius: 8, overflow: 'hidden', background: wkTheme.paper }}>
        {/* header */}
        <div style={{ display: 'grid', gridTemplateColumns: '32px 2fr 70px 70px 70px 90px 1fr 80px',
                      padding: '10px 14px', borderBottom: `1.5px solid ${wkTheme.rule}`,
                      background: wkTheme.fill, fontFamily: wkTheme.fontUi, fontSize: 12,
                      color: wkTheme.ink2, letterSpacing: '.04em', textTransform: 'uppercase', alignItems: 'center' }}>
          <span><input type="checkbox" /></span>
          <span>Títol  ↑</span>
          <span>Plat.</span>
          <span>Versió</span>
          <span>Regió</span>
          <span>Mida</span>
          <span>SHA-256</span>
          <span>Accions</span>
        </div>
        {catData.map(([t, p, v, r, s, h], i) => (
          <div key={i}
               onClick={() => window.dcGoto && window.dcGoto('detail/tabs')}
               style={{ display: 'grid', gridTemplateColumns: '32px 2fr 70px 70px 70px 90px 1fr 80px',
                        padding: '8px 14px', alignItems: 'center', cursor: 'pointer',
                        borderBottom: `1px solid ${wkTheme.faint}`,
                        background: i % 2 ? 'transparent' : 'rgba(232,223,196,.4)',
                        fontFamily: wkTheme.fontUi, fontSize: 13 }}>
            <span><input type="checkbox" /></span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 22, height: 22, border: `1.2px solid ${wkTheme.rule}`, borderRadius: 3 }} />
              {t}
            </span>
            <span><WTag>{p}</WTag></span>
            <span className="wk-mono" style={{ fontSize: 12 }}>{v}</span>
            <span><WTag>{r}</WTag></span>
            <span className="wk-mono" style={{ fontSize: 12 }}>{s}</span>
            <span className="wk-mono" style={{ fontSize: 11,
                  color: h === 'OK' ? wkTheme.primary : wkTheme.noteC }}>
              {h === 'OK' ? '✓ a3f9…b21c' : '! recalculate'}
            </span>
            <span style={{ display: 'flex', gap: 4 }}>
              <span className="wk-pill" style={{ fontSize: 11 }}>↓</span>
              <span className="wk-pill" style={{ fontSize: 11 }}>⋯</span>
            </span>
          </div>
        ))}
      </div>

      <WNote x={W - 250} y={80} n="1" w={220}>
        Vista densa = power users. Sortable cols + bulk actions amb checkbox.
      </WNote>
      <WNote x={28} y={H - 110} n="2" color="g" w={210}>
        Hash truncat (8 chars) + tooltip per copiar el sencer.
      </WNote>
    </div>
  );
}

function CatalogC_Sidebar() {
  const W = 1100, H = 720;
  return (
    <div className="wk wk-paper">
      <WTopbar width={W} active="Catàleg" />

      <div style={{ position: 'absolute', left: 0, top: 56, width: 240, bottom: 0,
                    borderRight: `1.5px solid ${wkTheme.rule}`, padding: 20,
                    display: 'flex', flexDirection: 'column', gap: 18, background: wkTheme.fill }}>
        <div>
          <div className="wk-lbl" style={{ marginBottom: 6 }}>Plataforma</div>
          {['PS3', 'PS4', 'PS5', 'Vita'].map((p, i) => (
            <label key={p} style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: wkTheme.fontUi, fontSize: 13, padding: '3px 0' }}>
              <span style={{ width: 14, height: 14, border: `1.4px solid ${wkTheme.rule}`, borderRadius: 3,
                              background: i === 1 ? wkTheme.ink : 'transparent' }} />
              {p} <span className="wk-mono" style={{ marginLeft: 'auto', fontSize: 11, color: wkTheme.ink2 }}>{[2,5,4,1][i]}</span>
            </label>
          ))}
        </div>
        <div>
          <div className="wk-lbl" style={{ marginBottom: 6 }}>Regió</div>
          {['EU', 'US', 'JP'].map((r, i) => (
            <label key={r} style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: wkTheme.fontUi, fontSize: 13, padding: '3px 0' }}>
              <span style={{ width: 14, height: 14, border: `1.4px solid ${wkTheme.rule}`, borderRadius: 3,
                              background: i === 0 ? wkTheme.ink : 'transparent' }} />
              {r}
            </label>
          ))}
        </div>
        <div>
          <div className="wk-lbl" style={{ marginBottom: 6 }}>Mida</div>
          <div className="wk-input" style={{ height: 34, padding: '0 10px' }}>
            <span className="wk-mono" style={{ fontSize: 12 }}>0 — 20 GB</span>
          </div>
          <div style={{ height: 28, position: 'relative', marginTop: 8 }}>
            <div style={{ position: 'absolute', left: 0, right: 0, top: 13, height: 2, background: wkTheme.rule }} />
            <div style={{ position: 'absolute', left: '20%', right: '30%', top: 13, height: 2, background: wkTheme.primary }} />
            <div style={{ position: 'absolute', left: '20%', top: 8, width: 12, height: 12, borderRadius: 6, background: wkTheme.paper, border: `1.5px solid ${wkTheme.rule}` }} />
            <div style={{ position: 'absolute', left: '70%', top: 8, width: 12, height: 12, borderRadius: 6, background: wkTheme.paper, border: `1.5px solid ${wkTheme.rule}` }} />
          </div>
        </div>
        <div>
          <div className="wk-lbl" style={{ marginBottom: 6 }}>Tags</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {['rpg', 'indie', 'beta', 'retro', 'jp-only'].map((g, i) => (
              <span key={g} className="wk-pill" style={{ fontSize: 12, background: i === 1 ? wkTheme.fill2 : 'transparent' }}>{g}</span>
            ))}
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <button className="wk-btn wk-ghost">Esborra filtres</button>
      </div>

      <div style={{ position: 'absolute', left: 240, top: 56, right: 0, bottom: 0, padding: 20, overflow: 'hidden' }}>
        <div className="wk-row" style={{ justifyContent: 'space-between', marginBottom: 14 }}>
          <div className="wk-h2" style={{ fontSize: 18 }}>5 resultats · PS4 + EU</div>
          <div className="wk-row" style={{ gap: 8 }}>
            <button className="wk-btn">Vista ▦</button>
            <button className="wk-btn wk-pri" onClick={() => window.dcGoto && window.dcGoto('upload/drop')}>＋ Pujar</button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {catData.filter((d) => d[1] === 'PS4' && d[3] === 'EU').concat(catData.slice(0, 2)).slice(0, 5).map(([t, p, v, r, s, h], i) => (
            <div key={i} className="wk-box"
                 onClick={() => window.dcGoto && window.dcGoto('detail/dashboard')}
                 style={{ position: 'static', padding: 12, display: 'flex', gap: 14, cursor: 'pointer', alignItems: 'center' }}>
              <WImg x={0} y={0} w={88} h={64} label="cover" style={{ position: 'static' }} />
              <div style={{ flex: 1 }}>
                <div className="wk-row" style={{ gap: 8, marginBottom: 4 }}>
                  <span className="wk-h3">{t}</span>
                  <WTag>{p}</WTag>
                  <WTag>{r}</WTag>
                  <span className="wk-mono" style={{ fontSize: 12, color: wkTheme.ink2 }}>{v} · firmware ≥ 9.00</span>
                </div>
                <div className="wk-mono" style={{ fontSize: 11, color: wkTheme.ink2 }}>
                  sha256: a3f91c…b21c · {s}
                </div>
              </div>
              <span className="wk-pill wk-fill" style={{ fontSize: 12 }}>↓ baixar</span>
              <span className="wk-pill" style={{ fontSize: 12 }}>⋯</span>
            </div>
          ))}
        </div>
      </div>

      <WNote x={W - 240} y={80} n="1" w={210}>
        Sidebar persistent · filtres "live" sense recargar (fetch JSON).
      </WNote>
      <WNote x={260} y={H - 110} n="2" color="g" w={220}>
        Densitat alta — bona per col·leccions de 20+ PKGs.
      </WNote>
    </div>
  );
}

function CatalogD_Hybrid() {
  const W = 1100, H = 720;
  return (
    <div className="wk wk-paper">
      <WTopbar width={W} active="Catàleg" />

      <div style={{ position: 'absolute', left: 28, top: 76, right: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div className="wk-h1">Catàleg PKGVault</div>
        <div className="wk-row" style={{ gap: 8 }}>
          <button className="wk-btn">Tots els filtres ▾</button>
          <button className="wk-btn wk-pri" onClick={() => window.dcGoto && window.dcGoto('upload/split')}>＋ Pujar</button>
        </div>
      </div>

      {/* Featured row */}
      <div style={{ position: 'absolute', left: 28, top: 130, right: 28 }}>
        <div className="wk-row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
          <div className="wk-h2" style={{ fontSize: 18 }}>↳ Pujats recentment</div>
          <span className="wk-link" style={{ fontSize: 13, color: wkTheme.ink2 }}>veure tots →</span>
        </div>
        <div style={{ display: 'flex', gap: 12, overflow: 'hidden' }}>
          {catData.slice(0, 5).map(([t, p, v, r, s], i) => (
            <div key={i} className="wk-box wk-fill"
                 onClick={() => window.dcGoto && window.dcGoto('detail/hero')}
                 style={{ position: 'static', flex: '0 0 200px', padding: 0, cursor: 'pointer' }}>
              <WImg x={0} y={0} w={'100%'} h={100} label={t.toLowerCase()}
                    style={{ position: 'static', borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0 }} />
              <div style={{ padding: 8 }}>
                <div className="wk-h3" style={{ fontSize: 13 }}>{t}</div>
                <div className="wk-mono" style={{ fontSize: 11, color: wkTheme.ink2 }}>{p} · {v}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats strip */}
      <div style={{ position: 'absolute', left: 28, top: 332, right: 28, display: 'flex', gap: 12 }}>
        {[['14', 'PKGs'], ['3', 'plataformes'], ['68 GB', 'espai'], ['12 ✓', 'hash OK'], ['2 !', 'pendents']].map(([n, l], i) => (
          <div key={i} className="wk-box" style={{ position: 'static', flex: 1, padding: '10px 14px' }}>
            <div className="wk-h2" style={{ fontSize: 22, lineHeight: 1 }}>{n}</div>
            <div style={{ fontFamily: wkTheme.fontUi, fontSize: 11, color: wkTheme.ink2, letterSpacing: '.04em', textTransform: 'uppercase' }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Lower grid */}
      <div style={{ position: 'absolute', left: 28, top: 412, right: 28, bottom: 28,
                    border: `1.5px solid ${wkTheme.rule}`, borderRadius: 8, padding: 14, background: wkTheme.fill }}>
        <div className="wk-row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
          <div className="wk-h3">Tot el catàleg</div>
          <div className="wk-row" style={{ gap: 6, fontSize: 12, color: wkTheme.ink2 }}>
            <span>ordena:</span>
            <button className="wk-btn" style={{ position: 'static', padding: '2px 10px', height: 24, fontSize: 12 }}>recents ▾</button>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10 }}>
          {catData.slice(0, 12).map(([t], i) => (
            <div key={i}
                 onClick={() => window.dcGoto && window.dcGoto('detail/tabs')}
                 style={{ aspectRatio: '3/2', border: `1.4px solid ${wkTheme.rule}`,
                          borderRadius: 4, background: wkTheme.paper,
                          fontFamily: wkTheme.fontMono, fontSize: 10, color: wkTheme.ink2,
                          display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
              {t.split(' ')[0].slice(0, 8)}
            </div>
          ))}
        </div>
      </div>

      <WNote x={W - 250} y={88} n="1" w={210}>
        Hybrid: featured (afegits recents) + stats globals + grid del catàleg.
      </WNote>
      <WNote x={28} y={344} n="2" color="g" w={220}>
        Stats strip = motivació visual (colecció creixent). Cap és un link funcional, només info.
      </WNote>
    </div>
  );
}

window.CatalogA_Grid = CatalogA_Grid;
window.CatalogB_Table = CatalogB_Table;
window.CatalogC_Sidebar = CatalogC_Sidebar;
window.CatalogD_Hybrid = CatalogD_Hybrid;
