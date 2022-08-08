import React from 'react'
import Login from '../../src/components/Login'

describe('Login.js component tests', () => {
  it('can mount component', () => {
    cy.mount(<Login />)
  })
  it('Can login', async () => {
    const loginProps = {
      show: true,
      setToken: cy.spy().as('setToken'),
      setPage: cy.spy().as('setPage'),
      login: cy.spy().as('login')
    }
    cy.mount(<Login {...loginProps} />)
    cy.get('[data-cy="username"]').should('have.text', 'username').type('Jooseppi')
    cy.get('[data-cy="password"]').should('have.text', 'password').type('sekret')
    cy.get('[data-cy="login"]').should('have.text', 'login').click()
    cy.get('@login').should('have.been.calledWith', { variables: { username: 'Jooseppi', password: 'sekret' } })
    cy.get(`@setPage`).should('have.been.calledWith', 'books')
  })
})
