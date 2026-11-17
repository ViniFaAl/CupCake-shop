"use strict";
const form=document.querySelector("#tracking-form");
const idField=document.querySelector("#order-id");
const error=document.querySelector("#tracking-error");
const result=document.querySelector("#tracking-result");
const qs=new URLSearchParams(location.search);
idField.value=qs.get("id")||"";
const money=v=>Number(v).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
async function loadOrder(){
 error.hidden=true;result.hidden=true;
 const id=idField.value.trim();
 if(!id){error.textContent="Informe o número do pedido.";error.hidden=false;return}
 try{
  const response=await fetch("/api/track",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id}),cache:"no-store"});
  const data=await response.json();
  if(!response.ok)throw Error(data.error||"Não foi possível consultar o pedido");
  document.querySelector("#tracking-number").textContent=`Pedido: ${data.id}`;
  document.querySelector("#tracking-status").textContent=`Status atual: ${data.status}`;
  result.hidden=false;
 }catch(e){error.textContent=e.message;error.hidden=false}
}
form.addEventListener("submit",event=>{event.preventDefault();loadOrder()});
document.querySelector("#tracking-refresh").addEventListener("click",loadOrder);
