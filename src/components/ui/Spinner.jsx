export default function Spinner({ size = 20, color = 'var(--accent)' }) {
  return <div style={{ width:size, height:size, border:`2px solid var(--border-2)`, borderTopColor:color, borderRadius:'50%', animation:'spin .75s linear infinite', flexShrink:0 }} />
}
