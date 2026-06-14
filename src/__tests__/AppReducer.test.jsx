import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { useContext } from 'react'
import { AppContext, AppProvider } from '../Context/AppContext'
import { MemoryRouter } from 'react-router-dom'

vi.mock('react-uuid', () => ({ default: () => 'test-uuid-123' }))

const TestConsumer = () => {
  const { budget, expenses, incomes, addBudget, addExpense } = useContext(AppContext)
  return (
    <div>
      <div data-testid="budget">{budget}</div>
      <div data-testid="expense-count">{expenses.length}</div>
      <div data-testid="income-count">{incomes.length}</div>
      <button onClick={() => addBudget(500)}>Add Budget</button>
      <button onClick={() => addBudget(999999)}>Add Large Budget</button>
      <button
        onClick={() =>
          addExpense({
            id: 'e1',
            cost: 100,
            description: 'Groceries',
            date: '2024-01-15',
            category: 'Grocery',
            dateAdded: new Date().toString(),
          })
        }
      >
        Add Expense
      </button>
    </div>
  )
}

const renderWithProvider = () =>
  render(
    <MemoryRouter>
      <AppProvider>
        <TestConsumer />
      </AppProvider>
    </MemoryRouter>
  )

describe('AppReducer', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('ADD_BUDGET: increases the budget by the given amount', () => {
    renderWithProvider()
    fireEvent.click(screen.getByText('Add Budget'))
    expect(screen.getByTestId('budget').textContent).toBe('500')
  })

  it('ADD_BUDGET: handles a large boundary value correctly', () => {
    renderWithProvider()
    fireEvent.click(screen.getByText('Add Large Budget'))
    expect(screen.getByTestId('budget').textContent).toBe('999999')
  })

  it('ADD_EXPENSE: adds the expense to the expenses list', () => {
    renderWithProvider()
    fireEvent.click(screen.getByText('Add Expense'))
    expect(screen.getByTestId('expense-count').textContent).toBe('1')
  })

  it('ADD_INCOME: records an income entry when addBudget is called', () => {
    renderWithProvider()
    fireEvent.click(screen.getByText('Add Budget'))
    expect(screen.getByTestId('income-count').textContent).toBe('1')
  })
})
