"""Exercise review controls, races, corrupt fixtures and mobile layout in Chromium."""
from pathlib import Path
from playwright.sync_api import sync_playwright, expect
import os, shutil, sys, json

base = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8000'
reports = Path(os.environ.get('DF_REPORT_DIR', 'reports')); reports.mkdir(exist_ok=True)
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, executable_path=os.environ.get('DF_CHROMIUM') or shutil.which('chromium'), args=['--no-sandbox'])
    page = browser.new_page(viewport={'width':1440, 'height':1080})
    errors, requests = [], []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.on('request', lambda r: requests.append((r.url, r.method)))
    page.goto(base.rstrip('/') + '/modular/', wait_until='networkidle')
    expect(page.locator('#check')).to_be_enabled(timeout=30000)
    expect(page.locator('.sample')).to_have_count(6)
    page.click('#check')
    expect(page.locator('#result')).to_contain_text('all 1,048,576 RGBA bytes are identical')
    page.screenshot(path=str(reports/'modular-desktop.png'), full_page=True)
    page.select_option('#comparison', '8'); expect(page.locator('#check')).to_be_enabled()
    page.click('#check'); expect(page.locator('#result')).to_contain_text('0 / 262,144')
    page.select_option('#comparison', '1'); expect(page.locator('#check')).to_be_enabled()
    page.click('#check'); expect(page.locator('#result')).to_contain_text('Different public keys')
    assert page.locator('#left-key').inner_text() != page.locator('#right-key').inner_text()
    page.click('#same-key'); expect(page.locator('#check')).to_be_enabled()
    page.click('#check'); expect(page.locator('#result')).to_contain_text('0 / 262,144')
    # Rapid selections cannot attach an earlier key's pixels or receipt to the latest key.
    page.locator('.sample').nth(1).click(); page.locator('.sample').nth(2).click(); page.locator('.sample').nth(5).click()
    expect(page.locator('#left-title')).to_have_text('Test key 6 · gallery render')
    expect(page.locator('#same-key')).to_be_disabled()
    expect(page.locator('#check')).to_be_enabled()
    for index in range(6):
        page.locator('.sample').nth(index).click()
        expect(page.locator('#left-title')).to_have_text(f'Test key {index+1} · gallery render')
        expect(page.locator('#check')).to_be_enabled()
    page.locator('.sample').nth(1).click(); expect(page.locator('#check')).to_be_enabled()
    page.click('#check'); expect(page.locator('#result')).to_contain_text('0 / 262,144')
    page.select_option('#zoom', '4')
    assert page.locator('#left-image').evaluate('(image) => image.clientWidth') == 2048
    with page.expect_download() as download:
        page.click('#download')
    assert download.value.suggested_filename == 'modular-portrait.png'
    page.set_viewport_size({'width':390, 'height':844})
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), 'Horizontal page overflow'
    page.select_option('#zoom', 'fit')
    page.screenshot(path=str(reports/'modular-mobile.png'), full_page=True)
    assert page.evaluate('localStorage.length === 0 && sessionStorage.length === 0')
    assert page.context.cookies() == []
    assert all(method == 'GET' and (url.startswith(base.rstrip('/') + '/') or url.startswith('blob:' + base.rstrip('/') + '/')) for url, method in requests), requests
    assert not errors, errors
    # A broken PNG never retains a labelled portrait, checksum or download link.
    corrupt = browser.new_page()
    corrupt.route('**/modular/data/portrait-0.png', lambda route: route.fulfill(status=200, content_type='image/png', body=b'broken PNG'))
    corrupt.goto(base.rstrip('/') + '/modular/')
    expect(corrupt.locator('#status')).to_contain_text('PNG checksum mismatch', timeout=30000)
    expect(corrupt.locator('#check')).to_be_disabled()
    expect(corrupt.locator('#left-image')).to_be_hidden()
    expect(corrupt.locator('#left-hash')).to_have_text('—')
    assert corrupt.locator('#download').get_attribute('href') is None
    browser.close()
reports.joinpath('modular-browser-tests.json').write_text(json.dumps({'passed':True, 'checks':['independent same-key fixtures','different-key full-frame comparison','rapid selection','all six poses','zoom','canonical PNG download','mobile layout','no view storage or telemetry','corrupt fixture rejection']}, indent=2)+'\n')
print('PASS modular review: all nine browser checks')
