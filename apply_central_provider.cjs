const fs = require('fs');

const mainJsPath = 'src/main.js';
const code = fs.readFileSync(mainJsPath, 'utf8');

const fnStartStr = 'function C1({children:u}){';
const fnStart = code.indexOf(fnStartStr);

const fnEndStr = 'function rr(){let u=(0,w.useContext)(lg);';
const fnEnd = code.indexOf(fnEndStr);

if (fnStart === -1 || fnEnd === -1) {
  console.error('Could not find C1 function boundaries in src/main.js');
  process.exit(1);
}

console.log(`Found C1 from ${fnStart} to ${fnEnd} (length: ${fnEnd - fnStart})`);

// Backup main.js first
fs.writeFileSync('src/main.js.pre_sync_bak', code);

// Define new C1 function
const newC1 = `function C1({children:u}){
  let[b,L]=(0,w.useState)(()=>{
    try{
      let f=localStorage.getItem(Rr.PHOTOGRAPHERS);
      return f?JSON.parse(f).map(p=>{let d=Lc.find(x=>x.id===p.id);return d&&!p.phone?{...p,phone:d.phone,mobile:d.mobile}:p}):Lc;
    }catch{return Lc;}
  });
  let[g,c]=(0,w.useState)(()=>{
    try{
      let f=localStorage.getItem(Rr.WORKS);
      return f?JSON.parse(f):F0;
    }catch{return F0;}
  });
  let[M,Q]=(0,w.useState)(()=>{
    try{
      let f=localStorage.getItem(Rr.CUSTOMERS);
      return f?JSON.parse(f):q0;
    }catch{return q0;}
  });
  let[K,J]=(0,w.useState)(()=>{
    try{
      let f=localStorage.getItem(Rr.NOTIFICATIONS);
      return f?JSON.parse(f):V0;
    }catch{return V0;}
  });
  let[F,le]=(0,w.useState)(()=>{
    try{
      let f=localStorage.getItem(Rr.ACTIVITY_LOGS);
      return f?JSON.parse(f):H0;
    }catch{return H0;}
  });
  let[N,C]=(0,w.useState)(()=>{
    try{
      let f=localStorage.getItem(Rr.CURRENT_USER);
      return f?JSON.parse(f):null;
    }catch{return null;}
  });

  (0,w.useEffect)(()=>{try{localStorage.setItem(Rr.PHOTOGRAPHERS,JSON.stringify(b));}catch(e){}},[b]);
  (0,w.useEffect)(()=>{try{localStorage.setItem(Rr.WORKS,JSON.stringify(g));}catch(e){}},[g]);
  (0,w.useEffect)(()=>{try{localStorage.setItem(Rr.CUSTOMERS,JSON.stringify(M));}catch(e){}},[M]);
  (0,w.useEffect)(()=>{try{localStorage.setItem(Rr.NOTIFICATIONS,JSON.stringify(K));}catch(e){}},[K]);
  (0,w.useEffect)(()=>{try{localStorage.setItem(Rr.ACTIVITY_LOGS,JSON.stringify(F));}catch(e){}},[F]);
  (0,w.useEffect)(()=>{try{N?localStorage.setItem(Rr.CURRENT_USER,JSON.stringify(N)):localStorage.removeItem(Rr.CURRENT_USER);}catch(e){}},[N]);

  const fetchCentralData=async()=>{
    try{
      const[pRes,oRes,nRes]=await Promise.all([
        fetch('/api/photographers'),
        fetch('/api/orders'),
        fetch('/api/notifications')
      ]);
      if(pRes.ok){
        const pJson=await pRes.json();
        if(pJson.success&&Array.isArray(pJson.data)){
          L(pJson.data);
        }
      }
      if(oRes.ok){
        const oJson=await oRes.json();
        if(oJson.success&&Array.isArray(oJson.data)){
          c(oJson.data);
        }
      }
      if(nRes.ok){
        const nJson=await nRes.json();
        if(nJson.success&&Array.isArray(nJson.data)){
          J(nJson.data);
        }
      }
    }catch(err){}
  };

  (0,w.useEffect)(()=>{
    fetchCentralData();
    const interval=setInterval(fetchCentralData,4000);
    const onFocus=()=>fetchCentralData();
    window.addEventListener('focus',onFocus);
    return()=>{
      clearInterval(interval);
      window.removeEventListener('focus',onFocus);
    };
  },[]);

  let[S,de]=(0,w.useState)(k1),
      [Te,k]=(0,w.useState)(w1);

  let ie=(0,w.useMemo)(()=>g.map(f=>({
    id:f.id||f.workCode,
    workCode:f.workCode,
    customerName:f.customerName,
    customerPhone:f.customerPhone,
    customerEmail:f.customerEmail||"client@example.com",
    eventType:f.eventType,
    eventDate:f.shootDate,
    eventLocation:f.location||f.shootLocation,
    durationHours:f.duration||f.durationHours||"1 Day",
    budget:f.estimatedBudget||f.finalAmount||25000,
    requirements:f.customerMessage||f.requirements||"Photography & Cinematography requirements.",
    status:f.status,
    assignedPhotographerId:f.assignedPhotographerId,
    matchedPhotographers:f.assignedPhotographerId?[f.assignedPhotographerId]:["c1","c2","c3"],
    createdAt:f.createdAt||new Date().toISOString()
  })),[g]);

  let ce=(0,w.useMemo)(()=>g.filter(f=>["CONFIRMED","IN_PROGRESS","SHOOT_IN_PROGRESS","COMPLETED"].includes(f.status)).map(f=>({
    id:f.workCode,
    workCode:f.workCode,
    enquiryId:f.id,
    customerName:f.customerName,
    customerPhone:f.customerPhone,
    customerEmail:f.customerEmail||"client@example.com",
    photographerId:f.assignedPhotographerId||"c1",
    photographerName:f.assignedPhotographerName||"Assigned Crew",
    packageSelected:f.eventType,
    eventDate:f.shootDate,
    eventLocation:f.location||f.shootLocation,
    totalAmount:f.finalAmount||25000,
    advanceAmount:f.advanceAmount||Math.round((f.finalAmount||25000)*0.4),
    paymentStatus:f.paymentStatus||"ADVANCE_PAID",
    status:f.status==="COMPLETED"?"COMPLETED":"BOOKED",
    timeline:f.timeline||[]
  })),[g]);

  let xe=(f,h,j,E="WORK")=>{
    let $={
      id:\`act_\${Date.now()}_\${Math.random().toString(36).substr(2,4)}\`,
      user:f||"VibeNoww Staff",
      action:h,
      details:j,
      timestamp:new Date().toISOString(),
      category:E
    };
    le(V=>[$,...V]);
  };

  let _=({recipientRole:f,recipientId:h,title:j,message:E,type:$="info",workCode:V=null})=>{
    let U={
      id:\`notif_\${Date.now()}_\${Math.random().toString(36).substr(2,4)}\`,
      recipientRole:f,
      recipientId:h,
      title:j,
      message:E,
      type:$,
      isRead:false,
      timestamp:new Date().toISOString(),
      workCode:V
    };
    J(te=>[U,...te]);
  };

  let se=f=>{
    J(h=>h.map(j=>(j.id===f?{...j,isRead:true}:j)));
    fetch(\`/api/notifications/\${f}/read\`,{method:'PUT'}).catch(()=>{});
  };

  let Pe=()=>{
    J(f=>f.map(h=>({...h,isRead:true})));
    fetch('/api/notifications/read-all',{method:'PUT'}).catch(()=>{});
  };

  let Ve=()=>{
    let f,h=true;
    for(;h;){
      f=\`VN-\${Math.floor(10000+Math.random()*90000)}\`;
      h=g.some(j=>j.workCode===f);
    }
    return f;
  };

  let he=(f,h,j=null)=>{
    let E=Array.isArray(h)?h:[h],
        $=g.find(V=>{
          if(V.assignedPhotographerId!==f||(j&&V.workCode===j)||(V.status!=="CONFIRMED"&&V.status!=="IN_PROGRESS"&&V.status!=="SHOOT_IN_PROGRESS")){
            return false;
          }
          return(V.shootDates&&V.shootDates.length>0?V.shootDates:[V.shootDate]).some(U=>E.includes(U));
        });
    return $?{
      isAvailable:false,
      conflictWork:$,
      conflictDate:($.shootDates||[$.shootDate]).filter(V=>E.includes(V)).join(", ")
    }:{
      isAvailable:true,
      conflictWork:null,
      conflictDate:null
    };
  };

  let ve=f=>{
    let h=Ve(),
        j=f.shootDates&&f.shootDates.length>0?f.shootDates:[f.shootDate||"2026-10-25"],
        E={
          workCode:h,
          customerName:f.customerName||"Valued Client",
          customerPhone:f.phone||f.customerPhone||"+91 98400 00000",
          customerEmail:f.email||f.customerEmail||"client@example.com",
          eventType:f.eventType||"Photography Requirement",
          shootDate:j[0],
          shootDates:j,
          shootTime:f.shootTime||"09:00 AM - 05:00 PM",
          shootLocation:f.eventLocation||f.shootLocation||"Tamil Nadu",
          durationDays:f.durationDays||j.length,
          durationHours:f.durationHours||\`\${j.length*6} Hours\`,
          numberOfPeople:f.guestCount||f.numberOfPeople||"Standard",
          requiredServices:Array.isArray(f.requiredServices)?f.requiredServices:[f.requiredService||"Candid Photography"],
          customerMessage:f.additionalNotes||f.customerMessage||"Looking for professional coverage on VibeNoww.",
          createdAt:new Date().toISOString(),
          status:f.assignedPhotographerId?"ASSIGNED":"NEW",
          assignedPhotographerId:f.assignedPhotographerId||null,
          assignedPhotographerName:f.assignedPhotographerName||null,
          estimatedBudget:Number(f.budget)||Number(f.estimatedBudget)||25000,
          quotation:null,
          finalAmount:Number(f.budget)||Number(f.estimatedBudget)||25000,
          paymentStatus:"PENDING",
          advanceAmount:0,
          timeline:[
            {
              step:"Lead Created",
              date:new Date().toISOString(),
              details:\`Lead \${h} submitted for \${f.eventType||"Photography Requirement"}\`
            }
          ]
        };

    c($=>[E,...$]);

    fetch('/api/orders',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        customerName:E.customerName,
        customerPhone:E.customerPhone,
        customerEmail:E.customerEmail,
        shootType:E.eventType,
        shootDate:E.shootDate,
        shootDates:E.shootDates,
        shootTime:E.shootTime,
        location:E.shootLocation,
        durationDays:E.durationDays,
        durationHours:E.durationHours,
        numberOfPeople:E.numberOfPeople,
        requiredServices:E.requiredServices,
        customerNotes:E.customerMessage,
        estimatedBudget:E.estimatedBudget,
        assignedPhotographerId:E.assignedPhotographerId,
        assignedPhotographerName:E.assignedPhotographerName
      })
    }).then(r=>r.json()).then(res=>{
      fetchCentralData();
    }).catch(e=>console.warn('Order sync notice:',e));

    if(E.assignedPhotographerId){
      _({
        recipientRole:"PHOTOGRAPHER",
        recipientId:E.assignedPhotographerId,
        title:\`New Lead \${h}\`,
        message:\`\${E.customerName} submitted a \${E.eventType} requirement in \${E.shootLocation}.\`,
        type:"new_lead",
        workCode:h
      });
    }

    xe(f.customerName,\`New Lead Created: \${h}\`,\`Created work code \${h} for \${E.eventType}\`,"WORK");
    return E;
  };

  let He=(f,h)=>{
    let j=Number(h.photographyCharge)||0,
        E=Number(h.additionalHours)||0,
        $=Number(h.travelCharge)||0,
        V=Number(h.equipmentCharge)||0,
        U=Number(h.editingCharge)||0,
        te=Number(h.additionalServices)||0,
        ue=Number(h.discount)||0,
        Me=Math.max(0,j+E+$+V+U+te-ue),
        me={
          photographyCharge:j,
          additionalHours:E,
          travelCharge:$,
          equipmentCharge:V,
          editingCharge:U,
          additionalServices:te,
          discount:ue,
          finalAmount:Me,
          quotationNotes:h.quotationNotes||"Standard studio deliverables included.",
          sentAt:new Date().toISOString()
        };

    c(_e=>_e.map(Ye=>{
      if(Ye.workCode===f){
        let xt=[
          ...Ye.timeline||[],
          {
            step:\`Quotation Sent – ₹\${Me.toLocaleString("en-IN")}\`,
            date:new Date().toISOString(),
            details:\`Photographer submitted itemized quotation: Base ₹\${j.toLocaleString("en-IN")} + Addons ₹\${(E+$+V+U+te).toLocaleString("en-IN")} - Disc ₹\${ue.toLocaleString("en-IN")}\`
          }
        ];
        return{...Ye,status:"QUOTED",quotation:me,finalAmount:Me,timeline:xt};
      }
      return Ye;
    }));

    fetch(\`/api/orders/\${f}/quotation\`,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(h)
    }).then(()=>fetchCentralData()).catch(()=>{});

    xe("Photographer",\`Quotation Sent for \${f}\`,\`Sent quotation of ₹\${Me.toLocaleString("en-IN")} for work \${f}\`,"WORK");
    _({
      recipientRole:"PHOTOGRAPHER",
      recipientId:(N==null?void 0:N.id)||"c1",
      title:\`Quotation Sent #\${f}\`,
      message:\`Your itemized quotation of ₹\${Me.toLocaleString("en-IN")} has been delivered to client.\`,
      type:"quotation_sent",
      workCode:f
    });
  };

  let ne=f=>{
    let h=null;
    c(j=>j.map(E=>{
      if(E.workCode===f){
        h=E;
        let $=E.finalAmount||25000,
            V=Math.round($*0.4),
            U=[
              ...E.timeline||[],
              {step:"Customer Accepted",date:new Date().toISOString(),details:"Client confirmed and approved quotation on VibeNoww"},
              {step:"Shoot Confirmed",date:new Date().toISOString(),details:\`Shoot confirmed with Advance of ₹\${V.toLocaleString("en-IN")}\`},
              {step:"Date Reserved",date:new Date().toISOString(),details:\`Calendar dates (\${(E.shootDates||[E.shootDate]).join(", ")}) automatically locked as UNAVAILABLE\`}
            ];
        return{...E,status:"CONFIRMED",paymentStatus:"ADVANCE_PAID",advanceAmount:V,timeline:U};
      }
      return E;
    }));

    fetch(\`/api/orders/\${f}/status\`,{
      method:'PUT',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({status:'CONFIRMED',notes:'Customer accepted quotation'})
    }).then(()=>fetchCentralData()).catch(()=>{});

    if(h&&h.assignedPhotographerId){
      let j=h.shootDates&&h.shootDates.length>0?h.shootDates:[h.shootDate];
      L(E=>E.map($=>{
        if($.id===h.assignedPhotographerId){
          let V=$.bookedDates||[],
              U=Array.from(new Set([...V,...j]));
          return{...$,bookedDates:U};
        }
        return $;
      }));
      _({
        recipientRole:"PHOTOGRAPHER",
        recipientId:h.assignedPhotographerId,
        title:\`Shoot Confirmed! #\${f}\`,
        message:\`Client accepted quotation for \${h.eventType}. Dates \${j.join(", ")} automatically locked in calendar.\`,
        type:"shoot_confirmed",
        workCode:f
      });
    }

    xe("Client",\`Shoot Confirmed: \${f}\`,\`Work \${f} confirmed. Calendar dates locked automatically.\`,"WORK");
  };

  let Be=(f,h,j="")=>{
    let E=null;
    c($=>$.map(V=>{
      if(V.workCode===f){
        E=V;
        let U=\`Status Changed: \${h}\`;
        if(h==="IN_PROGRESS"||h==="SHOOT_IN_PROGRESS")U="Shoot Started";
        else if(h==="COMPLETED")U="Shoot Completed";
        else if(h==="CANCELLED")U="Shoot Cancelled";

        let te=[
          ...V.timeline||[],
          {step:U,date:new Date().toISOString(),details:j||\`Work status updated to \${h}\`}
        ];

        if(h==="COMPLETED"){
          te.push({
            step:"Payment Completed",
            date:new Date().toISOString(),
            details:\`Full settlement of ₹\${(V.finalAmount||0).toLocaleString("en-IN")} acknowledged\`
          });
        }

        return{
          ...V,
          status:h,
          paymentStatus:h==="COMPLETED"?"PAID":V.paymentStatus,
          timeline:te
        };
      }
      return V;
    }));

    fetch(\`/api/orders/\${f}/status\`,{
      method:'PUT',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({status:h,notes:j,actor:(N==null?void 0:N.name)||'Admin'})
    }).then(()=>fetchCentralData()).catch(()=>{});

    if(h==="CANCELLED"&&E&&E.assignedPhotographerId){
      let $=E.shootDates||[E.shootDate];
      L(V=>V.map(U=>U.id===E.assignedPhotographerId?{...U,bookedDates:(U.bookedDates||[]).filter(te=>!$.includes(te))}:U));
    }

    xe("System",\`Work \${f} updated to \${h}\`,j||\`Status changed to \${h}\`,"WORK");
  };

  let Je=(f,h,j)=>{
    L(E=>E.map($=>{
      if($.id===f){
        let V=$.availableDates||[],
            U=$.bookedDates||[];
        if(j==="AVAILABLE"){
          if(!V.includes(h))V=[...V,h].sort();
          U=U.filter(te=>te!==h);
        }else if(j==="UNAVAILABLE"||j==="RESERVED"||j==="BLOCKED"){
          V=V.filter(te=>te!==h);
          if(!U.includes(h))U=[...U,h].sort();
        }
        return{...$,availableDates:V,bookedDates:U};
      }
      return $;
    }));

    if(j==="AVAILABLE"){
      fetch('/api/availability/block',{
        method:'DELETE',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({photographerId:f,date:h})
      }).then(()=>fetchCentralData()).catch(()=>{});
    }else{
      fetch('/api/availability/block',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({photographerId:f,date:h,reason:'Personal Block'})
      }).then(()=>fetchCentralData()).catch(()=>{});
    }

    xe("Photographer",\`Date \${h} marked as \${j}\`,\`Photographer \${f} set calendar date \${h} to \${j}\`,"AVAILABILITY");
  };

  let Z=(f,h)=>{
    let j=(f||"").toLowerCase().trim(),
        E=j.replace(/[^0-9]/g,""),
        $=b.find(U=>{
          var te,ue,Me,me,_e;
          return(
            (U.phone&&U.phone.replace(/[^0-9]/g,"")===E)||
            (U.mobile&&U.mobile.replace(/[^0-9]/g,"")===E)||
            (E&&E.length>=5&&(((te=U.phone)==null?void 0:te.includes(E))||((ue=U.mobile)==null?void 0:ue.includes(E))))||
            ((Me=U.username)==null?void 0:Me.toLowerCase())===j||
            ((me=U.email)==null?void 0:me.toLowerCase())===j||
            ((_e=U.id)==null?void 0:_e.toLowerCase())===j
          );
        });

    if(!$) {
      $ = Lc.find(U=>{
        var te,ue,Me,me,_e;
        return(
          (U.phone&&U.phone.replace(/[^0-9]/g,"")===E)||
          (U.mobile&&U.mobile.replace(/[^0-9]/g,"")===E)||
          (E&&E.length>=5&&(((te=U.phone)==null?void 0:te.includes(E))||((ue=U.mobile)==null?void 0:ue.includes(E))))||
          ((Me=U.username)==null?void 0:Me.toLowerCase())===j||
          ((me=U.email)==null?void 0:me.toLowerCase())===j||
          ((_e=U.id)==null?void 0:_e.toLowerCase())===j
        );
      });
    }

    if(!$) {
      return{success:false,message:"Invalid credentials. Please check your Mobile / Email and password."};
    }

    const appStatus=($.approvalStatus||$.status||'APPROVED').toUpperCase();
    if(appStatus==="PENDING"){
      return{success:false,message:"Your application is currently under review by the VibeNoww administration team. You will be able to access your Photographer Studio after approval."};
    }
    if(appStatus==="REJECTED"){
      return{success:false,message:\`Your application was not approved. \${$.rejectionReason?\`Reason: \${$.rejectionReason}\`:""}\`};
    }
    if(appStatus==="DISABLED"||appStatus==="INACTIVE"){
      return{success:false,message:"This photographer account has been disabled. Please contact VibeNoww administration support."};
    }

    fetch('/api/auth/login',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({identifier:f,password:h})
    }).catch(()=>{});

    let V={
      ...$,
      role:"PHOTOGRAPHER",
      status:$.status||"APPROVED",
      approvalStatus:$.approvalStatus||"APPROVED",
      specialties:Array.isArray($.specialties)?$.specialties:($.specialization?$.specialization.split(",").map(s=>s.trim()).filter(Boolean):["Wedding Photography","Pre-Wedding","Candid","Portrait"]),
      languages:Array.isArray($.languages)?$.languages:["Tamil","English"],
      serviceAreas:Array.isArray($.serviceAreas)?$.serviceAreas:["Tirunelveli","Tenkasi","Madurai","Chennai"],
      portfolio:Array.isArray($.portfolio)?$.portfolio:[],
      bookedDates:Array.isArray($.bookedDates)?$.bookedDates:[],
      availableDates:Array.isArray($.availableDates)?$.availableDates:[]
    };

    C(V);
    return{success:true,user:V};
  };

  let ze=(f,h)=>{
    let j=(f||"").toLowerCase().trim(),
        E=(h||"").trim();

    if(j==="admin"||j==="admin@vibenoww.com"){
      if(E==="123"||E==="1234"||E==="@dmin#123"||E==="123Hema!@#"){
        let $={role:"ADMIN",name:"VibeNoww Admin",email:"admin@vibenoww.com",username:"admin"};
        C($);
        fetch('/api/auth/admin-login',{method:'POST'}).catch(()=>{});
        return{success:true,user:$};
      }
    }
    return{success:false,message:"Invalid Admin credentials. Please check your username and password."};
  };

  let q=()=>{
    C(null);
    fetch('/api/auth/logout',{method:'POST'}).catch(()=>{});
  };

  let re=b.filter(f=>f.status==="APPROVED"||f.approvalStatus==="APPROVED");

  let B=(f,h,j="")=>{
    L(E=>E.map($=>$.id===f?{
      ...$,
      status:h==="APPROVED"?"ACTIVE":(h==="REJECTED"?"INACTIVE":h),
      approvalStatus:h,
      verified:h==="APPROVED"||$.verified,
      rejectionReason:h==="REJECTED"?j:null
    }:$));

    fetch(\`/api/photographers/\${f}/status\`,{
      method:'PUT',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        approvalStatus:h,
        status:h==="APPROVED"?"ACTIVE":(h==="REJECTED"?"INACTIVE":(h==="DISABLED"?"DISABLED":"ACTIVE")),
        reason:j
      })
    }).then(()=>fetchCentralData()).catch(()=>{});

    xe("Admin",\`Creator Status Updated #\${f}\`,\`Status set to \${h}. \${j||""}\`,"CREATOR");
  };

  let je=(f,h)=>{
    L(j=>j.map(E=>{
      if(E.id===f){
        let $={...E,...h};
        if(N&&N.id===f)C({...N,...h});
        return $;
      }
      return E;
    }));

    fetch(\`/api/photographers/\${f}\`,{
      method:'PUT',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(h)
    }).then(()=>fetchCentralData()).catch(()=>{});

    xe("Creator",\`Profile Updated #\${f}\`,\`Updated profile details in central database\`,"PROFILE");
  };

  let I=(f,h)=>{
    L(j=>j.map(E=>{
      if(E.id===f){
        let $={...E,availabilityStatus:h};
        if(N&&N.id===f)C({...N,availabilityStatus:h});
        return $;
      }
      return E;
    }));
  };

  let m=f=>{
    let h={
      id:\`p_\${Date.now()}\`,
      username:f.username||(f.email?f.email.split("@")[0]:\`creator_\${Date.now().toString().slice(-4)}\`),
      password:f.password||"123",
      name:f.name,
      studioName:f.studioName||f.name,
      title:f.title||\`\${f.studioName||f.name} Studio\`,
      category:f.category||"photographer",
      specialties:f.specialties||["Wedding Photography","Candid Photography"],
      location:f.location||"Tirunelveli, Tamil Nadu",
      city:f.city||"Tirunelveli",
      state:f.state||"Tamil Nadu",
      country:"India",
      serviceAreas:f.serviceAreas||["Tirunelveli","Tenkasi","Madurai"],
      rating:5,
      reviewCount:0,
      startingPrice:Number(f.startingPrice)||18000,
      priceUnit:f.priceUnit||"per day",
      experienceYears:Number(f.experienceYears)||3,
      status:"PENDING",
      approvalStatus:"PENDING",
      verified:false,
      featured:false,
      avatar:f.avatar||"",
      coverImage:"https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
      bio:f.bio||"",
      languages:f.languages||["Tamil","English"],
      equipment:f.equipment||"Professional Camera Kit",
      availableDates:[],
      bookedDates:[],
      joinedDate:new Date().toISOString().split("T")[0],
      portfolio:f.portfolio||[],
      packages:[]
    };

    L(j=>[h,...j]);

    fetch('/api/photographers',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(f)
    }).then(r=>r.json()).then(()=>{
      fetchCentralData();
    }).catch(e=>console.warn('Register sync notice:',e));

    return h;
  };

  let fe=(f,h)=>{
    let j=b.find($=>$.id===h),
        E=null;

    c($=>$.map(V=>{
      if(V.workCode===f||V.id===f){
        E=V;
        let U=[
          ...V.timeline||[],
          {step:"Photographer Assigned",date:new Date().toISOString(),details:\`Assigned to \${j?(j.studioName||j.name):h}\`},
          {step:"Shoot Request Dispatched",date:new Date().toISOString(),details:\`Awaiting rate card quotation from \${(j==null?void 0:j.name)||"photographer"}\`}
        ];
        return{
          ...V,
          assignedPhotographerId:h,
          assignedPhotographerName:j?(j.studioName||j.name):V.assignedPhotographerName,
          assignedPhotographerStudio:(j==null?void 0:j.studioName)||(j==null?void 0:j.name),
          assignedPhotographerPhone:j==null?void 0:j.phone,
          status:"PHOTOGRAPHER_MATCHED",
          timeline:U
        };
      }
      return V;
    }));

    fetch(\`/api/orders/\${f}/assign\`,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        photographerId:h,
        photographerName:j?(j.studioName||j.name):'Assigned Photographer'
      })
    }).then(()=>fetchCentralData()).catch(()=>{});

    if(j){
      _({
        recipientRole:"PHOTOGRAPHER",
        recipientId:h,
        title:\`Assigned to Work #\${f}\`,
        message:\`You have been assigned to \${(E==null?void 0:E.customerName)||"Client"}'s \${(E==null?void 0:E.eventType)||"Shoot"}. Please submit your quotation.\`,
        type:"work_assigned",
        workCode:f
      });
    }

    xe("Admin","Assigned Photographer",\`Assigned \${j==null?void 0:j.name} to #\${f}\`,"ADMIN");
  };

  let oe=(f,h,j="")=>{
    let E=b.find(U=>U.id===h),
        $=null,
        V=[];

    c(U=>U.map(te=>{
      if(te.workCode===f||te.id===f){
        $=te.assignedPhotographerId;
        V=te.shootDates||[te.shootDate];
        let ue=[
          ...te.timeline||[],
          {step:"Photographer Replaced",date:new Date().toISOString(),details:\`Photographer replaced with \${(E==null?void 0:E.studioName)||(E==null?void 0:E.name)}. Reason: \${j||"Schedule adjustment"}\`}
        ];
        return{
          ...te,
          assignedPhotographerId:h,
          assignedPhotographerName:E?(E.studioName||E.name):te.assignedPhotographerName,
          assignedPhotographerStudio:(E==null?void 0:E.studioName)||(E==null?void 0:E.name),
          assignedPhotographerPhone:E==null?void 0:E.phone,
          status:"PHOTOGRAPHER_MATCHED",
          timeline:ue
        };
      }
      return te;
    }));

    fetch(\`/api/orders/\${f}/assign\`,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        photographerId:h,
        photographerName:E?(E.studioName||E.name):'Assigned Photographer',
        force:true
      })
    }).then(()=>fetchCentralData()).catch(()=>{});

    if($){
      L(U=>U.map(te=>te.id===$?{...te,bookedDates:(te.bookedDates||[]).filter(ue=>!V.includes(ue))}:te));
    }

    xe("Admin",\`Photographer Replaced on #\${f}\`,\`Replaced with \${E==null?void 0:E.name}. Reason: \${j}\`,"ADMIN");
  };

  let ye=(f,h)=>{
    let j=Number(h.photographyCharge)||0,
        E=Number(h.additionalHours)||0,
        $=Number(h.travelCharge)||0,
        V=Number(h.equipmentCharge)||0,
        U=Number(h.editingCharge)||0,
        te=Number(h.otherCharge)||0,
        ue=j+E+$+V+U+te,
        Me={
          photographyCharge:j,
          additionalHours:E,
          travelCharge:$,
          equipmentCharge:V,
          editingCharge:U,
          otherCharge:te,
          totalPhotographerCost:ue,
          status:h.status||"RECEIVED",
          notes:h.notes||"",
          updatedAt:new Date().toISOString()
        };

    c(me=>me.map(_e=>{
      if(_e.workCode===f||_e.id===f){
        let Ye=[
          ..._e.timeline||[],
          {step:\`Photographer Rate Received – ₹\${ue.toLocaleString("en-IN")}\`,date:new Date().toISOString(),details:\`Photographer cost calculated: ₹\${ue.toLocaleString("en-IN")} (Base: ₹\${j.toLocaleString("en-IN")}, Addons: ₹\${(E+$+V+U+te).toLocaleString("en-IN")})\`}
        ];
        return{..._e,photographerCost:ue,photographerQuotation:Me,status:"QUOTATION_PREPARING",timeline:Ye};
      }
      return _e;
    }));

    fetch(\`/api/orders/\${f}/quotation\`,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({...h,photographerCost:ue})
    }).then(()=>fetchCentralData()).catch(()=>{});

    xe("Admin",\`Recorded Photographer Rate #\${f}\`,\`Photographer cost set to ₹\${ue.toLocaleString("en-IN")}\`,"ADMIN");
  };

  let y=(f,h,j=false)=>{
    let E=Number(h.photography)||0,
        $=Number(h.videography)||0,
        V=Number(h.additionalServices)||0,
        U=Number(h.travel)||0,
        te=Number(h.editing)||0,
        ue=Number(h.album)||0,
        Me=Number(h.otherCharges)||0,
        me=Number(h.discount)||0,
        _e=E+$+V+U+te+ue+Me,
        Ye=Math.max(0,_e-me);

    c(xt=>xt.map(et=>{
      var Ce;
      if(et.workCode===f||et.id===f){
        let ut=et.photographerCost||((Ce=et.quotation)==null?void 0:Ce.photographyCharge)||Math.round(Ye*0.75),
            mt=Math.max(0,Ye-ut),
            nr={
              photography:E,
              videography:$,
              additionalServices:V,
              travel:U,
              editing:te,
              album:ue,
              otherCharges:Me,
              discount:me,
              photographerCost:ut,
              studioMargin:mt,
              finalCustomerPrice:Ye,
              status:j?"SENT":(h.status||"DRAFT"),
              notes:h.notes||"",
              updatedAt:new Date().toISOString()
            },
            vt=[
              ...et.timeline||[],
              {step:j?\`Customer Quotation Sent – ₹\${Ye.toLocaleString("en-IN")}\`:\`Quotation Draft Prepared – ₹\${Ye.toLocaleString("en-IN")}\`,date:new Date().toISOString(),details:\`Customer Price: ₹\${Ye.toLocaleString("en-IN")} (Studio Margin: ₹\${mt.toLocaleString("en-IN")})\`}
            ];
        return{
          ...et,
          finalAmount:Ye,
          customerPrice:Ye,
          studioMargin:mt,
          photographerCost:ut,
          customerQuotation:nr,
          status:j?"QUOTATION_SENT":et.status,
          timeline:vt
        };
      }
      return et;
    }));

    fetch(\`/api/orders/\${f}/quotation\`,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({...h,finalAmount:Ye,status:j?'SENT':'DRAFT'})
    }).then(()=>fetchCentralData()).catch(()=>{});

    xe("Admin",\`Prepared Customer Quotation #\${f}\`,\`Quotation set to ₹\${Ye.toLocaleString("en-IN")} (Send: \${j})\`,"ADMIN");
  };

  let W=(f,h=null,j=null)=>{
    let E=null;
    c($=>$.map(V=>{
      var U,te;
      if(V.workCode===f||V.id===f){
        E=V;
        let ue=h===null?(V.finalAmount||V.customerPrice||25000):h,
            Me=j===null?(V.photographerCost||Math.round(ue*0.75)):j,
            me=Math.max(0,ue-Me),
            _e=Math.round(ue*0.4),
            Ye=[
              ...V.timeline||[],
              {step:"Customer Accepted Quotation",date:new Date().toISOString(),details:\`Customer accepted final rate of ₹\${ue.toLocaleString("en-IN")}\`},
              {step:"Shoot Confirmed",date:new Date().toISOString(),details:"Order confirmed. Calendar dates locked as UNAVAILABLE."}
            ];
        return{
          ...V,
          status:"CONFIRMED",
          finalAmount:ue,
          customerPrice:ue,
          photographerCost:Me,
          studioMargin:me,
          paymentStatus:V.paymentStatus==="PAID"?"PAID":"ADVANCE_PAID",
          advanceAmount:V.advanceAmount||_e,
          customerPayment:{
            totalAmount:ue,
            advanceRequired:_e,
            advanceReceived:V.advanceAmount||_e,
            balance:Math.max(0,ue-(V.advanceAmount||_e)),
            status:"ADVANCE_PAID",
            records:((U=V.customerPayment)==null?void 0:U.records)||[
              {
                id:\`pay_\${Date.now()}\`,
                date:new Date().toISOString().split("T")[0],
                amount:V.advanceAmount||_e,
                method:"UPI / Online Transfer",
                refId:\`UPI-\${Math.floor(100000+Math.random()*900000)}\`,
                notes:"Booking advance payment"
              }
            ]
          },
          photographerPayment:{
            agreedCost:Me,
            advancePaid:Math.round(Me*0.3),
            balance:Math.max(0,Me-Math.round(Me*0.3)),
            status:"PARTIALLY_PAID",
            records:((te=V.photographerPayment)==null?void 0:te.records)||[
              {
                id:\`payout_\${Date.now()}\`,
                date:new Date().toISOString().split("T")[0],
                amount:Math.round(Me*0.3),
                method:"Bank Transfer (IMPS)",
                refId:\`IMPS-\${Math.floor(100000+Math.random()*900000)}\`,
                notes:"Photographer booking advance payout"
              }
            ]
          },
          timeline:Ye
        };
      }
      return V;
    }));

    fetch(\`/api/orders/\${f}/status\`,{
      method:'PUT',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({status:'CONFIRMED',notes:'Confirmed booking'})
    }).then(()=>fetchCentralData()).catch(()=>{});

    if(E&&E.assignedPhotographerId){
      let $=E.shootDates||[E.shootDate];
      L(V=>V.map(U=>{
        if(U.id===E.assignedPhotographerId){
          let te=U.bookedDates||[];
          return{...U,bookedDates:Array.from(new Set([...te,...$]))};
        }
        return U;
      }));
    }

    xe("Admin",\`Order Confirmed #\${f}\`,"Locked shoot dates and confirmed booking","ADMIN");
  };

  let X=(f,h,j)=>{
    let E=Number(j.amount)||0,
        $={
          id:\`pay_\${Date.now()}_\${Math.random().toString(36).substr(2,4)}\`,
          date:j.date||new Date().toISOString().split("T")[0],
          amount:E,
          method:j.method||"UPI",
          refId:j.refId||\`TXN-\${Math.floor(100000+Math.random()*900000)}\`,
          notes:j.notes||""
        };

    c(V=>V.map(U=>{
      var te,ue,Me,me,_e,Ye;
      if(U.workCode===f||U.id===f){
        if(h==="CUSTOMER"){
          let xt=(((te=U.customerPayment)==null?void 0:te.advanceReceived)||U.advanceAmount||0)+E,
              et=((ue=U.customerPayment)==null?void 0:ue.totalAmount)||U.finalAmount||U.customerPrice||25000,
              Ce=Math.max(0,et-xt),
              ut=Ce<=0?"PAID":(xt>0?"PARTIALLY_PAID":"NOT_PAID"),
              mt=[
                ...U.timeline||[],
                {step:\`Payment Received – ₹\${E.toLocaleString("en-IN")}\`,date:new Date().toISOString(),details:\`Received via \${$.method} (Ref: \${$.refId}). Balance remaining: ₹\${Ce.toLocaleString("en-IN")}\`}
              ];
          return{
            ...U,
            paymentStatus:ut,
            advanceAmount:xt,
            customerPayment:{
              ...U.customerPayment||{},
              totalAmount:et,
              advanceReceived:xt,
              balance:Ce,
              status:ut,
              records:[$,...((Me=U.customerPayment)==null?void 0:Me.records)||[]]
            },
            timeline:mt
          };
        }else{
          let xt=(((me=U.photographerPayment)==null?void 0:me.advancePaid)||0)+E,
              et=((_e=U.photographerPayment)==null?void 0:_e.agreedCost)||U.photographerCost||18000,
              Ce=Math.max(0,et-xt),
              ut=Ce<=0?"PAID":(xt>0?"PARTIALLY_PAID":"PENDING"),
              mt=[
                ...U.timeline||[],
                {step:\`Photographer Payout – ₹\${E.toLocaleString("en-IN")}\`,date:new Date().toISOString(),details:\`Paid to photographer via \${$.method} (Ref: \${$.refId}). Payout balance: ₹\${Ce.toLocaleString("en-IN")}\`}
              ];
          return{
            ...U,
            photographerPayment:{
              ...U.photographerPayment||{},
              agreedCost:et,
              advancePaid:xt,
              balance:Ce,
              status:ut,
              records:[$,...((Ye=U.photographerPayment)==null?void 0:Ye.records)||[]]
            },
            timeline:mt
          };
        }
      }
      return U;
    }));

    fetch('/api/payments',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        workCode:f,
        amount:E,
        paymentType:h==="CUSTOMER"?"ADVANCE":"SETTLEMENT",
        paymentMethod:j.method||"UPI",
        transactionReference:j.refId,
        notes:j.notes
      })
    }).then(()=>fetchCentralData()).catch(()=>{});

    xe("Admin",\`Payment Recorded #\${f}\`,\`Recorded \${h} payment of ₹\${E.toLocaleString("en-IN")}\`,"PAYMENT");
  };

  let ae=(f,h="",j="")=>{
    let E=null;
    c($=>$.map(V=>{
      if(V.workCode===f||V.id===f){
        E=V;
        let U=[
          ...V.timeline||[],
          {step:"Work Marked Incomplete",date:new Date().toISOString(),details:\`Reason: \${h||"Incomplete order"}. Details: \${j||"Requires admin review"}\`}
        ];
        return{...V,status:"INCOMPLETE",incompleteReason:h,incompleteDetails:j,timeline:U};
      }
      return V;
    }));

    fetch(\`/api/orders/\${f}/status\`,{
      method:'PUT',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({status:'INCOMPLETE',reason:h,notes:j})
    }).then(()=>fetchCentralData()).catch(()=>{});

    if(E&&E.assignedPhotographerId){
      let $=E.shootDates||[E.shootDate];
      L(V=>V.map(U=>U.id===E.assignedPhotographerId?{...U,bookedDates:(U.bookedDates||[]).filter(te=>!$.includes(te))}:U));
    }

    xe("Admin",\`Work Marked Incomplete #\${f}\`,\`Reason: \${h}\`,"ADMIN");
  };

  let Se=(f,h="")=>{
    c(j=>j.map(E=>{
      if(E.workCode===f||E.id===f){
        let $=[
          ...E.timeline||[],
          {step:"Work Reopened",date:new Date().toISOString(),details:\`Order reopened by admin. \${h?\`Note: \${h}\`:""}\`}
        ];
        return{...E,status:"REVIEWING",incompleteReason:null,incompleteDetails:null,timeline:$};
      }
      return E;
    }));

    fetch(\`/api/orders/\${f}/status\`,{
      method:'PUT',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({status:'REVIEWING',notes:h})
    }).then(()=>fetchCentralData()).catch(()=>{});

    xe("Admin",\`Reopened Work #\${f}\`,h||"Reopened order for processing","ADMIN");
  };

  let ke=(f,h,j)=>{
    if(!j||!j.trim())return;
    let E={
      id:\`note_\${Date.now()}\`,
      date:new Date().toISOString(),
      text:j.trim(),
      author:"Studio Admin"
    };

    c($=>$.map(V=>{
      if(V.workCode===f||V.id===f){
        return h==="CUSTOMER"
          ?{...V,customerCommunicationNotes:[E,...V.customerCommunicationNotes||[]]}
          :(h==="PHOTOGRAPHER"
            ?{...V,photographerCommunicationNotes:[E,...V.photographerCommunicationNotes||[]]}
            :{...V,internalAdminNotes:[E,...V.internalAdminNotes||[]]});
      }
      return V;
    }));

    xe("Admin",\`Added \${h} note to #\${f}\`,j,"ADMIN");
  };

  return(0,r.jsx)(lg.Provider,{
    value:{
      photographers:b,
      setPhotographers:L,
      publicApprovedPhotographers:re,
      works:g,
      setWorks:c,
      enquiries:ie,
      bookings:ce,
      reviews:S,
      automationLogs:Te,
      createWork:ve,
      createOrder:ve,
      submitWorkQuotation:He,
      acceptWorkQuotation:ne,
      updateWorkStatus:Be,
      assignPhotographerToWork:fe,
      replacePhotographerOnWork:oe,
      savePhotographerQuotation:ye,
      saveCustomerQuotation:y,
      confirmCustomerOrder:W,
      recordPayment:X,
      markWorkCompleted:(f,h)=>Be(f,"COMPLETED",h),
      markWorkIncomplete:ae,
      reopenWork:Se,
      addWorkNote:ke,
      checkPhotographerAvailability:(f,h=[],j=null)=>{
        let E=Array.isArray(h)&&h.length>0?h:["2026-10-25"],
            $=b.find(te=>te.id===f);
        if(!$)return{isAvailable:false,reason:"Photographer not found"};
        if($.status!=="APPROVED"&&$.approvalStatus!=="APPROVED")return{isAvailable:false,reason:\`Status is \${$.status||$.approvalStatus}\`};
        let V=$.bookedDates||[],
            U=E.find(te=>V.includes(te));
        if(U){
          let te=g.find(ue=>ue.assignedPhotographerId===f&&ue.workCode!==j&&(ue.status==="CONFIRMED"||ue.status==="SHOOT_IN_PROGRESS"||ue.status==="IN_PROGRESS")&&(ue.shootDates||[ue.shootDate]).includes(U));
          return{isAvailable:false,conflictDate:U,conflictWork:te||null,reason:\`Reserved on \${U} (\${te?te.eventType:"Confirmed Shoot"})\`};
        }
        return{isAvailable:true,conflictDate:null,conflictWork:null,reason:"Available for requested shoot date(s)"};
      },
      isPhotographerAvailableOnDate:he,
      setPhotographerDateAvailability:Je,
      customers:M,
      notifications:K,
      markNotificationAsRead:se,
      markAllNotificationsAsRead:Pe,
      activityLogs:F,
      currentUser:N,
      setCurrentUser:C,
      loginAsAdmin:ze,
      loginAsPhotographer:Z,
      logout:q,
      updatePhotographerStatus:B,
      updatePhotographerProfile:je,
      setPhotographerAvailability:I,
      registerPhotographer:m,
      submitCustomerEnquiry:f=>ve(f),
      updateEnquiryStatus:(f,h)=>{
        c(j=>j.map(E=>(E.id===f||E.workCode===f?{...E,status:h}:E)));
        fetch(\`/api/orders/\${f}/status\`,{
          method:'PUT',
          headers:{'Content-Type':'application/json'},
          body:JSON.stringify({status:h})
        }).then(()=>fetchCentralData()).catch(()=>{});
        xe("Admin",\`Enquiry #\${f} status changed\`,\`Status set to \${h}\`,"ADMIN");
      },
      assignPhotographerToEnquiry:(f,h)=>{fe(f,h);},
      createBookingFromEnquiry:(f,h)=>{W(f,Number(h.totalAmount)||25000);},
      updateBookingStatus:(f,h)=>{Be(f,h);},
      moderateReview:(f,h)=>{
        de(j=>j.map(E=>(E.id===f?{...E,status:h}:E)));
        xe("Admin",\`Review Moderated #\${f}\`,\`Status set to \${h}\`,"ADMIN");
      },
      addAdminNote:(f,h,j)=>{ke(h,"INTERNAL",j);},
      findMatchingPhotographers:f=>(f?re.filter(h=>h.status==="APPROVED"||h.approvalStatus==="APPROVED"):re),
      triggerAutomatedCommunication:f=>{
        let h={id:\`auto_\${Date.now()}\`,timestamp:new Date().toISOString(),...f};
        k(j=>[h,...j]);
      }
    },
    children:u
  });
}`;

const updatedCode = code.substring(0, fnStart) + newC1 + code.substring(fnEnd);
fs.writeFileSync(mainJsPath, updatedCode);
console.log('Successfully updated src/main.js with Centralized Data Provider!');
