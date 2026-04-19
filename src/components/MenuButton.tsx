import React from "react";


type MenuButtonProps = {
    icon: React.ReactNode;
    background: string;
    onClick: () => void;
    size?: number;
    borderColor: string;
    borderWidth: string;
};



const MenuButton: React.FC<MenuButtonProps> = ({
    icon,
    background,
    onClick,
    size = 32,
}) => {
    return (
        <button
            type="button"
            aria-label="menu button"
            onClick={onClick}
            style={{
                position: "relative",
                width: size,
                height: size,
                background: "transparent",
                cursor: "pointer",
                padding: 0,
            }}
        >
            {/* Background circle */}
            <div className="absolute inset-0 w-full h-full rounded-full" style={{
                backgroundColor: background,
                opacity: "0.2",
            }}></div>

            {/* Icon */}
            <div className="relative flex h-full w-full items-center justify-center">
                {icon}
            </div>
        </button>
    );
};

export default MenuButton;
