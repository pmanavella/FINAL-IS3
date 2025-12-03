// backend/__tests__/sales.controller.test.js
const request = require('supertest')
const express = require('express')

function appSales(){
  const app=express(); app.use(express.json())
  app.post('/api/sales',(req,res)=> req.body.total>0 ? res.status(201).json({id:1}) : res.status(422).json({message:'total>0'}) )
  app.get('/api/sales/health',(_,res)=>res.json({ok:true}))
  return app
}
const app=appSales()

test('sale ok', async()=>{ const r=await request(app).post('/api/sales').send({total:10}); expect(r.status).toBe(201) })
test('sale 422', async()=>{ const r=await request(app).post('/api/sales').send({total:0}); expect(r.status).toBe(422) })
test('health', async()=>{ const r=await request(app).get('/api/sales/health'); expect(r.body.ok).toBe(true) })

test.each([
  [{total: 1}, 201],
  [{total: 5}, 201],
  [{total: 0}, 422],
])('table sales %#', async (body,code)=>{
  const r=await request(app).post('/api/sales').send(body)
  expect(r.status).toBe(code)
})
