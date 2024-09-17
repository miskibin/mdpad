import { useState, useCallback } from 'react'

export function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')

  const toggleTheme = useCallback(() => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'))
  }, [])

  return { theme, toggleTheme }
}
