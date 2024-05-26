const express = require('express')
const bodyParser = require('body-parser')
const routers = require('./src/routers/main');
require('dotenv').config()


const app = express()
app.set('port', process.env.PORT || '5050')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))

app.get('/', (req, rest, next) => {rest.send({resultado: 'OK'})})

app.use('/app', routers)

app.listen(app.get('port'), () => {
    console.log(`Conectado al pueto ${app.get('port')}`)
})