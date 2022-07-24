import React, { useState } from 'react'
import { gql } from 'apollo-boost'

const FIND_BOOK_BY_GENRE = gql`
  query findBookByGenre($genre: String!) {
    allBooks(genre: $genre) {
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

const Recommend = ({ me, client, show }) => {
  const [filteredBooks, setFilteredBooks] = useState([])
  if (!show) {
    return null
  }

  const showBooks = async filter => {
    const { data } = await client.query({
      query: FIND_BOOK_BY_GENRE,
      variables: { genre: filter }
    })
    setFilteredBooks(data.allBooks)
  }
  const favoriteGenre = me.data.me.favoriteGenre
  showBooks(favoriteGenre)

  if (!filteredBooks) {
    return <div>loading...</div>
  } else {
    return (
      <div>
        <h2>recommendations</h2>
        <p>
          books in your favorite genre <b>{favoriteGenre}</b>
        </p>
        <table>
          <tbody>
            <tr>
              <th></th>
              <th>author</th>
              <th>published</th>
            </tr>
            {filteredBooks.map(a => (
              <tr key={a.title}>
                <td>{a.title}</td>
                <td>{a.author.name}</td>
                <td>{a.published}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }
}

export default Recommend
