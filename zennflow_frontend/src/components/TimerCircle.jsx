const RADIUS = 140;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const TimerCircle = ({ progress }) => {
  const offset = CIRCUMFERENCE * (1 - progress);

  return (
    <svg width="320" height="320">
      <circle
        r={RADIUS}
        cx="160"
        cy="160"
        stroke="#A3A38F"
        strokeWidth="10"
        fill="transparent"
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 160 160)"
      />
    </svg>
  );
};
export default TimerCircle;
