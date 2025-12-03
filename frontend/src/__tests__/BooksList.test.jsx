// frontend/src/__tests__/BooksList.test.jsx
import React from "react";
import { describe, test, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

function BooksList({ items=[] }) {
  if(!items.length) return <p>No data</p>
  return <ul>{items.map(b=><li key={b.id}>{b.title}</li>)}</ul>
}

test('muestra vacío', ()=>{ render(<BooksList items={[]} />); expect(screen.getByText(/no data/i)).toBeInTheDocument() })
test.each([1,2,3,4,5,6,7])('renderiza %s items', (n)=>{
  const items = Array.from({length:n}, (_,i)=>({id:i+1, title:`B${i+1}`}))
  render(<BooksList items={items} />)
  expect(screen.getAllByRole('listitem').length).toBe(n)
})
