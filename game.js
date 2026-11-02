(()=>{
"use strict";
const canvas=document.querySelector("#renderCanvas");
const engine=new BABYLON.Engine(canvas,true,{antialias:true, stencil:true, adaptToDeviceRatio:true});
engine.setHardwareScalingLevel(1);
const scene=new BABYLON.Scene(engine);
scene.clearColor=new BABYLON.Color4(.34,.48,.56,1);
scene.fogMode=BABYLON.Scene.FOGMODE_EXP2;scene.fogDensity=.0014;scene.fogColor=new BABYLON.Color3(.34,.48,.56);
scene.imageProcessingConfiguration.toneMappingEnabled=true;
scene.imageProcessingConfiguration.exposure=1.12;
scene.imageProcessingConfiguration.contrast=1.18;
const camera=new BABYLON.FreeCamera("player",new BABYLON.Vector3(0,1.72,-13),scene);
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
const bots=[];
function makeBot(x,z,i){
 const root=new BABYLON.TransformNode("hostile "+i,scene);root.position.set(x,0,z);
 const torso=cast(BABYLON.MeshBuilder.CreateCapsule("enemy body",{height:1.05,radius:.34,tessellation:10},scene));torso.parent=root;torso.position.y=1.16;torso.material=red;
 const vest=box("armored chest rig",0,1.2,-.025,.68,.62,.43,uniform,root);
 box("red chest plate",0,1.3,-.25,.47,.4,.055,redLight,root);
 box("ammo pouch left",-.24,1.0,-.25,.16,.22,.12,black,root);box("ammo pouch right",.24,1.0,-.25,.16,.22,.12,black,root);
 const head=cast(BABYLON.MeshBuilder.CreateSphere("enemy head",{diameter:.43,segments:12},scene));head.parent=root;head.position.y=1.91;head.material=skin;
 const helmet=BABYLON.MeshBuilder.CreateSphere("enemy helmet",{diameter:.55,segments:12},scene);helmet.parent=root;helmet.position.y=2.09;helmet.scaling.y=.48;helmet.material=redLight;
 box("helmet visor",0,2.05,-.25,.38,.09,.07,black,root);
 const limbs=[];
 for(const side of [-1,1]){
  const arm=cast(BABYLON.MeshBuilder.CreateCapsule("enemy arm",{height:.78,radius:.14},scene));arm.parent=root;arm.position.set(side*.48,1.2,-.01);arm.rotation.z=side*.22;arm.material=uniform;limbs.push(arm);
  const glove= BABYLON.MeshBuilder.CreateSphere("combat glove",{diameter:.29,segments:8},scene);glove.parent=root;glove.position.set(side*.51,.84,-.03);glove.material=black;
  const leg=cast(BABYLON.MeshBuilder.CreateCapsule("enemy leg",{height:.88,radius:.17},scene));leg.parent=root;leg.position.set(side*.2,.43,0);leg.material=rubber;limbs.push(leg);
  const boot=box("combat boot",side*.2,.12,-.11,.35,.22,.52,black,root);
 }
 const rifle=box("hostile rifle",.04,1.13,-.48,.15,.14,.82,black,root);rifle.rotation.x=.08;
 const barrel=box("hostile rifle barrel",.04,1.15,-.95,.055,.055,.32,edge,root);
 bots.push({root,body:torso,head,alive:true,phase:i,limbs});
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
const muzzleMat=material("muzzle flash material","#ffd477");muzzleMat.emissiveColor=new BABYLON.Color3(1,.55,.12);
const muzzle=weaponBox("muzzle flash",0,0,1.23,.26,.24,.1,muzzleMat);muzzle.isVisible=false;
let ammo=30,score=0,recoil=0,flashTimer=0;
const ammoEl=document.querySelector("#ammo"),msg=document.querySelector("#message");
function updateHud(){ammoEl.textContent=ammo+" / 90"}
function fire(){
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
 bots.forEach(b=>{if(b.alive){b.phase+=dt;b.root.position.x+=Math.sin(b.phase*1.3)*dt*.1;b.root.rotation.y=Math.atan2(camera.position.x-b.root.position.x,camera.position.z-b.root.position.z);b.limbs[0].rotation.x=Math.sin(b.phase*2)*.08;b.limbs[2].rotation.x=Math.sin(b.phase*2+.5)*.08}});
});
engine.runRenderLoop(()=>{try{scene.render()}catch(err){console.error(err);const m=document.querySelector("#message");if(m)m.textContent="ERRO AO RENDERIZAR: "+err.message;engine.stopRenderLoop()}});
window.addEventListener("resize",()=>{engine.resize();engine.setSize(canvas.clientWidth,canvas.clientHeight)});
document.addEventListener("contextmenu",e=>e.preventDefault());updateHud();
})();