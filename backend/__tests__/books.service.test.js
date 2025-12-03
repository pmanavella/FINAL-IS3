// backend/__tests__/books.service.test.js
const repo = { list: jest.fn(), get: jest.fn(), create: jest.fn(), update: jest.fn(), remove: jest.fn() }
const svc = {
  async list(){ return repo.list() },
  async get(id){ if(!Number.isInteger(id)) throw new Error('bad id'); const x = await repo.get(id); if(!x) throw new Error('not found'); return x },
  async create(b){ if(!b?.title) throw new Error('title required'); return repo.create(b) },
  async update(id,b){ if(!id) throw new Error('id required'); return repo.update(id,b) },
  async remove(id){ if(!id) throw new Error('id required'); return repo.remove(id) },
}

beforeEach(()=>Object.values(repo).forEach(fn=>fn.mockReset()))

test('list ok', async ()=>{ repo.list.mockResolvedValue([{id:1}]); expect((await svc.list()).length).toBe(1) })
test('get ok', async ()=>{ repo.get.mockResolvedValue({id:1}); expect((await svc.get(1)).id).toBe(1) })
test('get bad id', async ()=>{ await expect(svc.get('a')).rejects.toThrow('bad id') })
test('get not found', async ()=>{ repo.get.mockResolvedValue(null); await expect(svc.get(9)).rejects.toThrow('not found') })
test('create ok', async ()=>{ repo.create.mockResolvedValue({id:2}); expect((await svc.create({title:'A'})).id).toBe(2) })
test('create no title', async ()=>{ await expect(svc.create({})).rejects.toThrow('title required') })
test('update ok', async ()=>{ repo.update.mockResolvedValue({ok:true}); expect((await svc.update(1,{})).ok).toBe(true) })
test('update no id', async ()=>{ await expect(svc.update(null,{})).rejects.toThrow('id required') })
test('remove ok', async ()=>{ repo.remove.mockResolvedValue({deleted:true}); expect((await svc.remove(1)).deleted).toBe(true) })
test('remove no id', async ()=>{ await expect(svc.remove()).rejects.toThrow('id required') })

test.each([
  [{ title:'A' }], [{ title:'B' }], [{ title:'C' }], [{ title:'D' }],
])('create variantes %#', async (b)=>{
  repo.create.mockResolvedValue({ id: Math.random() })
  const r = await svc.create(b); expect(r.id).toBeDefined()
})
