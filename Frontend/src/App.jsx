import { useState, useEffect } from 'react';

function App() {

  const [Count, setCount] = useState(0)

  useEffect(() => {
    let count = localStorage.getItem('count');
    if (count) {
      setCount(count)
    }
    console.log(count)
  }, [])

  useEffect(() => {
    setCount(Count)
    localStorage.setItem('count' , Count)
  }, [Count])


  return (
    <>
      <div onClick={() => {
        setCount(Count + 1)
      }}>+</div>
      <div>{Count}</div>
      <div onClick={() => { setCount(Count - 1) }}>-</div>
    </>
  )
}

export default App
