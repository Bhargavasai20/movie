const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

const databasePath = path.join(__dirname, 'moviesData.db')

const app = express()

app.use(express.json())

let database = null

const initializeDBAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

const convertDbObjectToResponseObject = dbObject => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_Actor,
  }
}

const convertDirectorDbobjtoResponseObj = dbObject => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  }
}
// api 1

app.get('/movies/', async (request, response) => {
  const getPlayersQuery = `
 SELECT
 movie_name
 FROM
 movie;`
  const playersArray = await database.all(getPlayersQuery)
  response.send(
    playersArray.map(eachmovie => convertDbObjectToResponseObject(eachmovie)),
  )
})

//api 2

app.post('/movies/', async (request, response) => {
  const movieDetails = request.body
  const {directorId, movieName, leadActor} = movieDetails
  const addMovieQuery = `
  INSERT INTO 
  movie (director_id,movie_name,lead_actor)
  VALUES 
  (
    ${directorId},
    '${movieName}',
    '${leadActor}'
  );)`
  const dbResponse = await database.run(addMovieQuery)
  response.send('Movie Successfully Added')
})

//api 3

app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getMovieQuery = `
  SELECT 
  *
  FROM
  movie
  where 
  movie_id = ${movieId}`
  const movie = await database.get(getMovieQuery)
  response.send(convertDbObjectToResponseObject(movie))
})

// api 4
app.put('/movies/:movieId/', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body
  const {movieId} = request.params
  const updateMovieQuery = `
  UPDATE
    movie
  SET 
    director_id = '${directorId}',
    movie_name = '${movieName}',
    lead_actor = '${leadActor}'
  WHERE
    movie_id = ${movieId}; `
  await database.run(updateMovieQuery)
  response.send('Movie Detail Updated')
})

//api 5

app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deleteMovieQuery = `
  DELETE FROM  
    movie
  WHERE 
    movie_id = ${movieId};`
  await database.run(deleteMovieQuery)
  response.send('Movie Removed')
})

//api 6

app.get('/directors/', async (request, response) => {
  const getDirectorQuery = `
 SELECT
 *
 FROM
 director;`
  const playersArray = await database.all(getDirectorQuery)
  response.send(
    playersArray.map(eachmovie => convertDirectorDbobjtoResponseObj(eachmovie)),
  )
})

//api 7

app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const getDirectorQuery = `
  SELECT 
  movie_name
  FROM
  director INNER JOIN movie
  on director.director_id = movie.director_id
  where 
  director.director_id = ${directorId}`
  const movie = await database.get(getDirectorQuery)
  response.send(convertDbObjectToResponseObject(movie))
})
module.exports = app
