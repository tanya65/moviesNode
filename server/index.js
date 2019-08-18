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


function addActorMovie(castArr,movieId){
    console.log("new cast: "+JSON.stringify(castArr));
    for(let actor of castArr){
        var sql="select * from actor_movies where actor_id='"+actor.id+"' and movie_id='"+movieId+"'";
        con.query(sql, function (err, result) {  
            if (err) throw err;
            console.log("result: "+JSON.stringify(result));
         if (result.length==0){
            sql = "INSERT INTO actor_movies ( actor_id, movie_id) VALUES ( "+ actor.id +", "+movieId+")";  
            con.query(sql, function (err, result) {  
            if (err) throw err;  
            console.log("result after insert: "+JSON.stringify(result));
            
        });
         }
        })

    }
    
return;
}

app.post('/addNew',(req,res)=>{

    var sql = "INSERT INTO movies ( name, year, plot) VALUES ( '"+ req.body.name +"', '"+req.body.year+"', '"+req.body.plot+"')";  
    con.query(sql, function (err, result) {  
    if (err) throw err;  
    addActorMovie(req.body.cast,result.insertId);
    });

    res.send("1 record inserted");

})

app.get('/getActors',(req,res)=>{

    query("select * from actors")
    .then((actors)=>{
        res.send(actors);
    });
})

app.post('/getActorsByMovie',(req,res)=>{
    let actorList=[];
    
    query("select actor_id from actor_movies where movie_id="+req.body.id)
    .then((actors)=>{
        res.send(actors);
    });

})


app.post('/updateMovie',(req,res)=>{
    
    var sql = "UPDATE movies SET name='"+req.body.name+"', year='"+req.body.year+"',plot='"+req.body.plot+"' where id='"+req.body.id+"'";  
    con.query(sql, function (err, result) {  
    if (err) throw err;  
    addActorMovie(req.body.newCast,req.body.id);
    for(let actor of req.body.deletedCast){
        sql="DELETE FROM actor_movies WHERE movie_id='"+req.body.id+"' and actor_id='"+actor.id+"'";
        con.query(sql, function (err, result) {
            if (err) throw err;  
        });
    }
    setTimeout(function () {
        res.send("done!");
    }, 3000); 
    
    });
});

app.post('/addActor',(req,res)=>{

    var sql = "INSERT INTO actors ( name, sex, DoB, Bio) VALUES ( '"+ req.body.name +"', '"+req.body.sex+"', '"+req.body.dob+"','"+req.body.bio+"')";  
    con.query(sql, function (err, result) {  
    if (err) throw err;  
   res.send(JSON.stringify(result));
    })
    
})

app.get('/getMovies',(req,res)=>{
        
    let actorsList=new Object();
    let actorMovieList=new Object();
    let moviesList=new Array();
    query("select * from actors")
    .then((actors)=>{
        this.listOfActors=new Object();
       
        for(let actor of actors){
            listOfActors[actor.name]=actor.id;
            actorsList[actor.id]=actor.name;
        }
       
        query("select * from actor_movies")
        .then((rows)=>{
           
            for(let row of rows){
                if(actorMovieList[row.movie_id]==null){
                    actorMovieList[row.movie_id]=new Array();
                }
                actorMovieList[row.movie_id].push(actorsList[row.actor_id]);
            }
          
        query("select * from movies")
        .then((movies)=>{
           
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
})