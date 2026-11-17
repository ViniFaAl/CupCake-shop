"use strict";
const CART_KEY="cupcake-shop-cart-v1";
const CATALOG={chocolate:{name:"Chocolate",price:12},morango:{name:"Morango",price:12},limao:{name:"Limão",price:12},"red-velvet":{name:"Red Velvet",price:14},"cookies-cream":{name:"Cookies & Cream",price:14},caramelo:{name:"Caramelo",price:14}};
const money=v=>Number(v).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
let raw={};try{raw=JSON.parse(localStorage.getItem(CART_KEY)||"{}")}catch{}
const cart=Object.entries(raw&&typeof raw==="object"&&!Array.isArray(raw)?raw:{}).filter(([id,qty])=>Object.hasOwn(CATALOG,id)&&Number.isInteger(qty)&&qty>0&&qty<=99).map(([id,quantity])=>({id,name:CATALOG[id].name,quantity,unitPrice:CATALOG[id].price}));
const total=cart.reduce((s,i)=>s+i.quantity*i.unitPrice,0);
const summary=document.querySelector("#checkout-items");
for(const item of cart){const row=document.createElement("div");row.className="order-line";const name=document.createElement("span");name.textContent=`${item.name} × ${item.quantity}`;const price=document.createElement("strong");price.textContent=money(item.quantity*item.unitPrice);row.append(name,price);summary.append(row)}
if(!cart.length){const p=document.createElement("p");p.textContent="Carrinho vazio. Volte à loja.";summary.append(p)}
document.querySelector("#checkout-total").textContent=money(total);
const form=document.querySelector("#checkout-form"),deliveryFields=document.querySelector("#delivery-fields"),street=document.querySelector("#street"),houseNumber=document.querySelector("#house-number"),complement=document.querySelector("#complement"),neighborhood=document.querySelector("#neighborhood"),submit=document.querySelector("#submit-order"),error=document.querySelector("#form-error");
function updateDelivery(){const delivery=form.elements.delivery.value==="entrega";deliveryFields.hidden=!delivery;street.required=delivery;houseNumber.required=delivery;neighborhood.required=delivery}
form.querySelectorAll('input[name="delivery"]').forEach(el=>el.addEventListener("change",updateDelivery));updateDelivery();if(!cart.length)submit.disabled=true;
form.addEventListener("submit",async event=>{
 event.preventDefault();error.hidden=true;if(!cart.length||!form.reportValidity())return;
 const delivery=form.elements.delivery.value;
 const order={customer:{name:form.elements.name.value.trim(),phone:form.elements.phone.value.trim()},delivery,address:delivery==="entrega"?{street:street.value.trim(),number:houseNumber.value.trim(),neighborhood:neighborhood.value.trim(),complement:complement.value.trim(),city:"Guapé",state:"MG"}:null,notes:form.elements.notes.value.trim(),payment:form.elements.payment.value,items:cart.map(({id,quantity})=>({id,quantity}))};
 submit.disabled=true;submit.textContent="Salvando pedido...";
 try{const response=await fetch("/api/orders",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(order)});const data=await response.json();if(!response.ok)throw Error(data.error||"Não foi possível salvar o pedido");localStorage.removeItem(CART_KEY);form.hidden=true;const success=document.querySelector("#order-success");success.hidden=false;const title=document.createElement("h2");title.textContent="Pedido de demonstração registrado!";
 const intro=document.createElement("p");intro.textContent="Seu pedido foi registrado. Nenhuma cobrança foi realizada.";
 const warning=document.createElement("p");warning.className="tracking-warning";warning.textContent="Guarde o número do pedido! Para acompanhar, use somente este número. Não enviamos SMS.";
 const details=document.createElement("div");details.className="tracking-credentials";
 const wrap=document.createElement("div");wrap.className="tracking-credential";
 const label=document.createElement("span");label.className="tracking-credential-label";label.textContent="Número do pedido";
 const number=document.createElement("strong");number.className="tracking-credential-value";number.textContent=data.id;
 const copy=document.createElement("button");copy.type="button";copy.className="copy-code";copy.textContent="Copiar número";
 copy.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(data.id);copy.textContent="Copiado!"}catch{copy.textContent="Selecione o número para copiar"}});
 wrap.append(label,number,copy);details.append(wrap);
 const totalText=document.createElement("p");totalText.textContent=`Total: ${money(data.total)}`;
 const track=document.createElement("a");track.href=`acompanhar.html?id=${encodeURIComponent(data.id)}`;track.className="primary-action";track.textContent="Acompanhar meu pedido agora";
 const hint=document.createElement("p");hint.className="help-text";hint.textContent="Na página de acompanhamento, informe apenas o número do pedido.";
 const a=document.createElement("a");a.href="index.html";a.className="back-link";a.textContent="Voltar à loja";
 success.replaceChildren(title,intro,warning,details,totalText,track,hint,a)
 }catch(e){error.textContent=`${e.message}. Abra o site pelo servidor Python (não pelo Live Server).`;error.hidden=false;submit.disabled=false;submit.textContent="Confirmar pedido simulado"}
});
