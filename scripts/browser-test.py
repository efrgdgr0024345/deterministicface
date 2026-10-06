"""Real browser tests of the actual served demo. Does not use real credentials."""
from playwright.sync_api import sync_playwright, expect
from pathlib import Path
import json,sys,os,shutil,re
REPORTS=Path(os.environ.get('DF_REPORT_DIR','reports')); REPORTS.mkdir(parents=True,exist_ok=True)
base=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8000'
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,args=['--no-sandbox'],executable_path=os.environ.get('DF_CHROMIUM') or shutil.which('chromium'))
    page=browser.new_page(viewport={'width':1440,'height':1100},device_scale_factor=1)
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto(base,wait_until='networkidle')
    expect(page.locator('#pixel-hash')).to_have_text(re.compile(r'^[a-f0-9]{64}$'),timeout=30000)
    page.screenshot(path=str(REPORTS/'desktop.png'),full_page=True)
    initial=page.locator('#pixel-hash').inner_text()
    page.click('#repeat')
    expect(page.locator('#status')).to_contain_text('all 1,048,576',timeout=30000)
    assert initial==page.locator('#pixel-hash').inner_text()
    print('PASS same-key regeneration')
    page.click('#flip');expect(page.locator('#comparison-card')).to_be_visible(timeout=30000)
    assert initial!=page.locator('#comparison-hash').inner_text()
    print('PASS one-bit comparison')
    page.click('#close-compare')
    page.click('#new-key');expect(page.locator('#pixel-hash')).not_to_have_text(initial,timeout=30000)
    with page.expect_download() as download:
        page.click('#download')
    assert download.value.suggested_filename=='key-portrait.png'
    page.click('#gallery-button')
    expect(page.locator('.gallery-item')).to_have_count(12,timeout=60000)
    page.click('.gallery-item:nth-child(2)')
    expect(page.locator('#status')).to_contain_text('Portrait generated',timeout=30000)
    print('PASS new key, PNG download, generated gallery')
    page.click('[data-tab="verify"]');page.click('#sign')
    expect(page.locator('#signature-result')).to_contain_text('PASS',timeout=30000)
    before=page.locator('#verify-key').inner_text();pixels=page.locator('#verify-pixels').inner_text()
    page.fill('#signed-message','Changed after signing');page.click('#verify-same')
    expect(page.locator('#signature-result')).to_contain_text('FAIL',timeout=30000)
    assert before==page.locator('#verify-key').inner_text()
    assert pixels==page.locator('#verify-pixels').inner_text()
    page.click('#verify-wrong');expect(page.locator('#verify-key')).not_to_have_text(before,timeout=30000)
    assert page.locator('#signature-result').inner_text().startswith('FAIL')
    print('PASS actual key, tampered message, wrong key')
    page.click('[data-tab="project"]')
    page.click('#self-test')
    expect(page.locator('#test-results')).to_contain_text('RESULT 9 / 9 passed.',timeout=30000)
    with page.expect_download() as download:
        page.click('#report')
    report=json.loads(Path(download.value.path()).read_text())
    assert report['passed']==report['total'],report
    print('PASS browser self-tests:',report['passed'])
    page.click('[data-tab="lab"]')
    page.set_viewport_size({'width':390,'height':844})
    page.screenshot(path=str(REPORTS/'mobile.png'),full_page=True)
    assert page.evaluate('() => document.documentElement.scrollWidth <= innerWidth'), 'Horizontal overflow'
    print('PASS mobile layout')
    page.set_viewport_size({'width':1440,'height':1100})
    assert not errors,errors
    # Validate the generated HTML through real controls, without disabling CSP.
    portable=Path('dist/DeterministicFace-demo.html').resolve()
    if portable.exists():
        page.goto(portable.as_uri(),wait_until='load')
        expect(page.locator('#pixel-hash')).to_have_text(re.compile(r'^[a-f0-9]{64}$'),timeout=30000)
        page.click('[data-tab="project"]');page.click('#self-test')
        expect(page.locator('#test-results')).to_contain_text('RESULT 9 / 9 passed.',timeout=30000)
        print('PASS portable HTML: 9 self-tests')
    assert not errors,errors
    browser.close()
(REPORTS/'browser-tests.json').write_text(json.dumps(report,indent=2))
print('Browser test finished.')
