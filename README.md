# URL- Shortner
a node.js Shortener

# Features
* uses a open API so anyone can easily create URS with a post request.
* in depth URL logging
* a basic front end that interacts with the vue.js package.

# Client side front end
![front end](https://cdn.discordapp.com/attachments/738840097218101309/745433534683939006/unknown.png) 
* This is fully client side and very lightweight allowing for endless possibilities 
## Basic use
* go to `/` to access the front end
* send a post request to `/url` to create a url: (you don’t need to send a ID one will be randomly generated if you don't)
```
{
  "url":"https://freddie.pw",
  "id":"redirectID"
}
```
* GET `/:id/data` to get infomation abut the url like 
  * Reuests
  * ID
  * URL

## Setup
1. download the repo
1. run `npm i`
1. run `npm start`


