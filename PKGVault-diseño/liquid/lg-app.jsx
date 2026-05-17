// lg-app.jsx — PKGVault iOS · Liquid Glass entry

function PhoneFrame({ wallpaper, showFrame, showSafe, children }) {
  const wpClass = `wp wp-${wallpaper}`;
  const screen = (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden',
                  borderRadius: showFrame ? 44 : 36, background: 'transparent', color: 'white' }}>
      <div className={wpClass} />
      {showSafe && (
        <React.Fragment>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 54,
                         background: 'rgba(255,122,89,.12)', borderBottom: '1px dashed rgba(255,122,89,.5)', zIndex: 200, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 34,
                         background: 'rgba(255,122,89,.12)', borderTop: '1px dashed rgba(255,122,89,.5)', zIndex: 200, pointerEvents: 'none' }} />
        </React.Fragment>
      )}
      {children}
    </div>
  );

  if (!showFrame) {
    return (
      <div style={{ width: 390, height: 844, borderRadius: 36, overflow: 'hidden',
                     boxShadow: '0 30px 80px rgba(0,0,0,.55), 0 10px 30px rgba(0,0,0,.4)' }}>
        {screen}
      </div>
    );
  }

  return (
    <div style={{ width: 390, height: 844, borderRadius: 56, position: 'relative',
      boxShadow:
        '0 50px 100px rgba(0,0,0,.6), 0 20px 40px rgba(0,0,0,.4),' +
        ' inset 0 0 0 11px #0a0a0a, inset 0 0 0 12px rgba(255,255,255,.08)',
      overflow: 'hidden', background: '#000' }}>
      <div style={{ position: 'absolute', top: 11, left: '50%', transform: 'translateX(-50%)',
                     width: 124, height: 36, borderRadius: 24, background: '#000', zIndex: 100 }} />
      <div style={{ position: 'absolute', inset: 11, borderRadius: 44, overflow: 'hidden' }}>
        {screen}
      </div>
      <div style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)',
                     width: 134, height: 5, borderRadius: 3, background: 'rgba(255,255,255,.85)', zIndex: 100 }} />
    </div>
  );
}

function TabBar({ cfg, active, onChange }) {
  const Tab = ({ id, icon, label }) => (
    <button onClick={() => onChange(id)}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0,
               color: active === id ? '#ff7a59' : 'rgba(255,255,255,.78)',
               padding: '6px 4px', fontSize: 9, fontWeight: 500, flex: 1 }}>
      <span style={{ fontSize: 22, lineHeight: 1 }}>{icon}</span>
      <span>{label}</span>
    </button>
  );
  return (
    <div style={{ position: 'absolute', left: 14, right: 14, bottom: 18, zIndex: 60 }}>
      <Glass cfg={cfg} radius={28} padding={0}>
        <div style={{ display: 'flex', alignItems: 'center', height: 56, padding: '0 6px' }}>
          <Tab id="home"   icon="⌂"  label="Home" />
          <Tab id="forum"  icon="✦"  label="Forum" />
          <Tab id="add"    icon="＋" label="Add" />
          <Tab id="me"     icon="◉"  label="Me" />
        </div>
      </Glass>
    </div>
  );
}

function PhoneApp({ cfg, showFrame, showSafe, wallpaper, label, initial }) {
  const [screen, setScreen] = React.useState(initial || 'home');
  const go = (s) => {
    if (s === 'add') { setScreen('home'); return; }
    if (s === 'me')  { setScreen('profile'); return; }
    setScreen(s);
  };
  let body = null;
  if (screen === 'detail') body = <ScreenDetail cfg={cfg} go={go} />;
  else if (screen === 'forum' || screen === 'thread' || screen === 'newthread') body = <ScreenForum cfg={cfg} go={go} />;
  else if (screen === 'profile') body = <ScreenProfile cfg={cfg} go={go} />;
  else body = <ScreenHome cfg={cfg} go={go} />;
  const activeTab = screen === 'profile' ? 'me' :
                     (screen === 'forum' || screen === 'thread' || screen === 'newthread') ? 'forum' : 'home';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      <PhoneFrame wallpaper={wallpaper} showFrame={showFrame} showSafe={showSafe}>
        {body}
        <TabBar cfg={cfg} active={activeTab} onChange={(t) => {
          if (t === 'home') setScreen('home');
          else if (t === 'forum') setScreen('forum');
          else if (t === 'me') setScreen('profile');
        }} />
      </PhoneFrame>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,.55)', fontWeight: 500,
                     letterSpacing: '.06em', textTransform: 'uppercase' }}>{label}</div>
    </div>
  );
}

function App() {
  const { t, setTweak, open, setOpen } = useTweaks();
  const [lgReady, setLgReady] = React.useState(!!window.LiquidGlass || window.LiquidGlass === null);
  React.useEffect(() => {
    const onReady = () => setLgReady(true);
    window.addEventListener('lg-ready', onReady);
    return () => window.removeEventListener('lg-ready', onReady);
  }, []);
  const cfg = { blur: t.blur, saturate: t.saturate, elasticity: t.elasticity, displace: t.displace };

  return (
    <div style={{
      width: '100vw', minHeight: '100vh', overflowX: 'auto',
      background: '#06040b',
      backgroundImage:
        'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(124,76,255,.18), transparent 60%),' +
        ' radial-gradient(ellipse 60% 40% at 90% 100%, rgba(255,122,89,.15), transparent 60%)',
      color: 'white',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 48, padding: '56px 56px 80px', width: 'fit-content' }}>
        <div style={{ width: 240, flexShrink: 0, marginTop: 60 }}>
          <div style={{ fontSize: 10, letterSpacing: '.14em', opacity: .5, fontWeight: 600 }}>PKGVAULT · v0.2</div>
          <div style={{ fontSize: 36, fontWeight: 800, marginTop: 8, letterSpacing: '-.02em', lineHeight: 1.05 }}>
            iOS · Liquid&nbsp;Glass
          </div>
          <div style={{ fontSize: 13, opacity: .55, marginTop: 12, lineHeight: 1.55 }}>
            Hi-fi redesign of the PS PKG library + community using iOS 26 visual language.
            Tap any screen to navigate · open <b>Tweaks</b> ↘ to tune the glass.
          </div>
          <div style={{ marginTop: 22, padding: 12, border: '1px solid rgba(255,255,255,.1)',
                         borderRadius: 12, fontSize: 11, lineHeight: 1.55, opacity: .7 }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>tech</div>
            react 18 · ts-ready · esm.sh · liquid-glass-react (rdev) · babel standalone
          </div>
          <div style={{ marginTop: 14, fontSize: 10, opacity: .4, lineHeight: 1.5 }}>
            {lgReady && window.LiquidGlass
              ? '✓ liquid-glass-react loaded'
              : lgReady ? '○ lib failed → CSS fallback' : '… loading liquid-glass-react'}
          </div>
        </div>

        {!lgReady ? null : (
          <React.Fragment>
            <PhoneApp cfg={cfg} {...t} label="01 · Home / Catalog" initial="home" />
            <PhoneApp cfg={cfg} {...t} label="02 · PKG Detail"     initial="detail" />
            <PhoneApp cfg={cfg} {...t} label="03 · Forum"          initial="forum" />
            <PhoneApp cfg={cfg} {...t} label="04 · Profile"        initial="profile" />
          </React.Fragment>
        )}
      </div>

      <TweaksPanel t={t} setTweak={setTweak} open={open} setOpen={setOpen} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
