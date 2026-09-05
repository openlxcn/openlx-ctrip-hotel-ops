import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createRequire} from 'node:module';
import {openStore} from '../src/store.mjs';
import {createSync,nextBatch,setupOutbox} from '../src/series-sync.mjs';
const require=createRequire(import.meta.url);
const {signature,verifyRequest,validateBatch}=require('../shared/wx-api/series.cjs');
const product='openlx-ctrip-hotel-ops';
function fixture(){const dir=fs.mkdtempSync(path.join(os.tmpdir(),'series-test-')),store=openStore(dir),keyFile=path.join(dir,'sync-key');fs.writeFileSync(keyFile,'fixture-only-secret');return {dir,store,keyFile,close(){store.db.close();fs.rmSync(dir,{recursive:true,force:true});}};}
test('series signing rejects wrong product, changed body and expired request',()=>{
  const raw='{"records":[]}',t=String(Date.now()),keys={[product]:'secret'};
  const h={'x-openlx-product':product,'x-openlx-timestamp':t,'x-openlx-signature':signature('secret',t,raw)};
  assert.equal(verifyRequest(h,raw,keys),product);
  assert.throws(()=>verifyRequest(h,raw+' ',keys),/AUTH_FAILED/);
  assert.throws(()=>verifyRequest({...h,'x-openlx-product':'openlx-fliggy-hotel-ops'},raw,keys),/AUTH_FAILED/);
  assert.throws(()=>verifyRequest(h,raw,keys,Date.now()+600000),/AUTH_FAILED/);
});
test('transactional outbox retains committed payment and excludes tokens and private ticket content',()=>{
  const f=fixture();try{setupOutbox(f.store.db);const db=f.store.db;
    db.exec('BEGIN');db.prepare('INSERT INTO hotels VALUES(?,?,?,?)').run('rollback','1','回滚',new Date().toISOString());db.exec('ROLLBACK');assert.equal(db.prepare('SELECT count(*) n FROM series_outbox').get().n,0);
    db.prepare('INSERT INTO hotels VALUES(?,?,?,?)').run('hotel','1','测试门店',new Date().toISOString());
    const order=f.store.createOrder('1','hotel','STANDARD','monthly','alipay');f.store.fulfill(order.id,'MOCK-SERIES-TX',1990,'alipay');f.store.ticket('1','hotel','SUPPORT','private guest request');
    const batch=nextBatch(db,product);validateBatch(product,batch);assert.ok(batch.records.some(r=>r.entity_type==='orders'&&r.data.status==='PAID'));assert.ok(batch.records.some(r=>r.entity_type==='entitlements'));assert.ok(!JSON.stringify(batch).includes('private guest request'));assert.ok(!JSON.stringify(batch).includes('device_token'));assert.ok(!JSON.stringify(batch).includes('password'));
  }finally{f.close();}
});
test('uncertain network result replays exact durable batch, then catches later edits and deletions',async()=>{
  const f=fixture();try{const bodies=[];let fail=true;const sync=createSync(f.store.db,{keyFile:f.keyFile,fetcher:async(_u,o)=>{bodies.push(o.body);if(fail){fail=false;throw Error('connection lost after remote commit');}return {ok:true,json:async()=>({success:true,data:{revision:JSON.parse(o.body).revision}})};}});
    f.store.db.prepare('INSERT INTO hotels VALUES(?,?,?,?)').run('hotel','1','before',new Date().toISOString());
    assert.equal((await sync.flush()).status,'SYNC_PENDING');
    f.store.db.prepare('UPDATE hotels SET name=? WHERE id=?').run('after','hotel');
    assert.equal((await sync.flush()).status,'SYNCED');assert.equal(bodies[0],bodies[1]);assert.equal(sync.status().pending,1);
    await sync.flush();assert.equal(JSON.parse(bodies[2]).records[0].data.name,'after');
    f.store.db.prepare('DELETE FROM hotels WHERE id=?').run('hotel');await sync.flush();assert.equal(JSON.parse(bodies[3]).records[0].deleted,true);
    await sync.flush();assert.equal(bodies.length,4);assert.equal(sync.status().pending,0);
  }finally{f.close();}
});
test('series validation rejects leaked credentials, foreign product and invalid money',()=>{
  const b={product_id:product,stream_id:'0123456789abcdef',from_revision:0,revision:1,records:[{entity_type:'hotels',entity_id:'h',user_id:'1',deleted:false,data:{id:'h',user_id:'1',name:'店'}}]};
  assert.equal(validateBatch(product,b),b);assert.throws(()=>validateBatch('openlx-fliggy-hotel-ops',b));
  b.records[0].data.api_key='must-never-sync';assert.throws(()=>validateBatch(product,b),/FIELDS/);
  b.records[0]={entity_type:'orders',entity_id:'o',user_id:'1',deleted:false,data:{id:'o',user_id:'1',amount_fen:1.2,currency:'CNY'}};assert.throws(()=>validateBatch(product,b),/MONEY/);
});
test('late acknowledgement from a second process cannot regress the durable cursor',async()=>{
  const f=fixture();try{let release,started;const ready=new Promise(r=>started=r);
    const slow=createSync(f.store.db,{keyFile:f.keyFile,fetcher:async(_u,o)=>{started();await new Promise(r=>release=r);return {ok:true,json:async()=>({success:true,data:{revision:JSON.parse(o.body).revision}})};}});
    const fast=createSync(f.store.db,{keyFile:f.keyFile,fetcher:async(_u,o)=>({ok:true,json:async()=>({success:true,data:{revision:JSON.parse(o.body).revision}})})});
    f.store.db.prepare('INSERT INTO hotels VALUES(?,?,?,?)').run('h','1','one',new Date().toISOString());
    const waiting=slow.flush();await ready;await fast.flush();
    f.store.db.prepare('UPDATE hotels SET name=? WHERE id=?').run('two','h');await fast.flush();
    release();await waiting;assert.equal(f.store.db.prepare("SELECT value FROM series_sync_meta WHERE key='ack'").get().value,'2');assert.equal(nextBatch(f.store.db,product),null);
  }finally{f.close();}
});
