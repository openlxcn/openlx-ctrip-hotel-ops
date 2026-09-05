import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {openWorkspace,writeJson,hash,now} from '../skills/openlx-ctrip-hotel-ops/scripts/core.mjs';
import {modelDraft} from '../skills/openlx-ctrip-hotel-ops/scripts/model.mjs';
import {runPricing,runContent} from '../skills/openlx-ctrip-hotel-ops/scripts/automation.mjs';
const setup=()=>{const dir=fs.mkdtempSync(path.join(os.tmpdir(),'ctrip-auto-')),w=openWorkspace(dir);return {w,dir,close(){w.close();fs.rmSync(dir,{recursive:true,force:true});}};};
const sample=()=>({hotel:{id:'hotel1',name:'示例酒店'},source:{type:'LIVE',account_id:'fixture-only',reference:'SIMULATION_ONLY'},observed_at:now(),facts:[{id:'f1',text:'酒店设有阅读室。',verified:true}],rates:[{room_id:'r1',plan_id:'p1',date:'2026-09-10',price_fen:20000},{room_id:'r2',plan_id:'p1',date:'2026-09-10',price_fen:18000}],reviews:[]});
test('authorized pricing isolates one failure and rejects changed scope',async()=>{const t=setup();try{const s=sample(),p={hotel_id:'hotel1',mode:'AUTOMATIC',target_fen:19000,floor_fen:15000,ceiling_fen:40000,max_change_bps:2000,daily_change_bps:2000,daily_count:3,cooldown_minutes:15,valid_until:new Date(Date.now()+86400000).toISOString(),dates:['2026-09-10'],room_ids:['r1','r2']};writeJson(path.join(t.dir,'pricing-policy.json'),p);let calls=0;const execute=async()=>{calls++;if(calls===1)throw Error('ONE_OBJECT_FAILED');return {status:'MOCK_PASS'};};const result=await runPricing(t.w,s,{pricing_policy_hash:hash(p)},{plan:'STANDARD'},execute);assert.equal(calls,2);assert.equal(result.results[0].status,'FAILED');assert.equal(result.results[1].status,'MOCK_PASS');assert.equal((await runPricing(t.w,s,{pricing_policy_hash:'changed'},{plan:'STANDARD'},execute)).status,'POLICY_AUTHORIZATION_REQUIRED');assert.equal((await runPricing(t.w,s,{pricing_policy_hash:hash(p)},{plan:'FREE'},execute)).status,'FREE_ADVISORY_ONLY');}finally{t.close();}});
test('daily content produces only one present-day draft and never calls submit without policy',async()=>{const t=setup();try{const s=sample();s.source.type='MOCK';const folder=path.join(t.dir,'photos');fs.mkdirSync(folder);fs.writeFileSync(path.join(folder,'room.jpg'),'simulation-bytes');fs.utimesSync(path.join(folder,'room.jpg'),new Date(0),new Date(0));writeJson(path.join(folder,'manifest.json'),{'room.jpg':{hotel_id:'hotel1',rights_confirmed:true,channels:['CTRIP'],scene:'阅读室'}});const cfg={content_schedule:{enabled:true,hour:0,asset_folder:folder,auto_submit:true}};let calls=0;const op=async()=>{calls++;throw Error('UNAUTHORIZED');};const first=await runContent(t.w,s,cfg,{plan:'SUPREME'},op);assert.equal(first.status,'DRAFT_READY');assert.equal(first.publish_status,'NOT_SUBMITTED');assert.equal((await runContent(t.w,s,cfg,{plan:'SUPREME'},op)).status,'ALREADY_PREPARED');assert.equal(calls,0);assert.equal(fs.readdirSync(path.join(t.dir,'content')).length,1);}finally{t.close();}});
test('model sends allowlisted facts only and output stays awaiting review', async () => {
  const t = setup();
  try {
    writeJson(path.join(t.dir, 'model.json'), {endpoint: 'http://127.0.0.1:1234/v1/chat/completions', model: 'fixture', cost_acknowledged: true});
    const s = sample();
    s.orders = [{guest_name: 'DO_NOT_SEND', cookie: 'DO_NOT_SEND'}];
    let captured;
    const fake = async (url, opt) => {
      captured = opt.body;
      return {ok: true, json: async () => ({id: 'MOCK', choices: [{message: {content: JSON.stringify({title: '入住前的阅读空间', body: '酒店设有阅读室。', fact_ids: ['f1']})}}], usage: {total_tokens: 25}})};
    };
    const r = await modelDraft(t.w, s, '阅读', null, fake);
    assert.equal(r.status, 'AWAITING_APPROVAL');
    assert.equal(r.publish_status, 'NOT_SUBMITTED');
    assert.ok(!captured.includes('DO_NOT_SEND'));
    const invalid = async () => ({ok: true, json: async () => ({choices: [{message: {content: JSON.stringify({title: 'X', body: 'Y', fact_ids: ['invented']})}}]})});
    await assert.rejects(() => modelDraft(t.w, s, '阅读', null, invalid), /FACT_REFERENCES_INVALID/);
  } finally { t.close(); }
});
