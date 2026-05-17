// screens-forum-new.jsx — new thread composer + avatar dropdown + account settings

function ScreenForumNewThread() {
  const W = 1100, H = 720;
  const cats = [
    ['Scene news',     false],
    ['Jailbreak',      true],
    ['Progress logs',  false],
    ['Troubleshoot',   false],
    ['Off-topic',      false],
  ];
  const tools = [
    ['B',  'negreta',   '⌘B'],
    ['I',  'cursiva',   '⌘I'],
    ['S̶', 'ratllat',    '⌘⇧X'],
    ['H',  'titol',     '⌘1'],
    ['❝',  'cita',       '⌘>'],
    ['•',  'llista',    '⌘L'],
    ['1.', 'numerada',  '⌘⇧L'],
    ['🔗', 'enllaç',    '⌘K'],
    ['{}', 'codi',      '⌘E'],
    ['📎', 'adjunt',    ''],
    ['🖼', 'imatge',    ''],
    ['@',  'mencionar', ''],
    ['#',  'tag',       ''],
    ['👁', 'previa',    ''],
  ];
  return (
    <div className="wk wk-paper">
      <WTopbar width={W} active="Fòrum" />

      <div style={{ position: 'absolute', left: 28, top: 70, fontFamily: wkTheme.fontUi, fontSize: 13, color: wkTheme.ink2 }}>
        <WGoto to="forum/list">Fòrum</WGoto> <span style={{ margin: '0 6px' }}>/</span> Nou fil
      </div>

      <div style={{ position: 'absolute', left: 28, top: 96, right: 28, bottom: 28,
                    display: 'grid', gridTemplateColumns: '1fr 280px', gap: 18, minHeight: 0 }}>
        {/* LEFT · composer */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0 }}>
          <div className="wk-h1">Nou fil</div>

          {/* Title */}
          <div>
            <label style={{ fontFamily: wkTheme.fontUi, fontSize: 11, color: wkTheme.ink2, textTransform: 'uppercase', letterSpacing: '.06em' }}>Títol</label>
            <div className="wk-input" style={{ width: '100%', height: 44, marginTop: 4, padding: '0 14px', fontSize: 16 }}>
              <span style={{ fontFamily: wkTheme.fontUi, color: wkTheme.ink3, fontSize: 15 }}>p.ex. Guia: dump complet de PKG amb webMAN MOD 1.47</span>
            </div>
            <div className="wk-mono" style={{ fontSize: 10, color: wkTheme.ink3, marginTop: 4 }}>min 10 · max 120 caràcters · 0/120</div>
          </div>

          {/* Category + tags inline */}
          <div className="wk-row" style={{ gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontFamily: wkTheme.fontUi, fontSize: 11, color: wkTheme.ink2, textTransform: 'uppercase', letterSpacing: '.06em' }}>Categoria *</label>
              <div className="wk-row" style={{ gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                {cats.map(([n, on]) => (
                  <span key={n} className="wk-pill" style={{ fontSize: 11,
                              background: on ? wkTheme.primary : 'transparent',
                              color: on ? '#fff' : wkTheme.ink,
                              borderColor: on ? wkTheme.primary : wkTheme.rule,
                              cursor: 'pointer' }}>{n}</span>
                ))}
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontFamily: wkTheme.fontUi, fontSize: 11, color: wkTheme.ink2, textTransform: 'uppercase', letterSpacing: '.06em' }}>Tags (max 5)</label>
              <div className="wk-input" style={{ width: '100%', height: 36, marginTop: 4, padding: '0 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <WTag>PS5</WTag><WTag>guia</WTag><WTag>webMAN</WTag>
                <span className="wk-mono" style={{ fontSize: 11, color: wkTheme.ink3 }}>+</span>
              </div>
            </div>
          </div>

          {/* Toolbar */}
          <div className="wk-box wk-fill" style={{ padding: 6, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {tools.map(([icon, label, hot], i) => (
              <div key={i} title={`${label}${hot ? ' · ' + hot : ''}`} style={{
                width: 34, height: 32, display: 'grid', placeItems: 'center',
                border: `1px solid transparent`, borderRadius: 4,
                fontFamily: i < 7 ? wkTheme.fontUi : wkTheme.fontMono,
                fontSize: 14, cursor: 'pointer',
                background: i === 8 ? wkTheme.paper : 'transparent',
                fontWeight: ['B','H'].includes(icon) ? 700 : 400,
                fontStyle: icon === 'I' ? 'italic' : 'normal',
              }}>{icon}</div>
            ))}
            <div style={{ flex: 1 }} />
            <div style={{ display: 'flex', gap: 4, alignItems: 'center', paddingRight: 6 }}>
              <span className="wk-pill" style={{ fontSize: 10 }}>Markdown</span>
              <span className="wk-pill wk-fill" style={{ fontSize: 10 }}>Editor</span>
            </div>
          </div>

          {/* Body */}
          <div style={{ flex: 1, minHeight: 0, position: 'relative',
                        border: `1.5px solid ${wkTheme.rule}`, borderRadius: 8, background: wkTheme.paper, padding: 14 }}>
            <div style={{ fontFamily: wkTheme.fontUi, fontSize: 14, lineHeight: 1.55, color: wkTheme.ink }}>
              <p style={{ margin: '0 0 10px' }}># Setup inicial</p>
              <p style={{ margin: '0 0 10px', color: wkTheme.ink2 }}>
                Aquesta guia explica com fer un dump complet d'un PKG instalat utilitzant webMAN MOD 1.47 en una PS3 amb CFW Evilnat 4.91…
              </p>
              <p style={{ margin: '0 0 10px' }}>**Necessites:**</p>
              <p style={{ margin: '0 0 4px', color: wkTheme.ink2 }}>- PS3 amb CFW (HEN o CFW estable)</p>
              <p style={{ margin: '0 0 4px', color: wkTheme.ink2 }}>- webMAN MOD ≥ 1.47</p>
              <p style={{ margin: '0 0 10px', color: wkTheme.ink2 }}>- USB ext4 amb &gt; mida del joc + 1GB</p>
              <p style={{ margin: '0', color: wkTheme.ink3, fontStyle: 'italic' }}>cursor ▏</p>
            </div>
            {/* Drop zone overlay (faint) */}
            <div style={{ position: 'absolute', right: 12, bottom: 12,
                          border: `1.5px dashed ${wkTheme.rule}`, borderRadius: 6,
                          padding: '8px 12px', background: wkTheme.fill,
                          fontFamily: wkTheme.fontUi, fontSize: 11, color: wkTheme.ink2 }}>
              📎 arrossega fitxers aquí (max 5MB · png/jpg/log/txt)
            </div>
          </div>

          {/* Attachments preview */}
          <div className="wk-row" style={{ gap: 8 }}>
            <div className="wk-row" style={{ gap: 8, padding: '8px 12px', border: `1px solid ${wkTheme.rule}`, borderRadius: 6, background: wkTheme.fill }}>
              <span style={{ fontSize: 14 }}>🖼</span>
              <div>
                <div style={{ fontFamily: wkTheme.fontUi, fontSize: 12 }}>setup_webman.png</div>
                <div className="wk-mono" style={{ fontSize: 10, color: wkTheme.ink2 }}>412 KB · pujat</div>
              </div>
              <span style={{ fontSize: 14, color: wkTheme.ink3, marginLeft: 6, cursor: 'pointer' }}>×</span>
            </div>
            <div className="wk-row" style={{ gap: 8, padding: '8px 12px', border: `1px solid ${wkTheme.rule}`, borderRadius: 6, background: wkTheme.fill }}>
              <span style={{ fontSize: 14 }}>📄</span>
              <div>
                <div style={{ fontFamily: wkTheme.fontUi, fontSize: 12 }}>dump_log.txt</div>
                <div className="wk-mono" style={{ fontSize: 10, color: wkTheme.ink2 }}>2.1 KB · pujat</div>
              </div>
              <span style={{ fontSize: 14, color: wkTheme.ink3, marginLeft: 6, cursor: 'pointer' }}>×</span>
            </div>
          </div>

          {/* Actions */}
          <div className="wk-row" style={{ justifyContent: 'space-between', paddingTop: 6,
                          borderTop: `1.5px solid ${wkTheme.rule}` }}>
            <div className="wk-row" style={{ gap: 14, fontFamily: wkTheme.fontUi, fontSize: 12, color: wkTheme.ink2 }}>
              <span>💾 esborrany guardat fa 12s</span>
            </div>
            <div className="wk-row" style={{ gap: 8 }}>
              <button className="wk-btn wk-ghost" style={{ position: 'static' }}>Cancel·lar</button>
              <button className="wk-btn" style={{ position: 'static' }}>Guardar esborrany</button>
              <button className="wk-btn" style={{ position: 'static' }}>Previsualitzar</button>
              <button className="wk-btn wk-pri" style={{ position: 'static' }}
                      onClick={() => window.dcGoto && window.dcGoto('forum/thread')}>Publicar fil</button>
            </div>
          </div>
        </div>

        {/* RIGHT · sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0 }}>
          <div className="wk-box wk-fill" style={{ padding: 14 }}>
            <div className="wk-h3" style={{ marginBottom: 8 }}>Opcions del fil</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontFamily: wkTheme.fontUi, fontSize: 12 }}>
              {[
                ['Permetre respostes',   true],
                ['Notificar-me respostes', true],
                ['Marcar com NSFW',       false],
                ['Spoiler (oculta body)', false],
              ].map(([lbl, on], i) => (
                <div key={i} className="wk-row" style={{ justifyContent: 'space-between' }}>
                  <span>{lbl}</span>
                  <div style={{ width: 32, height: 18, borderRadius: 9, border: `1.5px solid ${wkTheme.rule}`,
                                background: on ? wkTheme.primary : 'transparent', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: 1, left: on ? 15 : 1,
                                  width: 14, height: 14, borderRadius: '50%',
                                  background: on ? '#fff' : wkTheme.ink3 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="wk-box" style={{ padding: 14 }}>
            <div className="wk-h3" style={{ marginBottom: 8 }}>Adjuntar PKG del catàleg</div>
            <div style={{ fontFamily: wkTheme.fontUi, fontSize: 11, color: wkTheme.ink2, marginBottom: 8, lineHeight: 1.45 }}>
              Si el fil va sobre un paquet concret, enllaça'l. Apareixerà com a card al post.
            </div>
            <div className="wk-input" style={{ width: '100%', height: 32, padding: '0 10px' }}>
              <span className="wk-mono" style={{ fontSize: 11, color: wkTheme.ink3 }}>⌕ cerca al catàleg…</span>
            </div>
          </div>

          <div className="wk-box" style={{ padding: 14 }}>
            <div className="wk-h3" style={{ marginBottom: 8 }}>Normes ràpides</div>
            <ul style={{ margin: 0, paddingLeft: 16, fontFamily: wkTheme.fontUi, fontSize: 11, color: wkTheme.ink2, lineHeight: 1.55 }}>
              <li>no enllacis firmwares directes</li>
              <li>no demanis ni distribueixis ROMs comercials</li>
              <li>cita fonts si fas cross-post</li>
              <li>guies → marca-les amb tag <span className="wk-mono">guia</span></li>
            </ul>
          </div>
        </div>
      </div>

      <WNote x={W - 230} y={84} n="1" w={200} color="g">
        Editor markdown amb live preview · esborrany auto-save cada 10s.
      </WNote>
      <WNote x={W - 230} y={H - 110} n="2" w={200}>
        Sidebar = opcions secundàries · no fan soroll a l'editor.
      </WNote>
    </div>
  );
}

function ScreenAvatarMenu() {
  const W = 1100, H = 720;
  const items = [
    ['👤', 'El meu perfil',         '/me',                     'forum/list'],
    ['📦', 'Les meves contribucions','14 aprovades · 2 pendents', 'profile'],
    ['💬', 'Posts del fòrum',        '37 posts · 128 karma',    'forum/list'],
    ['★',  'Guardats',              '8 PKGs · 5 fils',         null],
    null,
    ['⚙',  'Configuració',          'compte, sessió, privacitat', 'profile/settings'],
    ['🔔', 'Notificacions',          '3 noves',                 null],
    ['🌙', 'Tema',                   'auto · clar · fosc',      null],
    ['🌐', 'Idioma',                 'Català',                  null],
    null,
    ['📚', 'Centre d\'ajuda',        '',                        null],
    ['📜', 'Normes de la comunitat',  '',                       null],
    null,
    ['↪',  'Tanca sessió',           '',                        'login/centered'],
  ];
  return (
    <div className="wk wk-paper">
      <WTopbar width={W} active="Catàleg" />

      {/* Page behind (faded catalog hint) */}
      <div style={{ position: 'absolute', left: 28, top: 80, right: 28, bottom: 28, opacity: .35 }}>
        <div className="wk-h1">Catàleg públic · 1.248 PKGs</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 18 }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="wk-box" style={{ aspectRatio: '3/4' }} />
          ))}
        </div>
      </div>

      {/* Highlighted avatar in topbar */}
      <div style={{ position: 'absolute', right: 22, top: 11,
                    width: 92, height: 34, borderRadius: 17,
                    border: `2px solid ${wkTheme.primary}`,
                    boxShadow: `0 0 0 4px ${wkTheme.primary}22` }} />

      {/* Connector */}
      <svg style={{ position: 'absolute', inset: 0, width: W, height: H, pointerEvents: 'none' }}>
        <line x1={W - 70} y1={48} x2={W - 70} y2={68} stroke={wkTheme.primary} strokeWidth="1.5" strokeDasharray="3 3" />
      </svg>

      {/* Dropdown */}
      <div style={{ position: 'absolute', right: 24, top: 64, width: 300,
                    background: wkTheme.paper,
                    border: `1.5px solid ${wkTheme.rule}`, borderRadius: 10,
                    boxShadow: '0 12px 32px rgba(0,0,0,.18)',
                    padding: 6, fontFamily: wkTheme.fontUi }}>
        {/* Header card */}
        <div className="wk-row" style={{ gap: 10, padding: '10px 12px', background: wkTheme.fill, borderRadius: 6, marginBottom: 4 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', border: `1.5px solid ${wkTheme.rule}`,
                        background: wkTheme.paper, display: 'grid', placeItems: 'center',
                        fontFamily: wkTheme.fontHand, fontSize: 18 }}>JD</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>jdoe</div>
            <div className="wk-mono" style={{ fontSize: 10, color: wkTheme.ink2 }}>jdoe@protonmail.com</div>
            <div className="wk-row" style={{ gap: 4, marginTop: 4 }}>
              <span className="wk-pill" style={{ fontSize: 9, color: wkTheme.primary, borderColor: wkTheme.primary, padding: '1px 6px' }}>contributor</span>
              <span className="wk-pill" style={{ fontSize: 9, padding: '1px 6px' }}>★ 4/5</span>
            </div>
          </div>
        </div>

        {items.map((it, i) => {
          if (!it) return <div key={`s-${i}`} style={{ height: 1, background: wkTheme.rule, margin: '4px 0', opacity: .4 }} />;
          const [icon, label, sub, goto] = it;
          return (
            <div key={i}
                 onClick={() => goto && window.dcGoto && window.dcGoto(goto)}
                 className="wk-row"
                 style={{ padding: '8px 12px', borderRadius: 6, gap: 12,
                          cursor: goto ? 'pointer' : 'default',
                          background: i === 5 ? wkTheme.fill2 : 'transparent' }}>
              <span style={{ width: 18, fontSize: 14, textAlign: 'center' }}>{icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: label === 'Tanca sessió' ? wkTheme.danger : wkTheme.ink }}>{label}</div>
                {sub && <div style={{ fontSize: 10, color: wkTheme.ink2 }}>{sub}</div>}
              </div>
              {goto && <span style={{ color: wkTheme.ink3, fontSize: 11 }}>›</span>}
            </div>
          );
        })}
      </div>

      <WNote x={28} y={120} n="1" w={240} color="y">
        Click avatar dalt-dreta → menu desplegable. Resum de l'usuari + accessos ràpids.
      </WNote>
      <WNote x={28} y={H - 100} n="2" w={260} color="g">
        Separadors agrupen: identitat · preferències · ajuda · sortir.
      </WNote>
    </div>
  );
}

function ScreenSettings() {
  const W = 1100, H = 720;
  const sections = [
    ['Compte',         true],
    ['Perfil públic',  false],
    ['Sessió i seguretat', false],
    ['Notificacions',  false],
    ['Privacitat',     false],
    ['Aparença',       false],
    ['API tokens',     false],
    ['Zona perillosa', false],
  ];
  return (
    <div className="wk wk-paper">
      <WTopbar width={W} active="Perfil" />

      <div style={{ position: 'absolute', left: 28, top: 70, fontFamily: wkTheme.fontUi, fontSize: 13, color: wkTheme.ink2 }}>
        <WGoto to="profile">Perfil</WGoto> <span style={{ margin: '0 6px' }}>/</span> Configuració
      </div>

      <div style={{ position: 'absolute', left: 28, top: 96, right: 28, bottom: 28,
                    display: 'grid', gridTemplateColumns: '230px 1fr', gap: 20, minHeight: 0 }}>
        {/* Sidebar */}
        <div className="wk-box" style={{ padding: 8 }}>
          {sections.map(([n, on], i) => (
            <div key={i} style={{ padding: '10px 12px', borderRadius: 6,
                          background: on ? wkTheme.fill2 : 'transparent',
                          borderLeft: on ? `3px solid ${wkTheme.primary}` : '3px solid transparent',
                          fontFamily: wkTheme.fontUi, fontSize: 13,
                          color: n === 'Zona perillosa' ? wkTheme.danger : wkTheme.ink,
                          fontWeight: on ? 600 : 400, cursor: 'pointer' }}>{n}</div>
          ))}
        </div>

        {/* Content */}
        <div style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="wk-h1">Compte</div>

          {/* Avatar */}
          <div className="wk-row" style={{ gap: 18, padding: 16, border: `1.5px solid ${wkTheme.rule}`, borderRadius: 8 }}>
            <div style={{ width: 88, height: 88, borderRadius: '50%', border: `1.5px solid ${wkTheme.rule}`,
                          background: wkTheme.fill, display: 'grid', placeItems: 'center',
                          fontFamily: wkTheme.fontHand, fontSize: 36 }}>JD</div>
            <div style={{ flex: 1 }}>
              <div className="wk-h3" style={{ marginBottom: 4 }}>Avatar</div>
              <div style={{ fontFamily: wkTheme.fontUi, fontSize: 12, color: wkTheme.ink2, marginBottom: 10 }}>
                JPG/PNG · max 1MB · es retallarà a quadrat
              </div>
              <div className="wk-row" style={{ gap: 8 }}>
                <button className="wk-btn" style={{ position: 'static' }}>Pujar imatge</button>
                <button className="wk-btn wk-ghost" style={{ position: 'static' }}>Treure</button>
              </div>
            </div>
          </div>

          {/* Fields */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {[
              ['Nom d\'usuari', 'jdoe', 'wk-mono', '✓ disponible'],
              ['Nom a mostrar', 'J. Doe', '', ''],
              ['Email', 'jdoe@protonmail.com', 'wk-mono', '✓ verificat'],
              ['Web', 'https://jdoe.dev', 'wk-mono', ''],
              ['Ubicació', 'Barcelona, ES', '', ''],
              ['Pronoms', 'they/them', '', ''],
            ].map(([lbl, val, mono, hint], i) => (
              <div key={i}>
                <label style={{ fontFamily: wkTheme.fontUi, fontSize: 11, color: wkTheme.ink2, textTransform: 'uppercase', letterSpacing: '.06em' }}>{lbl}</label>
                <div className="wk-input" style={{ width: '100%', height: 36, marginTop: 4, padding: '0 12px' }}>
                  <span className={mono} style={{ fontFamily: mono ? wkTheme.fontMono : wkTheme.fontUi, fontSize: 13 }}>{val}</span>
                </div>
                {hint && <div className="wk-mono" style={{ fontSize: 10, color: hint.startsWith('✓') ? wkTheme.primary : wkTheme.ink2, marginTop: 3 }}>{hint}</div>}
              </div>
            ))}
          </div>

          {/* Bio */}
          <div>
            <label style={{ fontFamily: wkTheme.fontUi, fontSize: 11, color: wkTheme.ink2, textTransform: 'uppercase', letterSpacing: '.06em' }}>Bio</label>
            <div style={{ marginTop: 4, height: 70, border: `1.5px solid ${wkTheme.rule}`, borderRadius: 6,
                          background: wkTheme.paper, padding: 10,
                          fontFamily: wkTheme.fontUi, fontSize: 13, lineHeight: 1.5 }}>
              ps3/ps4 archivist · cataloging since 2018 · scene news + reverse engineering ▏
            </div>
            <div className="wk-mono" style={{ fontSize: 10, color: wkTheme.ink3, marginTop: 3 }}>76/200</div>
          </div>

          {/* Toggles */}
          <div style={{ borderTop: `1.5px solid ${wkTheme.rule}`, paddingTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              ['Mostrar email al perfil',     false],
              ['Permetre missatges directes', true],
              ['Aparèixer al directori',      true],
              ['Activar 2FA',                 false, 'recomanat'],
            ].map(([lbl, on, badge], i) => (
              <div key={i} className="wk-row" style={{ justifyContent: 'space-between',
                            padding: '10px 12px', border: `1px solid ${wkTheme.rule}`, borderRadius: 6 }}>
                <div className="wk-row" style={{ gap: 8 }}>
                  <span style={{ fontFamily: wkTheme.fontUi, fontSize: 13 }}>{lbl}</span>
                  {badge && <span className="wk-pill" style={{ fontSize: 9, color: wkTheme.primary, borderColor: wkTheme.primary }}>{badge}</span>}
                </div>
                <div style={{ width: 32, height: 18, borderRadius: 9, border: `1.5px solid ${wkTheme.rule}`,
                              background: on ? wkTheme.primary : 'transparent', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: 1, left: on ? 15 : 1,
                                width: 14, height: 14, borderRadius: '50%',
                                background: on ? '#fff' : wkTheme.ink3 }} />
                </div>
              </div>
            ))}
          </div>

          {/* Save bar */}
          <div className="wk-row" style={{ justifyContent: 'space-between',
                          padding: '12px 14px', background: wkTheme.fill2,
                          border: `1.5px solid ${wkTheme.rule}`, borderRadius: 8 }}>
            <div className="wk-row" style={{ gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: 4, background: wkTheme.primary }} />
              <span style={{ fontFamily: wkTheme.fontUi, fontSize: 13 }}>Tens canvis sense guardar</span>
            </div>
            <div className="wk-row" style={{ gap: 8 }}>
              <button className="wk-btn wk-ghost" style={{ position: 'static' }}>Descartar</button>
              <button className="wk-btn wk-pri" style={{ position: 'static' }}>Guardar canvis</button>
            </div>
          </div>
        </div>
      </div>

      <WNote x={W - 240} y={92} n="1" w={210}>
        Pestanyes verticals · agrupen 8 àrees. "Zona perillosa" en vermell (eliminar compte).
      </WNote>
      <WNote x={28} y={H - 90} n="2" color="g" w={240}>
        Save bar sticky · sempre visible quan hi ha canvis pendents.
      </WNote>
    </div>
  );
}

window.ScreenForumNewThread = ScreenForumNewThread;
window.ScreenAvatarMenu = ScreenAvatarMenu;
window.ScreenSettings = ScreenSettings;
