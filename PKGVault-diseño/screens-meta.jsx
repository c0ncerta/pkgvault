// screens-meta.jsx — sitemap + profile wireframes (public download + community)

function ScreenSitemap() {
  const W = 1100, H = 720;
  const node = (x, y, w, h, label, sub, kind) => (
    <div key={label} style={{ position: 'absolute', left: x, top: y, width: w, height: h,
         border: `1.5px solid ${wkTheme.rule}`, borderRadius: 8,
         background: kind === 'admin' ? wkTheme.fill2 : kind === 'public' ? wkTheme.fill : wkTheme.paper,
         display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
         fontFamily: wkTheme.fontHand, padding: 8, textAlign: 'center', fontSize: 16 }}>
      <div>{label}</div>
      {sub && <div style={{ fontFamily: wkTheme.fontUi, fontSize: 11, color: wkTheme.ink2, marginTop: 2 }}>{sub}</div>}
    </div>
  );
  const line = (x1, y1, x2, y2, key, dashed) => (
    <line key={key} x1={x1} y1={y1} x2={x2} y2={y2}
          stroke={wkTheme.rule} strokeWidth="1.4" strokeDasharray={dashed ? '5 4' : '0'} />
  );
  return (
    <div className="wk wk-paper">
      <div className="wk-h1" style={{ position: 'absolute', left: 36, top: 28 }}>Mapa web · Sitemap</div>
      <div style={{ position: 'absolute', left: 36, top: 64, right: 36, fontFamily: wkTheme.fontUi, fontSize: 13, color: wkTheme.ink2 }}>
        Web pública de descàrrega de PKGs amb contribucions de la comunitat (revisades) + fòrum d'scene/jailbreak.
      </div>

      <svg style={{ position: 'absolute', inset: 0, width: W, height: H, pointerEvents: 'none' }}>
        {/* Home → main sections */}
        {line(W / 2, 142, 220, 198, 'a')}
        {line(W / 2, 142, W / 2, 198, 'b')}
        {line(W / 2, 142, W - 220, 198, 'c')}
        {line(W / 2, 142, 950, 198, 'c2')}

        {/* Catalog → Detail → Download */}
        {line(220, 246, 220, 298, 'd')}
        {line(220, 348, 220, 400, 'e')}

        {/* Forum → Thread → New post */}
        {line(W / 2, 246, W / 2, 298, 'f')}
        {line(W / 2 - 60, 348, W / 2 - 60, 400, 'g')}
        {line(W / 2 + 60, 348, W / 2 + 60, 400, 'g2', true)}

        {/* Auth → Profile / Contribute / Admin */}
        {line(W - 220, 246, W - 360, 298, 'h', true)}
        {line(W - 220, 246, W - 220, 298, 'i', true)}
        {line(W - 220, 246, W - 80, 298, 'j', true)}

        {/* Contribute → Moderation → Catalog (loop back) */}
        {line(W - 220, 348, W - 220, 400, 'k')}
        {line(W - 220, 450, 280, 246, 'kk', true)}
      </svg>

      {/* Home */}
      {node(W / 2 - 90, 96, 180, 44, 'Home', '/ landing', 'public')}

      {/* Tier 1: 3 main sections + auth */}
      {node(140, 198, 160, 50, 'Catàleg', '/catalog (públic)', 'public')}
      {node(W / 2 - 80, 198, 160, 50, 'Fòrum', '/forum (públic)', 'public')}
      {node(870, 198, 160, 50, 'Login / Registre', '/auth', 'public')}

      {/* Tier 2 */}
      {node(140, 298, 160, 50, 'Detall PKG', '/pkg/:id', 'public')}
      {node(W / 2 - 130, 298, 130, 50, 'Llistat fils', '/forum/:cat')}
      {node(W / 2 + 5, 298, 130, 50, 'Fil', '/forum/t/:id')}
      {node(W - 300, 298, 160, 50, 'Perfil', '/me (sessió)')}
      {node(W - 110, 298, 90, 50, 'Admin', '/admin', 'admin')}

      {/* Tier 3 */}
      {node(140, 400, 160, 44, 'Descàrrega', '.pkg + checksums', 'public')}
      {node(W / 2 - 130, 400, 130, 44, 'Llegir', '(públic)')}
      {node(W / 2 + 5, 400, 130, 44, 'Nou fil', '(sessió)')}
      {node(W - 300, 400, 160, 50, 'Contribuir PKG', '/contribute (sessió)')}

      {/* Tier 4 (review pipeline) */}
      {node(W - 300, 470, 160, 44, 'Cua de moderació', '/admin/queue', 'admin')}

      {/* Legend */}
      <div style={{ position: 'absolute', left: 36, top: 538, width: 280, padding: 12,
                    border: `1.5px dashed ${wkTheme.rule}`, borderRadius: 8, background: wkTheme.paper }}>
        <div className="wk-h3" style={{ marginBottom: 6 }}>Llegenda</div>
        <div style={{ fontFamily: wkTheme.fontUi, fontSize: 13, lineHeight: 1.55 }}>
          <div>· <b>Públic</b> (lectura): Catàleg, Detall, Fòrum llegir</div>
          <div>· <b>Sessió</b>: Contribuir, Nou fil, Perfil</div>
          <div>· <b>Admin</b>: Cua de moderació, panells</div>
          <div>· <span className="wk-mono" style={{ fontSize: 11 }}>- - -</span> requereix login</div>
        </div>
      </div>

      <div style={{ position: 'absolute', left: 340, top: 538, right: 36, padding: 12,
                    border: `1.5px solid ${wkTheme.rule}`, borderRadius: 8, background: wkTheme.fill }}>
        <div className="wk-h3" style={{ marginBottom: 6 }}>Pipeline de contribució</div>
        <div className="wk-row" style={{ gap: 6, fontFamily: wkTheme.fontUi, fontSize: 13, flexWrap: 'wrap' }}>
          {['user puja .pkg', '→ pending', '→ admin revisa hash + metadades', '→ aprova / rebutja', '→ publicat al catàleg públic'].map((s, i) => (
            <span key={i} className="wk-pill" style={{ fontSize: 12, background: i === 4 ? wkTheme.primary : 'transparent', color: i === 4 ? '#fff' : 'inherit', borderColor: i === 4 ? wkTheme.primary : wkTheme.rule }}>{s}</span>
          ))}
        </div>
      </div>

      <WNote x={W - 250} y={70} n="1" color="y" w={220}>
        Catàleg = públic per llegir/baixar. Contribuir requereix compte i passa per moderació.
      </WNote>
      <WNote x={420} y={170} n="2" color="g" w={210}>
        El fòrum és la 2a "pota": scene news, guies de jailbreak, progress reports.
      </WNote>
    </div>
  );
}

function ScreenProfile() {
  const W = 1100, H = 720;
  return (
    <div className="wk wk-paper">
      <WTopbar width={W} active="Perfil" />

      <div style={{ position: 'absolute', left: 28, top: 80, right: 28, bottom: 28,
                    display: 'grid', gridTemplateColumns: '300px 1fr', gap: 24 }}>
        <div className="wk-box wk-fill" style={{ padding: 20, position: 'relative' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', border: `1.5px solid ${wkTheme.rule}`,
                        background: wkTheme.paper, display: 'grid', placeItems: 'center',
                        fontFamily: wkTheme.fontHand, fontSize: 32, marginBottom: 12 }}>JD</div>
          <div className="wk-h2">jdoe</div>
          <div className="wk-mono" style={{ fontSize: 12, color: wkTheme.ink2, marginBottom: 16 }}>
            membre des de · 03/2026
          </div>
          <div className="wk-row" style={{ gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
            <WPill fill style={{ fontSize: 11 }}>contributor</WPill>
            <WPill style={{ fontSize: 11 }}>★ trust 4/5</WPill>
          </div>
          <dl className="wk-spec">
            <dt>contribucions</dt><dd>14 ✓ · 2 pendents</dd>
            <dt>posts fòrum</dt><dd>37</dd>
            <dt>karma</dt><dd>+128</dd>
          </dl>
          <div className="wk-rule wk-faint" style={{ position: 'static', margin: '14px 0' }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="wk-btn">Edita perfil</button>
            <button className="wk-btn wk-ghost">Tanca sessió</button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minHeight: 0 }}>
          {/* Tabs */}
          <div className="wk-row" style={{ gap: 4, borderBottom: `1.5px solid ${wkTheme.rule}` }}>
            {[['PKGs aprovats', true], ['Pendents (2)', false], ['Posts fòrum', false], ['Activitat', false]].map(([lbl, on], i) => (
              <button key={i} className="wk-btn"
                style={{ position: 'static', border: 0, borderBottom: on ? `3px solid ${wkTheme.primary}` : '3px solid transparent', borderRadius: 0, padding: '10px 14px', marginBottom: -2 }}>{lbl}</button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, overflow: 'hidden' }}>
            {[
              ['BloodGarden',   'PS4', 'v1.04', '4.2 GB',  'aprovat', '2026-04-12'],
              ['Aetherframe',   'PS4', 'v1.00', '6.8 GB',  'aprovat', '2026-04-08'],
              ['NeonRift',      'PS5', 'v2.10', '12.1 GB', 'aprovat', '2026-04-02'],
              ['CipherWalker',  'PS3', 'v1.02', '1.7 GB',  'aprovat', '2026-03-28'],
              ['Halcyon Drift', 'PS4', 'v1.01', '8.3 GB',  'aprovat', '2026-03-20'],
            ].map(([t, p, v, s, st, d], i) => (
              <div key={i} className="wk-row" style={{ justifyContent: 'space-between',
                            padding: '8px 12px', borderRadius: 6,
                            background: i % 2 ? 'transparent' : wkTheme.fill }}>
                <div className="wk-row" style={{ gap: 12 }}>
                  <div style={{ width: 28, height: 28, border: `1.5px solid ${wkTheme.rule}`, borderRadius: 4 }} />
                  <div>
                    <div style={{ fontFamily: wkTheme.fontUi, fontSize: 14 }}>{t}</div>
                    <div className="wk-mono" style={{ fontSize: 11, color: wkTheme.ink2 }}>{d} · 142 baixades</div>
                  </div>
                </div>
                <div className="wk-row" style={{ gap: 10 }}>
                  <WTag>{p}</WTag>
                  <span className="wk-mono" style={{ fontSize: 12, color: wkTheme.ink2 }}>{v}</span>
                  <span className="wk-mono" style={{ fontSize: 12 }}>{s}</span>
                  <span className="wk-pill" style={{ fontSize: 11, color: wkTheme.primary, borderColor: wkTheme.primary }}>✓ {st}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <WNote x={W - 270} y={92} n="1" w={230}>
        Perfil públic · mostra el que has contribuit + activitat al fòrum (no espai privat).
      </WNote>
      <WNote x={28} y={H - 110} n="2" color="g" w={220}>
        Trust score = paràmetre per accelerar moderació de contributors fiables.
      </WNote>
    </div>
  );
}

window.ScreenSitemap = ScreenSitemap;
window.ScreenProfile = ScreenProfile;
