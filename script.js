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

  /* ---- photo tile: avatar -> teaser comment on hover -> click flips to photo ---- */
  var wrap=document.getElementById('tilewrap'),tile=document.getElementById('tile'),
      bub=document.getElementById('bubble'),img=document.getElementById('photo');
  var teasers=['psst, click me','there is a real human in here','no AI-generated face, promise','tap to meet the human'],ti=0,hideT;
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

  /* ---- typing title: "Aditya Dolas ;" -> backspace -> "Adi ;" -> backspace -> repeat ---- */
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
  var LFM_USER='PavitraPapi',LFM_KEY='e6eef070b842e52e5938fbd2336751c3';
  var np=document.getElementById('np'),npt=document.getElementById('nptext');
  function poll(){
    if(!LFM_USER||!LFM_KEY)return;
    fetch('https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user='+encodeURIComponent(LFM_USER)+'&api_key='+encodeURIComponent(LFM_KEY)+'&format=json&limit=1')
      .then(function(x){return x.json()}).then(function(j){
        var t=j.recenttracks.track[0];if(!t)return;
        var live=t['@attr']&&t['@attr'].nowplaying==='true';
        npt.textContent=(live?'Now playing · ':'Last played · ')+t.name+' — '+t.artist['#text'];
        np.href=t.url;np.classList.toggle('idle',!live);
      }).catch(function(){});
  }
  poll();setInterval(poll,30000);

  /* ---- project previews: floating card on desktop hover, inline thumbnail on touch/mobile ---- */
  var peek=document.getElementById('peek'),svgs={};
  peek.querySelectorAll('svg').forEach(function(s){svgs[s.dataset.k]=s});
  document.querySelectorAll('[data-peek]').forEach(function(el){
    var th=document.createElement('div');th.className='thumb';th.setAttribute('aria-hidden','true');
    var c=svgs[el.dataset.peek].cloneNode(true);c.removeAttribute('data-k');c.classList.add('show');th.appendChild(c);
    el.insertBefore(th,el.firstChild);
  });
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

  /* ---- GitHub contributions (snapshot from data.js) ---- */
  var D=window.CONTRIB;
  var grid=document.getElementById('grid'),months=document.getElementById('months');
  var start=new Date(D.start+'T00:00:00Z'),total=0,lastM=-1;
  var MN=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var frag=document.createDocumentFragment();
  for(var k=0;k<D.lv.length;k++){
    var d=new Date(start.getTime()+k*864e5),n=D.ct[k];total+=n;
    var c=document.createElement('i');
    c.dataset.l=D.lv[k];
    c.style.setProperty('--c',Math.floor(k/7));
    c.title=(n||'No')+' contribution'+(n===1?'':'s')+' on '+MN[d.getUTCMonth()]+' '+d.getUTCDate()+', '+d.getUTCFullYear();
    frag.appendChild(c);
    if(k%7===0){
      var m=d.getUTCMonth();
      if(m!==lastM){var s=document.createElement('span');s.textContent=MN[m];s.style.gridColumn=(Math.floor(k/7)+1);months.appendChild(s);lastM=m}
    }
  }
  grid.appendChild(frag);
  document.getElementById('total').textContent=total+' contributions in the last year';
  var cw=document.getElementById('calwrap');cw.scrollLeft=cw.scrollWidth;

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
