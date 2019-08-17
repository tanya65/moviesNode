let express=require('express');
let app=express();
let mysql=require('mysql');
var cors = require('cors');
let listOfActors=new Object();

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

var allowedOrigins = ['http://127.0.0.1:8081'];
app.use(cors({
    origin: function(origin, callback){
      if(!origin) return callback(null, true);
      if(allowedOrigins.indexOf(origin) === -1){
        var msg = 'The CORS policy for this site does not ' +
                  'allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    }
  }));

var con = require('./config.js').localConnect();
con.connect(); 

app.post('/addNew',(req,res)=>{

    var sql = "INSERT INTO movies ( name, year, plot) VALUES ( '"+ req.body.name +"', '"+req.body.year+"', '"+req.body.plot+"')";  
    con.query(sql, function (err, result) {  
    if (err) throw err;  
    console.log("1 record inserted");  
    });

    let actorsArr=new Array;
    let cast=req.body.cast;
    cast=cast.trim();
    actorsArr=cast.split(',');
    console.log("actorsarr: "+actorsArr);

    for(let actor of actorsArr){
        console.log("actor:"+actor);
        if(!(actor in listOfActors)){
            sql = "INSERT INTO actors ()" 
            
        }
    }

    res.send("1 record inserted");

})

app.get('/getActors',(req,res)=>{

    query("select * from actors")
    .then((actors)=>{
        res.send(actors);
    });

})


app.get('/getMovies',(req,res)=>{
        
    let actorsList=new Object();
    let actorMovieList=new Object();
    let moviesList=new Array();
    query("select * from actors")
    .then((actors)=>{
        this.listOfActors=new Object();
        console.log("inside .then actors ");
        for(let actor of actors){
            listOfActors[actor.name]=actor.id;
            actorsList[actor.id]=actor.name;
        }
        console.log("actorlist: "+JSON.stringify(actorsList));
        query("select * from actor_movies")
        .then((rows)=>{
            console.log("inside .then actor_movies");
            for(let row of rows){
                if(actorMovieList[row.movie_id]==null){
                    actorMovieList[row.movie_id]=new Array();
                }
                actorMovieList[row.movie_id].push(actorsList[row.actor_id]);
            }
           console.log("actormovies: "+JSON.stringify(actorMovieList));
        query("select * from movies")
        .then((movies)=>{
            console.log("inside .then movies");
            for(let movie of movies){
                movie=Object.assign(movie,{"cast":actorMovieList[movie.id]});
                moviesList.push(movie);
            }
            
            res.send(moviesList);
        })

    })
    })   
    .catch((err)=>console.log("error in fetching movies: "+err));
  
})

function query(sql, args){
    return new Promise( ( resolve, reject ) => {
        con.query( sql, args, ( err, rows ) => {
            if ( err )
                return reject( err );
            resolve( rows );
        } );
    } );
    }


app.listen(8081,()=>{
    console.log("listening..");
});