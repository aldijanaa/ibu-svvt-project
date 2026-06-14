import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Badge from '../components/Home/Badge'

describe('Badge component', () => {
  it('renders the provided text', () => {
    render(<Badge text="General" />)
    expect(screen.getByText('General')).toBeInTheDocument()
  })

  it('applies red styling for an expense badge (isCost=1)', () => {
    const { container } = render(<Badge text="-100 DH" isCost={1} />)
    expect(container.firstChild).toHaveClass('text-red-main')
  })

  it('applies green styling for an income badge (isCost=2)', () => {
    const { container } = render(<Badge text="+500 DH" isCost={2} />)
    expect(container.firstChild).toHaveClass('text-green-500')
  })

  it('applies no color class when isCost is not provided', () => {
    const { container } = render(<Badge text="Food" />)
    expect(container.firstChild).not.toHaveClass('text-red-main')
    expect(container.firstChild).not.toHaveClass('text-green-500')
  })

  it('sets data-tip and data-for attributes when tip is provided', () => {
    const { container } = render(<Badge text="Today" tip="tipTool" />)
    expect(container.firstChild).toHaveAttribute('data-tip', 'tipTool')
    expect(container.firstChild).toHaveAttribute('data-for', 'tipTool')
  })

  it('renders different text values correctly', () => {
    const { rerender } = render(<Badge text="Fuel" />)
    expect(screen.getByText('Fuel')).toBeInTheDocument()
    rerender(<Badge text="Shopping" />)
    expect(screen.getByText('Shopping')).toBeInTheDocument()
  })
})
