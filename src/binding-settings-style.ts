/** Scoped styles ship inside the client bundle; no separate CSS asset or Maintenance theme. */
export const bridgeSettingsStyles = `
.dsh-bridge-settings { container-type:inline-size; container-name:bridge-settings; min-width:0; width:100%; box-sizing:border-box; font-family:var(--dsw-font-family,system-ui,sans-serif); font-size:14px; line-height:1.5; color:inherit; }
.dsh-bridge-settings *, .dsh-bridge-settings *::before, .dsh-bridge-settings *::after { box-sizing:border-box; }
.dsh-bridge-settings h3, .dsh-bridge-settings h4, .dsh-bridge-settings p { margin:0; }
.dsh-bridge-settings__heading h3 { font-size:17px; font-weight:600; line-height:1.4; margin-bottom:8px; }
.dsh-bridge-settings__heading p, .dsh-bridge-settings__note, .dsh-bridge-settings__hint, .dsh-bridge-settings__cli p, .dsh-bridge-settings__details { color:color-mix(in srgb,currentColor 66%,transparent); font-size:13px; }
.dsh-bridge-settings__heading { margin-bottom:26px; }
.dsh-bridge-settings__toolbar, .dsh-bridge-settings__row, .dsh-bridge-settings__cli { display:flex; align-items:center; justify-content:space-between; gap:14px; flex-wrap:wrap; }
.dsh-bridge-settings__toolbar { margin-bottom:12px; }
.dsh-bridge-settings__toolbar h4 { font-size:14px; font-weight:600; }
.dsh-bridge-settings__count { margin-left:6px; font-weight:400; opacity:.55; }
.dsh-bridge-settings__button { appearance:none; font:inherit; font-size:13px; line-height:20px; min-height:34px; padding:6px 12px; border:1px solid color-mix(in srgb,currentColor 12%,transparent); border-radius:9px; background:color-mix(in srgb,currentColor 4%,transparent); color:inherit; cursor:pointer; flex-shrink:0; transition:background .15s; }
.dsh-bridge-settings__button:hover:not(:disabled) { background:color-mix(in srgb,currentColor 9%,transparent); }
.dsh-bridge-settings__button:focus-visible, .dsh-bridge-settings summary:focus-visible { outline:2px solid currentColor; outline-offset:3px; }
.dsh-bridge-settings__button:disabled { opacity:.45; cursor:wait; }
.dsh-bridge-settings__list { margin:0; padding:0; list-style:none; border:1px solid color-mix(in srgb,currentColor 12%,transparent); border-radius:12px; overflow:hidden; }
.dsh-bridge-settings__vault { padding:16px; margin:0; }
.dsh-bridge-settings__vault + .dsh-bridge-settings__vault { border-top:1px solid color-mix(in srgb,currentColor 10%,transparent); }
.dsh-bridge-settings__identity { display:flex; align-items:center; flex-wrap:wrap; gap:8px; min-width:0; flex:1; }
.dsh-bridge-settings__identity strong { font-weight:600; overflow-wrap:anywhere; }
.dsh-bridge-settings__badge { display:inline-flex; align-items:center; gap:5px; font-size:12px; line-height:20px; border-radius:6px; padding:1px 7px; background:color-mix(in srgb,currentColor 6%,transparent); color:inherit; font-weight:400; }
.dsh-bridge-settings__badge[data-connected=true]::before { content:''; width:5px; height:5px; border-radius:50%; background:currentColor; }
.dsh-bridge-settings__hint { margin-top:10px !important; }
.dsh-bridge-settings__details { margin-top:10px; }
.dsh-bridge-settings__details summary { cursor:pointer; width:fit-content; }
.dsh-bridge-settings__details dl { margin:8px 0 0; display:grid; grid-template-columns:70px minmax(0,1fr); gap:5px 10px; font-size:12px; }
.dsh-bridge-settings__details dt, .dsh-bridge-settings__details dd { margin:0; overflow-wrap:anywhere; }
.dsh-bridge-settings__note { margin-top:12px !important; }
.dsh-bridge-settings__cli { border-top:1px solid color-mix(in srgb,currentColor 10%,transparent); margin-top:24px; padding-top:18px; }
.dsh-bridge-settings__cli strong { font-weight:500; }
.dsh-bridge-settings__cli p { margin-top:4px; }
.dsh-bridge-settings__empty { padding:20px 16px; border:1px dashed color-mix(in srgb,currentColor 18%,transparent); border-radius:12px; }
.dsh-bridge-settings__empty p { margin-top:6px; font-size:13px; opacity:.7; }
.dsh-bridge-settings__feedback { display:block; margin-top:16px; padding:10px 12px; border-radius:8px; background:color-mix(in srgb,currentColor 6%,transparent); overflow-wrap:anywhere; }
@container bridge-settings (max-width:360px) { .dsh-bridge-settings__vault { padding:12px; } .dsh-bridge-settings__row { align-items:flex-start; } .dsh-bridge-settings__identity { flex-basis:100%; } }
`;
