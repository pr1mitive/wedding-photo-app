import GuestUploadForm from '@/components/guest/GuestUploadForm';
import { Eyebrow, OrnamentDivider } from '@/components/shared/wedding-ui';

export default async function EventPage({ params }: { params: Promise<{ eventCode: string }> }) {
  const { eventCode } = await params;

  return (
    <main className="wedding-shell" style={{ padding: '28px 0 48px' }}>
      <div className="wedding-container">
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Eyebrow>Guest Post Page</Eyebrow>
          <h1 className="title-serif" style={{ fontSize: 42, fontStyle: 'italic', fontWeight: 300, marginTop: 10 }}>
            Memoire
          </h1>
          <div style={{ marginTop: 10 }}><OrnamentDivider wide={92} /></div>
          <p className="title-jp" style={{ marginTop: 14, fontSize: 14, color: 'var(--ink-70)', letterSpacing: '0.08em', lineHeight: 1.9 }}>
            祝福の瞬間を、みなさまの視点で残してください。<br />
            イベントコード: {eventCode}
          </p>
        </div>

        <GuestUploadForm eventCode={eventCode} />
      </div>
    </main>
  );
}
