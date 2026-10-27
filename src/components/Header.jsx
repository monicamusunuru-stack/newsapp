import { useEffect, useState } from 'react'
import MenuIcon from '@mui/icons-material/Menu'
import SearchIcon from '@mui/icons-material/Search'
import CloseIcon from '@mui/icons-material/Close'
import './Header.css'

const navigation = ['World', 'Politics', 'Business', 'Technology', 'Culture']

function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [mode, setMode] = useState('register')
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    phone: '',
    profileType: 'reader',
  })
  const [user, setUser] = useState(null)
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true
    fetch('/api/auth/me', { credentials: 'include' })
      .then(async (response) => {
        if (response.status === 401) return null
        const data = await response.json()
        if (!response.ok) throw new Error(data.message || 'Could not restore your session.')
        return data.user
      })
      .then((currentUser) => {
        if (active) setUser(currentUser)
      })
      .catch((error) => {
        if (active) setMessage(error.message || 'Could not connect to the authentication service.')
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!accountOpen) return undefined
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setAccountOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [accountOpen])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage('')
    setSubmitting(true)
    try {
      const response = await fetch(`/api/auth/${mode === 'register' ? 'register' : 'login'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Authentication failed.')
      setUser(data.user)
    } catch (error) {
      setMessage(error.message || 'Could not connect to the authentication service.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSignOut = async () => {
    setMessage('')
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
      if (!response.ok) throw new Error('Could not sign out. Please try again.')
      setUser(null)
      setForm({ username: '', email: '', password: '', phone: '', profileType: 'reader' })
    } catch (error) {
      setMessage(error.message || 'Could not connect to the authentication service.')
    }
  }

  const openAccount = () => {
    setMessage('')
    setMode('register')
    setAccountOpen(true)
  }

  return (
    <header className="site-header">
      <div className="header-inner">
        <a className="brand" href="/" aria-label="Dinesh mailInfo home">
          <span className="brand-mark">D</span>
          <span>Dinesh mailInfo</span>
        </a>

        <nav className={menuOpen ? 'main-nav is-open' : 'main-nav'} aria-label="Main navigation">
          {navigation.map((item) => (
            <a href={`#${item.toLowerCase()}`} key={item} onClick={() => setMenuOpen(false)}>
              {item}
            </a>
          ))}
        </nav>

        <div className="header-actions">
          <button className="icon-button" type="button" aria-label="Search">
            <SearchIcon fontSize="small" />
          </button>
          {user ? (
            <>
              <span className="account-greeting">Hi, {user.username}</span>
              <button className="subscribe-button" type="button" onClick={handleSignOut}>Sign out</button>
            </>
          ) : (
            <button className="subscribe-button" type="button" onClick={openAccount}>Sign in / Join</button>
          )}
          <button
            className="menu-button icon-button"
            type="button"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>
      {message && !accountOpen && <p className="auth-notice" role="alert">{message}</p>}
      {accountOpen && (
        <div
          className="subscribe-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setAccountOpen(false)
          }}
        >
          <section className="subscribe-dialog" role="dialog" aria-modal="true" aria-labelledby="account-title">
            <button
              className="subscribe-close icon-button"
              type="button"
              aria-label="Close account form"
              onClick={() => setAccountOpen(false)}
            >
              <CloseIcon />
            </button>
            {user ? (
              <div className="subscribe-success" role="status">
                <p className="subscribe-kicker">Welcome</p>
                <h2 id="account-title">You're signed in.</h2>
                <p>Your account is connected to {user.email}.</p>
                <button className="subscribe-submit" type="button" onClick={() => setAccountOpen(false)}>
                  Done
                </button>
              </div>
            ) : (
              <>
                <p className="subscribe-kicker">{mode === 'register' ? 'Stay informed' : 'Welcome back'}</p>
                <h2 id="account-title">{mode === 'register' ? 'Create your account.' : 'Sign in to your account.'}</h2>
                <p className="subscribe-description">
                  {mode === 'register' ? 'Join the community for thoughtful news.' : 'Continue reading with your account.'}
                </p>
                <form className="subscribe-form" onSubmit={handleSubmit}>
                  {mode === 'register' && (
                    <label>
                      Username
                      <input
                        autoComplete="username"
                        name="username"
                        type="text"
                        minLength="2"
                        maxLength="30"
                        value={form.username}
                        onChange={(event) => setForm({ ...form, username: event.target.value })}
                        required
                      />
                    </label>
                  )}
                  <label>
                    Email address
                    <input
                      autoComplete="email"
                      name="email"
                      type="email"
                      maxLength="254"
                      value={form.email}
                      onChange={(event) => setForm({ ...form, email: event.target.value })}
                      required
                    />
                  </label>
                  <label>
                    Password
                    <input
                      name="password"
                      type="password"
                      autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                      minLength="8"
                      maxLength="72"
                      value={form.password}
                      onChange={(event) => setForm({ ...form, password: event.target.value })}
                      required
                    />
                  </label>
                  {mode === 'register' && (
                    <>
                      <label>
                        Phone number
                        <input
                          autoComplete="tel"
                          name="phone"
                          type="tel"
                          maxLength="30"
                          value={form.phone}
                          onChange={(event) => setForm({ ...form, phone: event.target.value })}
                          required
                        />
                      </label>
                      <label>
                        Reader type
                        <select
                          name="profileType"
                          value={form.profileType}
                          onChange={(event) => setForm({ ...form, profileType: event.target.value })}
                          required
                        >
                          <option value="reader">Reader</option>
                          <option value="student">Student</option>
                          <option value="professional">Professional</option>
                          <option value="other">Other</option>
                        </select>
                      </label>
                    </>
                  )}
                  {message && <p className="subscribe-error" role="alert">{message}</p>}
                  <button className="subscribe-submit" type="submit" disabled={submitting}>
                    {submitting ? 'Please wait…' : mode === 'register' ? 'Create account' : 'Sign in'}
                  </button>
                </form>
                <p className="auth-switch">
                  {mode === 'register' ? 'Already have an account?' : 'New to Dinesh mailInfo?'}{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode(mode === 'register' ? 'login' : 'register')
                      setMessage('')
                    }}
                  >
                    {mode === 'register' ? 'Sign in' : 'Create an account'}
                  </button>
                </p>
              </>
            )}
          </section>
        </div>
      )}
    </header>
  )
}

export default Header