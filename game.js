(()=> {
const canvas=document.querySelector("#renderCanvas"),engine=new BABYLON.Engine(canvas,true,{antialias:true}),scene=new BABYLON.Scene(engine);
scene.clearColor=new BABYLON.Color4(.39,.53,.61,1);scene.fogMode=BABYLON.Scene.FOGMODE_EXP2;scene.fogDensity=.0038;scene.fogColor=new BABYLON.Color3(.39,.53,.61);
const camera=new BABYLON.FreeCamera("player",new BABYLON.Vector3(0,1.7,-12),scene);camera.fov=.92;camera.minZ=.08;camera.inputs.clear();
const hemi=new BABYLON.HemisphericLight("ambient",new BABYLON.Vector3(0,1,0),scene);hemi.intensity=.72;
const sun=new BABYLON.DirectionalLight("sun",new BABYLON.Vector3(-.45,-1,.35),scene);sun.intensity=1.15;
const shadowGen=new BABYLON.ShadowGenerator(1024,sun);shadowGen.useBlurExponentialShadowMap=true;shadowGen.blurKernel=16;
function mat(name,color,rough){const m=new BABYLON.StandardMaterial(name,scene);m.diffuseColor=BABYLON.Color3.FromHexString(color);m.specularColor=new BABYLON.Color3(.12,.12,.12);m.specularPower=rough||32;return m}
const floor=mat("asphalt","#424c53"),concrete=mat("concrete","#858b8b"),light=mat("sunlit concrete","#a6a397"),dark=mat("dark metal","#202a32"),trim=mat("steel trim","#46545c"),red=mat("enemy armor","#a92d42"),red2=mat("enemy accent","#ef5364"),skin=mat("skin","#d0a18a"),cloth=mat("uniform","#303d4a"),purple=mat("purple smoke","#8a42d6");
function box(name,x,y,z,w,h,d,m,parent){const o=BABYLON.MeshBuilder.CreateBox(name,{width:w,height:h,depth:d},scene);o.position.set(x,y,z);o.material=m;if(parent)o.parent=parent;return o}
function ground(){const g=box("arena floor",0,-.35,0,100,.7,100,floor);g.receiveShadows=true;for(let i=-4;i<=4;i++){box("road marking",i*5,-.0,-1,.07,.012,30,trim)}}
function building(x,z,w,d,h,m){const b=box("combat building",x,h/2,z,w,h,d,m);b.receiveShadows=true;box("roof edge",x,h+.08,z,w+.25,.16,d+.25,trim);for(let side of [-1,1]){box("window recess",x+side*w*.22,h*.62,z-d/2-.012,1.25,1.35,.035,dark);box("window sill",x+side*w*.22,h*.62-.72,z-d/2-.08,1.5,.12,.18,trim)}box("door",x,h*.34,z-d/2-.025,1.5,2.7,.06,dark);return b}
ground();
building(-19,13,13,12,8,light);building(19,15,13,12,9,concrete);building(-20,-12,12,13,7,concrete);building(20,-11,13,12,8,light);
building(0, thirty=30,18,9,6,concrete);
box("central long wall",-1,1.7,5,18,3.4,1.1,concrete);box("wall cap",-1,3.45,5,18.2,.12,1.25,trim);
for(let i=0;i<5;i++){const x=-13+i*6.5;box("tactical crate",x,.85, -3+(i%2)*5,2.2,1.7,2.1,dark);box("crate stripe",x,.87,-4.08+(i%2)*5,1.65,.12,.025,red2)}
for(let i=0;i<4;i++){const x=-24+i*16;box("barrier base",x,.65,23,7,1.3,1.1,concrete);box("barrier top",x,1.35,23,7,.12,1.2,trim)}
// low cover, pipes and rooftop details
for(let i=0;i<6;i++){const x=-23+i*9;const p=BABYLON.MeshBuilder.CreateCylinder("utility pipe",{height:5,diameter:.22},scene);p.rotation.z=Math.PI/2;p.position.set(x,.5, -23);p.material=trim}
for(let i=0;i<10;i++){const x=(i%5-2)*8,z= i<5?27:-28;box("distant structure",x,3.5,z,6,7,5,concrete)}
// stylized purple smoke plumes
for(const p of [[-8,0,10],[12,0,8]]){for(let j=0;j<8;j++){const s=BABYLON.MeshBuilder.CreateSphere("violet smoke",{diameter:1.4+j*.17},scene);s.position.set(p[0]+Math.sin(j*2)*.5,.5+j*.48,p[2]+Math.cos(j)*.35);s.material=purple;s.material.alpha=.12;s.material.disableLighting=true}}
function addShadow(mesh){mesh.receiveShadows=true;shadowGen.addShadowCaster(mesh)}
const bots=[];
function makeBot(x,z,i){const root=new BABYLON.TransformNode("hostile "+i,scene);root.position.set(x,0,z);
const torso=BABYLON.MeshBuilder.CreateCapsule("enemy body",{height:1.15,radius:.34},scene);torso.parent=root;torso.position.y=1.05;torso.material=red;addShadow(torso);
const vest=box("armor vest",0,1.12,0,.68,.62,.42,dark,root);
const head=BABYLON.MeshBuilder.CreateSphere("enemy head",{diameter:.43,segments:12},scene);head.parent=root;head.position.y=1.83;head.material=skin;addShadow(head);
const helmet=BABYLON.MeshBuilder.CreateSphere("combat helmet",{diameter:.5,segments:12},scene);helmet.parent=root;helmet.position.y=2.02;helmet.scaling.y=.48;helmet.material=red2;
for(const side of [-1,1]){const arm=BABYLON.MeshBuilder.CreateCapsule("arm",{height:.72,radius:.13},scene);arm.parent=root;arm.position.set(side*.43,1.18,.03);arm.rotation.z=side*.25;arm.material=cloth;const leg=BABYLON.MeshBuilder.CreateCapsule("leg",{height:.82,radius:.16},scene);leg.parent=root;leg.position.set(side*.19,.42,0);leg.material=dark}
const gun=box("bot rifle",0,1.05,.52,.16,.15,.75,dark,root);gun.rotation.x=.08;
bots.push({root,body:torso,head,alive:true,phase:i,vest});}
[[-9,13],[9,15],[-15,-3],[15,-4],[0,21],[-7,-19],[9,-19]].forEach((p,i)=>makeBot(p[0],p[1],i));
// first-person weapon with handguard, barrel, optic and magazine
const weapon=new BABYLON.TransformNode("first person rifle",scene);weapon.parent=camera;weapon.position.set(.48,-.39,.9);
box("rifle receiver",0,0,0,.22,.2,.72,dark,weapon);box("rifle handguard",0,.015,.42,.19,.16,.55,trim,weapon);box("rifle barrel",0,.015,.83,.075,.075,.55,dark,weapon);box("rifle stock",0,-.02,-.48,.17,.16,.4,cloth,weapon);box("rifle magazine",0,-.2,.12,.13,.3,.2,dark,weapon);box("rifle optic",0,.16,.05,.12,.12,.22,red2,weapon);box("optic glass",0,.16,.17,.085,.07,.012,light,weapon);
const muzzle=box("muzzle flash",0,0,1.15,.24,.22,.1,mat("flash","#ffd477"),weapon);muzzle.isVisible=false;
let ammo=30,score=0,recoil=0;const ammoEl=document.querySelector("#ammo"),msg=document.querySelector("#message");
function updateHud(){ammoEl.textContent=ammo+" / 90"}
function fire(){if(!ammo)return;ammo--;updateHud();recoil=.09;muzzle.isVisible=true;setTimeout(()=>muzzle.isVisible=false,65);const ray=camera.getForwardRay(100);const hit=scene.pickWithRay(ray,m=>m.name==="enemy body"||m.name==="enemy head");if(hit.hit){const bot=bots.find(b=>b.alive&&(b.body===hit.pickedMesh||b.head===hit.pickedMesh));if(bot){bot.alive=false;bot.root.setEnabled(false);score++;msg.textContent=score===bots.length?"ÁREA LIMPA — VITÓRIA":"ALVO ELIMINADO • "+score+"/"+bots.length}}}
document.querySelector("#fire").onpointerdown=fire;document.querySelector("#reload").onpointerdown=()=>{ammo=30;updateHud();msg.textContent="RECARREGADO"};document.querySelector("#jump").onpointerdown=()=>{camera.position.y=2.5;setTimeout(()=>camera.position.y=1.7,280)};
let move={x:0,y:0},joy=document.querySelector("#joystick"),stick=document.querySelector("#stick"),jid=null;
function joyMove(ev){const r=joy.getBoundingClientRect();let x=ev.clientX-r.left-r.width/2,y=ev.clientY-r.top-r.height/2,k=Math.min(1,43/(Math.hypot(x,y)||1));x*=k;y*=k;move={x:x/43,y:y/43};stick.style.transform="translate("+x+"px,"+y+"px)"}
joy.onpointerdown=ev=>{jid=ev.pointerId;joy.setPointerCapture(jid);joyMove(ev)};joy.onpointermove=ev=>{if(ev.pointerId===jid)joyMove(ev)};function stop(ev){if(ev.pointerId===jid){jid=null;move={x:0,y:0};stick.style.transform="translate(0,0)"}}joy.onpointerup=stop;joy.onpointercancel=stop;
let yaw=0,pitch=0,lid=null,lx=0,ly=0;canvas.onpointerdown=ev=>{if(ev.clientX<innerWidth*.38&&ev.clientY>innerHeight*.55)return;lid=ev.pointerId;lx=ev.clientX;ly=ev.clientY;canvas.setPointerCapture(lid)};canvas.onpointermove=ev=>{if(ev.pointerId!==lid)return;const dx=ev.clientX-lx,dy=ev.clientY-ly;lx=ev.clientX;ly=ev.clientY;yaw+=dx*.004;pitch=Math.max(-1,Math.min(1,pitch+dy*.003));camera.rotation.set(pitch,yaw,0)};canvas.onpointerup=ev=>{if(ev.pointerId===lid)lid=null};
scene.onBeforeRenderObservable.add(()=>{const dt=engine.getDeltaTime()/1000,f=new BABYLON.Vector3(Math.sin(yaw),0,Math.cos(yaw)),r=new BABYLON.Vector3(f.z,0,-f.x);camera.position.addInPlace(f.scale(-move.y*5*dt));camera.position.addInPlace(r.scale(move.x*5*dt));camera.position.x=Math.max(-31,Math.min(31,camera.position.x));camera.position.z=Math.max(-31,Math.min(31,camera.position.z));recoil=Math.max(0,recoil-dt*.45);weapon.position.y=-.39-recoil;weapon.rotation.x=recoil*.7;bots.forEach(b=>{if(b.alive){b.phase+=dt;b.root.position.x+=Math.sin(b.phase)*dt*.12;b.root.rotation.y=Math.atan2(camera.position.x-b.root.position.x,camera.position.z-b.root.position.z)}})});
engine.runRenderLoop(()=>scene.render());window.addEventListener("resize",()=>engine.resize());document.addEventListener("contextmenu",ev=>ev.preventDefault());updateHud();
})();