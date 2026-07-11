import { Link } from 'react-router-dom'
import GradientText from '../../components/ui/GradientText'
import Button from '../../components/ui/Button'
import SEO from '../../components/SEO'

export default function Four04 () {
  return (
    <>
      <SEO title='Page Not Found' />
      <div className='max-w-lg mx-auto px-6 py-32 text-center'>
        <h1 className='text-7xl font-display font-extrabold mb-4'>
          <GradientText>404</GradientText>
        </h1>
        <p className='text-text-muted mb-8'>
          The page you're looking for doesn't exist.
        </p>
        <Link to='/'>
          <Button variant='primary'>Back to Home</Button>
        </Link>
      </div>
    </>
  )
}
