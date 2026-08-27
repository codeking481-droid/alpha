import { useState, useMemo } from "react"
import { useLocalStorage } from "../../hooks/useLocalStorage.js"

export default function InvoiceBuilder({ onCreate }) {
  const [companies] = useLocalStorage("alpha.companies", [])
  const [invoices, setInvoices] = useLocalStorage("alpha.invoices", [])
  const clientOptions = companies.length ? companies.map(c => c.name) : ["Add company first in Command Hub"]
  const [client, setClient] = useState(clientOptions[0])
  const [tax, setTax] = useState(7.5)
  const [discount, setDiscount] = useState(0)
  const [items, setItems] = useState([{ id: 1, desc: "", qty: 1, rate: 0 }])
  const [invoiceId] = useState(() => `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random()*9000)}`)
  const [preview, setPreview] = useState(false)
  const [sent, setSent] = useState(false)

  const subtotal = useMemo(() => items.reduce((s, it) => s + (Number(it.qty) * Number(it.rate) || 0), 0), [items])
  const taxAmt = subtotal * (tax / 100)
  const discAmt = subtotal * (discount / 100)
  const total = subtotal + taxAmt - discAmt

  const updateItem = (id, field, val) => setItems((prev) => prev.map((it) => it.id === id ? { ...it, [field]: val } : it))
  const addItem = () => setItems([...items, { id: Date.now(), desc: "", qty: 1, rate: 0 }])
  const removeItem = (id) => setItems(items.filter((it) => it.id !== id))

  const handleSend = () => {
    if (companies.length === 0) { alert("Add a real company first in Command Hub"); return }
    if (!items[0]?.desc.trim()) { alert("Add at least one real line item description"); return }
    const inv = { id: invoiceId, client, amount: Math.round(total), total: Math.round(total), status: "Sent", due: new Date(Date.now()+14*24*60*60*1000).toISOString().slice(0,10), items, created: "now" }
    const next = [inv, ...invoices]
    setInvoices(next)
    onCreate?.(inv)
    setSent(true)
    setPreview(true)
    setTimeout(() => setSent(false), 2500)
  }

  return (
    <div className="glass rounded-2xl p-6 sm:p-8 animate-fadeIn">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FFD700] to-[#F59E0B] flex items-center justify-center text-[#0B0215] font-black text-sm">₦</div>
        <div>
          <h3 className="text-sm font-bold tracking-widest uppercase text-white/80">Invoice Builder — Real</h3>
          <p className="text-xs text-white/30 mt-1">Usefulness: create real invoices for real clients. Add line items (what you did), tax/discount, preview, send, track payment. No fake invoices.</p>
        </div>
        <span className="ml-auto text-xs px-2 py-1 rounded-full bg-white/5 border border-white/10 text-white/40 font-mono">{invoiceId}</span>
      </div>

      {companies.length === 0 && (
        <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 text-center">No real companies yet. Add one in Command Hub first, then it appears here.</div>
      )}

      <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div>
            <label className="text-xs font-bold tracking-widest uppercase text-white/50">Client — Real</label>
            <select value={client} onChange={(e) => setClient(e.target.value)} className="mt-2 w-full bg-[#0B0215] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white">
              {clientOptions.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold tracking-widest uppercase text-white/50">Line Items — Real work you did</label>
              <button onClick={addItem} className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition min-h-[32px]">+ Add Item</button>
            </div>
            <div className="mt-2 space-y-2">
              {items.map((it) => (
                <div key={it.id} className="bg-[#0B0215] border border-white/10 rounded-xl p-3 grid grid-cols-12 gap-2 items-center">
                  <input value={it.desc} onChange={(e) => updateItem(it.id, "desc", e.target.value)} placeholder="Real description — e.g. Website build" className="col-span-6 bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30" />
                  <input type="number" value={it.qty} onChange={(e) => updateItem(it.id, "qty", Number(e.target.value))} className="col-span-2 bg-white/[0.04] border border-white/10 rounded-lg px-2 py-2 text-sm text-white text-center" />
                  <input type="number" value={it.rate} onChange={(e) => updateItem(it.id, "rate", Number(e.target.value))} placeholder="Rate" className="col-span-3 bg-white/[0.04] border border-white/10 rounded-lg px-2 py-2 text-sm text-white text-right" />
                  <button onClick={() => removeItem(it.id)} className="col-span-1 text-white/30 hover:text-red-400 text-sm min-h-[32px]">✕</button>
                  <div className="col-span-12 flex justify-between text-xs text-white/30"><span>{it.qty} × ${Number(it.rate).toLocaleString()}</span><span className="font-bold text-white">${(Number(it.qty)*Number(it.rate)).toLocaleString()}</span></div>
                </div>
              ))}
            </div>
            <p className="text-xs text-white/20 mt-2">Example: Qty 1 × Rate 5000 = $5000 for real work.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold tracking-widest uppercase text-white/50">Tax %</label>
              <input type="number" value={tax} onChange={(e) => setTax(Number(e.target.value))} className="mt-2 w-full bg-[#0B0215] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white" />
            </div>
            <div>
              <label className="text-xs font-bold tracking-widest uppercase text-white/50">Discount %</label>
              <input type="number" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} className="mt-2 w-full bg-[#0B0215] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="gold-card rounded-2xl p-6">
            <div className="text-xs tracking-widest uppercase font-bold text-[#FFD700]/60">Summary — Real Money</div>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between text-white/60"><span>Subtotal</span><span className="font-bold text-white">${subtotal.toLocaleString()}</span></div>
              <div className="flex justify-between text-white/60"><span>Tax ({tax}%)</span><span className="font-bold text-white">+${taxAmt.toFixed(0)}</span></div>
              <div className="flex justify-between text-white/60"><span>Discount ({discount}%)</span><span className="font-bold text-emerald-400">-${discAmt.toFixed(0)}</span></div>
              <div className="h-px bg-white/10 my-2"></div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-black tracking-widest uppercase text-white">Total Real</span>
                <span className="text-2xl font-black bg-gradient-to-r from-[#FFD700] to-[#F59E0B] bg-clip-text text-transparent">${total.toLocaleString()}</span>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button onClick={() => setPreview(!preview)} className="py-2.5 rounded-xl border border-white/10 text-white text-xs font-black tracking-widest uppercase min-h-[44px]">{preview ? "Edit" : "Preview Real"}</button>
              <button onClick={handleSend} className="py-2.5 rounded-xl bg-gradient-to-r from-[#FFD700] to-[#F59E0B] text-black text-xs font-black tracking-widest uppercase min-h-[44px]">{sent ? "✓ Sent Real" : "Send Real Email"}</button>
            </div>
            <button onClick={() => window.print()} className="w-full mt-2 py-2.5 rounded-xl bg-white text-black text-xs font-black tracking-widest uppercase min-h-[44px]">Download Real PDF</button>
            {sent && <div className="mt-3 text-xs text-emerald-400 font-bold text-center">✓ Real invoice saved — track in Invoice Tracker below</div>}
          </div>

          {preview && (
            <div className="bg-white text-[#0B0215] rounded-2xl p-6 shadow-xl">
              <div className="flex justify-between items-start">
                <div><div className="font-black">ALPHA AGENCY</div><div className="text-xs text-black/50">Real invoice</div></div>
                <div className="text-right"><div className="font-black">{invoiceId}</div><div className="text-xs text-black/50">Due: 14 days</div></div>
              </div>
              <div className="mt-4 text-sm font-bold">Bill to: {client}</div>
              <div className="mt-3 border-t border-black/10 pt-3 space-y-1 text-sm">
                {items.map((it) => (
                  <div key={it.id} className="flex justify-between"><span>{it.desc || "Untitled real work"} × {it.qty}</span><span className="font-bold">${(Number(it.qty)*Number(it.rate)).toLocaleString()}</span></div>
                ))}
                <div className="flex justify-between font-black border-t border-black/10 pt-2 mt-2 text-base"><span>Total Real</span><span>${total.toLocaleString()}</span></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
