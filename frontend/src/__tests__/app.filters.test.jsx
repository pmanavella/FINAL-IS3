import { describe, it, beforeEach, vi, expect } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import App from '../App'

beforeEach(() => {
  global.fetch = vi.fn()
  global.alert = vi.fn()
})

const ok = (data) => Promise.resolve({ ok: true, json: async () => data })

describe('App filters and views', () => {
  it('cambia a Préstamos y carga lista', async () => {
    fetch.mockResolvedValueOnce(ok([]))
    render(<App />)
    await screen.findByText(/No hay libros cargados/i)
    fetch.mockResolvedValueOnce(ok([{ id: 1, book_title: 'X', borrower_name: 'Ana', borrower_email: '', start_date: Date.now(), due_date: Date.now(), status: 'ok' }]))
    fireEvent.click(screen.getByRole('button', { name: /Préstamos/i }))
    await screen.findByText('X')
  })

  it('cambia a Ventas y carga lista', async () => {
    fetch.mockResolvedValueOnce(ok([]))
    render(<App />)
    await screen.findByText(/No hay libros cargados/i)
    fetch.mockResolvedValueOnce(ok([{ id: 1, book_title: 'Y', buyer_name: 'Luis', quantity: 1, total_price: 10, sale_date: Date.now() }]))
    fireEvent.click(screen.getByRole('button', { name: /Ventas/i }))
    await screen.findByText('Y')
  })

  it('error cargando préstamos alerta', async () => {
    fetch.mockResolvedValueOnce(ok([]))
    render(<App />)
    await screen.findByText(/No hay libros cargados/i)
    fetch.mockRejectedValueOnce(new Error('net'))
    fireEvent.click(screen.getByRole('button', { name: /Préstamos/i }))
    await waitFor(() => expect(alert).toHaveBeenCalledWith('Error al cargar préstamos'))
  })

  it('error cargando ventas alerta', async () => {
    fetch.mockResolvedValueOnce(ok([]))
    render(<App />)
    await screen.findByText(/No hay libros cargados/i)
    fetch.mockRejectedValueOnce(new Error('net'))
    fireEvent.click(screen.getByRole('button', { name: /Ventas/i }))
    await waitFor(() => expect(alert).toHaveBeenCalledWith('Error al cargar ventas'))
  })

  it('orden por título ascendente arma sort=title_asc', async () => {
    fetch.mockResolvedValueOnce(ok([]))
    render(<App />)
    await screen.findByText(/No hay libros cargados/i)
    fetch.mockResolvedValueOnce(ok([]))
    fireEvent.change(screen.getByDisplayValue(/Sin orden/i), { target: { value: 'title_asc' } })
    fireEvent.click(screen.getByText(/Aplicar/i))
    await waitFor(() => expect(fetch).toHaveBeenLastCalledWith(expect.stringMatching(/sort=title_asc/)))
  })

  it('filtro de stock mínimo arma minStock', async () => {
    fetch.mockResolvedValueOnce(ok([]))
    render(<App />)
    await screen.findByText(/No hay libros cargados/i)
    fetch.mockResolvedValueOnce(ok([]))
    fireEvent.change(screen.getByPlaceholderText(/Stock mínimo/i), { target: { value: '5' } })
    fireEvent.click(screen.getByText(/Aplicar/i))
    await waitFor(() => expect(fetch).toHaveBeenLastCalledWith(expect.stringMatching(/minStock=5/)))
  })
})
