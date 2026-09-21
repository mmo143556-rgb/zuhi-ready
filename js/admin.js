const C=window.ZUHI_CONFIG||{};const sb=window.supabase?.createClient(C.SUPABASE_URL||'',C.SUPABASE_ANON_KEY||'');document.querySelectorAll('.logo-img').forEach(image=>image.src='../assets/brand-board.png');
const LOCAL_MODE=C.LOCAL_ADMIN_MODE===true,LOCAL_PASSWORD=C.LOCAL_ADMIN_PASSWORD||'123456',LOCAL_REVIEWS_KEY='zuhi_local_reviews',LOCAL_SETTINGS_KEY='zuhi_local_settings';
let cats=[],prods=[],svcs=[],revs=[],msgs=[],settings={};
const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>'"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[m]));
function toast(m,err){const e=document.createElement('div');e.className='toast'+(err?' error':'');e.textContent=m;$('#toast-container').append(e);setTimeout(()=>e.remove(),2800)}
function localRead(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}}
function localWrite(key,value){localStorage.setItem(key,JSON.stringify(value))}
function buildSeedReviews(){const names=['أحمد خالد','سارة محمد','محمد العتيبي','نورة عبدالله','ريم حسن','عبدالعزيز سالم','جنى محمود','خالد يوسف','ليان سعد','يوسف إبراهيم','هند علي','عمر فهد','ملك سامي','مازن طارق','دعاء أحمد','فيصل ناصر','مريم أشرف','رامي حسن','شهد وليد','تركي منصور'];const messages=['التجربة مرتبة وواضحة والاختيار كان سريعًا.','أعجبني التصميم وسهولة الوصول للمنتج المناسب.','الموقع خفيف على الجوال والتفاصيل مفيدة جدًا.'];return names.flatMap((name,i)=>messages.map((message,j)=>({id:`local-review-${i}-${j}`,name:`${name}${j?' '+(j+1):''}`,message,rating:j===1?4:5,active:true,sort_order:i*3+j+1}))) }

async function boot(){if(LOCAL_MODE){showLogin();return}if(!sb)return $('#loginMsg').textContent='أضف config.js أولاً';const {data:{session}}=await sb.auth.getSession();if(session)showDash(session);sb.auth.onAuthStateChange((_e,s)=>s?showDash(s):showLogin())}
function showLogin(){$('#loginBox').classList.remove('hidden');$('#dashboard').classList.add('hidden');$('#logoutBtn').classList.add('hidden')}
async function showDash(session){if(LOCAL_MODE||session?.local){$('#loginBox').classList.add('hidden');$('#dashboard').classList.remove('hidden');$('#logoutBtn').classList.remove('hidden');await loadAll();return}const user=session?.user|| (await sb.auth.getUser()).data.user;if(!user)return showLogin();const {data:admin,error}=await sb.from('admin_profiles').select('user_id').eq('user_id',user.id).maybeSingle();if(error||!admin){showLogin();$('#loginMsg').textContent=error?'تعذر الاتصال بمشروع Supabase الحالي. راجع config.js.':'تم تسجيل الدخول، لكن هذا البريد غير مضاف كأدمن في المشروع الحالي.';return}$('#loginBox').classList.add('hidden');$('#dashboard').classList.remove('hidden');$('#logoutBtn').classList.remove('hidden');await loadAll()}

async function loadAll(){
  if(LOCAL_MODE){
    const [c,p,s,m,st]=await Promise.all([sb?.from('categories').select('*').order('sort_order'),sb?.from('products').select('*').order('created_at',{ascending:false}),sb?.from('services').select('*').order('sort_order'),sb?.from('messages').select('*').order('created_at',{ascending:false}),sb?.from('site_settings').select('*').eq('id',true).maybeSingle()]);
    cats=c?.data||[];prods=p?.data||[];svcs=s?.data||[];msgs=m?.data||[];settings=localRead(LOCAL_SETTINGS_KEY,st?.data||{});revs=localRead(LOCAL_REVIEWS_KEY,buildSeedReviews());$('#pCategory').innerHTML=cats.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join('');fillSettingsForm();renderLists();return;
  }
  const [c,p,s,r,m,st]=await Promise.all([
    sb.from('categories').select('*').order('sort_order'),
    sb.from('products').select('*').order('created_at',{ascending:false}),
    sb.from('services').select('*').order('sort_order'),
    sb.from('testimonials').select('*').order('sort_order'),
    sb.from('messages').select('*').order('created_at',{ascending:false}),
    sb.from('site_settings').select('*').eq('id',true).maybeSingle()
  ]);
  if(c.error||p.error||s.error||m.error){toast('خطأ في تحميل البيانات الأساسية',true);console.error(c.error||p.error||s.error||m.error);return}
  if(r.error)console.warn('جدول testimonials غير جاهز، شغّل supabase.sql لإنشاء آراء العملاء.',r.error);
  cats=c.data||[];prods=p.data||[];svcs=s.data||[];revs=r.data||[];msgs=m.data||[];settings=st.data||{};
  $('#pCategory').innerHTML=cats.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join('');
  fillSettingsForm();
  renderLists();
}

function fillSettingsForm(){
  $('#siteName').value=settings.site_name||'';
  $('#siteTagline').value=settings.site_tagline||'';
  $('#heroEyebrow').value=settings.hero_eyebrow||'';
  $('#heroTitle').value=settings.hero_title||'';
  $('#heroAccent').value=settings.hero_accent||'';
  $('#heroText').value=settings.hero_text||'';
  $('#heroPrimaryLabel').value=settings.hero_primary_label||'';
  $('#heroSecondaryLabel').value=settings.hero_secondary_label||'';
  $('#aboutTitle').value=settings.about_title||'';
  $('#aboutText').value=settings.about_text||'';
  $('#whatsapp').value=settings.whatsapp||'';
  $('#phone').value=settings.phone||'';
  $('#contactEmail').value=settings.email||'';
  $('#address').value=settings.address||'';
  $('#heroImageUrl').value=settings.hero_image_url||'';
  $('#aboutImageUrl').value=settings.about_image_url||'';
  $('#logoImageUrl').value=settings.logo_image_url||'';
  const adminLogo=document.querySelector('.admin-head .logo-img');if(adminLogo)adminLogo.src=settings.logo_image_url||settings.about_image_url||adminLogo.src;
}

function renderLists(){
  $('#productsList').innerHTML=prods.map(p=>`<div class="admin-row"><img src="${esc(p.image_url||'')}" alt=""><div><b>${esc(p.name)}</b><small> — ${esc(p.country||'')} — ${p.active?'ظاهر':'مخفي'}</small></div><div class="admin-row-actions"><button class="edit-btn" onclick="editP('${p.id}')">تعديل</button><button class="delete-btn" onclick="delP('${p.id}')">حذف</button></div></div>`).join('');
  $('#categoriesList').innerHTML=cats.map(c=>`<div class="admin-row"><div class="service-icon">${esc(c.icon||'✦')}</div><div><b>${esc(c.name)}</b></div><div class="admin-row-actions"><button class="edit-btn" onclick="editC('${c.id}')">تعديل</button><button class="delete-btn" onclick="delC('${c.id}')">حذف</button></div></div>`).join('');
  $('#servicesList').innerHTML=svcs.map(s=>`<div class="admin-row"><div class="service-icon">${esc(s.icon||'✦')}</div><div><b>${esc(s.name)}</b><small> — ${esc(s.description||'')}</small></div><div class="admin-row-actions"><button class="edit-btn" onclick="editS('${s.id}')">تعديل</button><button class="delete-btn" onclick="delS('${s.id}')">حذف</button></div></div>`).join('');
  $('#reviewsList').innerHTML=revs.map(r=>`<div class="admin-row"><div class="service-icon">${'★'.repeat(r.rating)}</div><div><b>${esc(r.name)}</b><small> — ${esc(r.message).slice(0,60)}${r.active?'':' (مخفي)'}</small></div><div class="admin-row-actions"><button class="edit-btn" onclick="editR('${r.id}')">تعديل</button><button class="delete-btn" onclick="delR('${r.id}')">حذف</button></div></div>`).join('');
  const unread=msgs.filter(m=>!m.is_read).length;
  $('#unreadBadge').classList.toggle('hidden',unread===0);$('#unreadBadge').textContent=unread;
  $('#messagesList').innerHTML=msgs.map(m=>`<div class="admin-row message-row ${m.is_read?'':'unread'}"><div class="service-icon">✉️</div><div><b>${esc(m.name)}</b> <small>${esc(m.email)}</small><p class="msg-body">${esc(m.message)}</p><small>${new Date(m.created_at).toLocaleString('ar-EG')}</small></div><div class="admin-row-actions">${m.is_read?'':`<button class="edit-btn" onclick="markRead('${m.id}')">قراءة</button>`}<button class="delete-btn" onclick="delMsg('${m.id}')">حذف</button></div></div>`).join('')||'<p class="empty">لا توجد رسائل بعد.</p>';
}

async function uploadTo(bucket,file){if(!file)return null;const ext=file.name.split('.').pop().toLowerCase();const path=`${crypto.randomUUID()}.${ext}`;const {error}=await sb.storage.from(bucket).upload(path,file,{upsert:false});if(error){toast(error.message,true);return null}return sb.storage.from(bucket).getPublicUrl(path).data.publicUrl}
const uploadImage=file=>uploadTo('product-images',file);

// products
function editP(id){const p=prods.find(x=>x.id===id);$('#productId').value=p.id;$('#pName').value=p.name;$('#pCategory').value=p.category_id;$('#pCountry').value=p.country||'السعودية';$('#pImage').value=p.image_url||'';$('#pAffiliate').value=p.affiliate_url;$('#pDescription').value=p.description||'';$('#pActive').checked=p.active;$('#pDirectOrder').checked=Boolean(p.direct_order)}
async function delP(id){if(!confirm('حذف المنتج؟'))return;const {error}=await sb.from('products').delete().eq('id',id);if(error)toast(error.message,true);else{toast('تم الحذف');loadAll()}}

// categories
function editC(id){const c=cats.find(x=>x.id===id);$('#categoryId').value=c.id;$('#cName').value=c.name;$('#cIcon').value=c.icon||''}
async function delC(id){if(!confirm('حذف القسم؟'))return;const {error}=await sb.from('categories').delete().eq('id',id);if(error)toast(error.message,true);else loadAll()}

// services
function editS(id){const s=svcs.find(x=>x.id===id);$('#serviceId').value=s.id;$('#sName').value=s.name;$('#sIcon').value=s.icon||'';$('#sLink').value=s.link||'';$('#sDescription').value=s.description||''}
async function delS(id){if(!confirm('حذف الخدمة؟'))return;const {error}=await sb.from('services').delete().eq('id',id);if(error)toast(error.message,true);else loadAll()}

// reviews / testimonials
function editR(id){const r=revs.find(x=>x.id===id);$('#reviewId').value=r.id;$('#rName').value=r.name;$('#rRating').value=r.rating;$('#rMessage').value=r.message;$('#rActive').checked=r.active}
async function delR(id){if(!confirm('حذف التقييم؟'))return;if(LOCAL_MODE){revs=revs.filter(r=>r.id!==id);localWrite(LOCAL_REVIEWS_KEY,revs);renderLists();return}const {error}=await sb.from('testimonials').delete().eq('id',id);if(error)toast(error.message,true);else loadAll()}

// messages
async function markRead(id){const {error}=await sb.from('messages').update({is_read:true}).eq('id',id);if(error)toast(error.message,true);else loadAll()}
async function delMsg(id){if(!confirm('حذف الرسالة؟'))return;const {error}=await sb.from('messages').delete().eq('id',id);if(error)toast(error.message,true);else loadAll()}

$('#loginForm').onsubmit=async e=>{e.preventDefault();if(LOCAL_MODE){if($('#password').value!==LOCAL_PASSWORD){$('#loginMsg').textContent='رمز الدخول غير صحيح';return}localStorage.setItem('zuhi_local_admin','1');showDash({local:true});return}const {error}=await sb.auth.signInWithPassword({email:$('#email').value,password:$('#password').value});$('#loginMsg').textContent=error?error.message:''};
$('#resetPassword').onclick=async()=>{const email=$('#email').value.trim();if(!email)return $('#loginMsg').textContent='اكتب البريد الإلكتروني أولًا';const options=location.protocol==='http:'||location.protocol==='https:'?{redirectTo:location.href}:undefined;const {error}=options?await sb.auth.resetPasswordForEmail(email,options):await sb.auth.resetPasswordForEmail(email);$('#loginMsg').textContent=error?(error.message.includes('rate limit')?'تم تجاوز حد رسائل البريد. انتظر قليلًا ثم أعد المحاولة أو غيّر كلمة السر من Supabase Dashboard.':error.message):'تم إرسال رابط تغيير كلمة السر إلى بريدك.'};
$('#logoutBtn').onclick=()=>{if(LOCAL_MODE){localStorage.removeItem('zuhi_local_admin');showLogin()}else sb.auth.signOut()};

$('#productForm').onsubmit=async e=>{e.preventDefault();const id=$('#productId').value;let image=$('#pImage').value.trim();const file=$('#pFile').files[0];if(file)image=await uploadImage(file);if(!image)return toast('أضف صورة أو رابط صورة',true);const direct=$('#pDirectOrder').checked,affiliate=$('#pAffiliate').value.trim();if(!direct&&!affiliate)return toast('أضف رابط الشراء أو فعّل الطلب عبر واتساب',true);const row={name:$('#pName').value.trim(),category_id:$('#pCategory').value,country:$('#pCountry').value,image_url:image,affiliate_url:affiliate,description:$('#pDescription').value.trim(),active:$('#pActive').checked,direct_order:direct};let r=id?await sb.from('products').update(row).eq('id',id):await sb.from('products').insert(row);if(r.error)toast(r.error.message,true);else{toast('تم حفظ المنتج');e.target.reset();$('#productId').value='';$('#pActive').checked=true;$('#pDirectOrder').checked=false;loadAll()}};
$('#resetProduct').onclick=()=>{$('#productForm').reset();$('#productId').value='';$('#pActive').checked=true;$('#pDirectOrder').checked=false};

$('#categoryForm').onsubmit=async e=>{e.preventDefault();const id=$('#categoryId').value,row={name:$('#cName').value,icon:$('#cIcon').value||'✦'};const r=id?await sb.from('categories').update(row).eq('id',id):await sb.from('categories').insert(row);if(r.error)toast(r.error.message,true);else{toast('تم حفظ القسم');e.target.reset();$('#categoryId').value='';loadAll()}};

$('#serviceForm').onsubmit=async e=>{e.preventDefault();const id=$('#serviceId').value,row={name:$('#sName').value,icon:$('#sIcon').value||'✦',link:$('#sLink').value||'#contact',description:$('#sDescription').value};const r=id?await sb.from('services').update(row).eq('id',id):await sb.from('services').insert(row);if(r.error)toast(r.error.message,true);else{toast('تم حفظ الخدمة');e.target.reset();$('#serviceId').value='';loadAll()}};

$('#reviewForm').onsubmit=async e=>{e.preventDefault();const id=$('#reviewId').value,row={id:id||`local-review-${Date.now()}`,name:$('#rName').value,rating:Number($('#rRating').value),message:$('#rMessage').value,active:$('#rActive').checked};if(LOCAL_MODE){revs=id?revs.map(r=>r.id===id?row:r):[...revs,row];localWrite(LOCAL_REVIEWS_KEY,revs);toast('تم حفظ التقييم محليًا');e.target.reset();$('#reviewId').value='';$('#rActive').checked=true;renderLists();return}const r=id?await sb.from('testimonials').update(row).eq('id',id):await sb.from('testimonials').insert(row);if(r.error)toast(r.error.message,true);else{toast('تم حفظ التقييم');e.target.reset();$('#reviewId').value='';$('#rActive').checked=true;loadAll()}};
$('#resetReview').onclick=()=>{$('#reviewForm').reset();$('#reviewId').value='';$('#rActive').checked=true};
$('#seedReviews').onclick=()=>{if(!confirm('إضافة 60 رأيًا جاهزًا؟'))return;revs=buildSeedReviews();localWrite(LOCAL_REVIEWS_KEY,revs);renderLists();toast('تمت إضافة 60 رأيًا محليًا')};

$('#settingsForm').onsubmit=async e=>{
  e.preventDefault();
  let heroUrl=$('#heroImageUrl').value.trim(),aboutUrl=$('#aboutImageUrl').value.trim(),logoUrl=$('#logoImageUrl').value.trim();
  const heroFile=$('#heroFile').files[0],aboutFile=$('#aboutFile').files[0],logoFile=$('#logoFile').files[0];
  if(heroFile){const u=await uploadTo('site-images',heroFile);if(u)heroUrl=u}
  if(aboutFile){const u=await uploadTo('site-images',aboutFile);if(u)aboutUrl=u}
  if(logoFile){const u=await uploadTo('site-images',logoFile);if(u)logoUrl=u}
  const row={id:true,site_name:$('#siteName').value.trim(),site_tagline:$('#siteTagline').value.trim(),hero_eyebrow:$('#heroEyebrow').value.trim(),hero_title:$('#heroTitle').value.trim(),hero_accent:$('#heroAccent').value.trim(),hero_text:$('#heroText').value.trim(),hero_primary_label:$('#heroPrimaryLabel').value.trim(),hero_secondary_label:$('#heroSecondaryLabel').value.trim(),about_title:$('#aboutTitle').value.trim(),about_text:$('#aboutText').value.trim(),whatsapp:$('#whatsapp').value.trim(),phone:$('#phone').value.trim(),email:$('#contactEmail').value.trim(),address:$('#address').value.trim(),hero_image_url:heroUrl,about_image_url:aboutUrl,logo_image_url:logoUrl||aboutUrl,updated_at:new Date().toISOString()};
  if(LOCAL_MODE){localWrite(LOCAL_SETTINGS_KEY,row);settings=row;toast('تم حفظ الإعدادات محليًا');return}
  const {error}=await sb.from('site_settings').upsert(row);
  if(error)toast(error.message,true);else{toast('تم حفظ الإعدادات');loadAll()}
};

document.querySelectorAll('.tab').forEach(t=>t.onclick=()=>{document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));t.classList.add('active');document.querySelectorAll('.tab-content').forEach(x=>x.classList.add('hidden'));$('#'+t.dataset.tab).classList.remove('hidden')});

boot();
