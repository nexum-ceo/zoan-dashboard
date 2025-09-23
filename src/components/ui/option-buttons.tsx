'use client';

import { Bot, Codesandbox, Settings } from 'lucide-react';
import { FC } from 'react';

type OptionButtonProps = {
  icon: React.ReactNode;
  text: string;
  isSelected?: boolean;
  onClick?: () => void;
};

const OptionButton: FC<OptionButtonProps> = ({
  icon,
  text,
  isSelected = false,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-3 py-2 rounded-lg text-paragraph transition-all duration-200 
        ${
          isSelected
            ? 'bg-[#272727]/5 text-gray-800 shadow-sm'
            : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-800'
        }
        border border-gray-200 hover:border-gray-300
      `}
    >
      <span className="flex items-center justify-center w-4 h-4">{icon}</span>
      <span>{text}</span>
    </button>
  );
};

type OptionButtonsProps = {
  selectedOption?: string;
  onOptionChange?: (option: string) => void;
};

export const OptionButtons: FC<OptionButtonsProps> = ({
  selectedOption = 'default',
  onOptionChange,
}) => {
  const options = [
    {
      id: 'default',
      icon: <Bot className="w-4 h-4 text-green-600" />,
      text: 'Default model V1.0',
    },
    {
      id: 'dapps',
      icon: <Codesandbox className="w-4 h-4 text-purple-600" />,
      text: 'Building dApps',
    },
    {
      id: 'workflow',
      icon: <Settings className="w-4 h-4 text-orange-600" />,
      text: 'Workflow Setting',
    },
  ];

  return (
    <div className="flex justify-center items-center gap-2">
      {options.map((option) => (
        <OptionButton
          key={option.id}
          icon={option.icon}
          text={option.text}
          isSelected={selectedOption === option.id}
          onClick={() => onOptionChange?.(option.id)}
        />
      ))}
    </div>
  );
};

export default OptionButtons;
