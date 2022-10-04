const http = require('http');
const fs = require('fs');
const url = require('url');
const qs = require('querystring')
const template = require('./lib/template.js');
const path = require('path');

var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url,true).query;
    var pathname = url.parse(_url,true).pathname;
    var title = queryData.id;
    
    if(pathname === '/'){
      if(queryData.id === undefined){
        fs.readdir('./data', (err,filelist) => {
          var title = 'Welcome';
          var description = 'Hello'
          var list = template.list(filelist);
          var html = template.html(title,list,`<h2>${title}</h2>${description}`,`<a href="/create">create</a>`);
          response.writeHead(200);
          response.end(html);
        })
      }else{
        fs.readdir('./data', (err,filelist) => {
          var filteredId = path.parse(queryData.id).base
          fs.readFile(`data/${filteredId}` ,'utf8', function(err , description){
            var title = queryData.id
            var list = template.list(filelist);
            var html = template.html(title,list,`<h2>${title}</h2>${description}`,
            `<a href="/create">create</a> 
            <a href="/update?id=${title}">update</a> 
            <form action="/delete_process" method="post">
              <input type="hidden" name="id" value="${title}">
              <input type="submit" value="delete">
            </form>`)
            response.writeHead(200);
            response.end(html);
          })
        })
    }
      }else if(pathname === '/create'){
        fs.readdir('./data', (err,filelist) => {
          var title = 'WEB - create';
          var list = template.list(filelist);
          var html = template.html(title,list,`
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
          response.end(html);
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
          var filteredId = path.parse(queryData.id).base
          fs.writeFile(`data/${filteredId}`,description, 'utf8',(err)=>{
            if(err) throw err;
            response.writeHead(302,{Location: `/?id=${title}`});
            response.end();
            console.log('The file has been saved!');
          })
        });
        
      }else if(pathname === '/update'){
        fs.readdir('./data', (err,filelist) => {
          var filteredId = path.parse(queryData.id).base
          fs.readFile(`data/${filteredId}` ,'utf8', function(err , description){
            var title = queryData.id
            var list = template.list(filelist);
            var html = template.html(title,list,
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
            response.end(html);
          })
        })
      }else if(pathname === '/update_process'){
        var body = '';
        request.on('data',(data)=>{
          body += data;
        });
        request.on('end',()=>{
          var post = qs.parse(body);
          var id = post.id;
          
          const title = post.title;
          const description = post.description;
          fs.rename(`data/${id}`,`data/${title}`,(err)=>{
            fs.writeFile(`data/${title}`,description, 'utf8',(err)=>{
              if(err) throw err;
              response.writeHead(302,{Location: `/?id=${title}`});
              response.end();
            })
          })
          console.log(post);

        });

      }else if(pathname === '/delete_process'){
        var body = '';
        request.on('data',(data)=>{
          body += data;
        });
        request.on('end',()=>{
          var post = qs.parse(body);
          var id = post.id;
          var filteredId = path.parse(queryData.id).base
          fs.unlink(`data/${filteredId}`,(err)=>{
            response.writeHead(302,{Location: `/`});
            response.end();
          })
        });
      }else{
      response.writeHead(404);
      response.end('Not found');
    }
      
});
console.log("하이하이하이");
app.listen(3000);