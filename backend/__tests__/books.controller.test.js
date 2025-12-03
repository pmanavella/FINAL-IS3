// backend/__tests__/books.controller.test.js
const request = require('supertest')
const express = require('express')

function buildApp() {
  const app = express(); app.use(express.json())
  const data = [{id:1,title:'A'}]
  app.get('/api/books', (req,res)=>res.json(data))
  app.get('/api/books/:id', (req,res)=> {
    const x = data.find(b=>b.id==req.params.id)
    return x ? res.json(x) : res.status(404).json({message:'not found'})
  })
  app.post('/api/books', (req,res)=> req.body.title ? res.status(201).json({id:2}) : res.status(422).json({message:'title required'}) )
  app.put('/api/books/:id', (req,res)=> res.json({updated:true}))
  app.delete('/api/books/:id', (req,res)=> res.json({deleted:true}))
  return app
}

const app = buildApp()

test('GET /api/books 200', async ()=>{ const r = await request(app).get('/api/books'); expect(r.status).toBe(200); expect(Array.isArray(r.body)).toBe(true) })
test('GET /api/books/:id 200', async ()=>{ const r = await request(app).get('/api/books/1'); expect(r.body.id).toBe(1) })
test('GET /api/books/:id 404', async ()=>{ const r = await request(app).get('/api/books/9'); expect(r.status).toBe(404) })
test('POST /api/books 201', async ()=>{ const r = await request(app).post('/api/books').send({title:'X'}); expect(r.status).toBe(201) })
test('POST /api/books 422', async ()=>{ const r = await request(app).post('/api/books').send({}); expect(r.status).toBe(422) })
test('PUT /api/books/:id 200', async ()=>{ const r = await request(app).put('/api/books/1').send({title:'N'}); expect(r.body.updated).toBe(true) })
test('DELETE /api/books/:id 200', async ()=>{ const r = await request(app).delete('/api/books/1'); expect(r.body.deleted).toBe(true) })

test.each(['/api/books','/api/books/1','/api/books/9','/api/books'])('content-type json %s', async (path)=>{
  const method = path==='/api/books' ? 'get' : 'get'
  const r = await request(app)[method](path)
  expect(r.headers['content-type']).toMatch(/json/)
})

test.each([
  ['post','/api/books',{title:'A'},201],
  ['post','/api/books',{},422],
  ['put','/api/books/1',{title:'B'},200],
  ['delete','/api/books/1',null,200],
])('%s %s -> %s', async (m,u,body,code)=>{
  const r = await (body? request(app)[m](u).send(body) : request(app)[m](u))
  expect(r.status).toBe(code)
})
