import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Table from '../components/Analytics/Table'

const expenseRow = {
  id: '1',
  description: 'Coffee',
  cost: 15,
  category: 'Food',
  date: '2024-01-10',
}

const incomeRow = {
  id: '2',
  description: 'Salary',
  amount: 3000,
  category: 'Income',
  date: '2024-01-01',
}

const emptyDescRow = {
  id: '3',
  description: '',
  cost: 50,
  category: 'General',
  date: '2024-01-05',
}

describe('Table component', () => {
  it('renders all four column headers', () => {
    render(<Table rows={[]} />)
    expect(screen.getByText('Description')).toBeInTheDocument()
    expect(screen.getByText('Amount')).toBeInTheDocument()
    expect(screen.getByText('Category')).toBeInTheDocument()
    expect(screen.getByText('Date')).toBeInTheDocument()
  })

  it('renders an empty tbody when rows array is empty', () => {
    const { container } = render(<Table rows={[]} />)
    expect(container.querySelectorAll('tbody tr').length).toBe(0)
  })

  it('renders an expense row with description and negative amount', () => {
    render(<Table rows={[expenseRow]} />)
    expect(screen.getByText('Coffee')).toBeInTheDocument()
    expect(screen.getByText('-15 DH')).toBeInTheDocument()
    expect(screen.getByText('Food')).toBeInTheDocument()
    expect(screen.getByText('2024-01-10')).toBeInTheDocument()
  })

  it('renders an income row with positive amount', () => {
    render(<Table rows={[incomeRow]} />)
    expect(screen.getByText('Salary')).toBeInTheDocument()
    expect(screen.getByText('+3000 DH')).toBeInTheDocument()
    expect(screen.getByText('Income')).toBeInTheDocument()
  })

  it('shows a $ placeholder when description is empty', () => {
    render(<Table rows={[emptyDescRow]} />)
    expect(screen.getByText('$')).toBeInTheDocument()
  })

  it('renders multiple rows in the table', () => {
    render(<Table rows={[expenseRow, incomeRow]} />)
    const rows = screen.getAllByRole('row')
    // 1 header row + 2 data rows
    expect(rows.length).toBe(3)
  })
})
