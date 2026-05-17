// screens-detail.jsx — 3 detail wireframe variants

function DetailA_Hero() {
  const W = 1100, H = 720;
  return (
    <div className="wk wk-paper">
      <WTopbar width={W} active="Catàleg" />

      {/* breadcrumbs */}
      <div style={{ position: 'absolute', left: 28, top: 70, fontFamily: wkTheme.fontUi, fontSize: 13, color: wkTheme.ink2 }}>
        <WGoto to="catalog/grid">Catàleg</WGoto> <span style={{ margin: '0 6px' }}>/</span> BloodGarden
      </div>

      {/* Hero left + sidebar right */}
      <div style={{ position: 'absolute', left: 28, top: 100, right: 28, bottom: 28, display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minHeight: 0 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 18 }}>
            <WImg x={0} y={0} w={180} h={240} label="cover · 600×800" style={{ position: 'static' }} />
            <div>
              <div className="wk-h1" style={{ fontSize: 34 }}>BloodGarden</div>
              <div style={{ fontFamily: wkTheme.fontUi, fontSize: 14, color: wkTheme.ink2, marginBottom: 12 }}>
                survival horror · descobreix el pati on res no creix dues vegades.
              </div>
              <div className="wk-row" style={{ gap: 6, marginBottom: 18, flexWrap: 'wrap' }}>
                <WTag>PS4</WTag>
                <WTag>v1.04</WTag>
                <WTag>EU</WTag>
                <WTag>firmware ≥ 9.00</WTag>
                <WPill style={{ borderColor: wkTheme.primary, color: wkTheme.primary }}>✓ hash verificat</WPill>
              </div>
              <div className="wk-row" style={{ gap: 8 }}>
                <button className="wk-btn wk-pri">↓ Descarregar (4.2 GB)</button>
                <button className="wk-btn">Recalcular hash</button>
                <button className="wk-btn wk-ghost">⋯</button>
              </div>
            </div>
          </div>

          <div className="wk-rule wk-faint" style={{ position: 'static' }} />

          <div>
            <div className="wk-h3" style={{ marginBottom: 6 }}>Descripció</div>
            <WLines x={0} y={0} w={'100%'} count={4} style={{ position: 'static' }} />
            <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[1, 2, 3].map((i) => <div key={i} style={{ height: 8, background: wkTheme.faint, borderRadius: 2, width: ['100%', '94%', '76%'][i - 1] }} />)}
            </div>
          </div>

          <div>
            <div className="wk-h3" style={{ marginBottom: 6 }}>Tags</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {['rpg', 'horror', 'indie', 'beta', 'eu-only', 'vintage'].map((g) => <WPill key={g}>{g}</WPill>)}
              <WPill style={{ borderStyle: 'dashed', color: wkTheme.ink2 }}>＋ afegeix</WPill>
            </div>
          </div>
        </div>

        {/* Right rail */}
        <div className="wk-box wk-fill" style={{ position: 'static', padding: 16, alignSelf: 'start' }}>
          <div className="wk-h3" style={{ marginBottom: 10 }}>Fitxa tècnica</div>
          <dl className="wk-spec">
            <dt>fitxer</dt><dd>BloodGarden_v1.04.pkg</dd>
            <dt>mida</dt><dd>4,294,967,296 B</dd>
            <dt>versió</dt><dd>1.04</dd>
            <dt>plataforma</dt><dd>PS4</dd>
            <dt>regió</dt><dd>EU (CUSA-09812)</dd>
            <dt>fw mínim</dt><dd>≥ 9.00</dd>
            <dt>pujat</dt><dd>2026-04-12 18:42</dd>
            <dt>propietari</dt><dd>jdoe</dd>
          </dl>
          <div className="wk-rule wk-faint" style={{ position: 'static', margin: '14px 0' }} />
          <div className="wk-h3" style={{ marginBottom: 6 }}>Integritat</div>
          <div style={{ fontFamily: wkTheme.fontMono, fontSize: 11, lineHeight: 1.5, color: wkTheme.ink, wordBreak: 'break-all', padding: 8, background: wkTheme.paper, border: `1.4px solid ${wkTheme.rule}`, borderRadius: 4 }}>
            sha256: a3f91c4d9b7e02fa…<br/>3c1d8e7a5f0b21c
          </div>
          <div style={{ marginTop: 8, fontSize: 12, fontFamily: wkTheme.fontUi, color: wkTheme.primary }}>
            ✓ verificat fa 2 hores
          </div>
        </div>
      </div>

      <WNote x={W - 250} y={70} n="1" w={210}>
        Hash + recalc = USP del producte. Ha de ser molt visible.
      </WNote>
      <WNote x={28} y={H - 110} n="2" color="g" w={220}>
        Botó descàrrega gran i primari · només propietari (server check).
      </WNote>
    </div>
  );
}

function DetailB_Tabs() {
  const W = 1100, H = 720;
  const [tab, setTab] = React.useState('Info');
  const tabs = ['Info', 'Hash & integritat', 'Història', 'Tags'];
  return (
    <div className="wk wk-paper">
      <WTopbar width={W} active="Catàleg" />

      <div style={{ position: 'absolute', left: 28, top: 70, fontFamily: wkTheme.fontUi, fontSize: 13, color: wkTheme.ink2 }}>
        <WGoto to="catalog/table">Catàleg</WGoto> <span style={{ margin: '0 6px' }}>/</span> Aetherframe
      </div>

      {/* Compact header */}
      <div style={{ position: 'absolute', left: 28, top: 96, right: 28, display: 'flex', gap: 16, alignItems: 'center' }}>
        <WImg x={0} y={0} w={64} h={64} label="cov" style={{ position: 'static', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div className="wk-h1" style={{ fontSize: 26, lineHeight: 1 }}>Aetherframe</div>
          <div className="wk-row" style={{ gap: 6, marginTop: 6 }}>
            <WTag>PS4</WTag><WTag>v1.00</WTag><WTag>US</WTag>
            <span className="wk-mono" style={{ fontSize: 11, color: wkTheme.ink2 }}>· 6.8 GB · pujat 03/2026</span>
          </div>
        </div>
        <button className="wk-btn">Recalcular</button>
        <button className="wk-btn wk-pri">↓ Descarregar</button>
      </div>

      {/* Tabs */}
      <div style={{ position: 'absolute', left: 28, top: 180, right: 28, borderBottom: `1.5px solid ${wkTheme.rule}`, display: 'flex', gap: 4 }}>
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)}
                  style={{ position: 'static', padding: '10px 16px',
                           border: 0, background: 'transparent', cursor: 'pointer',
                           fontFamily: wkTheme.fontUi, fontSize: 14,
                           borderBottom: tab === t ? `3px solid ${wkTheme.primary}` : '3px solid transparent',
                           color: tab === t ? wkTheme.ink : wkTheme.ink2,
                           marginBottom: -2 }}>{t}</button>
        ))}
      </div>

      {/* Tab body */}
      <div style={{ position: 'absolute', left: 28, top: 232, right: 28, bottom: 28, overflow: 'hidden' }}>
        {tab === 'Info' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div>
              <div className="wk-h3" style={{ marginBottom: 8 }}>Descripció</div>
              <WLines x={0} y={0} w={'100%'} count={5} style={{ position: 'static' }} />
            </div>
            <div className="wk-box wk-fill" style={{ position: 'static', padding: 14 }}>
              <div className="wk-h3" style={{ marginBottom: 8 }}>Compatibilitat</div>
              <dl className="wk-spec">
                <dt>plataforma</dt><dd>PS4</dd>
                <dt>fw mínim</dt><dd>≥ 9.00</dd>
                <dt>regió</dt><dd>US (CUSA-22041)</dd>
                <dt>requisits</dt><dd>40 GB lliures</dd>
              </dl>
            </div>
          </div>
        )}
        {tab === 'Hash & integritat' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="wk-box" style={{ position: 'static', padding: 16 }}>
              <div className="wk-row" style={{ justifyContent: 'space-between', marginBottom: 6 }}>
                <div className="wk-h3">SHA-256</div>
                <button className="wk-btn" style={{ position: 'static', padding: '4px 10px', height: 28, fontSize: 12 }}>Recalcular →</button>
              </div>
              <div style={{ fontFamily: wkTheme.fontMono, fontSize: 13, padding: 12, background: wkTheme.fill,
                            border: `1.4px solid ${wkTheme.rule}`, borderRadius: 4, wordBreak: 'break-all' }}>
                a3f91c4d9b7e02fae9d4517c83af23c1d8e7a5f0b21c4d9b7e02fae9d4517c83
              </div>
              <div style={{ fontSize: 13, color: wkTheme.primary, marginTop: 8, fontFamily: wkTheme.fontUi }}>✓ coincideix amb el càlcul del 2026-05-08 (fa 2h)</div>
            </div>
            <div className="wk-box" style={{ position: 'static', padding: 16 }}>
              <div className="wk-h3" style={{ marginBottom: 8 }}>Verificacions anteriors</div>
              {[
                ['2026-05-08 16:21', '✓ OK', 'auto'],
                ['2026-04-30 10:04', '✓ OK', 'manual'],
                ['2026-04-12 18:42', '✓ OK (inicial)', 'upload'],
              ].map(([d, r, k], i) => (
                <div key={i} className="wk-row" style={{ justifyContent: 'space-between', padding: '6px 0',
                              borderBottom: i < 2 ? `1px solid ${wkTheme.faint}` : 0,
                              fontFamily: wkTheme.fontMono, fontSize: 12 }}>
                  <span>{d}</span><span style={{ color: wkTheme.primary }}>{r}</span><span style={{ color: wkTheme.ink2 }}>{k}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {tab === 'Història' && (
          <div className="wk-box" style={{ position: 'static', padding: 16 }}>
            <div className="wk-h3" style={{ marginBottom: 12 }}>Versions pujades</div>
            {['v1.00 · pujada inicial', 'v0.90 · beta tester', 'v0.80 · prototip intern'].map((s, i) => (
              <div key={i} className="wk-row" style={{ gap: 12, padding: '10px 0',
                            borderBottom: i < 2 ? `1px solid ${wkTheme.faint}` : 0 }}>
                <div style={{ width: 12, height: 12, borderRadius: 6, border: `1.5px solid ${wkTheme.rule}`,
                              background: i === 0 ? wkTheme.primary : 'transparent' }} />
                <div style={{ flex: 1, fontFamily: wkTheme.fontUi, fontSize: 13 }}>{s}</div>
                <span className="wk-mono" style={{ fontSize: 11, color: wkTheme.ink2 }}>2026-0{4 - i}-12</span>
              </div>
            ))}
          </div>
        )}
        {tab === 'Tags' && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {['action', 'sci-fi', 'beta', 'us-only', 'rare'].map((g) => <WPill key={g} fill>{g} ✕</WPill>)}
            <div className="wk-input" style={{ width: 200, height: 32, padding: '0 10px' }}>
              <span className="wk-mono" style={{ fontSize: 12, opacity: .55 }}>＋ afegeix tag…</span>
            </div>
          </div>
        )}
      </div>

      <WNote x={W - 250} y={70} n="1" w={210}>
        Tabs estalvien scroll · però amaguen info. Bo si el detall és llarg.
      </WNote>
      <WNote x={28} y={H - 100} n="2" color="g" w={210}>
        Click sobre les pestanyes per provar. Tab "Hash" és la més important.
      </WNote>
    </div>
  );
}

function DetailC_Dashboard() {
  const W = 1100, H = 720;
  return (
    <div className="wk wk-paper">
      <WTopbar width={W} active="Catàleg" />

      <div style={{ position: 'absolute', left: 28, top: 70, fontFamily: wkTheme.fontUi, fontSize: 13, color: wkTheme.ink2 }}>
        <WGoto to="catalog/sidebar">Catàleg</WGoto> <span style={{ margin: '0 6px' }}>/</span> NeonRift
      </div>

      <div style={{ position: 'absolute', left: 28, top: 96, right: 28, bottom: 28, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="wk-row" style={{ justifyContent: 'space-between' }}>
          <div className="wk-h1" style={{ fontSize: 30 }}>NeonRift</div>
          <div className="wk-row" style={{ gap: 6 }}>
            <button className="wk-btn">Edita</button>
            <button className="wk-btn wk-ghost">Esborra</button>
            <button className="wk-btn wk-pri">↓ Descarregar (12.1 GB)</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gridAutoRows: 'minmax(120px, auto)', gap: 12, flex: 1 }}>
          {/* Cover */}
          <div className="wk-box" style={{ position: 'static', gridColumn: 'span 4', gridRow: 'span 2', padding: 0 }}>
            <WImg x={0} y={0} w={'100%'} h={'100%'} label="cover · 3:4" style={{ position: 'static', borderRadius: 6, border: 0 }} />
          </div>

          {/* Specs */}
          <div className="wk-box wk-fill" style={{ position: 'static', gridColumn: 'span 5', padding: 14 }}>
            <div className="wk-h3" style={{ marginBottom: 8 }}>Fitxa</div>
            <dl className="wk-spec" style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '6px 14px' }}>
              <dt>plat.</dt><dd>PS5</dd>
              <dt>versió</dt><dd>2.10</dd>
              <dt>regió</dt><dd>JP</dd>
              <dt>fw min</dt><dd>≥ 4.50</dd>
            </dl>
            <div className="wk-rule wk-faint" style={{ position: 'static', margin: '10px 0' }} />
            <div className="wk-h3" style={{ fontSize: 14, marginBottom: 4 }}>Tags</div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {['cyberpunk', 'jp-only', 'rare', 'rpg'].map((g) => <WPill key={g}>{g}</WPill>)}
            </div>
          </div>

          {/* Hash */}
          <div className="wk-box" style={{ position: 'static', gridColumn: 'span 3', padding: 14, background: '#0e1c12', color: '#bcebd1', borderColor: wkTheme.primary }}>
            <div style={{ fontFamily: wkTheme.fontUi, fontSize: 12, color: '#a8d3b8', letterSpacing: '.04em', textTransform: 'uppercase' }}>Integritat</div>
            <div style={{ fontFamily: wkTheme.fontHand, fontSize: 26, color: '#bcebd1', marginTop: 4 }}>✓ HASH OK</div>
            <div style={{ fontFamily: wkTheme.fontMono, fontSize: 11, marginTop: 8, opacity: .8, wordBreak: 'break-all' }}>
              sha256: a3f9 1c4d 9b7e 02fa…b21c
            </div>
            <button className="wk-btn" style={{ position: 'static', marginTop: 10, height: 28, padding: '0 10px', fontSize: 12, color: '#bcebd1', borderColor: '#bcebd1' }}>Recalcular →</button>
          </div>

          {/* Description */}
          <div className="wk-box" style={{ position: 'static', gridColumn: 'span 8', padding: 14 }}>
            <div className="wk-h3" style={{ marginBottom: 8 }}>Descripció</div>
            <WLines x={0} y={0} w={'100%'} count={4} style={{ position: 'static' }} />
          </div>

          {/* File card */}
          <div className="wk-box wk-fill" style={{ position: 'static', gridColumn: 'span 4', padding: 14 }}>
            <div className="wk-h3" style={{ marginBottom: 6 }}>Fitxer</div>
            <div style={{ fontFamily: wkTheme.fontMono, fontSize: 12, marginBottom: 4 }}>NeonRift_v2.10.pkg</div>
            <div className="wk-row" style={{ justifyContent: 'space-between', fontFamily: wkTheme.fontMono, fontSize: 11, color: wkTheme.ink2 }}>
              <span>12.1 GB</span><span>pujat 04/2026</span>
            </div>
            <div className="wk-rule wk-faint" style={{ position: 'static', margin: '10px 0' }} />
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="wk-btn" style={{ position: 'static', height: 28, padding: '0 10px', fontSize: 12 }}>Substituir</button>
              <button className="wk-btn wk-ghost" style={{ position: 'static', height: 28, padding: '0 10px', fontSize: 12 }}>Mover</button>
            </div>
          </div>
        </div>
      </div>

      <WNote x={W - 250} y={70} n="1" w={210}>
        Layout dashboard · 12-col grid. Cards iguals, escanejable.
      </WNote>
      <WNote x={28} y={H - 100} n="2" color="c" w={220}>
        Card "Integritat" usa color brand · única excepció a la paleta neutra.
      </WNote>
    </div>
  );
}

window.DetailA_Hero = DetailA_Hero;
window.DetailB_Tabs = DetailB_Tabs;
window.DetailC_Dashboard = DetailC_Dashboard;
