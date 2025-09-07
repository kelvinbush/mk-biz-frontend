
import { useEffect, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
// eslint-disable-next-line
export function useFormValidation<T extends Record<string, any>>(form: UseFormReturn<T>) {
  const [isValid, setIsValid] = useState(false);
  const { formState, watch, getValues } = form;
  const { errors, touchedFields, isSubmitting } = formState;

  // Watch all form fields
  const values = watch();

  useEffect(() => {
    const checkFormValidity = () => {
      // Get all field names
      const fieldNames = Object.keys(getValues());
      
      // Check if all required fields are filled and valid
      const hasAllFieldsFilled = fieldNames.every((fieldName) => {
        const value = values[fieldName];
        return value !== undefined && value !== '';
      });

      // Check if there are any errors
      const hasNoErrors = Object.keys(errors).length === 0;

      // Form is valid if all fields are filled and there are no errors
      setIsValid(hasAllFieldsFilled && hasNoErrors);
    };

    checkFormValidity();
  }, [values, errors, getValues]);

  return {
    isValid,
    isSubmitting,
    touchedFields,
  };
}
