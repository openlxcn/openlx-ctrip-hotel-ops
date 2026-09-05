// Integration tests use uniquely named temporary test tables in the real MySQL.
// No production user/session/order/entitlement is inserted or changed.
const assert=require('node:assert/strict');
const {migrate,applyBatch,overview}=require('./series.cjs');
const db=require(process.env.OPENLX_SHARED_ROOT+'/db.js');
const prefix='series_probe_'+Date.now()+'_';
const names=['openlx_series_sources','openlx_series_records','users','orders','agent_api_keys'];
const replace=sql=>{for(const n of names)sql=sql.replace(new RegExp('\\b'+n+'\\b','g'),prefix+n);return sql;};
const wrap=c=>({query:(sql,p)=>c.query(replace(sql),p),execute:(sql,p)=>c.execute(replace(sql),p),beginTransaction:()=>c.beginTransaction(),commit:()=>c.commit(),rollback:()=>c.rollback(),release:()=>c.release()});
const pool={...wrap(db.pool),getConnection:async()=>wrap(await db.pool.getConnection())};
const product='openlx-ctrip-hotel-ops';
const batch={product_id:product,stream_id:'0123456789abcdef',from_revision:0,revision:1,records:[{entity_type:'hotels',entity_id:'probe-hotel',user_id:'1',deleted:false,data:{id:'probe-hotel',user_id:'1',name:'SYNTHETIC DATABASE PROBE'}}]};
(async()=>{try{
  for(const n of ['users','orders','agent_api_keys'])await db.pool.query(`CREATE TABLE ${prefix+n} LIKE ${n}`);
  await pool.query("INSERT INTO users(id,nickname,status) VALUES(1,'SYNTHETIC',1),(2,'ISOLATION',1)");
  await migrate(pool);await applyBatch(pool,product,batch);assert.equal((await applyBatch(pool,product,batch)).duplicate,true);
  assert.equal((await overview(pool,'1')).records.length,1);assert.equal((await overview(pool,'2')).records.length,0);
  const next={...batch,from_revision:1,revision:2,records:[{...batch.records[0],data:{...batch.records[0].data,name:'UPDATED SYNTHETIC'}}]};await applyBatch(pool,product,next);assert.equal((await overview(pool,'1')).records[0].data.name,'UPDATED SYNTHETIC');
  await assert.rejects(applyBatch(pool,product,batch),/REVISION/);
  await assert.rejects(applyBatch(pool,product,{...next,from_revision:2,revision:3,records:[{...next.records[0],user_id:'2',data:{...next.records[0].data,user_id:'2'}}]}),/OWNER/);
  await assert.rejects(applyBatch(pool,product,{...next,from_revision:2,revision:3,records:[{...next.records[0],user_id:'999',entity_id:'unknown',data:{...next.records[0].data,user_id:'999',id:'unknown'}}]}),/UNKNOWN_USER/);
  await applyBatch(pool,product,{...next,from_revision:2,revision:3,records:[{...batch.records[0],deleted:true,data:null}]});assert.equal((await overview(pool,'1')).records.length,0);
  console.log(JSON.stringify({status:'REAL_MYSQL_SYNTHETIC_INTEGRATION_PASS',checks:['write_readback','idempotent_retry','update_readback','user_isolation','stale_revision_rejected','owner_change_rejected','unknown_user_rejected','delete_readback'],real_customer_transactions:0,test_tables:prefix,observed_at:new Date().toISOString()}));
}finally{for(const n of names)await db.pool.query(`DROP TABLE IF EXISTS ${prefix+n}`);await db.pool.end();}})().catch(e=>{console.error(e.code||e.message);process.exitCode=1;});
