const {app,BrowserWindow,ipcMain}=require('electron');
const path=require('node:path');
const config=require('./steam.json');
const allowed=new Set(config.achievements);
let steam=null,win;
app.whenReady().then(()=>{
 const id=Number(process.env.STEAM_APP_ID||config.appId);
 if(Number.isInteger(id)&&id>0){try{steam=require('steamworks.js').init(id)}catch(e){console.warn('Steam unavailable:',e.message)}}
 win=new BrowserWindow({fullscreen:true,autoHideMenuBar:true,webPreferences:{preload:path.join(__dirname,'preload.cjs'),contextIsolation:true,nodeIntegration:false,sandbox:true}});
 win.webContents.setWindowOpenHandler(()=>({action:'deny'}));
 win.webContents.on('will-navigate',(event,url)=>{if(!url.startsWith('file://'))event.preventDefault()});
 win.loadFile(path.join(__dirname,'web/index.html'));
});
ipcMain.handle('achievements:sync',(event,ids)=>{
 if(event.sender!==win?.webContents||!Array.isArray(ids))return {connected:false};
 const valid=ids.filter(id=>allowed.has(id));
 if(!steam)return {connected:false};
 const results=valid.map(id=>{try{return {id,success:!!steam.achievement.activate(id)}}catch{return {id,success:false}}});
 return {connected:true,results};
});
app.on('window-all-closed',()=>app.quit());

ipcMain.on('game:quit',event=>{if(event.sender===win?.webContents)app.quit()});
