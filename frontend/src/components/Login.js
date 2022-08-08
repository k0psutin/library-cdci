import React, { useState } from 'react'

const Login = ({ show, setToken, setPage, login }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  if (!show) {
    return null
  }

  const handleLogin = async event => {
    event.preventDefault()

    const result = await login({
      variables: { username, password }
    })

    if (result) {
      const token = result.data.login.value
      setToken(token)
      localStorage.setItem('library-app-user-token', token)
    }

    setUsername('')
    setPassword('')
    setPage('books')
  }

  return (
    <div data-cy='loginpage'>
      <form onSubmit={handleLogin}>
        <div data-cy='username'>
          username
          <input
            id={'username-input'}
            value={username}
            onChange={({ target }) => setUsername(target.value)}
            data-cy='username-input'
          />
        </div>
        <div id='password' data-cy='password'>
          password
          <input
            id={'password-input'}
            value={password}
            type='password'
            data-cy='password-input'
            onChange={({ target }) => setPassword(target.value)}
          />
        </div>
        <button type='submit' data-cy='login'>login</button>
      </form>
    </div>
  )
}

export default Login
