// screens-forum.jsx — community forum (scene news, jailbreak, progress)

function ScreenForumList() {
  const W = 1100, H = 720;
  const cats = [
    ['Scene news',     142, '#'],
    ['Jailbreak',      318,  ''],
    ['Progress logs',  204,  ''],
    ['Troubleshoot',   486,  ''],
    ['Off-topic',       97,  ''],
  ];
  const threads = [
    ['📌', 'Regles del fòrum · llegiu abans de postejar',         'mod_team', 'Scene news',    '—',   3,   'pinned'],
    ['🔥', 'PS5 firmware 9.04 · primers exploits confirmats',     'k4nyon',   'Scene news',    '2h',  47,  'hot'],
    ['',   'Guia: dump complet de PKG amb webMAN MOD 1.47',       'rebug_3',  'Jailbreak',     '5h',  18,  ''],
    ['',   'Progress · port d\'OpenLara a PSVita (setmana 3)',    'lara_dev', 'Progress logs', '8h',  22,  ''],
    ['',   'NoBootRomfsCheck patch funciona amb 4.89?',           'nyx',      'Troubleshoot',  '1d',  9,   ''],
    ['',   'PS3 CFW Evilnat 4.91.2 · canvis vs 4.91.1',           'evil_n',   'Scene news',    '1d',  31,  ''],
    ['',   'Hardware: xip modchip per Slim · provat',             'soldery',  'Jailbreak',     '2d',  14,  ''],
    ['',   'PSP Vita TV homebrew menu loop al boot',              'helpme',   'Troubleshoot',  '2d',  6,   ''],
    ['',   'Recopilatori · best PS2 classics PKG (compatibles)',  'archivist','Off-topic',     '3d',  52,  ''],
    ['',   'Progress · custom dashboard per PS4 9.00',            'rouge',    'Progress logs', '4d',  19,  ''],
  ];
  return (
    <div className="wk wk-paper">
      <WTopbar width={W} active="Fòrum" />

      <div style={{ position: 'absolute', left: 28, top: 80, right: 28, bottom: 28,
                    display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20, minHeight: 0 }}>
        {/* Sidebar · categories */}
        <div className="wk-box" style={{ padding: 14 }}>
          <div className="wk-h3" style={{ marginBottom: 10 }}>Categories</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {cats.map(([n, c, active], i) => (
              <div key={i} className="wk-row" style={{ justifyContent: 'space-between',
                            padding: '8px 10px', borderRadius: 6,
                            background: active ? wkTheme.fill2 : 'transparent',
                            border: active ? `1px solid ${wkTheme.rule}` : '1px solid transparent',
                            fontFamily: wkTheme.fontUi, fontSize: 13 }}>
                <span>{n}</span>
                <span className="wk-mono" style={{ fontSize: 11, color: wkTheme.ink2 }}>{c}</span>
              </div>
            ))}
          </div>
          <div className="wk-rule wk-faint" style={{ position: 'static', margin: '14px 0 10px' }} />
          <button className="wk-btn wk-pri" style={{ position: 'static', width: '100%' }}
                  onClick={() => window.dcGoto && window.dcGoto('forum/thread')}>+ Nou fil</button>
          <div style={{ fontFamily: wkTheme.fontUi, fontSize: 11, color: wkTheme.ink2, marginTop: 8, lineHeight: 1.4 }}>
            requereix sessió · qualsevol membre pot postejar (no passa per moderació prèvia, només report).
          </div>
        </div>

        {/* Thread list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minHeight: 0 }}>
          <div className="wk-row" style={{ justifyContent: 'space-between' }}>
            <div className="wk-h2">Tots els fils</div>
            <div className="wk-row" style={{ gap: 8 }}>
              <WInput placeholder="Cerca al fòrum…" w={220} />
              <WPill style={{ fontSize: 11 }}>recents</WPill>
              <WPill style={{ fontSize: 11 }}>populars</WPill>
              <WPill style={{ fontSize: 11 }}>sense resposta</WPill>
            </div>
          </div>

          <div className="wk-box" style={{ padding: 0, overflow: 'hidden', flex: 1, minHeight: 0 }}>
            {threads.map(([icon, title, author, cat, age, replies, kind], i) => (
              <div key={i} className="wk-row"
                   onClick={() => window.dcGoto && window.dcGoto('forum/thread')}
                   style={{ padding: '12px 14px', justifyContent: 'space-between',
                            borderBottom: i < threads.length - 1 ? `1px solid ${wkTheme.rule}` : 'none',
                            background: kind === 'pinned' ? wkTheme.fill : 'transparent', cursor: 'pointer' }}>
                <div className="wk-row" style={{ gap: 12, minWidth: 0 }}>
                  <div style={{ width: 22, fontFamily: wkTheme.fontUi, fontSize: 14, textAlign: 'center' }}>{icon}</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: wkTheme.fontUi, fontSize: 14, fontWeight: kind === 'pinned' ? 600 : 500 }}>
                      {title}
                      {kind === 'hot' && <span className="wk-pill" style={{ marginLeft: 8, fontSize: 10, color: wkTheme.primary, borderColor: wkTheme.primary }}>hot</span>}
                    </div>
                    <div className="wk-mono" style={{ fontSize: 11, color: wkTheme.ink2, marginTop: 2 }}>
                      @{author} · {cat} · fa {age}
                    </div>
                  </div>
                </div>
                <div className="wk-row" style={{ gap: 16 }}>
                  <div style={{ textAlign: 'center', fontFamily: wkTheme.fontUi, fontSize: 12 }}>
                    <div style={{ fontWeight: 600 }}>{replies}</div>
                    <div style={{ fontSize: 10, color: wkTheme.ink2 }}>respostes</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <WNote x={W - 270} y={92} n="1" w={230}>
        Fòrum = la 2a "pota" del producte. Post lliure (no moderació prèvia) per fomentar discussió.
      </WNote>
      <WNote x={28} y={H - 90} n="2" color="g" w={240}>
        Categories pensades per la scene: news, jailbreak (CFW/exploits), progress logs, support.
      </WNote>
    </div>
  );
}

function ScreenForumThread() {
  const W = 1100, H = 720;
  const posts = [
    { u: 'k4nyon',   role: 'OP · trust 5/5', age: '2h',  body: 'Acaba d\'aparèixer un primer PoC funcional de userland exploit pel 9.04. De moment només crash controlat però promet. Algú més ho ha pogut reproduir? Adjunto repo i logs del kernel panic.' },
    { u: 'soldery',  role: 'contributor',     age: '1h',  body: 'Confirmo crash al meu kit de dev (CUH-7216B). El payload no enganxa encara però el primer salt del ROP funciona. Probaré demà amb la cadena completa.' },
    { u: 'nyx',      role: 'member',          age: '47m', body: 'Algú té el dump complet de la firmware 9.04? Necessito mirar libkernel_sys per comparar amb el 9.00.' },
    { u: 'rebug_3',  role: 'mod',             age: '32m', body: 'Recordatori: no enllaceu firmwares directament al fòrum, només referències. Marco el fil com a hot.' },
  ];
  return (
    <div className="wk wk-paper">
      <WTopbar width={W} active="Fòrum" />

      <div style={{ position: 'absolute', left: 28, top: 70, fontFamily: wkTheme.fontUi, fontSize: 13, color: wkTheme.ink2 }}>
        <WGoto to="forum/list">Fòrum</WGoto> <span style={{ margin: '0 6px' }}>/</span> Scene news <span style={{ margin: '0 6px' }}>/</span> Fil
      </div>

      <div style={{ position: 'absolute', left: 28, top: 96, right: 28, bottom: 28,
                    display: 'flex', flexDirection: 'column', gap: 14, minHeight: 0 }}>
        {/* Thread header */}
        <div className="wk-box" style={{ padding: 16 }}>
          <div className="wk-row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="wk-h1" style={{ marginBottom: 4 }}>PS5 firmware 9.04 · primers exploits confirmats</div>
              <div className="wk-row" style={{ gap: 8, fontFamily: wkTheme.fontUi, fontSize: 12, color: wkTheme.ink2 }}>
                <span>per <b>@k4nyon</b></span><span>·</span><span>fa 2h</span><span>·</span>
                <WTag>scene news</WTag><WTag>jailbreak</WTag><WTag>PS5</WTag>
              </div>
            </div>
            <div className="wk-row" style={{ gap: 6 }}>
              <button className="wk-btn">★ Seguir</button>
              <button className="wk-btn wk-ghost">⋯</button>
            </div>
          </div>
        </div>

        {/* Posts */}
        <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {posts.map((p, i) => (
            <div key={i} className="wk-box" style={{ padding: 14, display: 'grid', gridTemplateColumns: '120px 1fr 80px', gap: 14 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', border: `1.5px solid ${wkTheme.rule}`,
                              background: wkTheme.paper, margin: '0 auto 8px', display: 'grid', placeItems: 'center',
                              fontFamily: wkTheme.fontHand, fontSize: 22 }}>{p.u.slice(0, 2).toUpperCase()}</div>
                <div style={{ fontFamily: wkTheme.fontUi, fontSize: 13, fontWeight: 600 }}>@{p.u}</div>
                <div className="wk-mono" style={{ fontSize: 10, color: wkTheme.ink2 }}>{p.role}</div>
              </div>
              <div>
                <div className="wk-mono" style={{ fontSize: 11, color: wkTheme.ink2, marginBottom: 6 }}>fa {p.age} · #{i + 1}</div>
                <div style={{ fontFamily: wkTheme.fontUi, fontSize: 14, lineHeight: 1.55 }}>{p.body}</div>
                {i === 0 && (
                  <div className="wk-row" style={{ gap: 6, marginTop: 10 }}>
                    <span className="wk-pill wk-mono" style={{ fontSize: 10 }}>📎 ps5_904_panic.log</span>
                    <span className="wk-pill wk-mono" style={{ fontSize: 10 }}>🔗 github.com/k4nyon/ps5-904-poc</span>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, fontFamily: wkTheme.fontUi, fontSize: 12 }}>
                <button className="wk-btn wk-ghost" style={{ position: 'static', padding: '4px 10px', fontSize: 14 }}>▲</button>
                <div style={{ fontWeight: 600 }}>{[28, 12, 3, 8][i]}</div>
                <button className="wk-btn wk-ghost" style={{ position: 'static', padding: '4px 10px', fontSize: 14 }}>▼</button>
                <div style={{ fontSize: 10, color: wkTheme.ink2, marginTop: 6 }}>respondre</div>
              </div>
            </div>
          ))}
        </div>

        {/* Reply box */}
        <div className="wk-box wk-fill" style={{ padding: 12 }}>
          <div className="wk-h3" style={{ marginBottom: 8 }}>La teva resposta</div>
          <div style={{ width: '100%', height: 80, border: `1.5px dashed ${wkTheme.rule}`, borderRadius: 6,
                        background: wkTheme.paper, padding: 10, fontFamily: wkTheme.fontUi, fontSize: 12, color: wkTheme.ink2 }}>
            escriu aquí · markdown bàsic + adjunts (max 5MB · imatges/logs)
          </div>
          <div className="wk-row" style={{ justifyContent: 'space-between', marginTop: 10 }}>
            <div className="wk-row" style={{ gap: 6 }}>
              <WPill style={{ fontSize: 10 }}>B</WPill>
              <WPill style={{ fontSize: 10 }}>I</WPill>
              <WPill style={{ fontSize: 10 }}>{'</>'}</WPill>
              <WPill style={{ fontSize: 10 }}>📎</WPill>
              <WPill style={{ fontSize: 10 }}>@</WPill>
            </div>
            <button className="wk-btn wk-pri" style={{ position: 'static' }}>Publicar resposta</button>
          </div>
        </div>
      </div>

      <WNote x={W - 250} y={170} n="1" w={210}>
        Vot ▲▼ per ressaltar respostes útils (típic de comunitats tècniques).
      </WNote>
    </div>
  );
}

window.ScreenForumList = ScreenForumList;
window.ScreenForumThread = ScreenForumThread;
