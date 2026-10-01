let posts=[];
try{
  const storedPosts=localStorage.getItem('receta_posts');
  posts=storedPosts?JSON.parse(storedPosts):[];
}catch(error){
  console.warn('No se pudieron leer las recetas guardadas.',error);
}
if(!Array.isArray(posts)||!posts.length)posts=[
{id:1,type:'Comedor Comunitario',author:'Comedor San José (CDMX)',title:'Sopa de Verduras de Temporada',desc:'Ingredientes: Calabacita, zanahoria, jitomate y papa.\\nPasos: 1. Lavar ingredientes. 2. Picar en dados pequeños. 3. Hervir durante 20 minutos con una pizca de sal.',image:'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80',favorite:false,illustrated:false,illustrationRequested:false},
{id:2,type:'Ilustrador Voluntario',author:'Ana Gómez (Ilustradora)',title:'Guía Visual de Higiene en la Cocina',desc:'Lámina informativa de 3 pasos: lavado de manos, desinfección de superficies y uso de trapos limpios.',image:'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=600&q=80',favorite:false,illustrated:true,illustrationRequested:false}
];

function renderPosts(){
const grid=document.getElementById('requestsGrid'),query=document.getElementById('searchInput').value.toLowerCase(),cat=document.getElementById('categoryFilter').value;
const filtered=posts.filter(p=>(!cat||p.type===cat)&&(`${p.title} ${p.author} ${p.desc}`.toLowerCase().includes(query)));
updateStats();
if(!filtered.length){grid.innerHTML='<p style="grid-column:1/-1;text-align:center;color:var(--muted)">No se encontraron publicaciones.</p>';return}
grid.innerHTML=filtered.map(p=>{
const illustrated=!!p.illustrated;
return `<article class="card">${p.image?`<img src="${p.image}" alt="${escapeHtml(p.title)}" class="card-img">`:''}
<span class="card-badge">${escapeHtml(p.type)}</span>
<h3>${escapeHtml(p.title)}</h3>
<small style="color:var(--muted);font-weight:600">Por: ${escapeHtml(p.author)}</small>
<p>${escapeHtml(p.desc)}</p>
<div><span class="illustration-status ${illustrated?'':'pending'}">${illustrated?'✓ Ilustrada':(p.illustrationRequested?'⏳ Ilustración solicitada':'🎨 Aún sin ilustrar')}</span></div>
<div class="card-actions">
<button class="favorite" aria-label="Marcar favorito" onclick="toggleFavorite(${p.id})">${p.favorite?'❤️':'♡'}</button>
${!illustrated&&!p.illustrationRequested?`<button class="small-btn" onclick="openIllustrationModal(${p.id})">🎨 Yo la ilustro</button>`:''}
</div></article>`;
}).join('');
}
function updateStats(){
const total=document.getElementById('totalRecipes');
if(!total)return;
document.getElementById('totalRecipes').textContent=posts.length;
document.getElementById('illustratedRecipes').textContent=posts.filter(p=>p.illustrated).length;
document.getElementById('pendingIllustrations').textContent=posts.filter(p=>!p.illustrated).length;
document.getElementById('contributors').textContent=new Set(posts.map(p=>p.author.trim().toLowerCase())).size;
}
function savePosts(){
  try{
    localStorage.setItem('receta_posts',JSON.stringify(posts));
  }catch(error){
    alert('No se pudo guardar la receta. La imagen podría ser demasiado grande para el almacenamiento del navegador.');
    console.error(error);
  }
}
function escapeHtml(text){return String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function toggleFavorite(id){const p=posts.find(x=>x.id===id);if(p)p.favorite=!p.favorite;savePosts();renderPosts()}
let selectedIllustrationId=null;
function openIllustrationModal(id){
selectedIllustrationId=id;
const p=posts.find(x=>x.id===id);
if(!p)return;
document.getElementById('illustrationTarget').textContent=`Propuesta para: ${p.title}. Tu apoyo ayudará a convertir esta receta en una guía visual accesible.`;
document.getElementById('illustrationModal').style.display='flex';
document.getElementById('illustratorName').focus();
}
function closeIllustrationModal(){document.getElementById('illustrationModal').style.display='none';selectedIllustrationId=null}
function submitIllustration(e){
e.preventDefault();
const p=posts.find(x=>x.id===selectedIllustrationId);
const file=document.getElementById('illustrationFile').files[0];
const name=document.getElementById('illustratorName').value.trim();
const note=document.getElementById('illustrationNote').value.trim();

if(!p||!file)return;
if(!file.type.startsWith('image/')){
alert('Selecciona un archivo de imagen válido.');
return;
}

const reader=new FileReader();
reader.onload=()=>{
p.image=reader.result;
p.illustrated=true;
p.illustrationRequested=false;
p.illustratorName=name;
p.illustrationNote=note;
p.illustratedAt=new Date().toISOString();
savePosts();
renderPosts();
e.target.reset();
closeIllustrationModal();
alert('¡Listo! La ilustración se subió automáticamente a la receta.');
};
reader.readAsDataURL(file);
}
function switchTab(evt,id){document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));document.querySelectorAll('.view-content').forEach(v=>v.classList.remove('active'));evt.currentTarget.classList.add('active');document.getElementById(id).classList.add('active')}
function openModal(){document.getElementById('modal').style.display='flex';document.getElementById('authorInput').focus()}
function closeModal(){document.getElementById('modal').style.display='none'}
function handleFormSubmit(e){e.preventDefault();const file=document.getElementById('imageInput').files[0];const save=image=>{posts.unshift({id:Date.now(),type:userType.value,author:authorInput.value,title:titleInput.value,desc:descInput.value,image,favorite:false,illustrated:false,illustrationRequested:false});savePosts();renderPosts();closeModal();e.target.reset()};if(file){const reader=new FileReader();reader.onload=()=>save(reader.result);reader.readAsDataURL(file)}else save('')}
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});
renderPosts();
