import express from 'express';
import bodyParser from 'body-parser';
import { filterImageFromURL, deleteLocalFiles } from './util/util';
const path = require('path');

function authentication(req: any, res: any, next: any) {
    var authheader = req.headers.authentication;
    console.log(req.headers);
 
    if (!authheader) {
        res.status(403).send('authentication required to access API');
    }
 
    if (authheader == 'admin') {
        // If Authorized user
        next();
    } else {
        res.status(401).send('unauthorized');
    }
}

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // @TODO1 IMPLEMENT A RESTFUL ENDPOINT
  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // IT SHOULD
  //    1
  //    1. validate the image_url query
  //    2. call filterImageFromURL(image_url) to filter the image
  //    3. send the resulting file in the response
  //    4. deletes any files on the server on finish of the response
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

  /**************************************************************************** */
  // app.use(authentication)
  app.get("/filteredimage", async ( req, res ) => {
    let image_url = req.query.image_url;
    let filepath = '';
    var regexpression = 
      /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
    
    if (!regexpression.test(image_url)) {
      res.send('URL is invalid!');
    }
    try {
      filepath = await filterImageFromURL(image_url);
    } catch (err) {
      res.status(422).send(err);
    }
    // console.log(filepath);
    const directoryPath = path.join(__dirname, 'util/tmp/');

    res.sendFile(filepath, () => deleteLocalFiles([filepath]));
  });

  //! END @TODO1
  
  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();
