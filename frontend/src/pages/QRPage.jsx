import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useOutletContext, useNavigate } from 'react-router-dom'

const API = 'http://localhost:8080'

export default function QRPage() {
  const { user } = useAuth()
  const { setToast } = useOutletContext()
  const navigate = useNavigate()

  // Tabs: 'my-qr' | 'scanner'
  const [tab, setTab] = useState('scanner')
  const [scanResult, setScanResult] = useState(null)
  const [scanError, setScanError] = useState('')
  const [scannerActive, setScannerActive] = useState(false)
  const [myQrUrl, setMyQrUrl] = useState('')
  const scannerRef = useRef(null)
  const html5QrRef = useRef(null)

  // Load my QR code
  useEffect(() => {
    if (user?.id) {
      setMyQrUrl(`${API}/qr/generate/${user.id}?t=${Date.now()}`)
    }
  }, [user?.id])

  // Cleanup scanner on unmount
  useEffect(() => {
    return () => {
      stopScanner()
    }
  }, [])

  const stopScanner = useCallback(async () => {
    if (html5QrRef.current) {
      try {
        await html5QrRef.current.stop()
        html5QrRef.current.clear()
      } catch {}
      html5QrRef.current = null
    }
    setScannerActive(false)
  }, [])

  const startScanner = useCallback(async () => {
    setScanError('')
    setScanResult(null)
    setScannerActive(true)

    // Dynamically import html5-qrcode
    try {
      const { Html5Qrcode } = await import('html5-qrcode')

      // Wait for DOM element
      await new Promise(res => setTimeout(res, 100))

      const qr = new Html5Qrcode('qr-reader-element')
      html5QrRef.current = qr

      const config = {
        fps: 15,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        disableFlip: false,
      }

      await qr.start(
        { facingMode: 'environment' }, // back camera first
        config,
        (decodedText) => {
          // Success callback
          handleScanSuccess(decodedText)
          stopScanner()
        },
        () => {} // ignore ongoing errors
      )
    } catch (err) {
      console.error('QR scanner error:', err)
      setScannerActive(false)
      if (err.toString().includes('Permission')) {
        setScanError('Camera permission denied. Please allow camera access and try again.')
      } else {
        setScanError('Could not start camera scanner. Please try again.')
      }
    }
  }, [stopScanner])

  const handleScanSuccess = (text) => {
    try {
      // Try to parse as JSON payment data
      const data = JSON.parse(text)
      if (data.paymentId) {
        setScanResult({ type: 'payment', data })
        setToast({ type: 'success', icon: '✅', message: `QR scanned: ${data.name || 'User #' + data.paymentId}` })
        return
      }
    } catch {}
    // Plain text or URL
    setScanResult({ type: 'text', data: text })
    setToast({ type: 'info', icon: '📷', message: 'QR code scanned successfully!' })
  }

  const goToSend = () => {
    if (scanResult?.data?.paymentId) {
      navigate(`/send?receiverId=${scanResult.data.paymentId}`)
    }
  }

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>📷 QR Payments</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Scan QR codes to pay or show yours to receive</p>
      </div>

      {/* Tabs */}
      <div className="analytics-tabs" style={{ marginBottom: '1.5rem' }}>
        <button
          id="tab-scanner"
          className={`analytics-tab ${tab === 'scanner' ? 'active' : ''}`}
          onClick={() => { setTab('scanner'); stopScanner(); setScanResult(null); setScanError('') }}
        >
          📷 Scan QR
        </button>
        <button
          id="tab-my-qr"
          className={`analytics-tab ${tab === 'my-qr' ? 'active' : ''}`}
          onClick={() => { setTab('my-qr'); stopScanner() }}
        >
          🪪 My QR Code
        </button>
      </div>

      {/* Scanner Tab */}
      {tab === 'scanner' && (
        <div>
          {/* Scan result */}
          {scanResult && (
            <div className="scan-result animate-slide-up" style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 700, color: '#34d399', marginBottom: '0.375rem' }}>
                    ✅ QR Code Scanned!
                  </div>
                  {scanResult.type === 'payment' && (
                    <>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                        <strong>Name:</strong> {scanResult.data.name}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                        <strong>ID:</strong> #{scanResult.data.paymentId}
                      </div>
                      {scanResult.data.email && (
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                          <strong>Email:</strong> {scanResult.data.email}
                        </div>
                      )}
                    </>
                  )}
                  {scanResult.type === 'text' && (
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', wordBreak: 'break-all' }}>
                      {scanResult.data}
                    </div>
                  )}
                </div>
                <button
                  className="btn-icon"
                  onClick={() => setScanResult(null)}
                  style={{ flexShrink: 0 }}
                >✕</button>
              </div>
              {scanResult.type === 'payment' && (
                <button
                  id="pay-scanned-btn"
                  className="btn-primary"
                  onClick={goToSend}
                  style={{ marginTop: '1rem' }}
                >
                  💸 Pay {scanResult.data.name}
                </button>
              )}
            </div>
          )}

          {/* Error */}
          {scanError && (
            <div className="alert-error animate-slide-up" style={{ marginBottom: '1.25rem' }}>
              ❌ {scanError}
            </div>
          )}

          {/* Scanner UI */}
          <div className="card" style={{ marginBottom: '1.25rem' }}>
            {!scannerActive ? (
              <div style={{ textAlign: 'center', padding: '1.5rem' }}>
                <div style={{
                  width: '8rem', height: '8rem', margin: '0 auto 1.5rem',
                  borderRadius: '1.25rem',
                  background: 'var(--accent-glow)',
                  border: '2px solid var(--accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '3rem',
                  boxShadow: '0 0 32px var(--accent-glow)',
                }}>
                  📷
                </div>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                  QR Code Scanner
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                  Point your camera at any PayFlow QR code to make instant payments
                </p>
                <button
                  id="start-scanner-btn"
                  className="btn-primary"
                  onClick={startScanner}
                  style={{ maxWidth: '240px', margin: '0 auto' }}
                >
                  📷 Start Camera Scanner
                </button>
              </div>
            ) : (
              <div>
                <div style={{ textAlign: 'center', marginBottom: '0.875rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  🔍 Scanning... Point camera at a QR code
                </div>
                <div id="qr-reader-element" className="qr-scanner-wrapper" />
                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                  <button
                    id="stop-scanner-btn"
                    className="btn-secondary"
                    onClick={stopScanner}
                    style={{ width: 'auto', padding: '0.5rem 1.25rem' }}
                  >
                    ⏹ Stop Scanner
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="card">
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '0.875rem' }}>📖 How to Scan</h3>
            {[
              { icon: '1️⃣', text: 'Click "Start Camera Scanner" above' },
              { icon: '2️⃣', text: 'Allow camera access when prompted' },
              { icon: '3️⃣', text: 'Point camera at the recipient\'s QR code' },
              { icon: '4️⃣', text: 'Confirm payment details & send' },
            ].map(({ icon, text }) => (
              <div key={icon} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '0.5rem 0' }}>
                <span>{icon}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* My QR Tab */}
      {tab === 'my-qr' && (
        <div>
          <div className="card" style={{ marginBottom: '1.25rem', textAlign: 'center' }}>
            <div style={{ marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                My Payment QR Code
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Share this QR code to receive payments
              </p>
            </div>

            <div style={{
              display: 'inline-flex',
              padding: '1.25rem',
              background: 'white',
              borderRadius: '1.25rem',
              boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
              marginBottom: '1rem',
            }}>
              {myQrUrl ? (
                <img
                  src={myQrUrl}
                  alt="My Payment QR Code"
                  width={220} height={220}
                  style={{ borderRadius: '0.5rem', display: 'block' }}
                  onError={() => setToast({ type: 'error', message: 'Failed to load QR code' })}
                />
              ) : (
                <div style={{
                  width: '220px', height: '220px', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  color: '#94a3b8', fontSize: '0.875rem'
                }} className="skeleton" />
              )}
            </div>

            <div style={{
              background: 'var(--bg-input)',
              borderRadius: '0.75rem',
              padding: '1rem',
              marginBottom: '1rem'
            }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Account Holder</div>
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>{user?.name}</div>
              <div style={{ color: 'var(--text-faint)', fontSize: '0.8125rem', marginTop: '0.25rem' }}>User ID: #{user?.id}</div>
            </div>

            <p style={{ color: 'var(--text-faint)', fontSize: '0.75rem' }}>
              This QR code is unique to your PayFlow account.<br />Anyone can scan it to send you money instantly.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
