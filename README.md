# barbeQuery API

This is the API for barbeQuery - a modifiable recipe book for smoking and
grilling meat. Create recipes that include the time and temperature of the cook,
as well as the fuel source and instructions. View existing recipes and modify
your own if you find a better variation!

## Important Links

- [Other Repo](www.link.com)
- [Deployed API](www.link.com)
- [Deployed Client](www.link.com)

## Resources

User Schema
```js
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  hashedPassword: {
    type: String,
    required: true
  },
  token: String
}, {
  timestamps: true,
  toObject: {
    transform: (_doc, user) => {
      delete user.hashedPassword
      return user
    }
  }
})
```
Recipe Schema
```js
const recipeSchema = new mongoose.Schema({
  ingredient: {
    type: String,
    required: true
  },
  temperature: {
    type: Number,
    required: true,
    min: 180,
    max: 350
  },
  time: {
    type: Number,
    required: true,
    min: 2,
    max: 24
  },
  fuel: {
    type: String,
    required: true
  },
  directions: {
    type: String,
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
})
```
### User Stories

* As a first-time user, I want to be able to create an account with a unique
email and password.
* As a returning user, I want to be able to log into my account with my
credentials.
* As a logged in user, I want to be able to change my password.
* As a logged in user, I want to be able to log out of my account.
* As a logged in user, I want to be able to create a new entry with ingredient,
temperature, time, wood, and directions.
* As a logged in user, I want to be able to find all the recipes.
* As a logged in user, I want to be able to modify an existing recipe.
* As a logged in user, I want to be able to delete an existing recipe.
* As a logged in user, I want the UI to guide me through the steps with
messaging, hiding unimportant elements, and modals.

### Technologies Used

- Express
- Mongoose
- MongoDB


### Unsolved Problems/Strech Goals

- Search individual recipes by name
- Search recipes by portion of name (searching "beef" could return "beef
-   brisket", and "beef ribs")
- Add commentary to user's own recipes
- Add commentary to other user's recipes

## Images

#### ERD:
![ERD](https://i.imgur.com/2hVqBLP.jpg)
