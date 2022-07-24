const { gql } = require('apollo-server')

const typeDefs = gql`
  type Author {
    name: String!
    books: [String!]!
    born: Int
    id: ID!
  }

  type Book {
    title: String!
    published: Int!
    author: Author!
    genres: [String!]!
    id: ID!
  }

  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }

  type Token {
    value: String!
  }

  type Query {
    authorCount: Int!
    bookCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
    me: User
  }

  type Mutation {
    addBook(
      title: String!
      published: Int!
      author: ID!
      genres: [String!]!
    ): Book

    addAuthor(
      name: String!
      books: [String!]!
      bookCount: Int
      born: Int
    ): Author
    editAuthor(id: String!, setBornTo: Int!): Author

    createUser(username: String!, favoriteGenre: String!): User
    login(username: String!, password: String!): Token
  }

  type Subscription {
    bookAdded: Book!
  }
`

module.exports = typeDefs