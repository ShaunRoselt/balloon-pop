/* Desktop persistence initializes before game scripts; the browser remains local-only. */
(()=>{const desktop=window.balloonDesktop;if(!desktop?.loadSave)return;let bootstrap;try{bootstrap=desktop.loadSave()}catch{return}const keys=['balloon-settings','balloon-achievements'];const account=bootstrap.account||'local';const marker='balloon-active-account';let previous;try{previous=localStorage.getItem(marker)}catch{}
 // Import old v0.3 saves only once, never from another Steam user's browser profile.
 if(bootstrap.hasSave||previous&&previous!==account){for(const [i,value]of [bootstrap.settings,bootstrap.progress].entries())try{value?localStorage.setItem(keys[i],JSON.stringify(value)):localStorage.removeItem(keys[i])}catch{}}
 try{localStorage.setItem(marker,account)}catch{}
 const send=(kind,value)=>desktop.save(kind,value).catch(()=>{});
 window.balloonSteam={language:bootstrap.language,saveSettings:value=>send('settings',value),saveProgress:value=>send('progress',value),setMode:mode=>desktop.setPresence(mode).catch(()=>{})};
 desktop.onSaveUpdate?.(snapshot=>{if(snapshot.settings&&window.balloonApplySettings)window.balloonApplySettings(snapshot.settings);if(snapshot.progress)window.balloonAchievements?.restore(snapshot.progress)});
 // Flush localStorage when leaving, including a migration from the earlier desktop build.
 const checkpoint=()=>{for(const [i,kind]of ['settings','progress'].entries())try{const value=JSON.parse(localStorage.getItem(keys[i]));if(value)send(kind,value)}catch{}};
 addEventListener('pagehide',checkpoint);checkpoint();
})();
