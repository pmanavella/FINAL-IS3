import { describe, it, beforeEach, vi, expect } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import App from '../App'

beforeEach(() => {
  global.fetch = vi.fn()
  global.alert = vi.fn()
  global.confirm = vi.fn(() => true)
  global.prompt = vi.fn()
})

const ok = (data) => Promise.resolve({ ok: true, json: async () => data })
const fail = (status = 500, data = { error: 'x' }) =>
  Promise.resolve({ ok: false, status, json: async () => data })

describe('App flows', () => {
  it('muestra vacío cuando no hay libros', async () => {
    fetch.mockResolvedValueOnce(ok([]))
    render(<App />)
    await screen.findByText(/No hay libros cargados/i)
  })

  it('alerta si falla carga de libros', async () => {
    fetch.mockRejectedValueOnce(new Error('net'))
    render(<App />)
    await waitFor(() => expect(alert).toHaveBeenCalledWith('Error al cargar libros'))
  })

  it('aplica filtros y llama con querystring', async () => {
    fetch.mockResolvedValueOnce(ok([]))
    render(<App />)
    await screen.findByText(/No hay libros cargados/i)
    fetch.mockResolvedValueOnce(ok([]))
    fireEvent.change(screen.getByPlaceholderText(/Buscar por título/i), { target: { value: 'har' } })
    fireEvent.change(screen.getByPlaceholderText(/Stock mínimo/i), { target: { value: '2' } })
    fireEvent.change(screen.getByDisplayValue(/Sin orden/i), { target: { value: 'title_asc' } })
    fireEvent.click(screen.getByText(/Aplicar/i))
    await waitFor(() => expect(fetch).toHaveBeenLastCalledWith(expect.stringMatching(/q=har.*minStock=2.*sort=title_asc/)))
  })

  it('limpia filtros y vuelve a la url base', async () => {
    fetch.mockResolvedValueOnce(ok([]))
    render(<App />)
    await screen.findByText(/No hay libros cargados/i)
    fetch.mockResolvedValueOnce(ok([]))
    fireEvent.click(screen.getByText(/Limpiar/i))
    await waitFor(() => expect(fetch).toHaveBeenLastCalledWith(expect.not.stringContaining('?')))
  })

  it('crea libro con formulario', async () => {
    fetch.mockResolvedValueOnce(ok([]))
    render(<App />)
    await screen.findByText(/No hay libros cargados/i)
    fireEvent.change(screen.getByLabelText(/Título/i), { target: { value: 'Libro X' } })
    fireEvent.change(screen.getByLabelText(/Autor/i), { target: { value: 'Autora' } })
    fireEvent.change(screen.getByLabelText(/^Año$/i), { target: { value: '2024' } })
    fetch.mockResolvedValueOnce(ok({ id: 1, title: 'Libro X', author: 'Autora', year: 2024, stock: 0, price: 0 }))
    fireEvent.click(screen.getByRole('button', { name: /Agregar libro/i }))
    await screen.findByText('Libro X')
  })

  it('no envía si faltan campos requeridos', async () => {
    fetch.mockResolvedValueOnce(ok([]))
    render(<App />)
    await screen.findByText(/No hay libros cargados/i)
    fireEvent.change(screen.getByLabelText(/Título/i), { target: { value: '' } })
    fireEvent.click(screen.getByRole('button', { name: /Agregar libro/i }))
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('edita libro existente', async () => {
    fetch.mockResolvedValueOnce(ok([{ id: 7, title: 'A', author: 'B', year: 2000, stock: 1, price: 0 }]))
    render(<App />)
    await screen.findByText('A')
    fetch.mockResolvedValueOnce(ok({ id: 7, title: 'A2', author: 'B', year: 2001, stock: 1, price: 0 }))
    fireEvent.click(screen.getByRole('button', { name: /Editar/i }))
    fireEvent.change(screen.getByLabelText(/Título/i), { target: { value: 'A2' } })
    fireEvent.change(screen.getByLabelText(/^Año$/i), { target: { value: '2001' } })
    fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }))
    await screen.findByText('A2')
  })

  it('borra libro tras confirmar', async () => {
    fetch.mockResolvedValueOnce(ok([{ id: 2, title: 'B', author: 'C', year: 1999, stock: 1, price: 0 }]))
    render(<App />)
    await screen.findByText('B')
    fetch.mockResolvedValueOnce(ok({}))
    fireEvent.click(screen.getByRole('button', { name: /Borrar/i }))
    await waitFor(() => expect(fetch).toHaveBeenLastCalledWith(expect.stringMatching(/\/api\/books\/2$/), expect.objectContaining({ method: 'DELETE' })))
  })

  it('registra préstamo', async () => {
    fetch.mockResolvedValueOnce(ok([{ id: 3, title: 'P', author: 'Q', year: 2010, stock: 1, price: 0 }]))
    render(<App />)
    await screen.findByText('P')
    prompt.mockReturnValueOnce('Ana')
    prompt.mockReturnValueOnce('7')
    prompt.mockReturnValueOnce('')
    fetch.mockResolvedValueOnce(ok({ ok: true }))
    fetch.mockResolvedValueOnce(ok([]))
    fireEvent.click(screen.getByRole('button', { name: /Prestar/i }))
    await waitFor(() => expect(fetch).toHaveBeenNthCalledWith(2, expect.stringMatching(/\/api\/books\/3\/loan/), expect.objectContaining({ method: 'POST' })))
  })

  it('registra venta', async () => {
    fetch.mockResolvedValueOnce(ok([{ id: 4, title: 'V', author: 'W', year: 2011, stock: 5, price: 10 }]))
    render(<App />)
    await screen.findByText('V')
    prompt.mockReturnValueOnce('Luis')
    prompt.mockReturnValueOnce('2')
    fetch.mockResolvedValueOnce(ok({ ok: true }))
    fetch.mockResolvedValueOnce(ok([]))
    fireEvent.click(screen.getByRole('button', { name: /Vender/i }))
    await waitFor(() => expect(fetch).toHaveBeenNthCalledWith(2, expect.stringMatching(/\/api\/books\/4\/sell/), expect.objectContaining({ method: 'POST' })))
  })
})
