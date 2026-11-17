import React,{useEffect,useState} from 'react';
import{createRoot}
from'react-dom/client';
import{createClient}
from'@supabase/supabase-js';
import{Search,Menu,LogOut,Plus,Pencil,Trash2,ShieldCheck,ArrowLeft,Save,X}
from'lucide-react';
import './style.css';

const url=import.meta.env.VITE_SUPABASE_URL,key=import.meta.env.VITE_SUPABASE_ANON_KEY;
const db=url&&key?createClient(url,key):null;

const initial={organization_name:'MAS DEVELOPMENT COMPANY',certificate_number:'HACCP/D651/1126',standard:'HACCP',standard_full_name:'Hazard Analysis and Critical Control Point',address:'2989, Prince Abdulmajeed Ibn Abdulaziz St., Al Iskan Dist., Al Madinah Al Munawwarah - Kingdom Of Saudi Arabia.',scope:'PROVIDING CONSULTANCY FOR PEST CONTROL SERVICES',country:'Saudi Arabia',original_certificate_date:'2026-11-11',issue_date:'2026-11-11',expiry_date:'2029-11-10',status:'unverified',document_url:''};
const fields=[['organization_name','Organization Name'],['certificate_number','Certificate Number'],['standard','Standard'],['standard_full_name','Standard Full Name'],['address','Address'],['scope','Scope'],['country','Country'],['original_certificate_date','Original Certificate Date','date'],['issue_date','Issue Date','date'],['expiry_date','Expiry Date','date'],['document_url','Certificate PDF URL','url']];

function App(){const[page,setPage]=useState(location.pathname.startsWith('/admin')?'admin':'home'),[session,setSession]=useState(null),[records,setRecords]=useState([]),[loading,setLoading]=useState(false),[searched,setSearched]=useState(false),[name,setName]=useState(''),[number,setNumber]=useState(''),[country,setCountry]=useState('Saudi Arabia'),[error,setError]=useState(''),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[editing,setEditing]=useState(null),[form,setForm]=useState(initial),[mobile,setMobile]=useState(false);

useEffect(()=>{if(!db)return;
db.auth.getSession().then(({data})=>setSession(data.session));
const{data:{subscription}}=db.auth.onAuthStateChange((_event,s)=>setSession(s));
return()=>subscription.unsubscribe()},[]);

const navigate=p=>{setPage(p);
history.pushState({},'',p==='admin'?'/admin':'/');
setError('');
setMobile(false)};
useEffect(()=>{const f=()=>setPage(location.pathname.startsWith('/admin')?'admin':'home');
window.addEventListener('popstate',f);
return()=>window.removeEventListener('popstate',f)},[]);

async function search(e){e.preventDefault();
setError('');
setSearched(true);
if(!db){setRecords([]);
setError('Database connection is not configured.');
return}setLoading(true);
let q=db.from('certificates').select('*').ilike('organization_name',`%${name.trim()}%`).eq('certificate_number',number.trim());
if(country)q=q.eq('country',country);
const{data,error:err}=await q.order('created_at',{ascending:false});
setLoading(false);
if(err)setError(err.message);
setRecords(data||[])}
async function loadAdmin(){if(!db)return;
const{data,error:err}=await db.from('certificates').select('*').order('created_at',{ascending:false});
if(err)setError(err.message);
setRecords(data||[])}
useEffect(()=>{if(page==='admin'&&session)loadAdmin()},[page,session]);

async function login(e){e.preventDefault();
setError('');
if(!db){setError('Configure Supabase first.');
return}
const{error:err}=await db.auth.signInWithPassword({email,password});
if(err)setError(err.message)}
function edit(record){setForm(record||initial);
setEditing(record?.id||'new');
setError('')}
async function save(e){e.preventDefault();
setError('');
const payload=Object.fromEntries([...fields.map(([k])=>[k,form[k]||null]),['status',form.status]]);
const req=editing==='new'?db.from('certificates').insert(payload):db.from('certificates').update(payload).eq('id',editing);
const{error:err}=await req;
if(err){setError(err.message);
return}setEditing(null);
loadAdmin()}
async function remove(id){if(!confirm('Delete this certificate?'))return;
const{error:err}=await db.from('certificates').delete().eq('id',id);
if(err)setError(err.message);
else loadAdmin()}
const date=v=>v?new Date(v+'T00:00:00').toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}):'—';
return <><div className="topline"/><header><div className="headerinner"><a className="brand" href="https://uasl.uk.com/certifiedorganization/"><img src="/header.jpg" alt="UASL reference branding"/></a><button className="hamburger" onClick={()=>setMobile(!mobile)}><Menu/></button><nav className={mobile?'open':''}><a href="https://uasl.uk.com/certifiedorganization/">Home</a><a href="https://uasl.uk.com/certifiedorganization/">About</a><a className={page==='home'?'active':''} href="https://uasl.uk.com/certifiedorganization/">Certified Organization</a><a href="https://uasl.uk.com/certifiedorganization/">Accreditation</a><a href="https://uasl.uk.com/certifiedorganization/">Careers</a><a href="https://uasl.uk.com/certifiedorganization/">Get in touch</a><Search size={19}/></nav></div></header>
{page==='home'?<main><div className="disclosure">.</div><p>To check out the status of an organization for the standard (management system standard/product certification/personal certification/rating), you may search as below:</p><p>Search data like</p><form onSubmit={search} className="searchform"><div className="fieldrow"><label>Name (Enter first 3 Characters of your company Name in Capital Letter)*</label><input value={name} onChange={e=>setName(e.target.value)}  required minLength={3}/></div><div className="fieldrow"><label>Certificate Number*</label><input value={number} onChange={e=>setNumber(e.target.value)} required /></div><div className="fieldrow"><label>Country</label><select value={country} onChange={e=>setCountry(e.target.value)}><option>Saudi Arabia</option><option>Egypt</option><option>United Kingdom</option><option value="">All Countries</option></select></div><button className="primary submit" disabled={loading}>{loading?'Searching...':'submit'}</button></form>{error&&<p className="error">{error}</p>}{searched&&<section className="results"><h2>Certified organization</h2>{records.length?<div className="tablewrap"><table><thead><tr><th>CERTIFICATE NO.</th><th>ORG. NAME</th><th>ADDRESS</th><th>SCOPE</th><th>STANDARD</th><th>ISSUE DATE</th><th>EXPIRY DATE</th><th>REGISTRY STATUS</th></tr></thead><tbody>{records.map(r=><tr key={r.id}><td>{r.certificate_number}</td><td>{r.organization_name}</td><td>{r.address}</td><td>{r.scope}</td><td>{r.standard}</td><td>{date(r.issue_date)}</td><td>{date(r.expiry_date)}</td><td><span className="status">{r.status}</span></td></tr>)}</tbody></table></div>:!loading&&<p>No matching records found.</p>}</section>}</main>:<main className="admin"><div className="adminhead"><h1>Certificate Management</h1><button className="ghost" onClick={()=>navigate('home')}><ArrowLeft size={16}/> Public registry</button></div>{!session?<form className="login" onSubmit={login}><h2>Administrator sign in</h2><label>Email<input type="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Password<input type="password" required value={password} onChange={e=>setPassword(e.target.value)}/></label><button className="primary">Sign in</button></form>:<><div className="toolbar"><span>{records.length} certificate(s)</span><div><button className="ghost" onClick={()=>db.auth.signOut()}><LogOut size={16}/> Sign out</button><button className="primary" onClick={()=>edit(null)}><Plus size={16}/> Add Certificate</button></div></div>{editing?<form className="editor" onSubmit={save}><div className="adminhead"><h2>{editing==='new'?'Add Certificate':'Edit Certificate'}</h2><button type="button" className="ghost" onClick={()=>setEditing(null)}><X size={16}/> Cancel</button></div><div className="editorgrid">{fields.map(([k,label,type])=><label key={k}>{label}{k==='scope'||k==='address'?<textarea rows="3" value={form[k]||''} onChange={e=>setForm({...form,[k]:e.target.value})}/>:<input type={type||'text'} value={form[k]||''} required={!['document_url'].includes(k)} onChange={e=>setForm({...form,[k]:e.target.value})}/>}</label>)}<label>Registry Status<select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option value="unverified">Unverified</option><option value="active">Active (issuer confirmed)</option><option value="suspended">Suspended</option><option value="expired">Expired</option><option value="revoked">Revoked</option></select></label></div><button className="primary"><Save size={16}/> Save Certificate</button></form>:<div className="tablewrap"><table><thead><tr><th>Certificate Number</th><th>Organization</th><th>Standard</th><th>Expiry</th><th>Status</th><th>Actions</th></tr></thead><tbody>{records.map(r=><tr key={r.id}><td>{r.certificate_number}</td><td>{r.organization_name}</td><td>{r.standard}</td><td>{date(r.expiry_date)}</td><td>{r.status}</td><td><button className="iconbutton" onClick={()=>edit(r)} aria-label="Edit"><Pencil size={17}/></button><button className="iconbutton danger" onClick={()=>remove(r.id)} aria-label="Delete"><Trash2 size={17}/></button></td></tr>)}</tbody></table>{!records.length&&<p>No certificates yet. Use Add Certificate to create one.</p>}</div>}</>}{error&&<p className="error">{error}</p>}</main>}
<footer><div className="footerinner"><div><img src="/logo.jpg" alt="Reference logo"/></div><div><a href="https://uasl.uk.com/certifiedorganization/">About</a><a href="https://uasl.uk.com/certifiedorganization/">Information Center</a><a href="https://uasl.uk.com/certifiedorganization/">Use of Logo</a><a href="https://uasl.uk.com/certifiedorganization/">Feedback</a><a href="https://uasl.uk.com/certifiedorganization/">Members</a></div><div><a href="https://uasl.uk.com/certifiedorganization/">Certified Organization</a><a href="https://uasl.uk.com/certifiedorganization/">Careers</a></div><div><a href="https://uasl.uk.com/certifiedorganization/">Accreditation</a><a href="https://uasl.uk.com/certifiedorganization/">What is Accreditation</a><a href="https://uasl.uk.com/certifiedorganization/">Benefits of accreditation</a><a href="https://uasl.uk.com/certifiedorganization/">Management System Certification</a></div><div><a href="https://uasl.uk.com/certifiedorganization/">Product Certification</a><a href="https://uasl.uk.com/certifiedorganization/">Personal Certification</a><a href="https://uasl.uk.com/certifiedorganization/">Inspection</a><a href="https://uasl.uk.com/certifiedorganization/">Rating</a></div></div><div className="copyright">Copyright © 2018 UASL | Terms of Use   |   Cookie Policy  |  Privacy Policy  |  Disclaimer

UASL  is a company registered in England and Wales (No. 08283067).</div></footer></>};
createRoot(document.getElementById('root')).render(<App/>);
