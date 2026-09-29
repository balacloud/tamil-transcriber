// Foundation only: not connected to the public UI. Configure SARVAM_API_KEY and APP_ACCESS_TOKEN as Worker secrets before enabling requests.
const SARVAM = 'https://api.sarvam.ai/speech-to-text/job/v1';
export default {
  async fetch(request, env) {
    if (!env.SARVAM_API_KEY || !env.APP_ACCESS_TOKEN) return new Response('Worker secrets not configured', {status: 503});
    if (request.headers.get('authorization') !== `Bearer ${env.APP_ACCESS_TOKEN}`) return new Response('Unauthorized', {status: 401});
    const url = new URL(request.url);
    const paths = ['/job', '/upload-urls', '/status', '/download-urls'];
    if (!paths.includes(url.pathname)) return new Response('Not found', {status: 404});
    if (request.method !== (url.pathname === '/status' ? 'GET' : 'POST')) return new Response('Method not allowed', {status: 405});
    const id = url.searchParams.get('job_id');
    if (['/status', '/download-urls'].includes(url.pathname) && !/^[0-9a-f-]{36}$/i.test(id || '')) return new Response('Invalid job ID', {status: 400});
    const endpoint = url.pathname === '/job' ? SARVAM : url.pathname === '/upload-urls' ? `${SARVAM}/upload-files` : url.pathname === '/status' ? `${SARVAM}/${id}/status` : `${SARVAM}/download-files`;
    const headers = {'api-subscription-key': env.SARVAM_API_KEY};
    if (request.method === 'POST') headers['content-type'] = 'application/json';
    const response = await fetch(endpoint, {method: request.method, headers, body: request.method === 'POST' ? request.body : undefined});
    return new Response(response.body, {status: response.status, headers: {'content-type': response.headers.get('content-type') || 'application/json', 'cache-control': 'no-store'}});
  }
};
