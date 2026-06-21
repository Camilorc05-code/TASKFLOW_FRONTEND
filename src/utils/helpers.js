export const getGreeting = () => {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}
export const formatDate = (d) => {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
export const initial = (name = '') => name.charAt(0).toUpperCase()
export const avatarGradient = (name = '') => {
  const gradients = [
    'linear-gradient(135deg,#7c6dfa,#00e5b3)',
    'linear-gradient(135deg,#ff5470,#ffb547)',
    'linear-gradient(135deg,#5b8fff,#7c6dfa)',
    'linear-gradient(135deg,#00e5b3,#5b8fff)',
    'linear-gradient(135deg,#ffb547,#ff5470)',
  ]
  return gradients[name.charCodeAt(0) % gradients.length]
}
