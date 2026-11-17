/**
 * CategoryBadge Component
 * Displays announcement category with custom color
 * Requirements: 3.2, 3.3, 12.2
 */

import React from 'react';
import Badge from '../common/Badge.jsx';

const CategoryBadge = ({ category, size = 'medium' }) => {
  if (!category) return null;

  const badgeStyle = category.color 
    ? { 
        backgroundColor: `${category.color}20`, // 20 is hex for low opacity
        color: category.color,
        borderColor: category.color
      }
    : {};

  return (
    <Badge 
      variant="default" 
      size={size}
      className="border"
      style={badgeStyle}
    >
      {category.name}
    </Badge>
  );
};

export default CategoryBadge;
