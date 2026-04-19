type CoinBoardPlateProps = {
  className?: string;
};

export default function CoinBoardPlate({ className = "" }: CoinBoardPlateProps) {
  return (
    <svg
      width="107"
      height="26"
      viewBox="0 0 107 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect
        x="0.5"
        y="0.5"
        width="106"
        height="25"
        rx="12.5"
        fill="#000000"
        opacity={0.2}
        stroke="url(#coin-board-plate-stroke)"
      />
      <defs>
        <linearGradient
          id="coin-board-plate-stroke"
          x1="53.5"
          y1="0"
          x2="53.5"
          y2="26"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F8D954" />
          <stop offset="1" stopColor="#C4530D" />
        </linearGradient>
      </defs>
    </svg>
  );
}
