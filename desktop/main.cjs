const {app,BrowserWindow,ipcMain,powerMonitor}=require('electron');
const path=require('node:path');
const config=require('./steam.json');
const allowed=new Set(config.achievements);
let steam=null,win,steamworks=null,store,steamAccount='local',steamReconnect;
const {SaveStore}=require('./save-store.cjs');
const languageMap={english:'en-US',german:'de-DE',french:'fr-FR',spanish:'es-ES',latam:'es-ES',italian:'it-IT',portuguese:'pt-PT',brazilian:'pt-BR',russian:'ru-RU',swedish:'sv-SE',dutch:'nl-NL',indonesian:'id-ID',arabic:'ar-SA',schinese:'zh-CN',japanese:'ja-JP',koreana:'ko-KR',turkish:'tr-TR',polish:'pl-PL',danish:'da-DK',norwegian:'nb-NO',finnish:'fi-FI',greek:'el-GR',hindi:'hi-IN',ukrainian:'uk-UA',romanian:'ro-RO',czech:'cs-CZ',hebrew:'he-IL',thai:'th-TH',malay:'ms-MY',croatian:'hr-HR'};
function steamUnlocks(){if(!steam||!store)return;for(const id of allowed){try{if(steam.achievement.isActivated(id)&&!store.data.unlocked.includes(id))store.data.unlocked.push(id)}catch{}}}
function syncSteam(){if(!steam||!store)return;try{const p=store.snapshot().progress;for(const [name,value]of [['total_pops',p.pops],['active_play_seconds',Math.floor(p.activeSeconds)],['modes_tried',p.modes.length]])steam.stats.setInt(name,Math.min(2147483647,Math.max(steam.stats.getInt(name)||0,value)));steam.stats.store()}catch{}for(const id of store.data.unlocked){try{if(!steam.achievement.isActivated(id))steam.achievement.activate(id)}catch{}}}
function updateSave(){if(!store)return;store.refresh();steamUnlocks();syncSteam();const snapshot=store.rebase();if(win&&!win.isDestroyed())win.webContents.send('save:updated',snapshot);store.flush()}
const steamId=Number(process.env.STEAM_APP_ID||process.env.SteamAppId||config.appId);
if(Number.isInteger(steamId)&&steamId>0){try{steamworks=require('steamworks.js');steamworks.electronEnableSteamOverlay()}catch(e){console.warn('Steam overlay unavailable:',e.message)}}
app.whenReady().then(()=>{
 const id=steamId;
 if(Number.isInteger(id)&&id>0){try{steam=(steamworks||require('steamworks.js')).init(id)}catch(e){console.warn('Steam unavailable:',e.message)}}
 try{const id=String(steam?.localplayer.getSteamId().steamId64);if(/^\d+$/.test(id))steamAccount=id}catch{}
 store=new SaveStore({directory:path.join(app.getPath('userData'),'saves'),account:steamAccount,cloud:steam?.cloud,allowed});steamUnlocks();syncSteam();
 try{steamReconnect=steam?.callback.register(1,updateSave)}catch{}
 setInterval(()=>{store.flush();syncSteam()},15000).unref();
 win=new BrowserWindow({fullscreen:true,icon:path.join(__dirname,'web/assets/icon-512.png'),autoHideMenuBar:true,webPreferences:{preload:path.join(__dirname,'preload.cjs'),contextIsolation:true,nodeIntegration:false,sandbox:true}});
 win.webContents.setWindowOpenHandler(()=>({action:'deny'}));
 win.webContents.on('will-navigate',(event,url)=>{if(!url.startsWith('file://'))event.preventDefault()});
 const pause=value=>{if(!win.isDestroyed())win.webContents.send('game:pause',value)};
 win.on('blur',()=>pause(true));win.on('focus',()=>pause(false));
 powerMonitor.on('suspend',()=>{pause(true);store.flush()});powerMonitor.on('resume',()=>{updateSave();pause(!win.isFocused())});
 win.loadFile(path.join(__dirname,'web/index.html'));
});
ipcMain.handle('achievements:sync',(event,ids)=>{
 if(event.sender!==win?.webContents||!Array.isArray(ids))return {connected:false};
 const valid=ids.filter(id=>allowed.has(id));
 if(!steam)return {connected:false};
 const results=valid.map(id=>{try{return {id,success:!!steam.achievement.activate(id)}}catch{return {id,success:false}}});
 return {connected:true,results};
});
app.on('before-quit',()=>{store?.flush();try{steam?.localplayer.setRichPresence('status',undefined);steam?.localplayer.setRichPresence('steam_display',undefined);steamReconnect?.disconnect()}catch{}});
app.on('window-all-closed',()=>app.quit());

ipcMain.on('game:quit',event=>{if(event.sender===win?.webContents)app.quit()});

ipcMain.handle('voice:read',async(event,lang)=>{
 if(event.sender!==win?.webContents||typeof lang!=='string'||!/^[a-z]{2}-[A-Z]{2}$/.test(lang))throw Error('Invalid voice request');
 const voices=require('./web/voice-manifest.json');if(!Object.hasOwn(voices,lang))throw Error('Unknown voice');
 const bytes=await require('node:fs/promises').readFile(path.join(__dirname,'web/assets/voices',lang+'.mp3'));
 return new Uint8Array(bytes);
});

ipcMain.handle('steam:environment',event=>{if(event.sender!==win?.webContents)return {connected:false,steamDeck:false};try{return {connected:!!steam,steamDeck:!!steam?.utils.isSteamRunningOnSteamDeck()}}catch{return {connected:!!steam,steamDeck:false}}});

ipcMain.on('save:load',(event)=>{if(event.sender!==win?.webContents){event.returnValue=null;return}let language;try{language=languageMap[steam?.apps.currentGameLanguage()]}catch{}event.returnValue={...store.snapshot(),account:steamAccount,language}});
ipcMain.handle('save:write',(event,kind,value)=>{if(event.sender!==win?.webContents||!value||typeof value!=='object'||JSON.stringify(value).length>1024*1024)throw Error('Invalid save request');if(kind==='settings')store.saveSettings(value);else if(kind==='progress')store.saveProgress(value);else throw Error('Unknown save kind');return {saved:true}});
ipcMain.handle('steam:presence',(event,mode)=>{if(event.sender!==win?.webContents||!['home','modes','Normal','A–Z','1–20','Colors','Shapes'].includes(mode))return false;try{const menu=mode==='home'||mode==='modes';steam?.localplayer.setRichPresence('status',menu?'Choosing a balloon game':'Playing '+mode);steam?.localplayer.setRichPresence('mode',menu?'':mode);steam?.localplayer.setRichPresence('steam_display',menu?'#StatusMenu':'#StatusPlaying');return !!steam}catch{return false}});
