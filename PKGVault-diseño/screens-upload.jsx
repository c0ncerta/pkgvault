// screens-upload.jsx — 4 upload wireframe variants

function UploadA_LongForm() {
  const W = 1100, H = 720;
  return (
    <div className="wk wk-paper">
      <WTopbar width={W} active="Contribuir" />

      <div style={{ position: 'absolute', left: 28, top: 70, fontFamily: wkTheme.fontUi, fontSize: 13, color: wkTheme.ink2 }}>
        <WGoto to="catalog/grid">Catàleg</WGoto> <span style={{ margin: '0 6px' }}>/</span> Contribuir un PKG
      </div>

      <div style={{ position: 'absolute', left: 28, top: 96, right: 28, bottom: 28, overflow: 'hidden' }}>
        <div className="wk-h1" style={{ marginBottom: 6 }}>Contribuir un PKG a la comunitat</div>
        <div style={{ fontFamily: wkTheme.fontUi, fontSize: 13, color: wkTheme.ink2, marginBottom: 18 }}>
          el teu PKG passa a la cua de moderació · els admins el revisen abans de publicar-lo. mida màx · 20 GB.
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* File picker */}
            <div className="wk-box wk-dashed wk-fill" style={{ position: 'static', padding: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 48, height: 48, border: `1.5px solid ${wkTheme.rule}`, borderRadius: 6, display: 'grid', placeItems: 'center', fontFamily: wkTheme.fontMono, fontSize: 18 }}>↑</div>
              <div style={{ flex: 1 }}>
                <div className="wk-h3">BloodGarden_v1.04.pkg</div>
                <div className="wk-mono" style={{ fontSize: 12, color: wkTheme.ink2 }}>4.2 GB · application/octet-stream</div>
              </div>
              <button className="wk-btn">Canvia fitxer</button>
            </div>

            {/* Metadata fields grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <WInput x={0} y={0} w={'100%'} label="Títol *" value="BloodGarden" focus style={{ position: 'static' }} />
              <WInput x={0} y={0} w={'100%'} label="Versió *" value="1.04" style={{ position: 'static' }} />
              <WInput x={0} y={0} w={'100%'} label="Plataforma *" value="PS4 ▾" style={{ position: 'static' }} />
              <WInput x={0} y={0} w={'100%'} label="Regió" value="EU ▾" style={{ position: 'static' }} />
              <WInput x={0} y={0} w={'100%'} label="Firmware mínim" value="9.00" style={{ position: 'static' }} />
              <WInput x={0} y={0} w={'100%'} label="ID intern" value="CUSA-09812" style={{ position: 'static' }} />
            </div>

            <div>
              <div className="wk-lbl" style={{ marginBottom: 4 }}>Descripció</div>
              <div className="wk-input" style={{ height: 80, alignItems: 'flex-start', padding: 10, color: wkTheme.ink2 }}>
                <span className="wk-mono" style={{ fontSize: 12, opacity: .55 }}>survival horror, descobreix el pati on res no creix dues vegades…</span>
              </div>
            </div>

            <div>
              <div className="wk-lbl" style={{ marginBottom: 4 }}>Tags</div>
              <div className="wk-input" style={{ minHeight: 38, gap: 4, flexWrap: 'wrap' }}>
                {['rpg', 'horror', 'indie'].map((g) => <WPill key={g} fill style={{ fontSize: 12 }}>{g} ✕</WPill>)}
                <span className="wk-mono" style={{ fontSize: 11, opacity: .55 }}>＋ afegeix tag</span>
              </div>
            </div>

            <div className="wk-row" style={{ gap: 8, paddingTop: 6 }}>
              <button className="wk-btn wk-pri" onClick={() => window.dcGoto && window.dcGoto('admin/queue')}>Enviar a revisió →</button>
              <button className="wk-btn">Desar com a esborrany</button>
              <button className="wk-btn wk-ghost">Cancel·la</button>
            </div>
          </div>

          {/* Side rail */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="wk-box wk-fill" style={{ position: 'static', padding: 14 }}>
              <div className="wk-h3" style={{ marginBottom: 8 }}>Validacions</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontFamily: wkTheme.fontUi, fontSize: 13 }}>
                {[
                  ['extensió .pkg', true],
                  ['mida ≤ 20 GB', true],
                  ['títol obligatori', true],
                  ['versió en format x.yy', true],
                  ['plataforma triada', true],
                  ['hash duplicat', false],
                ].map(([lbl, ok], i) => (
                  <div key={i} style={{ display: 'flex', gap: 6 }}>
                    <span style={{ color: ok ? wkTheme.primary : wkTheme.ink3, fontFamily: wkTheme.fontMono }}>{ok ? '✓' : '·'}</span>
                    <span style={{ color: ok ? wkTheme.ink : wkTheme.ink2 }}>{lbl}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="wk-box" style={{ position: 'static', padding: 14 }}>
              <div className="wk-h3" style={{ marginBottom: 6 }}>Què passa quan envies?</div>
              <ol style={{ margin: 0, paddingLeft: 18, fontFamily: wkTheme.fontUi, fontSize: 13, color: wkTheme.ink2, lineHeight: 1.5 }}>
                <li>fitxer → /uploads/&lt;uuid&gt;.pkg</li>
                <li>càlcul SHA-256 + check duplicat</li>
                <li>queda en estat <b>pending</b></li>
                <li>admin revisa (24-48h)</li>
                <li>publicat al catàleg públic ✓</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <WNote x={W - 250} y={70} n="1" w={210}>
        Single-page = familiar. Mostra-ho tot a l'hora · pot fer pòr.
      </WNote>
      <WNote x={28} y={H - 110} n="2" color="g" w={220}>
        Validacions live a la barra dreta · feedback continu.
      </WNote>
    </div>
  );
}

function UploadB_Wizard() {
  const W = 1100, H = 720;
  const steps = ['Fitxer', 'Metadades', 'Revisar'];
  const active = 1;
  return (
    <div className="wk wk-paper">
      <WTopbar width={W} active="Contribuir" />

      {/* Step indicator */}
      <div style={{ position: 'absolute', left: 28, top: 76, right: 28, display: 'flex', alignItems: 'center', gap: 12 }}>
        {steps.map((s, i) => (
          <React.Fragment key={s}>
            <div className="wk-row" style={{ gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 14, border: `1.5px solid ${wkTheme.rule}`,
                            background: i <= active ? wkTheme.primary : 'transparent',
                            color: i <= active ? '#fff' : wkTheme.ink,
                            display: 'grid', placeItems: 'center',
                            fontFamily: wkTheme.fontHand, fontSize: 16 }}>
                {i < active ? '✓' : i + 1}
              </div>
              <span style={{ fontFamily: wkTheme.fontUi, fontSize: 14,
                              fontWeight: i === active ? 600 : 400, color: i <= active ? wkTheme.ink : wkTheme.ink3 }}>{s}</span>
            </div>
            {i < steps.length - 1 && <div style={{ flex: 1, height: 1.5, background: i < active ? wkTheme.primary : wkTheme.faint }} />}
          </React.Fragment>
        ))}
      </div>

      {/* Content card */}
      <div className="wk-box wk-fill" style={{ position: 'absolute', left: W / 2 - 280, top: 130, width: 560, padding: 28 }}>
        <div className="wk-h1" style={{ fontSize: 24, marginBottom: 4 }}>Pas 2 · Metadades</div>
        <div style={{ fontFamily: wkTheme.fontUi, fontSize: 13, color: wkTheme.ink2, marginBottom: 20 }}>
          omple les dades del PKG. els camps amb * són obligatoris.
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <WInput x={0} y={0} w={'100%'} label="Títol *" value="Aetherframe" focus style={{ position: 'static' }} />
          <WInput x={0} y={0} w={'100%'} label="Versió *" value="1.00" style={{ position: 'static' }} />
          <WInput x={0} y={0} w={'100%'} label="Plataforma *" value="PS4 ▾" style={{ position: 'static' }} />
          <WInput x={0} y={0} w={'100%'} label="Regió" value="US ▾" style={{ position: 'static' }} />
        </div>

        <div style={{ marginBottom: 12 }}>
          <div className="wk-lbl" style={{ marginBottom: 4 }}>Descripció</div>
          <div className="wk-input" style={{ height: 70, alignItems: 'flex-start', padding: 10 }}>
            <span className="wk-mono" style={{ fontSize: 12, opacity: .55 }}>opcional…</span>
          </div>
        </div>

        <div style={{ marginBottom: 18 }}>
          <div className="wk-lbl" style={{ marginBottom: 4 }}>Tags</div>
          <div className="wk-input" style={{ gap: 4, flexWrap: 'wrap' }}>
            <WPill fill style={{ fontSize: 12 }}>action ✕</WPill>
            <WPill fill style={{ fontSize: 12 }}>sci-fi ✕</WPill>
            <span className="wk-mono" style={{ fontSize: 11, opacity: .55 }}>＋</span>
          </div>
        </div>

        <div className="wk-rule wk-faint" style={{ position: 'static', marginBottom: 14 }} />
        <div className="wk-row" style={{ justifyContent: 'space-between' }}>
          <button className="wk-btn">← Pas 1</button>
          <div className="wk-row" style={{ gap: 6 }}>
            <button className="wk-btn wk-ghost">Cancel·la</button>
            <button className="wk-btn wk-pri">Pas 3 · Revisar →</button>
          </div>
        </div>
      </div>

      <WNote x={28} y={130} n="1" color="g" w={210}>
        Wizard = guia pas a pas. Ideal per a usuaris novells.
      </WNote>
      <WNote x={W - 240} y={140} n="2" w={210}>
        Step 3 mostra preview + confirmació abans del POST final.
      </WNote>
    </div>
  );
}

function UploadC_DropCentric() {
  const W = 1100, H = 720;
  return (
    <div className="wk wk-paper">
      <WTopbar width={W} active="Contribuir" />

      <div style={{ position: 'absolute', left: 28, top: 70, fontFamily: wkTheme.fontUi, fontSize: 13, color: wkTheme.ink2 }}>
        <WGoto to="catalog/grid">Catàleg</WGoto> <span style={{ margin: '0 6px' }}>/</span> Contribuir
      </div>

      <div className="wk-box wk-dashed wk-fill" style={{ position: 'absolute', left: 100, top: 110, right: 100, height: 360, padding: 20,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <div style={{ width: 96, height: 96, border: `2px dashed ${wkTheme.rule}`, borderRadius: 12, display: 'grid', placeItems: 'center', fontFamily: wkTheme.fontHand, fontSize: 48 }}>↑</div>
        <div className="wk-h1" style={{ fontSize: 32 }}>Arrossega el .pkg aquí</div>
        <div style={{ fontFamily: wkTheme.fontUi, fontSize: 14, color: wkTheme.ink2 }}>
          o <span className="wk-link"><b>tria un fitxer</b></span> · màx · 20 GB · només .pkg
        </div>
        <div className="wk-row" style={{ gap: 8, marginTop: 10 }}>
          <span className="wk-pill"><span className="wk-mono" style={{ fontSize: 11 }}>.pkg</span></span>
          <span className="wk-pill"><span className="wk-mono" style={{ fontSize: 11 }}>≤ 20 GB</span></span>
          <span className="wk-pill"><span className="wk-mono" style={{ fontSize: 11 }}>SHA-256 auto</span></span>
        </div>
      </div>

      {/* Quick form below (collapsed/light) */}
      <div className="wk-box" style={{ position: 'absolute', left: 100, top: 490, right: 100, bottom: 28, padding: 18 }}>
        <div className="wk-row" style={{ justifyContent: 'space-between', marginBottom: 10 }}>
          <div className="wk-h3">Info bàsica (opcional ara, pots omplir-ho després)</div>
          <span className="wk-link" style={{ color: wkTheme.ink2, fontSize: 13 }}>amaga ▴</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 10 }}>
          <WInput x={0} y={0} w={'100%'} label="Títol" placeholder="auto-detectat del nom de fitxer" style={{ position: 'static' }} />
          <WInput x={0} y={0} w={'100%'} label="Versió" placeholder="1.00" style={{ position: 'static' }} />
          <WInput x={0} y={0} w={'100%'} label="Plataforma" placeholder="auto ▾" style={{ position: 'static' }} />
          <WInput x={0} y={0} w={'100%'} label="Regió" placeholder="—" style={{ position: 'static' }} />
        </div>
      </div>

      <WNote x={28} y={130} n="1" color="y" w={200}>
        Drop zone enorme · poca fricció. Ideal per a power users que ja saben.
      </WNote>
      <WNote x={W - 230} y={170} n="2" color="c" w={200}>
        Auto-detecció del nom (regex sobre el filename) per pre-omplir camps.
      </WNote>
      <WCallout x={420} y={210} w={150}>
        click o drag · ambdós<br/>activen el mateix flow.
      </WCallout>
    </div>
  );
}

function UploadD_SplitDropForm() {
  const W = 1100, H = 720;
  return (
    <div className="wk wk-paper">
      <WTopbar width={W} active="Contribuir" />

      <div style={{ position: 'absolute', left: 28, top: 70, fontFamily: wkTheme.fontUi, fontSize: 13, color: wkTheme.ink2 }}>
        <WGoto to="catalog/hybrid">Catàleg</WGoto> <span style={{ margin: '0 6px' }}>/</span> Contribuir
      </div>

      <div style={{ position: 'absolute', left: 28, top: 96, right: 28, bottom: 28, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        {/* Left: drop + progress */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="wk-box wk-dashed wk-fill" style={{ position: 'static', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 18, gap: 10 }}>
            <div style={{ width: 64, height: 64, border: `2px dashed ${wkTheme.rule}`, borderRadius: 10, display: 'grid', placeItems: 'center', fontFamily: wkTheme.fontHand, fontSize: 32 }}>↑</div>
            <div className="wk-h2" style={{ fontSize: 22 }}>BloodGarden_v1.04.pkg</div>
            <div className="wk-mono" style={{ fontSize: 12, color: wkTheme.ink2 }}>4.2 GB · application/octet-stream</div>
            <div style={{ width: '80%', marginTop: 8 }}>
              <div style={{ height: 14, border: `1.5px solid ${wkTheme.rule}`, borderRadius: 8, overflow: 'hidden', background: wkTheme.paper }}>
                <div style={{ width: '64%', height: '100%', background: wkTheme.primary }} />
              </div>
              <div className="wk-row" style={{ justifyContent: 'space-between', marginTop: 6, fontFamily: wkTheme.fontMono, fontSize: 11, color: wkTheme.ink2 }}>
                <span>2.7 GB / 4.2 GB</span>
                <span>64% · 12 MB/s</span>
              </div>
            </div>
            <button className="wk-btn wk-ghost" style={{ position: 'static', marginTop: 6 }}>Pausar pujada</button>
          </div>

          <div className="wk-box" style={{ position: 'static', padding: 14 }}>
            <div className="wk-h3" style={{ marginBottom: 8 }}>Després de pujar</div>
            {[
              ['1', 'Càlcul SHA-256 al servidor', 'curs'],
              ['2', 'Insert a MySQL', 'pendent'],
              ['3', 'Redirect a detall', 'pendent'],
            ].map(([n, lbl, st], i) => (
              <div key={n} className="wk-row" style={{ gap: 10, padding: '6px 0',
                            borderBottom: i < 2 ? `1px solid ${wkTheme.faint}` : 0,
                            fontFamily: wkTheme.fontUi, fontSize: 13 }}>
                <span style={{ width: 22, height: 22, border: `1.4px solid ${wkTheme.rule}`, borderRadius: 11,
                              display: 'grid', placeItems: 'center', fontFamily: wkTheme.fontMono, fontSize: 11,
                              background: st === 'curs' ? wkTheme.fill : 'transparent' }}>{n}</span>
                <span style={{ flex: 1 }}>{lbl}</span>
                <span className="wk-mono" style={{ fontSize: 11, color: wkTheme.ink2 }}>{st}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: form fields */}
        <div className="wk-box" style={{ position: 'static', padding: 18, display: 'flex', flexDirection: 'column', gap: 12, overflow: 'hidden' }}>
          <div className="wk-h2" style={{ fontSize: 18 }}>Metadades</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <WInput x={0} y={0} w={'100%'} label="Títol *" value="BloodGarden" focus style={{ position: 'static' }} />
            <WInput x={0} y={0} w={'100%'} label="Versió *" value="1.04" style={{ position: 'static' }} />
            <WInput x={0} y={0} w={'100%'} label="Plataforma *" value="PS4 ▾" style={{ position: 'static' }} />
            <WInput x={0} y={0} w={'100%'} label="Regió" value="EU ▾" style={{ position: 'static' }} />
            <WInput x={0} y={0} w={'100%'} label="Firmware ≥" value="9.00" style={{ position: 'static' }} />
            <WInput x={0} y={0} w={'100%'} label="ID intern" placeholder="opcional" style={{ position: 'static' }} />
          </div>
          <div>
            <div className="wk-lbl" style={{ marginBottom: 4 }}>Descripció</div>
            <div className="wk-input" style={{ height: 70, alignItems: 'flex-start' }}>
              <span className="wk-mono" style={{ fontSize: 12, opacity: .55 }}>opcional…</span>
            </div>
          </div>
          <div>
            <div className="wk-lbl" style={{ marginBottom: 4 }}>Tags</div>
            <div className="wk-input" style={{ gap: 4, flexWrap: 'wrap' }}>
              <WPill fill style={{ fontSize: 12 }}>rpg ✕</WPill>
              <WPill fill style={{ fontSize: 12 }}>horror ✕</WPill>
              <span className="wk-mono" style={{ fontSize: 11, opacity: .55 }}>＋</span>
            </div>
          </div>

          <div style={{ flex: 1 }} />
          <div className="wk-rule wk-faint" style={{ position: 'static' }} />
          <div className="wk-row" style={{ gap: 8, justifyContent: 'flex-end' }}>
            <button className="wk-btn wk-ghost">Cancel·la</button>
            <button className="wk-btn wk-pri" onClick={() => window.dcGoto && window.dcGoto('detail/dashboard')}>Confirmar pujada →</button>
          </div>
        </div>
      </div>

      <WNote x={W - 250} y={80} n="1" color="g" w={210}>
        Form + upload en paral·lel · usuari emplena dades mentre puja el fitxer (estalvia temps).
      </WNote>
      <WNote x={28} y={H - 110} n="2" color="c" w={210}>
        Si l'upload falla, conservem el form (no perdis el que has escrit).
      </WNote>
    </div>
  );
}

window.UploadA_LongForm = UploadA_LongForm;
window.UploadB_Wizard = UploadB_Wizard;
window.UploadC_DropCentric = UploadC_DropCentric;
window.UploadD_SplitDropForm = UploadD_SplitDropForm;
