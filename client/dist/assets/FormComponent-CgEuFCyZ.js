import{G as l,d,a as g,p as j,r as v,N as f,B as m,O as b,j as e,b as r}from"./index-6dvs4g-D.js";import{u as B,c as N,a as u}from"./index.esm-42nOpcHC.js";function P(s){return l({tag:"svg",attr:{viewBox:"0 0 24 24"},child:[{tag:"path",attr:{d:"M21 3H5a1 1 0 0 0-1 1v2.59c0 .523.213 1.037.583 1.407L10 13.414V21a1.001 1.001 0 0 0 1.447.895l4-2c.339-.17.553-.516.553-.895v-5.586l5.417-5.417c.37-.37.583-.884.583-1.407V4a1 1 0 0 0-1-1zm-6.707 9.293A.996.996 0 0 0 14 13v5.382l-2 1V13a.996.996 0 0 0-.293-.707L6 6.59V5h14.001l.002 1.583-5.71 5.71z"},child:[]}]})(s)}function S(s){return l({tag:"svg",attr:{viewBox:"0 0 24 24"},child:[{tag:"path",attr:{d:"M19 11h-6V5h-2v6H5v2h6v6h2v-6h6z"},child:[]}]})(s)}function y(s){return l({tag:"svg",attr:{viewBox:"0 0 24 24"},child:[{tag:"path",attr:{d:"M19.023 16.977a35.13 35.13 0 0 1-1.367-1.384c-.372-.378-.596-.653-.596-.653l-2.8-1.337A6.962 6.962 0 0 0 16 9c0-3.859-3.14-7-7-7S2 5.141 2 9s3.14 7 7 7c1.763 0 3.37-.66 4.603-1.739l1.337 2.8s.275.224.653.596c.387.363.896.854 1.384 1.367l1.358 1.392.604.646 2.121-2.121-.646-.604c-.379-.372-.885-.866-1.391-1.36zM9 14c-2.757 0-5-2.243-5-5s2.243-5 5-5 5 2.243 5 5-2.243 5-5 5z"},child:[]}]})(s)}function A(s){return l({tag:"svg",attr:{viewBox:"0 0 24 24"},child:[{tag:"path",attr:{d:"M8 16H4l6 6V2H8zm6-11v17h2V8h4l-6-6z"},child:[]}]})(s)}const V=({formHandler:s,projectId:i=""})=>{const h=d(g),x=d(j),[p,c]=v.useState(""),a=B({initialValues:{name:"",description:""},validationSchema:N().shape({name:u().max(25,"Maximum 25 characters allowed").required("Required"),description:u().max(150,"Maximum 150 characters allowed").required("Required")}),onSubmit:async n=>{if(i){const t=await f({projectId:i,...n});t!=null&&t.status?(s(),x(o=>[{...t.data,subTasks:[]},...o]),m.success(t.message)):(c(t.message),setTimeout(()=>{c("")},3e3))}else{const t=await b(n);t!=null&&t.status?(s(),h(o=>[t.data,...o]),m.success(t.message)):(c(t.message),setTimeout(()=>{c("")},3e3))}}});return e.jsxs("form",{onSubmit:a.handleSubmit,className:"flex flex-col justify-center items-center",children:[e.jsx(r.DialogHeader,{children:i?"Add Task":"Add Project"}),e.jsxs(r.DialogBody,{className:"flex flex-col gap-6",children:[e.jsxs("div",{children:[e.jsx(r.Input,{...a.getFieldProps("name"),type:"text",label:`${i?"Task":"Project"} Name`,className:""}),e.jsx("p",{className:"h-2 ml-2 text-xs text-red-500",children:a.touched.name&&a.errors.name?a.errors.name:null})]}),e.jsxs("div",{children:[e.jsx(r.Input,{...a.getFieldProps("description"),type:"text",label:"Description",className:"h-10 p-2 outline-none border border-gray-300 rounded-md"}),e.jsx("p",{className:"h-2 ml-2 text-xs text-red-500",children:a.touched.description&&a.errors.description?a.errors.description:null}),e.jsx("div",{className:"text-center",children:e.jsx("p",{className:"h-2 text-sm text-red-500",children:p})})]})]}),e.jsxs(r.DialogFooter,{className:"flex gap-2 items-center justify-center",children:[e.jsx(r.Button,{size:"md",className:"w-24 rounded capitalize",type:"submit",children:"Submit"}),e.jsx(r.Button,{size:"md",className:"w-24 rounded capitalize",type:"button",onClick:s,children:"Cancel"})]})]})};export{S as B,V as F,y as a,P as b,A as c};