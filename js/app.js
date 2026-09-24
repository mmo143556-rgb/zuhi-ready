const C=window.ZUHI_CONFIG||{};const sb=window.supabase?.createClient(C.SUPABASE_URL||'',C.SUPABASE_ANON_KEY||'');
let categories=[],products=[],services=[],reviews=[],settings={},currentCountry='all',selectedProduct=null,installPrompt=null,manifestUrl=null,detailImages=[],detailIndex=0;
const $=s=>document.querySelector(s), esc=s=>String(s??'').replace(/[&<>'"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[m]));
const loaderStart=Date.now();
function hidePageLoader(){const el=$('#pageLoader');if(!el||el.classList.contains('hide'))return;const wait=Math.max(0,450-(Date.now()-loaderStart));setTimeout(()=>el.classList.add('hide'),wait)}
function toast(m,err){const e=document.createElement('div');e.className='toast'+(err?' error':'');e.textContent=m;$('#toast-container').append(e);setTimeout(()=>e.remove(),2800)}
const stars=n=>'★★★★★☆☆☆☆☆'.slice(5-n,10-n);
function localReviews(){try{const saved=JSON.parse(localStorage.getItem('zuhi_local_reviews'));if(Array.isArray(saved)&&saved.length)return saved}catch{}const seed=[{name:'أحمد خالد',message:'تجربة مرتبة والمنتج وصلني من المتجر الأصلي بسرعة.',rating:5},{name:'سارة محمد',message:'التصفح بسيط والصور واضحة والأسعار ظاهرة.',rating:5},{name:'محمد العتيبي',message:'أعجبني تنوع المنتجات بين الدول العربية.',rating:4},{name:'نورة عبدالله',message:'الموقع سريع والشراء يتم بسهولة.',rating:5},{name:'ريم حسن',message:'خدمة ممتازة وتجربة استخدام مريحة.',rating:5},{name:'عبدالعزيز سالم',message:'وجدت المنتج الذي أبحث عنه في دقائق.',rating:4},{name:'جنى محمود',message:'التصميم أنيق والروابط تعمل بشكل جيد.',rating:5},{name:'خالد يوسف',message:'اختيارات جميلة وأسعار مناسبة.',rating:4},{name:'ليان سعد',message:'أحببت تقسيم المنتجات حسب الدولة.',rating:5},{name:'يوسف إبراهيم',message:'التجربة واضحة من أول زيارة.',rating:5},{name:'هند علي',message:'موقع عملي ومفيد جدًا للتسوق.',rating:4},{name:'عمر فهد',message:'وصلت للرابط الأصلي بدون خطوات معقدة.',rating:5},{name:'ملك سامي',message:'المنتجات المعروضة متنوعة ومميزة.',rating:5},{name:'مازن طارق',message:'واجهة نظيفة وسهلة على الهاتف.',rating:4},{name:'دعاء أحمد',message:'التفاصيل والوصف ساعدوني في الاختيار.',rating:5},{name:'فيصل ناصر',message:'تجربة ممتازة وأتمنى إضافة عروض أكثر.',rating:4},{name:'مريم أشرف',message:'أحببت الهوية السعودية والألوان.',rating:5},{name:'رامي حسن',message:'الموقع منظم والبحث مفيد.',rating:5},{name:'شهد وليد',message:'خدمة رائعة وتجربة شراء مباشرة.',rating:4},{name:'تركي منصور',message:'المنتجات تظهر بشكل مرتب وواضح.',rating:5},{name:'إسراء عادل',message:'من أفضل واجهات المتاجر التي جربتها.',rating:5},{name:'بدر القحطاني',message:'التنقل بين الأقسام سريع.',rating:4},{name:'نورهان سمير',message:'أعجبني وجود أسواق مصر والإمارات والسعودية.',rating:5},{name:'سلمان راشد',message:'تجربة مريحة والتصميم احترافي.',rating:5},{name:'فرح محمود',message:'وجدت خيارات مناسبة لعائلتي.',rating:4},{name:'راكان مشعل',message:'الزر ينقلني للرابط المطلوب مباشرة.',rating:5},{name:'بسمة خالد',message:'التفاصيل واضحة والصفحة لا تتعب العين.',rating:5},{name:'حاتم أمين',message:'موقع جميل ويستحق التجربة.',rating:4},{name:'رؤى ماجد',message:'التجربة على الجوال ممتازة.',rating:5},{name:'ياسر عادل',message:'أحببت سهولة الوصول للخدمات.',rating:5},{name:'لمى نواف',message:'ألوان الموقع مريحة ومميزة.',rating:4},{name:'أيمن طه',message:'تحديث المنتجات ظاهر بشكل واضح.',rating:5},{name:'غادة سمير',message:'موقع موثوق وتجربة لطيفة.',rating:5},{name:'مشعل فواز',message:'التصنيفات تساعد على الوصول بسرعة.',rating:4},{name:'رنا فؤاد',message:'الصور والوصف أعطوني ثقة في الاختيار.',rating:5},{name:'علي منصور',message:'أعجبني الاهتمام بالتفاصيل.',rating:5},{name:'سلمى يحيى',message:'واجهة عربية جميلة وسهلة.',rating:4},{name:'نايف حمد',message:'تجربة الشراء مباشرة ومريحة.',rating:5},{name:'أروى سعيد',message:'المتجر مرتب ويحتوي خيارات كثيرة.',rating:5},{name:'حسام نبيل',message:'التصميم سريع ولا توجد خطوات زائدة.',rating:4},{name:'مي عبدالله',message:'أحببت قسم الخدمات وطريقة عرضه.',rating:5},{name:'سيف أحمد',message:'الموقع عملي جدًا على الكمبيوتر والهاتف.',rating:5},{name:'نجلاء كمال',message:'التجربة سلسة والمنتجات واضحة.',rating:4},{name:'فهد سالم',message:'وصلت للمعلومة التي أحتاجها بسرعة.',rating:5},{name:'كريم محمود',message:'ألوان وهوية زُهي مميزة.',rating:5},{name:'سارة فهد',message:'موقع أنيق ومناسب للتسوق اليومي.',rating:4},{name:'وليد حسن',message:'التصفح ممتع والبطاقات مرتبة.',rating:5},{name:'تهاني علي',message:'أعجبني تنوع الدول والأقسام.',rating:5},{name:'صالح ياسر',message:'واجهة بسيطة بدون زحام.',rating:4},{name:'إيمان خالد',message:'تجربة ممتازة وسأعود للموقع.',rating:5}];return seed.map((v,i)=>({id:`local-review-${i}`,name:v.name,message:v.message,rating:v.rating,active:true,sort_order:i+1}))}

async function load(){
  if(!sb){toast('أضف config.js أولاً',true);hidePageLoader();return}
  const [c,p,s,r,st]=await Promise.all([
    sb.from('categories').select('*').eq('active',true).order('sort_order'),
    sb.from('products').select('*').eq('active',true).order('created_at',{ascending:false}),
    sb.from('services').select('*').eq('active',true).order('sort_order'),
    C.LOCAL_ADMIN_MODE?Promise.resolve({data:[]}):sb.from('testimonials').select('*').eq('active',true).order('sort_order'),
    sb.from('site_settings').select('*').eq('id',true).maybeSingle()
  ]);
  if(c.error||p.error||s.error){console.error(c.error||p.error||s.error);toast('تعذر تحميل البيانات. تأكد من إعداد Supabase.',true);hidePageLoader();return}
  categories=c.data||[];products=p.data||[];services=s.data||[];reviews=C.LOCAL_ADMIN_MODE?localReviews():(r.data||[]);settings=C.LOCAL_ADMIN_MODE?(()=>{try{return JSON.parse(localStorage.getItem('zuhi_local_settings'))||st.data||{}}catch{return st.data||{}}})():(st.data||{});
  applySettings();render();hidePageLoader()
}

function applySettings(){
  const hero=settings.hero_image_url||'assets/brand-board.png';
  $('#home').style.setProperty('--hero-image',`url('${hero}')`);
  const about=settings.about_image_url||'assets/brand-board.png',logo=settings.logo_image_url||about;
  $('#aboutImg').src=about;document.querySelectorAll('.logo-img').forEach(image=>image.src=logo);
  const icon=$('#appIcon');if(icon)icon.href=about;
  const manifest=$('link[rel="manifest"]');if(manifest){const data={name:`${settings.site_name||'زُهي'} | ZUHI`,short_name:settings.site_name||'زُهي',lang:'ar',dir:'rtl',start_url:location.href.split('#')[0],scope:location.href.split('#')[0],display:'standalone',background_color:'#f5f8f4',theme_color:'#0f5132',icons:[{src:about,sizes:'512x512',type:'image/png',purpose:'any maskable'}]};if(manifestUrl)URL.revokeObjectURL(manifestUrl);manifestUrl=URL.createObjectURL(new Blob([JSON.stringify(data)],{type:'application/manifest+json'}));manifest.href=manifestUrl}
  if(settings.site_name){document.title=`${settings.site_name} | ZUHI`}
  const title=$('#heroTitle');if(settings.hero_title&&title?.firstChild)title.firstChild.nodeValue=settings.hero_title+' ';
  const textMap={heroEyebrow:settings.hero_eyebrow,heroAccent:settings.hero_accent,heroText:settings.hero_text,heroPrimaryLabel:settings.hero_primary_label,heroSecondaryLabel:settings.hero_secondary_label,aboutTitle:settings.about_title,aboutText:settings.about_text};
  Object.entries(textMap).forEach(([id,value])=>{if(value&&$('#'+id))$('#'+id).textContent=value});
  const info=[];
  if(settings.phone)info.push(`<a href="tel:${esc(settings.phone)}">📞 ${esc(settings.phone)}</a>`);
  if(settings.email)info.push(`<a href="mailto:${esc(settings.email)}">✉️ ${esc(settings.email)}</a>`);
  if(settings.address)info.push(`<span>📍 ${esc(settings.address)}</span>`);
  $('#contactInfo').innerHTML=info.join('');
  const loaderLogo=$('#pageLoader .loader-logo');if(loaderLogo)loaderLogo.src=settings.loader_logo_url||logo;
  const devPhoto=$('#devCreditPhoto');if(devPhoto)devPhoto.src=settings.developer_photo_url||logo;
  document.querySelectorAll('.country-tab').forEach(btn=>btn.classList.toggle('hidden',btn.dataset.country!=='all'&&!countryEnabled(btn.dataset.country)));
  if(currentCountry!=='all'&&!countryEnabled(currentCountry)){
    currentCountry='all';
    document.querySelectorAll('.country-tab').forEach(b=>{const active=b.dataset.country==='all';b.classList.toggle('active',active);b.setAttribute('aria-selected',String(active))});
  }
}
function countryEnabled(c){if(c==='مصر')return settings.country_visible_egypt!==false;if(c==='الإمارات')return settings.country_visible_uae!==false;if(c==='السعودية')return settings.country_visible_saudi!==false;return true}

function subscribeRealtime(){if(!sb)return;let channel=sb.channel('zuhi-live').on('postgres_changes',{event:'*',schema:'public',table:'products'},load).on('postgres_changes',{event:'*',schema:'public',table:'categories'},load).on('postgres_changes',{event:'*',schema:'public',table:'services'},load).on('postgres_changes',{event:'*',schema:'public',table:'site_settings'},load);if(!C.LOCAL_ADMIN_MODE)channel=channel.on('postgres_changes',{event:'*',schema:'public',table:'testimonials'},load);channel.subscribe()}

function waveY(x,line,frame,height,style){
  const base=height*(.32+line*.16);
  if(style==='zigzag'){const period=150,amp=24,t=(((x+frame*(line?-1.5:1.5))%period)+period)%period;return base+(Math.abs(t/period*4-2)-1)*amp+Math.sin(x*.02+frame*.004)*5}
  if(style==='dotted')return base+Math.sin(x*.01+frame*(line?-.011:.013))*18;
  return base+Math.sin(x*.008+frame*(line?-.008:.01))*22+Math.sin(x*.018+frame*.004)*8;
}
function startWave(){const canvas=$('#waveCanvas'),context=canvas?.getContext('2d');if(!canvas||!context)return;let width=0,height=0,frame=0;const resize=()=>{width=canvas.width=innerWidth*devicePixelRatio;height=canvas.height=innerHeight*devicePixelRatio;canvas.style.width=`${innerWidth}px`;canvas.style.height=`${innerHeight}px`;context.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0)};const draw=()=>{const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;const color=settings.wave_color||'#a8ff3e';const style=settings.wave_style||'wave';const baseAlpha=Math.min(100,Math.max(10,Number(settings.wave_opacity)||66))/100;context.clearRect(0,0,innerWidth,innerHeight);for(let line=0;line<2;line++){context.beginPath();context.setLineDash(style==='dotted'?[2,11]:[]);context.lineDashOffset=style==='dotted'?-frame*.6*(line?-1:1):0;for(let x=-20;x<=innerWidth+20;x+=12){const y=waveY(x,line,frame,innerHeight,style);x===-20?context.moveTo(x,y):context.lineTo(x,y)}context.globalAlpha=baseAlpha*(line?.74:1);context.strokeStyle=color;context.lineWidth=1.7;context.shadowColor=color;context.shadowBlur=7;context.stroke()}context.globalAlpha=1;context.shadowBlur=0;context.setLineDash([]);if(!reduced){frame++;requestAnimationFrame(draw)}};addEventListener('resize',resize);resize();draw()}

function render(){
  const cg=$('#categoryGrid');
  cg.innerHTML=categories.map(c=>`<a class="category-card reveal" href="#products" onclick="filterCat('${c.id}')"><span class="category-icon">${esc(c.icon||'✦')}</span><strong>${esc(c.name)}</strong><small>تصفح القسم</small></a>`).join('');
  $('#categoryFilter').innerHTML='<option value="all">كل الأقسام</option>'+categories.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join('');
  renderProducts();
  $('#serviceGrid').innerHTML=services.map(s=>`<article class="service-card reveal"><div class="service-icon">${esc(s.icon||'✦')}</div><h3>${esc(s.name)}</h3><p>${esc(s.description||'')}</p><a class="btn secondary" href="${esc(s.link||'#contact')}">اكتشف الخدمة</a></article>`).join('');
  renderReviews();
  observe();
}

function renderReviews(){
  const reviewTitle=$('#reviewsToggle strong');if(reviewTitle)reviewTitle.textContent=`آراء العملاء${reviews.length?` (${reviews.length})`:''}`;
  $('#emptyReviews').classList.toggle('hidden',reviews.length>0);
  if(!reviews.length)$('#emptyReviews').textContent='لا توجد تقييمات منشورة بعد. شغّل جزء التقييمات من ملف supabase.sql ثم حدّث الصفحة.';
  $('#reviewsGrid').innerHTML=[...reviews].reverse().map((r,i)=>`<div class="review-card" id="rv${i}"><button class="review-summary" onclick="toggleReview(${i})"><div><strong>${esc(r.name)}</strong><span class="review-stars">${stars(r.rating)}</span></div><span class="review-arrow">‹</span></button><p class="review-text">${esc(r.message)}</p></div>`).join('');
}
function toggleReview(i){const card=$('#rv'+i);const opening=!card.classList.contains('open');card.classList.toggle('open');if(opening)requestAnimationFrame(()=>card.scrollIntoView({block:'nearest',behavior:'smooth'}))}

function renderProducts(){
  const q=($('#searchInput')?.value||'').toLowerCase(),f=$('#categoryFilter').value;
  const list=products.filter(p=>(f==='all'||p.category_id===f)&&(currentCountry==='all'||p.country===currentCountry)&&countryEnabled(p.country)&&(!q||(`${p.name} ${p.description||''}`).toLowerCase().includes(q)));
  $('#emptyProducts').classList.toggle('hidden',list.length>0);
  $('#productGrid').innerHTML=list.map(p=>`<article class="product-card reveal"><div class="product-img"><img src="${esc(p.image_url||(Array.isArray(p.images)&&p.images[0])||'')}" alt="${esc(p.name)}" loading="lazy"><span class="badge">${esc(countryFlag(p.country))} ${esc(categories.find(c=>c.id===p.category_id)?.name||'منتج')}</span>${Array.isArray(p.images)&&p.images.length>1?`<span class="badge images-badge">📷 ${p.images.length}</span>`:''}</div><div class="product-body"><h3>${esc(p.name)}</h3><button class="description-toggle" onclick="showDetails('${p.id}')">الوصف والتفاصيل <span>⌄</span></button>${Number(p.price||0)>0?`<div class="price">${Number(p.price).toLocaleString('ar-SA')} ${currencyLabel(p.country)}</div>`:''}<div class="product-actions"><button class="btn primary full" onclick="buy('${p.id}')">شراء الآن ↗</button></div></div></article>`).join('');
  observe();
}
function countryFlag(c){return c==='مصر'?'🇪🇬':c==='الإمارات'?'🇦🇪':'🇸🇦'}
function currencyLabel(c){return c==='مصر'?'ج.م':c==='الإمارات'?'د.إ':'ر.س'}
function filterCat(id){$('#categoryFilter').value=id;renderProducts()}
function buy(id){const p=products.find(x=>x.id===id);if(!p)return;selectedProduct=p;if(p.direct_order){$('#orderTitle').textContent=`طلب ${p.name}`;openModal('orderModal')}else if(p.affiliate_url){window.open(p.affiliate_url,'_blank','noopener,noreferrer')}else toast('رابط الشراء غير متاح لهذا المنتج',true)}
function showDetails(id){const p=products.find(x=>x.id===id);if(!p)return;selectedProduct=p;detailImages=(Array.isArray(p.images)&&p.images.length)?p.images:(p.image_url?[p.image_url]:['assets/brand-board.png']);detailIndex=0;renderDetailImage();$('#detailTitle').textContent=p.name;$('#detailCountry').textContent=`${countryFlag(p.country)} ${p.country||''}`;$('#detailDescription').textContent=p.description||'لا يوجد وصف لهذا المنتج.';$('#detailPrice').textContent=Number(p.price||0)>0?`${Number(p.price).toLocaleString('ar-SA')} ${currencyLabel(p.country)}`:'';openModal('productDetailModal')}
function renderDetailImage(){const img=$('#detailImage');if(!img)return;img.src=detailImages[detailIndex]||'assets/brand-board.png';img.alt=selectedProduct?.name||'';const multi=detailImages.length>1;$('#detailPrev')?.classList.toggle('hidden',!multi);$('#detailNext')?.classList.toggle('hidden',!multi);const dots=$('#detailDots');if(dots)dots.innerHTML=multi?detailImages.map((_,i)=>`<span class="detail-dot${i===detailIndex?' active':''}"></span>`).join(''):''}
function detailNav(dir){if(detailImages.length<2)return;detailIndex=(detailIndex+dir+detailImages.length)%detailImages.length;renderDetailImage()}
let modalScrollY=0;
function lockScroll(){modalScrollY=window.scrollY;document.body.style.position='fixed';document.body.style.top=`-${modalScrollY}px`;document.body.style.width='100%'}
function unlockScroll(){document.body.style.position='';document.body.style.top='';document.body.style.width='';window.scrollTo(0,modalScrollY)}
function openModal(id){const e=$('#'+id);e.classList.remove('hidden');e.setAttribute('aria-hidden','false');lockScroll();history.pushState({zuhiModal:id},'')}
function closeModal(id){const e=$('#'+id);e.classList.add('hidden');e.setAttribute('aria-hidden','true');unlockScroll();if(history.state&&history.state.zuhiModal===id)history.back()}
window.addEventListener('popstate',()=>{const open=document.querySelectorAll('.modal:not(.hidden)');if(open.length){open.forEach(m=>{m.classList.add('hidden');m.setAttribute('aria-hidden','true')});unlockScroll()}});
function registerShare(name,phone){localStorage.setItem('zuhi_share_user',JSON.stringify({name,phone}));const count=Number(localStorage.getItem('zuhi_share_count')||0)+1;localStorage.setItem('zuhi_share_count',count);return count}
function observe(){document.querySelectorAll('.reveal:not(.observed)').forEach(e=>{e.classList.add('observed');new IntersectionObserver(es=>es.forEach(x=>x.isIntersecting&&x.target.classList.add('visible')),{threshold:.1}).observe(e)})}

function spawnLoaderParticles(){
  const host=$('#pageLoader');if(!host)return;
  const wrap=document.createElement('div');wrap.className='loader-particles';
  for(let i=0;i<10;i++){
    const angle=Math.random()*Math.PI*2,dist=68+Math.random()*42;
    const p=document.createElement('span');p.className='loader-particle';
    p.style.setProperty('--dx',`${Math.cos(angle)*dist}px`);
    p.style.setProperty('--dy',`${Math.sin(angle)*dist}px`);
    p.style.animationDelay=`${(Math.random()*1.4).toFixed(2)}s`;
    wrap.appendChild(p);
  }
  host.appendChild(wrap);
}
document.addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('.logo-img').forEach(image=>image.src='assets/brand-board.png');
  spawnLoaderParticles();
  startWave();
  load();
  setTimeout(hidePageLoader,4000);
  subscribeRealtime();
  window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();installPrompt=event;const button=$('#installApp');if(button)button.classList.remove('hidden')});
  window.addEventListener('appinstalled',()=>{$('#installApp')?.classList.add('hidden');installPrompt=null});
  $('#installApp')?.addEventListener('click',async()=>{if(!installPrompt){toast('لتحميل الموقع كتطبيق، افتحه من رابط GitHub Pages ثم اختر تثبيت التطبيق من المتصفح');return}installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;$('#installApp').classList.add('hidden')});
  const isIos=/iphone|ipad|ipod/i.test(navigator.userAgent),isStandalone=matchMedia('(display-mode: standalone)').matches||navigator.standalone;
  if(isStandalone)$('#installApp')?.classList.add('hidden');
  if(!isStandalone)$('#installApp')?.classList.remove('hidden');
  if(isIos&&!isStandalone){const installButton=$('#installApp');if(installButton){installButton.classList.remove('hidden');installButton.textContent='＋ طريقة تثبيت التطبيق';installButton.onclick=()=>toast('اضغط مشاركة من المتصفح ثم اختر إضافة إلى الشاشة الرئيسية')}}
  $('#year').textContent=new Date().getFullYear();
  $('#categoryFilter').onchange=renderProducts;
  $('#searchBtn').onclick=()=>$('#searchBar').classList.toggle('hidden');
  $('#searchInput').oninput=renderProducts;
  $('#mobileMenuBtn').onclick=()=>$('#mainNav').classList.toggle('open');
  document.querySelectorAll('[data-close-order]').forEach(e=>e.onclick=()=>closeModal('orderModal'));
  document.querySelectorAll('[data-close-product]').forEach(e=>e.onclick=()=>closeModal('productDetailModal'));
  document.querySelectorAll('[data-close-review]').forEach(e=>e.onclick=()=>closeModal('reviewModal'));
  document.querySelectorAll('[data-close-share]').forEach(e=>e.onclick=()=>closeModal('shareModal'));
  document.querySelectorAll('[data-close-merchant]').forEach(e=>e.onclick=()=>closeModal('merchantModal'));
  $('#detailPrev')?.addEventListener('click',()=>detailNav(-1));
  $('#detailNext')?.addEventListener('click',()=>detailNav(1));
  const shareData=()=>({title:document.title,text:'اكتشف زُهي',url:location.href.split('#')[0]});
  $('#shareBtn').onclick=()=>openModal('shareModal');
  $('#nativeShareAction').onclick=async()=>{try{if(navigator.share)await navigator.share(shareData());else{await navigator.clipboard.writeText(shareData().url);toast('تم نسخ رابط زُهي للمشاركة')}closeModal('shareModal')}catch(error){if(error.name!=='AbortError')toast('تعذر تجهيز رابط المشاركة',true)}};
  $('#copyShareAction').onclick=async()=>{try{await navigator.clipboard.writeText(shareData().url);toast('تم نسخ رابط زُهي');closeModal('shareModal')}catch(error){toast('تعذر نسخ الرابط، انسخه من شريط العنوان',true)}};
  $('#detailBuy').onclick=()=>{closeModal('productDetailModal');if(selectedProduct)buy(selectedProduct.id)};
  $('#addReviewBtn').onclick=()=>openModal('reviewModal');
  $('#publicReviewForm').onsubmit=async e=>{e.preventDefault();const msg=$('#publicReviewMsg');if(!sb){msg.textContent='الموقع غير متصل بقاعدة البيانات.';return}const row={name:$('#publicReviewName').value.trim(),rating:Number($('#publicReviewRating').value),message:$('#publicReviewMessage').value.trim(),active:true,sort_order:reviews.length+1};const {error}=await sb.from('testimonials').insert(row);if(error){msg.textContent='تعذر نشر الرأي. تأكد من تشغيل supabase.sql.';console.error(error);return}e.target.reset();msg.textContent='';closeModal('reviewModal');toast('تم نشر رأيك، شكرًا لمشاركتك');load()};
  $('#orderForm').onsubmit=e=>{e.preventDefault();if(!selectedProduct||!settings.whatsapp)return toast('أضف رقم واتساب المتجر من الإعدادات أولًا',true);const phone=settings.whatsapp.replace(/[^0-9]/g,'');const text=`طلب جديد من زُهي%0Aالمنتج: ${encodeURIComponent(selectedProduct.name)}%0Aالاسم: ${encodeURIComponent($('#orderName').value.trim())}%0Aالجوال: ${encodeURIComponent($('#orderPhone').value.trim())}%0Aالعنوان: ${encodeURIComponent($('#orderAddress').value.trim())}`;window.open(`https://wa.me/${phone}?text=${text}`,'_blank','noopener,noreferrer');closeModal('orderModal');e.target.reset()};

  document.querySelectorAll('.country-tab').forEach(btn=>btn.onclick=()=>{
    document.querySelectorAll('.country-tab').forEach(b=>{b.classList.remove('active');b.setAttribute('aria-selected','false')});
    btn.classList.add('active');btn.setAttribute('aria-selected','true');
    currentCountry=btn.dataset.country;renderProducts();
  });

  const rt=$('#reviewsToggle'),rp=$('#reviewsPanel');
  rt.onclick=()=>{const open=rp.classList.toggle('open');rt.setAttribute('aria-expanded',open)};
  const ct=$('#contactToggle'),cp=$('#contactPanel');
  ct.onclick=()=>{const open=cp.classList.toggle('open');ct.setAttribute('aria-expanded',open)};

  $('#cfAttachBtn')?.addEventListener('click',()=>$('#cfAttachFile').click());
  $('#cfAttachFile')?.addEventListener('change',()=>{
    const f=$('#cfAttachFile').files[0],prev=$('#cfAttachPreview');if(!prev)return;
    if(!f){prev.classList.add('hidden');prev.innerHTML='';return}
    prev.classList.remove('hidden');
    prev.innerHTML=`<img src="${URL.createObjectURL(f)}" alt=""><span>${esc(f.name)}</span><button type="button" id="cfAttachRemove">إزالة</button>`;
    $('#cfAttachRemove').onclick=()=>{$('#cfAttachFile').value='';prev.classList.add('hidden');prev.innerHTML=''};
  });
  $('#contactForm').onsubmit=async e=>{
    e.preventDefault();
    if(!sb){$('#contactMsg').textContent='الموقع غير متصل بقاعدة البيانات بعد.';return}
    let attachment_url='';
    const file=$('#cfAttachFile').files[0];
    if(file){
      try{
        const ext=file.name.split('.').pop().toLowerCase(),path=`${crypto.randomUUID()}.${ext}`;
        const up=await sb.storage.from('message-attachments').upload(path,file,{upsert:false});
        if(!up.error)attachment_url=sb.storage.from('message-attachments').getPublicUrl(path).data.publicUrl;
      }catch(err){console.error(err)}
    }
    const row={name:$('#cfName').value.trim(),email:$('#cfEmail').value.trim(),message:$('#cfMessage').value.trim(),attachment_url};
    const {error}=await sb.from('messages').insert(row);
    if(error){$('#contactMsg').textContent='تعذر إرسال الرسالة، حاول مرة أخرى.';console.error(error)}
    else{$('#contactMsg').textContent='';e.target.reset();$('#cfAttachPreview')?.classList.add('hidden');if($('#cfAttachPreview'))$('#cfAttachPreview').innerHTML='';toast('تم إرسال رسالتك، هنرد عليك قريب 🌿')}
  };

  $('#merchantCtaBtn')?.addEventListener('click',()=>openModal('merchantModal'));
  $('#merchantForm')?.addEventListener('submit',async e=>{
    e.preventDefault();
    const msg=$('#merchantMsg');
    if(!settings.whatsapp){if(msg)msg.textContent='رقم واتساب المتجر غير مضاف من الإعدادات بعد.';return}
    const title=$('#mrTitle').value.trim(),details=$('#mrDetails').value.trim(),phone=$('#mrPhone').value.trim(),email=$('#mrEmail').value.trim(),pname=$('#mrProductName').value.trim(),price=$('#mrProductPrice').value.trim();
    let imageUrl='';
    const file=$('#mrProductImage').files[0];
    if(file&&sb){
      try{
        const ext=file.name.split('.').pop().toLowerCase(),path=`${crypto.randomUUID()}.${ext}`;
        const up=await sb.storage.from('merchant-images').upload(path,file,{upsert:false});
        if(!up.error)imageUrl=sb.storage.from('merchant-images').getPublicUrl(path).data.publicUrl;
      }catch(err){console.error(err)}
    }
    const lines=['طلب تاجر جديد مع زُهي',`العنوان: ${title}`,details?`محتويات القائمة: ${details}`:'',`الهاتف: ${phone}`,email?`البريد الإلكتروني: ${email}`:'',`اسم المنتج: ${pname}`,price?`سعر المنتج: ${price}`:'',imageUrl?`صورة المنتج: ${imageUrl}`:''].filter(Boolean);
    const text=encodeURIComponent(lines.join('\n')),waPhone=settings.whatsapp.replace(/[^0-9]/g,'');
    window.open(`https://wa.me/${waPhone}?text=${text}`,'_blank','noopener,noreferrer');
    closeModal('merchantModal');e.target.reset();
  });

  $('#footerContactLink')?.addEventListener('click',()=>{
    const panel=$('#contactPanel'),toggle=$('#contactToggle');
    if(panel&&!panel.classList.contains('open')){panel.classList.add('open');toggle?.setAttribute('aria-expanded','true')}
  });

  let devCreditTimer=null;
  $('#devCreditBtn')?.addEventListener('click',()=>{
    const el=$('#devCreditPopup');if(!el)return;
    clearTimeout(devCreditTimer);
    el.classList.remove('hidden');
    devCreditTimer=setTimeout(()=>el.classList.add('hidden'),2000);
  });

  setTimeout(()=>{
    const promo=$('#installPromo');if(!promo)return;
    const isStandaloneNow=matchMedia('(display-mode: standalone)').matches||navigator.standalone;
    if(isStandaloneNow||sessionStorage.getItem('zuhi_install_promo_shown'))return;
    sessionStorage.setItem('zuhi_install_promo_shown','1');
    promo.classList.remove('hidden');
    const hidePromo=()=>promo.classList.add('hidden');
    $('#installPromoClose')?.addEventListener('click',hidePromo);
    $('#installPromoInstall')?.addEventListener('click',()=>{hidePromo();$('#installApp')?.click()});
    $('#installPromoShare')?.addEventListener('click',()=>{hidePromo();openModal('shareModal')});
    setTimeout(hidePromo,9000);
  },2000);

  setTimeout(()=>{
    const promo=$('#referralPromo');if(!promo)return;
    if(sessionStorage.getItem('zuhi_referral_promo_shown'))return;
    sessionStorage.setItem('zuhi_referral_promo_shown','1');
    if(document.querySelectorAll('.modal:not(.hidden)').length)return;
    promo.classList.remove('hidden');
    const hidePromo=()=>promo.classList.add('hidden');
    $('#referralPromoClose')?.addEventListener('click',hidePromo);
    $('#referralPromoShare')?.addEventListener('click',()=>{hidePromo();openModal('shareModal')});
    setTimeout(hidePromo,10000);
  },13000);

  setTimeout(()=>{
    const promo=$('#dealsPromo');if(!promo)return;
    if(sessionStorage.getItem('zuhi_deals_promo_shown'))return;
    sessionStorage.setItem('zuhi_deals_promo_shown','1');
    if(document.querySelectorAll('.modal:not(.hidden)').length)return;
    promo.classList.remove('hidden');
    const hideDeals=()=>promo.classList.add('hidden');
    $('#dealsPromoClose')?.addEventListener('click',e=>{e.stopPropagation();hideDeals()});
    promo.addEventListener('click',e=>{
      if(e.target.closest('#dealsPromoClose'))return;
      hideDeals();
      document.getElementById('services')?.scrollIntoView({behavior:'smooth',block:'start'});
    });
    setTimeout(hideDeals,12000);
  },30000);
});
