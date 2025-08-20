import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { AppProvider } from '../../contexts/AppContext'
import FormPage from '../../pages/FormPage'

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <MemoryRouter>
      <AppProvider>{ui}</AppProvider>
    </MemoryRouter>
  )
}

describe('FormPage UI adjustments', () => {
  it('should not render universityTier and majorCategory fields', () => {
    renderWithProviders(<FormPage />)
    expect(screen.queryByText('院校等级')).toBeNull()
    expect(screen.queryByText('专业大类')).toBeNull()
  })

  it('should mark optional sections and fields with (选填)', () => {
    renderWithProviders(<FormPage />)
    expect(screen.getByText('语言成绩 (选填)')).toBeInTheDocument()
    expect(screen.getByText('标准化考试 (选填)')).toBeInTheDocument()
    expect(screen.getByText('科研经历 (选填)')).toBeInTheDocument()
    expect(screen.getByText('实习经历 (选填)')).toBeInTheDocument()
    expect(screen.getByText('竞赛经历 (选填)')).toBeInTheDocument()
    expect(screen.getByText('其他经历 (选填)')).toBeInTheDocument()

    expect(screen.getByText('考试类型 (选填)')).toBeInTheDocument()
    expect(screen.getByText('总分 (选填)')).toBeInTheDocument()
    expect(screen.getByText('GRE总分 (选填)')).toBeInTheDocument()
    expect(screen.getByText('GRE写作 (选填)')).toBeInTheDocument()
    expect(screen.getByText('GMAT总分 (选填)')).toBeInTheDocument()
  })

  it('should allow submit with only required academic and intent fields', async () => {
    renderWithProviders(<FormPage />)
    const user = userEvent.setup()

    const university = screen.getByLabelText('本科院校')
    await user.type(university, '清华大学')
    await user.keyboard('{Enter}')

    const major = screen.getByLabelText('专业')
    await user.type(major, '计算机科学')
    await user.keyboard('{Enter}')

    await user.type(screen.getByLabelText('GPA'), '3.8')

    await user.click(screen.getByLabelText('GPA制式'))
    await user.keyboard('{ArrowDown}{Enter}')

    await user.click(screen.getByLabelText('毕业年份'))
    await user.keyboard('{ArrowDown}{Enter}')

    await user.click(screen.getByLabelText('目标国家'))
    await user.keyboard('{ArrowDown}{Enter}')

    await user.click(screen.getByLabelText('目标专业'))
    await user.keyboard('{ArrowDown}{Enter}')

    await user.click(screen.getByLabelText('学位类型'))
    await user.keyboard('{ArrowDown}{Enter}')

    const submit = screen.getByRole('button', { name: /提交/ })
    await user.click(submit)

    expect(submit).toBeInTheDocument()
  })
})
