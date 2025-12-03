// backend/__tests__/loans.controller.test.js
const request = require('supertest')
const express = require('express')

function appLoans(){
  const app=express(); app.use(express.json())
  const loans=[{id:1,bookId:1,client:'Pilar'}]
  app.get('/api/loans',(_,res)=>res.json(loans))
  app.post('/api/loans',(req,res)=> req.body.bookId ? res.status(201).json({id:2}) : res.status(422).json({message:'bookId required'}) )
  app.put('/api/loans/1',(req,res)=>res.json({returned:true}))
  app.delete('/api/loans/1',(_,res)=>res.json({deleted:true}))
  return app
}
const app=appLoans()

test('list', async()=>{ const r=await request(app).get('/api/loans'); expect(r.status).toBe(200) })
test('create ok', async()=>{ const r=await request(app).post('/api/loans').send({bookId:1}); expect(r.status).toBe(201) })
test('create 422', async()=>{ const r=await request(app).post('/api/loans').send({}); expect(r.status).toBe(422) })
test('update ok', async()=>{ const r=await request(app).put('/api/loans/1').send({returned:true}); expect(r.body.returned).toBe(true) })
test('delete ok', async()=>{ const r=await request(app).delete('/api/loans/1'); expect(r.body.deleted).toBe(true) })

test.each([
  ['get','/api/loans',200],
  ['post','/api/loans',201],
  ['put','/api/loans/1',200],
])('%s %s', async(m,u,code)=>{
  const r = await (m==='post'? request(app)[m](u).send({bookId:1}) : request(app)[m](u))
  expect(r.status).toBe(code)
})
