import { useEffect } from "react"

function App() {

  useEffect(() => {
    first
  
    return () => {
      second
    }
  }, [])
  

  return (
    <>
      This is home
    </>
  )
}

export default App
