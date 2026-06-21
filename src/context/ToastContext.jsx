import { createContext, useContext, useState, useCallback } from 'react'

const Ctx = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const toast = useCallback((msg, type = 'success') => {
    const id = Date.now() + Math.random()
    setToasts(t => [...t, { id, msg, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000)
  }, [])

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <div style={{ position:'fixed', top:20, right:20, zIndex:9999, display:'flex', flexDirection:'column', gap:10, pointerEvents:'none' }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            display:'flex', alignItems:'center', gap:12,
            padding:'14px 20px', borderRadius:14,
            background: t.type==='error' ? '#1a0d14' : t.type==='warn' ? '#1a1508' : '#081a12',
            border: `1px solid ${t.type==='error' ? 'rgba(255,84,112,.35)' : t.type==='warn' ? 'rgba(255,181,71,.35)' : 'rgba(0,229,160,.35)'}`,
            color: t.type==='error' ? '#ff5470' : t.type==='warn' ? '#ffb547' : '#00e5a0',
            fontSize:14, fontWeight:500, minWidth:260, maxWidth:400,
            boxShadow:'0 16px 48px rgba(0,0,0,.6), 0 2px 8px rgba(0,0,0,.4)',
            animation:'toastIn .4s cubic-bezier(.22,.68,0,1.2)',
            pointerEvents:'auto',
          }}>
            <span style={{ fontSize:20, flexShrink:0 }}>{t.type==='error'?'✗':t.type==='warn'?'⚠':'✓'}</span>
            <span style={{ flex:1, lineHeight:1.4 }}>{t.msg}</span>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  )
}
export const useToast = () => useContext(Ctx)
