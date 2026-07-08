import { Outlet } from 'react-router-dom'
import Nav from '../Nav/Nav'
import Footer from '../Footer/Footer'
import InteractiveBackground from '../InteractiveBackground'
import CustomCursor from '../CustomCursor'
import ScrollProgress from '../ScrollProgress'
import Toast from '../ui/Toast'

export default function SharedLayout () {
  return (
    <div className='relative min-h-screen'>
      <InteractiveBackground />
      <CustomCursor />
      <ScrollProgress />
      <Nav />
      <main className='pt-28'>
        <Outlet />
      </main>
      <Footer />
      <Toast />
    </div>
  )
}
