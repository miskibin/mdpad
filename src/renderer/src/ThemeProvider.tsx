import React, { createContext, useContext, ReactNode } from 'react'

type Theme = 'light' | 'dark'

const ThemeContext = createContext<{
  theme: Theme
  setTheme: (theme: Theme) => void
}>({
  theme: 'light',
  setTheme: () => {}
})

export const useTheme = () => useContext(ThemeContext)

export const ThemeProvider: React.FC<{
  children: ReactNode
  theme: Theme
}> = ({ children, theme }) => {
  return (
    <ThemeContext.Provider value={{ theme, setTheme: () => {} }}>
      <div className={theme}>{children}</div>
    </ThemeContext.Provider>
  )
}
