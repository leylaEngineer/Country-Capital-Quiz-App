import express from "express";
import bodyParser from 'body-parser';
import pg from "pg";
const app = express();
const port =4000;

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

const db = new pg.Client({
    user:"postgres",
    host:"localhost",
    database:"World",
    password:"postgres",
    port:5432,


});
db.connect();

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