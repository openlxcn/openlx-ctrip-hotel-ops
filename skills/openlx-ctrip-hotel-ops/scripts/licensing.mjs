import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {ROOT,writeJson,verifyLicense,now} from './core.mjs';

export function deviceId(){
  const dir=path.join(os.homedir(),'.openlx-ctrip-device'),file=path.join(dir,'id');
  fs.mkdirSync(dir,{recursive:true,mode:0o700});if(!fs.existsSync(file))fs.writeFileSync(file,crypto.randomUUID(),{mode:0o600,flag:'wx'});
  return fs.readFileSync(file,'utf8').trim();
}
function enrollment(w){
  const f=path.join(w.base,'license.json');if(!fs.existsSync(f))return null;
  const e=JSON.parse(fs.readFileSync(f)),hotel=JSON.parse(fs.readFileSync(path.join(w.base,'hotel.json'))).hotel_id;
  const p=verifyLicense(e,fs.readFileSync(path.join(ROOT,'assets/license-public.txt'),'utf8'),hotel,0);
  if(!p||p.device_id!==deviceId()||p.refresh_origin!=='https://ctrip.openlx.cn'||!e.enrollment?.token)return null;
  return {envelope:e,payload:p,token:e.enrollment.token,file:f};
}
async function call(e,operation,body={}){
  const r=await fetch(e.payload.refresh_origin+'/api/device/'+operation,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+e.token},body:JSON.stringify(body),redirect:'error',signal:AbortSignal.timeout(10000)});
  const data=await r.json();if(!r.ok||!data.success)throw Error(data.error||'LICENSE_SERVICE_ERROR');return data.data;
}
export async function refreshLicense(w,force=false){
  const e=enrollment(w);if(!e)return {status:'NO_DEVICE_ENROLLMENT',remote_writes:0};
  if(!force&&Date.parse(e.payload.offline_valid_until)-Date.now()>6*3600000)return {status:'LICENSE_FRESH'};
  const fresh=await call(e,'refresh');const checked=verifyLicense(fresh,fs.readFileSync(path.join(ROOT,'assets/license-public.txt'),'utf8'),e.payload.hotel_id);
  if(!checked||checked.device_id!==deviceId())throw Error('LICENSE_REFRESH_INVALID');writeJson(e.file,{...fresh,enrollment:e.envelope.enrollment});return {status:'LICENSE_REFRESHED',at:now(),expires_at:checked.expires_at};
}
export async function acquireWriter(w){
  const e=enrollment(w);if(!e)throw Error('REGISTERED_DEVICE_ENROLLMENT_REQUIRED');
  const lease=await call(e,'lease',{operation:'acquire'});let lost=false;
  const renew=async()=>{if(lost)throw Error('WRITER_LEASE_LOST');try{await call(e,'lease',{operation:'renew',lease_id:lease.lease_id});}catch(err){lost=true;throw err;}};
  const interval=setInterval(()=>renew().catch(()=>{}),30000);interval.unref();
  return {scope:'SERVER_HOTEL',assert:renew,release:async()=>{clearInterval(interval);try{await call(e,'lease',{operation:'release',lease_id:lease.lease_id});}catch{}}};
}
