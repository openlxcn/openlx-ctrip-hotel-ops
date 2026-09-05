const $=s=>document.querySelector(s);
async function load(){
  try{
    const {data}=await fetch('/api/public/config').then(r=>r.json());
    for(const f of data.features){const card=document.createElement('article');card.className='feature-card';const n=document.createElement('span');n.className='feature-number';n.textContent=f.id.replace('ADV-','');const h=document.createElement('h3');h.textContent=f.public_title;const p=document.createElement('p');p.textContent=f.promise;const d=document.createElement('details');const sm=document.createElement('summary');sm.textContent='查看能力说明';const ul=document.createElement('ul');for(const text of f.minimum_acceptance){const li=document.createElement('li');li.textContent=text;ul.append(li);}d.append(sm,ul);card.append(n,h,p,d);$('#feature-grid').append(card);}
    document.querySelectorAll('[data-cycle]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-cycle]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));const cycle=b.dataset.cycle;$('#standard-price').textContent=String(data.plans.STANDARD[cycle+'_fen']/100);$('#supreme-price').textContent=String(data.plans.SUPREME[cycle+'_fen']/100);document.querySelectorAll('.period-label').forEach(x=>x.textContent='/ '+({monthly:'月',quarterly:'季',annual:'年'}[cycle]));}));
    for(const c of data.status.summary||[]){const row=document.createElement('div');row.className='status-row';const b=document.createElement('b');b.textContent=c.title;const s=document.createElement('span');s.textContent=c.label;s.className=c.state==='LOCAL_RUN_PASS'?'state-local':'state-pending';row.append(b,s);$('#status-list').append(row);}
    if(data.release){$('#release-info').textContent=`版本 ${data.release.version}\nSHA-256 ${data.release.sha256}\n${data.release.compatibility}`;$('#download').href=data.release.download_url;}
    if(data.sales_enabled)$('#sales-status').textContent='收费套餐已开放。请阅读当前支持范围、服务条款和资源费用，按需要选择。';
  }catch{const p=document.createElement('p');p.textContent='暂时无法读取详细配置，请稍后刷新；文档入口仍可访问。';$('#feature-grid').append(p);}
}
$('#copy-install').addEventListener('click',async()=>{try{await navigator.clipboard.writeText($('#install-prompt').textContent);$('#copy-status').textContent='已复制，可粘贴给你的智能体。';}catch{$('#copy-status').textContent='请选中上方安装话语手动复制。';}});
load();
