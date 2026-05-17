// screens-login.jsx — 3 login wireframe variants

function LoginA_Minimal() {
  const W = 1100, H = 720;
  return (
    <div className="wk wk-paper">
      {/* Top bar mini */}
      <div style={{ position: 'absolute', left: 28, top: 24, display: 'flex', gap: 8, alignItems: 'center' }}>
        <div style={{ width: 22, height: 22, border: `1.5px solid ${wkTheme.rule}`, borderRadius: 5,
                      display: 'grid', placeItems: 'center', fontFamily: wkTheme.fontMono, fontSize: 12 }}>P</div>
        <span className="wk-h2" style={{ fontSize: 18 }}>PKGVault</span>
      </div>
      <div style={{ position: 'absolute', right: 28, top: 28, fontFamily: wkTheme.fontUi, fontSize: 13, color: wkTheme.ink2 }}>
        no tens compte? <WGoto to="login/split"><b>Registra't</b></WGoto>
      </div>

      {/* Centered card */}
      <div className="wk-box wk-fill" style={{ position: 'absolute', left: W / 2 - 200, top: 150, width: 400, padding: 32 }}>
        <div className="wk-h1" style={{ marginBottom: 4 }}>Inicia sessió</div>
        <div style={{ fontFamily: wkTheme.fontUi, fontSize: 13, color: wkTheme.ink2, marginBottom: 22 }}>
          accedeix al teu catàleg privat de PKGs.
        </div>

        <WInput x={0} y={0} w={'100%'} label="Usuari o email" placeholder="jdoe" style={{ position: 'static', marginBottom: 14 }} />
        <WInput x={0} y={0} w={'100%'} label="Contrasenya" value="••••••••" focus style={{ position: 'static', marginBottom: 8 }} />

        <div className="wk-row" style={{ justifyContent: 'space-between', marginBottom: 18, fontSize: 13 }}>
          <label className="wk-row" style={{ gap: 6 }}>
            <span style={{ width: 14, height: 14, border: `1.4px solid ${wkTheme.rule}`, borderRadius: 3, display: 'inline-block' }} />
            recorda'm
          </label>
          <span className="wk-link" style={{ color: wkTheme.ink2, fontSize: 13 }}>he oblidat la contrasenya</span>
        </div>

        <button className="wk-btn wk-pri" style={{ width: '100%', height: 42 }}
                onClick={() => window.dcGoto && window.dcGoto('catalog/grid')}>
          Entrar →
        </button>
      </div>

      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 28, textAlign: 'center',
                    fontFamily: wkTheme.fontUi, fontSize: 12, color: wkTheme.ink3 }}>
        © PKGVault · v0.1 · ús personal
      </div>

      <WNote x={40} y={170} n="1" color="y" w={200}>
        Validacions client-side abans d'enviar (camps obligatoris, format).
      </WNote>
      <WNote x={40} y={310} n="2" color="c" w={200}>
        Server: <span className="wk-mono">password_hash()</span>. Sessió PHP després d'OK.
      </WNote>
      <WCallout x={W - 260} y={440} w={210}>
        Click "Entrar" → fluxe demo<br/>cap a Catàleg.
      </WCallout>
    </div>
  );
}

function LoginB_Split() {
  const W = 1100, H = 720;
  return (
    <div className="wk wk-paper" style={{ display: 'flex' }}>
      {/* Brand panel */}
      <div className="wk-fill2" style={{ width: 460, height: '100%', padding: 36, position: 'relative',
              borderRight: `1.5px solid ${wkTheme.rule}`, display: 'flex', flexDirection: 'column' }}>
        <div className="wk-row" style={{ gap: 10 }}>
          <div style={{ width: 30, height: 30, border: `1.5px solid ${wkTheme.rule}`, borderRadius: 6,
                        display: 'grid', placeItems: 'center', fontFamily: wkTheme.fontMono, fontSize: 14 }}>P</div>
          <span className="wk-h2" style={{ fontSize: 22 }}>PKGVault</span>
        </div>
        <div style={{ flex: 1 }} />
        <div className="wk-h1" style={{ fontSize: 40, lineHeight: 1, marginBottom: 16 }}>
          el teu vault<br/>de paquets,<br/>amb hash.
        </div>
        <div style={{ fontFamily: wkTheme.fontUi, fontSize: 14, color: wkTheme.ink2, marginBottom: 28, maxWidth: 320 }}>
          Catalog · Versionat · Integritat (SHA-256). 100% privat.
        </div>
        {/* Decorative file card */}
        <div className="wk-box" style={{ position: 'static', padding: 14, background: wkTheme.paper, marginBottom: 20 }}>
          <div className="wk-mono" style={{ fontSize: 12, color: wkTheme.ink2 }}>BloodGarden_v1.04.pkg</div>
          <div className="wk-row" style={{ justifyContent: 'space-between', marginTop: 4 }}>
            <span className="wk-mono" style={{ fontSize: 11 }}>4.2 GB</span>
            <span className="wk-pill" style={{ fontSize: 11 }}>✓ hash OK</span>
          </div>
        </div>
        <div style={{ flex: 1 }} />
      </div>

      {/* Form panel */}
      <div style={{ flex: 1, padding: '60px 80px', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
        <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
          <button className="wk-btn wk-pri" style={{ position: 'static', height: 36, padding: '0 16px' }}>Inicia sessió</button>
          <button className="wk-btn" style={{ position: 'static', height: 36, padding: '0 16px' }}>Registra't</button>
        </div>

        <div className="wk-h1" style={{ marginBottom: 4 }}>Benvingut/da</div>
        <div style={{ fontFamily: wkTheme.fontUi, fontSize: 14, color: wkTheme.ink2, marginBottom: 28 }}>
          accedeix amb les teves credencials.
        </div>

        <WInput x={0} y={0} w={420} label="Email" placeholder="jdoe@pkgvault.local" style={{ position: 'static', marginBottom: 16 }} />
        <WInput x={0} y={0} w={420} label="Contrasenya" value="••••••••" focus style={{ position: 'static', marginBottom: 22 }} />

        <button className="wk-btn wk-pri" style={{ width: 420, height: 44 }}
                onClick={() => window.dcGoto && window.dcGoto('catalog/sidebar')}>
          Entrar →
        </button>

        <div style={{ marginTop: 18, fontFamily: wkTheme.fontUi, fontSize: 13, color: wkTheme.ink2 }}>
          encara no tens compte? <span className="wk-link"><b>Crea'n una</b></span>
        </div>
      </div>

      <WNote x={500} y={40} n="1" color="g" w={210}>
        Branding panel: oportunitat per copy de venda + screenshot del producte.
      </WNote>
      <WNote x={W - 260} y={470} n="2" color="y" w={220}>
        Tabs login/registre eviten dues pàgines separades. Mateix endpoint, "mode" diferent.
      </WNote>
    </div>
  );
}

function LoginC_Terminal() {
  const W = 1100, H = 720;
  return (
    <div className="wk wk-paper" style={{ background: '#161210', color: '#ece7d6' }}>
      {/* Faux terminal window */}
      <div style={{ position: 'absolute', left: W / 2 - 320, top: 90, width: 640,
                    border: `1.5px solid #ece7d6`, borderRadius: 10, overflow: 'hidden',
                    background: '#1c1813', boxShadow: '4px 6px 0 rgba(0,0,0,.4)' }}>
        {/* title bar */}
        <div style={{ height: 32, borderBottom: `1.5px solid #ece7d6`, display: 'flex',
                      alignItems: 'center', padding: '0 12px', gap: 6, background: '#241f1a' }}>
          <span style={{ width: 10, height: 10, borderRadius: 5, border: `1.2px solid #ece7d6` }} />
          <span style={{ width: 10, height: 10, borderRadius: 5, border: `1.2px solid #ece7d6` }} />
          <span style={{ width: 10, height: 10, borderRadius: 5, border: `1.2px solid #ece7d6` }} />
          <span style={{ flex: 1 }} />
          <span className="wk-mono" style={{ fontSize: 12, opacity: .65 }}>~/pkgvault — auth</span>
        </div>
        <div style={{ padding: '24px 28px', fontFamily: wkTheme.fontMono, fontSize: 14, lineHeight: 1.7 }}>
          <div style={{ opacity: .6, fontFamily: wkTheme.fontUi, fontSize: 13, marginBottom: 18 }}>
            // benvingut a PKGVault. autentica't per accedir al teu vault.
          </div>
          <div><span style={{ color: '#7fd99c' }}>$</span> pkgvault auth login</div>
          <div style={{ marginTop: 12 }}>
            <span style={{ opacity: .6 }}>username:</span>{' '}
            <span style={{ borderBottom: '1.5px solid #ece7d6', paddingBottom: 1 }}>jdoe</span>
          </div>
          <div style={{ marginTop: 8 }}>
            <span style={{ opacity: .6 }}>password:</span>{' '}
            <span style={{ borderBottom: '1.5px solid #ece7d6', paddingBottom: 1 }}>●●●●●●●●</span>
            <span style={{ display: 'inline-block', width: 8, height: 16, background: '#ece7d6',
                            marginLeft: 4, verticalAlign: 'middle', animation: 'wk-blink 1s steps(2) infinite' }} />
          </div>
          <div style={{ marginTop: 18, opacity: .55, fontFamily: wkTheme.fontUi, fontSize: 12 }}>
            ↵ enter per enviar · esc per cancel·lar · tab entre camps
          </div>

          <div style={{ marginTop: 22, padding: '12px 14px',
                       border: '1.5px dashed #ece7d6', borderRadius: 6, color: '#ece7d6' }}>
            <div className="wk-row" style={{ justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13 }}>↵  ENTRA AL VAULT</span>
              <span className="wk-mono" style={{ fontSize: 12, opacity: .55 }}>→</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes wk-blink{50%{opacity:0}}`}</style>

      <div style={{ position: 'absolute', left: 36, top: 32 }}>
        <div className="wk-row" style={{ gap: 10 }}>
          <div style={{ width: 26, height: 26, border: `1.5px solid #ece7d6`, borderRadius: 5,
                        display: 'grid', placeItems: 'center', fontFamily: wkTheme.fontMono, fontSize: 13 }}>P</div>
          <span className="wk-h2" style={{ fontSize: 20, color: '#ece7d6' }}>PKGVault</span>
        </div>
      </div>
      <div style={{ position: 'absolute', right: 28, top: 36, fontFamily: wkTheme.fontUi, fontSize: 13, color: '#bfb6a0' }}>
        no és per a tu? <span className="wk-link"><WGoto to="login/minimal">vista clàssica →</WGoto></span>
      </div>

      <div className="wk-note y wk-ann" style={{ left: 40, top: 220, width: 210 }}>
        <span className="wk-num">1</span>
        Vibe tècnic per power users. Mateix endpoint, presentació diferent.
      </div>
      <div className="wk-note c wk-ann" style={{ left: W - 250, top: 380, width: 210 }}>
        <span className="wk-num">2</span>
        Risk: pot intimidar usuaris menys tècnics. Ofereix toggle a vista clàssica.
      </div>
    </div>
  );
}

window.LoginA_Minimal = LoginA_Minimal;
window.LoginB_Split = LoginB_Split;
window.LoginC_Terminal = LoginC_Terminal;
