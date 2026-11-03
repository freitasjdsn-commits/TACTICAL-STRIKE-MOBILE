(()=>{
"use strict";
const canvas=document.querySelector("#renderCanvas");
const engine=new BABYLON.Engine(canvas,false,{disableWebGL2Support:true, powerPreference:"low-power", stencil:false, preserveDrawingBuffer:false, adaptToDeviceRatio:true});
engine.setHardwareScalingLevel(1);
const scene=new BABYLON.Scene(engine);
scene.clearColor=new BABYLON.Color4(.34,.48,.56,1);
scene.fogMode=BABYLON.Scene.FOGMODE_EXP2;scene.fogDensity=.0014;scene.fogColor=new BABYLON.Color3(.34,.48,.56);
scene.imageProcessingConfiguration.toneMappingEnabled=true;
scene.imageProcessingConfiguration.exposure=1.12;
scene.imageProcessingConfiguration.contrast=1.18;
const camera=new BABYLON.FreeCamera("player",new BABYLON.Vector3(0,1.72,-13),scene);
scene.activeCamera=camera;
camera.fov=.88;camera.minZ=.06;camera.maxZ=180;camera.inputs.clear();
const hemi=new BABYLON.HemisphericLight("sky fill",new BABYLON.Vector3(0,1,0),scene);hemi.intensity=.82;hemi.groundColor=new BABYLON.Color3(.2,.23,.25);
const sun=new BABYLON.DirectionalLight("sun",new BABYLON.Vector3(-.5,-1,.4),scene);sun.position.set(-20,35,-20);sun.intensity=1.0;
const shadowGen=null;
function material(n,c,rough=48,metal=0){const m=new BABYLON.StandardMaterial(n,scene);m.diffuseColor=BABYLON.Color3.FromHexString(c);m.specularColor=new BABYLON.Color3(metal? .35:.12,metal?.35:.12,metal?.35:.12);m.specularPower=rough;return m}
const asphalt=material("worn asphalt","#39464d"),concrete=material("warm concrete","#858b89"),sand=material("sandstone","#a49a86"),shadow=material("deep shadow","#1b252c"),steel=material("painted steel","#465660"),edge=material("edge metal","#87949a"),glass=material("blue dark glass","#203b49",12,.3),red=material("enemy red armor","#a5233d"),redLight=material("red armor highlights","#ef4c63"),skin=material("skin","#c9967e"),uniform=material("navy uniform","#263746"),black=material("weapon black","#111a20",16,.45),rubber=material("rubber","#20272b"),plant=material("dry vegetation","#65734c"),leaf=material("olive leaf","#87905a"),purple=material("purple haze","#9a52df");
function box(n,x,y,z,w,h,d,m,parent){const o=BABYLON.MeshBuilder.CreateBox(n,{width:w,height:h,depth:d},scene);o.position.set(x,y,z);o.material=m;if(parent)o.parent=parent;return o}
function cylinder(n,x,y,z,h,d,m,parent){const o=BABYLON.MeshBuilder.CreateCylinder(n,{height:h,diameter:d,tessellation:10},scene);o.position.set(x,y,z);o.material=m;if(parent)o.parent=parent;return o}
function cast(o){return o}
const floor=box("asphalt training yard",0,-.4,0,100,.8,100,asphalt);floor.receiveShadows=true;
for(let i=-5;i<=5;i++){box("road lane dash",i*3.8,0,0,.045,.012,24,edge)}
function building(x,z,w,d,h,m){
 const b=cast(box("combat building",x,h/2,z,w,h,d,m));
 box("roof parapet",x,h+.12,z,w+.35,.24,d+.35,steel);
 for(let row=0;row<2;row++)for(let col=0;col<3;col++){
  const wx=x-w*.32+col*w*.32,wy=2.3+row*2.15;
  box("window frame",wx,wy,z-d/2-.045,1.65,1.35,.09,edge);
  box("dark armored window",wx,wy,z-d/2-.1,1.42,1.12,.045,glass);
  box("window divider",wx,wy,z-d/2-.14,.07,1.1,.05,steel);
 }
 box("service door",x-w*.22,1.25,z-d/2-.07,1.45,2.5,.13,shadow);
 box("door handle",x-w*.22+.48,1.25,z-d/2-.16,.07,.22,.05,edge);
 for(let i=0;i<Math.floor(w/3);i++)box("facade panel",x-w/2+1.5+i*3.0,.25,z-d/2-.08,.055,.5,.06,steel);
 return b;
}
building(-20,12,13,13,9,sand);building(20,13,14,13,10,concrete);
building(-21,-17,13,13,8,concrete);building(21,-17,14,13,9,sand);
building(0,33,22,10,7,concrete);
box("left flank wall",-19,1.5,5,3,3,14,concrete);box("left wall cap",-19,3.05,5,3.2,.12,14.2,edge);box("right flank wall",19,1.5,10,3,3,14,concrete);box("right wall cap",19,3.05,10,3.2,.12,14.2,edge);
for(let i=0;i<6;i++){
 const x=(i%2===0?-24:24),z=-2+Math.floor(i/2)*9;
 const c=box("reinforced supply crate",x,.85,z,2.2,1.7,2.1,steel);
 for(let s of [-1,1])box("crate corner",x+s*1.02,.86,z-1.07,.12,1.55,.08,edge);
 box("crate red marking",x,.9,z-1.08,.72,.28,.035,redLight);
 box("crate lid",x,1.73,z,2.24,.09,2.14,edge);
}
for(let i=0;i<5;i++){
 const x=-24+i*12;box("road barricade",x,.65,23,7,1.3,1.05,concrete);
 for(let k=-1;k<=1;k++)box("barricade reflective stripe",x+k*1.8,.68,22.45, .65,.75,.035,redLight);
}
for(let i=0;i<8;i++){
 const x=(i%6-2.5)*7,z=i<6?28:-29;
 const trunk=cylinder("yard tree trunk",x,1.1,z,2.2,.34,steel);
 const crown=BABYLON.MeshBuilder.CreateSphere("low foliage",{diameter:2.8,segments:7},scene);crown.position.set(x,2.5,z);crown.scaling.y=.78;crown.material=plant;
}
for(let i=0;i<9;i++){
 const x=-24+i*6;
 cylinder("security light post",x,3.1,-25,6.2,.12,steel);
 const lamp=box("security lamp",x,6.15,-25,.55,.16,.35,edge);
 const lm=material("lamp glow "+i,"#f7dba1");lm.emissiveColor=new BABYLON.Color3(.55,.4,.2);lamp.material=lm;
}
for(const p of [[-10,0,9],[11,0,12]])for(let j=0;j<12;j++){
 const s=BABYLON.MeshBuilder.CreateSphere("violet smoke cloud",{diameter:1.5+j*.13,segments:8},scene);
 s.position.set(p[0]+Math.sin(j*2)*.65,.5+j*.42,p[2]+Math.cos(j)*.45);s.material=purple;s.material.alpha=.16;s.material.disableLighting=true;
}

// Friendly operator at the left flank: blue tactical suit and pale hair.
const allyRoot=new BABYLON.TransformNode("friendly operator",scene);allyRoot.position.set(-5,0,-5);allyRoot.rotation.y=.35;
const allyBlue=material("ally blue tactical suit","#254e75"),allyLight=material("ally armor blue","#4d83ad"),hair=material("white silver hair","#e5e9ed"),visor=material("operator visor","#192b3b",12,.4);
const allyBody=cast(BABYLON.MeshBuilder.CreateCapsule("ally torso",{height:1.12,radius:.34},scene));allyBody.parent=allyRoot;allyBody.position.y=1.15;allyBody.material=allyBlue;
box("ally chest armor",0,1.25,-.25,.62,.55,.12,allyLight,allyRoot);
const allyHead=BABYLON.MeshBuilder.CreateSphere("ally head",{diameter:.43,segments:12},scene);allyHead.parent=allyRoot;allyHead.position.y=1.92;allyHead.material=skin;
const allyHair=BABYLON.MeshBuilder.CreateSphere("operator white hair",{diameter:.54,segments:12},scene);allyHair.parent=allyRoot;allyHair.position.y=2.08;allyHair.scaling.set(1.05,.58,1.05);allyHair.material=hair;
box("operator visor",0,1.98,-.25,.38,.12,.08,visor,allyRoot);
for(const side of [-1,1]){
 const a=BABYLON.MeshBuilder.CreateCapsule("ally arm",{height:.78,radius:.14},scene);a.parent=allyRoot;a.position.set(side*.46,1.2,0);a.rotation.z=side*.2;a.material=allyBlue;
 const l=BABYLON.MeshBuilder.CreateCapsule("ally leg",{height:.88,radius:.16},scene);l.parent=allyRoot;l.position.set(side*.19,.43,0);l.material=uniform;
 box("ally boot",side*.19,.12,-.1,.34,.22,.45,black,allyRoot);
}

const foliageMat=material("olive foliage detail","#4f6848");
const foliageLight=material("sunlit foliage","#82915c");
const barkMat=material("tree bark","#51483b");
function addShrub(x,z,scale=1){
 const root=new BABYLON.TransformNode("tactical shrub",scene);root.position.set(x,0,z);root.scaling.setAll(scale);
 for(let i=0;i<5;i++){
  const leafMesh=BABYLON.MeshBuilder.CreateSphere("shrub leaf",{diameter:1.05,segments:7},scene);
  leafMesh.parent=root;leafMesh.position.set(Math.cos(i*1.25)*.42,.48+(i%2)*.16,Math.sin(i*1.25)*.35);
  leafMesh.scaling.set(1,.72,.82);leafMesh.material=i%2?foliageMat:foliageLight;
 }
 const base=BABYLON.MeshBuilder.CreateCylinder("shrub base",{height:.28,diameter:.65,tessellation:7},scene);
 base.parent=root;base.position.y=.15;base.material=plant;
 return root;
}
function addFacadeDetails(x,z,w,d,h){
 for(let side of [-1,1]){
  const faceZ=z+side*(d/2+.07);
  for(let col=0;col<Math.max(2,Math.floor(w/4));col++){
   const px=x-w/2+2+col*4;
   box("vertical facade rib",px,h*.48,faceZ,.12,h*.92,.16,steel);
   box("window sill",px+.9,2.95,faceZ-side*.04,2.0,.12,.22,edge);
  }
  box("facade corner armor",x-w/2-.08,h/2,faceZ,.2,h,.2,edge);
  box("facade corner armor",x+w/2+.08,h/2,faceZ,.2,h,.2,edge);
 }
 box("roof ventilation unit",x,h+.42,z,.9,.55,.8,steel);
 box("roof access hatch",x+2,h+.28,z+1.4,1.2,.12,1.4,shadow);
}
[[-27,7,1.1],[-26,15,.85],[26,8,1.1],[27,17,.9],[-23,-10,.8],[24,-11,.9],[-12,29,.8],[13,29,.9]].forEach(v=>addShrub(v[0],v[1],v[2]));
[[-20,12,13,13,9], [20,13,14,13,10],[-21,-17,13,13,8],[21,-17,14,13,9],[0,33,22,10,7]].forEach(v=>addFacadeDetails(...v));
const muzzleMat=material("muzzle flash material","#ffd477");muzzleMat.emissiveColor=new BABYLON.Color3(1,.55,.12);
const bots=[];
function makeBot(x,z,i){
 const root=new BABYLON.TransformNode("hostile "+i,scene);root.position.set(x,0,z);
 const role=i%3;const roleMat=role===0?red:role===1?material("recon armor "+i,"#8b653d"):material("heavy armor "+i,"#713344");const trimMat=role===0?redLight:role===1?material("recon trim "+i,"#d2ad69"):material("heavy trim "+i,"#d05b68");
 const torso=cast(BABYLON.MeshBuilder.CreateCapsule("enemy body",{height:1.05,radius:role===2?.39:.34,tessellation:10},scene));torso.parent=root;torso.position.y=1.16;torso.material=roleMat;
 const vest=box("armored chest rig",0,1.2,-.025,.68,.62,.43,uniform,root);
 box("red chest plate",0,1.3,-.25,role===2?.58:.47,.4,.055,trimMat,root);
 box("enemy tactical belt",0,.82,-.02,.68,.16,.42,black,root);
 box("enemy shoulder armor left",-.49,1.48,-.015,role===2?.38:.3,.25,.38,roleMat,root);
 box("enemy shoulder armor right",.49,1.48,-.015,role===2?.38:.3,.25,.38,roleMat,root);
 box("enemy back radio pack",0,1.35,.27,.48,.58,.22,steel,root);
 box("enemy radio antenna",.18,1.83,.3,.035,role===1?.72:.48,.035,edge,root);
 box("enemy chest insignia",0,1.32,-.29,.13,.19,.035,edge,root);
 if(role===1){
  const goggles=box("recon tactical goggles",0,1.99,-.29,.42,.12,.08,material("recon lens "+i,"#65b6bd",12,.5),root);
  box("recon helmet side sensor",-.29,2.08,0,.13,.17,.2,edge,root);
  box("recon thigh utility pouch",-.27,.55,-.12,.2,.28,.16,trimMat,root);
 }else if(role===2){
  box("heavy chest reinforcement",0,1.18,-.31,.62,.24,.09,steel,root);
  box("heavy helmet brow",0,2.13,-.27,.48,.13,.12,black,root);
  box("heavy shoulder plate left",-.57,1.52,-.02,.4,.34,.42,trimMat,root);
  box("heavy shoulder plate right",.57,1.52,-.02,.4,.34,.42,trimMat,root);
  box("heavy back armor",0,1.35,.39,.58,.68,.22,roleMat,root);
 }else{
  box("assault helmet stripe",0,2.22,-.255,.09,.035,.025,edge,root);
  box("assault chest magazine",.12,1.42,-.3,.14,.22,.06,black,root);
 }
 box("ammo pouch left",-.24,1.0,-.25,.16,.22,.12,black,root);box("ammo pouch right",.24,1.0,-.25,.16,.22,.12,black,root);
 const head=cast(BABYLON.MeshBuilder.CreateSphere("enemy head",{diameter:.43,segments:12},scene));head.parent=root;head.position.y=1.91;head.material=skin;
 const helmet=BABYLON.MeshBuilder.CreateSphere("enemy helmet",{diameter:.55,segments:12},scene);helmet.parent=root;helmet.position.y=2.09;helmet.scaling.y=.48;helmet.material=trimMat;
 box("helmet visor",0,2.05,-.25,.38,.09,.07,black,root);
 const limbs=[];
 for(const side of [-1,1]){
  const arm=cast(BABYLON.MeshBuilder.CreateCapsule("enemy arm",{height:.78,radius:.14},scene));arm.parent=root;arm.position.set(side*.48,1.2,-.01);arm.rotation.z=side*.22;arm.material=role===1?roleMat:uniform;limbs.push(arm);
  const glove= BABYLON.MeshBuilder.CreateSphere("combat glove",{diameter:.29,segments:8},scene);glove.parent=root;glove.position.set(side*.51,.84,-.03);glove.material=black;
  const leg=cast(BABYLON.MeshBuilder.CreateCapsule("enemy leg",{height:.88,radius:.17},scene));leg.parent=root;leg.position.set(side*.2,.43,0);leg.material=role===2?roleMat:rubber;limbs.push(leg);
  box("enemy knee pad",side*.2,.43,-.19,role===2?.34:.29,role===2?.28:.22,.12,role===2?trimMat:red,root);
  box("enemy forearm guard",side*.48,1.05,-.13,role===2?.31:.25,role===2?.36:.3,.12,roleMat,root);
  if(role===1)box("recon wrist device",side*.48,.98,-.2,.22,.12,.08,edge,root);
  const boot=box("combat boot",side*.2,.12,-.11,.35,.22,.52,black,root);
  box("boot red stripe",side*.2,.13,-.38,.22,.055,.025,redLight,root);
 }
 const rifle=box("hostile rifle",.04,1.13,-.48,.15,.14,.82,black,root);rifle.rotation.x=.08;
 const barrel=box("hostile rifle barrel",.04,1.15,-.95,.055,.055,.32,edge,root);
 const muzzleGlow=box("enemy muzzle flash",.04,1.15,-1.16,.18,.18,.18,muzzleMat,root);muzzleGlow.isVisible=false;
 const alertLamp=box("enemy alert light",0,1.58,-.31,.1,.08,.035,trimMat,root);
 bots.push({root,body:torso,head,alive:true,phase:i,role,limbs,rifle,muzzleGlow,alertLamp,anchorX:x,anchorZ:z,patrolX:role===1?1.8:role===2?.75:1.15+(i%3)*.22,patrolZ:role===1?1.15:role===2?.55:.7+(i%2)*.25,decision:0,strafe:1,alert:0,attackCooldown:1.5+i*.23,walkPhase:0});
}
[[-9,13],[9,15],[-15,-3],[15,-4],[0,21],[-7,-19],[9,-19]].forEach((p,i)=>makeBot(p[0],p[1],i));
// Weapon is positioned in world space every frame, avoiding mobile camera-parent clipping.
const weapon=new BABYLON.TransformNode("first person rifle",scene);
function weaponBox(n,x,y,z,w,h,d,m){const o=BABYLON.MeshBuilder.CreateBox(n,{width:w,height:h,depth:d},scene);o.parent=weapon;o.position.set(x,y,z);o.material=m;o.isPickable=false;o.alwaysSelectAsActiveMesh=true;o.renderingGroupId=1;return o}
weaponBox("rifle main body",0,0,0,.24,.2,.78,black);
weaponBox("rifle red side rail",-.125,.015,.04,.025,.12,.54,redLight);
weaponBox("rifle upper rail",0,.12,.02,.2,.045,.68,edge);
weaponBox("rifle foregrip",0,-.015,.42,.2,.17,.42,steel);
weaponBox("rifle barrel",0,.005,.82,.075,.075,.5,black);
weaponBox("rifle muzzle",0,.005,1.08,.13,.13,.13,edge);
weaponBox("rifle stock",0,-.025,-.5,.2,.18,.42,uniform);
weaponBox("rifle magazine",0,-.22,.08,.16,.34,.2,black);
weaponBox("rifle optic base",0,.18,.02,.16,.06,.22,redLight);
weaponBox("rifle optic housing",0,.27,.02,.16,.13,.2,black);
weaponBox("rifle optic lens",0,.27,.13,.095,.085,.018,redLight);

const muzzle=weaponBox("muzzle flash",0,0,1.23,.26,.24,.1,muzzleMat);muzzle.isVisible=false;
let ammo=30,score=0,recoil=0,flashTimer=0,health=100,gameOver=false,damageFlash=0;
const ammoEl=document.querySelector("#ammo"),msg=document.querySelector("#message"),healthEl=document.querySelector("#health");
const damageOverlay=document.createElement("div");damageOverlay.id="damage-overlay";damageOverlay.style.cssText="position:fixed;inset:0;pointer-events:none;z-index:25;opacity:0;background:radial-gradient(ellipse at center,transparent 35%,rgba(255,20,45,.72) 100%);transition:opacity .08s";document.body.appendChild(damageOverlay);
function updateHealth(){healthEl.textContent="♥ "+health;healthEl.style.color=health<=30?"#ff536b":health<=60?"#ffd477":"#8df0b0";}
function damagePlayer(amount){if(gameOver)return;health=Math.max(0,health-amount);updateHealth();damageFlash=.22;damageOverlay.style.opacity=".9";msg.textContent="VOCÊ FOI ATINGIDO • -"+amount+" HP";if(health<=0){gameOver=true;msg.textContent="DERROTA — VOCÊ FOI ELIMINADO";damageOverlay.style.opacity="1";}}
const tracerMat=material("enemy tracer material","#ff765f");tracerMat.emissiveColor=new BABYLON.Color3(1,.16,.08);
const enemyTracers=[];
function enemyShot(b){const start=b.root.position.add(new BABYLON.Vector3(0,1.18,0));const target=camera.position.add(new BABYLON.Vector3(0,-.35,0));const delta=target.subtract(start);const length=delta.length();const beam=BABYLON.MeshBuilder.CreateCylinder("enemy tracer",{height:length,diameter:.035,tessellation:6},scene);beam.material=tracerMat;beam.position=start.add(target).scale(.5);beam.rotationQuaternion=BABYLON.Quaternion.FromUnitVectorsToRef?BABYLON.Quaternion.FromUnitVectorsToRef(BABYLON.Axis.Y,delta.normalize(),BABYLON.Quaternion.Identity()):null;if(!beam.rotationQuaternion){beam.lookAt(target);beam.rotation.x+=Math.PI/2;}enemyTracers.push({mesh:beam,life:.12});b.muzzleGlow.isVisible=true;b.alert=.35;}
function updateHud(){ammoEl.textContent=ammo+" / 90"}
function fire(){
 if(gameOver){msg.textContent="DERROTA — RECARREGUE A PÁGINA PARA JOGAR NOVAMENTE";return}
 if(ammo<=0){msg.textContent="SEM MUNIÇÃO — RECARREGUE";return}
 ammo--;updateHud();recoil=.13;muzzle.isVisible=true;flashTimer=.075;
 const ray=camera.getForwardRay(100);
 const hit=scene.pickWithRay(ray,m=>m.name==="enemy body"||m.name==="enemy head");
 if(hit.hit){
  const bot=bots.find(b=>b.alive&&(b.body===hit.pickedMesh||b.head===hit.pickedMesh));
  if(bot){bot.alive=false;bot.root.setEnabled(false);score++;msg.textContent=score===bots.length?"ÁREA LIMPA — VITÓRIA":"ALVO ELIMINADO • "+score+"/"+bots.length}
 }else msg.textContent="DISPARO";
}
document.querySelector("#fire").onpointerdown=e=>{e.preventDefault();fire()};
document.querySelector("#reload").onpointerdown=e=>{e.preventDefault();ammo=30;updateHud();msg.textContent="RECARREGADO"};
let jumpOffset=0,jumpTime=0;
document.querySelector("#jump").onpointerdown=e=>{e.preventDefault();if(jumpTime<=0)jumpTime=.48};
let move={x:0,y:0},joy=document.querySelector("#joystick"),stick=document.querySelector("#stick"),jid=null;
function joyMove(ev){const r=joy.getBoundingClientRect();let x=ev.clientX-r.left-r.width/2,y=ev.clientY-r.top-r.height/2,k=Math.min(1,44/(Math.hypot(x,y)||1));x*=k;y*=k;move={x:x/44,y:y/44};stick.style.transform="translate("+x+"px,"+y+"px)"}
joy.onpointerdown=e=>{jid=e.pointerId;joy.setPointerCapture(jid);joyMove(e)};
joy.onpointermove=e=>{if(e.pointerId===jid)joyMove(e)};
function stopJoy(e){if(e.pointerId===jid){jid=null;move={x:0,y:0};stick.style.transform="translate(0,0)"}}
joy.onpointerup=stopJoy;joy.onpointercancel=stopJoy;
let yaw=0,pitch=0,lid=null,lx=0,ly=0;
canvas.onpointerdown=e=>{if(e.clientX<innerWidth*.38&&e.clientY>innerHeight*.55)return;lid=e.pointerId;lx=e.clientX;ly=e.clientY;canvas.setPointerCapture(lid)};
canvas.onpointermove=e=>{if(e.pointerId!==lid)return;const dx=e.clientX-lx,dy=e.clientY-ly;lx=e.clientX;ly=e.clientY;yaw+=dx*.004;pitch=Math.max(-.9,Math.min(.9,pitch+dy*.003));camera.rotation.set(pitch,yaw,0)};
canvas.onpointerup=e=>{if(e.pointerId===lid)lid=null};canvas.onpointercancel=canvas.onpointerup;
scene.onBeforeRenderObservable.add(()=>{
 const dt=Math.min(.05,engine.getDeltaTime()/1000),forward=new BABYLON.Vector3(Math.sin(yaw),0,Math.cos(yaw)),right=new BABYLON.Vector3(forward.z,0,-forward.x);
 camera.position.addInPlace(forward.scale(-move.y*5.4*dt));camera.position.addInPlace(right.scale(move.x*5.4*dt));
 camera.position.x=Math.max(-31,Math.min(31,camera.position.x));camera.position.z=Math.max(-31,Math.min(31,camera.position.z));
 if(jumpTime>0){jumpTime-=dt;jumpOffset=Math.sin((.48-jumpTime)/.48*Math.PI)*.72}else jumpOffset=0;
 camera.position.y=1.72+jumpOffset;
 recoil=Math.max(0,recoil-dt*.5);
 const fwd=camera.getDirection(BABYLON.Axis.Z),weaponRight=camera.getDirection(BABYLON.Axis.X),up=camera.getDirection(BABYLON.Axis.Y);
 weapon.position.copyFrom(camera.position.add(weaponRight.scale(.43)).add(up.scale(-.39-recoil)).add(fwd.scale(.95)));
 weapon.rotation.copyFrom(camera.rotation);weapon.rotation.x+=recoil*.45;weapon.setEnabled(true);
 if(flashTimer>0){flashTimer-=dt;if(flashTimer<=0)muzzle.isVisible=false}
 if(damageFlash>0){damageFlash-=dt;if(damageFlash<=0&&!gameOver)damageOverlay.style.opacity="0"}
 bots.forEach(b=>{if(b.alive){b.phase+=dt*(b.role===1?1.45:b.role===2?.72:1.05);b.decision-=dt;if(b.decision<=0){b.decision=1.2+Math.random()*2.2;b.strafe=Math.random()<.5?-1:1;}const stride=b.phase*(b.role===1?1.55:b.role===2?.8:1.15);const dx=camera.position.x-b.root.position.x,dz=camera.position.z-b.root.position.z,dist=Math.hypot(dx,dz);let combatStrafe=0;if(dist<10&&dist>3)combatStrafe=Math.sin(b.phase*1.7)*b.strafe*(b.role===1?1.15:.55);const pace=b.role===2?.45:b.role===1?1.25:.8;b.root.position.x=b.anchorX+Math.sin(stride)*b.patrolX+combatStrafe;b.root.position.z=b.anchorZ+Math.cos(stride*.72)*b.patrolZ;if(b.role===2&&dist<8){b.root.position.x-=dx/(dist||1)*dt*.55;b.root.position.z-=dz/(dist||1)*dt*.55;}b.root.rotation.y=Math.atan2(dx,dz);const step=Math.sin(stride*2.2)*.34*pace;b.limbs[0].rotation.x=step;b.limbs[2].rotation.x=-step;b.limbs[1].rotation.x=-step*.8;b.limbs[3].rotation.x=step*.8;
 b.attackCooldown-=dt;b.alert=Math.max(0,b.alert-dt);b.muzzleGlow.isVisible=b.alert>0;b.alertLamp.scaling.y=1+(b.alert>0?.5:0);if(dist<18&&dist>2.4&&b.attackCooldown<=0){b.attackCooldown=b.role===1?1.35:b.role===2?2.5:1.9;enemyShot(b);damagePlayer(b.role===1?7:b.role===2?13:10);}
 }});
 enemyTracers.forEach(t=>{t.life-=dt;if(t.life<=0){t.mesh.dispose();} });for(let i=enemyTracers.length-1;i>=0;i--)if(enemyTracers[i].life<=0)enemyTracers.splice(i,1);
});
engine.runRenderLoop(()=>{try{scene.render()}catch(err){console.error(err);const m=document.querySelector("#message");if(m)m.textContent="ERRO AO RENDERIZAR: "+err.message;engine.stopRenderLoop()}});
window.addEventListener("resize",()=>{engine.resize();engine.setSize(canvas.clientWidth,canvas.clientHeight)});
document.addEventListener("contextmenu",e=>e.preventDefault());updateHud();updateHealth();
})();