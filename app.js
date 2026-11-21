(function(){
'use strict';
const WA={J:'5586999588325',R:'5586998165734'};
const GREET={J:'Olá, João! Vim pelo biolink da Angeline · Angeline.',R:'Olá, João Ricardo! Vim pelo biolink da Angeline · Angeline.'};
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
const $=(s,r)=>(r||document).querySelector(s);
const $$=(s,r)=>Array.prototype.slice.call((r||document).querySelectorAll(s));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const easeOut=t=>1-Math.pow(1-t,3);
const easeBack=t=>{const c=1.5;return 1+(c+1)*Math.pow(t-1,3)+c*Math.pow(t-1,2)};
const easeIO=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;

/* ---------- WhatsApp em linhas separadas ---------- */
function waUrl(who,fields,closing){
  const lines=[GREET[who],''];
  fields.forEach(f=>{const v=f.replace(/^[^:]+:\s*/,'');if(f.indexOf(':')<0||v.trim())lines.push(f.trim())});
  lines.push('',closing+'.');
  return 'https://wa.me/'+WA[who]+'?text='+encodeURIComponent(lines.join('\n'));
}
function bindWa(root){
  $$('[data-wa]',root).forEach(a=>{
    const p=a.getAttribute('data-wa').split('|');
    a.href=waUrl(p[0],p.slice(1,-1),p[p.length-1]);
  });
}
bindWa();

/* ---------- botoes magneticos (brilho segue o dedo) ---------- */
document.addEventListener('pointermove',e=>{
  const b=e.target.closest&&e.target.closest('.btn');if(!b)return;
  const r=b.getBoundingClientRect();
  b.style.setProperty('--mx',(e.clientX-r.left)+'px');b.style.setProperty('--my',(e.clientY-r.top)+'px');b.style.setProperty('--mo',1);
},{passive:true});
document.addEventListener('pointerout',e=>{const b=e.target.closest&&e.target.closest('.btn');if(b)b.style.setProperty('--mo',0)},{passive:true});
document.addEventListener('pointerdown',e=>{const b=e.target.closest&&e.target.closest('.btn');if(!b)return;const r=b.getBoundingClientRect();b.style.setProperty('--mx',(e.clientX-r.left)+'px');b.style.setProperty('--my',(e.clientY-r.top)+'px');b.style.setProperty('--mo',1)},{passive:true});

/* ============================================================
   ABERTURA 3D: OS DOIS PILARES (WebGL)
   ============================================================ */
const open=$('#open'),cv=$('#pillars'),curtain=$('#curtain');
let entering=false,entered=false,openRaf=0,openDispose=null;
document.documentElement.classList.add('locked');

function setCall(txt,hide){const c=$('#ocall');$('#octext').textContent=txt;c.classList.toggle('hide',!!hide)}
function showEnter(){const e=$('#enter');e.classList.add('show');e.tabIndex=0}

function enterSite(){
  if(entering)return;entering=true;
  const sheets=$$('i',curtain);
  const done=()=>{
    open.classList.add('gone');document.documentElement.classList.remove('locked');
    document.documentElement.classList.add('entered');document.body.classList.add('entered');
    window.scrollTo(0,0);entered=true;if(openDispose)openDispose();
    startSite();
  };
  if(reduce){done();curtain.style.display='none';return}
  curtain.style.pointerEvents='auto';
  const D=760,G=95,ez='cubic-bezier(.7,0,.2,1)';
  sheets.forEach((s,i)=>s.animate([{transform:'translateY(105%)'},{transform:'translateY(0)'}],{duration:D,delay:i*G,easing:ez,fill:'forwards'}));
  setTimeout(()=>{
    done();
    sheets.forEach((s,i)=>s.animate([{transform:'translateY(0)'},{transform:'translateY(-108%)'}],{duration:D,delay:(4-i)*G,easing:ez,fill:'forwards'}));
    setTimeout(()=>{curtain.style.display='none'},D+5*G+80);
  },D+4*G+70);
}
$('#skip').addEventListener('click',enterSite);
$('#enter').addEventListener('click',enterSite);

(function initOpening(){
  const fallback=()=>{setCall('Toque para entrar');showEnter();$('#ocall').classList.add('hide')};
  if(!window.THREE||reduce){fallback();return}
  let R;
  try{
    const T=THREE;
    R=new T.WebGLRenderer({canvas:cv,antialias:true,alpha:true});
    R.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
    const W=cv.clientWidth||340,H=cv.clientHeight||340;R.setSize(W,H,false);
    const scene=new T.Scene(),cam=new T.PerspectiveCamera(38,W/H,.1,80);
    cam.position.set(0,3.6,15.2);cam.lookAt(0,2.6,0);
    scene.add(new T.AmbientLight(0xffffff,.34));
    scene.add(new T.HemisphereLight(0xdfe8e1,0x2d3830,.4));
    const dl=new T.DirectionalLight(0xffffff,.62);dl.position.set(6,9,8);scene.add(dl);
    const rim=new T.PointLight(0xdfe8e1,.9,24);rim.position.set(-5,4,-4);scene.add(rim);
    const world=new T.Group();scene.add(world);

    /* piso */
    const floor=new T.Mesh(new T.CylinderGeometry(4.5,4.5,.3,72),new T.MeshStandardMaterial({color:0x2d3830,roughness:.55,metalness:.1}));floor.position.y=-.15;world.add(floor);
    const edge=new T.Mesh(new T.TorusGeometry(4.5,.035,8,96),new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.5}));edge.rotation.x=Math.PI/2;world.add(edge);
    const ring2=new T.Mesh(new T.TorusGeometry(3.4,.02,8,96),new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.18}));ring2.rotation.x=Math.PI/2;ring2.position.y=.02;world.add(ring2);

    /* pilares: barras inclinadas como na logo */
    const shp=new T.Shape();shp.moveTo(-.55,0);shp.lineTo(.55,0);shp.lineTo(-.45,5.2);shp.lineTo(-1.65,5.2);shp.lineTo(-.55,0);
    const geo=new T.ExtrudeGeometry(shp,{depth:.9,bevelEnabled:true,bevelThickness:.06,bevelSize:.05,bevelSegments:2});geo.translate(.55,0,-.45);
    const pmat=new T.MeshStandardMaterial({color:0xc9d4cc,roughness:.45,metalness:.08,emissive:0x1f2822,emissiveIntensity:.2});
    const pil={J:new T.Mesh(geo,pmat),R:new T.Mesh(geo,pmat)};
    const base=new T.BoxGeometry(2.3,.22,1.5),bmat=new T.MeshStandardMaterial({color:0x445149,roughness:.5});
    const bs={J:new T.Mesh(base,bmat),R:new T.Mesh(base,bmat)};
    ['J','R'].forEach(k=>{pil[k].scale.y=.001;bs[k].position.y=.11;world.add(bs[k]);world.add(pil[k])});
    /* folha da logo */
    const ls=new T.Shape();ls.moveTo(0,0);ls.bezierCurveTo(.1,1.1,.9,1.8,1.9,1.95);ls.bezierCurveTo(1.45,1.5,1.15,.75,1.2,.05);ls.bezierCurveTo(.8,-.12,.35,-.1,0,0);
    const leaf=new T.Mesh(new T.ExtrudeGeometry(ls,{depth:.35,bevelEnabled:true,bevelThickness:.04,bevelSize:.04,bevelSegments:2}),pmat);leaf.scale.setScalar(.001);world.add(leaf);

    /* placas com as atribuicoes */
    function plateTex(txt,dark){
      const c=document.createElement('canvas');c.width=440;c.height=160;const x=c.getContext('2d');
      const tex=new T.CanvasTexture(c);tex.anisotropy=4;
      const draw=()=>{
        x.clearRect(0,0,440,160);
        const r=52;x.beginPath();x.moveTo(8+r,8);x.arcTo(432,8,432,152,r);x.arcTo(432,152,8,152,r);x.arcTo(8,152,8,8,r);x.arcTo(8,8,432,8,r);x.closePath();
        x.fillStyle=dark?'#5d6d62':'#ffffff';x.fill();
        x.fillStyle=dark?'#ffffff':'#1f2822';x.textAlign='center';x.textBaseline='middle';
        let fs=60;x.font='700 '+fs+'px Outfit,Figtree,sans-serif';
        while(x.measureText(txt).width>350&&fs>26){fs-=2;x.font='700 '+fs+'px Outfit,Figtree,sans-serif'}
        x.fillText(txt,220,86);tex.needsUpdate=true;
      };
      draw();if(document.fonts&&document.fonts.load){document.fonts.load('700 50px Outfit').then(draw)}
      return tex;
    }
    function labelTex(txt){
      const c=document.createElement('canvas');c.width=560;c.height=130;const x=c.getContext('2d');const tex=new T.CanvasTexture(c);
      const draw=()=>{x.clearRect(0,0,560,130);x.fillStyle='#ffffff';x.textAlign='center';x.textBaseline='middle';x.font='800 70px Outfit,Figtree,sans-serif';x.fillText(txt,280,68);tex.needsUpdate=true};
      draw();if(document.fonts&&document.fonts.load){document.fonts.load('800 60px Outfit').then(draw)}return tex;
    }
    const pg=new T.PlaneGeometry(1.95,.71);
    const JL=['Licitações','Contratos','Pregão','OAB-PI'],RL=['Administrativo','Civil','Eleitoral','Consumidor','Municipal','IA no Direito'];
    const plates=[];
    const mk=(txt,who,i,n)=>{
      const mat=new T.MeshBasicMaterial({map:plateTex(txt,who==='R'),transparent:true,depthWrite:false});
      const m=new T.Group();const a=new T.Mesh(pg,mat),b2=new T.Mesh(pg,mat);b2.rotation.y=Math.PI;b2.position.z=-.002;m.add(a);m.add(b2);
      m.visible=false;world.add(m);plates.push({m,mat,who,i,n});
    };
    JL.forEach((t,i)=>mk(t,'J',i,JL.length));RL.forEach((t,i)=>mk(t,'R',i,RL.length));
    plates.forEach((p,idx)=>{p.k=idx});
    const labels={};
    [['J','João Angeline'],['R','João Ricardo']].forEach(a=>{
      const m=new T.Mesh(new T.PlaneGeometry(3.4,.79),new T.MeshBasicMaterial({map:labelTex(a[1]),transparent:true,depthWrite:false}));
      m.position.set(a[0]==='J'?-2.3:2.3,6.15,0);m.visible=false;world.add(m);labels[a[0]]=m;
    });
    /* particulas */
    const NP=70,pp=new Float32Array(NP*3);for(let i=0;i<NP;i++){const a=Math.random()*6.283,r=1+Math.random()*3.6;pp[i*3]=Math.cos(a)*r;pp[i*3+1]=Math.random()*7;pp[i*3+2]=Math.sin(a)*r}
    const pg2=new T.BufferGeometry();pg2.setAttribute('position',new T.BufferAttribute(pp,3));
    const pts=new T.Points(pg2,new T.PointsMaterial({color:0xffffff,size:.07,transparent:true,opacity:.55,depthWrite:false}));world.add(pts);

    /* estado */
    const st={phase:0,rise:0,unite:0,leaf:0,t:0,rot:0,vrot:0};
    let t0=performance.now(),last=t0,riseT=-1,uniteT=-1,doneT=-1,shownEnter=false;
    const A=2.5,U=1.2;
    function frame(now){
      openRaf=requestAnimationFrame(frame);
      const dt=Math.min(.05,(now-last)/1000);last=now;st.t+=dt;
      if(riseT>=0)st.rise=clamp((now-riseT)/1500,0,1);
      if(uniteT>=0)st.unite=clamp((now-uniteT)/1700,0,1);
      const rs=st.rise>0?easeBack(st.rise):0,un=easeIO(st.unite);
      const px=lerp(A,U,un);
      pil.J.position.x=-px-.5;pil.R.position.x=px-.5;
      bs.J.position.x=-px;bs.R.position.x=px;
      pil.J.scale.y=Math.max(.001,rs);pil.R.scale.y=Math.max(.001,rs);
      bs.J.scale.x=lerp(1,.7,un);bs.R.scale.x=lerp(1,.7,un);
      if(st.unite>=1){st.leaf=clamp(st.leaf+dt/.8,0,1)}
      const lf=easeBack(st.leaf);leaf.scale.setScalar(Math.max(.001,lf*.72));leaf.position.set(-U-2.3,.02,-.13);
      leaf.rotation.z=.04;
      /* rotacao do mundo: arrasto + balanco continuo */
      if(!drag){st.rot+=st.vrot;st.vrot*=.94}
      world.rotation.y=st.rot+Math.sin(st.t*.35)*.22+(st.unite>=1?st.t*.0:0);
      labels.J.visible=labels.R.visible=st.rise>.35&&un<.98;
      const la=clamp((st.rise-.35)/.5,0,1)*(1-clamp(un*1.6,0,1));labels.J.material.opacity=labels.R.material.opacity=la;
      labels.J.position.x=-px-.2;labels.R.position.x=px-.2;
      labels.J.rotation.y=labels.R.rotation.y=-world.rotation.y;
      /* placas em orbita */
      plates.forEach(p=>{
        const show=st.rise>.2;p.m.visible=show;if(!show)return;
        const ap=clamp((st.rise-.2)/.6,0,1);
        const sp=p.who==='J'?.55:-.5;
        const th=p.i/p.n*6.2832+st.t*sp+(p.who==='R'?.5:0);
        const rr=p.who==='J'?1.8:2.0;
        const cx=(p.who==='J'?-px:px)-.2;
        const y1=.95+(p.i%3)*1.45+Math.sin(st.t*1.3+p.k)*.12;
        const xb=cx+Math.cos(th)*rr,zb=Math.sin(th)*rr;
        const th2=p.k/plates.length*6.2832+st.t*.42;
        const R2=3.2,y2=1.25+(p.k%4)*1.15+Math.sin(st.t*1.1+p.k)*.1;
        const xa=Math.cos(th2)*R2,za=Math.sin(th2)*R2;
        p.m.position.set(lerp(xb,xa,un),lerp(y1,y2,un)*ap+(1-ap)*.2,lerp(zb,za,un));
        const ang=Math.atan2(p.m.position.z,p.m.position.x-lerp(cx,0,un));
        p.m.rotation.y=-ang+Math.PI/2;
        p.m.scale.setScalar(.35+.65*ap);
        p.mat.opacity=ap*.97;
      });
      /* particulas subindo */
      const a=pg2.attributes.position;for(let i=0;i<NP;i++){a.array[i*3+1]+=dt*(.25+(i%5)*.06);if(a.array[i*3+1]>7.5)a.array[i*3+1]=0}a.needsUpdate=true;
      ring2.scale.setScalar(1+Math.sin(st.t*1.4)*.02);
      R.render(scene,cam);
      /* fases automaticas */
      if(uniteT>=0&&!shownEnter&&now-uniteT>2000){shownEnter=true;setCall('',true);showEnter()}
      if(uniteT>=0&&doneT<0&&now-uniteT>3600&&location.hash!=='#hold'){doneT=now;enterSite()}
    }
    /* entrada do usuario */
    let drag=false,lx=0,moved=0;
    function advance(){
      if(st.phase===0){st.phase=1;riseT=performance.now();setCall('Toque para unir os sócios')}
      else if(st.phase===1&&st.rise>.7){st.phase=2;uniteT=performance.now();setCall('Sócios reunidos',false);open.classList.add('flash')}
    }
    cv.addEventListener('pointerdown',e=>{drag=true;lx=e.clientX;moved=0;st.vrot=0;try{cv.setPointerCapture(e.pointerId)}catch(x){}});
    cv.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-lx;lx=e.clientX;moved+=Math.abs(dx);st.rot+=dx*.012;st.vrot=dx*.0016});
    const up=()=>{if(!drag)return;drag=false;if(moved<9)advance()};
    cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',()=>{drag=false});
    $('#ocall').addEventListener('click',advance);
    openRaf=requestAnimationFrame(frame);
    openDispose=()=>{cancelAnimationFrame(openRaf);try{R.dispose()}catch(x){}};
    window.__open={st,advance};
  }catch(err){console.warn('3D indisponível',err);fallback()}
})();

/* ============================================================
   SITE (depois da entrada)
   ============================================================ */
const secs=$$('main .sec');
const vh=()=>window.innerHeight;
let siteOn=false;

/* folhas empilhadas */
function setTops(){secs.forEach(s=>{s.style.top=Math.min(0,vh()-s.offsetHeight)+'px'})}
document.documentElement.classList.add('stack');
setTops();
addEventListener('resize',setTops);addEventListener('load',setTops);
if(window.ResizeObserver){const ro=new ResizeObserver(setTops);secs.forEach(s=>ro.observe(s))}
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(setTops);

const menuLinks=$$('.menu a');
let activeM='';
function setActive(m){if(m===activeM)return;activeM=m;menuLinks.forEach(a=>a.classList.toggle('on',a.dataset.m===m));if(SAY&&mtext&&mascot.classList.contains('show')&&SAY[m])mtext.textContent=SAY[m]}
menuLinks.forEach(a=>a.addEventListener('click',e=>{
  e.preventDefault();const s=$(a.getAttribute('href'));if(!s)return;
  window.scrollTo({top:s.offsetTop,behavior:reduce?'auto':'smooth'});
}));

/* reveal */
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12});
$$('.rv,.gallery figure').forEach(n=>io.observe(n));

/* ---------- rolagem: pilha, menu, trilho, paralaxe ---------- */
const duoImg=$('.duo img'),evs=$$('.ev'),fj=$('#fj'),fr=$('#fr'),tl=$('#tl');
let ticking=false;
function onScroll(){
  if(ticking)return;ticking=true;
  requestAnimationFrame(()=>{
    ticking=false;const V=vh();let cur=secs[0];
    secs.forEach((s,i)=>{
      const r=s.getBoundingClientRect();
      if(r.top<=V*.5)cur=s;
      const n=secs[i+1];
      if(!n){return}
      const nt=n.getBoundingClientRect().top;
      const p=clamp(1-nt/V,0,1);
      if(p>0&&r.bottom>0){
        s.style.setProperty('--dim',(p*.62).toFixed(3));
        if(!reduce){s.style.transformOrigin='50% '+(V*.5-r.top).toFixed(0)+'px';s.style.transform='scale('+(1-.06*p).toFixed(4)+')'}
        s._lift=true;
      }else if(s._lift){s.style.setProperty('--dim',0);s.style.transform='';s._lift=false}
    });
    setActive(cur.dataset.m);
    if(duoImg&&!reduce){const r=duoImg.getBoundingClientRect();if(r.bottom>0)duoImg.style.transform='translateY('+clamp(-r.top*.08,-30,30).toFixed(1)+'px)'}
    /* trilho duplo */
    if(tl){
      const tr=tl.getBoundingClientRect();let hj=0,hr=0;
      evs.forEach(ev=>{
        const er=ev.getBoundingClientRect();const on=er.top<V*.7;ev.classList.toggle('on',on);
        if(on){const mid=er.top-tr.top+er.height*.5;const w=ev.dataset.w;if(w!=='R')hj=Math.max(hj,mid);if(w!=='J')hr=Math.max(hr,mid)}
      });
      fj.style.height=hj+'px';fr.style.height=hr+'px';
    }
  });
}
addEventListener('scroll',onScroll,{passive:true});addEventListener('resize',onScroll);

/* ---------- mascote (a logo) nos cantos ---------- */
const mascot=$('#mascot'),mtext=$('#mtext');
const SAY={links:'Dois sócios, uma sociedade.',causa:'Diga o assunto e eu aponto o sócio.',areas:'Gire as pastas com o dedo.',socios:'Toque no crachá para virar.',duvidas:'Arraste a carta de cima.',contato:'Fale direto no WhatsApp.'};
const CORN=['bl','tr','tl','br'];let ci=0,mtimer=0;
function mascotCycle(){
  const pos=CORN[ci%4];ci++;
  mascot.className='mascot '+pos;mtext.textContent=SAY[activeM]||SAY.links;
  requestAnimationFrame(()=>requestAnimationFrame(()=>mascot.classList.add('show')));
  mtimer=setTimeout(()=>{mascot.classList.remove('show');mtimer=setTimeout(mascotCycle,5200)},4800);
}

/* ============================================================
   2. ROTEADOR DE CAUSA
   ============================================================ */
const PERFIS=['Empresa','Órgão público','Organização social','Pessoa física'];
const ASSUNTOS=[
 {l:'Edital e licitação',w:'J'},{l:'Contrato administrativo',w:'J'},{l:'Impugnação e recurso',w:'J'},{l:'Parceria com o poder público',w:'J'},
 {l:'Direito do consumidor',w:'R'},{l:'Direito civil',w:'R'},{l:'Processo administrativo',w:'R'},{l:'Direito eleitoral',w:'R'},{l:'Município e gestão pública',w:'R'},{l:'IA no escritório',w:'R'}];
const PRAZOS=['Sim, tem prazo correndo','Ainda não','Não sei'];
const WHO={J:{n:'João Angeline Júnior',img:'assets/joao.webp',why:'Cuida de licitações e contratos e preside a Comissão de Licitações e Contratos da OAB-PI.',close:'Quero uma consultoria'},
           R:{n:'João Ricardo Angeline',img:'assets/ricardo.webp',why:'Atua em Direito Administrativo, Civil, Eleitoral e Público Municipal.',close:'Quero uma orientação'}};
const sel={perfil:'',assunto:null,prazo:''};
function buildOpts(id,list,key){
  const box=$('#'+id);
  list.forEach(it=>{
    const label=typeof it==='string'?it:it.l;
    const b=document.createElement('button');b.type='button';b.className='opt';b.setAttribute('role','radio');b.setAttribute('aria-checked','false');b.textContent=label;
    b.addEventListener('click',()=>{
      const same=b.getAttribute('aria-checked')==='true';
      $$('.opt',box).forEach(o=>o.setAttribute('aria-checked','false'));
      if(same){sel[key]=key==='assunto'?null:''}else{b.setAttribute('aria-checked','true');sel[key]=key==='assunto'?it:label}
      renderFicha();
    });
    box.appendChild(b);
  });
}
buildOpts('perfil',PERFIS,'perfil');buildOpts('assunto',ASSUNTOS,'assunto');buildOpts('prazo',PRAZOS,'prazo');
function renderFicha(){
  const f=$('#ficha');const pils=$$('.pil');
  if(!sel.assunto){pils.forEach(p=>p.classList.remove('on'));$('#rstage').classList.remove('sel');f.innerHTML='<div class="fi-empty"><svg class="ic"><use href="#i-comp"/></svg><span>Escolha o assunto para ver quem cuida.</span></div>';return}
  const w=sel.assunto.w,d=WHO[w];
  pils.forEach(p=>p.classList.toggle('on',p.dataset.p===w));$('#rstage').classList.add('sel');
  const fields=[];if(sel.perfil)fields.push('Perfil: '+sel.perfil);fields.push('Assunto: '+sel.assunto.l);if(sel.prazo)fields.push('Prazo: '+sel.prazo);
  const href=waUrl(w,fields,d.close);
  const lines=[GREET[w],''].concat(fields).concat(['',d.close+'.']);
  f.innerHTML='<div class="fi"><figure><img src="'+d.img+'" alt="" width="70" height="88"></figure><div><small>Quem cuida</small><b>'+d.n+'</b><p class="why">'+d.why+'</p></div></div>'+
   '<div class="bub">'+lines.map(l=>l?'<i>'+l+'</i>':'<i>&nbsp;</i>').join('')+'</div>'+
   '<a class="btn main" href="'+href+'" target="_blank" rel="noopener"><span class="in"><svg class="ic"><use href="#i-wa"/></svg><span class="t"><b>Mandar esta mensagem</b><small>Abre o WhatsApp de '+(w==='J'?'João Angeline':'João Ricardo')+'</small></span></span></a>';
}

/* ============================================================
   3. RAIO-X DO EDITAL
   ============================================================ */
const CLS=[
 {t:'4.1 Habilitação técnica',s:'Atestados e qualificação exigidos',n:'A habilitação define quem pode disputar. Exigências desproporcionais ao objeto podem restringir a competição e merecem análise.'},
 {t:'5.3 Prazo de execução',s:'Cronograma e marcos de entrega',n:'Prazo incompatível com o escopo pode gerar atraso, multa e desequilíbrio do contrato. Vale conferir antes de propor.'},
 {t:'7.2 Garantia contratual',s:'Percentual e forma de prestação',n:'A garantia tem regras de percentual e de modalidade. É um custo que entra na formação da proposta.'},
 {t:'9.1 Reajuste e reequilíbrio',s:'Índices, periodicidade e pedidos',n:'Reajuste e reequilíbrio protegem o contrato de variações de custo. A cláusula e o pedido precisam de fundamento.'},
 {t:'11.4 Sanções administrativas',s:'Multas, advertência e impedimento',n:'As sanções devem respeitar o contraditório e a ampla defesa. Entender o gatilho de cada uma evita surpresa.'},
 {t:'12.2 Impugnação e recurso',s:'Prazos para questionar o edital',n:'Impugnar e recorrer têm prazos curtos. Perder o prazo costuma fechar a porta, por isso o olhar jurídico entra cedo.'}];
(function raiox(){
  const paper=$('#paper'),doc=$('#doc'),scan=$('#scan'),grab=$('#grab'),note=$('#note'),cnt=$('#cnt');
  const ln=w=>{const d=document.createElement('div');d.className='ln';d.style.width=w+'%';paper.appendChild(d)};
  const els=[];
  ln(46);ln(92);
  CLS.forEach((c,i)=>{
    const d=document.createElement('div');d.className='cl';d.innerHTML='<b>'+c.t+'</b><span>'+c.s+'</span>';paper.appendChild(d);els.push(d);
    ln(88-(i%3)*14);if(i%2===0)ln(60+(i%3)*9);
  });
  let y=0,H=1,user=false,idle=0,lastLit=-1,auto=true,t0=performance.now(),vis=false,dragging=false;
  const measure=()=>{H=doc.offsetHeight};
  measure();addEventListener('resize',measure);if(window.ResizeObserver)new ResizeObserver(measure).observe(doc);
  const apply=()=>{
    scan.style.transform='translateY('+y.toFixed(1)+'px)';
    grab.setAttribute('aria-valuenow',Math.round(y/H*100));
    let lit=-1,n=0;
    els.forEach((e,i)=>{const mid=e.offsetTop+e.offsetHeight*.5;const on=y>=mid;e.classList.toggle('on',on);if(on){lit=i;n++}});
    cnt.textContent=n+' de '+CLS.length+' pontos lidos';
    if(lit!==lastLit){lastLit=lit;note.innerHTML=lit<0?'<b>Aguardando leitura</b><span>Arraste a alça ou toque no documento.</span>':'<b>'+CLS[lit].t+'</b><span>'+CLS[lit].n+'</span>'}
  };
  const setY=v=>{y=clamp(v,0,H);apply()};
  const io2=new IntersectionObserver(es=>{vis=es[0].isIntersecting});io2.observe(doc);
  (function loop(now){
    requestAnimationFrame(loop);
    if(!vis||dragging)return;
    if(user){if(now-idle>4500)user=false;else return}
    const p=(Math.sin((now-t0)/4200-1.2)+1)/2;setY(p*H);
  })(performance.now());
  grab.addEventListener('pointerdown',e=>{dragging=true;user=true;idle=performance.now();try{grab.setPointerCapture(e.pointerId)}catch(x){}});
  grab.addEventListener('pointermove',e=>{if(!dragging)return;const r=doc.getBoundingClientRect();setY(e.clientY-r.top);idle=performance.now()});
  const end=()=>{dragging=false;idle=performance.now()};
  grab.addEventListener('pointerup',end);grab.addEventListener('pointercancel',end);
  paper.addEventListener('click',e=>{const r=doc.getBoundingClientRect();user=true;idle=performance.now();setY(e.clientY-r.top)});
  grab.addEventListener('keydown',e=>{if(e.key==='ArrowDown'){setY(y+30);user=true;idle=performance.now()}if(e.key==='ArrowUp'){setY(y-30);user=true;idle=performance.now()}});
  apply();
})();

/* ============================================================
   4. FICHARIO 3D
   ============================================================ */
const AREAS=[
 {t:'Licitações e contratos',a:'Licitações',b:'e contratos',p:'Edital, proposta, recurso e contrato.',d:'Edital, proposta, habilitação, recurso, contrato e aditivos, para empresas, órgãos públicos e organizações da sociedade civil.',w:['J'],i:'i-doc'},
 {t:'Direito Administrativo',a:'Direito',b:'Administrativo',p:'Contratos, processos e pareceres.',d:'Contratos administrativos, processos administrativos e disciplinares, pareceres e diálogo com os órgãos de controle.',w:['R','J'],i:'i-scale'},
 {t:'Direito Eleitoral',a:'Direito',b:'Eleitoral',p:'Orientação e atuação eleitoral.',d:'Orientação em Direito Eleitoral, com pós-graduação em Direito Eleitoral e Público Municipal pela ESA/PI.',w:['R'],i:'i-vote'},
 {t:'Direito Civil',a:'Direito',b:'Civil',p:'Contratos, obrigações e processo.',d:'Contratos, obrigações e processo civil, com pós-graduação em Direito Civil e Processual Civil pela FGV.',w:['R'],i:'i-book'},
 {t:'Direito do Consumidor',a:'Direito do',b:'Consumidor',p:'Orientação nas relações de consumo.',d:'Orientação jurídica nas relações de consumo.',w:['R'],i:'i-bag'},
 {t:'Público Municipal',a:'Direito',b:'Público Municipal',p:'Gestão e consultivo para municípios.',d:'Direito público municipal, com pós-graduação pela ESA/PI, para a gestão de municípios.',w:['R'],i:'i-city'},
 {t:'IA no Direito',a:'IA',b:'no Direito',p:'Inovação e inteligência jurídica.',d:'João Ricardo coordena Inovação e Inteligência Jurídica da OAB/PI – ESA-PI e capacita advogados com inteligência artificial.',w:['R'],i:'i-chip'},
 {t:'Justiça desportiva',a:'Justiça',b:'desportiva',p:'Auditor do TJD-PI, 2024 a 2028.',d:'João Ricardo é auditor do Tribunal de Justiça Desportiva do Piauí (TJD-PI), de 2024 a 2028.',w:['R'],i:'i-whistle'}];
(function ficharioInit(){
  const drum=$('#drum'),ring=$('#ring'),N=AREAS.length,STEP=360/N,Rz=132;
  AREAS.forEach((a,i)=>{
    const f=document.createElement('div');f.className='fold';f.dataset.i=i;
    f.style.transform='rotateX('+(i*STEP)+'deg) translateZ('+Rz+'px)';
    f.innerHTML='<svg class="ic"><use href="#'+a.i+'"/></svg><h3>'+a.t+'</h3><p>'+a.p+'</p>';
    ring.appendChild(f);
  });
  let ang=0,target=0,vel=0,dragging=false,ly=0,moved=0,active=-1,t0=performance.now(),vis=false,lastT=0;
  const norm=v=>((Math.round(-v/STEP)%N)+N)%N;
  function render(now){
    const wob=Math.sin((now-t0)/1300)*1.4;
    ring.style.transform='rotateX('+(ang+wob).toFixed(2)+'deg)';
  }
  function setActive(){
    const k=norm(ang);if(k===active)return;active=k;const a=AREAS[k];
    $('#dtag').textContent=(k+1)+' de '+N;
    const wh=a.w.map(w=>'<span><img src="'+WHO[w].img+'" alt="">'+(w==='J'?'João Angeline':'João Ricardo')+'</span>').join('');
    const btns=a.w.map(w=>{
      const fields=['Assunto: '+a.t];
      return '<a class="btn main" href="'+waUrl(w,fields,WHO[w].close)+'" target="_blank" rel="noopener"><span class="in"><svg class="ic"><use href="#i-wa"/></svg><span class="t"><b>Falar com '+(w==='J'?'João Angeline':'João Ricardo')+'</b><small>WhatsApp sobre '+a.t.toLowerCase()+'</small></span></span></a>';
    }).join('');
    $('#afile').innerHTML='<div class="af"><h3><span class="lt" style="font-weight:200">'+a.a+'</span> <b>'+a.b+'</b></h3><p>'+a.d+'</p><div class="who">'+wh+'</div><div class="links" style="margin-top:0">'+btns+'</div></div>';
  }
  function tick(now){
    requestAnimationFrame(tick);
    if(!vis&&active>=0)return;
    if(!dragging){
      if(Math.abs(vel)>.05){ang+=vel;vel*=.94;target=Math.round(ang/STEP)*STEP}
      else{ang+=(target-ang)*.16;vel=0}
    }
    render(now);setActive();
  }
  const io3=new IntersectionObserver(es=>{vis=es[0].isIntersecting});io3.observe(drum);
  drum.addEventListener('pointerdown',e=>{dragging=true;ly=e.clientY;moved=0;vel=0;try{drum.setPointerCapture(e.pointerId)}catch(x){}});
  drum.addEventListener('pointermove',e=>{
    if(!dragging)return;const dy=e.clientY-ly;ly=e.clientY;moved+=Math.abs(dy);
    ang-=dy*.5;vel=-dy*.5*.9;target=Math.round(ang/STEP)*STEP;
  });
  const end=e=>{
    if(!dragging)return;dragging=false;
    if(moved<8&&e&&e.clientY!=null){
      const r=drum.getBoundingClientRect();const rel=(e.clientY-(r.top+r.height/2));
      if(Math.abs(rel)>58){target=Math.round(ang/STEP)*STEP+(rel<0?-STEP:STEP);vel=0}
    }
  };
  drum.addEventListener('pointerup',end);drum.addEventListener('pointercancel',()=>{dragging=false});
  drum.addEventListener('wheel',e=>{if(Math.abs(e.deltaY)<2)return;e.preventDefault();target=Math.round(target/STEP)*STEP-Math.sign(e.deltaY)*STEP;vel=0},{passive:false});
  $('#dup').addEventListener('click',()=>{target=Math.round(ang/STEP)*STEP+STEP;vel=0});
  $('#ddn').addEventListener('click',()=>{target=Math.round(ang/STEP)*STEP-STEP;vel=0});
  requestAnimationFrame(tick);
})();

/* ============================================================
   5. CRACHAS 3D
   ============================================================ */
(function crachas(){
  $$('.badge').forEach((b,bi)=>{
    const bin=$('.bi',b);let flipped=false,rx=0,ry=0,drag=false,sx=0,sy=0,moved=0,vis=false,counted=false;
    const io4=new IntersectionObserver(es=>{vis=es[0].isIntersecting});io4.observe(b);
    const apply=(ax,ay)=>{bin.style.transform='rotateX('+ax.toFixed(2)+'deg) rotateY('+(ay+(flipped?180:0)).toFixed(2)+'deg)'};
    (function sway(now){
      requestAnimationFrame(sway);
      if(!vis||drag||reduce)return;
      const t=now/1000;apply(Math.sin(t*.9+bi*2)*3.2,Math.sin(t*.7+bi)*7);
    })(performance.now());
    const count=()=>{
      if(counted)return;counted=true;
      $$('.num',b).forEach(n=>{const to=+n.dataset.to,s=performance.now();(function f(now){const p=clamp((now-s)/1400,0,1);n.textContent=Math.round(to*easeOut(p));if(p<1)requestAnimationFrame(f)})(s)});
    };
    b.addEventListener('pointerdown',e=>{if(e.target.closest('a'))return;drag=true;sx=e.clientX;sy=e.clientY;moved=0;b.classList.add('drag')});
    b.addEventListener('pointermove',e=>{
      if(!drag)return;const r=b.getBoundingClientRect();
      const px=(e.clientX-r.left)/r.width-.5,py=(e.clientY-r.top)/r.height-.5;
      moved=Math.max(moved,Math.abs(e.clientX-sx)+Math.abs(e.clientY-sy));
      rx=-py*18;ry=px*26;apply(rx,ry);
    });
    const end=e=>{
      if(!drag)return;drag=false;b.classList.remove('drag');
      if(moved<8&&!(e.target.closest&&e.target.closest('a'))){flipped=!flipped;if(flipped)count()}
      apply(0,0);
    };
    b.addEventListener('pointerup',end);b.addEventListener('pointercancel',()=>{drag=false;b.classList.remove('drag');apply(0,0)});
    b.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){flipped=!flipped;if(flipped)count();apply(0,0)}});
    b.tabIndex=0;apply(0,0);
  });
})();

/* ============================================================
   7. MACO DE PERGUNTAS
   ============================================================ */
const FAQ=[
 {q:'Atendem empresa, órgão público e pessoa física?',a:'Sim. A sociedade atende empresas, órgãos públicos, organizações da sociedade civil e pessoas físicas, de acordo com a área do caso.'},
 {q:'Como começa o atendimento?',a:'Pelo WhatsApp do sócio da área. Você conta o assunto e o prazo, e a conversa já chega organizada.'},
 {q:'Quem cuida de licitações e contratos?',a:'João Angeline Júnior, presidente da Comissão de Licitações e Contratos da OAB-PI, com equipe que atua no PI, TO, CE e MG.'},
 {q:'E o restante do Direito Público, Civil e Eleitoral?',a:'João Ricardo Angeline, pós-graduado em Direito Civil e Processual Civil e em Direito Eleitoral e Público Municipal.'},
 {q:'Onde fica o escritório?',a:'Av. Nossa Sra. de Fátima, 770, Jóquei, Teresina-PI, CEP 64048-180.'},
 {q:'A página promete resultado?',a:'Não. O conteúdo é informativo, cada caso depende de análise e nada aqui substitui uma consulta jurídica.'}];
(function maco(){
  const deck=$('#deck'),cnt=$('#dcnt');
  const cards=FAQ.map((f,i)=>{
    const c=document.createElement('article');c.className='qc';c.dataset.id=i;
    c.innerHTML='<small>Pergunta</small><h3>'+f.q+'</h3><p>'+f.a+'</p><span class="sw">Arraste para o lado</span>';
    deck.appendChild(c);return c;
  });
  let order=cards.slice();
  function layout(anim){
    order.forEach((c,k)=>{
      c.dataset.k=k;c.style.zIndex=20-k;
      c.style.transition=anim?'transform .6s cubic-bezier(.2,.8,.2,1),opacity .4s':'none';
      c.style.transform='translateY('+(Math.min(k,3)*17)+'px) scale('+(1-Math.min(k,3)*.05)+')';
      c.style.opacity=k>3?0:1;
    });
    cnt.textContent='Pergunta '+(+order[0].dataset.id+1)+' de '+FAQ.length;
  }
  layout(false);
  let drag=false,sx=0,sy=0,dx=0,lastX=0,lastT=0,vx=0,top=null,idle=performance.now(),busy=false;
  function fling(dir){
    if(busy)return;busy=true;const c=order[0];
    c.style.transition='transform .42s cubic-bezier(.5,0,.8,.4),opacity .42s';
    c.style.transform='translate('+(dir*(deck.offsetWidth+120))+'px,-30px) rotate('+(dir*16)+'deg)';
    setTimeout(()=>{
      order.push(order.shift());c.style.transition='none';
      layout(true);busy=false;idle=performance.now();
    },330);
  }
  deck.addEventListener('pointerdown',e=>{if(busy)return;drag=true;sx=lastX=e.clientX;sy=e.clientY;dx=0;vx=0;lastT=performance.now();top=order[0];top.style.transition='none';try{deck.setPointerCapture(e.pointerId)}catch(x){}});
  deck.addEventListener('pointermove',e=>{
    if(!drag)return;dx=e.clientX-sx;const now=performance.now();vx=(e.clientX-lastX)/Math.max(1,now-lastT);lastX=e.clientX;lastT=now;
    top.style.transform='translate('+dx+'px,'+(-Math.abs(dx)*.06)+'px) rotate('+(dx*.07)+'deg)';
  });
  const end=()=>{
    if(!drag)return;drag=false;
    if(Math.abs(dx)>90||Math.abs(vx)>.7)fling(dx>=0?1:-1);
    else if(Math.abs(dx)<6){fling(1)}
    else{top.style.transition='transform .5s cubic-bezier(.2,1.2,.3,1)';layout(true)}
    idle=performance.now();
  };
  deck.addEventListener('pointerup',end);deck.addEventListener('pointercancel',()=>{drag=false;layout(true)});
  deck.tabIndex=0;deck.addEventListener('keydown',e=>{if(e.key==='ArrowRight')fling(1);if(e.key==='ArrowLeft')fling(-1)});
  /* dica de movimento */
  let dv=false;new IntersectionObserver(es=>{dv=es[0].isIntersecting}).observe(deck);
  setInterval(()=>{
    if(!dv||drag||busy||reduce||performance.now()-idle<4200)return;
    const c=order[0];c.style.transition='transform .35s ease-out';c.style.transform='translate(26px,-4px) rotate(2.4deg)';
    setTimeout(()=>{if(!drag&&!busy){c.style.transition='transform .6s cubic-bezier(.2,1.3,.3,1)';layout(true)}},380);
  },5200);
})();

/* ---------- inicio do site ---------- */
function startSite(){
  if(siteOn)return;siteOn=true;
  setTops();onScroll();setActive('links');
  setTimeout(mascotCycle,2400);
}
window.__site={setTops,onScroll,startSite,enterSite};
})();
