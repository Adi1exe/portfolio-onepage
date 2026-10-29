(function(){
  var r=document.documentElement,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer=matchMedia('(hover:hover) and (pointer:fine)').matches;

  /* ---- theme toggle with circular reveal ---- */
  function isDark(){var t=r.getAttribute('data-theme');return t?t==='dark':matchMedia('(prefers-color-scheme: dark)').matches}
  document.getElementById('theme').addEventListener('click',function(e){
    var next=isDark()?'light':'dark',x=e.clientX,y=e.clientY;
    if(!x&&!y){var b=this.getBoundingClientRect();x=b.left+b.width/2;y=b.top+b.height/2}
    var apply=function(){r.setAttribute('data-theme',next)};
    if(!document.startViewTransition||reduced){apply();return}
    var t=document.startViewTransition(apply);
    var rad=Math.hypot(Math.max(x,innerWidth-x),Math.max(y,innerHeight-y));
    t.ready.then(function(){
      r.animate({clipPath:['circle(0px at '+x+'px '+y+'px)','circle('+rad+'px at '+x+'px '+y+'px)']},
        {duration:650,easing:'cubic-bezier(.4,0,.2,1)',pseudoElement:'::view-transition-new(root)'});
    });
  });

  var wrap=document.getElementById('tilewrap'),tile=document.getElementById('tile'),
      bub=document.getElementById('bubble'),img=document.getElementById('photo');
  var teasers=['psst'],ti=0,hideT;
  function tease(){bub.textContent=teasers[ti++%teasers.length]}
  function flash(ms){wrap.classList.add('hint');clearTimeout(hideT);hideT=setTimeout(function(){wrap.classList.remove('hint')},ms)}
  tease();
  tile.addEventListener('mouseenter',function(){if(!tile.classList.contains('on'))tease()});
  tile.addEventListener('click',function(){
    var on=tile.classList.toggle('on');
    tile.setAttribute('aria-pressed',on);
    bub.textContent=on?'hi, that is me':teasers[ti++%teasers.length];
    flash(2200);
  });
  function nophoto(){tile.classList.add('nophoto')}
  if(img.complete&&img.naturalWidth===0)nophoto();
  img.addEventListener('error',nophoto);
  if(!finePointer)setTimeout(function(){bub.textContent='tap to meet the human';flash(3500)},1800);

  var typed=document.getElementById('typed');
  function show(s){
    typed.textContent='';
    if(s.slice(-1)===';'){typed.append(s.slice(0,-1));var m=document.createElement('span');m.className='semi';m.textContent=';';typed.append(m)}
    else typed.append(s);
  }
  var A='Aditya Dolas ;',B='Adi ;';
  if(reduced){show(A)}
  else{
    var i=0,phase=0;
    (function tick(){
      var d=95;
      if(phase===0){i++;show(A.slice(0,i));if(i===A.length){phase=1;d=1600}}
      else if(phase===1){i--;show(A.slice(0,i));d=45;if(i===0){phase=2;d=350}}
      else if(phase===2){i++;show(B.slice(0,i));if(i===B.length){phase=3;d=2200}}
      else{i--;show(B.slice(0,i));d=45;if(i===0){phase=0;d=350}}
      setTimeout(tick,d);
    })();
  }

  /* ---- Pune clock ---- */
  var clock=document.getElementById('clock');
  var fmt=new Intl.DateTimeFormat('en-GB',{hour:'2-digit',minute:'2-digit',hour12:false,timeZone:'Asia/Kolkata'});
  function tickClock(){clock.textContent='Pune, '+fmt.format(new Date())}
  tickClock();setInterval(tickClock,15000);

  /* ---- Now playing (Last.fm). Fill these two in. ---- */
 var np=document.getElementById('np'),npt=document.getElementById('nptext');
function poll(){
  fetch('/api/nowplaying').then(function(x){return x.json()}).then(function(t){
    if(!t.name)return;
    npt.textContent=(t.live?'Now playing · ':'Last played · ')+t.name+' — '+t.artist;
    np.href=t.url;np.classList.toggle('idle',!t.live);
  }).catch(function(){});
}
poll();setInterval(poll,30000);

  /* ---- project previews: floating card on desktop hover only ---- */
  var peek=document.getElementById('peek'),svgs={};
  peek.querySelectorAll('svg').forEach(function(s){svgs[s.dataset.k]=s});
  if(finePointer&&!reduced){
    var px=0,py=0,cx=0,cy=0,raf=0;
    var loop=function(){cx+=(px-cx)*.18;cy+=(py-cy)*.18;peek.style.transform='translate3d('+cx+'px,'+cy+'px,0)';
      raf=peek.classList.contains('on')?requestAnimationFrame(loop):0};
    document.querySelectorAll('[data-peek]').forEach(function(el){
      el.addEventListener('mouseenter',function(e){
        Object.keys(svgs).forEach(function(k){svgs[k].classList.toggle('show',k===el.dataset.peek)});
        px=cx=e.clientX+22;py=cy=e.clientY+18;peek.classList.add('on');if(!raf)raf=requestAnimationFrame(loop);
      });
      el.addEventListener('mousemove',function(e){px=Math.min(e.clientX+22,innerWidth-240);py=Math.min(e.clientY+18,innerHeight-160)});
      el.addEventListener('mouseleave',function(){peek.classList.remove('on')});
    });
  }

  /* ---- GitHub contributions: rolling year, live API with local snapshot fallback ---- */
  var grid=document.getElementById('grid'),months=document.getElementById('months');
  var MN=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  function renderCalendar(data){
    var frag=document.createDocumentFragment(),monthFrag=document.createDocumentFragment(),lastM=-1;
    var start=new Date(data.start+'T00:00:00Z'),total=0;
    data.days.forEach(function(day,k){
      var d=new Date(day.date+'T00:00:00Z'),n=day.count;
      total+=n;
      var c=document.createElement('i');
      c.dataset.l=day.level;
      c.style.setProperty('--c',Math.floor(k/7));
      c.title=(n||'No')+' contribution'+(n===1?'':'s')+' on '+MN[d.getUTCMonth()]+' '+d.getUTCDate()+', '+d.getUTCFullYear();
      frag.appendChild(c);
      if(k%7===0){
        var m=d.getUTCMonth();
        if(m!==lastM){var s=document.createElement('span');s.textContent=MN[m];s.style.gridColumn=(Math.floor(k/7)+1);monthFrag.appendChild(s);lastM=m}
      }
    });
    grid.replaceChildren(frag);
    months.replaceChildren(monthFrag);
    document.getElementById('total').textContent=total+' contributions in the past year';
    grid.setAttribute('role','img');
    grid.setAttribute('aria-label',total+' contributions from '+data.start+' through '+data.through);
    grid.classList.add('in');
    var cw=document.getElementById('calwrap');cw.scrollLeft=cw.scrollWidth;
  }
  var snapshot=window.CONTRIB;
  if(snapshot){
    var snapshotDays=[],today=new Date(),todayISO=today.toISOString().slice(0,10);
    today.setUTCHours(0,0,0,0);today.setUTCDate(today.getUTCDate()-364);today.setUTCDate(today.getUTCDate()-today.getUTCDay());
    var snapshotStart=today.toISOString().slice(0,10);
    for(var i=0;i<snapshot.lv.length;i++){
      var sd=new Date(new Date(snapshot.start+'T00:00:00Z').getTime()+i*864e5);
      var dayISO=sd.toISOString().slice(0,10);
      if(dayISO>=snapshotStart&&dayISO<=todayISO)snapshotDays.push({date:dayISO,level:Number(snapshot.lv[i]),count:snapshot.ct[i]||0});
    }
    if(snapshotDays.length)renderCalendar({start:snapshotStart,through:todayISO,days:snapshotDays});
  }
  fetch('/api/contributions',{cache:'no-store'}).then(function(response){
    if(!response.ok)throw new Error('Contribution endpoint unavailable');
    return response.json();
  }).then(function(data){
    if(data.start&&data.through&&Array.isArray(data.days))renderCalendar(data);
  }).catch(function(){});

  /* ---- reveal on scroll ---- */
  var els=document.querySelectorAll('.rv');
  els.forEach(function(e,j){e.style.setProperty('--d',(j%4)*70+'ms')});
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12,rootMargin:'0px 0px -40px 0px'});
    els.forEach(function(e){io.observe(e)});
    var go=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){grid.classList.add('in');go.disconnect()}})},{threshold:.2});
    go.observe(grid);
  }else{els.forEach(function(e){e.classList.add('in')});grid.classList.add('in')}
})();
