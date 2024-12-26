import React from 'react';
import '../index.css';

const Dropdown = ({ value, options, onChange, placeholder }) => (
  <select value={value} onChange={onChange}>
    <option value="">{placeholder}</option>
    {options.map((option, index) => (
      <option key={index} value={option}>{option}</option>
    ))}
  </select>
);

export default Dropdown;

