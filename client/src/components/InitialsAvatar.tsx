import React from "react";

const colors = [
  "#39B5E0",
  "#A31ACB",
  "#E8A0BF",
  "#A459D1",
  "#F900BF",
  "#400D51",
  "#323EDD",
  "#7A2E7A",
];

function getColorForInitial(char: string) {
  if (!char) return colors[0];
  const index = char.toUpperCase().charCodeAt(0) - 65;
  return colors[index % colors.length];
}

interface InitialsAvatarProps {
  name: string;
  size?: number;
}

const InitialsAvatar: React.FC<InitialsAvatarProps> = ({ name, size = 32 }) => {
  const initial = name?.[0]?.toUpperCase() || "?";
  const bgColor = getColorForInitial(initial);

  return (
    <div
      className="flex items-center justify-center rounded-full font-bold text-white select-none"
      style={{ width: size, height: size, backgroundColor: bgColor, userSelect: "none" }}
      title={name}
    >
      {initial}
    </div>
  );
};

export default InitialsAvatar;