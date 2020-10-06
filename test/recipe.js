process.env.TESTENV = true

let Recipe = require('../app/models/recipe.js')
let User = require('../app/models/user')

const crypto = require('crypto')

let chai = require('chai')
let chaiHttp = require('chai-http')
let server = require('../server')
chai.should()

chai.use(chaiHttp)

const token = crypto.randomBytes(16).toString('hex')
let userId
let recipeId

describe('Recipes', () => {
  const exampleParams = {
    ingredient: '13 JavaScript tricks SEI instructors don\'t want you to know',
    temperature: '325'
  }

  before(done => {
    Recipe.deleteMany({})
      .then(() => User.create({
        email: 'caleb',
        hashedPassword: '12345',
        token
      }))
      .then(user => {
        userId = user._id
        return user
      })
      .then(() => Recipe.create(Object.assign(exampleParams, {owner: userId})))
      .then(record => {
        recipeId = record._id
        done()
      })
      .catch(console.error)
  })

  describe('GET /recipes', () => {
    it('should get all the recipes', done => {
      chai.request(server)
        .get('/recipes')
        .set('Authorization', `Token token=${token}`)
        .end((e, res) => {
          res.should.have.status(200)
          res.body.recipes.should.be.a('array')
          res.body.recipes.length.should.be.eql(1)
          done()
        })
    })
  })

  describe('GET /recipes/:id', () => {
    it('should get one recipe', done => {
      chai.request(server)
        .get('/recipes/' + recipeId)
        .set('Authorization', `Token token=${token}`)
        .end((e, res) => {
          res.should.have.status(200)
          res.body.recipe.should.be.a('object')
          res.body.recipe.ingredient.should.eql(exampleParams.ingredient)
          done()
        })
    })
  })

  describe('DELETE /recipes/:id', () => {
    let recipeId

    before(done => {
      Recipe.create(Object.assign(exampleParams, { owner: userId }))
        .then(record => {
          recipeId = record._id
          done()
        })
        .catch(console.error)
    })

    it('must be owned by the user', done => {
      chai.request(server)
        .delete('/recipes/' + recipeId)
        .set('Authorization', `Bearer notarealtoken`)
        .end((e, res) => {
          res.should.have.status(401)
          done()
        })
    })

    it('should be succesful if you own the resource', done => {
      chai.request(server)
        .delete('/recipes/' + recipeId)
        .set('Authorization', `Bearer ${token}`)
        .end((e, res) => {
          res.should.have.status(204)
          done()
        })
    })

    it('should return 404 if the resource doesn\'t exist', done => {
      chai.request(server)
        .delete('/recipes/' + recipeId)
        .set('Authorization', `Bearer ${token}`)
        .end((e, res) => {
          res.should.have.status(404)
          done()
        })
    })
  })

  describe('POST /recipes', () => {
    it('should not POST an recipe without an ingredient', done => {
      let noIngredient = {
        ingredient: '',
        owner: 'fakedID'
      }
      chai.request(server)
        .post('/recipes')
        .set('Authorization', `Bearer ${token}`)
        .send({ recipe: noIngredient })
        .end((e, res) => {
          res.should.have.status(422)
          res.should.be.a('object')
          done()
        })
    })

    it('should not POST an recipe without temperature', done => {
      let noTemperature = {
        temperature: '',
        owner: 'fakeID'
      }
      chai.request(server)
        .post('/recipes')
        .set('Authorization', `Bearer ${token}`)
        .send({ recipe: noTemperature })
        .end((e, res) => {
          res.should.have.status(422)
          res.should.be.a('object')
          done()
        })
    })

    it('should not allow a POST from an unauthenticated user', done => {
      chai.request(server)
        .post('/recipes')
        .send({ recipe: exampleParams })
        .end((e, res) => {
          res.should.have.status(401)
          done()
        })
    })

    it('should POST an recipe with the correct params', done => {
      let validRecipe = {
        ingredient: 'I ran a shell command. You won\'t believe what happened next!',
        temperature: '300'
      }
      chai.request(server)
        .post('/recipes')
        .set('Authorization', `Bearer ${token}`)
        .send({ recipe: validRecipe })
        .end((e, res) => {
          res.should.have.status(201)
          res.body.should.be.a('object')
          res.body.should.have.property('recipe')
          res.body.recipe.should.have.property('ingredient')
          res.body.recipe.ingredient.should.eql(validRecipe.ingredient)
          done()
        })
    })
  })

  describe('PATCH /recipes/:id', () => {
    let recipeId

    const fields = {
      ingredient: 'Chicken wings',
      temperature: 275
    }

    before(async function () {
      const record = await Recipe.create(Object.assign(exampleParams, { owner: userId }))
      recipeId = record._id
    })

    it('must be owned by the user', done => {
      chai.request(server)
        .patch('/recipes/' + recipeId)
        .set('Authorization', `Bearer notarealtoken`)
        .send({ recipe: fields })
        .end((e, res) => {
          res.should.have.status(401)
          done()
        })
    })

    it('should update fields when PATCHed', done => {
      chai.request(server)
        .patch(`/recipes/${recipeId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ recipe: fields })
        .end((e, res) => {
          res.should.have.status(204)
          done()
        })
    })

    it('shows the updated recipe when fetched with GET', done => {
      chai.request(server)
        .get(`/recipes/${recipeId}`)
        .set('Authorization', `Bearer ${token}`)
        .end((e, res) => {
          res.should.have.status(200)
          res.body.should.be.a('object')
          res.body.recipe.ingredient.should.eql(fields.ingredient)
          res.body.recipe.temperature.should.eql(fields.temperature)
          done()
        })
    })

    it('doesn\'t overwrite fields with empty strings', done => {
      chai.request(server)
        .patch(`/recipes/${recipeId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ recipe: { ingredient: '' } })
        .then(() => {
          chai.request(server)
            .get(`/recipes/${recipeId}`)
            .set('Authorization', `Bearer ${token}`)
            .end((e, res) => {
              res.should.have.status(200)
              res.body.should.be.a('object')
              res.body.recipe.ingredient.should.eql(fields.ingredient)
              res.body.recipe.temperature.should.eql(fields.temperature)
              done()
            })
        })
    })
  })
})
