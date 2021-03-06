# backend-a2

Hi! Thanks for looking through this repo. This is a repo made for the progress of the course of cmda-be.

## How to run
Currently this repo has a `app.js` file that spins up an express server.

First of all, clone this project by running this in your terminal.

```bash
git clone https://github.com/daoneandonly/backend-a2
```

Then move into the project
```bash
cd backend-a2
```

### Running the Node script

First install the project by running
```bash
npm install
```
Now run node `dev` script which will run `app.js`. Do this by running the following command

```bash
npm run dev
```

### Starting the project
If you wish to start the project you can run the npm `start` command:

```sh
npm run start
```


# Database structure

The database currently supports a single structure for a user. A `user` entity in the following structure:

```js
{
    "_id": {
        "$oid": "60632c4f2d65f7ed68f39dff"
    },
    "email": "test@gmail.com",
    "password": "$2b$10$R/SEUma2JyWQmpfcJBf7zOgdbDc5AnzCvDybHqBKouqIR1o3Jgl6y",
    "profileData": {
        "firstName": "Test",
        "LastName": "Testy",
        "age": 18,
        "bio": "bio",
        "photo": "/img/61667b1cdf12cc4fb17283b1a617cca8.jpg",
        "gender": "him",
        "countries": ["country 1", "country 2", "country 3"],
        "preferences": {
            "gender": "her",
            "minAge": 18,
            "maxAge": 69,
            "maxDistance": 200
        }
    }
}
```

# For the team

## Branch
We work with branches to work along with eachother. `Main` should *never* be merged without approval. Anything feature should be merged to the `develop` branch.

### How to add branch
First create a branch with the command
```sh
git branch -m "name-of-your-feature"
```

Then switch to that branch by using `checkout`.
```sh
git checkout "name-of-your-feature"
```

Alternatively you can do both at the same time by using the flag `-b` in the checkout command
```sh
git checkout -b "name-of-your-feature"
```

Do your code and don't forget to commit often

## Topics
Add the topic you're working on here!

|Name | Topic|
|---|---|
|Steven | SCSS, MVC model, project management| 
|Tess | #9 - Hash the passwords you store in the database | 
| Jenny | #8 Rate-limiter |
| Jeroen | #10 - Fetch a public external API from the server and render that data |
| Pepijn | #14 Use Mongoose to object model your database |
| Max | #7 - Use helmet to set HTTP Headers |
