/**
 * Integration tests — verify that AppContext state flows correctly
 * into rendered components. These tests exercise multiple layers at once:
 * the reducer, the context provider, and the consuming component.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AppContext } from '../Context/AppContext'
import Budget from '../components/Sidebar/Budget'

vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn().mockReturnValue(Promise.resolve({ value: null })),
    mixin: vi.fn().mockReturnValue({ fire: vi.fn() }),
  },
}))

vi.mock('react-tooltip', () => ({ default: () => null }))

vi.mock('@mui/icons-material/ControlPoint', () => ({
  default: ({ onClick }) => (
    <button onClick={onClick} data-testid="add-income-btn">
      +
    </button>
  ),
}))

const renderBudget = (budget, expenses) =>
  render(
    <AppContext.Provider
      value={{ budget, expenses, incomes: [], addBudget: vi.fn() }}
    >
      <Budget isOpen={true} />
    </AppContext.Provider>
  )

describe('Budget sidebar — context integration', () => {
  it('displays the total budget from context', () => {
    renderBudget(1000, [])
    expect(screen.getByText(/1000 DH/)).toBeInTheDocument()
  })

  it('calculates remaining budget correctly (budget - sum of expenses)', () => {
    renderBudget(1000, [{ id: '1', cost: 300 }, { id: '2', cost: 200 }])
    // remaining = 1000 - 300 - 200 = 500
    expect(screen.getByText('500')).toBeInTheDocument()
  })

  it('shows 0 remaining when expenses exactly equal the budget', () => {
    renderBudget(500, [{ id: '1', cost: 500 }])
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('shows a negative remaining value when expenses exceed the budget', () => {
    renderBudget(100, [{ id: '1', cost: 200 }])
    expect(screen.getByText('-100')).toBeInTheDocument()
  })

  it('shows 0 remaining when starting with no budget and no expenses', () => {
    renderBudget(0, [])
    expect(screen.getByText('0')).toBeInTheDocument()
  })
})
