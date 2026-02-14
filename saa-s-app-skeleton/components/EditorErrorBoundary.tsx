'use client'

import React from 'react'

interface EditorErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface EditorErrorBoundaryState {
  hasError: boolean
}

export default class EditorErrorBoundary extends React.Component<EditorErrorBoundaryProps, EditorErrorBoundaryState> {
  state: EditorErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: unknown) {
    // Log to console for debugging; avoid crashing the app
    console.error('EditorErrorBoundary caught an error:', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="h-full w-full rounded border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
            Editor failed to load. Please refresh the page.
          </div>
        )
      )
    }

    return this.props.children
  }
}
