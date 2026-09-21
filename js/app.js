const C=window.ZUHI_CONFIG||{};const sb=window.supabase?.createClient(C.SUPABASE_URL||'',C.SUPABASE_ANON_KEY||'');
let categories=[],products=[],services=[],reviews=[],settings={},currentCountry='all',selectedProduct=null,installPrompt=null,manifestUrl=null;
const $=s=>document.querySelector(s), esc=s=>String(s??'').replace(/[&<>'"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[m]));
function toast(m,err){const e=document.createElement('div');e.className='toast'+(err?' error':'');e.textContent=m;$('#toast-container').append(e);setTimeout(()=>e.remove(),2800)}
const stars=n=>'★★★★★☆☆☆☆☆'.slice(5-n,10-n);
function localReviews(){try{const saved=JSON.parse(localStorage.getItem('zuhi_local_reviews'));if(Array.isArray(saved)&&saved.length)return saved}catch{}const names=['أحمد خالد','سارة محمد','محمد العتيبي','نورة عبدالله','ريم حسن','عبدالعزيز سالم','جنى محمود','خالد يوسف','ليان سعد','يوسف إبراهيم','هند علي','عمر فهد','ملك سامي','مازن طارق','دعاء أحمد','فيصل ناصر','مريم أشرف','رامي حسن','شهد وليد','تركي منصور'];const messages=['التجربة مرتبة وواضحة والاختيار كان سريعًا.','أعجبني التصميم وسهولة الوصول للمنتج المناسب.','الموقع خفيف على الجوال والتفاصيل مفيدة جدًا.'];return names.flatMap((name,i)=>messages.map((message,j)=>({id:`local-review-${i}-${j}`,name:`${name}${j?' '+(j+1):''}`,message,rating:j===1?4:5,active:true,sort_order:i*3+j+1})))}

async function load(){
  if(!sb)return toast('أضف config.js أولاً',true);
  const [c,p,s,r,st]=await Promise.all([
    sb.from('categories').select('*').eq('active',true).order('sort_order'),
    sb.from('products').select('*').eq('active',true).order('created_at',{ascending:false}),
    sb.from('services').select('*').eq('active',true).order('sort_order'),
    C.LOCAL_ADMIN_MODE?Promise.resolve({data:[]}):sb.from('testimonials').select('*').eq('active',true).order('sort_order'),
    sb.from('site_settings').select('*').eq('id',true).maybeSingle()
  ]);
  if(c.error||p.error||s.error){console.error(c.error||p.error||s.error);toast('تعذر تحميل البيانات. تأكد من إعداد Supabase.',true);return}
  categories=c.data||[];products=p.data||[];services=s.data||[];reviews=C.LOCAL_ADMIN_MODE?localReviews():(r.data||[]);settings=C.LOCAL_ADMIN_MODE?(()=>{try{return JSON.parse(localStorage.getItem('zuhi_local_settings'))||st.data||{}}catch{return st.data||{}}})():(st.data||{});
  applySettings();render()
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
  if(settings.whatsapp)info.push(`<a href="https://wa.me/${esc(settings.whatsapp.replace(/[^0-9]/g,''))}" target="_blank" rel="noopener">🟢 واتساب</a>`);
  if(settings.email)info.push(`<a href="mailto:${esc(settings.email)}">✉️ ${esc(settings.email)}</a>`);
  if(settings.address)info.push(`<span>📍 ${esc(settings.address)}</span>`);
  $('#contactInfo').innerHTML=info.join('');
}

function subscribeRealtime(){if(!sb)return;let channel=sb.channel('zuhi-live').on('postgres_changes',{event:'*',schema:'public',table:'products'},load).on('postgres_changes',{event:'*',schema:'public',table:'categories'},load).on('postgres_changes',{event:'*',schema:'public',table:'services'},load).on('postgres_changes',{event:'*',schema:'public',table:'site_settings'},load);if(!C.LOCAL_ADMIN_MODE)channel=channel.on('postgres_changes',{event:'*',schema:'public',table:'testimonials'},load);channel.subscribe()}

function startWave(){const canvas=$('#waveCanvas'),context=canvas?.getContext('2d');if(!canvas||!context)return;let width=0,height=0,frame=0;const resize=()=>{width=canvas.width=innerWidth*devicePixelRatio;height=canvas.height=innerHeight*devicePixelRatio;canvas.style.width=`${innerWidth}px`;canvas.style.height=`${innerHeight}px`;context.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0)};const draw=()=>{const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;context.clearRect(0,0,innerWidth,innerHeight);for(let line=0;line<2;line++){context.beginPath();for(let x=-20;x<=innerWidth+20;x+=12){const y=innerHeight*(.32+line*.16)+Math.sin(x*.008+frame*(line?-.008:.01))*22+Math.sin(x*.018+frame*.004)*8; x===-20?context.moveTo(x,y):context.lineTo(x,y)}context.strokeStyle=line?'rgba(168,255,62,.16)':'rgba(168,255,62,.23)';context.lineWidth=1.5;context.shadowColor='#a8ff3e';context.shadowBlur=5;context.stroke()}context.shadowBlur=0;if(!reduced){frame++;requestAnimationFrame(draw)}};addEventListener('resize',resize);resize();draw()}

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
  $('#reviewsGrid').innerHTML=reviews.map((r,i)=>`<div class="review-card" id="rv${i}"><button class="review-summary" onclick="toggleReview(${i})"><div><strong>${esc(r.name)}</strong><span class="review-stars">${stars(r.rating)}</span></div><span class="review-arrow">‹</span></button><p class="review-text">${esc(r.message)}</p></div>`).join('');
}
function toggleReview(i){$('#rv'+i).classList.toggle('open')}

function renderProducts(){
  const q=($('#searchInput')?.value||'').toLowerCase(),f=$('#categoryFilter').value;
  const list=products.filter(p=>(f==='all'||p.category_id===f)&&(currentCountry==='all'||p.country===currentCountry)&&(!q||(`${p.name} ${p.description||''}`).toLowerCase().includes(q)));
  $('#emptyProducts').classList.toggle('hidden',list.length>0);
  $('#productGrid').innerHTML=list.map(p=>`<article class="product-card reveal"><div class="product-img"><img src="${esc(p.image_url||'')}" alt="${esc(p.name)}" loading="lazy"><span class="badge">${esc(countryFlag(p.country))} ${esc(categories.find(c=>c.id===p.category_id)?.name||'منتج')}</span></div><div class="product-body"><h3>${esc(p.name)}</h3><button class="description-toggle" onclick="showDetails('${p.id}')">الوصف والتفاصيل <span>⌄</span></button>${Number(p.price||0)>0?`<div class="price">${Number(p.price).toLocaleString('ar-SA')} ر.س</div>`:''}<div class="product-actions"><button class="btn primary full" onclick="buy('${p.id}')">شراء الآن ↗</button></div></div></article>`).join('');
  observe();
}
function countryFlag(c){return c==='مصر'?'🇪🇬':c==='الإمارات'?'🇦🇪':'🇸🇦'}
function filterCat(id){$('#categoryFilter').value=id;renderProducts()}
function buy(id){const p=products.find(x=>x.id===id);if(!p)return;selectedProduct=p;if(p.affiliate_url){window.open(p.affiliate_url,'_blank','noopener,noreferrer')}else if(p.direct_order){$('#orderTitle').textContent=`طلب ${p.name}`;openModal('orderModal')}else toast('رابط الشراء غير متاح لهذا المنتج',true)}
function showDetails(id){const p=products.find(x=>x.id===id);if(!p)return;selectedProduct=p;$('#detailImage').src=p.image_url||'assets/brand-board.png';$('#detailImage').alt=p.name;$('#detailTitle').textContent=p.name;$('#detailCountry').textContent=`${countryFlag(p.country)} ${p.country||''}`;$('#detailDescription').textContent=p.description||'لا يوجد وصف لهذا المنتج.';$('#detailPrice').textContent=Number(p.price||0)>0?`${Number(p.price).toLocaleString('ar-SA')} ر.س`:'';openModal('productDetailModal')}
function openModal(id){const e=$('#'+id);e.classList.remove('hidden');e.setAttribute('aria-hidden','false')}
function closeModal(id){const e=$('#'+id);e.classList.add('hidden');e.setAttribute('aria-hidden','true')}
function registerShare(name,phone){localStorage.setItem('zuhi_share_user',JSON.stringify({name,phone}));const count=Number(localStorage.getItem('zuhi_share_count')||0)+1;localStorage.setItem('zuhi_share_count',count);return count}
function observe(){document.querySelectorAll('.reveal:not(.observed)').forEach(e=>{e.classList.add('observed');new IntersectionObserver(es=>es.forEach(x=>x.isIntersecting&&x.target.classList.add('visible')),{threshold:.1}).observe(e)})}

document.addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('.logo-img').forEach(image=>image.src='assets/brand-board.png');
  startWave();
  load();
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
  document.querySelectorAll('[data-close-share]').forEach(e=>e.onclick=()=>closeModal('shareModal'));
  const shareData=()=>({title:document.title,text:'اكتشف زُهي',url:location.href.split('#')[0]});
  $('#shareBtn').onclick=()=>openModal('shareModal');
  $('#nativeShareAction').onclick=async()=>{try{if(navigator.share)await navigator.share(shareData());else{await navigator.clipboard.writeText(shareData().url);toast('تم نسخ رابط زُهي للمشاركة')}closeModal('shareModal')}catch(error){if(error.name!=='AbortError')toast('تعذر تجهيز رابط المشاركة',true)}};
  $('#copyShareAction').onclick=async()=>{try{await navigator.clipboard.writeText(shareData().url);toast('تم نسخ رابط زُهي');closeModal('shareModal')}catch(error){toast('تعذر نسخ الرابط، انسخه من شريط العنوان',true)}};
  $('#detailBuy').onclick=()=>{closeModal('productDetailModal');if(selectedProduct)buy(selectedProduct.id)};
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

  $('#contactForm').onsubmit=async e=>{
    e.preventDefault();
    const row={name:$('#cfName').value.trim(),email:$('#cfEmail').value.trim(),message:$('#cfMessage').value.trim()};
    if(!sb){$('#contactMsg').textContent='الموقع غير متصل بقاعدة البيانات بعد.';return}
    const {error}=await sb.from('messages').insert(row);
    if(error){$('#contactMsg').textContent='تعذر إرسال الرسالة، حاول مرة أخرى.';console.error(error)}
    else{$('#contactMsg').textContent='';e.target.reset();toast('تم إرسال رسالتك، هنرد عليك قريب 🌿')}
  };
});
