type ModalHeaderPlateProps = {
    className?: string;
};

export default function ModalHeaderPlate({ className = "" }: ModalHeaderPlateProps) {
    return (
        <svg
            width="240"
            height="70"
            viewBox="0 0 474 122"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            aria-hidden="true"
        >
            <defs>
                <linearGradient
                    id="yellow-plate-fill"
                    x1="237"
                    y1="0"
                    x2="237"
                    y2="105"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor="#ECB213" />
                    <stop offset="1" stopColor="#ECB213" />
                </linearGradient>
                <linearGradient
                    id="yellow-plate-highlight"
                    x1="237"
                    y1="2"
                    x2="237"
                    y2="30"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor="#ECB213" stopOpacity="0.95" />
                    <stop offset="1" stopColor="#ECB213" stopOpacity="0" />
                </linearGradient>
                <linearGradient
                    id="yellow-plate-bottom"
                    x1="237"
                    y1="88"
                    x2="237"
                    y2="109"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor="#ECB213" />
                    <stop offset="1" stopColor="#ECB213" />
                </linearGradient>
                <filter
                    id="yellow-plate-shadow"
                    x="0"
                    y="0"
                    width="474"
                    height="122"
                    filterUnits="userSpaceOnUse"
                    colorInterpolationFilters="sRGB"
                >
                    <feOffset dy="6" />
                    <feGaussianBlur stdDeviation="4" />
                    <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 0.239216 0 0 0 0 0.141176 0 0 0 0 0.0117647 0 0 0 0.35 0"
                    />
                    <feBlend in2="SourceGraphic" result="shape" />
                </filter>
            </defs>

            <g filter="url(#yellow-plate-shadow)">
                <path
                    d="M18 23C18 12.5066 26.5066 4 37 4H437C447.493 4 456 12.5066 456 23V66.5C456 84.6574 353.036 99.5 237 99.5C120.964 99.5 18 84.6574 18 66.5V23Z"
                    fill="url(#yellow-plate-fill)"
                />
                <path
                    d="M37 4.75H437C447.079 4.75 455.25 12.9218 455.25 23V24.5H18.75V23C18.75 12.9218 26.9218 4.75 37 4.75Z"
                    fill="url(#yellow-plate-highlight)"
                />
                <path
                    d="M18.75 67.5C18.75 84.8489 121.557 99.75 237 99.75C352.443 99.75 455.25 84.8489 455.25 67.5"
                    stroke="url(#yellow-plate-bottom)"
                    strokeWidth="6"
                    strokeLinecap="round"
                />
                <path
                    d="M18.75 23C18.75 12.9218 26.9218 4.75 37 4.75H437C447.078 4.75 455.25 12.9218 455.25 23V66.5C455.25 83.8489 352.443 98.75 237 98.75C121.557 98.75 18.75 83.8489 18.75 66.5V23Z"
                    stroke="#E09B12"
                    strokeWidth="1.5"
                />
            </g>
        </svg>
    );
}
