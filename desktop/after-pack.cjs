// Put the Steam redistributable beside the executable, as required by steamworks.js.
const fs=require('node:fs/promises'),path=require('node:path');
module.exports=async context=>{
 const platform=context.electronPlatformName;
 const spec={linux:['linux64','libsteam_api.so'],win32:['win64','steam_api64.dll'],darwin:['osx','libsteam_api.dylib']}[platform];
 if(!spec)throw Error('No Steam redistributable configured for '+platform);
 const source=path.join(path.dirname(require.resolve('steamworks.js/package.json')),'dist',...spec);
 const target=platform==='darwin'?path.join(context.appOutDir,context.packager.appInfo.productFilename+'.app','Contents','MacOS'):context.appOutDir;
 await fs.copyFile(source,path.join(target,spec[1]));
};
