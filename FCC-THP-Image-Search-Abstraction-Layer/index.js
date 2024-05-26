const express = require('express');
const path = require('path');
const app = express();
const apiKey = process.env['API_KEY']
const apiSearchEngine = process.env['SEARCH_ENGINE_ID']

const mongoose = require('mongoose')
const querySchema = new mongoose.Schema({
  searchQuery: String,
  timeSearched: String
})
const QueryModel = mongoose.model('QueryModel', querySchema)
const mongoURI = process.env['MONGO_URI']

const run = async (cb) => {
  try {
    await mongoose.connect(mongoURI)
    return await cb
  } catch (error){
    console.log('Error: Did not connect to DB', error)
  }
}

const findAll = async () => {
  let show = await QueryModel.find().select({_id:true, searchQuery:true, timeSearched:true})
  return show
}

const addItem = async (query) => {
  let time = new Date().toUTCString()
  let test = new QueryModel({
    searchQuery: query,
    timeSearched: time
  })
  let responsive = await test.save()
  console.log(responsive)
  return responsive
}

app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/', 'index.html'));
})

app.get('/query/:querySearch', async (req, res) => {
  const query = req.params.querySearch
  const pageNo = req.query.page
  let pageStartAt = 1 + (10 * (pageNo - 1))
  let imageSize = ""
  try {
    imageSize = req.query.size
  } catch {} 
  if (pageNo > 10){
    res.send('Error: Max page number is 10 for this search engine! Please try again.')
    return
  }
  let SEBaseURL =  `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${apiSearchEngine}&q=${query}&searchType=image&start=${pageStartAt}`
  
  if (imageSize){
    SEBaseURL += `&imgSize=${imageSize}`
  }

  try {
    let data = await fetch(SEBaseURL)
    let response = await data.json()
    const { items } = response;
    const result = {
      'images': []
    };
    items.forEach(item => {
      const { mime, link, title } = item
      const { width, height, byteSize, contextLink, thumbnailLink, thumbnailHeight, thumbnailWidth } = item.image
      let imgObj = {
        'type': mime,
        'width': width,
        'height': height,
        'size': byteSize,
        'url': link,
        'thumbnail': {
          'url': thumbnailLink,
          'width': thumbnailWidth,
          'height': thumbnailHeight
        },
        'description': title,
        'parentpage': contextLink
      }
      result.images.push(imgObj)
    })
    try {
      run(addItem(query))
      res.json(result)
    } catch (error){
      console.log('Error: Failed to add to DB', error)
      res.send('Error: Failed to add to DB', error)
    }
  } catch (error){
    console.log(error)
    res.send("Error: Could not search in google API", error)
  } 
})

app.get('/recent', async (req, res) => {
  try {
    let allQueries = await run(findAll())
    console.log(allQueries, "Allqueries")
    res.json(allQueries)
  } catch (error){
    console.log('Error: Failed to search DB', error)
    res.send('Error: Failed to search DB', error)
  }
})

const port = 3000;

app.listen(port, () => {
  console.log(`Server Running at https://localhost:${port}/`)
})

//https://developers.google.com/custom-search/v1/overview