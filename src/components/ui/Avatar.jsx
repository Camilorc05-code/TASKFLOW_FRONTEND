import { avatarGradient, initial } from '../../utils/helpers'

export default function Avatar({ name = '', size = 36, style = {} }) {
  return (
    <div style={{
      width:size, height:size, borderRadius: size > 40 ? 14 : 10, flexShrink:0,
      background: avatarGradient(name),
      display:'flex', alignItems:'center', justifyContent:'center',
      fontSize: size * 0.38, fontWeight:700, color:'#fff',
      ...style
    }}>
      {initial(name)}
    </div>
  )
}
