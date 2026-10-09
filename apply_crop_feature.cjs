const fs = require('fs');

const mainJsPath = 'src/main.js';
let code = fs.readFileSync(mainJsPath, 'utf8');

// Backup first
fs.writeFileSync('src/main.js.bak_crop_logo', code);

// 1. Dashboard photo upload handler nr
const targetNr = 'nr=p=>{var yt;let be=(yt=p.target.files)==null?void 0:yt[0];if(!be)return;if(!be.type.startsWith("image/")){alert("Please select a valid image file (JPG, PNG, or WEBP).");return}if(be.size>15728640){alert("Profile photo size exceeds 15MB. Please choose a smaller image.");return}let Pt=new FileReader;Pt.onload=async Er=>{var lr;let Ct=(lr=Er.target)==null?void 0:lr.result;if(Ct&&k){ye(Bt=>({...Bt,avatar:Ct}));try{let uRes=await fetch(`/api/photographers/${k.id}/upload`,{method:"POST",headers:{"Content-Type":"application/json","x-creator-id":k.id},body:JSON.stringify({image:Ct,type:"avatar"})});let uJson=await uRes.json();let finalUrl=(uJson.success&&uJson.url)?uJson.url:Ct;ye(Bt=>({...Bt,avatar:finalUrl,image:finalUrl}));le(k.id,{avatar:finalUrl,image:finalUrl});W("Profile photo uploaded and saved successfully!");setTimeout(()=>W(""),3e3)}catch(err){le(k.id,{avatar:Ct,image:Ct});W("Profile photo updated!");setTimeout(()=>W(""),3e3)}}};Pt.readAsDataURL(be)}';

const replacementNr = 'nr=p=>{var yt;let be=(yt=p.target.files)==null?void 0:yt[0];if(!be)return;if(!be.type.startsWith("image/")){alert("Please select a valid image file (JPG, PNG, or WEBP).");return}if(be.size>15728640){alert("Profile photo size exceeds 15MB. Please choose a smaller image.");return}let Pt=new FileReader;Pt.onload=Er=>{var lr;let Ct=(lr=Er.target)==null?void 0:lr.result;if(Ct&&k){let doUpload=async(croppedUrl)=>{ye(Bt=>({...Bt,avatar:croppedUrl}));try{let uRes=await fetch(`/api/photographers/${k.id}/upload`,{method:"POST",headers:{"Content-Type":"application/json","x-creator-id":k.id},body:JSON.stringify({image:croppedUrl,type:"avatar"})});let uJson=await uRes.json();let finalUrl=(uJson.success&&uJson.url)?uJson.url:croppedUrl;ye(Bt=>({...Bt,avatar:finalUrl,image:finalUrl}));le(k.id,{avatar:finalUrl,image:finalUrl});W("Profile photo cropped and saved successfully!");setTimeout(()=>W(""),3e3)}catch(err){le(k.id,{avatar:croppedUrl,image:croppedUrl});W("Profile photo updated!");setTimeout(()=>W(""),3e3)}};if(window.__vnOpenImageCropper){window.__vnOpenImageCropper(Ct,doUpload,{title:"Crop Creator Profile Photo",subtitle:`Adjust framing and zoom for ${k.studioName||k.name}`});}else{doUpload(Ct)}}};Pt.readAsDataURL(be);p.target.value=""}';

if (!code.includes(targetNr)) {
  console.error('ERROR: Could not find exact targetNr');
  process.exit(1);
}
code = code.replace(targetNr, replacementNr);
console.log('Successfully replaced nr with cropper handler!');

// 2. Add Crop / Reposition button in Dashboard Profile Settings
const targetDashBtn = 'children:[(0,r.jsx)(eg,{size:13})," Upload Profile Photo from Device"]})';
const replacementDashBtn = 'children:[(0,r.jsx)(eg,{size:13})," Upload Profile Photo from Device"]}),(oe.avatar?(0,r.jsx)("button",{type:"button",onClick:()=>{if(window.__vnOpenImageCropper&&oe.avatar){window.__vnOpenImageCropper(oe.avatar,async(croppedUrl)=>{ye(Bt=>({...Bt,avatar:croppedUrl}));try{let uRes=await fetch(`/api/photographers/${k.id}/upload`,{method:"POST",headers:{"Content-Type":"application/json","x-creator-id":k.id},body:JSON.stringify({image:croppedUrl,type:"avatar"})});let uJson=await uRes.json();let finalUrl=(uJson.success&&uJson.url)?uJson.url:croppedUrl;ye(Bt=>({...Bt,avatar:finalUrl,image:finalUrl}));le(k.id,{avatar:finalUrl,image:finalUrl});W("Profile photo cropped & updated successfully!");setTimeout(()=>W(""),3e3)}catch(err){le(k.id,{avatar:croppedUrl,image:croppedUrl});W("Profile photo updated!");setTimeout(()=>W(""),3e3)}},{title:"Crop Current Profile Photo",subtitle:`Adjust framing & zoom for ${k.studioName||k.name}`});}},style:{background:"rgba(0,210,255,0.15)",color:"#00d2ff",border:"1px solid rgba(0,210,255,0.4)",padding:"8px 14px",borderRadius:"6px",fontWeight:"700",fontSize:"12.5px",cursor:"pointer",display:"inline-flex",alignItems:"center",gap:"6px",marginLeft:"8px"},children:"Crop / Reposition Photo"}):null)';

if (!code.includes(targetDashBtn)) {
  console.error('ERROR: Could not find exact targetDashBtn');
  process.exit(1);
}
code = code.replace(targetDashBtn, replacementDashBtn);
console.log('Successfully added Crop / Reposition button in Dashboard!');

// 3. Onboarding photo upload with cropper
const targetOnboardInput = '(0,r.jsx)("input",{type:"file",accept:"image/*",id:"creatorAvatarUploadInput",onChange:_=>{let se=_.target.files&&_.target.files[0];if(se){let Pe=new FileReader;Pe.onload=ev=>de(Ve=>({...Ve,avatar:ev.target.result||Pe.result})),Pe.readAsDataURL(se)}},style:{display:"none"}})';
const replacementOnboardInput = '(0,r.jsx)("input",{type:"file",accept:"image/*",id:"creatorAvatarUploadInput",onChange:_=>{let se=_.target.files&&_.target.files[0];if(se){let Pe=new FileReader;Pe.onload=ev=>{let rawSrc=ev.target.result||Pe.result;if(window.__vnOpenImageCropper){window.__vnOpenImageCropper(rawSrc,croppedUrl=>de(Ve=>({...Ve,avatar:croppedUrl})),{title:"Crop Profile Photo",subtitle:"Position and frame your creator profile picture"});}else{de(Ve=>({...Ve,avatar:rawSrc}));}};Pe.readAsDataURL(se);_.target.value=""}},style:{display:"none"}})';

if (!code.includes(targetOnboardInput)) {
  console.error('ERROR: Could not find exact targetOnboardInput');
  process.exit(1);
}
code = code.replace(targetOnboardInput, replacementOnboardInput);
console.log('Successfully replaced onboarding avatar input with cropper!');

// 4. Onboarding "Crop" button next to "Remove"
const targetOnboardPreview = 'S.avatar?(0,r.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:"8px"},children:[(0,r.jsx)("img",{src:S.avatar,alt:"Preview",style:{width:"32px",height:"32px",borderRadius:"50%",objectFit:"cover",border:"1.5px solid var(--primary-color)"}}),(0,r.jsx)("span",{style:{fontSize:"11.5px",color:"#4ade80",fontWeight:"600"},children:"Photo Uploaded ✓"}),(0,r.jsx)("button",{type:"button",onClick:()=>de(Ve=>({...Ve,avatar:""})),style:{background:"none",border:"none",color:"#ef4444",fontSize:"11px",cursor:"pointer",textDecoration:"underline",padding:0},children:"Remove"})]})';
const replacementOnboardPreview = 'S.avatar?(0,r.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:"8px"},children:[(0,r.jsx)("img",{src:S.avatar,alt:"Preview",style:{width:"32px",height:"32px",borderRadius:"50%",objectFit:"cover",border:"1.5px solid var(--primary-color)"}}),(0,r.jsx)("span",{style:{fontSize:"11.5px",color:"#4ade80",fontWeight:"600"},children:"Photo Uploaded ✓"}),(0,r.jsx)("button",{type:"button",onClick:()=>{if(window.__vnOpenImageCropper&&S.avatar){window.__vnOpenImageCropper(S.avatar,cUrl=>de(Ve=>({...Ve,avatar:cUrl})),{title:"Re-crop Profile Picture"});}},style:{background:"none",border:"none",color:"#00d2ff",fontSize:"11px",cursor:"pointer",textDecoration:"underline",padding:0,fontWeight:"700"},children:"Crop"}),(0,r.jsx)("button",{type:"button",onClick:()=>de(Ve=>({...Ve,avatar:""})),style:{background:"none",border:"none",color:"#ef4444",fontSize:"11px",cursor:"pointer",textDecoration:"underline",padding:0},children:"Remove"})]})';

if (!code.includes(targetOnboardPreview)) {
  console.error('ERROR: Could not find exact targetOnboardPreview');
  process.exit(1);
}
code = code.replace(targetOnboardPreview, replacementOnboardPreview);
console.log('Successfully added Re-crop button in onboarding!');

fs.writeFileSync(mainJsPath, code, 'utf8');
console.log('Successfully saved modified main.js!');
