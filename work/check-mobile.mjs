import { chromium } from '/opt/codex/browser-runtime/node_modules/playwright/index.mjs';
const browser = await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
const page = await browser.newPage({viewport:{width:390,height:844}});
await page.goto('http://127.0.0.1:5173');
await page.waitForTimeout(1000);
console.log(await page.locator('body').innerText());
await page.screenshot({path:'work/before.png',fullPage:true});
await browser.close();
