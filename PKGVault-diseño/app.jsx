// app.jsx — composes design canvas + tweaks panel + all screen artboards

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "color": "neutral",
  "annotations": true,
  "sketchy": true,
  "themed": false
}/*EDITMODE-END*/;

const AB_W = 1100;
const AB_H = 720;

function ArtboardChrome({ children, t }) {
  // Wrap each screen body in classes that respond to tweaks.
  const cls = [
    'wk',
    `wk-c-${t.color}`,
    t.themed ? 'wk-paper-themed' : 'wk-paper',
    !t.annotations && 'wk-no-ann',
    t.sketchy && 'wk-sketchy',
    !t.sketchy && 'wk-clean',
  ].filter(Boolean).join(' ');
  // Re-wrap by replacing the root .wk class on the inner element.
  return <div className={cls} style={{ width: AB_W, height: AB_H, position: 'relative', overflow: 'hidden' }}>{children}</div>;
}

// Render helper that strips the inner screen's own .wk wrapper so we can
// re-apply tweak classes from outside. Each screen returns <div className="wk wk-paper">…</div>;
// here we render the screen and wrap its children in our themed shell.
function Screen({ render, t }) {
  const inner = render();
  // inner is a React element with className like "wk wk-paper". We replace its className.
  const cls = [
    'wk',
    `wk-c-${t.color}`,
    t.themed && (t.color === 'brief' || t.color === 'amber') ? 'wk-paper-themed' : 'wk-paper',
    !t.annotations && 'wk-no-ann',
    t.sketchy && 'wk-sketchy',
    !t.sketchy && 'wk-clean',
  ].filter(Boolean).join(' ');
  return React.cloneElement(inner, { className: cls });
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  return (
    <>
      <DesignCanvas minScale={0.05} maxScale={2}>
        <WFlowBridge />

        <DCSection id="overview" title="01 · Mapa web + Perfil" subtitle="Sitemap del projecte i pantalla de perfil. Punt de partida.">
          <DCArtboard id="sitemap" label="A · Sitemap" width={AB_W} height={AB_H}>
            <Screen render={ScreenSitemap} t={t} />
          </DCArtboard>
          <DCArtboard id="profile"  label="B · Perfil" width={AB_W} height={AB_H}>
            <Screen render={ScreenProfile} t={t} />
          </DCArtboard>
        </DCSection>

        <DCSection id="login" title="02 · Login" subtitle="Tres direccions visuals · click 'Entrar' per saltar al Catàleg.">
          <DCArtboard id="minimal"  label="A · Minimal centrat" width={AB_W} height={AB_H}>
            <Screen render={LoginA_Minimal} t={t} />
          </DCArtboard>
          <DCArtboard id="split"    label="B · Split brand+form" width={AB_W} height={AB_H}>
            <Screen render={LoginB_Split} t={t} />
          </DCArtboard>
          <DCArtboard id="terminal" label="C · Terminal vibe" width={AB_W} height={AB_H}>
            <Screen render={LoginC_Terminal} t={t} />
          </DCArtboard>
        </DCSection>

        <DCSection id="catalog" title="03 · Catàleg" subtitle="Pantalla principal post-login · 4 layouts. Click sobre un PKG → detall.">
          <DCArtboard id="grid"    label="A · Grid de cards" width={AB_W} height={AB_H}>
            <Screen render={CatalogA_Grid} t={t} />
          </DCArtboard>
          <DCArtboard id="table"   label="B · Taula densa" width={AB_W} height={AB_H}>
            <Screen render={CatalogB_Table} t={t} />
          </DCArtboard>
          <DCArtboard id="sidebar" label="C · Sidebar + llista" width={AB_W} height={AB_H}>
            <Screen render={CatalogC_Sidebar} t={t} />
          </DCArtboard>
          <DCArtboard id="hybrid"  label="D · Hybrid (featured + grid)" width={AB_W} height={AB_H}>
            <Screen render={CatalogD_Hybrid} t={t} />
          </DCArtboard>
        </DCSection>

        <DCSection id="admin" title="07 · Admin · cua de moderació" subtitle="Pas crític: revisió manual de cada contribució abans de publicar.">
          <DCArtboard id="queue" label="A · Cua + revisió detall" width={AB_W} height={AB_H}>
            <Screen render={ScreenAdminQueue} t={t} />
          </DCArtboard>
        </DCSection>

        <DCSection id="detail-old" title="04 · Detall PKG" subtitle="Vista d'un paquet · 3 composicions. La integritat (hash) és protagonista.">
          <DCArtboard id="hero"      label="A · Hero + sidebar specs" width={AB_W} height={AB_H}>
            <Screen render={DetailA_Hero} t={t} />
          </DCArtboard>
          <DCArtboard id="tabs"      label="B · Tabs (Info/Hash/…)" width={AB_W} height={AB_H}>
            <Screen render={DetailB_Tabs} t={t} />
          </DCArtboard>
          <DCArtboard id="dashboard" label="C · Dashboard cards" width={AB_W} height={AB_H}>
            <Screen render={DetailC_Dashboard} t={t} />
          </DCArtboard>
        </DCSection>

        <DCSection id="forum" title="05 · Fòrum" subtitle="Comunitat: scene news, jailbreak, troubleshoot. Llistat + fil + nou fil.">
          <DCArtboard id="list"   label="A · Llistat de fils" width={AB_W} height={AB_H}>
            <Screen render={ScreenForumList} t={t} />
          </DCArtboard>
          <DCArtboard id="thread" label="B · Vista de fil" width={AB_W} height={AB_H}>
            <Screen render={ScreenForumThread} t={t} />
          </DCArtboard>
          <DCArtboard id="new"    label="C · Nou fil (composer)" width={AB_W} height={AB_H}>
            <Screen render={ScreenForumNewThread} t={t} />
          </DCArtboard>
        </DCSection>

        <DCSection id="upload" title="06 · Contribuir PKG" subtitle="Quatre patrons · enviament a la cua de moderació admin.">
          <DCArtboard id="long"   label="A · Form llarg" width={AB_W} height={AB_H}>
            <Screen render={UploadA_LongForm} t={t} />
          </DCArtboard>
          <DCArtboard id="wizard" label="B · Wizard 3 passos" width={AB_W} height={AB_H}>
            <Screen render={UploadB_Wizard} t={t} />
          </DCArtboard>
          <DCArtboard id="drop"   label="C · Drop-zone gran" width={AB_W} height={AB_H}>
            <Screen render={UploadC_DropCentric} t={t} />
          </DCArtboard>
          <DCArtboard id="split"  label="D · Split drop+form" width={AB_W} height={AB_H}>
            <Screen render={UploadD_SplitDropForm} t={t} />
          </DCArtboard>
        </DCSection>

        <DCSection id="account" title="08 · Compte d'usuari" subtitle="Click avatar dalt-dreta → menu desplegable. Configuració completa.">
          <DCArtboard id="menu"     label="A · Avatar dropdown"  width={AB_W} height={AB_H}>
            <Screen render={ScreenAvatarMenu} t={t} />
          </DCArtboard>
          <DCArtboard id="settings" label="B · Configuració · Compte" width={AB_W} height={AB_H}>
            <Screen render={ScreenSettings} t={t} />
          </DCArtboard>
        </DCSection>

        <DCPostIt x={40} y={-10} rotate={-1.6}>
          PKGVault wireframes · v0.1<br/>català + tech EN<br/>16 artboards · click‑to‑flow
        </DCPostIt>
        <DCPostIt x={1700} y={-10} rotate={1.4}>
          obre Tweaks ↘ per provar:<br/>colors · annotations · clean/sketchy
        </DCPostIt>
      </DesignCanvas>

      <TweaksPanel>
        <TweakSection label="Direcció de color" />
        <TweakRadio label="Paleta" value={t.color}
          options={['neutral', 'brief', 'amber']}
          onChange={(v) => setTweak('color', v)} />
        <TweakToggle label="Aplicar fons fosc del brief" value={t.themed}
          onChange={(v) => setTweak('themed', v)} />
        <TweakSection label="Estil del wireframe" />
        <TweakToggle label="Sketchy (rotacions subtils)" value={t.sketchy}
          onChange={(v) => setTweak('sketchy', v)} />
        <TweakToggle label="Mostrar annotations" value={t.annotations}
          onChange={(v) => setTweak('annotations', v)} />
        <TweakSection label="Demo flow" />
        <TweakButton label="Anar a Login →" onClick={() => window.dcGoto && window.dcGoto('login/minimal')} />
        <TweakButton label="Anar a Catàleg →" onClick={() => window.dcGoto && window.dcGoto('catalog/grid')} />
        <TweakButton label="Anar a Detall →" onClick={() => window.dcGoto && window.dcGoto('detail/hero')} />
        <TweakButton label="Anar a Contribuir →" onClick={() => window.dcGoto && window.dcGoto('upload/long')} />
        <TweakButton label="Anar a Fòrum →" onClick={() => window.dcGoto && window.dcGoto('forum/list')} />
        <TweakButton label="Anar a Moderació →" onClick={() => window.dcGoto && window.dcGoto('admin/queue')} />
        <TweakButton label="Avatar dropdown →" onClick={() => window.dcGoto && window.dcGoto('account/menu')} />
        <TweakButton label="Configuració →" onClick={() => window.dcGoto && window.dcGoto('account/settings')} />
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
