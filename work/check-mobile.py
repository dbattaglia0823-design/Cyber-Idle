from playwright.sync_api import sync_playwright
import subprocess,json
baseline=subprocess.check_output(['git','show','HEAD:src/mobile.css'],text=True)
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 page=b.new_page(viewport={'width':390,'height':844})
 page.goto('http://127.0.0.1:5173')
 page.get_by_role('button',name='Start as Streetborn').click()
 page.locator('.bottom-nav button').nth(1).click()
 page.wait_for_timeout(300)
 print(page.locator('body').inner_text()[:1600])
 for width in [320,390,600,1280]:
  page.set_viewport_size({'width':width,'height':844})
  def measure():
   return page.evaluate('''() => ({overflow:document.documentElement.scrollWidth>innerWidth,menuHeight:document.querySelector('.main-menu').getBoundingClientRect().height,goalHeight:document.querySelector('.next-goal').getBoundingClientRect().height,unlocksHeight:document.querySelector('.upcoming-unlocks').getBoundingClientRect().height,cards:[...document.querySelectorAll('.main-menu-card')].map(e=>Math.round(e.getBoundingClientRect().height))})''')
  after=measure()
  mobile=page.locator('style[data-vite-dev-id$="/src/mobile.css"]')
  current=mobile.text_content()
  mobile.evaluate('(el, css)=>el.textContent=css',baseline)
  before=measure()
  mobile.evaluate('(el, css)=>el.textContent=css',current)
  print(json.dumps({'width':width,'before':before,'after':after}))
 page.set_viewport_size({'width':390,'height':844})
 page.screenshot(path='work/mobile.png',full_page=True)
 page.locator('.upcoming-unlocks summary').click()
 print('expanded unlocks',page.locator('.unlock-grid').is_visible())
 b.close()
