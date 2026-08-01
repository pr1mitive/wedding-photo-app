import DisplaySlideshow from '@/components/display/DisplaySlideshow';

export default async function DisplayPage({ params }: { params: Promise<{ eventCode: string }> }) {
  const { eventCode } = await params;
  return <DisplaySlideshow eventCode={eventCode} />;
}
