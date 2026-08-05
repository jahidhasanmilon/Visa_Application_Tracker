export default function Footer() {
  return (
    <div style={{
      padding: '18px 34px 28px', fontSize: 11.5, color: 'var(--muted)',
      textAlign: 'center', lineHeight: 1.6,
    }}>
      This is an unofficial, community-run app. It is not affiliated with, endorsed by, or connected to the German Embassy or any government agency.
      <br />
      © {new Date().getFullYear()} VisaTrack. All rights reserved.
    </div>
  );
}
