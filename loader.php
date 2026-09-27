<?php
/**
 * DeterministicFace — single-file project console / GitHub updater.
 * PHP 8.1+, cURL and ZipArchive. No Composer, database or image API.
 * Adapted from the owner's LearnPiano loader and Black Cat project viewer.
 * Upload only this PHP file. Runtime secrets/backups stay outside the web root.
 * Initial setup: create DF_PRIVATE_ROOT/setup_code (0600) with 32+ random chars.
 * Never put a real password, GitHub token or setup code in this repository.
 */
declare(strict_types=1);
const DF_VERSION = '0.1.0';
const DF_REPO = 'efrgdgr0024345/deterministicface';
const DF_PREVIEW_BRANCH = 'feat/df-000a-project-console';
if (!defined('DF_PRIVATE_ROOT')) define('DF_PRIVATE_ROOT', '/home/learning/.deterministicface');
const DF_MAX_ARCHIVE = 33554432;
const DF_MAX_EXPANDED = 67108864;
const DF_MAX_FILE = 8388608;
const DF_REQUIRED_CHECKS = ['repository-contract', 'loader-tests'];

/* DF_PROJECT_JSON_BEGIN
{
  "schema": 1,
  "version": "2026-09-27.1",
  "title": "DeterministicFace",
  "phase": "Foundation and delivery tooling — portrait engine not built",
  "summary": "Help a human recognise the actual public key their trusted application is using through an exactly reproducible synthetic face and background.",
  "scope": [
    "The local system, application, display and cryptographic implementation are trusted starting assumptions. The portrait represents the actual operation key.",
    "The same canonical public key and frozen profile must independently regenerate identical complete portrait pixels: face, background, lighting and composition. A cache is only an optimisation.",
    "The complete key influences both face and background through standard whole-input cryptographic derivation. Keep the existing labelled HKDF-SHA-256 contract and vectors.",
    "Different usable keys should be difficult for humans to confuse, including deliberately searched lookalikes. This is a research objective, not an established guarantee.",
    "Never silently change a released portrait profile. Experimental profiles are not identities users should memorise. Private keys are never inputs to the portrait engine."
  ],
  "decisions": [
    {"title":"One existing repository", "text":"Preserve the useful design, derivation vectors and review discipline. This owner-approved plan supersedes a mandatory procedural-only renderer choice."},
    {"title":"Two bounded renderer experiments", "text":"Compare a procedural face candidate with a reviewed FaceHash/StyleGAN-style candidate using 100 predetermined test keys. Use the learned candidate as a realism reference, not an automatic winner."},
    {"title":"Exact pixels are an early gate", "text":"Identical SVG alone is not identical pixels. Fix the canonical raster contract and test cache deletion, restart, call order and supported execution targets. Do not weaken exactness to visual similarity."},
    {"title":"Actual working-key demonstration early", "text":"Add a canonical public-key adapter and a small signed-file verification demo. Portrait requests must follow the actual verification key, including concurrent and out-of-order jobs."},
    {"title":"Separate engine and interface", "text":"The browser/PHP console is delivery and research tooling, not the portrait generator. The final engine should regenerate locally without a portrait lookup or external image API."},
    {"title":"Evaluate recognition and attacker-selected alternatives", "text":"Compare face-only, scene-only and combined portraits with equal familiarisation. Measure wrong-key acceptance, correct-key rejection, verification time and budgeted valid-key lookalike search."},
    {"title":"Keep optional inspection research separate", "text":"Preserve the private remembered landmark and scan concept for a later controlled experiment. It is not a prerequisite for the first working portrait verifier, and the normal app must not collect the checkpoint."},
    {"title":"Evidence before extra complexity", "text":"Defer custom training and CEAL-inspired distance coding until baseline measurements justify them. Check code, weights, data provenance and distribution licences before selecting a deployment renderer."},
    {"title":"Single-file owner console", "text":"Combine the supplied loader and project-viewer roles in loader.php. Keep scope and milestone data embedded here; no separately maintained project_content.json. Install only a checked exact commit, with private backups, logs and rollback."}
  ],
  "milestones": [
    {"id":"DF-000A", "title":"Reconciled plan and project console", "status":"in_review", "evidence":"Owner approved direction; implementation and tests in this change. Merge, hosting and review are separate gates."},
    {"id":"DF-001", "title":"Parser, HKDF derivation and sampling", "status":"not_started", "evidence":"Exact contract and known-answer vectors exist; application implementation remains the next bounded task."},
    {"id":"DF-001B", "title":"Real-key adapter and signed-file demo", "status":"not_started", "evidence":"Must consume the actual operation key and test stale/out-of-order rendering."},
    {"id":"DF-002A", "title":"Procedural rendering experiment", "status":"not_started", "evidence":"Naturalness, diversity and canonical pixels must be demonstrated."},
    {"id":"DF-002B", "title":"Existing learned-generator experiment", "status":"not_started", "evidence":"Fixed weights/noise, resource measurements, licence review and exactness tests required."},
    {"id":"DF-003", "title":"100-key comparison and renderer decision", "status":"not_started", "evidence":"Show all outputs, failures and resource measurements; do not cherry-pick."},
    {"id":"DF-004", "title":"Recognition and adversarial evaluation", "status":"not_started", "evidence":"Human pilot and budgeted searches over alternative valid key pairs; no security-bit claims from parameter counts."},
    {"id":"DF-005", "title":"Portable frozen profile and integration", "status":"not_started", "evidence":"Supported targets must match canonical pixels. No stable profile or security release exists yet."}
  ],
  "references": [
    {"name":"Adrian Perrig and Dawn Song", "work":"Hash Visualization (1999); perceptually near preimages/collisions. Also credit their stated Random Art lineage: Andrej Bauer, Michael Witbrock and John Mount.", "url":"https://users.ece.cmu.edu/~adrian/projects/validation/validation.pdf"},
    {"name":"Mozhgan Azimpourkivi, Umut Topkara and Bogdan Carbunar", "work":"CEAL: Human Distinguishable Visual Key Fingerprints (2020). Learned fingerprints, human-perception modelling and code-based input separation.", "url":"https://www.usenix.org/conference/usenixsecurity20/presentation/azimpourkivi"},
    {"name":"Alexander Becker", "work":"FaceHash: data-to-StyleGAN2-ADA face implementation; starting point for a comparative baseline.", "url":"https://github.com/alebeck/facehash"},
    {"name":"Tero Karras, Samuli Laine, Miika Aittala, Janne Hellsten, Jaakko Lehtinen and Timo Aila", "work":"StyleGAN2 generator research. Specific implementations, weights and datasets require separate provenance and licence records.", "url":"https://arxiv.org/abs/1912.04958"},
    {"name":"Joshua Tan, Lujo Bauer, Joseph Bonneau, Lorrie Faith Cranor, Jeremy Thomas and Blase Ur", "work":"Can Unicorns Help Users Compare Crypto Key Fingerprints? Comparative usable-security evaluation (2017).", "url":"https://users.ece.cmu.edu/~lbauer/papers/2017/chi2017-fingerprints-author.pdf"},
    {"name":"Owner-supplied implementation examples", "work":"LearnPiano loader (update log/preserved local data) and Black Cat/PTL living project viewer (scope, milestones, provenance and honest release state). Reworked for this private repository; sibling projects are unchanged.", "url":""}
  ],
  "history": [{"date":"2026-09-27", "text":"Owner approved the comparative-renderer advice and requested a combined loader and project tracker. This release adds tooling and a reconciled plan, not a working portrait generator."}]
}
DF_PROJECT_JSON_END */

function df_h(mixed $v): string { return htmlspecialchars((string)$v, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'); }
function df_json(string $s): array { $v=json_decode($s,true,64,JSON_THROW_ON_ERROR); if(!is_array($v)) throw new RuntimeException('Invalid JSON object.'); return $v; }
function df_project(string $source): array {
    if(!preg_match('~/\* DF_PROJECT_JSON_BEGIN\s*(.*?)\s*DF_PROJECT_JSON_END \*/~s',$source,$m)) throw new RuntimeException('Embedded project data missing.');
    $p=df_json($m[1]);
    if(($p['schema']??0)!==1 || !is_string($p['title']??null) || !is_array($p['milestones']??null)) throw new RuntimeException('Unsupported project-data schema.');
    foreach(['scope','decisions','references','history'] as $k) if(!is_array($p[$k]??null)) throw new RuntimeException('Incomplete project data.');
    foreach($p['milestones'] as $row) if(!is_array($row)||!in_array($row['status']??'', ['not_started','in_review','in_progress','blocked','complete'],true)) throw new RuntimeException('Invalid milestone status.');
    return $p;
}
function df_branch(string $s): string {
    if(!preg_match('~^[A-Za-z0-9][A-Za-z0-9_./-]{0,149}$~D',$s)||str_contains($s,'..')||str_contains($s,'//')||str_ends_with($s,'/')||str_ends_with($s,'.lock')) throw new RuntimeException('Invalid branch name.'); return $s;
}
function df_path(string $p): string {
    if($p===''||strlen($p)>240||str_contains($p,'\\')||str_contains($p,':')||preg_match('~[\x00-\x20\x7f]~',$p)||$p[0]==='/') throw new RuntimeException('Unsafe package path.');
    foreach(explode('/',$p) as $part) if($part===''||$part==='.'||$part==='..'||$part[0]==='.') throw new RuntimeException('Unsafe package component.'); return $p;
}
function df_target(string $p): ?string {
    df_path($p);
    if($p==='loader.php') return $p;
    if(!str_starts_with($p,'web/')) return null;
    $rel=substr($p,4); df_path($rel);
    if(!preg_match('~\.(php|html|js|mjs|css|svg|png|jpg|jpeg|webp|ico|json|wasm|woff2|txt)$~D',$rel)) throw new RuntimeException('Unsupported web-bundle file type.');
    return 'app/'.$rel;
}
function df_owned_path(string $p): string {
    df_path($p); if($p!=='loader.php'&&!str_starts_with($p,'app/')) throw new RuntimeException('Path outside deployment allowlist.'); return $p;
}
function df_no_links(string $root,string $relative): string {
    df_owned_path($relative); $p=rtrim($root,'/');
    foreach(explode('/',$relative) as $part){$p.='/'.$part;if(is_link($p)) throw new RuntimeException('Symlink in deployment path.');} return $p;
}
function df_mkdir(string $p,int $mode=0700): void {
    if(is_link($p)) throw new RuntimeException('Refusing symlink directory.');
    if(!is_dir($p)&&!mkdir($p,$mode,true)&&!is_dir($p)) throw new RuntimeException('Cannot create working directory.');
}
function df_write(string $path,string $bytes,int $mode=0600): void {
    if(is_link($path)) throw new RuntimeException('Refusing symlink file.');
    $tmp=dirname($path).'/.write-'.bin2hex(random_bytes(8));
    try {if(file_put_contents($tmp,$bytes,LOCK_EX)!==strlen($bytes)) throw new RuntimeException('Cannot write file.'); chmod($tmp,$mode); if(!rename($tmp,$path)) throw new RuntimeException('Cannot activate file.');} finally {if(is_file($tmp)) unlink($tmp);}
}
function df_read(string $path): array { if(!is_file($path)) return []; if(is_link($path)) throw new RuntimeException('Refusing symlink state.'); return df_json((string)file_get_contents($path)); }
function df_save(string $path,array $value): void { df_write($path,json_encode($value,JSON_THROW_ON_ERROR|JSON_UNESCAPED_SLASHES|JSON_PRETTY_PRINT)."\n"); }
function df_lock(string $dir): mixed { $f=fopen($dir.'/lock','c'); if(!$f||!flock($f,LOCK_EX|LOCK_NB)) throw new RuntimeException('Another operation is running. Try again after it completes.'); chmod($dir.'/lock',0600); return $f; }
function df_unlock(mixed $f): void { if(is_resource($f)){flock($f,LOCK_UN);fclose($f);} }
function df_safe_private(string $root,string $docroot): string {
    $r=realpath($root); $d=realpath($docroot);
    if($r===false||$d===false||is_link($root)||$r===$d||str_starts_with($r,$d.'/')) throw new RuntimeException('Create the private directory outside the public document root.');
    if((fileperms($r)&0077)!==0) throw new RuntimeException('Private directory permissions must be 0700.'); return $r;
}
function df_secret(string $path): string {
    if(!is_file($path)||is_link($path)||!is_readable($path)||(fileperms($path)&0077)!==0) throw new RuntimeException('Private credential unavailable or permissions are not 0600.');
    return trim((string)file_get_contents($path));
}
function df_http(string $url,string $token='',int $limit=DF_MAX_ARCHIVE): array {
    $parts=parse_url($url); $host=strtolower($parts['host']??'');
    if(($parts['scheme']??'')!=='https'||!in_array($host,['api.github.com','codeload.github.com'],true)||isset($parts['user'])||isset($parts['pass'])||(isset($parts['port'])&&$parts['port']!==443)) throw new RuntimeException('Unapproved GitHub download destination.');
    if($token!==''&&$host!=='api.github.com') throw new RuntimeException('Credential forwarding blocked.');
    if(!function_exists('curl_init')) throw new RuntimeException('Enable PHP cURL in cPanel.');
    $headers=['User-Agent: DeterministicFace-Console/'.DF_VERSION,'Accept: application/vnd.github+json','X-GitHub-Api-Version: 2022-11-28'];
    if($token!=='')$headers[]='Authorization: Bearer '.$token;
    $body='';$location='';$ch=curl_init($url);
    curl_setopt_array($ch,[CURLOPT_FOLLOWLOCATION=>false,CURLOPT_CONNECTTIMEOUT=>10,CURLOPT_TIMEOUT=>90,CURLOPT_SSL_VERIFYPEER=>true,CURLOPT_SSL_VERIFYHOST=>2,CURLOPT_HTTPHEADER=>$headers,CURLOPT_PROTOCOLS=>CURLPROTO_HTTPS,
        CURLOPT_WRITEFUNCTION=>static function($ch,string $s)use(&$body,$limit){if(strlen($body)+strlen($s)>$limit)return 0;$body.=$s;return strlen($s);},
        CURLOPT_HEADERFUNCTION=>static function($ch,string $s)use(&$location){if(stripos($s,'Location:')===0)$location=trim(substr($s,9));return strlen($s);}]);
    $ok=curl_exec($ch);$status=(int)curl_getinfo($ch,CURLINFO_RESPONSE_CODE);curl_close($ch);
    if($ok===false)throw new RuntimeException('GitHub transfer failed or exceeded the download limit. No update was activated.');
    return ['status'=>$status,'body'=>$body,'location'=>$location];
}
function df_api(string $endpoint,string $token): array {
    $r=df_http('https://api.github.com/repos/'.DF_REPO.'/'.$endpoint,$token,DF_MAX_FILE);
    if($r['status']!==200)throw new RuntimeException('GitHub HTTP '.$r['status'].'. Check repository read access, branch and token permissions.');return df_json($r['body']);
}
function df_check_result(array $a,string $sha): array {
    $states=[];
    if(($a['total_count']??101)>100)throw new RuntimeException('Too many check runs for a complete check. Update blocked.');
    foreach($a['check_runs']??[] as $r){$name=(string)($r['name']??'');if(!in_array($name,DF_REQUIRED_CHECKS,true))continue;
        $pass=($r['head_sha']??'')===$sha&&($r['app']['slug']??'')==='github-actions'&&($r['status']??'')==='completed'&&($r['conclusion']??'')==='success';
        $states[$name]=isset($states[$name])?($states[$name]&&$pass):$pass;
    }
    $ok=true;foreach(DF_REQUIRED_CHECKS as $n)if(empty($states[$n]))$ok=false;
    return ['ok'=>$ok,'required'=>DF_REQUIRED_CHECKS,'states'=>$states];
}
function df_checks(string $sha,string $token): array { return df_check_result(df_api('commits/'.$sha.'/check-runs?per_page=100&filter=latest',$token),$sha); }
function df_remote(string $branch,string $token): array {
    $branch=df_branch($branch);$c=df_api('commits/'.rawurlencode($branch),$token);$sha=$c['sha']??'';
    if(!is_string($sha)||!preg_match('/^[a-f0-9]{40}$/D',$sha))throw new RuntimeException('Invalid GitHub commit identity.');
    $f=df_api('contents/loader.php?ref='.$sha,$token);
    if(($f['encoding']??'')!=='base64'||!is_string($f['content']??null))throw new RuntimeException('This commit has no supported loader.php. Use the console development branch until it is merged.');
    $source=base64_decode(str_replace(["\r","\n"],'',$f['content']),true);
    if($source===false||!hash_equals((string)($f['sha']??''),sha1('blob '.strlen($source)."\0".$source)))throw new RuntimeException('GitHub file identity check failed.');
    $p=df_project($source);$checks=df_checks($sha,$token);
    return ['sha'=>$sha,'branch'=>$branch,'message'=>substr((string)($c['commit']['message']??''),0,600),'commit_date'=>$c['commit']['committer']['date']??'', 'checked_at'=>gmdate(DATE_ATOM),'loader_sha256'=>hash('sha256',$source),'project'=>$p,'checks'=>$checks];
}
function df_package(string $zipfile): array {
    if(!class_exists('ZipArchive'))throw new RuntimeException('Enable PHP ZipArchive in cPanel.');
    $z=new ZipArchive();if($z->open($zipfile,ZipArchive::RDONLY)!==true)throw new RuntimeException('Invalid ZIP archive.');$files=[];$seen=[];$top=null;$expanded=0;
    try {
        if($z->numFiles>3000)throw new RuntimeException('Archive contains too many entries.');
        for($i=0;$i<$z->numFiles;$i++){
            $s=$z->statIndex($i);if(!$s)throw new RuntimeException('Unreadable archive entry.');$name=$s['name'];
            if(str_contains($name,'\\')||str_starts_with($name,'/')||preg_match('~[\x00-\x1f\x7f]~',$name))throw new RuntimeException('Unsafe archive entry.');
            $parts=explode('/',rtrim($name,'/'));foreach($parts as $part)if($part===''||$part==='.'||$part==='..'||str_contains($part,':'))throw new RuntimeException('Unsafe archive entry.');
            if($top===null)$top=$parts[0];if($parts[0]!==$top)throw new RuntimeException('Multiple archive roots.');
            $opsys=0;$attr=0;$z->getExternalAttributesIndex($i,$opsys,$attr);$type=($attr>>16)&0170000;
            if($type!==0&&$type!==0100000&&$type!==0040000)throw new RuntimeException('Links/special files are not accepted in packages.');
            if(str_ends_with($name,'/'))continue;
            $expanded+=(int)$s['size'];if($expanded>DF_MAX_EXPANDED||(int)$s['size']>DF_MAX_FILE)throw new RuntimeException('Package exceeds extraction limits.');
            $rel=implode('/',array_slice($parts,1));
            // Repository-only dotfiles, docs and tests are NOT deployed into the website.
            if($rel!=='loader.php'&&!str_starts_with($rel,'web/'))continue;
            $target=df_target($rel);if($target===null)continue;$key=strtolower($target);if(isset($seen[$key]))throw new RuntimeException('Duplicate package target.');$seen[$key]=true;
            $bytes=$z->getFromIndex($i,DF_MAX_FILE+1);if($bytes===false||strlen($bytes)!==(int)$s['size'])throw new RuntimeException('Incomplete archive entry.');
            if(str_ends_with($target,'.php'))token_get_all($bytes,TOKEN_PARSE);
            $files[$target]=$bytes;
        }
    } finally {$z->close();}
    if(!isset($files['loader.php']))throw new RuntimeException('This snapshot has no loader.php; nothing was installed.');df_project($files['loader.php']);
    if(count($files)>500)throw new RuntimeException('Too many deployable files.');ksort($files,SORT_STRING);return $files;
}
function df_assert_existing(string $root,array $managed,array $incoming): void {
    foreach(array_unique(array_merge(array_keys($managed),array_keys($incoming))) as $rel){$p=df_no_links($root,(string)$rel);
        if(is_dir($p))throw new RuntimeException('File/directory conflict: '.$rel);
        if(isset($managed[$rel])){if(!is_file($p)||!hash_equals((string)$managed[$rel],hash_file('sha256',$p)))throw new RuntimeException('A managed file changed locally; preserving it: '.$rel);}
        elseif(file_exists($p)&&$rel!=='loader.php')throw new RuntimeException('Unmanaged file would be overwritten; preserving it: '.$rel);
    }
}
function df_replace(string $root,string $dir,string $rel,?string $bytes): void {
    $target=df_no_links($root,$rel);
    if($bytes===null){if(is_file($target)&&!unlink($target))throw new RuntimeException('Cannot remove obsolete managed file.');return;}
    df_mkdir(dirname($target),0755);df_no_links($root,$rel);
    $tmp=$dir.'/activate-'.bin2hex(random_bytes(8));
    try {df_write($tmp,$bytes);chmod($tmp,0644);if(!rename($tmp,$target))throw new RuntimeException('Activation failed; private storage and website must share a filesystem.');if(function_exists('opcache_invalidate'))@opcache_invalidate($target,true);} finally {if(is_file($tmp))unlink($tmp);}
}
function df_restore(string $root,string $dir,array $journal): void {
    if(($journal['root']??'')!==realpath($root)||!preg_match('/^[a-f0-9]{24}$/D',(string)($journal['id']??'')))throw new RuntimeException('Invalid recovery journal.');
    foreach($journal['before'] as $rel=>$hash){df_owned_path((string)$rel);$bytes=null;
        if($hash!==null){$path=$dir.'/backups/'.$journal['id'].'/'.hash('sha256',$rel);$bytes=@file_get_contents($path);if($bytes===false||!hash_equals($hash,hash('sha256',$bytes)))throw new RuntimeException('Backup identity mismatch.');}
        df_replace($root,$dir,(string)$rel,$bytes);
    }
    df_save($dir.'/state.json',$journal['old_state']);
}
function df_activate(string $root,string $dir,array $files,array $meta,?callable $hook=null): array {
    $state=df_read($dir.'/state.json');$managed=$state['managed']??[];
    if(is_file($dir.'/journal.json'))throw new RuntimeException('Interrupted update requires recovery first.');
    df_assert_existing($root,$managed,$files);$id=bin2hex(random_bytes(12));$backup=$dir.'/backups/'.$id;df_mkdir($backup);$before=[];
    foreach(array_unique(array_merge(array_keys($managed),array_keys($files))) as $rel){$p=df_no_links($root,$rel);$before[$rel]=is_file($p)?hash_file('sha256',$p):null;if($before[$rel]!==null)df_write($backup.'/'.hash('sha256',$rel),(string)file_get_contents($p));}
    $j=['id'=>$id,'root'=>realpath($root),'old_state'=>$state,'before'=>$before];df_save($dir.'/journal.json',$j);
    try {
        // Activate the console last. Multi-file app deployment is recoverable, not globally atomic.
        $order=array_values(array_diff(array_keys($before),['loader.php']));$order[]='loader.php';
        foreach($order as $i=>$rel){df_replace($root,$dir,$rel,$files[$rel]??null);if($hook!==null)$hook($rel,$i);}
        $new=['repository'=>DF_REPO,'sha'=>$meta['sha'],'branch'=>$meta['branch'],'deployed_at'=>gmdate(DATE_ATOM),'archive_sha256'=>$meta['archive_sha256']??'', 'managed'=>array_map(static fn($b)=>hash('sha256',$b),$files),'previous_backup'=>$id];
        df_save($dir.'/state.json',$new);df_save($dir.'/rollback.json',$j);unlink($dir.'/journal.json');return $new;
    } catch(Throwable $e){try{df_restore($root,$dir,$j);unlink($dir.'/journal.json');}catch(Throwable $r){throw new RuntimeException('Update interrupted; recovery required. Backups are retained.');}throw new RuntimeException('Update failed and the previous files were restored: '.$e->getMessage());}
}
function df_install(string $root,string $dir,array $pending,string $token,bool $preview): array {
    if(!preg_match('/^[a-f0-9]{40}$/D',(string)($pending['sha']??''))||time()-strtotime((string)($pending['checked_at']??''))>600)throw new RuntimeException('Check GitHub again; the selection expired.');
    if(($pending['branch']??'')!=='main'&&!$preview)throw new RuntimeException('Explicitly acknowledge the experimental branch before installation.');
    if(!df_checks($pending['sha'],$token)['ok'])throw new RuntimeException('Required checks are missing, pending or failing on this exact commit.');
    $r=df_http('https://api.github.com/repos/'.DF_REPO.'/zipball/'.$pending['sha'],$token);
    if($r['status']===302){$r=df_http($r['location']);} // Never forward the API token to codeload.
    if($r['status']!==200||!str_starts_with($r['body'],'PK'))throw new RuntimeException('GitHub did not return a valid archive.');
    $tmp=$dir.'/archive-'.bin2hex(random_bytes(8)).'.zip';
    try{df_write($tmp,$r['body']);$files=df_package($tmp);if(!hash_equals($pending['loader_sha256'],hash('sha256',$files['loader.php'])))throw new RuntimeException('Archive loader differs from the checked commit.');$pending['archive_sha256']=hash('sha256',$r['body']);return df_activate($root,$dir,$files,$pending);}finally{if(is_file($tmp))unlink($tmp);}
}
function df_log(string $dir,string $message): void {
    $p=$dir.'/events.json';$a=df_read($p);$a[]= ['at'=>gmdate(DATE_ATOM),'message'=>substr($message,0,1000)];df_save($p,array_slice($a,-50));
}
function df_gate(array &$session,string $method,array $post): string {
    if($method!=='POST')return '';
    if(!is_string($post['csrf']??null)||!hash_equals((string)($session['csrf']??''),$post['csrf'])||empty($session['csrf']))throw new RuntimeException('The form expired. Refresh the page and retry.');
    if(!is_string($post['action']??null))throw new RuntimeException('Invalid action.');return $post['action'];
}
function df_https(): bool {return (!empty($_SERVER['HTTPS'])&&$_SERVER['HTTPS']!=='off');}

if(defined('DF_LIBRARY_ONLY')&&DF_LIBRARY_ONLY)return;
@set_time_limit(180);
header('Content-Type: text/html; charset=UTF-8');header('X-Content-Type-Options: nosniff');header('X-Frame-Options: DENY');header('Referrer-Policy: no-referrer');header('Cache-Control: no-store, max-age=0');header('Permissions-Policy: camera=(), microphone=(), geolocation=()');
header("Content-Security-Policy: default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'");
ini_set('display_errors','0');ini_set('session.use_strict_mode','1');ini_set('session.use_only_cookies','1');
session_name('dfconsole_'.substr(hash('sha256',__DIR__),0,12));session_set_cookie_params(['lifetime'=>0,'path'=>'/','secure'=>df_https(),'httponly'=>true,'samesite'=>'Strict']);session_start();
$_SESSION['csrf']??=bin2hex(random_bytes(32));$error='';$notice=(string)($_SESSION['flash']??'');unset($_SESSION['flash']);$dir='';$config=[];$state=[];$latest=[];$events=[];$setup=false;$auth=false;$p=df_project((string)file_get_contents(__FILE__));$live=false;
try{
    $private=df_safe_private(DF_PRIVATE_ROOT,(string)($_SERVER['DOCUMENT_ROOT']??__DIR__));
    $dir=$private.'/site-'.substr(hash('sha256',(string)realpath(__DIR__)),0,16);df_mkdir($dir);
    $config=df_read($dir.'/config.json');$setup=$config===[];
    if(!empty($_SESSION['auth_at'])&&time()-(int)($_SESSION['last_seen']??0)<1800&&hash_equals((string)($_SESSION['auth_binding']??''),hash('sha256',(string)($config['password_hash']??'')))){$auth=true;$_SESSION['last_seen']=time();}
    $action=df_gate($_SESSION,(string)($_SERVER['REQUEST_METHOD']??'GET'),$_POST);
    if($action!==''&&!df_https())throw new RuntimeException('Open this page over HTTPS before submitting credentials or changes.');
    if($action!==''){
        $lock=df_lock($dir);
        try{
            $config=df_read($dir.'/config.json');$setup=$config===[];
            if(in_array($action,['setup','login'],true)){
                $rate=df_read($dir.'/attempts.json');if((int)($rate['until']??0)>time())throw new RuntimeException('Too many attempts. Retry after five minutes.');
                $pass=$_POST['password']??'';if(!is_string($pass)||strlen($pass)>1024)throw new RuntimeException('Invalid password.');
                $valid=false;
                if($action==='setup'&&$setup){$code=df_secret($private.'/setup_code');$entered=$_POST['setup_code']??'';$valid=strlen($code)>=32&&is_string($entered)&&hash_equals($code,$entered);}
                elseif($action==='login'&&!$setup)$valid=password_verify($pass,(string)$config['password_hash']);
                if(!$valid){$n=(int)($rate['failures']??0)+1;df_save($dir.'/attempts.json',['failures'=>$n,'until'=>$n>=5?time()+300:0]);throw new RuntimeException('Authentication failed.');}
                if($setup){if(strlen($pass)<14)throw new RuntimeException('Use an admin password of at least 14 characters.');$token=$_POST['github_token']??'';if(!is_string($token)||strlen($token)<15||preg_match('/\s/',$token))throw new RuntimeException('Enter a repository-read GitHub token.');
                    df_write($dir.'/github_token',$token);$config=['password_hash'=>password_hash($pass,PASSWORD_DEFAULT)];df_save($dir.'/config.json',$config);@unlink($private.'/setup_code');$setup=false;}
                df_save($dir.'/attempts.json',[]);session_regenerate_id(true);$_SESSION['auth_at']=time();$_SESSION['last_seen']=time();$_SESSION['auth_binding']=hash('sha256',$config['password_hash']);$_SESSION['csrf']=bin2hex(random_bytes(32));$auth=true;$notice='Signed in. Check GitHub to select an exact update.';
            }elseif(!$auth)throw new RuntimeException('Sign in before using project controls.');
            elseif($action==='logout'){$_SESSION=[];session_regenerate_id(true);$_SESSION['csrf']=bin2hex(random_bytes(32));$auth=false;}
            elseif($action==='check'){$branch=df_branch((string)($_POST['branch']??'main'));$latest=df_remote($branch,df_secret($dir.'/github_token'));df_save($dir.'/pending.json',$latest);$live=true;$notice='GitHub checked. The selected commit is pinned for ten minutes.';df_log($dir,'Checked '.$branch.' at '.$latest['sha']);}
            elseif($action==='install'){$latest=df_read($dir.'/pending.json');$state=df_install(__DIR__,$dir,$latest,df_secret($dir.'/github_token'),isset($_POST['preview']));df_log($dir,'Installed '.$state['sha'].' from '.$state['branch']);$notice='Update installed. Refresh this page to run the newly installed console.';}
            elseif($action==='recover'){df_restore(__DIR__,$dir,df_read($dir.'/journal.json'));unlink($dir.'/journal.json');df_log($dir,'Recovered interrupted update from its private journal.');$notice='Previous files restored.';}
            elseif($action==='rollback'){$st=df_read($dir.'/state.json');if(empty($st['managed']))throw new RuntimeException('No managed deployment to roll back.');df_assert_existing(__DIR__,$st['managed'],[]);$j=df_read($dir.'/rollback.json');if(!$j)throw new RuntimeException('No previous deployment backup.');df_save($dir.'/journal.json',$j);df_restore(__DIR__,$dir,$j);unlink($dir.'/journal.json');unlink($dir.'/rollback.json');df_log($dir,'Rolled back the most recent deployment.');$notice='Previous deployment restored. Refresh the page.';}
            elseif($action==='token'){$t=$_POST['github_token']??'';if(!is_string($t)||strlen($t)<15||preg_match('/\s/',$t))throw new RuntimeException('Invalid token.');df_write($dir.'/github_token',$t);if(is_file($dir.'/pending.json'))unlink($dir.'/pending.json');$notice='Private token replaced. Check GitHub again.';}
            elseif($action==='report'){$data=['console_version'=>DF_VERSION,'state'=>df_read($dir.'/state.json'),'last_check'=>df_read($dir.'/pending.json'),'events'=>df_read($dir.'/events.json')];header('Content-Type: application/json');header('Content-Disposition: attachment; filename="deterministicface-report.json"');echo json_encode($data,JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES);exit;}
            else throw new RuntimeException('Unknown action.');
        }finally{df_unlock($lock);}
        $_SESSION['flash']=$notice;header('Location: '.rawurlencode(basename(__FILE__)),true,303);exit;
    }
    if($auth){$state=df_read($dir.'/state.json');$latest=$latest?:df_read($dir.'/pending.json');$events=df_read($dir.'/events.json');if(!empty($latest['project']))$p=$latest['project'];}
}catch(Throwable $e){$error=$e->getMessage();if(!$auth)http_response_code(503);}
$csrf=(string)$_SESSION['csrf'];$complete=count(array_filter($p['milestones'],static fn($m)=>$m['status']==='complete'));$total=count($p['milestones']);
$branch=(string)($latest['branch']??'main');$pendingFresh=!empty($latest['sha'])&&time()-strtotime((string)($latest['checked_at']??''))<=600;$canInstall=$pendingFresh&&!empty($latest['checks']['ok'])&&!is_file($dir.'/journal.json');
function df_form(string $action,string $csrf,string $label,string $extra=''): void {echo '<form method="post"><input type="hidden" name="csrf" value="'.df_h($csrf).'"><input type="hidden" name="action" value="'.df_h($action).'">'.$extra.'<button>'.df_h($label).'</button></form>';}
?>
<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>DeterministicFace · Project console</title>
<style>
:root{color-scheme:dark;--bg:#080d0d;--panel:#111a1a;--line:#273636;--text:#eef7f4;--muted:#a3b8b3;--green:#77ebae;--amber:#ffd081;--red:#ffa2a2}*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font:16px/1.65 system-ui,sans-serif}a{color:var(--green);overflow-wrap:anywhere}.wrap{max-width:1120px;margin:auto;padding:28px 20px 70px}header{padding:35px 0 26px;border-bottom:1px solid var(--line)}.eyebrow{color:var(--green);font-size:12px;letter-spacing:.12em;text-transform:uppercase}h1{font-size:clamp(32px,6vw,60px);letter-spacing:-.045em;line-height:1.08;margin:12px 0}h2{margin:0 0 12px;font-size:25px}h3{margin:0 0 6px;font-size:18px}p{margin:8px 0 14px}.muted,small{color:var(--muted)}.grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.card{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:22px;margin-top:18px;min-width:0}.label{font-size:12px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted)}.value{font-size:21px;font-weight:700}.notice{padding:15px;border:1px solid var(--green);border-radius:10px;margin:18px 0}.error{border-color:var(--red);color:var(--red)}.warning{color:var(--amber)}code{font:13px/1.5 ui-monospace,monospace;overflow-wrap:anywhere;white-space:normal}input[type=password],input[type=text],select{display:block;max-width:100%;width:100%;background:var(--bg);border:1px solid #4b6460;color:var(--text);border-radius:8px;padding:12px;font:inherit;margin:6px 0 13px}label{display:block}button,.button{display:inline-block;background:var(--green);color:#082015;padding:11px 17px;border:0;border-radius:8px;font:700 14px system-ui;cursor:pointer;text-decoration:none}button:disabled{opacity:.4;cursor:not-allowed}form{margin:10px 0}.actions{display:flex;gap:12px;align-items:center;flex-wrap:wrap}.pill{display:inline-block;border:1px solid var(--line);padding:3px 10px;border-radius:99px;font-size:12px;white-space:nowrap}.complete{color:var(--green)}.in_review,.in_progress{color:var(--amber)}.not_started{color:var(--muted)}.blocked{color:var(--red)}.mile{display:grid;grid-template-columns:85px 1fr auto;gap:14px;align-items:start;padding:17px 0;border-bottom:1px solid var(--line)}.mile:last-child{border-bottom:0}.log{max-height:340px;overflow:auto;font:12px/1.7 ui-monospace,monospace}.log p{border-bottom:1px solid var(--line);padding-bottom:8px}.progress{height:7px;background:#233633;border-radius:9px;margin-top:12px}.progress>span{display:block;background:var(--green);height:7px;border-radius:9px}details{margin-top:16px}summary{cursor:pointer;font-weight:700}footer{margin-top:32px;color:var(--muted);font-size:13px}nav{display:flex;gap:16px;flex-wrap:wrap;font-size:14px;margin:18px 0}.check{display:flex;align-items:flex-start;gap:8px;font-size:14px}.check input{margin-top:6px}.source{font-size:13px;color:var(--muted)}@media(max-width:700px){.grid,.stats{grid-template-columns:1fr}.mile{grid-template-columns:65px 1fr}.mile>.pill{grid-column:2}.wrap{padding:18px 14px 45px}.card{padding:18px}}@media print{body{background:white;color:black}form,nav,.actions{display:none}.card{background:white;border-color:#999}.muted,small{color:#333}}
</style></head><body><main class="wrap"><header><div class="eyebrow">Black Cat research · owner console</div><h1>DeterministicFace</h1><p class="muted">One working key. One reproducible face and background.</p><span class="pill">Console <?=df_h(DF_VERSION)?></span> <span class="pill warning">Research — no working portrait engine yet</span></header>
<?php if($error!==''):?><div class="notice error" role="alert"><?=df_h($error)?></div><?php endif;?>
<?php if($notice!==''):?><div class="notice" role="status"><?=df_h($notice)?></div><?php endif;?>
<?php if(!$auth):?>
<div class="card"><h2><?=$setup?'Initial owner setup':'Owner sign-in'?></h2><p>Updates and private project details require authentication. No GitHub credential is included in this PHP file.</p>
<?php if($dir===''):?><p>Create <code><?=df_h(DF_PRIVATE_ROOT)?></code> outside the website with permissions <code>0700</code>, and put a random setup code (32 or more characters) in <code>setup_code</code> with permissions <code>0600</code>. Then reload. Do not place secrets in the public website folder.</p><?php else:?>
<form method="post"><input type="hidden" name="csrf" value="<?=df_h($csrf)?>"><input type="hidden" name="action" value="<?=$setup?'setup':'login'?>">
<?php if($setup):?><p>The setup code must already exist in the private directory. Setup is not open to the first anonymous visitor.</p><label>One-time setup code<input type="password" name="setup_code" autocomplete="off" required></label><?php endif;?>
<label><?=$setup?'Choose admin password (at least 14 characters)':'Admin password'?><input type="password" name="password" autocomplete="<?=$setup?'new-password':'current-password'?>" required></label>
<?php if($setup):?><label>GitHub repository-read token<input type="password" name="github_token" autocomplete="off" required></label><p class="source">Fine-grained access: this repository only; Contents read, Checks read, Metadata read. Do not paste an OpenAI API key.</p><?php endif;?>
<button <?=$error!==''&&$dir===''?'disabled':''?>><?=$setup?'Create owner access':'Sign in'?></button></form><?php endif;?></div>
<?php else:?>
<nav><a href="#updates">Updates</a><a href="#progress">Progress</a><a href="#scope">Scope</a><a href="#decisions">Approved decisions</a><a href="#credits">Credits</a></nav>
<div class="stats"><div class="card"><div class="label">Installed commit</div><div class="value"><code><?=df_h(substr((string)($state['sha']??'Not installed through loader'),0,40))?></code></div><small><?=df_h($state['deployed_at']??'Bootstrap file only; no deployment recorded')?></small></div><div class="card"><div class="label">Last checked GitHub commit</div><div class="value"><code><?=df_h(substr((string)($latest['sha']??'Not checked'),0,40))?></code></div><small><?=df_h($latest['checked_at']??'Use Check GitHub below')?></small></div><div class="card"><div class="label">Completed milestones</div><div class="value"><?=$complete?> / <?=$total?></div><small>Accepted direction is not completed engineering.</small><div class="progress"><span style="width:<?=$total?round(100*$complete/$total):0?>%"></span></div></div></div>
<section id="updates" class="card"><h2>Check, then install the exact update</h2><p class="source">Repository <a href="https://github.com/<?=df_h(DF_REPO)?>" rel="noreferrer"><?=df_h(DF_REPO)?></a>. Main is the normal channel. Other branches are explicitly experimental. No automatic merge or deployment.</p>
<form method="post"><input type="hidden" name="csrf" value="<?=df_h($csrf)?>"><input type="hidden" name="action" value="check"><label>Branch<input type="text" name="branch" value="<?=df_h($branch)?>" required></label><p class="source">Initial console preview branch: <code><?=df_h(DF_PREVIEW_BRANCH)?></code>. Main may not contain the console until review and merge.</p><button>Check GitHub and refresh project status</button></form>
<?php if($latest):?><p><b>Selected:</b> <code><?=df_h($latest['sha']??'')?></code> on <code><?=df_h($branch)?></code><br><span class="muted"><?=df_h($latest['message']??'')?></span></p><p>Required checks: <?php foreach(DF_REQUIRED_CHECKS as $check):?><span class="pill <?=!empty($latest['checks']['states'][$check])?'complete':'warning'?>"><?=df_h($check)?>: <?=!empty($latest['checks']['states'][$check])?'passed':'not passed / missing'?></span> <?php endforeach;?></p><p class="source">Checks are checked again at install time. A passing check is not human approval or portrait-security evidence.</p>
<form method="post"><input type="hidden" name="csrf" value="<?=df_h($csrf)?>"><input type="hidden" name="action" value="install"><?php if($branch!=='main'):?><label class="check"><input type="checkbox" name="preview" value="yes" required><span>I am deliberately installing this experimental branch. It is not an approved release.</span></label><?php endif;?><p><button <?=$canInstall?'':'disabled'?>>Install this checked commit</button></p><?php if(!$pendingFresh):?><small>Check again to refresh the ten-minute selection.</small><?php endif;?></form><?php endif;?>
<p class="source">The updater installs <code>loader.php</code> and repository <code>web/</code> files into <code>app/</code>. It does not publish the entire private repository. Unmanaged files, credentials, configuration and backups are preserved. Multi-file activation is recoverable, not a zero-downtime atomic app release.</p>
<div class="actions"><?php if(is_file($dir.'/journal.json'))df_form('recover',$csrf,'Recover interrupted update');elseif(is_file($dir.'/rollback.json'))df_form('rollback',$csrf,'Roll back last deployment');df_form('report',$csrf,'Download diagnostic report');?></div>
</section>
<section id="progress" class="card"><div class="eyebrow"><?=df_h($p['phase'])?></div><h2>Project progress</h2><p class="source"><?php if($latest):?><?=$live?'Fetched from GitHub in this request.':'Last successfully checked GitHub snapshot — not a live claim.'?> Commit <code><?=df_h($latest['sha']??'')?></code> · <?=df_h($latest['checked_at']??'')?>.<?php else:?>Bundled plan in the uploaded file; GitHub freshness has not been checked.<?php endif;?> Plan revision <?=df_h($p['version'])?>.</p>
<?php foreach($p['milestones'] as $m):?><div class="mile"><code><?=df_h($m['id'])?></code><div><h3><?=df_h($m['title'])?></h3><small><?=df_h($m['evidence'])?></small></div><span class="pill <?=df_h($m['status'])?>"><?=df_h(str_replace('_',' ',$m['status']))?></span></div><?php endforeach;?></section>
<section id="scope" class="card"><h2>Locked project scope</h2><p><?=df_h($p['summary'])?></p><?php foreach($p['scope'] as $s):?><p><?=df_h($s)?></p><?php endforeach;?></section>
<section id="decisions" class="card"><h2>Your approved direction</h2><?php foreach($p['decisions'] as $d):?><details><summary><?=df_h($d['title'])?></summary><p class="muted"><?=df_h($d['text'])?></p></details><?php endforeach;?></section>
<div class="grid"><section class="card"><h2>Deployment events</h2><div class="log"><?php if(!$events):?><p>No deployment events recorded.</p><?php endif;foreach(array_reverse($events) as $e):?><p><?=df_h($e['at'])?><br><?=df_h($e['message'])?></p><?php endforeach;?></div></section><section class="card"><h2>What remains unverified</h2><p>Hosting on your cPanel server, independent review, real-key integration, portrait generation, portable exact pixels and perceptual security are separate milestones.</p><p>Updating this page does not complete those milestones. No GPU service or new droplet is provisioned by this console.</p><details><summary>Replace GitHub credential</summary><form method="post"><input type="hidden" name="csrf" value="<?=df_h($csrf)?>"><input type="hidden" name="action" value="token"><label>New repository-read token<input type="password" name="github_token" autocomplete="off" required></label><button>Save privately</button></form></details></section></div>
<section id="credits" class="card"><h2>Prior work and direct credit</h2><?php foreach($p['references'] as $r):?><p><b><?=df_h($r['name'])?></b><br><span class="muted"><?=df_h($r['work'])?></span><?php if(preg_match('~^https://[^\s]+$~D',(string)$r['url'])):?><br><a href="<?=df_h($r['url'])?>" rel="noreferrer">Source</a><?php endif;?></p><?php endforeach;?></section>
<section class="card"><h2>Decision history</h2><?php foreach(array_reverse($p['history']) as $e):?><p><b><?=df_h($e['date'])?></b> · <?=df_h($e['text'])?></p><?php endforeach;?></section>
<div class="actions"><?php df_form('logout',$csrf,'Sign out');?></div>
<?php endif;?>
<footer>DeterministicFace · Single-file project console. Credentials never appear in the page, source links or diagnostic report. Project status is explicitly separated from installed-code status.</footer></main></body></html>
