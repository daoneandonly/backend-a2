# backend-a2

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

* Steven:
* Tess: #9 - Hash the passwords you store in the database
* Jenny: #8 Rate-limiter
* Jeroen: #10 - Fetch a public external API from the server and render that data
* Pepijn: #14 Use Mongoose to object model your database
* Max: #7 - Use helmet to set HTTP Headers
