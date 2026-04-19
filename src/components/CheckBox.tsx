import React, { useState } from 'react';

interface CheckboxProps {
    label: string;
    checked?: boolean;
    onChange?: (checked: boolean) => void;
}

const Checkbox: React.FC<CheckboxProps> = ({ label, checked, onChange }) => {
    const [isChecked, setIsChecked] = useState<boolean>(false);
    const isControlled = typeof checked === "boolean";
    const resolvedChecked = isControlled ? checked : isChecked;

    const handleCheckboxChange = () => {
        const nextChecked = !resolvedChecked;

        if (!isControlled) {
            setIsChecked(nextChecked);
        }

        onChange?.(nextChecked);
    };

    return (
        <div>
            <label style={{
                color: 'white'
            }}
            >
                <input
                    type="checkbox"
                    checked={resolvedChecked}
                    onChange={handleCheckboxChange}
                    style={{
                        marginRight: '10px',
                    }}
                />
                {label}
            </label>
        </div>
    );
};

export default Checkbox;
