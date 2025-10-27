import ContributionForm from '../ContributionForm';

export default function ContributionFormExample() {
  return (
    <div className="max-w-md">
      <ContributionForm
        eventId="1"
        onSubmit={(data) => console.log('Contribution:', data)}
      />
    </div>
  );
}
