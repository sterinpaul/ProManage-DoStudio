import{R as x,a as m,r as o,u as p,j as e,b as i,g as h}from"./index-CDoomnms.js";import{B as u,F as j,a as g,b as f,c as b}from"./FormComponent-CIVgVDdk.js";import"./index.esm-wm3x0VwZ.js";const w=()=>{const[t,l]=x(m),[r,c]=o.useState(!1),n=p(),d=async()=>{const s=await h();s!=null&&s.status&&l(s.data)};o.useEffect(()=>{d()},[]);const a=()=>{c(!r)};return e.jsxs("div",{className:"flex-1 mt-14 p-5 w-96 h-[calc(100vh-3.5rem)]",children:[e.jsx("h1",{className:"text-2xl font-bold",children:"Dashboard"}),e.jsx("p",{children:"Welcome to your dashboard!"}),e.jsxs("div",{className:"mt-2 flex gap-2",children:[e.jsxs(i.Button,{onClick:a,className:"capitalize flex items-center gap-1 transition py-1 px-2 rounded",children:["Add Project",e.jsx(u,{className:"w-4 h-4"})]}),e.jsx(i.Dialog,{size:"xs",open:r,handler:a,children:e.jsx(j,{formHandler:a})}),e.jsxs("button",{className:"flex items-center gap-1 transition duration-150 text-slate-500 hover:text-black py-1 px-2 rounded",children:[e.jsx(g,{}),"Search"]}),e.jsxs("button",{className:"flex items-center gap-1 transition duration-150 text-slate-500 hover:text-black py-1 px-2 rounded",children:[e.jsx(f,{}),"Filter"]}),e.jsxs("button",{className:"flex items-center gap-1 transition duration-150 text-slate-500 hover:text-black py-1 px-2 rounded",children:[e.jsx(b,{}),"Sort"]})]}),e.jsx("div",{children:e.jsx("div",{className:"overflow-y-scroll mt-4 grid grid-flow-row-dense grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4",children:t==null?void 0:t.map(s=>e.jsx("div",{onClick:()=>n("/projects",{state:{id:s._id,name:s.name,description:s.description}}),className:"capitalize text-center text-white bg-blue-600 py-4 rounded cursor-pointer group",children:e.jsx("p",{className:"group-hover:scale-125 transition delay-100",children:s.name})},s._id))})})]})};export{w as default};
