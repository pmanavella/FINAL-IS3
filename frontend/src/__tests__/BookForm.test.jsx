// frontend/src/__tests__/BookForm.test.jsx
import React from "react";
import { describe, test, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

function BookForm({ onSubmit }) {
  const [t,setT]=React.useState(''); const [a,setA]=React.useState('')
  const [err,setErr]=React.useState('')
  const submit=(e)=>{ e.preventDefault()
    if(!t.trim()) return setErr('Título requerido')
    if(a.trim().length<2) return setErr('Autor muy corto')
    onSubmit?.({ title:t, author:a })
  }
  return (
    <form onSubmit={submit}>
      <input aria-label="título" value={t} onChange={e=>setT(e.target.value)} />
      <input aria-label="autor" value={a} onChange={e=>setA(e.target.value)} />
      {err && <div role="alert">{err}</div>}
      <button type="submit">guardar</button>
    </form>
  )
}

let onSubmit
beforeEach(()=>{ onSubmit=vi.fn() })

test('render básico', () => { render(<BookForm />); expect(screen.getByLabelText(/título/i)).toBeInTheDocument() })

test.each([
  ['', 'A', 'Título requerido'],
  ['  ', 'AB', 'Título requerido'],
  ['El', 'A', 'Autor muy corto'],
])('validaciones t="%s" a="%s" -> %s', (t,a,msg)=>{
  render(<BookForm onSubmit={onSubmit}/>)
  fireEvent.change(screen.getByLabelText(/título/i), { target:{ value:t }})
  fireEvent.change(screen.getByLabelText(/autor/i), { target:{ value:a }})
  fireEvent.click(screen.getByText(/guardar/i))
  expect(screen.getByRole('alert').textContent).toBe(msg)
})

test.each([
  ['El principito','Antoine'],
  ['Clean Code','Martin'],
  ['1984','Orwell'],
  ['Dune','Herbert'],
  ['Ficciones','Borges'],
  ['Rayuela','Cortázar'],
  ['It','Stephen King'],
  ['Neuromancer','Gibson'],
])('submit OK %s - %s', (t,a)=>{
  render(<BookForm onSubmit={onSubmit}/>)
  fireEvent.change(screen.getByLabelText(/título/i), { target:{ value:t }})
  fireEvent.change(screen.getByLabelText(/autor/i), { target:{ value:a }})
  fireEvent.click(screen.getByText(/guardar/i))
  expect(onSubmit).toHaveBeenCalledWith({ title:t, author:a })
})
