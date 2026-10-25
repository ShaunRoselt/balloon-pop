/* Standard gamepad controls work with Steam Input's Gamepad template and browsers. */
(()=>{
 let active=false,previous=[],heldDirection='',repeatAt=0,padIndex=null;
 const game=document.querySelector('#game'),modal=document.querySelector('#modal');
 const visible=el=>!el.disabled&&!el.closest('[hidden],[inert]')&&el.getClientRects().length>0;
 const controls=()=>Array.from((modal.hidden?game:modal).querySelectorAll('button,input[type=range],select,[tabindex="0"]')).filter(visible);
 function focus(el){if(!el)return;document.querySelectorAll('.controller-focus').forEach(n=>n.classList.remove('controller-focus'));el.classList.add('controller-focus');el.focus({preventScroll:true});el.scrollIntoView({block:'nearest',inline:'nearest'});}
 function current(){const list=controls();return list.includes(document.activeElement)?document.activeElement:null}
 function ensure(){if(!current()){const list=controls();focus(modal.hidden?(list.find(el=>el.matches('.balloon,.play,.mode'))||list[0]):(list.find(el=>!el.matches('.close'))||list[0]))}}
 function stepValue(el,direction){if(el.matches('input[type=range]')){const min=Number(el.min)||0,max=Number(el.max)||100;el.value=Math.max(min,Math.min(max,+el.value+direction*5));el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));return true}if(el.matches('select')){el.selectedIndex=Math.max(0,Math.min(el.options.length-1,el.selectedIndex+direction));el.dispatchEvent(new Event('change',{bubbles:true}));return true}return false}
 function move(direction){active=true;game.classList.add('controller-active');ensure();const el=current();if(!el)return;if((direction==='left'||direction==='right')&&stepValue(el,direction==='left'?-1:1))return;const r=el.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;let best,score=Infinity;for(const n of controls()){if(n===el)continue;const b=n.getBoundingClientRect(),dx=b.left+b.width/2-x,dy=b.top+b.height/2-y,forward=direction==='left'?-dx:direction==='right'?dx:direction==='up'?-dy:dy,side=Math.abs(direction==='left'||direction==='right'?dy:dx);if(forward<=2)continue;const cost=forward+side*2;if(cost<score){score=cost;best=n}}if(best)focus(best)}
 function action(name){active=true;game.classList.add('controller-active');if(game.dataset.paused==='true')return;if(name==='back'){if(!modal.hidden)(modal.querySelector('.close')||modal.querySelector('#keep-playing'))?.click();else if(game.dataset.screen==='play'||game.dataset.screen==='modes')document.querySelector('#home').click();else if(game.dataset.screen==='home')document.querySelector('#exit').click();return}if(name==='settings'){if(modal.hidden)document.querySelector('#settings').click();return}ensure();const el=current();if(name==='accept'&&el){if(el.matches('select'))return;el.click()}}
 window.balloonDesktop?.getSteamEnvironment?.().then(info=>{game.dataset.steamDeck=String(info.steamDeck===true)}).catch(()=>{});
 const help=document.createElement('div');help.className='controller-help';help.textContent='D-pad / stick: move · Bottom button: select / pop · Right button: back · Left/right: adjust · Menu: settings';game.append(help);
 function tick(now){
  const pads=Array.from(navigator.getGamepads?.()||[]),pad=pads.find(p=>p&&p.mapping==='standard');
  if(pad&&document.hasFocus()&&!document.hidden&&game.dataset.paused!=='true'){
   const pressed=pad.buttons.map(b=>b.pressed);if(padIndex!==pad.index){previous=pressed.slice();padIndex=pad.index}
   const dir=pressed[12]?'up':pressed[13]?'down':pressed[14]?'left':pressed[15]?'right':Math.abs(pad.axes[0]||0)>.55?((pad.axes[0]||0)<0?'left':'right'):Math.abs(pad.axes[1]||0)>.55?((pad.axes[1]||0)<0?'up':'down'):'';
   if(dir&&(dir!==heldDirection||now>=repeatAt)){move(dir);repeatAt=now+(dir!==heldDirection?350:140)}heldDirection=dir;
   for(const [index,name]of [[0,'accept'],[1,'back'],[9,'settings']])if(pressed[index]&&!previous[index])action(name);
   previous=pressed;if(active)ensure();
  }else{previous=[];padIndex=null;heldDirection=''}requestAnimationFrame(tick)
 }
 document.addEventListener('keydown',e=>{if(e.altKey||e.ctrlKey||e.metaKey)return;const direction={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right'}[e.key];if(direction){e.preventDefault();move(direction)}else if(e.key==='Escape'){e.preventDefault();action('back')}});
 document.addEventListener('pointerdown',()=>{active=false;game.classList.remove('controller-active');document.querySelectorAll('.controller-focus').forEach(el=>el.classList.remove('controller-focus'))},{capture:true});
 window.balloonController={move,action};requestAnimationFrame(tick);
})();
