import React, { useState } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import Login from './components/Login'
import Recommend from './components/Recommend'
import { gql } from 'apollo-boost'
import {
  useQuery,
  useMutation,
  useApolloClient,
  useSubscription
} from '@apollo/react-hooks'

const ME = gql`
  {
    me {
      favoriteGenre
    }
  }
`

const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      value
    }
  }
`

const CREATE_BOOK = gql`
  mutation createBook(
    $title: String!
    $author: ID!
    $published: Int!
    $genres: [String!]!
  ) {
    addBook(
      author: $author
      title: $title
      published: $published
      genres: $genres
    ) {
      author {
        name
        born
        id
      }
      title
      published
      genres
      id
    }
  }
`

const EDIT_BIRTHYEAR = gql`
  mutation editAuthor($id: String!, $setBornTo: Int!) {
    editAuthor(id: $id, setBornTo: $setBornTo) {
      name
      born
      books
      id
    }
  }
`

const BOOK_DETAILS = gql`
  fragment BookDetails on Book {
    author {
      name
      born
      books
      id
    }
    title
    published
    genres
    id
  }
`

const BOOK_ADDED = gql`
  subscription {
    bookAdded {
      ...BookDetails
    }
  }
  ${BOOK_DETAILS}
`

const ALL_BOOKS = gql`
  {
    allBooks(genre: "") {
      ...BookDetails
    }
  }
  ${BOOK_DETAILS}
`

const ALL_AUTHORS = gql`
  {
    allAuthors {
      name
      born
      books
      id
    }
  }
`

const App = () => {
  const [token, setToken] = useState(
    localStorage.getItem('library-app-user-token')
  )
  const [page, setPage] = useState('authors')

  const client = useApolloClient()

  const handleError = error => {
    console.log(error)
  }

  const updateCacheWith = bookAdded => {
    const includedIn = (set, object) => set.map(b => b.id).includes(object.id)

    const dataInStore = client.readQuery({ query: ALL_BOOKS })
    if (!includedIn(dataInStore.allBooks, bookAdded)) {
      client.writeQuery({
        query: ALL_BOOKS,
        data: { allBooks: dataInStore.allBooks.concat(bookAdded) }
      })
    }
  }

  useSubscription(BOOK_ADDED, {
    onSubscriptionData: ({ subscriptionData }) => {
      const bookAdded = subscriptionData.data.bookAdded
      window.alert(
        `New book added! ${bookAdded.title} by ${bookAdded.author.name}!`
      )
      updateCacheWith(bookAdded)
    }
  })

  const [login] = useMutation(LOGIN, { onError: handleError })
  const me = useQuery(ME)
  const authors = useQuery(ALL_AUTHORS)

  const [addBook] = useMutation(CREATE_BOOK, {
    onError: handleError,
    refetchQueries: [{ query: ALL_BOOKS }, { query: ALL_AUTHORS }]
  })
  const [editAuthor] = useMutation(EDIT_BIRTHYEAR, {
    onError: handleError,
    refetchQueries: [{ query: ALL_AUTHORS }]
  })

  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
  }

  const LogoutButton = () => <button onClick={() => logout()}>logout</button>

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        {token === null ? null : (
          <button onClick={() => setPage('add')}>add book</button>
        )}
        {token === null ? null : (
          <button onClick={() => setPage('recommend')}>recommendations</button>
        )}
        {token === null ? (
          <button onClick={() => setPage('login')}>login</button>
        ) : null}
        {token === null ? null : LogoutButton()}
      </div>

      <Authors
        editAuthor={editAuthor}
        authors={authors}
        show={page === 'authors'}
      />
      <Recommend client={client} me={me} show={page === 'recommend'} />

      <Books client={client} show={page === 'books'} />
      <NewBook addBook={addBook} show={page === 'add'} />
      <Login
        login={login}
        setToken={token => setToken(token)}
        show={page === 'login'}
        setPage={setPage}
      />
    </div>
  )
}

export default App
