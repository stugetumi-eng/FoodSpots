import useSWR from 'swr'
import { useState } from 'react'

const fetcher = (url) => fetch(url).then(r => r.json())

export default function Profile(){
  const { data, mutate } = useSWR('/api/auth/profile', fetcher)
  const user = data?.user
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  // populate when user loads
  useState(() => {
    if (user) {
      setName(user.name || '')
      setAvatar(user.avatar || '')
    }
  })

  async function save(e){
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    const res = await fetch('/api/auth/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, avatar }) })
    const data = await res.json()
    setLoading(false)
    if (res.ok){
      setMessage('Profile updated')
      mutate()
    } else {
      setMessage(data.error || 'Update failed')
    }
  }

  if (!user) return <div className="card">Loading...</div>

  return (
    <div>
      <h1>Profile</h1>
      <div className="card">
        <img src={user.avatar || '/images/avatar-placeholder.png'} alt="avatar" style={{width:80,height:80,borderRadius:8,objectFit:'cover'}} />
        <p className="small">{user.email}</p>
      </div>
      <div className="card">
        <form onSubmit={save}>
          <div className="form-row"><label>Name</label><input className="input" value={name} onChange={e=>setName(e.target.value)} /></div>
          <div className="form-row"><label>Avatar URL</label><input className="input" value={avatar} onChange={e=>setAvatar(e.target.value)} placeholder="https://..." /></div>
          <button className="button" type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
          {message && <p className="small" style={{marginTop:8}}>{message}</p>}
        </form>
      </div>
    </div>
  )
}
