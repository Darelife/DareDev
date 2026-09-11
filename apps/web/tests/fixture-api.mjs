// Read-only fixtures: browser tests never authenticate against or mutate the real API.
import { createServer } from 'node:http';
const projects = Array.from({ length: 4 }, (_, i) => ({ id: String(i), title: ['Orbit Notes', 'A small internet', 'Pocket compiler', 'Weekend experiments'][i], desc: 'A little tool built with care. An experiment in making everyday things more useful.', techstack: ['TypeScript', 'React'], links: [{url: 'https://example.com', text: 'Explore'}] }));
const resources = { Programming: Array.from({length: 5}, (_, i) => ({title: `Programming field note ${i + 1}`, description: 'Ideas, examples, and things worth coming back to.', url: 'https://example.com', status: i % 3})), 'Design Notes': [{title:'Making room for play', description:'A collection of creative references.', url:'https://example.com', status:2}] };
const post = { id: '1', slug: 'field-notes', title: 'Field notes from a weekend of building', description: 'Small experiments, useful mistakes, and a few things learned along the way.', date: '2026-09-01', author: 'Prakhar', tags: ['building','notes'], readTime: 4, featured: true, published: true,
  body: '# A place to start\n\nGood tools leave room for **curiosity** and [experimentation](https://example.com).\n\n## What I learned\n\n> Make the small things feel good.\n\n- Build something useful\n- Keep asking questions\n\n```ts\nconst idea = "keep building";\n```\n\n| Experiment | Result |\n| --- | --- |\n| Paper prototype | Useful |\n\n' + ('A longer paragraph to exercise reading width, line height, and scrolling. '.repeat(9) + '\n\n').repeat(5) };
createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3100'); res.setHeader('Access-Control-Allow-Credentials','true'); res.setHeader('Content-Type','application/json');
  if (req.method !== 'GET') {res.writeHead(405);res.end('{}');return;}
  const p = new URL(req.url,'http://localhost').pathname;
  const routes = {
    '/': {}, '/api/auth/check': {authenticated:true,user:{id:'test',username:'test-owner'}},
    '/api/public/projects': {projects}, '/api/public/resources': {resources}, '/api/public/blog': {posts:[post]}, '/api/public/blog/field-notes': {post},
    '/api/admin/projects': {projects:projects.map(p=>({...p, description:p.desc,techStack:p.techstack,orderIndex:0}))},
    '/api/admin/resources': {resources:Object.entries(resources).flatMap(([category,rows])=>rows.map((r,i)=>({...r,category,id:category+i,orderIndex:i})))},
    '/api/admin/blog': {posts:[post]}, '/api/admin/blog/1': {post},
    '/api/admin/users': {users:[{id:'test',username:'test-owner',created_at:'2026-09-01'}]},
    '/api/canvas': {canvas:{elements:[],files:{},appState:{viewBackgroundColor:'#ffffff',theme:'dark'}}},
  };
  res.writeHead(p in routes ? 200 : 404);res.end(JSON.stringify(routes[p]??{}));
}).listen(4101,'127.0.0.1');
