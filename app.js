(function(){
'use strict';
const WA={J:'5586999588325',R:'5586998165734'};
const GREET={J:'Olá, João! Vim pelo biolink da Angeline · Angeline.',R:'Olá, João Ricardo Angeline! Vim pelo biolink da Angeline · Angeline.'};
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
    function labelTex(lines){
      const c=document.createElement('canvas');c.width=560;c.height=190;const x=c.getContext('2d');const tex=new T.CanvasTexture(c);
      const draw=()=>{x.clearRect(0,0,560,190);x.fillStyle='#ffffff';x.textAlign='center';x.textBaseline='middle';x.font='800 70px Outfit,Figtree,sans-serif';lines.forEach((t,k)=>x.fillText(t,280,68+k*62));tex.needsUpdate=true};
      draw();if(document.fonts&&document.fonts.load){document.fonts.load('800 60px Outfit').then(draw)}return tex;
    }
    const pg=new T.PlaneGeometry(1.95,.71);
    const JL=['Licitações','Contratações','Terceiro setor','Tributário'],RL=['Empresarial','Civil','Consumidor','Trabalhista','Criminal'];
    const plates=[];
    const mk=(txt,who,i,n)=>{
      const mat=new T.MeshBasicMaterial({map:plateTex(txt,who==='R'),transparent:true,depthWrite:false});
      const m=new T.Group();const a=new T.Mesh(pg,mat),b2=new T.Mesh(pg,mat);b2.rotation.y=Math.PI;b2.position.z=-.002;m.add(a);m.add(b2);
      m.visible=false;world.add(m);plates.push({m,mat,who,i,n});
    };
    JL.forEach((t,i)=>mk(t,'J',i,JL.length));RL.forEach((t,i)=>mk(t,'R',i,RL.length));
    plates.forEach((p,idx)=>{p.k=idx});
    const labels={};
    [['J',['João Angeline']],['R',['João Ricardo','Angeline']]].forEach(a=>{
      const m=new T.Mesh(new T.PlaneGeometry(3.4,1.153),new T.MeshBasicMaterial({map:labelTex(a[1]),transparent:true,depthWrite:false}));
      m.position.set(a[0]==='J'?-2.3:2.3,5.986,0);m.visible=false;world.add(m);labels[a[0]]=m;
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
    
    /* trilho duplo */
    if(tl){
      const tr=tl.getBoundingClientRect();let hj=0,hr=0;
      evs.forEach(ev=>{
        const er=ev.getBoundingClientRect();const on=er.top<V*.8||tr.bottom<V+6;ev.classList.toggle('on',on);
        if(on){const mid=er.top-tr.top+er.height*.5;const w=ev.dataset.w;if(w!=='R')hj=Math.max(hj,mid);if(w!=='J')hr=Math.max(hr,mid)}
      });
      fj.style.height=hj+'px';fr.style.height=hr+'px';
    }
  });
}
addEventListener('scroll',onScroll,{passive:true});addEventListener('resize',onScroll);

/* ---------- mascote (a logo) nos cantos ---------- */
const mascot=$('#mascot'),mtext=$('#mtext');
const SAY={links:'Dois sócios, uma sociedade.',causa:'Me diga o que te trouxe aqui.',areas:'Gire as pastas com o dedo.',socios:'Toque no crachá para virar.',galeria:'Toque na foto para abrir.',duvidas:'Pergunte, eu respondo.',contato:'Fale direto no WhatsApp.'};
const CORN=['bl','tr','tl','br'];let ci=0,mtimer=0;
function mascotCycle(){
  const pos=CORN[ci%4];ci++;
  mascot.className='mascot '+pos;mtext.textContent=SAY[activeM]||SAY.links;
  requestAnimationFrame(()=>requestAnimationFrame(()=>mascot.classList.add('show')));
  mtimer=setTimeout(()=>{mascot.classList.remove('show');mtimer=setTimeout(mascotCycle,5200)},4800);
}

/* ============================================================
   2. QUIZ: O QUE TE TROUXE AQUI
   ============================================================ */
const WHO={J:{n:'João Angeline Júnior',s:'João Angeline',img:'assets/joao.webp',area:'Direito público',why:'Cuida do Direito público: licitações, contratações públicas, terceiro setor e tributário.',close:'Quero uma consultoria'},
           R:{n:'João Ricardo Angeline',s:'João Ricardo Angeline',img:'assets/ricardo.webp',area:'Direito privado',why:'Cuida do Direito privado: empresarial, civil, consumidor, trabalhista e criminal.',close:'Quero uma orientação'}};
const QZ=[
 {k:'assunto',q:['O que','te trouxe aqui?'],h:'Escolha o que mais se parece com o seu caso.',o:[
  {l:'Licitação ou contratação pública',w:'J',a:'Licitações e contratações públicas'},
  {l:'Terceiro setor ou tributos',w:'J',a:'Terceiro setor ou tributário'},
  {l:'Meu negócio ou contrato',w:'R',a:'Empresarial e civil'},
  {l:'Consumo, trabalho ou criminal',w:'R',a:'Consumidor, trabalhista ou criminal'},
  {l:'Outro assunto',w:'R',a:'Outro assunto'}]},
 {k:'perfil',q:['Quem','está falando?'],h:'Isso ajuda a organizar a conversa.',o:['Empresa','Órgão público','Organização social','Pessoa física'].map(l=>({l}))},
 {k:'fase',q:['Em que','fase está?'],h:'Pode ser só uma ideia do momento.',o:['Ainda não começou','Já há edital ou processo em andamento','Recebi uma notificação ou intimação','Quero me prevenir de problemas'].map(l=>({l}))},
 {k:'prazo',q:['Tem prazo','correndo?'],h:'Prazo muda a urgência da conversa.',o:['Sim, tem prazo correndo','Ainda não','Não sei'].map(l=>({l}))},
 {k:'socio',q:['Com quem','quer falar?'],h:'Já deixei marcado quem cuida do seu assunto.',o:[{l:'Quem cuida do meu assunto',w:'auto'},{l:'João Angeline, Direito público',w:'J'},{l:'João Ricardo Angeline, Direito privado',w:'R'}]}];
(function quiz(){
  const box=$('#quiz'),pils=$$('.pil'),stage=$('#rstage');
  let step=0,ans={},busy=false;
  const rec=()=>ans.assunto?ans.assunto.w:'';
  function lightPils(w){pils.forEach(p=>p.classList.toggle('on',p.dataset.p===w));stage.classList.toggle('sel',!!w)}
  function bars(n){return '<div class="qbars">'+QZ.map((_,i)=>'<i class="'+(i<n?'on':'')+(i===n&&n<QZ.length?' cur':'')+'"></i>').join('')+'</div>'}
  function render(){
    if(step>=QZ.length)return result();
    const Q=QZ[step];
    box.innerHTML=bars(step)+(step?'<button class="qback" type="button">Voltar</button>':'')+
     '<p class="qn">Pergunta '+(step+1)+' de '+QZ.length+'</p><h3 class="qq"><span class="lt">'+Q.q[0]+'</span> <b>'+Q.q[1]+'</b></h3><p class="qh">'+Q.h+'</p>'+
     '<div class="qopts">'+Q.o.map((o,i)=>{
       const mark=(Q.k==='socio'&&i===0)?'<em>indicado</em>':'';
       return '<button type="button" class="qo" data-i="'+i+'"><span class="rd"></span><span class="ql">'+o.l+'</span>'+mark+'</button>';
     }).join('')+'</div>';
    const prev=ans[Q.k];
    $$('.qo',box).forEach(b=>{
      const i=+b.dataset.i;if(prev&&prev.i===i)b.classList.add('on');
      b.addEventListener('click',()=>{
        if(busy)return;busy=true;b.classList.add('on');
        const o=Q.o[i];ans[Q.k]=Object.assign({i},o);
        if(Q.k==='assunto')lightPils(o.w);
        setTimeout(()=>{step++;busy=false;render()},360);
      });
    });
    const bk=$('.qback',box);if(bk)bk.addEventListener('click',()=>{step--;render()});
  }
  function result(){
    const so=ans.socio?ans.socio.w:'auto';
    const w=(so&&so!=='auto')?so:(rec()||'R');const d=WHO[w];lightPils(w);
    const fields=[];
    fields.push('Assunto: '+(ans.assunto?ans.assunto.a:'Outro assunto'));
    if(ans.perfil)fields.push('Perfil: '+ans.perfil.l);
    if(ans.fase)fields.push('Fase: '+ans.fase.l);
    if(ans.prazo)fields.push('Prazo: '+ans.prazo.l);
    const href=waUrl(w,fields,d.close);
    const lines=[GREET[w],''].concat(fields).concat(['',d.close+'.']);
    box.innerHTML=bars(QZ.length)+'<div class="qres"><div class="qr-h"><figure><img src="'+d.img+'" alt="" width="70" height="88"></figure><div><small>Quem cuida · '+d.area+'</small><b>'+d.n+'</b><p>'+d.why+'</p></div></div>'+
      '<div class="qr-m">'+lines.map(l=>l?'<i>'+l+'</i>':'<i>&nbsp;</i>').join('')+'</div>'+
      '<a class="btn main" href="'+href+'" target="_blank" rel="noopener"><span class="in"><svg class="ic"><use href="#i-wa"/></svg><span class="t"><b>Mandar esta mensagem</b><small>Abre o WhatsApp de '+d.s+'</small></span></span></a>'+
      '<button class="qredo" type="button">Refazer as respostas</button></div>';
    $('.qredo',box).addEventListener('click',()=>{ans={};step=0;lightPils('');render()});
  }
  render();
})();

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
 {t:'Licitações',a:'Direito das',b:'Licitações',p:'Edital, proposta, recurso e contrato.',d:'Edital, proposta, habilitação, recurso, contrato e aditivos, para empresas, órgãos públicos e organizações da sociedade civil.',w:['J'],i:'i-doc'},
 {t:'Contratações públicas',a:'Contratações',b:'públicas',p:'Contratos com o poder público.',d:'Contratos com o poder público, acompanhamento da execução e relação com os órgãos de controle.',w:['J'],i:'i-city'},
 {t:'Terceiro setor',a:'Terceiro',b:'setor',p:'Organizações e parcerias públicas.',d:'Apoio jurídico a organizações da sociedade civil, inclusive em parcerias com o poder público.',w:['J'],i:'i-heart'},
 {t:'Direito tributário',a:'Direito',b:'Tributário',p:'Orientação em questões tributárias.',d:'Orientação jurídica em questões tributárias de empresas e de organizações.',w:['J'],i:'i-coin'},
 {t:'Direito empresarial',a:'Direito',b:'Empresarial',p:'Empresas, contratos e relações.',d:'Orientação jurídica para empresas, seus contratos e suas relações empresariais.',w:['R'],i:'i-brief'},
 {t:'Direito civil',a:'Direito',b:'Civil',p:'Contratos, obrigações e processo.',d:'Contratos, obrigações e processo civil, com pós-graduação em Direito Civil e Processual Civil pela FGV.',w:['R'],i:'i-book'},
 {t:'Direito do consumidor',a:'Direito do',b:'Consumidor',p:'Orientação nas relações de consumo.',d:'Orientação jurídica nas relações de consumo.',w:['R'],i:'i-bag'},
 {t:'Direito trabalhista',a:'Direito',b:'Trabalhista',p:'Orientação em questões trabalhistas.',d:'Orientação jurídica em questões trabalhistas.',w:['R'],i:'i-two'},
 {t:'Direito criminal',a:'Direito',b:'Criminal',p:'Orientação em questões criminais.',d:'Orientação jurídica em questões criminais.',w:['R'],i:'i-shield'}];
(function ficharioInit(){
  const drum=$('#drum'),ring=$('#ring'),N=AREAS.length;
  AREAS.forEach((a,i)=>{
    const f=document.createElement('button');f.type='button';f.className='fold';f.dataset.i=i;
    f.innerHTML='<svg class="ic"><use href="#'+a.i+'"/></svg><h3>'+a.t+'</h3><p>'+a.p+'</p>';
    ring.appendChild(f);
  });
  const cards=$$('.fold',ring);let active=-1;
  function show(k){
    if(k===active)return;active=k;const a=AREAS[k];
    cards.forEach((c,i)=>c.classList.toggle('on',i===k));
    $('#dtag').textContent=(k+1)+' de '+N;
    const wh=a.w.map(w=>'<span><img src="'+WHO[w].img+'" alt="">'+WHO[w].s+'</span>').join('');
    const btns=a.w.map(w=>{
      const fields=['Assunto: '+a.t];
      return '<a class="btn main" href="'+waUrl(w,fields,WHO[w].close)+'" target="_blank" rel="noopener"><span class="in"><svg class="ic"><use href="#i-wa"/></svg><span class="t"><b>Falar com '+WHO[w].s+'</b><small>WhatsApp sobre '+a.t.toLowerCase()+'</small></span></span></a>';
    }).join('');
    $('#afile').innerHTML='<div class="af"><h3><span class="lt" style="font-weight:200">'+a.a+'</span> <b>'+a.b+'</b></h3><p>'+a.d+'</p><div class="who">'+wh+'</div><div class="links" style="margin-top:0">'+btns+'</div></div>';
  }
  const near=()=>{const c=drum.scrollLeft+drum.clientWidth/2;let k=0,m=1e9;cards.forEach((el,i)=>{const d=Math.abs(el.offsetLeft+el.offsetWidth/2-c);if(d<m){m=d;k=i}});return k};
  const go=k=>{k=Math.max(0,Math.min(N-1,k));const el=cards[k];drum.scrollTo({left:el.offsetLeft+el.offsetWidth/2-drum.clientWidth/2,behavior:reduce?'auto':'smooth'})};
  let t=0;drum.addEventListener('scroll',()=>{cancelAnimationFrame(t);t=requestAnimationFrame(()=>show(near()))},{passive:true});
  cards.forEach((c,i)=>c.addEventListener('click',()=>go(i)));
  $('#dup').addEventListener('click',()=>go(near()-1));
  $('#ddn').addEventListener('click',()=>go(near()+1));
  show(0);
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
   7. DUVIDAS EM CONVERSA
   ============================================================ */
const FAQ=[
 {q:'Atendem empresa, órgão público e pessoa física?',a:'Sim. A sociedade atende empresas, órgãos públicos, organizações da sociedade civil e pessoas físicas, de acordo com a área do caso.'},
 {q:'Como começa o atendimento?',a:'Pelo WhatsApp do sócio da área. Você conta o assunto e o prazo, e a conversa já chega organizada.'},
 {q:'Quais áreas vocês atendem?',a:'Licitações, contratações públicas, terceiro setor, empresarial, civil, consumidor, tributário, trabalhista e criminal.'},
 {q:'Quem cuida de Direito público e de Direito privado?',a:'João Angeline Júnior cuida do Direito público, com foco em licitações e contratos. João Ricardo Angeline cuida do Direito privado.'},
 {q:'Onde fica o escritório?',a:'Rua Tabelião José Basílio, 690, Jóquei, Teresina-PI.'},
 {q:'A página promete resultado?',a:'Não. O conteúdo é informativo, cada caso depende de análise e nada aqui substitui uma consulta jurídica.'}];
(function chat(){
  const body=$('#cbody'),cq=$('#cq');let n=0;
  const hm=()=>{const d=new Date();return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')};
  const down=()=>{body.scrollTo({top:body.scrollHeight,behavior:reduce?'auto':'smooth'})};
  function msg(who,txt){
    const m=document.createElement('div');m.className='cm '+who;
    m.innerHTML=(who==='o'?'<span class="av s"><img src="assets/mark-white.png" alt="" width="520" height="386"></span>':'')+'<div class="bb"><p>'+txt+'</p><time>'+hm()+'</time></div>';
    body.appendChild(m);requestAnimationFrame(()=>m.classList.add('in'));down();return m;
  }
  msg('o','Oi, aqui é da Angeline · Angeline. Escolha uma pergunta abaixo.');
  FAQ.forEach((f,i)=>{
    const b=document.createElement('button');b.type='button';b.className='cqb';b.textContent=f.q;
    b.addEventListener('click',()=>{
      if(b.classList.contains('done')||b.disabled)return;
      $$('.cqb',cq).forEach(x=>x.disabled=true);b.classList.add('done');
      msg('u',f.q);
      const t=document.createElement('div');t.className='cm o typing in';t.innerHTML='<span class="av s"><img src="assets/mark-white.png" alt="" width="520" height="386"></span><div class="bb"><span class="dots"><i></i><i></i><i></i></span></div>';
      setTimeout(()=>{body.appendChild(t);down()},260);
      setTimeout(()=>{t.remove();msg('o',f.a);$$('.cqb',cq).forEach(x=>{if(!x.classList.contains('done'))x.disabled=false})},reduce?200:1250);
    });
    cq.appendChild(b);
  });
})();

/* ============================================================
   7b. GALERIA: passa de lado, toque abre
   ============================================================ */
const GAL=[
 {s:'g01',alt:'Retrato de João Angeline Júnior de terno azul',pos:'50% 18%'},
 {s:'p-premio-1',tag:'Premiação',cap:'Premiação no MPE e CNMP',alt:'João Ricardo Angeline recebe certificado de premiação no Ministério Público do Piauí',pos:'60% 30%'},
 {s:'p-palestra-ia',tag:'Palestra',cap:'Palestra sobre uso de inteligência artificial aplicada à prática jurídica',alt:'João Ricardo Angeline em palestra sobre inteligência artificial aplicada à prática jurídica',pos:'72% 40%',wide:1},
 {s:'g02',alt:'Retrato de João Angeline Júnior sentado',pos:'25% 40%'},
 {s:'p-entrevista',tag:'Entrevista',cap:'Entrevista sobre jogos de azar com uso de inteligência artificial',alt:'Entrevista com equipe de TV no escritório sobre jogos de azar e inteligência artificial',pos:'70% 48%'},
 {s:'g05',alt:'Os sócios em evento, ao lado de uma colega',pos:'50% 22%'},
 {s:'p-palestra-crime',tag:'Palestra',cap:'Palestra sobre utilização da inteligência artificial no combate a crimes',alt:'João Ricardo Angeline em palestra sobre inteligência artificial no combate a crimes',pos:'50% 62%'},
 {s:'g03',alt:'Retrato de João Angeline Júnior de terno marrom',pos:'50% 16%'},
 {s:'p-premio-2',tag:'Premiação',cap:'Premiação no MPE e CNMP',alt:'João Ricardo Angeline com certificado de premiação no Ministério Público do Piauí',pos:'62% 40%'},
 {s:'g06',alt:'Os dois sócios lado a lado',pos:'50% 30%'},
 {s:'g04',alt:'Retrato de João Angeline Júnior de braços cruzados',pos:'50% 18%'},
 {s:'g07',alt:'Os dois sócios em um corredor',pos:'50% 25%'},
 {s:'g08',alt:'Os dois sócios sentados em um sofá',pos:'50% 35%'}];
(function galeria(){
  const gal=$('#gal'),track=$('#gtrack');
  const mk=(g,i,dup)=>{
    const f=document.createElement('figure');f.className='gi'+(g.tag?' hl':'')+(g.wide?' wide':'');f.dataset.i=i;if(dup)f.setAttribute('aria-hidden','true');
    f.innerHTML='<img src="assets/t-'+g.s+'.webp" decoding="async" alt="'+(dup?'':g.alt)+'" draggable="false" style="object-position:'+g.pos+'" loading="eager">'+(g.tag?'<span class="gt"><b><svg class="ic"><use href="#'+(g.tag==='Premiação'?'i-award':'i-chat')+'"/></svg>'+g.tag+'</b>'+(dup?'':'<em>'+g.cap+'</em>')+'</span>':'');
    return f;
  };
  GAL.forEach((g,i)=>track.appendChild(mk(g,i,false)));
  GAL.forEach((g,i)=>track.appendChild(mk(g,i,true)));
  let goal=null,paused=false,x=0,half=0,drag=false,sx=0,sl=0,moved=0,vis=false,lbOn=false,last=performance.now(),boost=0;
  const measure=()=>{half=track.scrollWidth/2};
  addEventListener('load',measure);addEventListener('resize',measure);if(document.fonts&&document.fonts.ready)document.fonts.ready.then(measure);
  $$('img',track).forEach(im=>im.addEventListener('load',measure));
  new IntersectionObserver(es=>{vis=es[0].isIntersecting}).observe(gal);
  (function loop(now){
    requestAnimationFrame(loop);const dt=Math.min(40,now-last);last=now;
    if(!vis||!half)return;
    if(goal!==null&&!drag){x+=(goal-x)*.14;if(Math.abs(goal-x)<.6){x=goal;goal=null}}else if(!drag&&!lbOn&&!paused){x-=dt*(reduce?0:.034)+boost;boost*=.92}
    if(x<=-half)x+=half;if(x>0)x-=half;
    track.style.transform='translate3d('+x.toFixed(1)+'px,0,0)';
  })(performance.now());

  const gc=document.createElement('div');gc.className='gctl';
  gc.innerHTML='<button type="button" data-g="p" aria-label="Foto anterior"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button><button type="button" data-g="s" class="mid" aria-label="Pausar"><svg class="ip" viewBox="0 0 24 24"><path d="M8 5v14M16 5v14" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg><svg class="il" viewBox="0 0 24 24"><path d="M8 5l11 7-11 7z" fill="currentColor"/></svg></button><button type="button" data-g="n" aria-label="Próxima foto"><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>';
  gal.parentNode.insertBefore(gc,gal.nextSibling);
  const figs=()=>$$('.gi',track);
  function step(dir){
    while(x<=-half)x+=half;while(x>0)x-=half;
    const f=figs(),cx=-x+20;let i=0;
    for(let k=0;k<f.length;k++){if(f[k].offsetLeft>=cx-4){i=k;break}}
    if(dir<0)i=Math.max(0,i-1);else if(f[i].offsetLeft-cx<6)i=Math.min(f.length-1,i+1);
    goal=-(f[i].offsetLeft-20);
  }
  gc.addEventListener('click',e=>{
    const b=e.target.closest('button');if(!b)return;
    if(b.dataset.g==='s'){paused=!paused;gc.classList.toggle('paused',paused);b.setAttribute('aria-label',paused?'Continuar':'Pausar')}
    else step(b.dataset.g==='n'?1:-1);
  });
  gal.addEventListener('pointerdown',e=>{goal=null;drag=true;sx=e.clientX;sl=x;moved=0;boost=0;try{gal.setPointerCapture(e.pointerId)}catch(z){}});
  gal.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-sx;moved=Math.max(moved,Math.abs(dx));x=sl+dx});
  gal.addEventListener('pointerup',e=>{
    if(!drag)return;drag=false;
    if(moved<8){const f=document.elementFromPoint(e.clientX,e.clientY);const fig=f&&f.closest('.gi');if(fig)openLb(+fig.dataset.i)}
  });
  gal.addEventListener('pointercancel',()=>{drag=false});
  /* lightbox */
  const lb=document.createElement('div');lb.className='lb';lb.setAttribute('role','dialog');lb.setAttribute('aria-label','Foto ampliada');
  lb.innerHTML='<div class="lbbg"></div><button class="lbx" type="button" aria-label="Fechar">✕</button><button class="lbp" type="button" aria-label="Foto anterior"><svg class="ic"><use href="#i-up"/></svg></button><button class="lbn" type="button" aria-label="Próxima foto"><svg class="ic"><use href="#i-dn"/></svg></button><figure class="lbf"><img alt=""><figcaption></figcaption></figure>';
  document.body.appendChild(lb);
  const lbi=$('img',lb),lbc=$('figcaption',lb);let cur=0;
  function show(i){cur=(i+GAL.length)%GAL.length;const g=GAL[cur];lbi.classList.remove('in');lbi.src='assets/'+g.s+'.webp';lbi.alt=g.alt;lbc.innerHTML=g.cap?('<span>'+g.tag+'</span>'+g.cap):'';lbi.onload=()=>lbi.classList.add('in')}
  let lbT=0;function openLb(i){lbT=Date.now();lbOn=true;show(i);lb.classList.add('on');document.documentElement.classList.add('lbo')}
  function closeLb(){lbOn=false;lb.classList.remove('on');document.documentElement.classList.remove('lbo')}
  $('.lbx',lb).addEventListener('click',closeLb);$('.lbbg',lb).addEventListener('click',()=>{if(Date.now()-lbT>450)closeLb()});
  $('.lbp',lb).addEventListener('click',()=>show(cur-1));$('.lbn',lb).addEventListener('click',()=>show(cur+1));
  addEventListener('keydown',e=>{if(!lbOn)return;if(e.key==='Escape')closeLb();if(e.key==='ArrowRight')show(cur+1);if(e.key==='ArrowLeft')show(cur-1)});
  let lx=0,ld=false;
  lb.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;ld=true;lx=e.clientX});
  lb.addEventListener('pointerup',e=>{if(!ld)return;ld=false;const dx=e.clientX-lx;if(dx>60)show(cur-1);else if(dx<-60)show(cur+1)});
})();



/* ---------- linha do tempo horizontal do processo ---------- */
(function(){
  const sc=$('#tls');if(!sc)return;const ol=$('#tlh'),cs=$$('.tc',ol),bar=$('#tlf'),cnt=$('#tlc'),sec=$('#tempo');let cur=-1,auto=false,go=false,last=0,fx=0;
  function upd(){
    const mid=sc.scrollLeft+sc.clientWidth/2;let b=0,bd=1e9;
    cs.forEach((c,i)=>{const d=Math.abs(c.offsetLeft+c.offsetWidth/2-mid);if(d<bd){bd=d;b=i}});
    if(sc.scrollLeft+sc.clientWidth>=sc.scrollWidth-4)b=cs.length-1;
    if(b===cur)return;cur=b;
    cs.forEach((c,i)=>{c.classList.toggle('on',i<=b);c.classList.toggle('cur',i===b)});
    const c=cs[b];ol.style.setProperty('--tw',Math.max(0,c.offsetLeft+16-20)+'px');
    bar.style.width=((b+1)/cs.length*100)+'%';cnt.textContent=(b+1)+' de '+cs.length;
  }
  sc.addEventListener('scroll',()=>{requestAnimationFrame(upd)},{passive:true});
  addEventListener('resize',()=>{cur=-1;upd()});
  const stop=()=>{auto=false};
  ['pointerdown','touchstart','wheel'].forEach(e=>sc.addEventListener(e,stop,{passive:true}));
  /* deriva lenta: ~38px/s, comeca quando a secao esta centralizada na tela */
  function loop(now){
    requestAnimationFrame(loop);const dt=Math.min(50,now-last);last=now;
    if(!auto||!go||reduce)return;
    const max=sc.scrollWidth-sc.clientWidth;if(fx>=max){auto=false;return}
    fx+=dt*.038;sc.scrollLeft=fx;
  }
  requestAnimationFrame(t=>{last=t;loop(t)});
  new IntersectionObserver(es=>{
    const on=es[0].isIntersecting;go=on;
    if(on&&!auto&&sc.scrollLeft<4){fx=0;auto=true}
  },{rootMargin:'-38% 0px -38% 0px',threshold:0}).observe(sec);
  upd();
})();

/* ---------- como a gente trabalha (abas) ---------- */
(function(){
  const t=$('#ptabs');if(!t)return;const bs=$$('button',t),ps=$$('.pp',$('#ppan')),ind=$('.pind',t);
  bs.forEach((b,i)=>b.addEventListener('click',()=>{
    bs.forEach((x,j)=>{x.classList.toggle('on',i===j);x.setAttribute('aria-selected',i===j)});
    ps.forEach((p,j)=>p.classList.toggle('on',i===j));
    ind.style.transform='translateX(calc('+i+' * (100% + 4px)))';
  }));
})();

/* ---------- entrada do inicio: logo se monta, dupla sobe, logo grande passa atras ---------- */
function heroIntro(){
  const sec=$('#links'),img=$('.clg',sec),duo=$('.duo',sec);if(!img||!duo||reduce){const s0=$('#seal');if(s0)s0.classList.add('go');return}
  const dimg=$('img',duo),seal=$('#seal'),ez='cubic-bezier(.2,.85,.25,1)';
  const NS='http://www.w3.org/2000/svg';
  const pat=document.createElement('div');pat.className='hpat';pat.setAttribute('aria-hidden','true');
  [['a',0]].forEach(([k,dl])=>{
    const sv=document.createElementNS(NS,'svg');sv.setAttribute('viewBox','0 0 520 386');sv.setAttribute('class','hp hp-'+k);sv.style.animationDelay=dl+'s';
    const p=document.createElementNS(NS,'path');p.setAttribute('d','M168.3 227.0 L158.0 225.0 L147.7 224.3 L135.0 224.7 L124.0 226.0 L112.0 229.0 L102.0 233.0 L96.0 236.3 L87.0 243.0 L80.0 250.0 L72.0 260.3 L59.0 283.3 L48.0 312.0 L40.0 341.7 L32.0 358.3 L26.3 366.3 L18.3 374.3 L11.3 379.0 L2.7 382.0 L1.7 383.3 L17.0 385.7 L45.0 385.7 L45.7 385.0 L56.0 383.7 L67.0 380.3 L73.3 377.3 L87.3 367.3 L94.7 360.0 L101.0 352.0 L111.7 333.7 L120.7 309.7 L133.0 266.3 L141.7 247.3 L146.0 241.0 L153.3 233.7 L159.7 229.7ZM336.0 0.7 L284.7 127.7 L286.7 128.0 L302.7 100.3 L305.0 104.3 L415.3 377.7 L414.3 379.3 L375.0 379.3 L374.7 382.7 L519.7 382.7 L519.7 379.3 L490.3 379.3 L488.7 378.0 L337.7 3.3ZM180.3 0.7 L129.0 127.3 L129.7 128.0 L132.0 127.3 L147.3 100.3 L260.0 378.0 L259.3 379.3 L219.3 379.3 L219.0 382.3 L220.0 383.0 L364.0 382.7 L364.3 380.3 L363.7 379.3 L334.7 379.3 L333.0 377.7 L181.7 2.0Z');p.setAttribute('pathLength','1');p.setAttribute('fill-rule','evenodd');p.style.animationDelay=dl+'s';
    sv.appendChild(p);pat.appendChild(sv);
  });
  sec.insertBefore(pat,sec.firstChild.nextSibling);
  const r=img.getBoundingClientRect(),sr=sec.getBoundingClientRect();
  img.style.opacity='0';dimg.style.opacity='0';
  const wrap=document.createElement('div');wrap.className='hlsl';
  wrap.style.cssText='left:'+(r.left-sr.left)+'px;top:'+(r.top-sr.top)+'px;width:'+r.width+'px;height:'+r.height+'px';
  const LP=[[0,"M24.0 278.0 21.0 280.3 1.0 333.0 0.0 334.0 0.0 337.7 3.0 340.0 6.7 339.3 10.7 331.7 39.0 331.7 43.0 339.3 44.3 340.0 47.7 339.7 49.7 337.3 49.7 334.3 28.7 280.0 26.7 278.3ZM24.7 295.0 26.0 296.0 36.0 322.3 35.3 323.0 14.0 322.7Z"],[55,"M63.3 299.0 59.0 303.3 57.0 306.7 55.0 312.7 55.3 338.0 57.3 339.7 60.7 339.7 62.3 338.3 63.0 336.7 63.0 314.3 64.7 309.7 67.3 306.3 70.7 304.0 73.7 303.0 78.7 303.0 84.0 305.3 88.0 309.7 90.0 315.7 90.0 337.3 92.3 339.7 95.7 339.7 96.7 339.0 98.0 336.7 98.0 314.7 96.7 308.7 92.7 302.0 88.0 298.0 81.0 295.0 72.0 295.0 66.3 297.0Z"],[105,"M132.3 295.0 122.7 295.0 115.0 298.3 109.0 304.0 106.0 309.3 105.0 312.7 104.7 319.7 106.0 325.7 108.7 330.7 113.3 335.7 118.3 338.7 124.3 340.3 134.0 339.7 140.0 336.7 141.3 337.7 142.0 339.3 142.0 343.3 141.0 345.7 137.0 349.0 131.0 350.0 120.7 350.0 114.3 353.0 113.0 354.7 113.0 357.7 116.0 360.3 118.0 360.3 122.7 357.7 124.7 357.3 137.3 357.7 144.0 354.7 146.7 352.0 149.7 346.0 149.7 336.7 148.7 333.7 146.7 331.0 146.7 329.7 149.7 323.7 150.3 319.7 150.0 313.3 148.7 308.7 146.0 304.0 142.3 300.0 139.7 298.0ZM125.3 303.0 130.0 303.0 135.7 305.3 140.0 309.7 142.0 314.3 142.0 321.0 140.7 324.3 136.0 329.7 131.0 332.0 124.0 332.0 118.7 329.3 115.0 325.3 112.7 319.0 113.0 314.3 115.3 309.3 120.3 304.7Z"],[128,"M132.7 374.7 129.0 377.0 128.3 378.3 128.3 381.7 130.7 384.3 137.0 386.3 139.0 388.3 139.0 390.0 136.0 392.7 132.3 392.0 130.3 389.3 128.7 389.3 128.3 391.0 129.0 392.3 132.0 394.7 137.7 394.7 141.3 390.7 141.0 386.7 139.3 385.0 131.7 382.0 130.7 380.7 130.7 379.0 133.0 376.7 136.0 376.7 139.3 379.7 141.0 379.3 141.0 378.0 138.0 375.0Z"],[150,"M156.7 375.0 154.0 376.3 151.3 379.3 150.0 383.3 150.3 387.3 152.3 391.3 157.0 394.7 163.0 394.7 166.3 392.7 168.7 390.0 170.0 385.0 169.7 381.7 168.0 378.3 164.3 375.3 162.0 374.7ZM158.3 376.7 161.7 376.7 164.0 377.7 166.0 379.7 167.3 382.7 167.3 386.3 166.0 389.7 163.3 392.0 161.0 392.7 156.7 392.0 154.0 389.7 152.7 386.7 152.7 382.3 154.0 379.7 156.0 377.7Z"],[155,"M173.0 295.0 167.3 297.0 164.0 299.0 158.3 305.0 155.0 312.7 155.0 322.3 158.0 329.7 159.7 332.0 165.3 337.0 168.3 338.7 174.7 340.3 185.0 339.7 188.3 338.3 190.7 336.3 191.3 333.3 190.3 331.3 188.3 330.0 186.3 330.0 182.7 332.0 179.7 332.7 173.0 332.0 169.3 330.0 166.0 326.7 164.0 323.0 164.0 321.7 197.3 321.3 199.0 320.7 200.7 318.0 199.7 311.0 195.7 303.3 189.7 298.0 182.0 295.0ZM163.7 312.7 166.0 308.3 171.0 304.0 174.7 302.7 181.0 302.7 187.0 305.7 190.7 310.0 192.0 313.7 191.0 314.7 164.7 314.7Z"],[178,"M184.7 375.0 181.7 376.7 179.0 380.0 178.0 384.0 179.0 389.0 182.3 393.0 185.0 394.7 191.3 394.7 196.3 390.7 196.7 389.0 194.3 389.0 192.7 391.0 190.3 392.3 187.0 392.7 185.0 392.0 182.7 390.3 181.0 387.7 181.0 381.7 183.7 378.0 186.3 376.7 190.7 377.0 194.3 380.3 196.7 380.3 196.7 379.0 195.0 377.0 191.7 375.0Z"],[207,"M207.7 374.7 207.0 375.0 207.0 394.7 209.0 394.7 209.3 375.3Z"],[208,"M211.0 278.7 209.0 280.3 208.3 282.0 208.3 325.3 209.0 329.3 211.7 334.3 215.3 337.7 220.3 339.7 225.7 339.7 227.7 337.7 227.7 334.0 225.3 332.0 222.7 332.0 219.3 330.7 216.7 326.7 216.7 281.7 214.7 279.0Z"],[220,"M220.7 374.7 219.7 375.3 219.7 394.7 230.0 394.7 230.0 393.0 229.0 392.3 223.3 392.7 222.3 392.3 221.7 391.0 221.7 386.7 222.3 385.7 228.3 385.7 229.3 385.0 228.7 383.7 222.7 383.7 222.0 383.0 222.0 377.3 222.7 376.7 229.7 376.7 230.0 375.3 229.0 374.7Z"],[222,"M323.7 139.3 317.0 138.0 301.7 138.0 295.3 139.0 285.7 142.0 279.3 145.3 274.3 149.0 266.0 158.3 257.0 174.0 250.0 192.3 245.0 211.0 239.7 221.3 232.7 229.3 227.3 233.0 224.0 234.0 222.3 235.3 233.0 236.7 246.7 236.7 254.0 235.7 263.7 232.7 273.7 226.0 282.0 217.0 289.7 204.0 294.7 190.7 302.7 162.3 306.7 153.3 309.7 148.7 314.3 143.7 319.0 140.7Z"],[233,"M236.3 280.0 233.7 282.7 233.7 286.0 236.0 288.7 240.0 288.7 242.7 286.0 242.7 283.0 241.7 281.3 239.7 280.0Z"],[234,"M237.7 294.7 235.3 295.7 234.0 297.7 234.0 337.3 235.3 339.3 239.3 340.0 240.3 339.7 242.0 337.3 242.0 297.7 240.0 295.0Z"],[240,"M240.0 375.0 240.0 394.7 249.0 394.7 252.3 393.0 254.3 391.3 256.3 387.0 256.3 382.7 255.0 379.0 253.3 377.0 249.3 375.0ZM243.0 376.7 249.7 377.3 251.3 378.3 253.3 381.0 254.0 386.3 252.0 390.3 249.7 392.0 243.7 392.7 242.3 391.7 242.3 377.3Z"],[250,"M258.0 299.7 253.3 305.3 250.7 312.3 250.3 336.7 251.0 338.0 253.0 339.7 256.0 339.7 258.0 338.0 258.7 336.3 258.7 313.7 260.0 310.0 263.7 305.7 267.0 303.7 274.3 303.0 280.0 305.7 282.7 308.3 284.3 311.3 285.3 315.0 285.3 336.7 286.3 338.7 288.0 339.7 291.7 339.3 293.7 336.3 293.7 315.0 291.7 307.3 287.3 301.0 279.7 296.0 273.3 294.7 267.3 295.0 264.0 296.0Z"],[265,"M271.7 375.0 265.0 392.3 264.7 394.7 267.0 394.7 268.0 391.3 269.3 390.0 276.7 390.0 278.0 391.3 279.0 394.7 281.3 394.7 274.7 375.3ZM273.0 379.0 274.0 380.0 276.3 387.3 275.7 388.0 270.0 388.0 269.7 386.7 272.0 380.0Z"],[291,"M290.7 375.0 290.7 394.7 299.7 394.7 303.0 393.0 305.0 391.3 307.0 387.0 307.0 382.7 305.7 379.0 304.0 377.0 300.0 375.0ZM293.7 376.7 300.3 377.3 301.7 378.0 304.0 381.0 304.7 383.3 304.3 387.3 303.0 390.0 300.3 392.0 294.3 392.7 293.0 391.7 293.0 377.3Z"],[300,"M318.7 295.0 311.0 298.0 304.0 304.7 301.3 310.0 300.0 318.0 301.0 324.3 304.7 331.3 307.7 334.7 311.3 337.3 315.7 339.3 320.0 340.3 330.7 339.7 335.0 337.7 336.7 335.7 336.7 332.7 335.0 330.7 331.7 330.0 328.0 332.0 325.0 332.7 318.7 332.0 315.3 330.3 312.0 327.3 309.7 323.3 309.7 321.7 342.7 321.3 345.7 319.3 345.7 312.7 341.7 304.0 335.7 298.3 327.7 295.0ZM309.3 312.7 311.0 309.0 315.3 304.7 320.0 302.7 326.3 302.7 331.7 305.0 335.3 308.7 337.0 311.7 337.3 314.0 336.0 314.7 310.7 314.7 309.3 314.0Z"],[300,"M331.3 1.0 300.3 78.3 301.3 78.3 302.7 76.7 310.3 62.3 311.3 61.7 380.3 231.7 379.3 233.0 355.7 233.0 355.3 234.3 356.3 235.0 443.3 235.0 444.3 234.3 444.0 233.0 426.3 233.0 424.7 230.7 332.3 1.3Z"],[316,"M316.7 375.0 316.3 394.3 326.7 394.7 327.0 393.3 326.0 392.3 320.0 392.7 318.7 391.3 318.7 386.3 319.3 385.7 325.3 385.7 326.0 385.0 325.7 383.7 319.7 383.7 318.7 382.7 318.7 377.7 319.7 376.7 326.7 376.7 326.7 375.0Z"],[350,"M350.3 375.0 350.0 394.7 359.0 394.7 363.0 392.7 365.3 390.0 366.7 385.7 366.3 382.0 364.7 378.3 362.0 376.0 359.3 375.0ZM353.3 376.7 359.0 377.0 361.0 378.0 363.7 381.7 364.0 387.0 363.0 389.3 359.7 392.0 353.7 392.7 352.3 391.3 352.3 377.7Z"],[372,"M378.0 309.0 375.3 310.3 373.0 313.0 372.3 314.7 372.3 318.7 373.7 321.3 376.3 323.7 381.3 324.3 385.0 322.7 387.7 318.7 387.7 314.7 386.0 311.7 383.0 309.3Z"],[376,"M376.0 375.0 376.0 394.7 386.3 394.7 386.0 392.7 379.7 392.7 378.0 391.3 378.0 386.7 378.7 385.7 385.3 385.3 385.0 383.7 379.3 383.7 378.3 383.0 378.0 377.7 379.0 376.7 386.0 376.7 386.3 375.3 385.0 374.7Z"],[396,"M427.0 0.7 395.7 78.0 396.7 78.3 397.7 77.3 405.7 62.3 406.7 61.7 409.0 66.0 476.0 232.0 475.0 233.0 451.0 233.0 450.7 234.0 451.3 235.0 539.0 235.0 539.7 234.7 539.3 233.0 522.0 233.0 520.7 232.0 427.7 1.0Z"],[408,"M415.3 375.0 408.3 394.7 410.7 394.7 411.7 391.3 413.0 390.0 420.3 390.0 421.7 391.3 422.7 394.7 425.0 394.7 418.0 375.0ZM416.3 379.0 417.7 380.0 420.0 386.7 419.7 388.0 414.0 388.0 413.3 387.3Z"],[414,"M436.7 278.3 434.0 281.7 414.0 333.7 414.0 337.7 416.7 340.0 420.3 339.3 424.3 331.7 452.7 331.7 456.7 339.3 458.3 340.0 461.3 339.7 463.3 337.3 463.3 334.3 442.7 280.7 440.3 278.3ZM438.0 295.0 439.3 295.7 449.0 320.7 449.0 323.0 428.7 323.3 427.7 322.7Z"],[434,"M434.3 375.0 434.3 394.7 443.3 394.7 447.3 392.7 449.7 390.0 450.7 387.3 450.7 382.0 449.7 379.3 447.7 377.0 443.7 375.0ZM437.3 376.7 443.3 377.0 445.3 378.0 448.0 381.7 448.0 388.0 447.0 389.7 444.0 392.0 437.7 392.7 436.7 391.7 436.7 377.3Z"],[459,"M459.7 374.7 458.7 375.3 466.0 394.7 468.7 394.7 476.0 375.0 474.7 374.7 473.3 375.7 468.7 389.0 467.3 391.0 461.7 375.7Z"],[468,"M477.0 299.0 472.0 304.3 469.0 311.0 468.3 316.3 468.3 336.0 469.0 338.0 471.0 339.7 474.3 339.7 476.7 337.0 476.7 314.0 479.0 308.7 481.3 306.0 485.0 303.7 492.3 303.0 497.7 305.3 501.7 309.7 503.7 316.3 503.7 337.3 506.0 339.7 509.3 339.7 511.7 337.0 511.7 313.7 509.7 307.0 506.7 302.3 500.0 297.0 494.3 295.0 485.7 295.0 480.0 297.0Z"],[484,"M490.3 375.0 488.0 376.3 484.7 380.7 484.0 382.7 484.3 387.7 486.0 391.0 490.7 394.7 497.0 394.7 500.3 392.7 503.3 388.3 503.3 381.0 501.7 378.0 497.3 375.0ZM492.3 376.7 495.7 376.7 498.0 377.7 500.0 379.7 501.3 383.3 501.0 387.7 499.7 390.0 495.0 392.7 492.7 392.7 489.7 391.3 487.7 389.3 486.7 387.0 486.7 382.0 487.7 380.0 490.0 377.7Z"],[512,"M516.0 376.3 513.0 380.0 512.0 383.3 513.0 389.3 515.7 392.7 519.0 394.7 525.0 394.7 527.7 393.0 530.7 389.7 531.7 387.0 531.7 384.3 521.3 384.0 521.3 385.7 528.0 385.7 529.0 386.7 528.0 389.3 525.7 391.7 521.7 392.7 519.0 392.0 516.3 390.0 514.7 387.0 514.7 382.3 517.7 378.0 520.7 376.7 524.3 377.0 528.3 380.3 530.0 380.7 530.7 379.3 527.7 376.0 525.7 375.0 520.0 374.7Z"],[518,"M546.0 295.0 536.3 295.0 529.7 297.7 523.7 302.7 521.3 306.0 519.0 311.3 518.3 315.0 519.0 323.7 521.0 328.7 527.0 335.7 532.0 338.7 538.0 340.3 547.7 339.7 553.7 336.7 555.0 337.7 555.7 339.7 555.7 343.0 554.7 345.7 550.7 349.0 544.7 350.0 534.7 350.0 528.0 353.0 526.7 355.0 527.0 358.3 529.7 360.3 531.7 360.3 536.3 357.7 551.0 357.7 556.7 355.3 560.3 352.0 563.3 345.7 563.7 338.3 562.7 334.7 560.3 330.7 563.7 322.3 564.0 316.0 562.7 309.7 559.7 304.0 556.0 300.0 553.3 298.0ZM538.7 303.0 543.3 303.0 549.3 305.3 553.7 309.7 555.7 314.7 556.0 318.7 554.0 325.0 550.0 329.3 544.7 332.0 537.7 332.0 534.3 330.7 529.3 326.3 526.7 321.0 526.7 314.3 528.7 309.7 534.0 304.7Z"],[540,"M547.0 375.0 540.0 393.0 540.0 394.7 542.3 394.7 544.3 390.0 552.0 390.0 554.3 394.7 556.7 394.7 549.7 375.0ZM548.0 379.0 549.0 379.7 551.7 387.0 551.0 388.0 545.0 387.7Z"],[566,"M566.7 374.7 565.7 375.7 566.0 394.7 575.0 394.7 578.7 392.7 581.7 389.0 582.3 386.7 581.7 380.3 578.3 376.3 575.3 375.0ZM569.0 376.7 575.7 377.3 579.0 380.3 580.0 383.3 579.7 387.3 578.0 390.3 575.7 392.0 569.7 392.7 568.3 391.7 568.3 377.3Z"],[568,"M586.7 295.0 581.0 297.0 577.7 299.0 574.0 302.3 571.3 306.0 569.0 311.3 568.3 315.3 569.0 323.7 573.3 332.0 580.0 337.7 588.0 340.3 598.7 339.7 602.0 338.3 604.7 336.0 605.0 333.7 603.7 331.0 602.0 330.0 600.0 330.0 596.3 332.0 593.3 332.7 586.7 332.0 583.0 330.0 579.7 326.7 577.7 322.0 578.3 321.3 611.0 321.3 612.7 320.7 614.0 318.7 613.7 312.0 610.0 304.3 603.3 298.0 596.0 295.0ZM577.3 313.0 579.7 308.3 584.7 304.0 588.3 302.7 594.7 302.7 600.7 305.7 604.0 309.3 605.7 313.7 605.0 314.3 578.7 314.7Z"],[591,"M597.0 375.0 592.3 378.7 591.0 381.3 591.0 388.0 592.3 390.7 597.3 394.7 603.7 394.7 606.3 393.0 609.7 389.0 610.3 387.0 609.7 380.3 607.3 377.0 604.0 375.0ZM598.7 376.7 602.3 376.7 605.0 378.0 607.0 380.3 608.0 383.0 608.0 386.3 607.0 389.0 605.3 391.0 601.7 392.7 596.7 391.7 594.3 389.3 593.0 385.3 593.7 381.0 595.3 378.7Z"],[619,"M623.7 374.7 620.0 377.0 619.3 378.3 619.3 381.7 621.7 384.3 629.0 387.0 630.0 388.3 630.0 390.0 627.0 392.7 623.3 392.0 621.3 389.3 619.7 389.3 619.3 391.0 620.0 392.3 623.0 394.7 628.7 394.7 632.3 390.7 632.0 386.7 628.3 384.0 623.7 382.7 621.7 380.7 621.7 379.0 624.0 376.7 627.0 376.7 630.3 379.7 632.0 379.3 632.0 378.0 629.0 375.0Z"],[622,"M624.7 278.7 622.0 281.7 622.3 328.0 625.0 334.0 629.0 337.7 634.0 339.7 639.3 339.7 641.7 337.0 641.0 333.7 639.0 332.0 636.3 332.0 633.0 330.7 631.0 328.3 630.3 326.3 630.3 282.3 628.3 279.0Z"],[647,"M650.0 280.0 647.3 282.7 647.0 285.3 648.0 287.3 649.7 288.7 653.7 288.7 656.3 285.7 656.0 282.3 653.3 280.0Z"],[648,"M651.3 294.7 649.0 295.7 647.7 297.7 647.7 337.3 649.0 339.3 653.0 340.0 654.0 339.7 655.7 337.3 655.7 297.3 654.0 295.3Z"],[664,"M671.7 299.7 669.0 302.3 666.0 307.0 664.0 313.7 664.3 337.7 666.7 339.7 669.7 339.7 672.0 337.3 672.0 316.0 672.7 312.3 674.7 308.3 677.3 305.7 680.7 303.7 688.0 303.0 693.7 305.7 698.0 311.3 699.0 314.3 699.0 337.0 700.0 338.7 701.7 339.7 705.3 339.3 707.3 336.0 707.3 316.3 706.3 310.0 702.7 303.0 696.7 297.7 693.3 296.0 687.0 294.7 681.0 295.0 677.7 296.0Z"],[714,"M732.3 295.0 724.7 298.0 722.3 299.7 717.0 305.7 714.0 313.7 714.3 323.0 716.0 327.7 718.3 331.3 721.3 334.7 725.0 337.3 729.3 339.3 733.7 340.3 744.3 339.7 749.0 337.3 750.3 335.3 750.3 333.0 748.7 330.7 745.3 330.0 741.7 332.0 738.7 332.7 732.3 332.0 729.0 330.3 725.7 327.3 723.0 322.0 723.7 321.3 756.3 321.3 759.7 319.3 759.7 313.0 756.7 306.0 753.7 302.0 749.3 298.3 741.3 295.0ZM722.7 313.3 724.7 309.0 727.7 305.7 733.7 302.7 740.0 302.7 743.7 304.0 747.7 307.0 751.0 312.3 751.0 314.0 750.0 314.7 724.0 314.7Z"]];
  const NS2='http://www.w3.org/2000/svg';
  const lsv=document.createElementNS(NS2,'svg');lsv.setAttribute('viewBox','0 0 760 395');lsv.setAttribute('width','100%');lsv.setAttribute('height','100%');lsv.style.overflow='visible';
  LP.forEach(([x,d])=>{
    const p=document.createElementNS(NS2,'path');p.setAttribute('d',d);p.setAttribute('pathLength','1');p.setAttribute('fill','#fff');p.setAttribute('fill-rule','evenodd');p.setAttribute('fill-opacity','0');p.setAttribute('stroke','#fff');p.setAttribute('stroke-width','1.3');p.setAttribute('vector-effect','non-scaling-stroke');p.setAttribute('stroke-linejoin','round');p.setAttribute('stroke-dasharray','1');p.setAttribute('stroke-dashoffset','1');
    lsv.appendChild(p);const dl=900+x/760*700;
    p.animate([{strokeDashoffset:1},{strokeDashoffset:0}],{duration:1500,delay:dl,easing:'cubic-bezier(.5,0,.25,1)',fill:'both'});
    p.animate([{fillOpacity:0},{fillOpacity:1}],{duration:900,delay:2900,easing:'ease-out',fill:'both'});
  });
  wrap.appendChild(lsv);sec.appendChild(wrap);
  setTimeout(()=>{img.style.transition='opacity .6s';img.style.opacity='';lsv.style.transition='opacity .6s';lsv.style.opacity='0'},3900);
  setTimeout(()=>{wrap.remove();img.style.transition=''},4600);
  const upd=2500;
  dimg.animate([{opacity:0,transform:'scale(1)',filter:'blur(16px)'},{opacity:1,transform:'scale(1)',filter:'blur(0)'}],{duration:1500,delay:upd,easing:ez,fill:'both'}).onfinish=function(){this.cancel();dimg.style.opacity='';dimg.classList.add('zoom');if(seal)seal.classList.add('go')};
}

/* pausa os blobs das secoes fora da tela */
(function(){const io=new IntersectionObserver(es=>es.forEach(e=>e.target.classList.toggle('off',!e.isIntersecting)),{rootMargin:'80px'});$$('.sec').forEach(x=>io.observe(x))})();

/* ---------- inicio do site ---------- */
function startSite(){
  if(siteOn)return;siteOn=true;
  setTops();onScroll();setActive('links');heroIntro();
  
}
window.__site={setTops,onScroll,startSite,enterSite};
})();
