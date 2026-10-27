import { useState } from 'react'
import heroImg from './assets/hero.png'
import Header from './components/Header'
import Footer from './components/Footer'



function App() {
  return (
    <>
      <Header />
      <main className="news-main">
        <p className="eyebrow">Tuesday, October 27, 2026</p>
        <h1>News that gives you the full picture.</h1>
        <p className="intro">Clear reporting, thoughtful analysis, and stories worth your attention.</p>
      </main>
      <Footer />
    </>
  )
}

export default App
