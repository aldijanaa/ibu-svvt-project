import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Pagination from '../components/Analytics/Pagination'

vi.mock('../assets/ControlSidebar.svg', () => ({ default: 'test-arrow.svg' }))

const defaultProps = {
  rowsPerPage: 3,
  totalrows: 9,
  paginateFront: vi.fn(),
  paginateBack: vi.fn(),
  currentPage: 1,
}

describe('Pagination component', () => {
  it('displays the current page number', () => {
    render(<Pagination {...defaultProps} />)
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('calculates and displays the correct total page count', () => {
    render(<Pagination {...defaultProps} />)
    // 9 rows / 3 per page = 3 pages
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('rounds up total pages for non-exact division', () => {
    render(<Pagination {...defaultProps} totalrows={10} rowsPerPage={3} />)
    // ceil(10/3) = 4
    expect(screen.getByText('4')).toBeInTheDocument()
  })

  it('reflects the correct page when currentPage changes', () => {
    render(<Pagination {...defaultProps} currentPage={2} />)
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('calls paginateFront when the forward arrow is clicked', () => {
    const paginateFront = vi.fn()
    render(<Pagination {...defaultProps} paginateFront={paginateFront} />)
    fireEvent.click(screen.getByAltText('arrowR'))
    expect(paginateFront).toHaveBeenCalledTimes(1)
  })

  it('calls paginateBack when the back arrow is clicked', () => {
    const paginateBack = vi.fn()
    render(<Pagination {...defaultProps} paginateBack={paginateBack} />)
    fireEvent.click(screen.getByAltText('arrowL'))
    expect(paginateBack).toHaveBeenCalledTimes(1)
  })
})
