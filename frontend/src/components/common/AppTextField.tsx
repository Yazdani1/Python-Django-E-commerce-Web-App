import type { FC } from "react";
import { TextField } from "@mui/material";
import type { TextFieldProps } from "@mui/material";

type AppTextFieldProps = TextFieldProps;

export const AppTextField: FC<AppTextFieldProps> = (props) => (
  <TextField fullWidth size="small" variant="outlined" {...props} />
);
