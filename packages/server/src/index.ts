import { Application } from "express"
import { ApolloServer, Config, gql } from 'apollo-server-express'
import { IResolvers } from "@graphql-tools/utils"
import schema from "./graphql/schema"
import casual from 'casual'
import cors from 'cors'
import { appendFile } from "fs"

const express = require('express')

let postsIds: string[] = []
let usersIds: string[] = []

const mocks = {
    User: () => ({
        id: ()=> {let uuid = casual.uuid; usersIds.push(uuid); return uuid },
        fullname: casual.full_name,
        bio: casual.text,
        email: casual.email,
        username: casual.username,
        password: casual.password,
        image: 'https://picsum.photos/seed/picsum/200/300',
        coverImage: 'https://picsum.photos/seed/picsum/200/300',
        postsCount: () => casual.integer(0),
    }),

    Post: () => (
        {
            id: casual.uuid,
            text: casual.text,
            author: casual.random_element(usersIds),
            image: 'https://picsum.photos/seed/picsum/200/300',
            commentsCount: () => casual.integer(0),
            likesCount: () => casual.integer(0),
            latestLike: casual.first_name,
            createdAt: () => casual.date,
        }
    ),

    Comment: () => ({
        id: casual.uuid,
        comment: casual.text,
        post: casual.random_element(postsIds),
        createdAt: () => casual.date(),
    }),

    Like: () => ({
        id: casual.uuid,
        user: casual.random_element(usersIds),
        post: casual.random_element(postsIds),
    }),

    Query: () => ({
        getPostByUserId: ()=>[...new Array(casual.integer(10, 100))],
        getFeed: ()=>[...new Array(casual.integer(10, 100))],
        getNotificationByUserId: ()=>[...new Array(casual.integer(10, 100))],
        getCommentByPostId: ()=>[...new Array(casual.integer(10, 100))],
        getLikesByPostId: ()=>[...new Array(casual.integer(10, 100))],
        searchUsers: ()=>[...new Array(casual.integer(10, 100))],
    }),
};

// Our code is being watched and recompiled now thanks to ts-node-dev

const typeDefs = gql`
    type Query {
        message: String!
    }
`

const resolvers: IResolvers = {
    Query: {
        message: () => 'It works'
    }
}

const config: Config = {
    typeDefs: typeDefs,
    resolvers: resolvers,
}

async function startApolloServer(){
    const PORT = 8080

    const app: Application = express()

    app.use(cors())

    const server: ApolloServer = new ApolloServer({schema, mocks: true, mockEntireSchema: false})

    await server.start()

    server.applyMiddleware({ app, path: `/graphql`})

    app.listen(PORT, ()=>{
        console.log(`Server is running at http://localhost:${PORT}`)
    })
}

startApolloServer()