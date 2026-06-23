import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-6">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 p-10 max-w-lg w-full text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-black text-gray-800 mb-3">Đã xảy ra lỗi</h1>
            <p className="text-gray-500 font-medium mb-6">
              Ứng dụng gặp sự cố không mong muốn. Vui lòng tải lại trang để tiếp tục sử dụng.
            </p>
            {this.state.error && (
              <details className="text-left mb-6 bg-gray-50 rounded-xl p-4 border border-gray-200">
                <summary className="text-sm font-bold text-gray-600 cursor-pointer">Chi tiết lỗi (dành cho kỹ thuật)</summary>
                <pre className="mt-2 text-xs text-red-600 whitespace-pre-wrap break-words font-mono">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
            <button
              onClick={this.handleReload}
              className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black uppercase tracking-wider px-8 py-4 rounded-xl text-sm transition-all shadow-[0_10px_20px_rgba(59,130,246,0.3)] hover:shadow-[0_10px_25px_rgba(34,211,238,0.4)] hover:-translate-y-1"
            >
              Tải lại trang
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
