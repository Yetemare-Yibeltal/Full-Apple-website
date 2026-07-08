import { Component } from 'react'

class ErrorBoundary extends Component {
  constructor (props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError () {
    return { hasError: true }
  }

  componentDidCatch (error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render () {
    if (this.state.hasError) {
      return (
        <div className='min-h-screen flex items-center justify-center bg-obsidian px-4'>
          <div className='glass-panel p-8 max-w-md text-center'>
            <h2 className='text-xl font-display font-bold mb-2'>
              Something went wrong
            </h2>
            <p className='text-text-muted mb-6'>
              An unexpected error occurred. Try reloading the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className='px-6 py-3 rounded-full bg-prism-gradient text-obsidian font-semibold'
            >
              Reload
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
