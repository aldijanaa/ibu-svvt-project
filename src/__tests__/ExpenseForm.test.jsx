import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AppContext } from '../Context/AppContext'
import ExpenseForm from '../components/Home/ExpenseForm'

vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn().mockReturnValue(Promise.resolve({ isConfirmed: false })),
    mixin: vi.fn().mockReturnValue({ fire: vi.fn() }),
  },
}))

vi.mock('react-uuid', () => ({ default: () => 'mock-expense-uuid' }))

const mockAddExpense = vi.fn()

const contextValue = {
  budget: 1000,
  expenses: [],
  incomes: [],
  categories: ['General', 'Fuel', 'Grocery', 'Food'],
  addExpense: mockAddExpense,
  addBudget: vi.fn(),
  dispatch: vi.fn(),
}

const renderForm = () =>
  render(
    <AppContext.Provider value={contextValue}>
      <ExpenseForm />
    </AppContext.Provider>
  )

// Helpers — use placeholder/role queries since inputs have no id attribute
const getCostInput = () => screen.getByPlaceholderText('0.0 DH')
const getDescInput = () => screen.getByPlaceholderText('What was the expense for')
const getDateInput = (container) => container.querySelector('input[type="date"]')
const getCategorySelect = () => screen.getByRole('combobox')

describe('ExpenseForm — field rendering', () => {
  it('renders the Cost input field', () => {
    renderForm()
    expect(getCostInput()).toBeInTheDocument()
  })

  it('renders the Date input field', () => {
    const { container } = renderForm()
    expect(getDateInput(container)).toBeInTheDocument()
  })

  it('renders the Description input field', () => {
    renderForm()
    expect(getDescInput()).toBeInTheDocument()
  })

  it('renders the Category select field with options from context', () => {
    renderForm()
    const select = getCategorySelect()
    expect(select).toBeInTheDocument()
    expect(select.options.length).toBe(4)
    expect(select.options[0].text).toBe('General')
  })
})

describe('ExpenseForm — validation (equivalence partitioning)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Invalid partition: cost = 0 (default)
  it('does not submit when cost is 0', async () => {
    renderForm()
    fireEvent.click(screen.getByText('Add'))
    await waitFor(() => expect(mockAddExpense).not.toHaveBeenCalled())
  })

  // Invalid partition: cost is negative
  it('does not submit when cost is negative', async () => {
    const { container } = renderForm()
    fireEvent.change(getCostInput(), { target: { name: 'cost', value: '-10' } })
    fireEvent.change(getDescInput(), { target: { name: 'description', value: 'Lunch' } })
    fireEvent.change(getDateInput(container), { target: { name: 'date', value: '2024-01-15' } })
    fireEvent.click(screen.getByText('Add'))
    await waitFor(() => expect(mockAddExpense).not.toHaveBeenCalled())
  })

  // Invalid partition: description > 25 chars
  it('does not submit when description exceeds 25 characters', async () => {
    const { container } = renderForm()
    fireEvent.change(getCostInput(), { target: { name: 'cost', value: '50' } })
    fireEvent.change(getDescInput(), { target: { name: 'description', value: 'A'.repeat(26) } })
    fireEvent.change(getDateInput(container), { target: { name: 'date', value: '2024-01-15' } })
    fireEvent.click(screen.getByText('Add'))
    await waitFor(() => expect(mockAddExpense).not.toHaveBeenCalled())
  })

  // Invalid partition: date missing
  it('does not submit when date is empty', async () => {
    renderForm()
    fireEvent.change(getCostInput(), { target: { name: 'cost', value: '50' } })
    fireEvent.change(getDescInput(), { target: { name: 'description', value: 'Lunch' } })
    fireEvent.click(screen.getByText('Add'))
    await waitFor(() => expect(mockAddExpense).not.toHaveBeenCalled())
  })
})

describe('ExpenseForm — valid submission (boundary value analysis)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Valid: all fields filled, cost > 0, description <= 25 chars
  it('calls addExpense with correct data on a valid submission', async () => {
    const { container } = renderForm()
    fireEvent.change(getCostInput(), { target: { name: 'cost', value: '50' } })
    fireEvent.change(getDescInput(), { target: { name: 'description', value: 'Lunch' } })
    fireEvent.change(getDateInput(container), { target: { name: 'date', value: '2024-01-15' } })
    fireEvent.click(screen.getByText('Add'))
    await waitFor(() =>
      expect(mockAddExpense).toHaveBeenCalledWith(
        expect.objectContaining({
          cost: '50',
          description: 'Lunch',
          date: '2024-01-15',
          category: 'General',
        })
      )
    )
  })

  // Boundary: description exactly 25 characters (maximum valid length)
  it('submits successfully when description is exactly 25 characters', async () => {
    const { container } = renderForm()
    fireEvent.change(getCostInput(), { target: { name: 'cost', value: '100' } })
    fireEvent.change(getDescInput(), { target: { name: 'description', value: 'A'.repeat(25) } })
    fireEvent.change(getDateInput(container), { target: { name: 'date', value: '2024-06-01' } })
    fireEvent.click(screen.getByText('Add'))
    await waitFor(() => expect(mockAddExpense).toHaveBeenCalled())
  })

  // Boundary: description 26 characters (one over the limit)
  it('rejects description of 26 characters (one over the limit)', async () => {
    const { container } = renderForm()
    fireEvent.change(getCostInput(), { target: { name: 'cost', value: '100' } })
    fireEvent.change(getDescInput(), { target: { name: 'description', value: 'A'.repeat(26) } })
    fireEvent.change(getDateInput(container), { target: { name: 'date', value: '2024-06-01' } })
    fireEvent.click(screen.getByText('Add'))
    await waitFor(() => expect(mockAddExpense).not.toHaveBeenCalled())
  })
})
