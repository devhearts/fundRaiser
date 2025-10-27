import EventForm from '../EventForm';

export default function EventFormExample() {
  return (
    <EventForm
      onSubmit={(data) => console.log('Event submitted:', data)}
    />
  );
}
