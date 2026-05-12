import React from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'

/**
 * Error Boundary genérico.
 * Captura erros de render dos filhos e exibe uma UI de fallback
 * em vez de derrubar toda a árvore do React.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="glass p-8 rounded-2xl border border-red-200 bg-red-50/50 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-red-100 p-3 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-red-800 mb-2">
            Algo deu errado
          </h3>
          <p className="text-sm text-red-600 mb-6 max-w-md mx-auto">
            {this.state.error?.message || 'Ocorreu um erro inesperado ao renderizar este componente.'}
          </p>
          <button
            onClick={this.handleRetry}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-red-600 border border-red-200 hover:bg-red-50 hover:border-red-300 rounded-xl font-bold transition-colors shadow-sm"
          >
            <RotateCcw className="w-4 h-4" />
            Tentar novamente
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
