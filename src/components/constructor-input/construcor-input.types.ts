export interface ConstructorInputProps {
  name: string;
  type: string;
  disabled?: boolean;
  label?: string;
  isRendered?: boolean;
  isVisible?: boolean;
  isExpressionInput?: boolean;
  onChange?: (value: string) => any;
  value?: any;
  isTextArea?: boolean;
  width?: number;
}
