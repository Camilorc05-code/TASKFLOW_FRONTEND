export default function StatCard({ label, value, color, icon, sub, delay = 0 }) {
  return (
    <div className="card a-fadeup" style={{ cursor:'default', animationDelay:`${delay}s` }}
      onMouseEnter={e=>{e.currentTarget.style.borderColor=color;e.currentTarget.style.boxShadow=`0 0 40px ${color}22,0 8px 32px rgba(0,0,0,.2)`}}
      onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.boxShadow='none'}}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div>
          <div style={{ fontSize:12, color:'var(--text-2)', marginBottom:10, fontWeight:500, textTransform:'uppercase', letterSpacing:'.04em' }}>{label}</div>
          <div style={{ fontSize:38, fontWeight:800, fontFamily:"'Syne',sans-serif", color, animation:'countUp .6s cubic-bezier(.22,.68,0,1.2)', lineHeight:1 }}>{value}</div>
          {sub && <div style={{ fontSize:12, color:'var(--text-2)', marginTop:6 }}>{sub}</div>}
        </div>
        <div style={{ fontSize:26, opacity:.6 }}>{icon}</div>
      </div>
    </div>
  )
}
