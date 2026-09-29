const BASE = 'https://api.sarvam.ai/speech-to-text/job/v1';
const LIMIT = 95 * 1024 * 1024;
const UUID = /^[0-9a-f-]{36}$/i;
const reply = (body, status = 200) => new Response(JSON.stringify(body), {status, headers: {'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});
async function api(path, env, options = {}) {
  const headers = {'api-subscription-key': env.SARVAM_API_KEY};
  if (options.body) headers['content-type'] = 'application/json';
  const response = await fetch(BASE + path, {method:options.method || 'GET',headers,body:options.body && JSON.stringify(options.body)});
  const text = await response.text();
  let data; try {data = JSON.parse(text);} catch {data = {message:text.slice(0,500)};}
  if (!response.ok) throw new Error(`Sarvam ${response.status}: ${JSON.stringify(data).slice(0,500)}`);
  return data;
}
function signedUrl(data, filename, kind) {
  const container = data[kind] || data.urls || data.files;
  const item = Array.isArray(container) ? container.find(x => x.file_name === filename || x.filename === filename) || container[0] : container?.[filename];
  const url = typeof item === 'string' ? item : item?.file_url || item?.url || item?.upload_url || item?.download_url;
  if (!url || !url.startsWith('https://')) throw new Error(`Sarvam did not return a usable ${kind} for ${filename}`);
  return {url, method:item?.method || (kind === 'upload_urls' ? 'PUT' : 'GET'), headers:item?.headers || {}};
}
export default {async fetch(request, env) {
  const url = new URL(request.url);
  if (url.pathname === '/health' && request.method === 'GET') return reply({status:'ready', configured:!!(env.SARVAM_API_KEY && env.APP_ACCESS_TOKEN)});
  if (!env.SARVAM_API_KEY || !env.APP_ACCESS_TOKEN) return reply({error:'Worker secrets not configured'},503);
  if (request.headers.get('authorization') !== `Bearer ${env.APP_ACCESS_TOKEN}`) return reply({error:'Invalid access code'},401);
  try {
    if (url.pathname === '/api/create' && request.method === 'POST') {
      return reply(await api('',env,{method:'POST',body:{job_parameters:{model:'saaras:v3',mode:'transcribe',language_code:'ta-IN'}}}));
    }
    const id = url.searchParams.get('job_id');
    if (!UUID.test(id || '')) return reply({error:'Invalid job ID'},400);
    if (url.pathname === '/api/upload' && request.method === 'POST') {
      const filename = request.headers.get('x-file-name');
      const length = Number(request.headers.get('content-length') || 0);
      if (!filename || !/^[^/\\]{1,180}\.(m4a|mp3|wav)$/i.test(filename)) return reply({error:'Choose an M4A, MP3 or WAV file with a simple filename'},400);
      if (length > LIMIT) return reply({error:'File exceeds the 95 MB limit for this version'},413);
      const links = await api('/upload-files',env,{method:'POST',body:{job_id:id,files:[filename]}});
      const link = signedUrl(links,filename,'upload_urls');
      const result = await fetch(link.url,{method:link.method,headers:link.headers,body:request.body});
      if (!result.ok) throw new Error(`Storage upload failed (${result.status})`);
      return reply({uploaded:true});
    }
    if (url.pathname === '/api/start' && request.method === 'POST') return reply(await api(`/${id}/start`,env,{method:'POST'}));
    if (url.pathname === '/api/status' && request.method === 'GET') return reply(await api(`/${id}/status`,env));
    if (url.pathname === '/api/result' && request.method === 'GET') {
      const status = await api(`/${id}/status`,env);
      const state = String(status.job_state || status.status || '').toLowerCase();
      if (!['completed','partiallycompleted'].includes(state)) return reply({error:'Job not complete',state},409);
      const outputs = (status.job_details || []).flatMap(item => item.outputs || []);
      const files = outputs.map(x => typeof x === 'string' ? x : x.file_name || x.filename).filter(Boolean);
      if (!files.length) return reply({error:'Job completed but no output files were listed',status},502);
      const links = await api('/download-files',env,{method:'POST',body:{job_id:id,files}});
      const chunks = [];
      for (const filename of files) {
        const link = signedUrl(links,filename,'download_urls');
        const r = await fetch(link.url,{method:link.method,headers:link.headers});
        if (!r.ok) throw new Error(`Result download failed (${r.status})`);
        const text = await r.text(); let obj; try {obj=JSON.parse(text);} catch {obj=null;}
        chunks.push(obj?.transcript || obj?.text || text);
      }
      return reply({transcript:chunks.join('\n\n'),job_id:id});
    }
    return reply({error:'Not found'},404);
  } catch (e) {return reply({error:e.message || 'Unexpected error'},502);}
}};
