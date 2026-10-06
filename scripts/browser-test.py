"""Real browser tests of the actual served demo. Does not use real credentials."""
from playwright.sync_api import sync_playwright
from pathlib import Path
import json,sys,time,os,shutil
REPORTS=Path(os.environ.get('DF_REPORT_DIR','reports')); REPORTS.mkdir(parents=True,exist_ok=True)
base=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8000'
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,args=['--no-sandbox'],executable_path=os.environ.get('DF_CHROMIUM') or shutil.which('chromium'))
    page=browser.new_page(viewport={'width':1440,'height':1100},device_scale_factor=1)
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto(base,wait_until='networkidle')
    page.locator('#pixel-hash').filter(has_text='Waiting').wait_for(state='hidden',timeout=30000)
    page.screenshot(path=str(REPORTS/'desktop.png'),full_page=True)
    initial=page.locator('#pixel-hash').inner_text()
    page.click('#repeat');page.wait_for_function("document.querySelector('#status').textContent.includes('all 1,048,576')",timeout=30000)
    assert initial==page.locator('#pixel-hash').inner_text()
    print('PASS same-key regeneration')
    page.click('#flip');page.locator('#comparison-card').wait_for(state='visible',timeout=30000)
    assert initial!=page.locator('#comparison-hash').inner_text()
    print('PASS one-bit comparison')
    page.click('#close-compare')
    page.click('#new-key');page.wait_for_function("document.querySelector('#pixel-hash').textContent !== '"+initial+"'",timeout=30000)
    with page.expect_download() as download:
        page.click('#download')
    assert download.value.suggested_filename=='key-portrait.png'
    page.click('#gallery-button')
    page.wait_for_function("document.querySelectorAll('.gallery-item').length === 12",timeout=60000)
    page.click('.gallery-item:nth-child(2)')
    page.wait_for_function("document.querySelector('#status').textContent.startsWith('Portrait generated')",timeout=30000)
    print('PASS new key, PNG download, generated gallery')
    page.click('[data-tab="verify"]');page.click('#sign')
    page.wait_for_function("document.querySelector('#signature-result').textContent.startsWith('PASS')",timeout=30000)
    before=page.locator('#verify-key').inner_text();pixels=page.locator('#verify-pixels').inner_text()
    page.fill('#signed-message','Changed after signing');page.click('#verify-same')
    page.wait_for_function("document.querySelector('#signature-result').textContent.startsWith('FAIL')",timeout=30000)
    assert before==page.locator('#verify-key').inner_text()
    assert pixels==page.locator('#verify-pixels').inner_text()
    page.click('#verify-wrong');page.wait_for_function("document.querySelector('#verify-key').textContent !== '"+before+"'",timeout=30000)
    assert page.locator('#signature-result').inner_text().startswith('FAIL')
    print('PASS actual key, tampered message, wrong key')
    page.click('[data-tab="project"]')
    report=page.evaluate('DFDemo.runSelfTests()')
    assert report['passed']==report['total'],report
    print('PASS browser self-tests:',report['passed'])
    page.click('[data-tab="lab"]')
    page.set_viewport_size({'width':390,'height':844})
    page.screenshot(path=str(REPORTS/'mobile.png'),full_page=True)
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), 'Horizontal overflow'
    print('PASS mobile layout')
    page.set_viewport_size({'width':1440,'height':1100})
    assert not errors,errors
    # Validate the independently usable generated HTML in the same real browser.
    portable=Path('dist/DeterministicFace-demo.html').resolve()
    if portable.exists():
        page.goto(portable.as_uri(),wait_until='load')
        page.wait_for_function("document.querySelector('#pixel-hash').textContent.length === 64",timeout=30000)
        portable_report=page.evaluate('DFDemo.runSelfTests()')
        assert portable_report['passed']==portable_report['total'],portable_report
        print('PASS portable HTML:',portable_report['passed'],'self-tests')
    assert not errors,errors
    browser.close()
(REPORTS/'browser-tests.json').write_text(json.dumps(report,indent=2))
print('Browser test finished.')
