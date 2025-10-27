import ProgressBar from '../ProgressBar';

export default function ProgressBarExample() {
  return (
    <div className="space-y-6">
      <ProgressBar current={2500} goal={10000} />
      <ProgressBar current={7500} goal={10000} />
      <ProgressBar current={15000} goal={10000} />
    </div>
  );
}
