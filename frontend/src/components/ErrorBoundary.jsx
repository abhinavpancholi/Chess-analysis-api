import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('Render error caught by ErrorBoundary:', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            margin: 'var(--space-6) auto',
            maxWidth: 560,
            padding: 'var(--space-5)',
            background: 'var(--danger-bg)',
            border: '1px solid var(--oxblood)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--ink)',
          }}
        >
          <h2 style={{ fontSize: 'var(--text-lg)', color: 'var(--oxblood)' }}>Something broke</h2>
          <p style={{ color: 'var(--ink-muted)' }}>
            {this.state.error.message || 'An unexpected error occurred while rendering this page.'}
          </p>
          <p className="mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-faint)' }}>
            Check the browser console for the full stack trace.
          </p>
        </div>
      )
    }
    return this.props.children
  }
}