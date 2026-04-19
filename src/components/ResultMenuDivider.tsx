type ResultMenuDividerProps = {
    className?: string;
    direction?: "left" | "right";
};

export default function ResultMenuDivider({
    className = "",
    direction = "left",
}: ResultMenuDividerProps) {
    const shouldFlip = direction === "right";

    return (
        <svg
            width="55"
            height="1"
            viewBox="0 0 55 1"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            aria-hidden="true"
            style={shouldFlip ? { transform: "scaleX(-1)" } : undefined}
        >
            <path
                d="M54 0C54.1326 -0.00124545 54.2598 0.050343 54.3536 0.144131C54.4473 0.23792 54.5 0.366187 54.5 0.50004C54.5 0.633894 54.4473 0.762161 54.3536 0.855949C54.2598 0.949738 54.1326 1.00133 54 1.00004C53.1 0.991706 52.2 0.983373 51.3 0.97504C35.1 0.82504 18.9 0.67504 2.7 0.52504C1.8 0.516706 0.9 0.508373 0 0.50004C0.9 0.491706 1.8 0.483373 2.7 0.47504C18.9 0.32504 35.1 0.17504 51.3 0.02504C52.2 0.0167067 53.1 0.00837334 54 0Z"
                fill="white"
            />
        </svg>
    );
}
