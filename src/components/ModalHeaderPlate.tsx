type ModalHeaderPlateProps = {
    className?: string;
};

export default function ModalHeaderPlate({ className = "" }: ModalHeaderPlateProps) {
    return (
        <svg
            width="362"
            height="32"
            viewBox="0 0 362 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            aria-hidden="true"
        >
            <path
                d="M339.393 23.5007C336.656 28.4356 331.454 31.4943 325.812 31.4851L35.9131 31.0124C30.4306 31.0033 25.3607 28.0988 22.5801 23.3737L0.871094 -13.5179L360.878 -15.2483L339.393 23.5007Z"
                fill="url(#modal-header-plate-fill)"
                stroke="url(#modal-header-plate-stroke)"
            />
            <defs>
                <linearGradient
                    id="modal-header-plate-fill"
                    x1="181.043"
                    y1="-4.7306"
                    x2="183.024"
                    y2="31.3949"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor="#6919D2" />
                    <stop offset="1" stopColor="#821BF0" />
                </linearGradient>
                <linearGradient
                    id="modal-header-plate-stroke"
                    x1="180.565"
                    y1="31.4975"
                    x2="179.692"
                    y2="4.23935"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor="#F8D954" />
                    <stop offset="1" stopColor="#928031" stopOpacity="0" />
                </linearGradient>
            </defs>
        </svg>
    );
}
