addEventListener('fetch', event => {

event.respondWith(handleRequest(event.request));

});


const userAgents = [

"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",

"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/603.3.8 (KHTML, like Gecko) Version/10.1.1 Safari/603.3.8",

"Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36",

"Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:50.0) Gecko/20100101 Firefox/50.0",

"Mozilla/5.0 (Macintosh; Intel Mac OS X 10.11; rv:42.0) Gecko/20100101 Firefox/42.0",

"Dart/3.1 (dart:io)"

];


const contentTypeMap = {

'png': 'image/png',

'jpg': 'image/jpeg',

'jpeg': 'image/jpeg',

'gif': 'image/gif',

'webp': 'image/webp',

'svg': 'image/svg+xml',

'pdf': 'application/pdf',

'doc': 'application/msword',

'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',

'xls': 'application/vnd.ms-excel',

'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',

'ppt': 'application/vnd.ms-powerpoint',

'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation'

};


async function handleRequest(request) {

const url = new URL(request.url);


if (request.method === 'OPTIONS') {

return handleOptionsRequest();

}


if (request.method === 'GET') {

return handleProxyRequest(request, url);

}


return new Response('Method not allowed', { status: 405 });

}


function handleOptionsRequest() {

return new Response(null, {

headers: {

'Access-Control-Allow-Methods': 'GET, OPTIONS',

'Access-Control-Allow-Headers': '*'

}

});

}


async function handleProxyRequest(request, url) {

const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];

const modifiedHeaders = new Headers(request.headers);


// 删除不希望传递的请求头

['cf-connecting-ip', 'cf-ipcountry', 'cf-ray', 'cf-visitor', 'x-forwarded-proto', 'x-real-ip'].forEach(header => modifiedHeaders.delete(header));


modifiedHeaders.set('User-Agent', randomUserAgent);

modifiedHeaders.set('Content-Type', 'application/json; charset=utf-8');

modifiedHeaders.set('App-Info', '1/2.10.0/658');


if (randomUserAgent !== 'Dart/3.1 (dart:io)') {

modifiedHeaders.set('Referer', 'https://service.banjixiaoguanjia.com/appweb/');

}


const newPathname = url.pathname === '/avatar.png'

? '/a/a.png'

: `/a${url.pathname}`;

const proxyUrl = new URL(newPathname, 'http://xgjyundisk.oss-cn-hangzhou.aliyuncs.com');


try {

const proxyRequest = new Request(proxyUrl, {

method: request.method,

headers: modifiedHeaders,

body: request.body,

redirect: request.redirect

});


const response = await fetch(proxyRequest);


const newHeaders = new Headers(response.headers);


if (response.ok) {

const ext = url.pathname.split('.').pop();

const contentType = contentTypeMap[ext] || 'application/octet-stream';

newHeaders.set('Content-Type', contentType);


return new Response(response.body, {

status: response.status,

statusText: response.statusText,

headers: newHeaders

});

} else {

const errorText = await response.text();

return new Response(errorText, { status: response.status });

}

} catch (error) {

return new Response(`Error 500: ${error.message}`, { status: 500 });

}

}


