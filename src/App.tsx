import { ThemeProvider } from './theme/ThemeProvider'
import { IDEShell } from './components/layout/IDEShell'

function App() {
  return (
    <ThemeProvider>
      <IDEShell />
    </ThemeProvider>
  )
}

export default App
