"use client"

export const TextInput = ({
    placeholder,
    onChange,
    label,
    value = '',
    type = 'text'
}: {
    placeholder: string;
    onChange: (value: string) => void;
    label: string;
    value?: string | number;
    type?: 'text' | 'number' | 'email' | 'password'
}) => {
    return (
        <div className="pt-2">
            <label 
                className="block mb-2 text-sm font-medium text-gray-900"
            >
                {label}
            </label>
            <input 
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)} 
                className="bg-gray-50 border border-gray-500 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" 
                placeholder={placeholder} 
            />
        </div>
    )
}