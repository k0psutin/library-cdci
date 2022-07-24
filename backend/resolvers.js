const jwt = require('jsonwebtoken')
const { UserInputError, AuthenticationError } = require('apollo-server')
const Book = require('./models/book')
const Author = require('./models/author')
const User = require('./models/user')
const { PubSub } = require('graphql-subscriptions')
const pubsub = new PubSub()

require('dotenv').config()

const JWT_SECRET = process.env.JWT_SECRET

const resolvers = {
    Query: {
      authorCount: () => Author.collection.countDocuments(),
      bookCount: () => Book.collection.countDocuments(),
      allBooks: (roots, args) => {
        if (args.author) {
          return Book.find({ author: { $in: args.author } }).populate('author')
        } else if (args.genre) {
          return Book.find({ genres: { $in: [args.genre] } }).populate('author')
        } else {
          return Book.find({}).populate('author')
        }
      },
      allAuthors: () => Author.find({}),
      me: (root, args, context) => {
        return context.currentUser
      }
    },
    Mutation: {
      addBook: async (root, args, { currentUser }) => {
        if (!currentUser) {
          throw new AuthenticationError('not authenticated')
        }
        try {
          let author = await Author.findOne({ name: args.author })
  
          if (author === null) {
            author = await new Author({ name: args.author }).save()
            author = await Author.findOne({ name: args.author })
            author.books = []
          }
          const newBook = await new Book({ ...args, author: author._id }).save()
  
          const book = await Book.findById(newBook._id).populate('author', {
            name: 1,
            born: 1,
            id: 1
          })
  
          author.books = author.books.concat(newBook._id)
  
          await Author.findByIdAndUpdate(author._id, author)
  
          pubsub.publish('BOOK_ADDED', { bookAdded: book })
  
          return book
        } catch (error) {
          throw new UserInputError(error.message)
        }
      },
      addAuthor: async (roots, args, { currentUser }) => {
        if (!currentUser) {
          throw new AuthenticationError('not authenticated')
        }
        try {
          const newAuthor = await new Author({ name: args.name }).save()
          return newAuthor
        } catch (error) {
          throw new UserInputError(error.message)
        }
      },
      editAuthor: async (roots, args, { currentUser }) => {
        if (!currentUser) {
          throw new AuthenticationError('not authenticated')
        }
        try {
          return await Author.findByIdAndUpdate(args.id, {
            ...args,
            born: args.setBornTo
          })
        } catch (error) {
          throw new UserInputError(error.message)
        }
      },
      createUser: async (root, args) => {
        const user = new User({
          username: args.username,
          favoriteGenre: args.favoriteGenre
        })
        try {
          return await user.save()
        } catch (error) {
          throw new UserInputError(error.message)
        }
      },
      login: async (root, args) => {
        try {
          const user = await User.findOne({ username: args.username })
  
          if (!user || args.password !== 'secret') {
            throw new UserInputError('wrong credentials')
          }
  
          const userForToken = {
            username: user.username,
            id: user._id
          }
  
          return { value: jwt.sign(userForToken, JWT_SECRET) }
        } catch (error) {
          throw new UserInputError(error.message)
        }
      }
    },
    Subscription: {
      bookAdded: {
        subscribe: () => pubsub.asyncIterator(['BOOK_ADDED'])
      }
    }
  }

  module.exports = resolvers