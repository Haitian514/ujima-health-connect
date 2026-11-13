import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import vm from 'node:vm';

const node={innerHTML:'',textContent:'',dataset:{},classList:{toggle(){},add(){},remove(){}},addEventListener(){},querySelector(){return node},querySelectorAll(){return []},showModal(){this.open=true},focus(){},insertAdjacentHTML(){}};
const context=vm.createContext({console,Date,JSON,Math,Set,Map,Number,String,Array,Object,URL,crypto:{randomUUID:()=> 'test-id'},document:{addEventListener(){},querySelector:()=>node,querySelectorAll:()=>[],body:node,title:''},localStorage:{getItem:key=>key==='ujima-health-connect-v1'?JSON.stringify({location:'Riverton',profile:{name:'Neighbor'}}):null,setItem(){}},location:{hash:'#care',origin:'https://example.test'},navigator:{onLine:true},window:{addEventListener(){},scrollTo(){}},history:{pushState(){}},setTimeout(){},clearTimeout(){}});
for(const path of ['data.js','directory.js','geography.js','app.js'])vm.runInContext(readFileSync('dist/'+path,'utf8'),context);
const run=code=>vm.runInContext(code,context);
assert.equal(run('RECORDS.length'),787,'Complete source sitemap');
assert.equal(run('new Set(RECORDS.map(p=>p.id)).size'),787,'Unique public listings');
assert.equal(run('CATEGORIES.length'),16,'All source categories');
assert.equal(run("RECORDS.filter(p=>p.photo).length"),170,'Published photos / logos');
assert.equal(run('DIRECTORY.geocoding.censusMatches'),500,'Census address matches');
assert.equal(run("RECORDS.every(p=>p.source.startsWith('https://ujimahealthconnect.com/listings/'))"),true,'Source provenance for every listing');
assert.equal(run("RECORDS.some(p=>/Riverton \(sample\)|202-555-010/.test(p.address+' '+p.phone))"),false,'No fabricated contact data');
assert.equal(run('db.location'),'North Carolina','Do not migrate a fictional location');
assert.equal(run("safeURL('javascript:alert(1)')"),'','Block executable links');
assert.equal(run("safeURL('not-a-url')"),'','Block malformed external links');
assert.equal(run("safeURL('assets/example.png')"),'https://example.test/assets/example.png','Allow local assets');

run("filters={...defaultFilters(),q:'Annika Webb'}");assert.equal(run('providerMatches()[0].id'),'annika-webb','Real name search');
assert.equal(run('providerMatches().length'),1);
run("filters={...defaultFilters(),q:'Annika',category:'Cosmetic & Restorative Care (Non-Clinical Services)',specialty:'IV Hydration',withPhoto:true,verified:true}");assert.equal(run('providerMatches().length'),1,'Combine all published filters and multiple categories');
run('filters.virtualOnly=true');assert.equal(run('providerMatches().length'),0,'No false virtual-care match');
run("filters={...defaultFilters(),category:'Clinical Trials & Research'}");assert.equal(run('providerMatches().length'),1,'Preserve a non-canonical category membership');
run("filters={...defaultFilters(),coverage:'accepted'}");assert.equal(run('providerMatches().length'),17,'Only source-listed insurance acceptance');
run("filters={...defaultFilters(),insurance:'Medicaid'}");assert.equal(run('providerMatches().length'),0,'Never invent insurance plans');
run("filters={...defaultFilters(),location:'Greensboro',radius:'25',includeVirtual:false}");assert.ok(run('providerMatches().length')>0);assert.equal(run("providerMatches().every(p=>miles(resolveLocation('Greensboro'),p.coordinates)<=25)"),true,'Geographic radius');
assert.equal(run("resolveLocation('27601').statewide"),false,'Real NC ZIP');assert.equal(run("resolveLocation('New York')"),null,'Unknown / out-of-scope location');
run("filters={...defaultFilters(),location:'Raleigh',sort:'nearest'}");assert.equal(run("providerMatches()[0].locationPrecision"),'street','Area-only estimates do not outrank street locations');
assert.ok(run("distanceText(RECORDS.find(p=>p.locationPrecision==='area'),resolveLocation('Raleigh'))").includes('approximate area'),'Never present a city centroid as zero-mile office distance');
assert.equal(run("RECORDS.some(p=>p.role==='Specialty Areas')"),false,'Do not import a heading as a professional role');
assert.ok(run("RECORD_BY_ID.get('chigozirim-ogar').coordinates[0]")>35,'Correct out-of-state source pin');
assert.equal(run('RECORDS.filter(p=>p.coordinates).every(p=>p.coordinates[0]>=33.5&&p.coordinates[0]<=37&&p.coordinates[1]>=-85&&p.coordinates[1]<=-75)'),true,'Withhold implausible NC pins');
assert.equal(run("esc('<img src=x onerror=alert(1)>')").includes('<'),false,'Escape user / imported content');
const ics=run("calendarText({id:'test',date:'2026-11-14',time:'13:30',providerName:'Office, Name',location:'Street; Suite',note:'Line one\\nLine two'})");assert.ok(ics.includes('DTSTART:20261114T133000'));assert.ok(ics.includes('Office\\, Name'));assert.ok(ics.includes('Street\\; Suite'));assert.ok(ics.includes('Line one\\nLine two'));
const exported=JSON.parse(readFileSync('dist/directory.json','utf8'));assert.equal(exported.records.length,787);assert.equal(exported.categories.length,16);
const manifest=JSON.parse(readFileSync('dist/manifest.webmanifest'));assert.equal(manifest.name,'Ujima Health Connect');assert.equal(manifest.display,'standalone');
for(const item of manifest.icons){const image=readFileSync('dist/'+item.src),[width,height]=item.sizes.split('x').map(Number);assert.equal(image.readUInt32BE(16),width);assert.equal(image.readUInt32BE(20),height);}

const handlers={},cached=[],offlineResponse={marker:'cached-directory-shell'};
const swContext=vm.createContext({URL,Request,Response,caches:{open:async()=>({addAll:async requests=>{for(const r of requests){const path=new URL(r.url).pathname;assert.ok(existsSync('dist'+(path==='/'?'/index.html':path)),path);cached.push(path)}},put:async()=>{}}),keys:async()=>[],match:async()=>offlineResponse},self:{location:{origin:'https://example.test'},registration:{scope:'https://example.test/'},addEventListener:(name,handler)=>handlers[name]=handler,skipWaiting:async()=>{},clients:{claim:async()=>{}}},fetch:async()=>{throw Error('offline')}});
swContext.Request=class{constructor(url){this.url=new URL(url,'https://example.test/').href;}};
vm.runInContext(readFileSync('dist/sw.js','utf8'),swContext);let install;handlers.install({waitUntil:p=>install=p});await install;assert.ok(cached.includes('/directory.js'),'Offline directory dataset');
let response;handlers.fetch({request:{url:'https://example.test/',method:'GET',mode:'navigate'},respondWith:p=>response=p});assert.equal(await response,offlineResponse,'Offline shell fallback');
let intercepted=false;handlers.fetch({request:{url:'https://tile.openstreetmap.org/7/35/49.png',method:'GET',mode:'no-cors'},respondWith(){intercepted=true}});assert.equal(intercepted,false,'Never prefetch / app-cache map tiles');
console.log('Passed: 787 listings, 16 categories, 170 photos, provenance, real contacts, 500 Census matches, corrected pins, combined filters, ZIP/radius search, missing coverage, safe links, calendar export, install icons, offline directory, and tile-cache boundaries.');
