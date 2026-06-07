/**
 * Thin wrapper around MUI TextField.
 * Standardises size, variant, and fullWidth defaults so every
 * form in the app looks identical without repeating props.
 */
import { TextField, TextFieldProps } from "@mui/material";

export function AppTextField(props: TextFieldProps) {
  return (
    <TextField
      fullWidth
      size="small"
      variant="outlined"
      {...props}
    />
  );
}
