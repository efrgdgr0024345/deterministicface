<?php
declare(strict_types=1);
define('DF_LIBRARY_ONLY',true);
require dirname(__DIR__).'/loader.php';
$n=0;$skip=0;
function ok(bool $x,string $name): void {global $n;$n++;if(!$x)throw new RuntimeException('FAIL '.$name);echo 'PASS '.$name."\n";}
function no(callable $fn,string $name): void {try{$fn();}catch(Throwable $e){ok(true,$name);return;}ok(false,$name);}
function rmtest(string $p): void {if(is_link($p)||is_file($p)){unlink($p);return;}if(is_dir($p)){foreach(scandir($p) as $n)if($n!=='.'&&$n!=='..')rmtest($p.'/'.$n);rmdir($p);}}
$base=sys_get_temp_dir().'/df-test-'.bin2hex(random_bytes(8));df_mkdir($base);$root=$base.'/public';$dir=$base.'/private';df_mkdir($root);df_mkdir($dir);
try {
    $source=(string)file_get_contents(dirname(__DIR__).'/loader.php');$p=df_project($source);
    ok($p['schema']===1&&count($p['decisions'])===9,'embedded agreed scope is present');
    ok(count(array_filter($p['milestones'],fn($m)=>$m['status']==='complete'))===0,'tooling does not claim completed portrait milestones');
    no(fn()=>df_project('<?php echo 1;'),'missing project data rejected');
    no(fn()=>df_project(str_replace('"schema": 1','"schema": 2',$source)),'unknown data schema rejected');
    no(fn()=>df_project(str_replace('"status":"in_review"','"status":"fake"',$source)),'invalid progress status rejected');
    ok(df_branch('feat/df-001')==='feat/df-001','branch with slash accepted');
    foreach(['../main','a..b','/main','a//b','a b','a.lock','x?y',''] as $bad)no(fn()=>df_branch($bad),'reject branch '.json_encode($bad));
    foreach(['../x','/x','a/../b','a//b','a/./b','a\\b','C:x',"a\0b",'.env','x/.env'] as $bad)no(fn()=>df_path($bad),'reject path '.json_encode($bad));
    ok(df_target('loader.php')==='loader.php','self-update allowed');
    ok(df_target('web/assets/main.js')==='app/assets/main.js','only explicit web bundle mapped');
    ok(df_target('docs/SYSTEM_DESIGN.md')===null,'private repository docs not deployed');
    no(fn()=>df_target('web/config.ini'),'unsupported web file refused');
    no(fn()=>df_owned_path('README.md'),'managed-state path cannot delete arbitrary root file');
    no(fn()=>df_http('http://api.github.com/x'),'plain HTTP rejected before network');
    no(fn()=>df_http('https://evil.example/x'),'foreign host rejected before network');
    no(fn()=>df_http('https://codeload.github.com/x','fake-test-token'),'API token never forwarded to archive host');
    no(fn()=>df_http('https://api.github.com:444/x'),'nonstandard port refused');
    no(fn()=>df_http('https://user@api.github.com/x'),'userinfo URL refused');
    $sess=['csrf'=>'fixed-test-csrf'];
    ok(df_gate($sess,'GET',['action'=>'install'])==='','GET cannot initiate update');
    no(function()use(&$sess){df_gate($sess,'POST',['action'=>'install']);},'POST without CSRF refused');
    no(function()use(&$sess){df_gate($sess,'POST',['action'=>'install','csrf'=>'wrong']);},'wrong CSRF refused');
    ok(df_gate($sess,'POST',['action'=>'check','csrf'=>'fixed-test-csrf'])==='check','valid POST gate');
    $sha=str_repeat('a',40);$runs=[];
    foreach(DF_REQUIRED_CHECKS as $name)$runs[]=['name'=>$name,'head_sha'=>$sha,'app'=>['slug'=>'github-actions'],'status'=>'completed','conclusion'=>'success'];
    ok(df_check_result(['total_count'=>2,'check_runs'=>$runs],$sha)['ok'],'exact-head required checks accepted');
    ok(!df_check_result(['total_count'=>0,'check_runs'=>[]],$sha)['ok'],'missing checks fail closed');
    $bad=$runs;$bad[0]['head_sha']=str_repeat('b',40);ok(!df_check_result(['total_count'=>2,'check_runs'=>$bad],$sha)['ok'],'other-commit check refused');
    $bad=$runs;$bad[0]['conclusion']='failure';ok(!df_check_result(['total_count'=>2,'check_runs'=>$bad],$sha)['ok'],'failed check refused');
    $bad=$runs;$bad[0]['status']='in_progress';ok(!df_check_result(['total_count'=>2,'check_runs'=>$bad],$sha)['ok'],'pending check refused');
    $bad=$runs;$bad[0]['app']['slug']='other';ok(!df_check_result(['total_count'=>2,'check_runs'=>$bad],$sha)['ok'],'unrecognised check provider refused');
    no(fn()=>df_check_result(['total_count'=>101],$sha),'incomplete check pagination fails closed');
    ok(df_safe_private($dir,$root)===realpath($dir),'outside-root private directory accepted');
    no(fn()=>df_safe_private($root,$root),'public root cannot hold credentials');
    df_mkdir($root.'/secret');no(fn()=>df_safe_private($root.'/secret',$root),'public subfolder cannot hold credentials');
    chmod($dir,0755);clearstatcache();no(fn()=>df_safe_private($dir,$root),'permissive private directory refused');chmod($dir,0700);
    df_write($dir.'/credential','only-a-fixture');ok(df_secret($dir.'/credential')==='only-a-fixture','credential in private mode accepted');
    chmod($dir.'/credential',0644);clearstatcache();no(fn()=>df_secret($dir.'/credential'),'world-readable credential refused');chmod($dir.'/credential',0600);
    df_write($root.'/loader.php','original');df_write($root.'/unrelated.txt','preserve');
    $meta=['sha'=>$sha,'branch'=>'main'];
    $state=df_activate($root,$dir,['loader.php'=>'first','app/old.txt'=>'old'],$meta);
    ok(file_get_contents($root.'/loader.php')==='first','first install activates loader');
    ok(file_get_contents($root.'/app/old.txt')==='old','web bundle installed');
    ok(file_get_contents($root.'/unrelated.txt')==='preserve','unmanaged local data preserved');
    ok($state['sha']===$sha&&$state['managed']['loader.php']===hash('sha256','first'),'state binds installed hash and commit');
    $state=df_activate($root,$dir,['loader.php'=>'second','app/new.txt'=>'new'],['sha'=>str_repeat('b',40),'branch'=>'main']);
    ok(!file_exists($root.'/app/old.txt')&&file_get_contents($root.'/app/new.txt')==='new','only obsolete managed file removed');
    df_restore($root,$dir,df_read($dir.'/rollback.json'));
    ok(file_get_contents($root.'/loader.php')==='first'&&file_exists($root.'/app/old.txt')&&!file_exists($root.'/app/new.txt'),'rollback restores overwritten and deleted files');
    ok(df_read($dir.'/state.json')['sha']===$sha,'rollback restores prior commit state');
    no(fn()=>df_activate($root,$dir,['loader.php'=>'broken','app/new.txt'=>'bad'],$meta,static function(){throw new RuntimeException('injected activation failure');}),'injected failure triggers restoration');
    ok(file_get_contents($root.'/loader.php')==='first'&&!file_exists($root.'/app/new.txt')&&!is_file($dir.'/journal.json'),'failed update leaves original deployment');
    df_write($root.'/app/old.txt','local-edit');no(fn()=>df_activate($root,$dir,['loader.php'=>'third'],$meta),'managed local modification blocks update');
    ok(file_get_contents($root.'/app/old.txt')==='local-edit','local edits are not destroyed');df_write($root.'/app/old.txt','old');
    df_write($root.'/app/user.txt','user-file');no(fn()=>df_activate($root,$dir,['loader.php'=>'third','app/user.txt'=>'overwrite'],$meta),'unmanaged destination collision blocked');
    ok(file_get_contents($root.'/loader.php')==='first','preflight collision causes no partial update');
    symlink($dir,$root.'/app/link');no(fn()=>df_activate($root,$dir,['loader.php'=>'third','app/link/test.txt'=>'escape'],$meta),'symlink ancestor blocked');unlink($root.'/app/link');
    $lock=df_lock($dir);no(fn()=>df_lock($dir),'parallel deployment lock enforced');df_unlock($lock);
    $journal=df_read($dir.'/rollback.json');$journal['root']='/elsewhere';no(fn()=>df_restore($root,$dir,$journal),'wrong-root recovery journal refused');
    df_save($dir.'/journal.json',['pending'=>true]);no(fn()=>df_activate($root,$dir,['loader.php'=>'third'],$meta),'interrupted transaction blocks new install');unlink($dir.'/journal.json');
    df_log($dir,'fixture event');ok(df_read($dir.'/events.json')[0]['message']==='fixture event','bounded structured log records event');
    if(class_exists('ZipArchive')){
        $mk=static function(array $entries)use($base):string{$f=$base.'/fixture-'.bin2hex(random_bytes(4)).'.zip';$z=new ZipArchive();$z->open($f,ZipArchive::CREATE);foreach($entries as $name=>$bytes)$z->addFromString($name,$bytes);$z->close();return $f;};
        $f=$mk(['root/loader.php'=>$source,'root/docs/private.md'=>'private','root/.github/x.yml'=>'private','root/web/index.html'=>'hello']);$files=df_package($f);ok(array_keys($files)===['app/index.html','loader.php'],'archive extracts allowlist only');
        no(fn()=>df_package($mk(['root/web/x.php'=>'<?php if (','root/loader.php'=>$source])),'invalid PHP blocks package');
        no(fn()=>df_package($mk(['root/../escape'=>'bad','root/loader.php'=>$source])),'archive traversal refused');
        no(fn()=>df_package($mk(['/root/escape'=>'bad','root/loader.php'=>$source])),'absolute archive path refused');
        no(fn()=>df_package($mk(['root/loader.php'=>$source,'other/web/x.txt'=>'bad'])),'multiple archive roots refused');
        no(fn()=>df_package($mk(['root/README.md'=>'no loader'])),'missing loader cannot create fake deployment');
        no(fn()=>df_package($mk(['root/loader.php'=>$source,'root/web/.env'=>'secret'])),'hidden web files refused');
        no(fn()=>df_package($mk(['root/loader.php'=>$source,'root/web/a.txt'=>'a','root/web/A.txt'=>'b'])),'case-insensitive destination collision refused');
        $f=$mk(['root/loader.php'=>$source,'root/web/link.txt'=>'target']);$z=new ZipArchive();$z->open($f);$z->setExternalAttributesName('root/web/link.txt',ZipArchive::OPSYS_UNIX,0120777<<16);$z->close();no(fn()=>df_package($f),'archive symlink refused');
        $f=$mk(['root/loader.php'=>$source,'root/web/large.txt'=>str_repeat('x',DF_MAX_FILE+1)]);no(fn()=>df_package($f),'oversize decompressed entry refused');
    }else{$skip=10;echo "SKIP 10 archive tests: PHP ZipArchive missing locally.\n";if(getenv('DF_REQUIRE_EXT')==='1')throw new RuntimeException('CI requires the real ZIP extension.');}
    echo "RESULT $n passed; $skip skipped.\n";
}finally{rmtest($base);}
