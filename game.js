(()=>{
"use strict";
const canvas=document.querySelector("#renderCanvas");
const engine=new BABYLON.Engine(canvas,false,{disableWebGL2Support:true, powerPreference:"low-power", stencil:false, preserveDrawingBuffer:false, adaptToDeviceRatio:true});
engine.setHardwareScalingLevel(1);
const scene=new BABYLON.Scene(engine);
scene.clearColor=new BABYLON.Color4(.48,.61,.68,1);
scene.fogMode=BABYLON.Scene.FOGMODE_EXP2;scene.fogDensity=.0003;scene.fogColor=new BABYLON.Color3(.48,.61,.68);
scene.imageProcessingConfiguration.toneMappingEnabled=false;
scene.imageProcessingConfiguration.exposure=1.42;
scene.imageProcessingConfiguration.contrast=1.05;
scene.imageProcessingConfiguration.vignetteEnabled=false;
scene.imageProcessingConfiguration.vignetteWeight=.28;
scene.imageProcessingConfiguration.vignetteStretch=.18;
scene.imageProcessingConfiguration.vignetteColor=new BABYLON.Color4(.025,.045,.065,1);
scene.imageProcessingConfiguration.vignetteCameraFov=.5;
const camera=new BABYLON.FreeCamera("player",new BABYLON.Vector3(0,1.72,-13),scene);
scene.activeCamera=camera;
camera.fov=.88;camera.minZ=.06;camera.maxZ=180;camera.inputs.clear();
const hemi=new BABYLON.HemisphericLight("sky fill",new BABYLON.Vector3(0,1,0),scene);hemi.intensity=1.65;hemi.groundColor=new BABYLON.Color3(.42,.44,.46);scene.ambientColor=new BABYLON.Color3(.38,.4,.42);
const sun=new BABYLON.DirectionalLight("sun",new BABYLON.Vector3(-.5,-1,.4),scene);sun.position.set(-20,35,-20);sun.intensity=1.7;
const shadowGen=null;
// Large procedural sky dome: a visible horizon and dusk-to-day atmospheric gradient.
const skyTex=new BABYLON.DynamicTexture("overcast blue sky",{width:512,height:256},scene,false);
const skyCtx=skyTex.getContext(),skyGrad=skyCtx.createLinearGradient(0,0,0,256);
skyGrad.addColorStop(0,"#8acfff");skyGrad.addColorStop(.38,"#b6e2ff");skyGrad.addColorStop(.72,"#e1f2ff");skyGrad.addColorStop(1,"#fff4d9");
skyCtx.fillStyle=skyGrad;skyCtx.fillRect(0,0,512,256);
for(let i=0;i<95;i++){const x=Math.random()*512,y=35+Math.random()*135,w=18+Math.random()*65,h=2+Math.random()*8;skyCtx.fillStyle="rgba(225,231,224,"+(.018+Math.random()*.035)+")";skyCtx.beginPath();skyCtx.ellipse(x,y,w,h,0,0,Math.PI*2);skyCtx.fill();}
skyTex.update(false);
const skyMat=new BABYLON.StandardMaterial("atmospheric sky",scene);skyMat.diffuseTexture=skyTex;skyMat.emissiveTexture=skyTex;skyMat.disableLighting=true;skyMat.backFaceCulling=false;skyMat.fogEnabled=false;
const skyDome=BABYLON.MeshBuilder.CreateSphere("wide sky dome",{diameter:190,segments:20},scene);skyDome.material=skyMat;skyDome.isPickable=false;skyDome.infiniteDistance=true;
function makeSurfaceTexture(name,base,light,dark){
 const tex=new BABYLON.DynamicTexture(name,{width:512,height:512},scene,false),ctx=tex.getContext();
 ctx.fillStyle=base;ctx.fillRect(0,0,512,512);
 for(let i=0;i<14500;i++){const x=Math.random()*512,y=Math.random()*512,a=.025+Math.random()*.12;ctx.fillStyle=Math.random()>.5?light.replace("A",a.toFixed(3)):dark.replace("A",a.toFixed(3));ctx.fillRect(x,y,.5+Math.random()*2,.5+Math.random()*2);}
 for(let y=0;y<512;y+=128){ctx.fillStyle="rgba(20,30,34,.12)";ctx.fillRect(0,y,256,2);}
 for(let x=0;x<512;x+=128){ctx.fillStyle="rgba(235,229,210,.07)";ctx.fillRect(x,0,2,256);}
 tex.update(false);tex.anisotropicFilteringLevel=4;tex.uScale=2.5;tex.vScale=2.5;tex.wrapU=BABYLON.Texture.WRAP_ADDRESSMODE;tex.wrapV=BABYLON.Texture.WRAP_ADDRESSMODE;return tex;
}
const concreteTex=makeSurfaceTexture("aged concrete texture","#858b89","rgba(231,232,220,A)","rgba(35,43,45,A)");
const sandTex=makeSurfaceTexture("sandstone texture","#a49a86","rgba(245,220,177,A)","rgba(50,43,34,A)");
// Restrained bloom gives emissive weapon lights and tracers a cleaner tactical glow.
const glowLayer=new BABYLON.GlowLayer("subtle tactical bloom",scene,{blurKernelSize:24});

glowLayer.intensity=.32;
// Mobile-friendly image finishing: smoother edges and restrained detail sharpening.
if(BABYLON.DefaultRenderingPipeline){
 const imagePipeline=new BABYLON.DefaultRenderingPipeline("mobile image clarity",true,scene,[camera]);
 imagePipeline.samples=1;
 imagePipeline.fxaaEnabled=true;
 imagePipeline.sharpenEnabled=true;
 imagePipeline.sharpen.colorAmount=.3;
 imagePipeline.sharpen.edgeAmount=.24;
 imagePipeline.imageProcessingEnabled=true;
}
// Daylight v4: stronger diffuse fill and softer contrast for mobile displays.
scene.imageProcessingConfiguration.toneMappingEnabled=true;
scene.imageProcessingConfiguration.exposure=1.48;
scene.imageProcessingConfiguration.contrast=1.04;
scene.imageProcessingConfiguration.vignetteEnabled=false;
scene.fogDensity=0;
scene.clearColor=new BABYLON.Color4(.70,.82,.90,1);
sun.intensity=3.05;
sun.diffuse=new BABYLON.Color3(1,.98,.92);
hemi.intensity=2.75;
hemi.diffuse=new BABYLON.Color3(.90,.94,1);
hemi.groundColor=new BABYLON.Color3(.48,.49,.43);
scene.ambientColor=new BABYLON.Color3(.62,.64,.59);
scene.fogMode=BABYLON.Scene.FOGMODE_NONE;
scene.environmentIntensity=1.0;
scene.imageProcessingConfiguration.colorCurvesEnabled=false;
scene.imageProcessingConfiguration.colorGradingEnabled=false;
// Keep shaded faces readable even on mobile displays with limited dynamic range.
function material(n,c,rough=48,metal=0){const m=new BABYLON.StandardMaterial(n,scene);m.diffuseColor=BABYLON.Color3.FromHexString(c);m.emissiveColor=m.diffuseColor.scale(.52);m.specularColor=new BABYLON.Color3(metal? .35:.12,metal?.35:.12,metal?.35:.12);m.specularPower=rough;return m}
const asphalt=material("worn asphalt","#39464d"),concrete=material("warm concrete","#858b89"),sand=material("sandstone","#a49a86"),shadow=material("deep shadow","#1b252c"),steel=material("painted steel","#465660"),edge=material("edge metal","#87949a"),glass=material("blue dark glass","#203b49",12,.3),red=material("enemy red armor","#a5233d"),redLight=material("red armor highlights","#ef4c63"),skin=material("skin","#c9967e"),uniform=material("navy uniform","#263746"),black=material("weapon black","#111a20",16,.45),rubber=material("rubber","#20272b"),plant=material("dry vegetation","#65734c"),leaf=material("olive leaf","#87905a"),purple=material("purple haze","#9a52df");
concrete.diffuseTexture=concreteTex;concrete.diffuseColor=new BABYLON.Color3(.92,.94,.95);concrete.specularColor=new BABYLON.Color3(.07,.07,.065);
sand.diffuseTexture=sandTex;sand.diffuseColor=new BABYLON.Color3(.94,.91,.84);sand.specularColor=new BABYLON.Color3(.08,.075,.065);
function box(n,x,y,z,w,h,d,m,parent){const o=BABYLON.MeshBuilder.CreateBox(n,{width:w,height:h,depth:d},scene);o.position.set(x,y,z);o.material=m;if(parent)o.parent=parent;return o}
function cylinder(n,x,y,z,h,d,m,parent){const o=BABYLON.MeshBuilder.CreateCylinder(n,{height:h,diameter:d,tessellation:10},scene);o.position.set(x,y,z);o.material=m;if(parent)o.parent=parent;return o}
function cast(o){return o}
const floor=box("asphalt training yard",0,-.4,0,100,.8,100,asphalt);floor.receiveShadows=true;
// Lightweight procedural surface detail: generated locally, no image downloads.
const asphaltTexture=new BABYLON.DynamicTexture("worn asphalt texture",{width:1024,height:1024},scene,false);
const asphaltCtx=asphaltTexture.getContext();
asphaltCtx.fillStyle="#77858a";asphaltCtx.fillRect(0,0,1024,1024);
let textureSeed=7319;
function textureRand(){textureSeed=(textureSeed*1664525+1013904223)>>>0;return textureSeed/4294967296;}
for(let i=0;i<26000;i++){const x=textureRand()*1024,y=textureRand()*1024,a=.025+textureRand()*.13,s=.5+textureRand()*2.8;asphaltCtx.fillStyle=textureRand()>.5?"rgba(210,218,214,"+a+")":"rgba(5,13,18,"+a+")";asphaltCtx.fillRect(x,y,s,s);}
for(let i=0;i<52;i++){const x=textureRand()*1024,y=textureRand()*1024;asphaltCtx.strokeStyle="rgba(12,19,22,.22)";asphaltCtx.lineWidth=.7+textureRand()*1.2;asphaltCtx.beginPath();asphaltCtx.moveTo(x,y);asphaltCtx.lineTo(x+(textureRand()-.5)*45,y+textureRand()*26);asphaltCtx.stroke();}
asphaltTexture.update(false);asphaltTexture.anisotropicFilteringLevel=4;asphaltTexture.uScale=7;asphaltTexture.vScale=7;asphaltTexture.wrapU=BABYLON.Texture.WRAP_ADDRESSMODE;asphaltTexture.wrapV=BABYLON.Texture.WRAP_ADDRESSMODE;
asphalt.diffuseTexture=asphaltTexture;asphalt.diffuseColor=new BABYLON.Color3(1,1,1);asphalt.emissiveColor=new BABYLON.Color3(.58,.59,.57);asphalt.specularColor=new BABYLON.Color3(.055,.06,.065);
concrete.emissiveColor=new BABYLON.Color3(.40,.40,.37);
sand.emissiveColor=new BABYLON.Color3(.40,.36,.29);
steel.emissiveColor=new BABYLON.Color3(.22,.23,.24);
edge.emissiveColor=new BABYLON.Color3(.23,.23,.23);
glass.emissiveColor=new BABYLON.Color3(.12,.15,.17);
// Painted tactical lane edges, worn crossing bars and manhole details add readable scale.
const paintMat=material("faded road paint","#c4bfae");paintMat.emissiveColor=new BABYLON.Color3(.035,.032,.025);
const hazardMat=material("yellow hazard paint","#d2a64e");
for(let side of [-1,1]){
 box("long road edge marking",side*17,.012,0,.12,.018,66,paintMat);
 for(let j=0;j<7;j++)box("crosswalk worn stripe",side*7.5,.014,-25+j*1.05,4.2,.018,.42,paintMat);
}
for(const z of [-12,8,27]){const drain=box("storm drain",0,.014,z,2.4,.02,.62,shadow);for(let k=-4;k<=4;k++)box("drain metal slot",k*.23,.027,z,.045,.012,.52,edge);}
for(const x of [-28,28]){box("yellow hazard boundary",x,.016,0,.16,.02,58,hazardMat);}
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
const barkMat=material("tree bark","#76543a");
barkMat.diffuseColor=new BABYLON.Color3(.48,.32,.20);
barkMat.emissiveColor=new BABYLON.Color3(.13,.085,.045);
const treeCanopyMat=material("sunlit tree canopy","#7eaa55");
treeCanopyMat.diffuseColor=new BABYLON.Color3(.58,.72,.39);
treeCanopyMat.emissiveColor=new BABYLON.Color3(.20,.27,.11);
treeCanopyMat.disableLighting=true;
for(let i=0;i<8;i++){
 // Trees stay outside the combat lane and farther from the camera.
 const x=(i%6-2.5)*10.5,z=i<6?38:-42;
 const trunk=cylinder("yard tree trunk",x,1.25,z,2.5,.28,barkMat);
 const crown=BABYLON.MeshBuilder.CreateSphere("low foliage",{diameter:1.85,segments:9},scene);crown.position.set(x,2.85,z);crown.scaling.set(1,.82,1);crown.material=treeCanopyMat;
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

const foliageMat=material("olive foliage detail","#668b45");
const foliageLight=material("sunlit foliage","#a4bd68");
// Foliage uses a soft self-lit response so leaves retain green color on mobile.
[plant,leaf,foliageMat,foliageLight].forEach((m)=>{m.disableLighting=false;m.emissiveColor=m.diffuseColor.scale(.22);m.diffuseColor=m.diffuseColor.scale(1.38);});

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
 // Elevated industrial catwalks, railings and a central bridge frame the A site.
 const catwalkMat=material("catwalk dark steel","#34434b",22,.35);
 const catwalkEdge=material("catwalk worn edges","#87949a",18,.45);
 const hazardYellow=material("catwalk safety yellow","#d5a84f");hazardYellow.emissiveColor=new BABYLON.Color3(.08,.045,.012);
 for(const side of [-1,1]){
  const x=side*14.2;
  box("elevated catwalk deck",x,4.35,5,2.65,.22,24,catwalkMat);
  box("catwalk outer rail",x+side*1.25,4.92,5,.12,1.05,24,catwalkEdge);
  box("catwalk inner rail",x-side*1.25,4.92,5,.12,1.05,24,catwalkEdge);
  box("catwalk top safety stripe",x+side*1.25,5.48,5,.15,.055,24,hazardYellow);
  for(const z of [-5,3,11,17]){
   box("catwalk support column",x,2.12,z,.28,4.2,.3,steel);
   box("catwalk support foot",x, .18,z,.75,.36,.75,catwalkEdge);
  }
  for(let z=-6;z<=16;z+=4)box("catwalk floor rib",x,4.49,z,2.55,.045,.09,catwalkEdge);
 }
 box("A site bridge deck",0,4.42,5,27,.2,1.9,catwalkMat);
 for(const side of [-1,1])box("A site bridge guardrail",0,4.94,5+side*.88,27,.9,.1,catwalkEdge);
 // Painted A-site ground marking and tactical cover.
 const sitePaint=material("A site marking","#d9bd79");sitePaint.emissiveColor=new BABYLON.Color3(.055,.04,.018);
 box("A site marking left stroke",-1.05,.025,5,.14,.025,2.6,sitePaint).rotation.y=-.38;
 box("A site marking right stroke",1.05,.025,5,.14,.025,2.6,sitePaint).rotation.y=.38;
 box("A site marking crossbar",0,.027,5.45,1.35,.025,.13,sitePaint);
 box("A site cover barrier",0,.85,9,4.8,1.7,.8,steel);
 for(const side of [-1,1])box("A site barrier hazard panel",side*1.45,.88,8.57,.72,.72,.045,hazardYellow);
 const siteSignTex=new BABYLON.DynamicTexture("A site sign texture",{width:256,height:128},scene,false);
 const siteSignCtx=siteSignTex.getContext();siteSignCtx.fillStyle="#111d25";siteSignCtx.fillRect(0,0,256,128);siteSignCtx.strokeStyle="#d5a84f";siteSignCtx.lineWidth=8;siteSignCtx.strokeRect(5,5,246,118);siteSignCtx.fillStyle="#f1d59a";siteSignCtx.font="bold 76px Arial";siteSignCtx.textAlign="center";siteSignCtx.textBaseline="middle";siteSignCtx.fillText("SITE A",128,67);siteSignTex.update(false);
 const siteSignMat=new BABYLON.StandardMaterial("A site sign material",scene);siteSignMat.diffuseTexture=siteSignTex;siteSignMat.emissiveTexture=siteSignTex;siteSignMat.disableLighting=true;
 const siteSign=BABYLON.MeshBuilder.CreatePlane("SITE A sign",{width:3.2,height:1.6},scene);siteSign.position.set(0,2.55,8.55);siteSign.material=siteSignMat;siteSign.isPickable=false;
 // Low-intensity colored practical lights add depth without expensive shadows.
 const violetLight=new BABYLON.PointLight("violet smoke bounce",new BABYLON.Vector3(-10,2.8,9),scene);violetLight.diffuse=new BABYLON.Color3(.48,.18,.85);violetLight.intensity=.42;violetLight.range=13;
 const amberLight=new BABYLON.PointLight("A site amber practical",new BABYLON.Vector3(0,5.5,5),scene);amberLight.diffuse=new BABYLON.Color3(1,.58,.24);amberLight.intensity=.32;amberLight.range=10;

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
 const faceMat=material("operator face tone "+i,["#c9967e","#ad806c","#d2a087","#986f60"][i%4],34);
 const head=cast(BABYLON.MeshBuilder.CreateSphere("enemy head",{diameter:.43,segments:16},scene));head.parent=root;head.position.y=1.91;head.scaling.set(role===2?1.08:.96,1.02,.94);head.material=faceMat;
 // Exposed facial structure beneath the helmet.
 const nose=BABYLON.MeshBuilder.CreateSphere("operator nose",{diameter:.105,segments:8},scene);nose.parent=root;nose.position.set(0,1.91,-.365);nose.scaling.set(.72,1.25,.72);nose.material=faceMat;
 for(const side of [-1,1]){
  const eye=BABYLON.MeshBuilder.CreateSphere("operator eye",{diameter:.052,segments:8},scene);eye.parent=root;eye.position.set(side*.092,1.975,-.337);eye.scaling.set(1,.72,.55);eye.material=black;
  const brow=box("operator brow",side*.092,2.025,-.33,.105,.035,.035,role===1?trimMat:uniform,root);brow.rotation.z=side*-.12;
  const cheek=BABYLON.MeshBuilder.CreateSphere("cheek armor",{diameter:.15,segments:8},scene);cheek.parent=root;cheek.position.set(side*.16,1.84,-.275);cheek.scaling.set(.72,.72,.5);cheek.material=roleMat;
 }
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

 // Anatomical layers: neck, articulated-looking armor, face protection and field equipment.
 const neck=cylinder("operator neck",0,1.69,-.015,.22,.2,skin,root);
 const jaw=BABYLON.MeshBuilder.CreateSphere("reinforced jawline", {diameter:.31,segments:10},scene);
 jaw.parent=root;jaw.position.set(0,1.82,-.205);jaw.scaling.set(1,.72,.72);jaw.material=skin;
 const faceMask=box("ballistic lower face mask",0,1.82,-.285,.34,.16,.075,black,root);
 const eyeBand=box("helmet eye protection",0,1.99,-.285,.37,.105,.055,role===1?trimMat:black,root);
 for(const side of [-1,1]){
  box("optical lens",side*.105,2.0,-.319,.075,.045,.018,role===1?edge:trimMat,root);
  const ear=BABYLON.MeshBuilder.CreateCylinder("helmet communications cup",{height:.12,diameter:.22,tessellation:10},scene);
  ear.parent=root;ear.position.set(side*.27,2.04,0);ear.rotation.z=Math.PI/2;ear.material=steel;
  const shoulderPad=BABYLON.MeshBuilder.CreateSphere("contoured shoulder pad",{diameter:.48,segments:10},scene);
  shoulderPad.parent=root;shoulderPad.position.set(side*.49,1.49,-.035);shoulderPad.scaling.set(1,.62,.9);shoulderPad.material=role===2?trimMat:roleMat;
  const elbow=BABYLON.MeshBuilder.CreateSphere("articulated elbow guard",{diameter:.27,segments:8},scene);
  elbow.parent=root;elbow.position.set(side*.49,.99,-.035);elbow.scaling.set(1,.8,.78);elbow.material=black;
  const thigh=BABYLON.MeshBuilder.CreateBox("thigh ballistic panel",{width:.28,height:.38,depth:.13},scene);
  thigh.parent=root;thigh.position.set(side*.2,.57,-.145);thigh.material=roleMat;
  box("thigh webbing strap",side*.2,.69,-.22,.31,.055,.045,trimMat,root);
  box("boot reinforced toe",side*.2,.105,-.31,.31,.12,.19,rubber,root);
  box("boot ankle cuff",side*.2,.22,-.08,.31,.12,.3,steel,root);
 }
 // Chest rig gets readable pouches, straps, buckles and a protected central plate.
 box("left shoulder harness",-.22,1.43,-.285,.075,.43,.045,black,root).rotation.z=-.18;
 box("right shoulder harness",.22,1.43,-.285,.075,.43,.045,black,root).rotation.z=.18;
 for(let pouch=-1;pouch<=1;pouch++){
  box("magazine carrier",pouch*.2,1.12,-.325,.14,.22,.1,role===2?steel:black,root);
  box("magazine retention flap",pouch*.2,1.2,-.382,.13,.055,.018,trimMat,root);
 }
 box("central armor buckle",0,.84,-.255,.18,.11,.045,edge,root);
 box("upper back equipment panel",0,1.48,.405,.36,.3,.08,black,root);
 box("radio screen",.12,1.52,.455,.12,.13,.025,glass,root);

 // Hero-shooter inspired silhouette and faction identity: layered collar, shoulder emblems and luminous tech accents.
 roleMat.specularColor=new BABYLON.Color3(.24,.25,.27);roleMat.specularPower=34;
 trimMat.specularColor=new BABYLON.Color3(.42,.34,.3);trimMat.specularPower=42;
 const collar=BABYLON.MeshBuilder.CreateTorus("armored neck collar",{diameter:.43,thickness:.075,tessellation:12},scene);
 collar.parent=root;collar.position.set(0,1.67,-.015);collar.rotation.x=Math.PI/2;collar.material=black;
 for(const side of [-1,1]){
  const emblem=BABYLON.MeshBuilder.CreateCylinder("faction shoulder insignia",{height:.045,diameter:.24,tessellation:6},scene);
  emblem.parent=root;emblem.position.set(side*.49,1.49,-.235);emblem.rotation.x=Math.PI/2;emblem.material=trimMat;
  box("shoulder armor luminous slash",side*.49,1.51,-.274,.055,.2,.025,role===1?edge:trimMat,root).rotation.z=side*.22;
  box("upper arm utility strap",side*.48,1.18,-.13,.29,.075,.12,black,root);
  box("glove knuckle plate",side*.51,.84,-.16,.19,.075,.08,trimMat,root);
 }
 // Role-specific helmet profiles make enemy classes readable at a glance.
 if(role===1){
  const sensor=BABYLON.MeshBuilder.CreateSphere("recon helmet sensor", {diameter:.16,segments:8},scene);
  sensor.parent=root;sensor.position.set(.2,2.27,.02);sensor.material=trimMat;
  box("recon shoulder antenna housing",-.52,1.57,.03,.16,.23,.2,black,root);
 }else if(role===2){
  box("heavy helmet armored crest",0,2.29,.015,.32,.12,.35,steel,root);
  box("heavy chest power core",0,1.32,-.355,.18,.18,.035,trimMat,root);
 }else{
  box("assault helmet ridge",0,2.27,.02,.16,.07,.29,edge,root);
  box("assault shoulder patch",-.5,1.49,-.245,.2,.12,.035,trimMat,root);
 }

 // Jett-inspired agent appearance: white high bun, swept fringe, blue-white combat suit.
 const jettWhite=material("Jett white hair","#edf5fb",28),jettBlue=material("Jett blue suit","#3c91c9",26),jettNavy=material("Jett navy fabric","#203d59",30),jettPale=material("Jett pale armor","#dce9f2",34),jettCyan=material("Jett cyan accents","#78d9ef",22);
 // Replace the old faction armor palette while keeping the existing animated rig and hitboxes.
 root.getChildMeshes(false).forEach(m=>{
  const n=m.name.toLowerCase();
  if(n.includes("helmet")||n.includes("visor")||n.includes("goggle")||n.includes("eye protection")||n.includes("communications cup")||n.includes("jawline")||n.includes("face mask")||n.includes("optical lens")||n.includes("ear")){m.isVisible=false;m.isPickable=false;return;}
  if(n.includes("enemy body")||n.includes("enemy arm")||n.includes("enemy leg")||n.includes("combat boot")||n.includes("thigh")||n.includes("knee")||n.includes("boot"))m.material=jettNavy;
  else if(n.includes("chest")||n.includes("shoulder")||n.includes("armor")||n.includes("vest")||n.includes("collar")||n.includes("operator neck"))m.material=jettBlue;
  else if(n.includes("pouch")||n.includes("harness")||n.includes("strap")||n.includes("forearm")||n.includes("elbow"))m.material=jettPale;
  else if(n.includes("red")||n.includes("faction")||n.includes("insignia")||n.includes("stripe")||n.includes("slash")||n.includes("buckle"))m.material=jettCyan;
 });
 // White swept hair and the recognizable high bun silhouette.
 const hairCap=BABYLON.MeshBuilder.CreateSphere("Jett white hair cap",{diameter:.57,segments:14},scene);hairCap.parent=root;hairCap.position.set(0,2.13,.015);hairCap.scaling.set(1.02,.62,1.02);hairCap.material=jettWhite;
 const hairBun=BABYLON.MeshBuilder.CreateSphere("Jett high hair bun",{diameter:.38,segments:12},scene);hairBun.parent=root;hairBun.position.set(0,2.39,.12);hairBun.scaling.set(.9,1.05,.9);hairBun.material=jettWhite;
 const fringe=BABYLON.MeshBuilder.CreateSphere("Jett swept front fringe",{diameter:.34,segments:12},scene);fringe.parent=root;fringe.position.set(-.13,2.12,-.245);fringe.scaling.set(1.15,.42,.52);fringe.rotation.z=-.28;fringe.material=jettWhite;
 const sideLock=BABYLON.MeshBuilder.CreateSphere("Jett side hair lock",{diameter:.2,segments:10},scene);sideLock.parent=root;sideLock.position.set(.23,2.0,-.18);sideLock.scaling.set(.55,1.25,.55);sideLock.material=jettWhite;
 // Blue sleeveless-looking chest panels and cyan agent details.
 box("Jett blue chest jacket",0,1.31,-.285,.57,.53,.075,jettBlue,root);
 box("Jett pale collar",0,1.62,-.255,.43,.13,.09,jettPale,root);
 box("Jett cyan chest emblem",0,1.31,-.337,.12,.2,.025,jettCyan,root);
 for(const side of [-1,1]){
  box("Jett white shoulder trim",side*.47,1.49,-.19,.13,.2,.13,jettPale,root);
  box("Jett blue wrist guard",side*.49,1.03,-.15,.24,.2,.12,jettBlue,root);
 }
 const rifle=box("hostile rifle",.04,1.13,-.48,.15,.14,.82,black,root);rifle.rotation.x=.08;
 const barrel=box("hostile rifle barrel",.04,1.15,-.95,.055,.055,.32,edge,root);
 const muzzleGlow=box("enemy muzzle flash",.04,1.15,-1.16,.18,.18,.18,muzzleMat,root);muzzleGlow.isVisible=false;
 const alertLamp=box("enemy alert light",0,1.58,-.31,.1,.08,.035,trimMat,root);
 root.scaling.setAll(role===1?1.015:role===2?1.075:.98);
 bots.push({root,body:torso,head,alive:true,hp:role===2?180:role===1?120:100,maxHp:role===2?180:role===1?120:100,phase:i,role,limbs,rifle,muzzleGlow,alertLamp,legacyMeshes:root.getChildMeshes(false),modelMeshes:[],animGroups:[],playAnim:null,animState:"",deathTimer:0,attackAnimLock:0,anchorX:x,anchorZ:z,patrolX:role===1?1.8:role===2?.75:1.15+(i%3)*.22,patrolZ:role===1?1.15:role===2?.55:.7+(i%2)*.25,decision:0,strafe:1,alert:0,attackCooldown:1.5+i*.23,walkPhase:0,combatState:"patrol",stateTimer:0});
}
[[-2,-10],[2,-9],[-2.5,-7],[2.5,-6],[0,-4],[-1.8,-2],[1.8,0]].forEach((p,i)=>makeBot(p[0],p[1],i));
 // Rigged CC0 operators: load, normalize and attach complete skinned GLB characters.
 const rigUrls=[
  "./models/soldier_rigged%20(1).glb",
  "./models/soldier_rigged%20(1).glb",
  "./models/soldier_rigged%20(1).glb"
 ];
 const rigContainers={};
 async function rigBot(bot){
  try{
   if(!BABYLON.SceneLoader||!BABYLON.SceneLoader.LoadAssetContainerAsync)throw new Error("Loader GLB não foi carregado");
   const key=String(bot.role),url=rigUrls[bot.role];
   if(!rigContainers[key])rigContainers[key]=BABYLON.SceneLoader.LoadAssetContainerAsync("",url,scene);
   const container=await rigContainers[key];
   const instance=container.instantiateModelsToScene(n=>"rigged_"+bot.phase+"_"+n,false);
   const modelRoot=new BABYLON.TransformNode("rigged operator root "+bot.phase,scene);
   (instance.rootNodes||[]).forEach(n=>{n.parent=modelRoot;});
   modelRoot.parent=bot.root;
   const meshes=[];
   (instance.rootNodes||[]).forEach(n=>{
    if(n.getChildMeshes)meshes.push(...n.getChildMeshes());
    if(n instanceof BABYLON.AbstractMesh)meshes.push(n);
   });
   bot.modelMeshes=[...new Set(meshes)].filter(m=>m.getTotalVertices()>0);
   if(!bot.modelMeshes.length)throw new Error("GLB carregou, mas não contém malhas visíveis");
   bot.modelMeshes.forEach(m=>{m.isVisible=true;m.isPickable=true;m.setEnabled(true);m.checkCollisions=false;try{m.disableEdgesRendering();}catch(e){}});
    // Material readability pass: retain original textures while lifting shaded
    // surfaces slightly, with restrained visor and metal accents on mobile.
    const brighten=(color,factor)=>new BABYLON.Color3(
     Math.min(1,color.r*factor),Math.min(1,color.g*factor),Math.min(1,color.b*factor)
    );
    bot.modelMeshes.forEach(mesh=>{
     const mat=mesh.material;
     if(!mat)return;
     mat.disableLighting=false;
     const materialName=String(mat.name||"").toLowerCase();
     if(mat.albedoColor){
      if(materialName.includes("olive"))mat.albedoColor=new BABYLON.Color3(.36,.43,.22);
      else if(materialName.includes("dark"))mat.albedoColor=new BABYLON.Color3(.14,.17,.20);
      else if(materialName.includes("gunmetal"))mat.albedoColor=new BABYLON.Color3(.39,.45,.50);
      else if(materialName.includes("visor"))mat.albedoColor=new BABYLON.Color3(.07,.39,.48);
      else mat.albedoColor=brighten(mat.albedoColor,1.12);
      if(mat.emissiveColor){
       const glow=materialName.includes("visor")?.42:materialName.includes("dark")?.24:.32;
       mat.emissiveColor=mat.albedoColor.scale(glow);
      }
      if("roughness" in mat)mat.roughness=materialName.includes("gunmetal")?.5:.78;
      if("metallic" in mat)mat.metallic=materialName.includes("gunmetal")?.2:.035;
     }else if(mat.diffuseColor){
      mat.diffuseColor=brighten(mat.diffuseColor,1.16);
      if(mat.emissiveColor)mat.emissiveColor=mat.diffuseColor.scale(.30);
      if("specularPower" in mat)mat.specularPower=42;
     }
    });

   // Measure every GLB bounding-box corner in modelRoot LOCAL space.
   modelRoot.computeWorldMatrix(true);
   const inverseRoot=modelRoot.getWorldMatrix().clone();
   inverseRoot.invert();
   const localMin=new BABYLON.Vector3(Infinity,Infinity,Infinity);
   const localMax=new BABYLON.Vector3(-Infinity,-Infinity,-Infinity);
   bot.modelMeshes.forEach(mesh=>{
    mesh.computeWorldMatrix(true);
    const box=mesh.getBoundingInfo().boundingBox;
    box.vectorsWorld.forEach(point=>{
     const local=BABYLON.Vector3.TransformCoordinates(point,inverseRoot);
     localMin.minimizeInPlace(local);
     localMax.maximizeInPlace(local);
    });
   });
   const height=localMax.y-localMin.y;
   if(!Number.isFinite(height)||height<.05)throw new Error("escala inválida no modelo GLB");
   // Root scale is .792; target a final operator height of about 2.25 m.
   const fit=2.85/height;
   const centerX=(localMin.x+localMax.x)*.5;
   const centerZ=(localMin.z+localMax.z)*.5;
   modelRoot.scaling.setAll(fit);
   modelRoot.position.set(-centerX*fit,-localMin.y*fit,-centerZ*fit);
   modelRoot.computeWorldMatrix(true);
   bot.modelMeshes.forEach(m=>{m.isVisible=true;m.isPickable=true;m.setEnabled(true);m.visibility=1;});
   bot.legacyMeshes.forEach(m=>{m.isVisible=false;m.isPickable=false;});
   bot.animGroups=instance.animationGroups||[];
   bot.playAnim=(name,loop=true)=>{
    const key=String(name).toLowerCase();
    const aliases={
     idle:["idle","stand"],
     walk:["walk"],
     run:["run","sprint"],
     attack:["fire","attack","shoot"],
     fire:["fire","attack","shoot"],
     reload:["reload"],
     death:["death","die"]
    };
    const terms=aliases[key]||[key];
    const group=bot.animGroups.find(g=>terms.some(term=>g.name.toLowerCase().includes(term)));
    if(!group)return false;
    if(bot.animState===group.name&&group.isPlaying)return true;
    bot.animGroups.forEach(g=>{if(g!==group)g.stop();});
    group.start(loop,key==="run"?1.08:1.0,group.from,group.to,false);
    bot.animState=group.name;
    return true;
   };
   bot.modelRoot=modelRoot;
   if(!bot.playAnim("Idle",true)&&bot.animGroups.length){
    bot.animGroups.forEach(g=>g.stop());
    bot.animGroups[0].start(true);
   }
   console.info("Operador 3D carregado",bot.phase,"malhas:",bot.modelMeshes.length,"animações:",bot.animGroups.map(g=>g.name));
   return true;
  }catch(err){
   console.warn("Falha ao carregar operador 3D",bot.phase,err);
   const out=document.querySelector("#message");
   if(out)out.textContent="MODELO 3D NÃO CARREGOU: "+(err&&err.message?err.message:String(err));
   return false;
  }
 }
 // Carrega operadores humanoides rigged; em caso de falha, mantém o personagem de reserva.
// Prioriza personagens humanoides 3D com esqueleto e animações; mantém os modelos locais como fallback.
const modelStatus=document.createElement("div");
modelStatus.id="model-load-status";
modelStatus.textContent="SOLDADOS 3D: CARREGANDO...";
modelStatus.style.cssText="position:fixed;z-index:45;left:50%;bottom:150px;transform:translateX(-50%);max-width:88vw;padding:8px 12px;border:1px solid #7da6b5;border-radius:9px;background:rgba(5,16,24,.92);color:#d9f5ff;font:700 11px Arial,sans-serif;letter-spacing:1px;text-align:center;pointer-events:none";
document.body.appendChild(modelStatus);
Promise.all(bots.map(async b=>({ok:await rigBot(b)}))).then(results=>{
 const loaded=results.filter(x=>x.ok).length,failed=results.length-loaded;
 modelStatus.textContent=failed===0?"SOLDADOS 3D: "+loaded+"/"+bots.length+" CARREGADOS":"SOLDADOS 3D: "+loaded+"/"+bots.length+" • FALHAS: "+failed;
 modelStatus.style.borderColor=failed===0?"#65d6a2":"#ff7182";
});
bots.forEach(b=>{
 b.root.scaling.setAll(.792);
 b.legacyMeshes.forEach(m=>{m.isVisible=true;m.isPickable=true;m.setEnabled(true);m.visibility=1;});
});

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
let ammo=30,reserveAmmo=90,reloadTimer=0,score=0,combatPoints=0,killStreak=0,bestStreak=0,streakTimer=0,recoil=0,flashTimer=0,health=300,gameOver=false,damageFlash=0,shotsFired=0,hitsLanded=0,headshots=0,damageDealt=0,hitMarkerTimer=0;
const ammoEl=document.querySelector("#ammo"),msg=document.querySelector("#message"),healthEl=document.querySelector("#health"),crosshair=document.querySelector("#crosshair");
const damageOverlay=document.createElement("div");damageOverlay.id="damage-overlay";damageOverlay.style.cssText="position:fixed;inset:0;pointer-events:none;z-index:25;opacity:0;background:radial-gradient(ellipse at center,transparent 48%,rgba(255,35,55,.34) 100%);transition:opacity .16s";document.body.appendChild(damageOverlay);
const resultOverlay=document.createElement("div");resultOverlay.id="match-result";resultOverlay.style.cssText="position:fixed;inset:0;z-index:80;display:none;align-items:center;justify-content:center;padding:24px;background:rgba(5,12,18,.86);backdrop-filter:blur(7px);font-family:Arial,sans-serif;text-align:center;color:#fff";
resultOverlay.innerHTML='<div style="width:min(90vw,420px);padding:30px 24px;border:1px solid #718692;background:linear-gradient(145deg,#182832,#0b1219);box-shadow:0 18px 60px #000b"><div id="result-kicker" style="font-size:12px;letter-spacing:4px;color:#a8bac4">OPERAÇÃO CONCLUÍDA</div><div id="result-title" style="font-size:clamp(32px,9vw,48px);font-weight:900;letter-spacing:2px;margin:14px 0">VITÓRIA</div><div id="result-detail" style="font-size:15px;color:#c2cdd2;margin-bottom:26px">ALVOS ELIMINADOS: 0/7</div><button id="restart-match" style="width:100%;padding:16px;border:0;background:#d63c50;color:white;font-weight:900;font-size:15px;letter-spacing:1.5px;border-radius:4px">JOGAR NOVAMENTE</button></div>';
document.body.appendChild(resultOverlay);
document.querySelector("#restart-match").addEventListener("click",()=>location.reload());
// Original synthesized combat audio; starts only after a player gesture.
let audioContext=null,audioMuted=false;
const audioButton=document.querySelector("#audio-toggle");
function playSfx(kind){
 if(audioMuted)return;
 try{
  const AudioCtor=window.AudioContext||window.webkitAudioContext;
  if(!AudioCtor)return;
  if(!audioContext)audioContext=new AudioCtor();
  if(audioContext.state==="suspended")audioContext.resume();
  const now=audioContext.currentTime,osc=audioContext.createOscillator(),gain=audioContext.createGain();
  const cfg=kind==="fire"?[118,48,.12,.12,"sawtooth"]:kind==="enemy"?[82,42,.09,.07,"triangle"]:kind==="reload"?[620,260,.18,.055,"square"]:kind==="hit"?[760,210,.13,.075,"triangle"]:[190,75,.2,.11,"sawtooth"];
  osc.type=cfg[4];osc.frequency.setValueAtTime(cfg[0],now);osc.frequency.exponentialRampToValueAtTime(Math.max(35,cfg[1]),now+cfg[2]);
  gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(cfg[3],now+.008);gain.gain.exponentialRampToValueAtTime(.0001,now+cfg[2]);
  osc.connect(gain);gain.connect(audioContext.destination);osc.start(now);osc.stop(now+cfg[2]+.015);
 }catch(e){}
}
audioButton.addEventListener("click",()=>{audioMuted=!audioMuted;audioButton.textContent=audioMuted?"SOM OFF":"SOM ON";audioButton.setAttribute("aria-pressed",String(!audioMuted));if(!audioMuted)playSfx("reload");});
function finishMatch(won){if(gameOver)return;gameOver=true;msg.textContent=won?"ÁREA LIMPA — VITÓRIA":"DERROTA — VOCÊ FOI ELIMINADO";document.querySelector("#result-title").textContent=won?"VITÓRIA":"DERROTA";document.querySelector("#result-title").style.color=won?"#8df0b0":"#ff6378";document.querySelector("#result-detail").textContent="ALVOS: "+score+"/"+bots.length+" • PONTUAÇÃO: "+combatPoints+" • MELHOR SÉRIE: "+bestStreak+" • PRECISÃO: "+(shotsFired?Math.round(hitsLanded/shotsFired*100):0)+"% • HEADSHOTS: "+headshots+" • DANO CAUSADO: "+damageDealt+(won?" • ÁREA SEGURA":" • OPERADOR ELIMINADO");resultOverlay.style.display="flex";if(!won)damageOverlay.style.opacity="1";}
function updateHealth(){healthEl.textContent="♥ "+health;healthEl.style.color=health<=30?"#ff536b":health<=60?"#ffd477":"#8df0b0";}
function damagePlayer(amount){if(gameOver)return;playSfx("damage");health=Math.max(0,health-amount);updateHealth();damageFlash=.22;damageOverlay.style.opacity=".58";msg.textContent="VOCÊ FOI ATINGIDO • -"+amount+" HP";if(health<=0)finishMatch(false);}
const tracerMat=material("enemy tracer material","#ff765f");tracerMat.emissiveColor=new BABYLON.Color3(1,.16,.08);
const enemyTracers=[];
function enemyShot(b){playSfx("enemy");if(b.playAnim){b.attackAnimLock=.6;b.playAnim("Attack",false);}const start=b.root.position.add(new BABYLON.Vector3(0,1.18,0));const target=camera.position.add(new BABYLON.Vector3(0,-.35,0));const delta=target.subtract(start);const length=delta.length();const beam=BABYLON.MeshBuilder.CreateCylinder("enemy tracer",{height:length,diameter:.035,tessellation:6},scene);beam.material=tracerMat;beam.position=start.add(target).scale(.5);beam.rotationQuaternion=BABYLON.Quaternion.FromUnitVectorsToRef?BABYLON.Quaternion.FromUnitVectorsToRef(BABYLON.Axis.Y,delta.normalize(),BABYLON.Quaternion.Identity()):null;if(!beam.rotationQuaternion){beam.lookAt(target);beam.rotation.x+=Math.PI/2;}enemyTracers.push({mesh:beam,life:.12});b.muzzleGlow.isVisible=true;b.alert=.35;}
function updateHud(){ammoEl.textContent=ammo+" / "+reserveAmmo}
function startReload(){if(gameOver||reloadTimer>0||ammo>=30||reserveAmmo<=0)return;reloadTimer=1.15;msg.textContent="RECARREGANDO..."}
function completeReload(){const needed=30-ammo,loaded=Math.min(needed,reserveAmmo);ammo+=loaded;reserveAmmo-=loaded;reloadTimer=0;updateHud();playSfx("reload");msg.textContent="RECARREGADO"}
const hitFlashMat=material("impact flash material","#ffe6a0");hitFlashMat.emissiveColor=new BABYLON.Color3(1,.72,.28);
const hitEffects=[];
function spawnHitEffect(point,headshot){
 playSfx("hit");
 const burst=BABYLON.MeshBuilder.CreateSphere("hit impact",{diameter:headshot?.34:.24,segments:7},scene);burst.position.copyFrom(point);burst.material=hitFlashMat;burst.isPickable=false;
 const ring=BABYLON.MeshBuilder.CreateTorus("impact ring",{diameter:headshot?.62:.44,thickness:.035,tessellation:12},scene);ring.position.copyFrom(point);ring.material=redLight;ring.isPickable=false;
 hitEffects.push({mesh:burst,ring,life:.2,max:.2});
}
function fire(){
 if(gameOver){msg.textContent="PARTIDA ENCERRADA — TOQUE EM JOGAR NOVAMENTE";return}
 if(reloadTimer>0){msg.textContent="RECARREGANDO...";return}
 if(ammo<=0){if(reserveAmmo>0)startReload();else msg.textContent="SEM MUNIÇÃO — RESERVA ESGOTADA";return}
 ammo--;shotsFired++;updateHud();playSfx("fire");recoil=.13;muzzle.isVisible=true;flashTimer=.075;
 const ray=camera.getForwardRay(100);
 const hit=scene.pickWithRay(ray,m=>m.name==="enemy body"||m.name==="enemy head"||bots.some(b=>b.alive&&b.modelMeshes.includes(m)));
 if(hit.hit){
  const bot=bots.find(b=>b.alive&&(b.body===hit.pickedMesh||b.head===hit.pickedMesh||b.modelMeshes.includes(hit.pickedMesh)));
  if(bot){hitsLanded++;hitMarkerTimer=.18;crosshair.style.color="#7fffd4";crosshair.style.transform="translate(-50%,-50%) scale(1.35)";const headshot=hit.pickedMesh===bot.head;if(headshot)headshots++;const damage=headshot?bot.maxHp:50;damageDealt+=damage;if(headshot){crosshair.style.color="#ffd477";}bot.hp=Math.max(0,bot.hp-damage);combatPoints+=headshot?150:25;spawnHitEffect(hit.pickedPoint,headshot);if(bot.hp<=0){bot.alive=false;bot.deathTimer=1.6;if(bot.playAnim)bot.playAnim("Death",false);else bot.root.setEnabled(false);score++;if(!headshot)combatPoints+=75;killStreak++;bestStreak=Math.max(bestStreak,killStreak);streakTimer=5;const streakBonus=killStreak>=2?killStreak*25:0;combatPoints+=streakBonus;msg.textContent=(headshot?"HEADSHOT":"ALVO ELIMINADO")+" • "+score+"/"+bots.length+" • SÉRIE x"+killStreak+(streakBonus?" +"+streakBonus+" BÔNUS":"")+" • "+combatPoints+" PTS";if(score===bots.length)finishMatch(true)}else{msg.textContent=(headshot?"TIRO NA CABEÇA":"ACERTO")+" • +25 PTS • "+damage+" DANO • INIMIGO "+bot.hp+"/"+bot.maxHp+" HP";} }
 }else msg.textContent="DISPARO";
}
document.querySelector("#fire").onpointerdown=e=>{e.preventDefault();fire()};
document.querySelector("#reload").onpointerdown=e=>{e.preventDefault();startReload()};
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
 if(reloadTimer>0){reloadTimer=Math.max(0,reloadTimer-dt);if(reloadTimer===0)completeReload()}
 recoil=Math.max(0,recoil-dt*.5);if(hitMarkerTimer>0){hitMarkerTimer=Math.max(0,hitMarkerTimer-dt);if(hitMarkerTimer===0){crosshair.style.color="#fff";crosshair.style.transform="translate(-50%,-50%)";}}
 const fwd=camera.getDirection(BABYLON.Axis.Z),weaponRight=camera.getDirection(BABYLON.Axis.X),up=camera.getDirection(BABYLON.Axis.Y);
 weapon.position.copyFrom(camera.position.add(weaponRight.scale(.43)).add(up.scale(-.39-recoil)).add(fwd.scale(.95)));
 weapon.rotation.copyFrom(camera.rotation);weapon.rotation.x+=recoil*.45;weapon.setEnabled(true);
 if(flashTimer>0){flashTimer-=dt;if(flashTimer<=0)muzzle.isVisible=false}
 if(damageFlash>0){damageFlash-=dt;if(damageFlash<=0&&!gameOver)damageOverlay.style.opacity="0"}if(streakTimer>0){streakTimer=Math.max(0,streakTimer-dt);if(streakTimer===0)killStreak=0;}
 bots.forEach(b=>{if(!b.alive&&b.deathTimer>0){b.deathTimer-=dt;if(b.deathTimer<=0)b.root.setEnabled(false);}if(b.alive){b.phase+=dt*(b.role===1?1.45:b.role===2?.72:1.05);b.decision-=dt;b.stateTimer-=dt;if(b.decision<=0){b.decision=1.2+Math.random()*2.2;b.strafe=Math.random()<.5?-1:1;}const stride=b.phase*(b.role===1?1.55:b.role===2?.8:1.15);const dx=camera.position.x-b.root.position.x,dz=camera.position.z-b.root.position.z,dist=Math.hypot(dx,dz),nx=dx/(dist||1),nz=dz/(dist||1);if(b.stateTimer<=0){b.stateTimer=1.7+Math.random()*1.8;b.combatState=dist>18?"patrol":b.role===1?(dist<7?"reposition":"flank"):b.role===2?(dist<5?"advance":"hold"):(dist<5?"retreat":dist<13?"engage":"advance");}const pace=b.role===2?.45:b.role===1?1.25:.8;let targetX=b.anchorX+Math.sin(stride)*b.patrolX,targetZ=b.anchorZ+Math.cos(stride*.72)*b.patrolZ;if(b.combatState==="advance"){targetX+=nx*(b.role===2?2.1:1.4);targetZ+=nz*(b.role===2?2.1:1.4);}else if(b.combatState==="retreat"){targetX-=nx*2;targetZ-=nz*2;}else if(b.combatState==="flank"||b.combatState==="reposition"){const side=b.combatState==="flank"?2.5:1.4;targetX+=nz*b.strafe*side;targetZ-=nx*b.strafe*side;}const moveRate=b.combatState==="hold"?.12:b.role===2?.8:b.role===1?2.15:1.5;const speed=moveRate*dt;if(b.playAnim){b.attackAnimLock=Math.max(0,b.attackAnimLock-dt);const moving=b.combatState!=="hold"&&Math.hypot(targetX-b.root.position.x,targetZ-b.root.position.z)>.12;if(b.attackAnimLock<=0)b.playAnim(moving?(moveRate>1.7?"Run":"Walk"):"Idle",true);}b.root.position.x+=Math.max(-speed,Math.min(speed,targetX-b.root.position.x));b.root.position.z+=Math.max(-speed,Math.min(speed,targetZ-b.root.position.z));b.root.position.x=Math.max(-29,Math.min(29,b.root.position.x));b.root.position.z=Math.max(-29,Math.min(29,b.root.position.z));b.root.rotation.y=Math.atan2(dx,dz);const step=Math.sin(stride*2.2)*.34*pace;b.limbs[0].rotation.x=step;b.limbs[2].rotation.x=-step;b.limbs[1].rotation.x=-step*.8;b.limbs[3].rotation.x=step*.8;b.root.position.y=Math.abs(Math.sin(stride*2.2))*.035*pace;b.body.rotation.z=Math.sin(stride*2.2)*.025*pace;b.head.rotation.x=Math.sin(stride*2.2+.6)*.018;
 b.attackCooldown-=dt;b.alert=Math.max(0,b.alert-dt);b.muzzleGlow.isVisible=b.alert>0;b.alertLamp.scaling.y=1+(b.alert>0?.5:0);if(dist<18&&dist>2.4&&b.attackCooldown<=0){b.attackCooldown=b.role===1?4.2:b.role===2?6:5.2;enemyShot(b);damagePlayer(b.role===1?2:b.role===2?4:3);}
 }});
 enemyTracers.forEach(t=>{t.life-=dt;if(t.life<=0){t.mesh.dispose();} });for(let i=enemyTracers.length-1;i>=0;i--)if(enemyTracers[i].life<=0)enemyTracers.splice(i,1);
 hitEffects.forEach(t=>{t.life-=dt;const p=1-t.life/t.max;t.mesh.scaling.setAll(1+p*1.7);t.mesh.visibility=Math.max(0,1-p);t.ring.scaling.setAll(.5+p*1.8);t.ring.visibility=Math.max(0,1-p);});for(let i=hitEffects.length-1;i>=0;i--)if(hitEffects[i].life<=0){hitEffects[i].mesh.dispose();hitEffects[i].ring.dispose();hitEffects.splice(i,1);}
});
engine.runRenderLoop(()=>{try{scene.render()}catch(err){console.error(err);const m=document.querySelector("#message");if(m)m.textContent="ERRO AO RENDERIZAR: "+err.message;engine.stopRenderLoop()}});
window.addEventListener("resize",()=>{engine.resize();engine.setSize(canvas.clientWidth,canvas.clientHeight)});
document.addEventListener("contextmenu",e=>e.preventDefault());updateHud();updateHealth();
})();