import { renderHook, act } from '@testing-library/react';
import usePages from '../src/hooks/usePages';

describe('usePages', () => {
  it('initializes on page 0', () => {
    const { result } = renderHook(() => usePages(7, 6));
    expect(result.current.currentPage).toBe(0);
  });

  it('computes correct totalPages', () => {
    const { result } = renderHook(() => usePages(7, 6));
    expect(result.current.totalPages).toBe(2);
  });

  it('goes to next page', () => {
    const { result } = renderHook(() => usePages(7, 6));
    act(() => {
      result.current.nextPage();
    });
    expect(result.current.currentPage).toBe(1);
  });

  it('goes to previous page', () => {
    const { result } = renderHook(() => usePages(7, 6));
    act(() => {
      result.current.nextPage();
    });
    act(() => {
      result.current.prevPage();
    });
    expect(result.current.currentPage).toBe(0);
  });

  it('cannot go past last page', () => {
    const { result } = renderHook(() => usePages(7, 6));
    act(() => {
      result.current.nextPage();
    });
    act(() => {
      result.current.nextPage();
    });
    expect(result.current.currentPage).toBe(1);
  });

  it('cannot go before first page', () => {
    const { result } = renderHook(() => usePages(7, 6));
    act(() => {
      result.current.prevPage();
    });
    expect(result.current.currentPage).toBe(0);
  });

  it('goes directly to specified page', () => {
    const { result } = renderHook(() => usePages(10, 3));
    act(() => {
      result.current.goToPage(2);
    });
    expect(result.current.currentPage).toBe(2);
  });
});