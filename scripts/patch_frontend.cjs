const fs = require('fs');

const mainJsPath = 'src/main.js';
let content = fs.readFileSync(mainJsPath, 'utf8');
const originalLength = content.length;
console.log('Original src/main.js length:', originalLength);

// 1. In F1 component: replace re, B, I with re, coRef
const targetRef = 're=(0,w.useRef)(null),[B,je]=(0,w.useState)(""),I=[';
const idxRef = content.indexOf(targetRef);
if (idxRef === -1) {
  console.error('Target ref not found!');
  process.exit(1);
}
// Find the end of array I
const endOfI = content.indexOf('],[m,fe]=(0,w.useState)({photographyCharge:18e3', idxRef);
if (endOfI === -1) {
  console.error('End of I not found!');
  process.exit(1);
}

const replacementRef = 're=(0,w.useRef)(null),coRef=(0,w.useRef)(null)';
content = content.substring(0, idxRef) + replacementRef + content.substring(endOfI + 1);
console.log('✅ 1. Replaced re/I declaration with re, coRef');

// 2. In F1 component: replace nr, vt, Vr with new nr and co
const idxHandlers = content.indexOf('nr=p=>{var yt;let be=(yt=p.target.files)==null?void 0:yt[0];');
if (idxHandlers === -1) {
  console.error('Target handlers not found!');
  process.exit(1);
}
const idxVo = content.indexOf('vo=p=>{p.preventDefault(),k&&(le(k.id,{name:oe.name,', idxHandlers);
if (idxVo === -1) {
  console.error('vo not found!');
  process.exit(1);
}

const newHandlers = `nr=p=>{var yt;let be=(yt=p.target.files)==null?void 0:yt[0];if(!be)return;if(!be.type.startsWith("image/")){alert("Please select a valid image file (JPG, PNG, or WEBP).");return}if(be.size>15728640){alert("Profile photo size exceeds 15MB. Please choose a smaller image.");return}let Pt=new FileReader;Pt.onload=async Er=>{var lr;let Ct=(lr=Er.target)==null?void 0:lr.result;if(Ct&&k){ye(Bt=>({...Bt,avatar:Ct}));try{let uRes=await fetch(\`/api/photographers/\${k.id}/upload\`,{method:"POST",headers:{"Content-Type":"application/json","x-creator-id":k.id},body:JSON.stringify({image:Ct,type:"avatar"})});let uJson=await uRes.json();let finalUrl=(uJson.success&&uJson.url)?uJson.url:Ct;ye(Bt=>({...Bt,avatar:finalUrl,image:finalUrl}));le(k.id,{avatar:finalUrl,image:finalUrl});W("Profile photo uploaded and saved successfully!");setTimeout(()=>W(""),3e3)}catch(err){le(k.id,{avatar:Ct,image:Ct});W("Profile photo updated!");setTimeout(()=>W(""),3e3)}}};Pt.readAsDataURL(be)},co=p=>{var yt;let be=(yt=p.target.files)==null?void 0:yt[0];if(!be)return;if(!be.type.startsWith("image/")){alert("Please select a valid image file (JPG, PNG, or WEBP).");return}if(be.size>15728640){alert("Background photo size exceeds 15MB. Please choose a smaller image.");return}let Pt=new FileReader;Pt.onload=async Er=>{var lr;let Ct=(lr=Er.target)==null?void 0:lr.result;if(Ct&&k){ye(Bt=>({...Bt,coverImage:Ct}));try{let uRes=await fetch(\`/api/photographers/\${k.id}/upload\`,{method:"POST",headers:{"Content-Type":"application/json","x-creator-id":k.id},body:JSON.stringify({image:Ct,type:"coverImage"})});let uJson=await uRes.json();let finalUrl=(uJson.success&&uJson.url)?uJson.url:Ct;ye(Bt=>({...Bt,coverImage:finalUrl}));le(k.id,{coverImage:finalUrl});W("Background photo uploaded and saved successfully!");setTimeout(()=>W(""),3e3)}catch(err){le(k.id,{coverImage:Ct});W("Background photo updated!");setTimeout(()=>W(""),3e3)}}};Pt.readAsDataURL(be)},`;

content = content.substring(0, idxHandlers) + newHandlers + content.substring(idxVo);
console.log('✅ 2. Replaced handlers with async upload endpoints');

// 3. In F1 Profile tab: replace Profile Photo card + presets with Profile Photo Card + Background Photo Card
const photoCardStart = content.indexOf('(0,r.jsx)("div",{style:{background:"#202026",border:"1px solid #2e2e38",borderRadius:"12px",padding:"20px",marginBottom:"22px"},children:(0,r.jsxs)("div",{style:{display:"flex",alignItems:"flex-start",gap:"20px",flexWrap:"wrap"},children:[(0,r.jsxs)("div",{style:{position:"relative",flexShrink:0}');
if (photoCardStart === -1) {
  console.error('photoCardStart not found!');
  process.exit(1);
}

const formStart = content.indexOf('(0,r.jsxs)("form",{onSubmit:vo,', photoCardStart);
if (formStart === -1) {
  console.error('formStart not found!');
  process.exit(1);
}

const newCardsJSX = `(0,r.jsx)("div",{style:{background:"#202026",border:"1px solid #2e2e38",borderRadius:"12px",padding:"20px",marginBottom:"18px"},children:(0,r.jsxs)("div",{style:{display:"flex",alignItems:"flex-start",gap:"20px",flexWrap:"wrap"},children:[(0,r.jsxs)("div",{style:{position:"relative",flexShrink:0},children:[oe.avatar?(0,r.jsx)("img",{src:oe.avatar,alt:"Profile Avatar",style:{width:"92px",height:"92px",borderRadius:"50%",objectFit:"cover",border:"3px solid var(--primary-color)",boxShadow:"0 8px 24px rgba(0,0,0,0.6)"}}):(0,r.jsx)("div",{style:{width:"92px",height:"92px",borderRadius:"50%",background:"#18181c",border:"3px solid var(--primary-color)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"32px",fontWeight:"800",color:"var(--primary-color)",boxShadow:"0 8px 24px rgba(0,0,0,0.6)"},children:(oe.name||"C").charAt(0).toUpperCase()}),(0,r.jsx)("button",{type:"button",onClick:()=>{var p;return(p=re.current)==null?void 0:p.click()},title:"Upload from device",style:{position:"absolute",bottom:"2px",right:"2px",width:"28px",height:"28px",borderRadius:"50%",background:"var(--primary-color)",color:"#18181c",border:"2px solid #202026",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"},children:(0,r.jsx)(ui,{size:14})})]}),(0,r.jsxs)("div",{style:{flex:1,minWidth:"260px"},children:[(0,r.jsx)("h4",{style:{fontSize:"14.5px",fontWeight:"800",margin:"0 0 4px 0",color:"#fff"},children:"Studio Profile Photo"}),(0,r.jsx)("p",{style:{fontSize:"12px",color:"#94a3b8",margin:"0 0 12px 0",lineHeight:"1.4"},children:"Upload your profile photo from your device. Any ratio (square, portrait, landscape) is supported."}),(0,r.jsx)("input",{type:"file",ref:re,accept:"image/jpeg,image/png,image/webp",onChange:nr,style:{display:"none"}}),(0,r.jsx)("button",{type:"button",onClick:()=>{var p;return(p=re.current)==null?void 0:p.click()},style:{background:"var(--primary-color)",color:"#18181c",border:"none",padding:"8px 18px",borderRadius:"6px",fontWeight:"800",fontSize:"12.5px",cursor:"pointer",display:"inline-flex",alignItems:"center",gap:"6px"},children:[(0,r.jsx)(eg,{size:13})," Upload Profile Photo from Device"]})]})]})}),(0,r.jsx)("div",{style:{background:"#202026",border:"1px solid #2e2e38",borderRadius:"12px",padding:"20px",marginBottom:"22px"},children:(0,r.jsxs)("div",{style:{display:"flex",flexDirection:"column",gap:"14px"},children:[(0,r.jsxs)("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:"12px"},children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("h4",{style:{fontSize:"14.5px",fontWeight:"800",margin:"0 0 4px 0",color:"#fff"},children:"Studio Background Photo"}),(0,r.jsx)("p",{style:{fontSize:"12px",color:"#94a3b8",margin:0,lineHeight:"1.4"},children:"Upload your custom background cover photo from your device. Displays on your public profile header."})]}),(0,r.jsx)("input",{type:"file",ref:coRef,accept:"image/jpeg,image/png,image/webp",onChange:co,style:{display:"none"}}),(0,r.jsxs)("button",{type:"button",onClick:()=>{var p;return(p=coRef.current)==null?void 0:p.click()},style:{background:"var(--primary-color)",color:"#18181c",border:"none",padding:"8px 18px",borderRadius:"6px",fontWeight:"800",fontSize:"12.5px",cursor:"pointer",display:"inline-flex",alignItems:"center",gap:"6px"},children:[(0,r.jsx)(eg,{size:13})," Upload Background from Device"]})]}),(0,r.jsx)("div",{style:{width:"100%",height:"120px",borderRadius:"8px",overflow:"hidden",position:"relative",border:"1px solid #33333d",background:"#18181c",display:"flex",alignItems:"center",justifyContent:"center"},children:oe.coverImage?(0,r.jsx)("img",{src:oe.coverImage,alt:"Studio Background",style:{width:"100%",height:"100%",objectFit:"cover"}}):(0,r.jsxs)("div",{style:{color:"#64748b",fontSize:"12.5px",display:"flex",alignItems:"center",gap:"8px"},children:[(0,r.jsx)(ui,{size:16})," No custom background photo uploaded. Click above to select from device."]})})]})})`;

content = content.substring(0, photoCardStart) + newCardsJSX + ',' + content.substring(formStart);
console.log('✅ 3. Replaced profile photo & preset cards with device-only Profile & Background cards');

// 4. Clean Creator Studio initial state fallbacks (around 379179)
const initialOeTarget = 'avatar:(k==null?void 0:k.avatar)||(k==null?void 0:k.image)||"https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80",coverImage:(k==null?void 0:k.coverImage)||"https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80"';
if (content.includes(initialOeTarget)) {
  content = content.replace(initialOeTarget, 'avatar:(k==null?void 0:k.avatar)||(k==null?void 0:k.image)||"",coverImage:(k==null?void 0:k.coverImage)||""');
  console.log('✅ 4. Replaced initial oe avatar and coverImage Unsplash fallbacks');
} else {
  console.warn('⚠️ initialOeTarget not found directly');
}

// 5. Clean Creator Studio Header avatar fallback (around 393425)
const headerAvatarTarget = 'children:(0,r.jsx)("img",{src:k.avatar||"https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80",alt:k.name,style:{width:"38px",height:"38px",borderRadius:"50%",objectFit:"cover",border:"2px solid var(--primary-color)"}})';
const headerAvatarReplacement = 'children:k.avatar?(0,r.jsx)("img",{src:k.avatar,alt:k.name,style:{width:"38px",height:"38px",borderRadius:"50%",objectFit:"cover",border:"2px solid var(--primary-color)"}}):(0,r.jsx)("div",{style:{width:"38px",height:"38px",borderRadius:"50%",background:"#18181c",border:"2px solid var(--primary-color)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"15px",fontWeight:"800",color:"var(--primary-color)"},children:(k.name||"C").charAt(0).toUpperCase()})';

if (content.includes(headerAvatarTarget)) {
  content = content.replace(headerAvatarTarget, headerAvatarReplacement);
  console.log('✅ 5. Replaced Creator Studio header avatar fallback');
} else {
  console.warn('⚠️ headerAvatarTarget not found directly');
}

// 6. Clean Admin Creator List avatar fallback (around 511745)
const adminListAvatarTarget = 'children:[(0,r.jsx)("img",{src:s.avatar||"https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80",alt:s.name,style:{width:"48px",height:"48px",borderRadius:"50%",objectFit:"cover",border:"2px solid var(--primary-color)"}})';
const adminListAvatarReplacement = 'children:[s.avatar?(0,r.jsx)("img",{src:s.avatar,alt:s.name,style:{width:"48px",height:"48px",borderRadius:"50%",objectFit:"cover",border:"2px solid var(--primary-color)"}}):(0,r.jsx)("div",{style:{width:"48px",height:"48px",borderRadius:"50%",background:"#18181c",border:"2px solid var(--primary-color)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"18px",fontWeight:"800",color:"var(--primary-color)"},children:(s.name||"C").charAt(0).toUpperCase()})';

if (content.includes(adminListAvatarTarget)) {
  content = content.replace(adminListAvatarTarget, adminListAvatarReplacement);
  console.log('✅ 6. Replaced Admin creator list avatar fallback');
} else {
  console.warn('⚠️ adminListAvatarTarget not found directly');
}

// 7. Clean Admin Approval Queue avatar fallback (around 555753)
const adminQueueAvatarTarget = 'children:[(0,r.jsx)("img",{src:R.avatar||"https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80",alt:R.name,style:{width:"46px",height:"46px",borderRadius:"50%",objectFit:"cover",border:"2px solid var(--primary-color)"}})';
const adminQueueAvatarReplacement = 'children:[R.avatar?(0,r.jsx)("img",{src:R.avatar,alt:R.name,style:{width:"46px",height:"46px",borderRadius:"50%",objectFit:"cover",border:"2px solid var(--primary-color)"}}):(0,r.jsx)("div",{style:{width:"46px",height:"46px",borderRadius:"50%",background:"#18181c",border:"2px solid var(--primary-color)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"17px",fontWeight:"800",color:"var(--primary-color)"},children:(R.name||"C").charAt(0).toUpperCase()})';

if (content.includes(adminQueueAvatarTarget)) {
  content = content.replace(adminQueueAvatarTarget, adminQueueAvatarReplacement);
  console.log('✅ 7. Replaced Admin approval queue avatar fallback');
} else {
  console.warn('⚠️ adminQueueAvatarTarget not found directly');
}

// 8. Clean Demo Karthik Raja creator object (around 447534)
const karthikDemoTarget = 'k=M&&M.length>0?M[0]:{id:"c1",name:"Karthik Raja",title:"Wedding & Candid Photographer",location:"Tirunelveli, Tamil Nadu",rating:4.9,reviewCount:128,startingPrice:25e3,avatar:"https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",coverImage:"https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80"}';
const karthikDemoReplacement = 'k=(M&&M.length>0)?M[0]:(c&&(c.role==="PHOTOGRAPHER"||c.role==="CREATOR")?c:null)';

if (content.includes(karthikDemoTarget)) {
  content = content.replace(karthikDemoTarget, karthikDemoReplacement);
  console.log('✅ 8. Removed demo creator Karthik Raja object');
} else {
  console.warn('⚠️ karthikDemoTarget not found directly');
}

// 9. Clean Explore Cards cover fallback
const exploreCoverTarget = 'q=Z.coverImage||Z.portfolio&&((re=Z.portfolio[0])==null?void 0:re.url)||Z.avatar||"https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80"';
const exploreCoverReplacement = 'q=Z.coverImage||Z.portfolio&&((re=Z.portfolio[0])==null?void 0:re.url)||Z.avatar||""';

if (content.includes(exploreCoverTarget)) {
  content = content.replace(exploreCoverTarget, exploreCoverReplacement);
  console.log('✅ 9. Cleaned explore card cover fallback');
} else {
  console.warn('⚠️ exploreCoverTarget not found directly');
}

// 10. Clean PhotographerProfileModal cover fallback
const modalCoverTarget = 'src:u.coverImage||"https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80"';
const modalCoverReplacement = 'src:u.coverImage||(u.portfolio&&u.portfolio[0]?.url)||u.avatar||""';

if (content.includes(modalCoverTarget)) {
  content = content.replace(modalCoverTarget, modalCoverReplacement);
  console.log('✅ 10. Cleaned profile modal cover fallback');
} else {
  console.warn('⚠️ modalCoverTarget not found directly');
}

// 11. Profile Modal avatar fallback
const modalAvatarTarget = '(0,r.jsx)("img",{src:u.avatar,alt:u.name,style:{width:"110px",height:"110px",borderRadius:"50%",border:"4px solid #181818",objectFit:"cover",boxShadow:"0 8px 24px rgba(0,0,0,0.6)",background:"#222"}})';
const modalAvatarReplacement = 'u.avatar?(0,r.jsx)("img",{src:u.avatar,alt:u.name,style:{width:"110px",height:"110px",borderRadius:"50%",border:"4px solid #181818",objectFit:"cover",boxShadow:"0 8px 24px rgba(0,0,0,0.6)",background:"#222"}}):(0,r.jsx)("div",{style:{width:"110px",height:"110px",borderRadius:"50%",border:"4px solid #181818",background:"#18181c",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"40px",fontWeight:"800",color:"var(--primary-color)",boxShadow:"0 8px 24px rgba(0,0,0,0.6)"},children:(u.name||"C").charAt(0).toUpperCase()})';

if (content.includes(modalAvatarTarget)) {
  content = content.replace(modalAvatarTarget, modalAvatarReplacement);
  console.log('✅ 11. Replaced PhotographerProfileModal avatar fallback');
}

// Test JS validity
try {
  new Function(content);
  console.log('🎉 Syntax check PASSED: content is 100% valid JavaScript!');
  fs.writeFileSync(mainJsPath, content, 'utf8');
  console.log('🚀 Successfully wrote patched src/main.js! New length:', content.length);
} catch (e) {
  console.error('❌ Syntax check FAILED:', e.message);
  process.exit(1);
}
