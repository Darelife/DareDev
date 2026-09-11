import { expect, test, type Page } from '@playwright/test';
const key = 'daredev-theme';
const html = (page: Page) => page.locator('html');
const picker = (page: Page) => page.locator('.theme-dialog');
async function choose(page: Page, name: 'Original' | 'Sketchbook') {
  await page.getByRole('button', { name: 'Themes', exact: true }).click();
  await page.getByRole('option', { name: new RegExp(name) }).click();
}

test('Original is the default; preview cancels, commits, and persists across routes', async ({ page }) => {
  const errors: string[] = [];page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(html(page)).toHaveAttribute('data-theme', 'original');
  await expect(page.locator('.original-hero')).toBeVisible();
  await expect(page.locator('.sketch-canvas')).toHaveCount(0);
  await page.keyboard.press('Alt+t');
  await expect(picker(page)).toBeVisible();
  await page.keyboard.press('ArrowDown');
  await expect(html(page)).toHaveAttribute('data-theme', 'sketchbook');
  expect(await page.evaluate(key => localStorage.getItem(key), key)).toBeNull();
  await page.keyboard.press('Escape');
  await expect(html(page)).toHaveAttribute('data-theme', 'original');
  await choose(page, 'Sketchbook');await page.reload();
  await expect(html(page)).toHaveAttribute('data-theme','sketchbook');
  await expect(page.locator('.sketch-canvas')).toBeVisible();
  await page.goto('/resources');await expect(html(page)).toHaveAttribute('data-theme','sketchbook');
  await choose(page, 'Original');await page.reload();
  await expect(html(page)).toHaveAttribute('data-theme','original');
  expect(errors).toEqual([]);
});

test('search, keyboard commit, empty results, dismissal, and focus containment', async ({ page }) => {
  await page.goto('/');const trigger = page.getByRole('button',{name:'Themes',exact:true});await trigger.click();
  const search=page.getByRole('combobox');await expect(search).toBeFocused();
  await search.fill('Sketch');await page.keyboard.press('Enter');
  await expect(picker(page)).not.toBeVisible();await expect(trigger).toBeFocused();
  await trigger.click();await search.fill('no such theme');await expect(page.getByRole('status').filter({hasText:'No themes'})).toBeVisible();
  await page.keyboard.press('Enter');await expect(picker(page)).toBeVisible();
  await search.fill('Original');await expect(html(page)).toHaveAttribute('data-theme','original');
  await page.mouse.click(5,5);await expect(html(page)).toHaveAttribute('data-theme','sketchbook');
  await page.keyboard.press('?');await expect(page.getByRole('heading',{name:'A few handy shortcuts'})).toBeVisible();
  await page.keyboard.press('Tab');await expect(page.getByRole('button',{name:'Close dialog'})).toBeFocused();
  await page.keyboard.press('Shift+Tab');await expect(page.getByRole('button',{name:'Close dialog'})).toBeFocused();
  await page.keyboard.press('Escape');
});

test('Alt+T opens themes; modified keys are ignored and navigation offers a UI option', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Change theme', exact: true }).click();
  await expect(picker(page)).toBeVisible();
  await page.keyboard.press('Escape');
  await page.keyboard.press('Alt+Shift+t');
  await expect(picker(page)).not.toBeVisible();
  await page.keyboard.press('Alt+t');
  await expect(picker(page)).toBeVisible();
  await page.keyboard.press('Escape');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Change theme', exact: true }).click();
  await page.getByRole('option', { name: /Sketchbook/ }).click();
  await expect(html(page)).toHaveAttribute('data-theme', 'sketchbook');
  await page.keyboard.press('?');
  await expect(picker(page).getByText('Alt+T', { exact: true })).toBeVisible();
});

test('invalid and blocked storage fall back without breaking switching', async ({ page }) => {
  await page.addInitScript(key => localStorage.setItem(key,'unknown-theme'),key);await page.goto('/');await expect(html(page)).toHaveAttribute('data-theme','original');
  await page.addInitScript(() => { Storage.prototype.getItem=()=>{throw new Error('blocked')};Storage.prototype.setItem=()=>{throw new Error('blocked')}; });
  await page.reload();await expect(html(page)).toHaveAttribute('data-theme','original');await choose(page,'Sketchbook');await expect(html(page)).toHaveAttribute('data-theme','sketchbook');
});

test('theme switching preserves unsaved admin input and ignores typing shortcuts', async ({ page }) => {
  await page.goto('/admin/blog/new');const title=page.locator('main input').first();await title.fill('An unsaved idea');
  await page.keyboard.press('?');await expect(picker(page)).not.toBeVisible();
  await page.keyboard.press('Alt+t');await expect(picker(page)).not.toBeVisible();
  const value=await title.inputValue();
  await choose(page,'Sketchbook');await expect(title).toHaveValue(value);await expect(page).toHaveURL(/\/admin\/blog\/new$/);
  await choose(page,'Original');await expect(title).toHaveValue(value);
});

test('public and admin routes render both themes at desktop and mobile sizes', async ({ page }, testInfo) => {
  test.setTimeout(180_000);
  const errors: string[]=[];page.on('pageerror',error=>errors.push(error.message));
  const paths=['/','/blog','/blog/field-notes','/blog/missing','/resources','/resources/Programming','/admin','/admin/projects','/admin/resources','/admin/users','/admin/blog','/admin/blog/new','/admin/blog/1'];
  for(const theme of ['original','sketchbook']) {
    await page.goto('/');await choose(page,theme==='original'?'Original':'Sketchbook');
    for(const width of [1440,390]) {
      await page.setViewportSize({width,height:1000});
      for(const path of paths) {
        await page.goto(path);await expect(html(page)).toHaveAttribute('data-theme',theme);
        await page.getByRole('button',{name:'Themes',exact:true}).waitFor();
        if (path.startsWith('/admin')) await page.locator('main').waitFor();
        // Exercise content below the fold and intersection-triggered animation.
        await page.evaluate(()=>window.scrollTo({top:document.body.scrollHeight,behavior:'instant'}));await page.waitForTimeout(path === '/' ? 1300 : 150);
        await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
        if(theme==='sketchbook') expect(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth + 2),path).toBeTruthy();
        await page.screenshot({path:testInfo.outputPath(`${theme}-${width}-${path.replaceAll('/','_')||'home'}.png`),fullPage:true});
      }
    }
  }
  expect(errors).toEqual([]);
});

test('resource tabs and mobile navigation remain usable', async ({page})=>{
  await page.setViewportSize({width:390,height:844});await page.goto('/resources');await choose(page,'Sketchbook');
  await page.getByRole('navigation',{name:'Resource categories'}).getByRole('link',{name:'Design Notes',exact:true}).click();await expect(page).toHaveURL(/#category-Design%2520Notes$/);
  await expect.poll(()=>page.evaluate(()=>window.scrollY)).toBeGreaterThan(0);
  await page.getByRole('button',{name:'Toggle menu'}).click();await expect(page.locator('.navbar-links')).toHaveCSS('background-color','rgb(247, 242, 230)');
  await page.locator('.navbar-links').getByRole('link',{name:'Blog',exact:true}).click();await expect(page).toHaveURL(/\/blog$/);
});

test('Excalidraw keeps scene contents and owns its shortcuts',async({page})=>{
  test.setTimeout(90_000);await page.goto('/admin/canvas');await page.locator('.excalidraw').waitFor();
  await expect(page.locator('.excalidraw')).toHaveClass(/theme--dark/);
  // Excalidraw's real rectangle tool and canvas are exercised before appearance changes.
  await page.locator('.excalidraw').getByTitle(/Rectangle/).first().click();
  const editor = await page.locator('.excalidraw').elementHandle();
  const canvas=page.locator('.excalidraw canvas').last();const box=await canvas.boundingBox();expect(box).not.toBeNull();
  await page.mouse.move(box!.x+450,box!.y+220);await page.mouse.down();await page.mouse.move(box!.x+600,box!.y+340, {steps: 8});await page.mouse.up();
  await page.keyboard.press('?');await expect(picker(page)).not.toBeVisible();await page.keyboard.press('Escape');
  await choose(page,'Sketchbook');await expect(page.locator('.excalidraw')).not.toHaveClass(/theme--dark/);
  await choose(page,'Original');await expect(page.locator('.excalidraw')).toHaveClass(/theme--dark/);
  expect(await editor!.evaluate(element => element.isConnected)).toBeTruthy();
  await expect(canvas).toBeVisible();
  // Inspect a save against the isolated fixture to prove unsaved geometry survived.
  let scene: { elements: { type: string; width: number; height: number }[] } | undefined;
  await page.route('**/api/canvas', async route => {
    scene = route.request().postDataJSON();
    await route.fulfill({json:{ok:true}});
  });
  await page.getByRole('button',{name:'Save',exact:true}).click();
  await expect.poll(()=>scene?.elements.length).toBe(1);
  expect(scene!.elements[0]).toMatchObject({type:'rectangle',width:150,height:120});
});

test('reduced motion keeps the canvas still and previews preserve scroll position', async ({page}) => {
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/');await choose(page,'Sketchbook');
  const canvas=page.locator('.sketch-canvas');await expect(canvas).toBeVisible();
  await page.waitForTimeout(100);
  const before=await canvas.evaluate((element: HTMLCanvasElement)=>element.toDataURL());
  await page.mouse.move(900,400);await page.waitForTimeout(200);
  expect(await canvas.evaluate((element: HTMLCanvasElement)=>element.toDataURL())).toBe(before);
  await page.goto('/blog/field-notes');await page.evaluate(()=>window.scrollTo({top:400,behavior:'instant'}));
  await page.getByRole('button',{name:'Themes',exact:true}).click();
  await page.getByRole('combobox').fill('Original');await page.keyboard.press('Escape');
  await expect.poll(()=>page.evaluate(()=>window.scrollY)).toBe(400);
});

test('login and unavailable-content states follow the selected theme', async ({page}) => {
  await page.route('**/api/auth/check',route=>route.fulfill({json:{authenticated:false}}));
  await page.goto('/admin');await page.getByLabel('Username').fill('unsaved-user');
  await choose(page,'Sketchbook');await expect(page.getByLabel('Username')).toHaveValue('unsaved-user');
  await expect(page.locator('.admin-login')).toHaveCSS('background-color','rgb(255, 253, 245)');
  await page.route('**/api/public/projects',route=>route.abort());
  await page.goto('/');await expect(page.getByRole('status').filter({hasText:'Projects couldn’t load'})).toBeVisible();
  await page.route('**/api/public/resources',route=>route.abort());
  await page.goto('/resources');await expect(page.getByText('Unable to load resources right now.')).toBeVisible();
  await expect(html(page)).toHaveAttribute('data-theme','sketchbook');
});
