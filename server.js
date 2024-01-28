import express from 'express';
import bodyParser from 'body-parser';
import { exec } from 'child_process';
import { readFileSync } from 'fs';

const app = express();
const PORT = 8080;
const payPath = './interactsh_payload.txt';
const filePath = './res.out';
const EXECUTABLE = './interactsh-client'; // Replace with the actual executable path
const EXECUTABLE_FLAGS = '-json -o ./res.out -ps'; // Replace with the actual flags

app.use(bodyParser.json());


exec(`${EXECUTABLE} ${EXECUTABLE_FLAGS}`, {
  encoding: 'utf-8',
});

// GET endpoint for /getInteractions
app.get('/gett', (req, res) => {
  try {

    const fileContent = readFileSync(filePath, 'utf-8');
    let str = fileContent.replace(/}/g, '},');
    let result = str.slice(0, -2);
    const resjson = '['+result+']';  //creating an array of objects

    let resout = JSON.parse(resjson);

    console.log(resout[0]);

    try{
    if(req.query.type == 'http'){

      const resfilter = resout.filter(obj =>
        obj.hasOwnProperty('protocol') && obj.protocol === 'http'
      );

      resout = resfilter;

      console.log("haha http")
    }
    else if(req.query.type == 'dns'){

      const resfilter = resout.filter(obj =>
        obj.hasOwnProperty('protocol') && obj.protocol === 'dns'
      );

      resout = resfilter;
    }
    }
    catch {

      console.log('protocol check error')
    }


    try {

  
      if(req.query.start != null && req.query.end !=null){

        let st = new Date(req.query.start);
        st = st.getTime();
        let et = new Date(req.query.end);
        et = et.getTime();

        const resfilter = resout.filter((obj)=>{
          if(obj.hasOwnProperty('timestamp')){

            let targetT = new Date(obj.timestamp);
            targetT = targetT.getTime();
            
          return targetT >= st && targetT <=et ;

        }

      }
      );

        resout = resfilter;
      }
      else if(req.query.start != null ){

        let st = new Date(req.query.start);
        st = st.getTime();


        const resfilter = resout.filter((obj)=>{
          if(obj.hasOwnProperty('timestamp')){

            let targetT = new Date(obj.timestamp);
            targetT = targetT.getTime();

            return targetT >= st;

          }

        }
        );

          resout = resfilter;
      }
      else if(req.query.end != null ){

        let et = new Date(req.query.end);
        et = et.getTime();

        const resfilter = resout.filter((obj)=>{
          if(obj.hasOwnProperty('timestamp')){

            let targetT = new Date(obj.timestamp);
            targetT = targetT.getTime();

          return targetT <=et ;
          }

        }
        );
      resout = resfilter;

      }
    } 
    catch{
       console.log("date check error")
    }
    try{
      
      if(req.query.address !=null){

        const resfilter = resout.filter(obj =>
          obj.hasOwnProperty('remote-address') && obj.remote-address == req.query.address
        );

        resout = resfilter;

       }
    }
    catch {
      console.log('address check error')
    }

try{
  if(req.query.page !=null || req.query.pagesize !=null){

  const page = parseInt(req.query.page) || 1;
  const pagesize = parseInt(req.query.pagesize) || 10;

  const startIndex = (page - 1) * pagesize;
  const endIndex = startIndex + pagesize;

  const paginated = resout.slice(startIndex, endIndex);

    resout = paginated;

  }
}
catch {

  console.log('address check error')
}


    const obj = {res : resout}
    res.status(200).send(obj);

  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/geturl', (req, res) => {
  try {
 

    const fileContent = readFileSync(payPath, 'utf-8');
    // const payresult = JSON.stringify(fileContent);

    const obj = {res:fileContent}

    // Respond with the content of the file
    res.status(200).send(obj);

  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
