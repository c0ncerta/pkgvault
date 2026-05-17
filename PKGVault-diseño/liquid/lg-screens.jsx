// lg-screens.jsx — PKGVault iOS screens (Liquid Glass)

const COVERS = [
  ['BloodGarden',    'PS4', '#ff5772', '#7c2440'],
  ['NeonRift',       'PS5', '#5a8cff', '#1a2e7a'],
  ['CipherWalker',   'PS3', '#5dd39e', '#1e6e4a'],
  ['Halcyon Drift',  'PS4', '#ffb858', '#7a4c1a'],
  ['Aetherframe',    'PS4', '#c97aff', '#4a1e7a'],
  ['VoidRunner',     'PS5', '#ff7a59', '#7a2c1a'],
];

function StatusBar() {
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, height: 54,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '18px 28px 0', color: '#fff', fontWeight: 600, fontSize: 16, zIndex: 50,
      pointerEvents: 'none',
    }}>
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>9:41</span>
      <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
        {/* signal */}
        <svg width="18" height="11" viewBox="0 0 18 11"><g fill="#fff">
          <rect x="0"  y="7" width="3" height="4" rx="1"/>
          <rect x="5"  y="5" width="3" height="6" rx="1"/>
          <rect x="10" y="2" width="3" height="9" rx="1"/>
          <rect x="15" y="0" width="3" height="11" rx="1"/></g></svg>
        {/* wifi */}
        <svg width="16" height="11" viewBox="0 0 16 11" fill="#fff"><path d="M8 11l2.5-2.5a3.5 3.5 0 00-5 0L8 11zm0-4.5a6 6 0 014.2 1.7l1.4-1.4A8 8 0 008 4.5a8 8 0 00-5.6 2.3l1.4 1.4A6 6 0 018 6.5zM8 2a10 10 0 017 2.8l1.4-1.4A12 12 0 008 0 12 12 0 00-.4 3.4L1 4.8A10 10 0 018 2z"/></svg>
        {/* battery */}
        <svg width="26" height="12" viewBox="0 0 26 12"><rect x="0" y="0" width="22" height="12" rx="3" fill="none" stroke="#fff" strokeOpacity=".5"/><rect x="23" y="4" width="2" height="4" rx="1" fill="#fff" fillOpacity=".5"/><rect x="2" y="2" width="18" height="8" rx="1.5" fill="#fff"/></svg>
      </div>
    </div>
  );
}

function SearchPill({ cfg, title }) {
  return (
    <div style={{ position: 'absolute', top: 60, left: 14, right: 14, zIndex: 30 }}>
      <Glass cfg={cfg} radius={22} padding={0}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                       height: 44, padding: '0 16px', color: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14, opacity: .8 }}>⌕</span>
            <span style={{ fontSize: 14, opacity: .65 }}>{title}</span>
          </div>
          <div style={{ fontSize: 11, opacity: .5, fontFamily: 'ui-monospace' }}>⌘K</div>
        </div>
      </Glass>
    </div>
  );
}

function PkgCover({ name, plat, c1, c2 }) {
  return (
    <div style={{
      width: '100%', aspectRatio: '3/4', borderRadius: 16, overflow: 'hidden',
      background: `linear-gradient(155deg, ${c1} 0%, ${c2} 100%)`,
      position: 'relative', boxShadow: '0 8px 24px rgba(0,0,0,.4)',
    }}>
      <div style={{ position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 30% 20%, rgba(255,255,255,.35), transparent 60%)' }} />
      <div style={{ position: 'absolute', inset: 0,
        backgroundImage: 'repeating-linear-gradient(45deg, transparent 0 12px, rgba(255,255,255,.05) 12px 13px)' }} />
      <div style={{ position: 'absolute', top: 8, left: 8, padding: '2px 8px', borderRadius: 999,
                    background: 'rgba(0,0,0,.4)', color: '#fff',
                    fontSize: 9, fontWeight: 700, letterSpacing: '.06em' }}>{plat}</div>
      <div style={{ position: 'absolute', left: 10, right: 10, bottom: 10,
                    color: '#fff', fontSize: 14, fontWeight: 700, lineHeight: 1.1,
                    textShadow: '0 1px 3px rgba(0,0,0,.45)' }}>{name}</div>
    </div>
  );
}

// ─── HOME ────────────────────────────────────────────────────────────────────
function ScreenHome({ cfg, go }) {
  return (
    <React.Fragment>
      <StatusBar />
      <SearchPill cfg={cfg} title="search PKGs, hashes, tags…" />

      <div className="scroll" style={{ position: 'absolute', inset: 0, overflowY: 'auto',
                    paddingTop: 118, paddingBottom: 110 }}>
        <div style={{ padding: '0 16px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
            <h1 style={{ margin: 0, fontSize: 30, fontWeight: 800, letterSpacing: '-.02em' }}>Discover</h1>
            <div style={{ fontSize: 12, opacity: .55 }}>1,248 PKGs</div>
          </div>

          <button onClick={() => go('detail')} style={{ display: 'block', width: '100%', textAlign: 'left' }}>
            <div style={{
              borderRadius: 22, overflow: 'hidden', position: 'relative', height: 190,
              background: 'linear-gradient(145deg, #ff5772 0%, #7c2440 60%, #2a0814 100%)',
              boxShadow: '0 20px 40px rgba(255,87,114,.25)',
            }}>
              <div style={{ position: 'absolute', inset: 0,
                background: 'radial-gradient(ellipse at 20% 20%, rgba(255,255,255,.3), transparent 50%)' }} />
              <div style={{ position: 'absolute', inset: 0,
                backgroundImage: 'repeating-linear-gradient(135deg, transparent 0 14px, rgba(255,255,255,.06) 14px 15px)' }} />
              <div style={{ position: 'absolute', top: 12, left: 12 }}>
                <Glass cfg={cfg} radius={999} padding="6px 12px">
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', color: 'white' }}>NEW · TODAY</div>
                </Glass>
              </div>
              <div style={{ position: 'absolute', left: 18, right: 18, bottom: 18 }}>
                <div style={{ fontSize: 10, opacity: .8, letterSpacing: '.06em' }}>FEATURED · PS4 HOMEBREW</div>
                <div style={{ fontSize: 24, fontWeight: 800, marginTop: 2, lineHeight: 1.05 }}>BloodGarden v1.04</div>
                <div style={{ fontSize: 12, opacity: .8, marginTop: 4 }}>4.2 GB · sha verified · 14h ago</div>
              </div>
            </div>
          </button>
        </div>

        <div className="scroll" style={{ display: 'flex', gap: 8, padding: '0 16px 14px', overflowX: 'auto' }}>
          {['All', 'PS3', 'PS4', 'PS5', 'Vita', 'PSP', 'Homebrew', 'Tools'].map((f, i) => (
            <Glass key={f} cfg={cfg} radius={999} padding={0}>
              <div style={{ padding: '7px 14px', fontSize: 12, fontWeight: 600, color: 'white',
                             whiteSpace: 'nowrap',
                             background: i === 0 ? 'rgba(255,122,89,.35)' : 'transparent',
                             borderRadius: 999 }}>{f}</div>
            </Glass>
          ))}
        </div>

        <div style={{ padding: '0 16px 6px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, letterSpacing: '-.01em' }}>Recently approved</h2>
            <button style={{ color: '#ff7a59', fontSize: 13, fontWeight: 600 }}>See all</button>
          </div>
          <div style={{ fontSize: 11, opacity: .55, marginTop: 2 }}>passed moderation · last 48h</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, padding: '12px 16px 20px' }}>
          {COVERS.slice(0, 4).map((c, i) => (
            <button key={i} onClick={() => go('detail')} style={{ textAlign: 'left' }}>
              <PkgCover name={c[0]} plat={c[1]} c1={c[2]} c2={c[3]} />
              <div style={{ marginTop: 8, fontSize: 13, fontWeight: 600 }}>{c[0]}</div>
              <div style={{ fontSize: 11, opacity: .55 }}>@{['jdoe','rebug_3','nyx','soldery'][i]} · {['4.2','12.1','1.7','8.3'][i]} GB</div>
            </button>
          ))}
        </div>

        <div style={{ padding: '0 16px 4px' }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, letterSpacing: '-.01em' }}>Trending</h2>
        </div>
        <div className="scroll" style={{ display: 'flex', gap: 12, padding: '12px 16px 24px', overflowX: 'auto' }}>
          {COVERS.slice(2).map((c, i) => (
            <div key={i} style={{ width: 120, flexShrink: 0 }}>
              <PkgCover name={c[0]} plat={c[1]} c1={c[2]} c2={c[3]} />
              <div style={{ marginTop: 6, fontSize: 12, fontWeight: 600 }}>{c[0]}</div>
              <div style={{ fontSize: 10, opacity: .55 }}>↓ {[412, 187, 96, 71][i]} this week</div>
            </div>
          ))}
        </div>
      </div>
    </React.Fragment>
  );
}

// ─── DETAIL ──────────────────────────────────────────────────────────────────
function ScreenDetail({ cfg, go }) {
  return (
    <React.Fragment>
      <StatusBar />
      <div style={{ position: 'absolute', top: 60, left: 14, right: 14, zIndex: 40,
                    display: 'flex', justifyContent: 'space-between' }}>
        <button onClick={() => go('home')}>
          <Glass cfg={cfg} radius={999} padding={0}>
            <div style={{ width: 40, height: 40, display: 'grid', placeItems: 'center', color: 'white', fontSize: 20 }}>‹</div>
          </Glass>
        </button>
        <Glass cfg={cfg} radius={999} padding={0}>
          <div style={{ height: 40, padding: '0 14px', display: 'flex', alignItems: 'center', gap: 12, color: 'white', fontSize: 15 }}>
            <span>★</span><span>⤴</span>
          </div>
        </Glass>
      </div>

      <div className="scroll" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingBottom: 100 }}>
        <div style={{ height: 440, position: 'relative',
          background: 'linear-gradient(160deg, #ff5772 0%, #7c2440 55%, #1a0510 100%)' }}>
          <div style={{ position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse at 25% 25%, rgba(255,255,255,.35), transparent 55%)' }} />
          <div style={{ position: 'absolute', inset: 0,
            backgroundImage: 'repeating-linear-gradient(135deg, transparent 0 14px, rgba(255,255,255,.06) 14px 15px)' }} />
          <div style={{ position: 'absolute', left: 22, right: 22, bottom: 32 }}>
            <div style={{ fontSize: 10, opacity: .8, letterSpacing: '.1em' }}>HOMEBREW · ACTION · PS4</div>
            <div style={{ fontSize: 34, fontWeight: 800, marginTop: 4, lineHeight: 1.02, letterSpacing: '-.02em' }}>BloodGarden</div>
            <div style={{ fontSize: 14, opacity: .75, marginTop: 4 }}>by @jdoe · v1.04 · 4.2 GB</div>
          </div>
        </div>

        <div style={{ padding: '0 16px', marginTop: -32, position: 'relative', zIndex: 5 }}>
          <button style={{ width: '100%' }}>
            <Glass cfg={cfg} radius={20} padding={0}>
              <div style={{ height: 54, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                             background: 'linear-gradient(180deg, rgba(255,122,89,.6), rgba(255,122,89,.3))',
                             borderRadius: 20, color: 'white', fontWeight: 700, fontSize: 16 }}>
                <span>↓</span> Download PKG · 4.2 GB
              </div>
            </Glass>
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, padding: '18px 16px 12px' }}>
          {[['1,432', 'downloads'], ['4.8', 'rating'], ['28', 'comments']].map(([v, l]) => (
            <Glass key={l} cfg={cfg} radius={16} padding={0}>
              <div style={{ padding: '12px 8px', textAlign: 'center', color: 'white' }}>
                <div style={{ fontSize: 20, fontWeight: 800 }}>{v}</div>
                <div style={{ fontSize: 10, opacity: .65, marginTop: 2 }}>{l}</div>
              </div>
            </Glass>
          ))}
        </div>

        <div style={{ padding: '10px 20px 8px', fontSize: 14, lineHeight: 1.55, color: 'rgba(255,255,255,.85)' }}>
          Surreal action-platformer homebrew. Procedural greenhouse levels, lo-fi soundtrack, full controller support. Runs on PS4 firmware 9.00+.
        </div>

        <div style={{ padding: '12px 16px' }}>
          <Glass cfg={cfg} radius={20} padding={0}>
            <div style={{ padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ fontSize: 10, letterSpacing: '.1em', opacity: .65 }}>INTEGRITY</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#5dd39e', fontSize: 12, fontWeight: 600 }}>
                  <span style={{ width: 6, height: 6, borderRadius: 3, background: '#5dd39e' }} />
                  verified
                </div>
              </div>
              <div className="mono" style={{ fontSize: 11, lineHeight: 1.6, color: 'rgba(255,255,255,.85)', wordBreak: 'break-all' }}>
                sha256<br/>
                <span style={{ opacity: .7 }}>a3f9b2c0e8d4…02bc7f1a9d</span>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <span style={{ padding: '4px 10px', borderRadius: 999, fontSize: 10, background: 'rgba(255,255,255,.08)' }}>✓ scan clean</span>
                <span style={{ padding: '4px 10px', borderRadius: 999, fontSize: 10, background: 'rgba(255,255,255,.08)' }}>✓ unique hash</span>
              </div>
            </div>
          </Glass>
        </div>

        <div style={{ padding: '4px 16px 24px' }}>
          <Glass cfg={cfg} radius={20} padding={0}>
            <div style={{ padding: '6px 0' }}>
              {[
                ['Platform',     'PS4'],
                ['Firmware',     '9.00+'],
                ['Region',       'EUR / Worldwide'],
                ['License',      'CC-BY 4.0'],
                ['Uploaded',     'May 8, 2026'],
                ['Approved by',  '@admin_n · 2h review'],
              ].map(([k, v], i, arr) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between',
                                       padding: '11px 18px',
                                       borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,.06)' : 'none' }}>
                  <div style={{ fontSize: 13, opacity: .65 }}>{k}</div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{v}</div>
                </div>
              ))}
            </div>
          </Glass>
        </div>
      </div>
    </React.Fragment>
  );
}

// ─── FORUM ───────────────────────────────────────────────────────────────────
function ScreenForum({ cfg, go }) {
  const threads = [
    ['📌', 'Forum rules · read before posting',     'mod_team', 'Scene',         3,  true],
    ['🔥', 'PS5 firmware 9.04 · first exploits',    'k4nyon',   'Scene',        47],
    ['',   'Guide · full PKG dump (webMAN 1.47)',   'rebug_3',  'Jailbreak',    18],
    ['',   'Progress · OpenLara port to PSVita',    'lara_dev', 'Progress',     22],
    ['',   'NoBootRomfsCheck on 4.89?',             'nyx',      'Help',          9],
    ['',   'CFW Evilnat 4.91.2 changelog',          'evil_n',   'Scene',        31],
    ['',   'Modchip for Slim · tested',             'soldery',  'Jailbreak',    14],
  ];
  const cats = [['All', 1248, true], ['Scene', 142], ['Jailbreak', 318], ['Progress', 204], ['Help', 486]];

  return (
    <React.Fragment>
      <StatusBar />
      <SearchPill cfg={cfg} title="search threads…" />

      <div className="scroll" style={{ position: 'absolute', inset: 0, overflowY: 'auto',
                    paddingTop: 118, paddingBottom: 110 }}>
        <div style={{ padding: '0 16px 12px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <h1 style={{ margin: 0, fontSize: 30, fontWeight: 800, letterSpacing: '-.02em' }}>Forum</h1>
          <button onClick={() => go('newthread')} style={{ color: '#ff7a59', fontSize: 14, fontWeight: 600 }}>+ New</button>
        </div>

        <div className="scroll" style={{ display: 'flex', gap: 8, padding: '0 16px 14px', overflowX: 'auto' }}>
          {cats.map(([n, c, on], i) => (
            <Glass key={i} cfg={cfg} radius={999} padding={0}>
              <div style={{ padding: '7px 14px', fontSize: 12, fontWeight: 600, color: 'white',
                             whiteSpace: 'nowrap', display: 'flex', gap: 6, alignItems: 'center',
                             background: on ? 'rgba(255,122,89,.35)' : 'transparent',
                             borderRadius: 999 }}>
                {n}<span style={{ opacity: .55, fontSize: 10, fontFamily: 'ui-monospace' }}>{c}</span>
              </div>
            </Glass>
          ))}
        </div>

        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {threads.map(([icon, title, user, cat, replies, pinned], i) => (
            <button key={i} onClick={() => go('thread')} style={{ width: '100%', textAlign: 'left' }}>
              <Glass cfg={cfg} radius={18} padding={0}>
                <div style={{ padding: 12, display: 'flex', gap: 12, alignItems: 'center',
                               background: pinned ? 'rgba(255,255,255,.04)' : 'transparent', borderRadius: 18 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 18, background: 'rgba(255,255,255,.08)',
                                 display: 'grid', placeItems: 'center', fontSize: 15, flexShrink: 0 }}>
                    {icon || user.slice(0, 1).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'white', lineHeight: 1.2,
                                   overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</div>
                    <div style={{ fontSize: 11, opacity: .55, marginTop: 3 }}>@{user} · {cat}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{replies}</div>
                    <div style={{ fontSize: 9, opacity: .5 }}>replies</div>
                  </div>
                </div>
              </Glass>
            </button>
          ))}
        </div>
      </div>
    </React.Fragment>
  );
}

// ─── PROFILE ─────────────────────────────────────────────────────────────────
function ScreenProfile({ cfg, go }) {
  return (
    <React.Fragment>
      <StatusBar />
      <div style={{ position: 'absolute', top: 60, right: 14, zIndex: 40 }}>
        <button onClick={() => go('home')}>
          <Glass cfg={cfg} radius={999} padding={0}>
            <div style={{ width: 40, height: 40, display: 'grid', placeItems: 'center', color: 'white', fontSize: 18 }}>⚙</div>
          </Glass>
        </button>
      </div>

      <div className="scroll" style={{ position: 'absolute', inset: 0, overflowY: 'auto',
                    paddingTop: 60, paddingBottom: 100 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '28px 16px 16px' }}>
          <div style={{ width: 84, height: 84, borderRadius: 42,
                         background: 'linear-gradient(145deg, #ff7a59, #c97aff)',
                         display: 'grid', placeItems: 'center', color: 'white',
                         fontSize: 32, fontWeight: 700,
                         boxShadow: '0 10px 30px rgba(255,122,89,.4)' }}>JD</div>
          <div style={{ marginTop: 12, fontSize: 22, fontWeight: 800 }}>jdoe</div>
          <div style={{ fontSize: 12, opacity: .6, marginTop: 2, textAlign: 'center', padding: '0 24px' }}>
            ps3/ps4 archivist · cataloging since 2018
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
            <span style={{ padding: '4px 10px', borderRadius: 999, fontSize: 10, fontWeight: 600,
                           background: 'rgba(255,122,89,.25)', color: '#ffaa92' }}>contributor</span>
            <span style={{ padding: '4px 10px', borderRadius: 999, fontSize: 10, fontWeight: 600,
                           background: 'rgba(93,211,158,.2)', color: '#9bedc1' }}>★ trust 4/5</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, padding: '14px 16px' }}>
          {[['14','approved'], ['2','pending'], ['37','posts']].map(([v, l]) => (
            <Glass key={l} cfg={cfg} radius={16} padding={0}>
              <div style={{ padding: '12px 8px', textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 800 }}>{v}</div>
                <div style={{ fontSize: 10, opacity: .65, marginTop: 2 }}>{l}</div>
              </div>
            </Glass>
          ))}
        </div>

        <div style={{ padding: '14px 16px 24px' }}>
          <Glass cfg={cfg} radius={20} padding={0}>
            <div style={{ padding: '6px 0' }}>
              {[
                ['📦', 'My contributions', '14 approved · 2 pending'],
                ['💬', 'Forum posts',       '37 posts · 128 karma'],
                ['★',  'Saved',              '8 PKGs · 5 threads'],
                ['🔔', 'Notifications',      '3 new'],
                ['⚙',  'Settings',           ''],
                ['📜', 'Community rules',    ''],
                ['↪',  'Sign out',           '', '#ff6b6b'],
              ].map(([icon, label, sub, color], i, arr) => (
                <div key={i} className="row" style={{ display: 'flex', alignItems: 'center', gap: 14,
                               padding: '13px 18px', cursor: 'pointer',
                               borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,.06)' : 'none' }}>
                  <span style={{ fontSize: 16, width: 22, textAlign: 'center' }}>{icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, color: color || 'white' }}>{label}</div>
                    {sub ? <div style={{ fontSize: 11, opacity: .55, marginTop: 2 }}>{sub}</div> : null}
                  </div>
                  {!color && <span style={{ opacity: .35 }}>›</span>}
                </div>
              ))}
            </div>
          </Glass>
        </div>
      </div>
    </React.Fragment>
  );
}

window.ScreenHome = ScreenHome;
window.ScreenDetail = ScreenDetail;
window.ScreenForum = ScreenForum;
window.ScreenProfile = ScreenProfile;
