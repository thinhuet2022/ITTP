(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[931],{6657:(e,t,l)=>{Promise.resolve().then(l.bind(l,2689))},2689:(e,t,l)=>{"use strict";l.d(t,{default:()=>s});var a=l(7437),r=l(2265),o=l(8472);let s=function(){let[e,t]=(0,r.useState)(null),[l,s]=(0,r.useState)([]),[n,d]=(0,r.useState)(!1),[i,c]=(0,r.useState)(!1),[u,h]=(0,r.useState)(!1),m=e=>{t(e),s(Array.from(e).map(e=>URL.createObjectURL(e)))},x=()=>{t(null),s([])},f=a=>{t(Array.from(e).filter((e,t)=>t!==a)),s(l.filter((e,t)=>t!==a))},p=async t=>{if(t.preventDefault(),!e||0===e.length){alert("Please select a file first!");return}d(!0);let l=new FormData;Array.from(e).forEach(e=>{l.append("file",e)});try{let e=await o.Z.post("http://localhost:5000/upload",l);if(200!==e.status)throw Error("Error creating ZIP file");c(!0),alert("ZIP file created successfully!"),x()}catch(e){console.log(e)}},g=async()=>{try{let e=await o.Z.get("http://localhost:5000/download",{responseType:"blob"}),t=new Blob([e.data],{type:"application/zip"}),l=window.URL.createObjectURL(t),a=document.createElement("a");a.href=l,a.download="images.zip",document.body.appendChild(a),a.click(),a.remove(),d(!1),x(),c(!1)}catch(e){console.error("Error downloading ZIP file:",e),alert("Failed to download ZIP file")}};return(0,a.jsxs)("div",{className:"flex flex-col max-w-md mx-auto p-6 bg-white rounded-lg shadow-md text-center",children:[(0,a.jsx)("h1",{className:"text-2xl font-bold mb-4 text-gray-800",children:"Image-Translate-PDF Processor"}),(0,a.jsx)("p",{className:"text-gray-600 mb-6",children:"Upload your images and convert them into text easily."}),(0,a.jsxs)("div",{id:"drag-drop",className:"flex items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer ".concat(u?"bg-gray-200":"bg-gray-50"),onDragOver:function(e){e.preventDefault()},onDrop:function(e){e.preventDefault();let t=e.dataTransfer.files;t.length>0&&m(t),h(!1)},onDragEnter:()=>{h(!0)},onDragLeave:()=>{h(!1)},children:[l.length>0?(0,a.jsx)("div",{className:"relative max-w-full overflow-x-auto py-4 border-t border-gray-200",children:(0,a.jsx)("div",{className:"flex space-x-4",children:l.map((e,t)=>(0,a.jsxs)("div",{className:"relative min-w-[150px] max-w-[150px] hover:scale-110 border border-gray-300 rounded-lg shadow-md overflow-hidden",children:[(0,a.jsx)("img",{src:e,alt:"Preview ".concat(t),className:"h-36 w-full object-cover transition-transform duration-300"}),(0,a.jsx)("button",{onClick:()=>f(t),className:"absolute h-4 w-4 rounded-full bg-red-400 top-1 right-1 text-black text-xs",children:"✕"})]},t))})}):(0,a.jsxs)("label",{htmlFor:"dropzone-file",className:"flex flex-col items-center",children:[(0,a.jsx)("div",{className:"flex items-center justify-center w-16 h-16 mb-4 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300",children:(0,a.jsx)("span",{className:"text-3xl text-gray-800 font-bold",children:"+"})}),(0,a.jsx)("p",{className:"text-sm text-gray-500",children:"Click to upload or drag and drop"}),(0,a.jsx)("p",{className:"text-xs text-gray-500",children:"SVG, PNG, JPG(MAX. 800x400px)"})]}),(0,a.jsx)("input",{id:"dropzone-file",type:"file",accept:"image/*",multiple:!0,onChange:e=>{m(e.target.files)},disabled:n,className:"hidden"})]}),(0,a.jsxs)("div",{className:"mt-4 space-y-2",children:[(0,a.jsx)("button",{onClick:p,disabled:!e||n,className:"w-full py-2 text-white font-semibold rounded-lg ".concat(n?"bg-gray-400 cursor-not-allowed":"bg-green-500 hover:bg-green-600"),children:n?"Processing...":"Upload and Process"}),(0,a.jsx)("button",{onClick:x,disabled:!e||n,className:"w-full py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg",children:"Clear Queue"}),i&&(0,a.jsx)("button",{onClick:g,className:"w-full py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg",children:"Download Zip"})]}),(0,a.jsx)("p",{className:"text-gray-600 mt-3 text-sm",children:"All your uploaded data will be deleted once you download"})]})}}},e=>{var t=t=>e(e.s=t);e.O(0,[472,130,215,744],()=>t(6657)),_N_E=e.O()}]);