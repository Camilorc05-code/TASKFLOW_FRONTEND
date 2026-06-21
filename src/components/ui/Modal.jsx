import { useEffect } from 'react'

export default function Modal({ open, onClose, title, children, width = 520 }) {
  useEffect(() => {
    const h = (e) => e.key === 'Escape' && onClose()
    if (open) { document.addEventListener('keydown', h); document.body.style.overflow = 'hidden' }
    return () => { document.removeEventListener('keydown', h); document.body.style.overflow = '' }
  }, [open, onClose])

  if (!open) return null
  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,.75)', backdropFilter:'blur(10px)',
      display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:20,
      animation:'fadeIn .2s ease',
    }}>
      <div style={{
        background:'var(--bg-card)', border:'1px solid var(--border-2)', borderRadius:20,
        width:'100%', maxWidth:width, maxHeight:'90vh', overflowY:'auto',
        animation:'modalIn .32s cubic-bezier(.22,.68,0,1.2)',
        boxShadow:'0 48px 120px rgba(0,0,0,.7), 0 0 0 1px rgba(255,255,255,.04)',
      }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'24px 28px 18px' }}>
          <h2 style={{ fontSize:19, fontWeight:700, fontFamily:"'Syne',sans-serif" }}>{title}</h2>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'var(--text-2)', fontSize:22, cursor:'pointer', lineHeight:1, padding:4, borderRadius:6, transition:'color .15s', width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center' }}
            onMouseEnter={e => e.target.style.color='var(--text)'} onMouseLeave={e => e.target.style.color='var(--text-2)'}>✕</button>
        </div>
        <div style={{ padding:'0 28px 28px' }}>{children}</div>
      </div>
    </div>
  )
}
