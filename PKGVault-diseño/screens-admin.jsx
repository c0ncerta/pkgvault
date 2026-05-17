// screens-admin.jsx — moderation queue (admin review of contributed PKGs)

function ScreenAdminQueue() {
  const W = 1100, H = 720;
  const queue = [
    ['BloodGarden v1.04',  'jdoe',     'PS4', '4.2 GB',  'a3f9…02bc', '2h',  'pending', true],
    ['NeonRift v2.10',     'rebug_3',  'PS5', '12.1 GB', '7e1c…bb40', '5h',  'pending', false],
    ['CipherWalker v1.02', 'nyx',      'PS3', '1.7 GB',  '0091…ff21', '8h',  'flagged', false],
    ['Halcyon Drift v1.01','soldery',  'PS4', '8.3 GB',  '4ab2…99d3', '1d',  'pending', false],
    ['Aetherframe v1.00',  'archivist','PS4', '6.8 GB',  '2dd0…5566', '2d',  'pending', false],
    ['VoidRunner v0.9',    'lara_dev', 'PS5', '9.6 GB',  'c100…aa11', '3d',  'pending', false],
  ];
  return (
    <div className="wk wk-paper">
      <WTopbar width={W} active="Admin" />

      <div style={{ position: 'absolute', left: 28, top: 70, fontFamily: wkTheme.fontUi, fontSize: 13, color: wkTheme.ink2 }}>
        <span>Admin</span> <span style={{ margin: '0 6px' }}>/</span> Cua de moderació
      </div>

      <div style={{ position: 'absolute', left: 28, top: 96, right: 28, bottom: 28,
                    display: 'grid', gridTemplateColumns: '440px 1fr', gap: 18, minHeight: 0 }}>
        {/* Left · queue list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minHeight: 0 }}>
          <div className="wk-row" style={{ justifyContent: 'space-between' }}>
            <div className="wk-h2">Cua · 6 pendents</div>
            <div className="wk-row" style={{ gap: 6 }}>
              <WPill fill style={{ fontSize: 10 }}>tots</WPill>
              <WPill style={{ fontSize: 10 }}>pending</WPill>
              <WPill style={{ fontSize: 10 }}>flagged</WPill>
            </div>
          </div>

          <div className="wk-box" style={{ padding: 0, overflow: 'hidden', flex: 1, minHeight: 0 }}>
            {queue.map(([title, user, plat, size, hash, age, status, sel], i) => (
              <div key={i} className="wk-row"
                   style={{ padding: '12px 14px', justifyContent: 'space-between',
                            borderBottom: i < queue.length - 1 ? `1px solid ${wkTheme.rule}` : 'none',
                            background: sel ? wkTheme.fill2 : 'transparent',
                            borderLeft: sel ? `3px solid ${wkTheme.primary}` : '3px solid transparent', cursor: 'pointer' }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontFamily: wkTheme.fontUi, fontSize: 14, fontWeight: 500 }}>{title}</div>
                  <div className="wk-mono" style={{ fontSize: 10, color: wkTheme.ink2, marginTop: 3 }}>
                    @{user} · fa {age} · {hash}
                  </div>
                </div>
                <div className="wk-row" style={{ gap: 8 }}>
                  <WTag>{plat}</WTag>
                  <span className="wk-mono" style={{ fontSize: 11 }}>{size}</span>
                  <span className="wk-pill" style={{ fontSize: 10,
                                                     color: status === 'flagged' ? wkTheme.danger : wkTheme.ink2,
                                                     borderColor: status === 'flagged' ? wkTheme.danger : wkTheme.rule }}>
                    {status === 'flagged' ? '⚠' : '◷'} {status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right · review detail */}
        <div className="wk-box" style={{ padding: 18, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div className="wk-row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="wk-h1" style={{ marginBottom: 4 }}>BloodGarden v1.04</div>
              <div className="wk-mono" style={{ fontSize: 11, color: wkTheme.ink2 }}>
                contribuit per <b>@jdoe</b> · trust 4/5 · 14 aprovats prèviament
              </div>
            </div>
            <span className="wk-pill" style={{ fontSize: 11, color: wkTheme.ink2 }}>◷ pending · fa 2h</span>
          </div>

          <div className="wk-rule wk-faint" style={{ position: 'static', margin: '12px 0' }} />

          {/* Auto-checks */}
          <div className="wk-h3" style={{ marginBottom: 8 }}>Auto-checks del sistema</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 14 }}>
            {[
              ['extensió .pkg',           'ok'],
              ['mida 4.2 GB ≤ 20 GB',     'ok'],
              ['SHA-256 calculat',        'ok'],
              ['hash duplicat al catàleg','ok · únic'],
              ['signature header vàlid',  'ok'],
              ['scan antimalware',        'warn · 1 hit (likely false-positive)'],
            ].map(([k, v], i) => {
              const isWarn = v.startsWith('warn');
              return (
                <div key={i} className="wk-row" style={{ gap: 8, fontFamily: wkTheme.fontUi, fontSize: 12 }}>
                  <span style={{ color: isWarn ? wkTheme.danger : wkTheme.primary, fontWeight: 700 }}>
                    {isWarn ? '⚠' : '✓'}
                  </span>
                  <span style={{ color: wkTheme.ink2 }}>{k}</span>
                  <span className="wk-mono" style={{ fontSize: 11, marginLeft: 'auto' }}>{v}</span>
                </div>
              );
            })}
          </div>

          {/* Metadata review */}
          <div className="wk-h3" style={{ marginBottom: 8 }}>Metadades enviades</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px', marginBottom: 14 }}>
            <dl className="wk-spec" style={{ margin: 0 }}>
              <dt>plataforma</dt><dd>PS4</dd>
              <dt>firmware mín</dt><dd>9.00</dd>
              <dt>regió</dt><dd>EUR</dd>
              <dt>tags</dt><dd>action, indie</dd>
            </dl>
            <dl className="wk-spec" style={{ margin: 0 }}>
              <dt>SHA-256</dt><dd className="wk-mono" style={{ fontSize: 10 }}>a3f9b2…02bc</dd>
              <dt>mida</dt><dd>4.2 GB</dd>
              <dt>portada RAWG</dt><dd>✓ matched</dd>
              <dt>licencia decl.</dt><dd>homebrew · CC-BY</dd>
            </dl>
          </div>

          {/* Notes */}
          <div className="wk-h3" style={{ marginBottom: 6 }}>Notes per al contribuïdor (opcional)</div>
          <div style={{ height: 60, border: `1.5px dashed ${wkTheme.rule}`, borderRadius: 6,
                        background: wkTheme.paper, padding: 10, marginBottom: 14,
                        fontFamily: wkTheme.fontUi, fontSize: 12, color: wkTheme.ink2 }}>
            comenta si rebutges o demanes canvis…
          </div>

          {/* Actions */}
          <div className="wk-rule wk-faint" style={{ position: 'static', marginBottom: 14 }} />
          <div className="wk-row" style={{ gap: 8, justifyContent: 'flex-end' }}>
            <button className="wk-btn wk-ghost" style={{ position: 'static' }}>↓ Baixar per inspeccionar</button>
            <button className="wk-btn" style={{ position: 'static' }}>Demanar canvis</button>
            <button className="wk-btn" style={{ position: 'static', borderColor: wkTheme.danger, color: wkTheme.danger }}>✕ Rebutjar</button>
            <button className="wk-btn wk-pri" style={{ position: 'static' }}
                    onClick={() => window.dcGoto && window.dcGoto('catalog/grid')}>✓ Aprovar i publicar</button>
          </div>
        </div>
      </div>

      <WNote x={W - 270} y={140} n="1" w={230}>
        Auto-checks fan la feina pesada: dedup hash, extensió, mida, scan. L'admin valida + decideix.
      </WNote>
      <WNote x={28} y={H - 90} n="2" color="g" w={260}>
        Aprovar → publicat al catàleg públic immediatament. Trust score del contributor puja.
      </WNote>
    </div>
  );
}

window.ScreenAdminQueue = ScreenAdminQueue;
