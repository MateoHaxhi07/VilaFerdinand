// filtersStyles.js

export const selectStyles = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: "#2D3748",      // dark gray background
    borderColor: state.isFocused
      ? "#4A5568"
      : "#4A5568",                   // Chakra’s gray.600/700
    boxShadow: state.isFocused
      ? "0 0 0 1px #4A5568"
      : "none",
    "&:hover": {
      borderColor: "#4A5568",
    },
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: "#2D3748",      // keep dropdown dark
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused
      ? "#4A5568"
      : "#2D3748",
    color: "white",                   // each menu item is white
    cursor: "pointer",
  }),
  singleValue: (provided) => ({
    ...provided,
    color: "white",                   // selected value is white
  }),
  multiValue: (provided) => ({
    ...provided,
    backgroundColor: "#4A5568",       // tag background
  }),
  multiValueLabel: (provided) => ({
    ...provided,
    color: "white",                   // tag label is white
  }),
  multiValueRemove: (provided) => ({
    ...provided,
    color: "white",
    ":hover": {
      backgroundColor: "#E53E3E",     // red on hover
      color: "white",
    },
  }),
  placeholder: (provided) => ({
    ...provided,
    color: "#A0AEC0",                 // lighter‐gray placeholder
  }),
  input: (provided) => ({
    ...provided,
    color: "white",                   // this makes typed text white
  }),
};
