import express from "express";
import bodyParser from 'body-parser';
import pg from "pg"; // Use named import for Client
import dotenv from 'dotenv'; // Import dotenv to load environment variables
dotenv.config();
const app = express();
const port =4000;

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

// Create a new client instance using DATABASE_URL

// const db = new pg.Client({
//     user:"postgres",
//     host:"127.0.0.1",
//     database:"World",
//     password:"postgres",
//     port:5432,


// });
// db.connect();

const db = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Required for secure connections on Heroku
    }
 });
 db.connect()
    .then(() => console.log("Connected to the database"))
    .catch(err => console.error("Connection error", err.stack));


let quiz =[
    {country:"Algeria", capital:"Algeria"},
    {country:"United Kingdom", capital:"London"},
    {country:"United States Of America", capital:"New York"},
];

db.query("SELECT * FROM capitals",(err,res)=>{
    if(err){
        console.error("Error executing query",err.stack);
    }else{
        quiz=res.rows;
        console.log("Loaded quiz data:", quiz); // Log the retrieved data
       
    }
    db.end();
});


let totalScore=0;

let currentQ={};

app.get("/", async(req,res)=>{
  await nextQuestion();
  console.log(currentQ);
 res.render("index.ejs",{question:currentQ});
})
app.post("/submit",(req,res)=>{
    let answer=req.body.answer;
    let isCorrect=false;
    if(currentQ.capital.toLowerCase() === answer.toLowerCase()){
        totalScore++
        console.log(totalScore);
        isCorrect=true;
 }
 nextQuestion();
 res.render("index.ejs",{
    question:currentQ ,
    score:totalScore,
    wasCorrect:isCorrect
 });
})

async function nextQuestion() {
    const rendomQ= quiz[Math.floor(Math.random() * quiz.length)];
    currentQ=rendomQ;
}
app.listen(port,()=>{
    console.log(`Server runing in port number ${port}`);
});