import { EventEmitter } from 'events'
import { isTokenExpired } from './jwtHelper'
import { browserHistory } from 'react-router'
import jwtDecode from 'jwt-decode'

import { API_URL } from './constants'

export default class AuthService extends EventEmitter {
  constructor() {
    super()

    // binds login functions to keep this context
    this.login = this.login.bind(this)
  }

  _doAuthentication(endpoint, values) {
    return this.fetch(`${API_URL}/${endpoint}`, {
      method: 'POST',
      body: JSON.stringify(values),
      headers: { 'Content-Type': 'application/json' }
    })
  }

  login(user, password) {
    return this._doAuthentication('users/authenticate', { user, password })
  }

  signup(username, email, password) {
    return this._doAuthentication('users', { username, email, password, admin: true })
  }

  isAuthenticated() {
    // Checks if there is a saved token and it's still valid
    const token = localStorage.getItem('token')
    if (token) {
      return !isTokenExpired(token)
    } else {
      return false
    }
  }

  finishAuthentication(token) {
    localStorage.setItem('token', token)
  }

  getToken() {
    // Retrieves the user token from localStorage
    return localStorage.getItem('token')
  }

  logout() {
    // Clear user token and profile data from localStorage
    localStorage.removeItem('token')
  }

  fetch(url, options) {
    // performs api calls sending the required authentication headers
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }

    if (this.isAuthenticated()) {
      headers['Authorization'] = 'Bearer ' + this.getToken()
    }

    return fetch(url, {
      headers,
      ...options
    })
    .then(response => response.json())
  }
}
