import EventCard from '../EventCard';
import eventImage from '@assets/stock_images/community_charity_ev_97ad4e3e.jpg';

export default function EventCardExample() {
  const mockEvent = {
    id: '1',
    title: 'Support Local School Library',
    description: 'Help us build a modern library for our community school to give children access to books and digital resources.',
    goalAmount: 10000,
    currentAmount: 6500,
    coverImage: eventImage,
    location: 'Springfield Elementary',
    deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    isPublic: true,
    organizerName: 'Sarah Johnson',
    organizerEmail: 'sarah@example.com',
    status: 'active',
    createdAt: new Date(),
  };

  return (
    <EventCard
      event={mockEvent}
      onViewDetails={(id) => console.log('View details:', id)}
      onShare={(id) => console.log('Share event:', id)}
    />
  );
}
