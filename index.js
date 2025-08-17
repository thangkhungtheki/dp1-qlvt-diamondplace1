var app = require("./app")
// var http = require("http")

// var server = http.createServer(app)

//server.listen(4000)
const port = process.env.portsv
app.listen(port,()=>{
    console.log("Server run port: ", port)
})
