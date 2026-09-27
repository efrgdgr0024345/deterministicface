"""Local HTTPS integration tests. No external API or real credentials are used."""
from __future__ import annotations
import hashlib, http.client, http.cookiejar, http.server, json, os, re, shutil
import socket, ssl, subprocess, tempfile, threading, time, urllib.error, urllib.parse, urllib.request
from pathlib import Path

SOURCE = Path(__file__).resolve().parents[1] / 'loader.php'

def free_port():
    with socket.socket() as sock:
        sock.bind(('127.0.0.1', 0))
        return sock.getsockname()[1]

def run():
    with tempfile.TemporaryDirectory(prefix='df-http-') as td:
        base = Path(td); public = base / 'public'; private = base / 'private'
        public.mkdir(); private.mkdir(mode=0o700)
        shutil.copyfile(SOURCE, public / 'loader.php')
        # Test-only router: TLS is actually terminated by the local proxy below.
        router = base / 'router.php'
        router.write_text("<?php define('DF_PRIVATE_ROOT', " + repr(str(private)) + "); "
                          "$_SERVER['HTTPS']='on'; require __DIR__.'/public/loader.php';")
        code = 'test-only-setup-code-' + 'x' * 40
        (private / 'setup_code').write_text(code); (private / 'setup_code').chmod(0o600)
        cert = base/'cert.pem'; key=base/'key.pem'
        subprocess.run(['openssl','req','-x509','-newkey','rsa:2048','-nodes','-days','1',
                        '-subj','/CN=localhost','-keyout',str(key),'-out',str(cert)],
                       check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
        php_port=free_port(); tls_port=free_port()
        proc=subprocess.Popen(['php','-S',f'127.0.0.1:{php_port}','-t',str(public),str(router)],
                              stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
        class Proxy(http.server.BaseHTTPRequestHandler):
            def log_message(self, *_): pass
            def do_GET(self): self.forward()
            def do_POST(self): self.forward()
            def forward(self):
                conn=http.client.HTTPConnection('127.0.0.1',php_port,timeout=10)
                body=self.rfile.read(int(self.headers.get('Content-Length','0')))
                headers={k:v for k,v in self.headers.items() if k.lower() not in {'host','connection'}}
                conn.request(self.command,self.path,body=body,headers=headers)
                reply=conn.getresponse(); content=reply.read(); self.send_response(reply.status)
                for k,v in reply.getheaders():
                    if k.lower() not in {'connection','transfer-encoding','content-length'}: self.send_header(k,v)
                self.send_header('Content-Length',str(len(content)));self.end_headers();self.wfile.write(content);conn.close()
        server=http.server.ThreadingHTTPServer(('127.0.0.1',tls_port),Proxy)
        ctx=ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER);ctx.load_cert_chain(cert,key)
        server.socket=ctx.wrap_socket(server.socket,server_side=True)
        worker=threading.Thread(target=server.serve_forever,daemon=True);worker.start()
        try:
            for _ in range(50):
                try:
                    with socket.create_connection(('127.0.0.1',php_port),timeout=.2):break
                except OSError:time.sleep(.05)
            jars=http.cookiejar.CookieJar()
            # The certificate is local, ephemeral and self-signed. Production verification stays enabled.
            client=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jars),
                  urllib.request.HTTPSHandler(context=ssl._create_unverified_context()))
            url=f'https://127.0.0.1:{tls_port}/loader.php'
            def request(fields=None):
                data=urllib.parse.urlencode(fields).encode() if fields is not None else None
                try:
                    with client.open(url,data=data,timeout=15) as r:return r.status,r.read().decode(),r.headers
                except urllib.error.HTTPError as r:return r.code,r.read().decode(),r.headers
            n=0
            def check(condition,label):
                nonlocal n
                assert condition,label;n+=1;print('PASS HTTP',label)
            def csrf(html):return re.search(r'name="csrf" value="([a-f0-9]+)"',html).group(1)
            status,html,headers=request()
            check('Initial owner setup' in html,'first-run setup requires owner code')
            check('Locked project scope' not in html,'private dashboard hidden before sign-in')
            check("form-action 'self'" in headers['Content-Security-Policy'],'restricted form CSP')
            check('no-store' in headers['Cache-Control'],'no cached private page')
            check(any(c.secure for c in jars),'session cookie requires HTTPS')
            fields={'action':'setup','csrf':csrf(html),'setup_code':'wrong','password':'test-password-long-enough','github_token':'fixture-token-never-real'}
            _,html,_=request(fields);check('Authentication failed' in html,'wrong setup code denied')
            fields['csrf']=csrf(html);fields['setup_code']=code
            _,html,_=request(fields)
            check('Locked project scope' in html,'owner setup enters dashboard')
            check(not (private/'setup_code').exists(),'setup code consumed after initial setup')
            check('fixture-token-never-real' not in html and code not in html,'credentials not echoed')
            slot=private/('site-'+hashlib.sha256(str(public.resolve()).encode()).hexdigest()[:16])
            config=json.loads((slot/'config.json').read_text())
            check('test-password-long-enough' not in json.dumps(config),'only password hash stored')
            check((slot/'github_token').stat().st_mode & 0o077 == 0,'token file restricted')
            check(not list(public.glob('*.json')),'no runtime state under public web root')
            _,bad,_=request({'action':'install','csrf':'wrong'})
            check('form expired' in bad,'CSRF failure prevents update')
            check(not (slot/'state.json').exists(),'failed action did not create deployed state')
            _,html,_=request()
            _,report,headers=request({'action':'report','csrf':csrf(html)})
            data=json.loads(report)
            check('console_version' in data and 'state' in data,'downloadable report is JSON')
            check('fixture-token-never-real' not in report,'report excludes GitHub credential')
            check('attachment;' in headers['Content-Disposition'],'report is an attachment')
            _,html,_=request();_,html,_=request({'action':'check','csrf':csrf(html),'branch':'../evil'})
            check('Invalid branch name' in html,'branch input validated before API call')
            _,html,_=request();_,html,_=request({'action':'logout','csrf':csrf(html)})
            check('Owner sign-in' in html and 'Locked project scope' not in html,'logout closes dashboard')
            _,html,_=request({'action':'login','csrf':csrf(html),'password':'wrong'})
            check('Authentication failed' in html,'wrong password denied')
            _,html,_=request({'action':'login','csrf':csrf(html),'password':'test-password-long-enough'})
            check('Locked project scope' in html,'existing owner can sign in again')
            print(f'RESULT HTTP {n} passed.')
            # Optional visual artefact capture, only when explicitly invoked by the developer.
            if os.environ.get('DF_CAPTURE_HTML'):
                Path(os.environ['DF_CAPTURE_HTML']).write_text(html)
        finally:
            server.shutdown();server.server_close();proc.terminate();proc.wait(timeout=5)

if __name__=='__main__':run()
