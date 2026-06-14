import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { useContext } from 'react'
import { AppContext, AppProvider } from '../Context/AppContext'
import { MemoryRouter } from 'react-router-dom'
import Budget from '../components/Sidebar/Budget'

vi.mock('react-uuid', () => ({ default: () => 'reg-uuid' }))
vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn().mockResolvedValue({ value: null }),
    mixin: vi.fn().mockReturnValue({ fire: vi.fn() }),
  },
}))
vi.mock('react-tooltip', () => ({ default: () => null }))
vi.mock('@mui/icons-material/ControlPoint', () => ({
  default: () => <button>+</button>,
}))

// ── Render Budget with controlled context values ──────────────────────────────
const renderBudget = (budget, expenses) =>
  render(
    <AppContext.Provider value={{ budget, expenses, incomes: [], addBudget: vi.fn() }}>
      <Budget isOpen={true} />
    </AppContext.Provider>
  )

// ── Component that exposes ADD and DELETE dispatch buttons ─────────────────────
function ExpenseCounter() {
  const { expenses, dispatch } = useContext(AppContext)
  return (
    <div>
      <span data-testid="reg-expense-count">{expenses.length}</span>
      <button
        data-testid="btn-add"
        onClick={() =>
          dispatch({
            type: 'ADD_EXPENSE',
            payload: {
              id: 'reg-exp-1',
              cost: 100,
              description: 'Regression test expense',
              date: '2024-06-01',
              category: 'General',
              dateAdded: '',
            },
          })
        }
      >
        Add
      </button>
      <button
        data-testid="btn-delete"
        onClick={() =>
          dispatch({ type: 'DELETE_EXPENSE', payload: 'reg-exp-1' })
        }
      >
        Delete
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// GROUP 1 — Correct behaviours that must never regress (both should PASS)
// ─────────────────────────────────────────────────────────────────────────────
describe('Regression — correct behaviours preserved', () => {
  it('RT-01: remaining budget is calculated correctly after expenses', () => {
    renderBudget(1000, [{ id: '1', cost: 300 }, { id: '2', cost: 200 }])
    // remaining = 1000 - 300 - 200 = 500
    expect(screen.getByText('500')).toBeInTheDocument()
  })

  it('RT-02: negative remaining is shown when expenses exceed the budget', () => {
    renderBudget(100, [{ id: '1', cost: 300 }])
    // remaining = 100 - 300 = -200
    expect(screen.getByText('-200')).toBeInTheDocument()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// GROUP 2 — Tests for known bugs (both FAIL until bugs are fixed)
// ─────────────────────────────────────────────────────────────────────────────
describe('Regression — known bugs detected by tests', () => {
  beforeEach(() => { localStorage.clear() })

  // BUG: Budget.jsx line 56 — colour condition is inverted.
  // When remaining > 0 (user has budget), the card should be green.
  // Current code applies bg-red-main instead of bg-green-main.
  it('RT-03: budget card shows green styling when remaining budget is positive', () => {
    const { container } = renderBudget(1000, [])
    // remaining = 1000 (positive) — should be green but is red due to the bug
    expect(container.querySelector('.budget')).toHaveClass('bg-green-main')
  })

  // BUG: AppContext.jsx — the DELELTE_EXPENSE case is commented out entirely.
  // Dispatching the action hits the default case and leaves state unchanged.
  it('RT-04: dispatching DELETE_EXPENSE removes the expense from state', () => {
    render(
      <MemoryRouter>
        <AppProvider>
          <ExpenseCounter />
        </AppProvider>
      </MemoryRouter>
    )
    fireEvent.click(screen.getByTestId('btn-add'))
    expect(screen.getByTestId('reg-expense-count')).toHaveTextContent('1')

    fireEvent.click(screen.getByTestId('btn-delete'))
    // Should be 0 after deletion — fails because delete case is commented out
    expect(screen.getByTestId('reg-expense-count')).toHaveTextContent('0')
  })
})
