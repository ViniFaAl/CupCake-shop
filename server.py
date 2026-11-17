"""Servidor acadêmico Cupcake Shop — Python 3, sem pacotes externos."""
import json, os, secrets, sqlite3
from datetime import datetime, timezone
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit, parse_qs

ROOT = Path(__file__).resolve().parent
DB = ROOT / "cupcake_shop.db"
HOST = "127.0.0.1"
PORT = int(os.environ.get("PORT", "8000"))
ADMIN_KEY = os.environ.get("CUPCAKE_ADMIN_KEY", "demo123")
CATALOG = {"chocolate": ("Chocolate",1200), "morango": ("Morango",1200), "limao": ("Limão",1200), "red-velvet": ("Red Velvet",1400), "cookies-cream": ("Cookies & Cream",1400), "caramelo": ("Caramelo",1400)}
STATUSES = ["Recebido (simulado)","Em preparação","Pronto para retirada/entrega","Concluído","Cancelado"]

def connect():
    db=sqlite3.connect(DB,timeout=10)
    db.row_factory=sqlite3.Row
    return db

def setup():
    with connect() as db:
        db.execute("CREATE TABLE IF NOT EXISTS orders (id TEXT PRIMARY KEY, created_at TEXT NOT NULL, customer_name TEXT NOT NULL, customer_phone TEXT NOT NULL, delivery TEXT NOT NULL, street TEXT, neighborhood TEXT, notes TEXT, payment TEXT NOT NULL, total_cents INTEGER NOT NULL, status TEXT NOT NULL)")
        # Migração segura: preserva pedidos registrados em versões anteriores.
        columns={row[1] for row in db.execute("PRAGMA table_info(orders)")}
        if "house_number" not in columns: db.execute("ALTER TABLE orders ADD COLUMN house_number TEXT")
        if "complement" not in columns: db.execute("ALTER TABLE orders ADD COLUMN complement TEXT")
        if "tracking_hash" not in columns: db.execute("ALTER TABLE orders ADD COLUMN tracking_hash TEXT")
        db.execute("CREATE TABLE IF NOT EXISTS order_items (order_id TEXT NOT NULL, product_id TEXT NOT NULL, name TEXT NOT NULL, quantity INTEGER NOT NULL, unit_price_cents INTEGER NOT NULL, FOREIGN KEY(order_id) REFERENCES orders(id))")

def as_order(db, row):
    items=db.execute("SELECT product_id, name, quantity, unit_price_cents FROM order_items WHERE order_id=?",(row["id"],)).fetchall()
    return {"id":row["id"],"createdAt":row["created_at"],"customer":{"name":row["customer_name"],"phone":row["customer_phone"]},"delivery":row["delivery"],"address":{"street":row["street"],"number":row["house_number"],"neighborhood":row["neighborhood"],"complement":row["complement"],"city":"Guapé","state":"MG"} if row["delivery"]=="entrega" else None,"notes":row["notes"],"payment":row["payment"],"total":row["total_cents"]/100,"status":row["status"],"items":[{"id":i["product_id"],"name":i["name"],"quantity":i["quantity"],"unitPrice":i["unit_price_cents"]/100} for i in items]}

class Handler(SimpleHTTPRequestHandler):
    def __init__(self,*args,**kwargs):super().__init__(*args,directory=str(ROOT),**kwargs)
    def json_response(self,status,data):
        raw=json.dumps(data,ensure_ascii=False).encode("utf-8")
        self.send_response(status);self.send_header("Content-Type","application/json; charset=utf-8");self.send_header("Cache-Control","no-store");self.send_header("Content-Length",str(len(raw)));self.end_headers();self.wfile.write(raw)
    def read_body(self):
        try:
            n=int(self.headers.get("Content-Length","0"))
            if n<1 or n>20000:raise ValueError("Tamanho de requisição inválido")
            data=json.loads(self.rfile.read(n))
            if not isinstance(data,dict):raise ValueError("JSON inválido")
            return data
        except (ValueError,json.JSONDecodeError,UnicodeDecodeError):raise ValueError("Dados inválidos")
    def is_admin(self):return secrets.compare_digest(self.headers.get("X-Admin-Key",""),ADMIN_KEY)
    def do_GET(self):
        path=urlsplit(self.path).path
        if path=="/api/health":return self.json_response(200,{"ok":True})
        if path=="/api/orders":
            if not self.is_admin():return self.json_response(401,{"error":"Chave de administrador incorreta"})
            with connect() as db:
                orders=[as_order(db,row) for row in db.execute("SELECT * FROM orders ORDER BY created_at DESC")]
            return self.json_response(200,{"orders":orders})
        if path.startswith("/api/"):return self.json_response(404,{"error":"Rota não encontrada"})
        # Não servir arquivos internos do servidor nem arquivos ocultos.
        if path.endswith((".py",".db",".db-journal",".db-wal",".db-shm")) or "/." in path:return self.send_error(404)
        return super().do_GET()
    def do_POST(self):
        if urlsplit(self.path).path=="/api/track":
            try:
                data=self.read_body()
                oid=str(data.get("id","")).strip()
                if not oid or len(oid)>40:
                    return self.json_response(400,{"error":"Informe o número do pedido."})
                with connect() as db:
                    row=db.execute("SELECT id, status FROM orders WHERE id=?",(oid,)).fetchone()
                if not row:
                    return self.json_response(404,{"error":"Pedido não encontrado. Confira o número informado."})
                # Exibe apenas status: nenhum dado pessoal é retornado ao cliente.
                return self.json_response(200,{"id":row["id"],"status":row["status"]})
            except ValueError as e:return self.json_response(400,{"error":str(e)})
        if urlsplit(self.path).path!="/api/orders":return self.json_response(404,{"error":"Rota não encontrada"})
        try:
            data=self.read_body();customer=data.get("customer",{});delivery=data.get("delivery");payment=data.get("payment");address=data.get("address") or {};items=data.get("items")
            if not isinstance(customer,dict) or not isinstance(address,dict) or not isinstance(items,list) or not 1<=len(items)<=6:raise ValueError("Dados do pedido inválidos")
            name=str(customer.get("name","")).strip();phone=str(customer.get("phone","")).strip();notes=str(data.get("notes","")).strip()
            if not 3<=len(name)<=100 or not 10<=len(phone)<=20 or len(notes)>500:raise ValueError("Confira os dados pessoais")
            if delivery not in ("entrega","retirada") or payment not in ("pix","cartao"):raise ValueError("Entrega ou pagamento inválido")
            street=str(address.get("street","")).strip() if delivery=="entrega" else ""
            neighborhood=str(address.get("neighborhood","")).strip() if delivery=="entrega" else ""
            house_number=str(address.get("number","")).strip() if delivery=="entrega" else ""
            complement=str(address.get("complement","")).strip() if delivery=="entrega" else ""
            if delivery=="entrega" and (address.get("city")!="Guapé" or address.get("state")!="MG"):raise ValueError("Entregas somente em Guapé – MG")
            if delivery=="entrega" and (not street or not neighborhood or not house_number or len(street)>140 or len(neighborhood)>80 or len(house_number)>12 or len(complement)>100):raise ValueError("Endereço incompleto")
            rows=[];seen=set();total=0
            for item in items:
                if not isinstance(item,dict):raise ValueError("Produto inválido")
                pid=item.get("id");qty=item.get("quantity")
                if pid not in CATALOG or type(qty)!=int or not 1<=qty<=99 or pid in seen:raise ValueError("Produto ou quantidade inválidos")
                seen.add(pid);product,price=CATALOG[pid];rows.append((pid,product,qty,price));total+=qty*price
            order_id="CS-"+secrets.token_hex(5).upper();created=datetime.now(timezone.utc).isoformat()
            with connect() as db:
                db.execute("INSERT INTO orders (id,created_at,customer_name,customer_phone,delivery,street,neighborhood,notes,payment,total_cents,status,house_number,complement) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",(order_id,created,name,phone,delivery,street,neighborhood,notes,payment,total,STATUSES[0],house_number,complement))
                db.executemany("INSERT INTO order_items VALUES (?,?,?,?,?)",[(order_id,*r) for r in rows])
            return self.json_response(201,{"id":order_id,"total":total/100,"status":STATUSES[0]})
        except ValueError as e:return self.json_response(400,{"error":str(e)})
        except sqlite3.Error:return self.json_response(500,{"error":"Erro ao salvar pedido"})
    def do_PATCH(self):
        path=urlsplit(self.path).path
        if not path.startswith("/api/orders/"):return self.json_response(404,{"error":"Rota não encontrada"})
        if not self.is_admin():return self.json_response(401,{"error":"Chave de administrador incorreta"})
        order_id=path.removeprefix("/api/orders/")
        try:
            data=self.read_body();status=data.get("status")
            if status not in STATUSES:return self.json_response(400,{"error":"Status inválido"})
            with connect() as db:
                cur=db.execute("UPDATE orders SET status=? WHERE id=?",(status,order_id))
            return self.json_response(200,{"ok":True}) if cur.rowcount else self.json_response(404,{"error":"Pedido não encontrado"})
        except ValueError as e:return self.json_response(400,{"error":str(e)})

if __name__=="__main__":
    setup()
    print(f"Cupcake Shop: http://{HOST}:{PORT}/index.html")
    print(f"Admin: http://{HOST}:{PORT}/admin.html  |  chave: {ADMIN_KEY}")
    print("Somente demonstração local. Não publicar este servidor na internet.")
    ThreadingHTTPServer((HOST,PORT),Handler).serve_forever()
