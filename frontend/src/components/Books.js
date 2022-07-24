import React, { useState } from 'react'
import { gql } from 'apollo-boost'
import { useQuery } from 'react-apollo'

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

const Books = ({ client, show }) => {
  const [genres, setGenres] = useState([])
  const [filter, setFilter] = useState('')

  const mapGenres = data =>
    data.map(data =>
      data.genres.map(genre => {
        if (!genres.includes(genre)) {
          setGenres(genres.concat(genre))
        }
        return genres
      })
    )

  const { loading, error, data, refetch } = useQuery(FIND_BOOK_BY_GENRE, {
    variables: { genre: filter }
  })

  const onChangeGenre = async genre => {
    await refetch()
    setFilter(genre)
  }

  if (!show) {
    return null
  }
  if (loading) {
    return <div>loading...</div>
  } else {
    mapGenres(data.allBooks)

    if (error) {
      return <div>not found</div>
    }
    return (
      <div>
        <h2>books</h2>

        <table>
          <tbody>
            <tr>
              <th>title</th>
              <th>author</th>
              <th>published</th>
            </tr>
            {data.allBooks.map(a => (
              <tr key={a.title}>
                <td>{a.title}</td>
                <td>{a.author.name}</td>
                <td>{a.published}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {genres.map(genre => (
          <button onClick={() => onChangeGenre(genre)} key={genre}>
            {genre}
          </button>
        ))}
        <button onClick={() => onChangeGenre('')}>show all</button>
      </div>
    )
  }
}

export default Books
