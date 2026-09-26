import { test, expect } from '@playwright/test';

test('blog links expose their own title and description for embeds', async ({ request }) => {
  const response = await request.get('/blog/competitive-programming-with-zed');
  expect(response.ok()).toBe(true);
  const html = await response.text();
  expect(html).toContain('<title>Competitive Programming with Zed</title>');
  expect(html).toContain('<meta name="description" content="Learn how to use Zed for competitive programming."');
  expect(html).toContain('<meta property="og:title" content="Competitive Programming with Zed"');
  expect(html).toContain('<meta property="og:description" content="Learn how to use Zed for competitive programming."');
  expect(html).toContain('<meta name="twitter:title" content="Competitive Programming with Zed"');
  expect(html).toContain('<meta name="twitter:description" content="Learn how to use Zed for competitive programming."');
});

test('unknown blog links are not given misleading blog metadata', async ({ request }) => {
  const response = await request.get('/blog/does-not-exist');
  const html = await response.text();
  expect(html).not.toContain('<meta property="og:title" content="Competitive Programming with Zed"');
});
