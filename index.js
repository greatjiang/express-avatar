const express = require('express')
const app = express()
const formidable = require('formidable')
const fs = require('fs')
const bestip = require('bestip')
const md5 = require('md5')
const connection = require('./mysqlAction')
const util = require('util')

app.listen(3000, (req, res) => {
  console.log(`ip-address:${bestip}`)
})

app.use(express.static('public'));

app.all('*', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'X-Requested-With')
  res.header('Access-Control-Allow-Methods', 'PUT, POST ,GET ,DELETE ,OPTIONS')
  res.header('X-Powered-By', '3.2.1')
  res.header('Content-Type', 'application/json;charset=utf-8')
  next()
})

app.get('/', (req, res) => {
  res.write('hello world')
})

app.post('/upload', (req, res) => {
  let form = new formidable.IncomingForm()
  form.parse(req, (error, fields, files) => {
    if (error) {
      res.status(200)
      res.json({
        code: -1,
        msg: '上传失败，请稍后再试~'
      })
    } else {
      let filename = files.file.name
      let arr = filename.split('.')
      if(arr[0].length>10){
        let str = arr[0].slice(0,11)
        filename = str+'.'+arr[1] 
      }
      const curtime = new Date().getTime()
      let imagetarget = curtime+''+filename
      console.log(imagetarget)
      const sql = "insert into avatar (img,inserttime) value ('"+imagetarget+"','"+curtime+"')"

      connection.query(sql, (err, result) => {
        if (err) {
          console.log(err)
          res.status(200)
          res.json({
            code: -1,
            msg: '数据库异常~'
          })
        } else {
          fs.writeFileSync(__dirname+'/public/images/'+imagetarget,fs.readFileSync(files.file.path))
          res.status(200)
          res.json({
            code: 0,
            data: '',
            msg: '上传成功~'
          })
        }
      })

    }
  })
})

app.post('/getAvatar', (req, res) => {
  const sql = 'select img from avatar order by inserttime desc limit 0,1'
  connection.query(sql, (err, result) => {
    if (err) {
      console.log(err)
      res.status(200)
      res.json({
        code: -1,
        msg: '数据库异常~'
      })
    } else {
      const avatar = result[0].img
      res.status(200)
      res.json({
        code: 0,
        data: {
          avatar: `http://${bestip}:3000/images/${avatar}`
        },
        msg: ''
      })
    }
  })
})