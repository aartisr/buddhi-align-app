export default function Loading() {
  return (
    <div className="app-route-loading" role="status" aria-live="polite">
      <div className="app-route-loading__panel">
        <div className="app-request-spinner" aria-hidden="true">
          <div className="app-request-spinner__halo" />
          <div className="app-request-spinner__ring app-request-spinner__ring--outer" />
          <div className="app-request-spinner__ring app-request-spinner__ring--inner" />
          <div className="app-request-spinner__center">ॐ</div>
        </div>
        <p className="app-route-loading__title">Preparing your space</p>
        <p className="app-route-loading__subtitle">A fresh view is loading.</p>
      </div>
    </div>
  );
}