import ContributionList from '../ContributionList';

export default function ContributionListExample() {
  const mockContributions = [
    {
      id: '1',
      eventId: '1',
      donorName: 'John Smith',
      donorEmail: 'john@example.com',
      amount: 100,
      isAnonymous: false,
      isPledge: false,
      message: 'Happy to support this wonderful cause!',
      status: 'completed',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      id: '2',
      eventId: '1',
      donorName: 'Anonymous',
      donorEmail: 'anon@example.com',
      amount: 250,
      isAnonymous: true,
      isPledge: false,
      message: null,
      status: 'completed',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
    {
      id: '3',
      eventId: '1',
      donorName: 'Emily Chen',
      donorEmail: 'emily@example.com',
      amount: 50,
      isAnonymous: false,
      isPledge: true,
      message: 'Every child deserves access to books!',
      status: 'pending',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
  ];

  return <ContributionList contributions={mockContributions} />;
}
