import * as express from 'express';
import * as path from 'path';
const app = express();
const port = 25565;


console.log(__dirname);
app.use(express.static('dist/public'));

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})