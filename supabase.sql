-- زُهي (Zuhai) - Supabase schema (matches the LIVE project as deployed)
-- Safe to re-run: uses IF NOT EXISTS / DROP POLICY IF EXISTS guards.

create extension if not exists pgcrypto;

-- Tables
create table if not exists public.admin_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'admin' check (role in ('admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  icon text default '✦',
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text default '',
  price numeric(12,2) not null default 0,
  image_url text not null,
  affiliate_url text not null,
  category_id uuid references public.categories(id) on delete set null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text default '',
  icon text default '✦',
  link text default '#contact',
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Helper: is the current auth user an admin?
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.admin_profiles where user_id = auth.uid());
$$;

-- RLS
alter table public.admin_profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.services enable row level security;

drop policy if exists "admin read own profile" on public.admin_profiles;
create policy "admin read own profile" on public.admin_profiles for select using (user_id = auth.uid());

drop policy if exists "public read active categories" on public.categories;
create policy "public read active categories" on public.categories for select using (active = true or public.is_admin());
drop policy if exists "admin manage categories" on public.categories;
create policy "admin manage categories" on public.categories for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "public read active products" on public.products;
create policy "public read active products" on public.products for select using (active = true or public.is_admin());
drop policy if exists "admin manage products" on public.products;
create policy "admin manage products" on public.products for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "public read active services" on public.services;
create policy "public read active services" on public.services for select using (active = true or public.is_admin());
drop policy if exists "admin manage services" on public.services;
create policy "admin manage services" on public.services for all using (public.is_admin()) with check (public.is_admin());

-- Storage bucket for product images uploaded from the admin panel
insert into storage.buckets (id,name,public) values ('product-images','product-images',true) on conflict (id) do nothing;

drop policy if exists "public read product images" on storage.objects;
create policy "public read product images" on storage.objects for select using (bucket_id='product-images');
drop policy if exists "admin upload product images" on storage.objects;
create policy "admin upload product images" on storage.objects for insert with check (bucket_id='product-images' and public.is_admin());
drop policy if exists "admin update product images" on storage.objects;
create policy "admin update product images" on storage.objects for update using (bucket_id='product-images' and public.is_admin()) with check (bucket_id='product-images' and public.is_admin());
drop policy if exists "admin delete product images" on storage.objects;
create policy "admin delete product images" on storage.objects for delete using (bucket_id='product-images' and public.is_admin());

-- Starter categories (skipped automatically if a category with the same name exists)
insert into public.categories (name,icon,sort_order)
select v.name, v.icon, v.sort_order from (values
('رجال','👔',1),('نساء','👜',2),('أطفال','🧸',3),('إلكترونيات','📱',4),('طبي','🩺',5),('غذاء','🍽️',6),('أسلوب حياة','✨',7)
) as v(name,icon,sort_order) where not exists (select 1 from public.categories c where c.name=v.name);

-- ==========================================================
-- Additions: country field, testimonials, contact messages, site settings
-- ==========================================================

-- Which storefront (مصر / الإمارات / السعودية) a product belongs to
alter table public.products add column if not exists country text not null default 'السعودية'
  check (country in ('مصر','الإمارات','السعودية'));
alter table public.products add column if not exists direct_order boolean not null default false;

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  message text not null,
  rating smallint not null default 5 check (rating between 1 and 5),
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- Single-row site settings (id is always true)
create table if not exists public.site_settings (
  id boolean primary key default true check (id),
  site_name text not null default 'زُهي',
  site_tagline text not null default 'تجربة تسوق سعودية بروح عصرية',
  hero_image_url text default '',
  about_image_url text default '',
  logo_image_url text default '',
  whatsapp text default '',
  phone text default '',
  email text default '',
  address text default '',
  updated_at timestamptz not null default now()
);
alter table public.site_settings add column if not exists logo_image_url text default '';
alter table public.site_settings add column if not exists hero_eyebrow text default '';
alter table public.site_settings add column if not exists hero_title text default '';
alter table public.site_settings add column if not exists hero_accent text default '';
alter table public.site_settings add column if not exists hero_text text default '';
alter table public.site_settings add column if not exists hero_primary_label text default '';
alter table public.site_settings add column if not exists hero_secondary_label text default '';
alter table public.site_settings add column if not exists about_title text default '';
alter table public.site_settings add column if not exists about_text text default '';
insert into public.site_settings (id) values (true) on conflict (id) do nothing;

alter table public.testimonials enable row level security;
alter table public.messages enable row level security;
alter table public.site_settings enable row level security;

drop policy if exists "public read active testimonials" on public.testimonials;
create policy "public read active testimonials" on public.testimonials for select using (active = true or public.is_admin());
drop policy if exists "admin manage testimonials" on public.testimonials;
create policy "admin manage testimonials" on public.testimonials for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "anyone can submit testimonial" on public.testimonials;
create policy "anyone can submit testimonial" on public.testimonials for insert with check (active = true);

-- Anyone can send a contact message; only the admin can read/manage them
drop policy if exists "anyone can send a message" on public.messages;
create policy "anyone can send a message" on public.messages for insert with check (true);
drop policy if exists "admin read messages" on public.messages;
create policy "admin read messages" on public.messages for select using (public.is_admin());
drop policy if exists "admin manage messages" on public.messages;
create policy "admin manage messages" on public.messages for update using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin delete messages" on public.messages;
create policy "admin delete messages" on public.messages for delete using (public.is_admin());

drop policy if exists "public read settings" on public.site_settings;
create policy "public read settings" on public.site_settings for select using (true);
drop policy if exists "admin update settings" on public.site_settings;
create policy "admin update settings" on public.site_settings for update using (public.is_admin()) with check (public.is_admin());

-- Storage bucket for site-wide images (hero / about) uploaded from the admin panel
insert into storage.buckets (id,name,public) values ('site-images','site-images',true) on conflict (id) do nothing;

drop policy if exists "public read site images" on storage.objects;
create policy "public read site images" on storage.objects for select using (bucket_id='site-images');
drop policy if exists "admin upload site images" on storage.objects;
create policy "admin upload site images" on storage.objects for insert with check (bucket_id='site-images' and public.is_admin());
drop policy if exists "admin update site images" on storage.objects;
create policy "admin update site images" on storage.objects for update using (bucket_id='site-images' and public.is_admin()) with check (bucket_id='site-images' and public.is_admin());
drop policy if exists "admin delete site images" on storage.objects;
create policy "admin delete site images" on storage.objects for delete using (bucket_id='site-images' and public.is_admin());

-- Starter marketplace links, editable later from the Services tab in the admin panel.
insert into public.services (name,description,icon,link,sort_order)
select v.name,v.description,v.icon,v.link,v.sort_order from (values
('نون','تصفح عروض ومنتجات نون المختارة من زُهي.','🟡','https://www.noon.com/',1),
('Amazon','اكتشف المنتجات المتاحة عبر Amazon من خلال رابط مباشر.','🛒','https://www.amazon.com/',2),
('متاجر السعودية','روابط مختارة لمتاجر ومنتجات داخل المملكة.','🇸🇦','#products',3)
) as v(name,description,icon,link,sort_order)
where not exists (select 1 from public.services s where s.name=v.name);

-- To make yourself an admin after creating a user in Authentication → Users:
-- insert into public.admin_profiles(user_id) values ('PASTE_AUTH_USER_UUID_HERE');

-- Starter reviews: insert once, without duplicating existing names.
insert into public.testimonials (name,message,rating,sort_order)
select v.name,v.message,v.rating,v.sort_order from (values
('أحمد خالد','تجربة مرتبة والمنتج وصلني من المتجر الأصلي بسرعة.',5,1),('سارة محمد','التصفح بسيط والصور واضحة والأسعار ظاهرة.',5,2),('محمد العتيبي','أعجبني تنوع المنتجات بين الدول العربية.',4,3),('نورة عبدالله','الموقع سريع والشراء يتم بسهولة.',5,4),('ريم حسن','خدمة ممتازة وتجربة استخدام مريحة.',5,5),('عبدالعزيز سالم','وجدت المنتج الذي أبحث عنه في دقائق.',4,6),('جنى محمود','التصميم أنيق والروابط تعمل بشكل جيد.',5,7),('خالد يوسف','اختيارات جميلة وأسعار مناسبة.',4,8),('ليان سعد','أحببت تقسيم المنتجات حسب الدولة.',5,9),('يوسف إبراهيم','التجربة واضحة من أول زيارة.',5,10),('هند علي','موقع عملي ومفيد جدًا للتسوق.',4,11),('عمر فهد','وصلت للرابط الأصلي بدون خطوات معقدة.',5,12),('ملك سامي','المنتجات المعروضة متنوعة ومميزة.',5,13),('مازن طارق','واجهة نظيفة وسهلة على الهاتف.',4,14),('دعاء أحمد','التفاصيل والوصف ساعدوني في الاختيار.',5,15),('فيصل ناصر','تجربة ممتازة وأتمنى إضافة عروض أكثر.',4,16),('مريم أشرف','أحببت الهوية السعودية والألوان.',5,17),('رامي حسن','الموقع منظم والبحث مفيد.',5,18),('شهد وليد','خدمة رائعة وتجربة شراء مباشرة.',4,19),('تركي منصور','المنتجات تظهر بشكل مرتب وواضح.',5,20),('إسراء عادل','من أفضل واجهات المتاجر التي جربتها.',5,21),('بدر القحطاني','التنقل بين الأقسام سريع.',4,22),('نورهان سمير','أعجبني وجود أسواق مصر والإمارات والسعودية.',5,23),('سلمان راشد','تجربة مريحة والتصميم احترافي.',5,24),('فرح محمود','وجدت خيارات مناسبة لعائلتي.',4,25),('راكان مشعل','الزر ينقلني للرابط المطلوب مباشرة.',5,26),('بسمة خالد','التفاصيل واضحة والصفحة لا تتعب العين.',5,27),('حاتم أمين','موقع جميل ويستحق التجربة.',4,28),('رؤى ماجد','التجربة على الجوال ممتازة.',5,29),('ياسر عادل','أحببت سهولة الوصول للخدمات.',5,30),('لمى نواف','ألوان الموقع مريحة ومميزة.',4,31),('أيمن طه','تحديث المنتجات ظاهر بشكل واضح.',5,32),('غادة سمير','موقع موثوق وتجربة لطيفة.',5,33),('مشعل فواز','التصنيفات تساعد على الوصول بسرعة.',4,34),('رنا فؤاد','الصور والوصف أعطوني ثقة في الاختيار.',5,35),('علي منصور','أعجبني الاهتمام بالتفاصيل.',5,36),('سلمى يحيى','واجهة عربية جميلة وسهلة.',4,37),('نايف حمد','تجربة الشراء مباشرة ومريحة.',5,38),('أروى سعيد','المتجر مرتب ويحتوي خيارات كثيرة.',5,39),('حسام نبيل','التصميم سريع ولا توجد خطوات زائدة.',4,40),('مي عبدالله','أحببت قسم الخدمات وطريقة عرضه.',5,41),('سيف أحمد','الموقع عملي جدًا على الكمبيوتر والهاتف.',5,42),('نجلاء كمال','التجربة سلسة والمنتجات واضحة.',4,43),('فهد سالم','وصلت للمعلومة التي أحتاجها بسرعة.',5,44),('كريم محمود','ألوان وهوية زُهي مميزة.',5,45),('سارة فهد','موقع أنيق ومناسب للتسوق اليومي.',4,46),('وليد حسن','التصفح ممتع والبطاقات مرتبة.',5,47),('تهاني علي','أعجبني تنوع الدول والأقسام.',5,48),('صالح ياسر','واجهة بسيطة بدون زحام.',4,49),('إيمان خالد','تجربة ممتازة وسأعود للموقع.',5,50),('باسم عوض','المنتجات المعروضة مختارة بعناية.',5,51),('جود محمد','الشراء من الرابط الأصلي فكرة ممتازة.',4,52),('عبدالله فؤاد','الموقع سريع وواضح.',5,53),('رغد سعد','استفدت من البحث والتصفية.',5,54),('أنس وليد','تجربة مرتبة واحترافية.',4,55),('حور أحمد','الموقع جميل ومناسب للجوال.',5,56),('سمية ناصر','أحببت سهولة فتح وصف المنتج.',5,57),('مروان عادل','كل شيء واضح ومنظم.',4,58),('بسنت طارق','تجربة لطيفة وخيارات متعددة.',5,59),('زياد سامي','زُهي متجر واعد وتجربته ممتازة.',5,60)
) as v(name,message,rating,sort_order)
where not exists (select 1 from public.testimonials t where t.name=v.name);

do $$ begin
  alter publication supabase_realtime add table public.products;
  alter publication supabase_realtime add table public.categories;
  alter publication supabase_realtime add table public.services;
  alter publication supabase_realtime add table public.testimonials;
  alter publication supabase_realtime add table public.site_settings;
exception when duplicate_object then null;
end $$;
