const http = require('http');
const fs = require('fs');
const url = require('url');
const path = require('path');
const qs = require('querystring')

function templateHTML(title,list,body,control){
  return`
   <!doctype html>
    <html>
    <head>
      <title>WEB1 - ${title}</title>
      <meta charset="utf-8">
    </head>
    <body>
      <h1><a href="/">WEB</a></h1>
      ${list}
      ${control}
      ${body}
    </body>
    </html>
  `
}

function templateList(filelist){
  var list = '<ul>';
  var i = 0;
  while( i < filelist.length){
    list = list + `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`
    i = i + 1;
  }
  list = list+'</ul>';

  return list;
}

var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url,true).query;
    var pathname = url.parse(_url,true).pathname;
    var title = queryData.id;
    
  console.log(url.parse(_url,true));
    if(pathname === '/'){
      if(queryData.id === undefined){
        fs.readdir('./data', (err,filelist) => {
          var title = 'Welcome';
          var description = 'Hello'
          var list = templateList(filelist);
          var template = templateHTML(title,list,`<h2>${title}</h2>${description}`,`<a href="/create">create</a>`);
          response.writeHead(200);
          response.end(template);
        })
      }else{
        fs.readdir('./data', (err,filelist) => {
          fs.readFile(`data/${title}` ,'utf8', function(err , description){
            var title = queryData.id
            var list = templateList(filelist);
            var template = templateHTML(title,list,`<h2>${title}</h2>${description}`,`<a href="/create">create</a> <a href="/update?id=${title}">update</a>`)
            response.writeHead(200);
            response.end(template);
          })
        })
    }
      }else if(pathname === '/create'){
        fs.readdir('./data', (err,filelist) => {
          var title = 'WEB - create';
          var list = templateList(filelist);
          var template = templateHTML(title,list,`
            <form action="/create_process" method="post" >
              <p><input type="text" name="title" placeholder="title"></p>
              <p>
                <textarea name="description"></textarea>
              </p>
              <p>
                <input type="submit">
              </p>
            </form>
          `,'');
          response.writeHead(200);
          response.end(template);
        })
      }else if(pathname === '/create_process'){
        var body = '';

        request.on('data',(data)=>{
          body += data;

          if(body.length > 1e6)
            request.connection.destroy()
        });
        request.on('end',()=>{
          var post = qs.parse(body);
          const title = post.title;
          const description = post.description
          fs.writeFile(`data/${title}`,description, 'utf8',(err)=>{
            
            if(err) throw err;
            response.writeHead(302,{Location: `/?id=${title}`});
            response.end();
            console.log('The file has been saved!');
          })
        });
        
      }else if(pathname === '/update'){
        fs.readdir('./data', (err,filelist) => {
          fs.readFile(`data/${queryData.id}` ,'utf8', function(err , description){
            var title = queryData.id
            var list = templateList(filelist);
            var template = templateHTML(title,list,
              `
                <form action="/update_process" method="post" >\
                  <input type="hidden" name="id" placeholder="title" value="${title}">
                  <p><input type="text" name="title" placeholder="title" value="${title}"></p>
                  <p>
                    <textarea name="description">${description}</textarea>
                  </p>
                  <p>
                    <input type="submit">
                  </p>
                </form>
              `,
              `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`)
            response.writeHead(200);
            response.end(template);
          })
        })
      }else{
      response.writeHead(404);
      response.end('Not found');
    }
      
});
console.log("하이하이하이");
app.listen(3000);