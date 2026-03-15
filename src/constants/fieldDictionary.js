export const DASH_FIELD_DICTIONARY = {
  first_name: {
    placeholder: 'Enter First Name',
    flex: 6,
    props: 'initialFormProps',
  },

  last_name: {
    placeholder: 'Enter Last Name',
    flex: 6,
    props: 'initialFormProps',
  },

  middle_name: {
    placeholder: 'Enter Middle Name',
    flex: 6,
    props: 'initialFormProps',
  },

  address: {
    placeholder: 'Enter Address Line',
    flex: 6,
    props: 'initialFormProps',
  },

  state_province: {
    widget: 'SelectWidget',
    placeholder: 'Select Region',
    flex: 6,
    props: 'initialFormProps',
  },

  city: {
    widget: 'SelectWidget',
    placeholder: 'Select City/Municipality',
    flex: 6,
    props: 'initialFormProps',
  },

  barangay: {
    widget: 'SelectWidget',
    placeholder: 'Select Barangay',
    flex: 6,
    props: 'initialFormProps',
  },

  postal_code: {
    placeholder: 'Enter Postal Code',
    flex: 6,
    props: 'initialFormProps',
  },

  email_address: {
    placeholder: 'Enter Email Address',
    flex: 6,
    props: 'initialFormProps',
  },

  mobile_number: {
    widget: 'CustomContactInputWidget',
    placeholder: 'XXX-XXX-XXXX',
    flex: 6,
    options: {
      widget: 'CustomContactInputWidget',
    },
    props: {
      __spreadInitialFormProps: true,
      field: {
        __spreadInitialFormPropsField: true,
        sx: {
          '.MuiInputBase-root': {
            '.MuiInputAdornment-root': {
              marginRight: '0px',
            },
          },
        },
      },
    },
  },

  contact_number: {
    widget: 'CustomContactInputWidget',
    placeholder: 'XXX-XXX-XXXX',
    flex: 6,
    options: {
      widget: 'CustomContactInputWidget',
    },
    props: {
      __spreadInitialFormProps: true,
      field: {
        __spreadInitialFormPropsField: true,
        sx: {
          '.MuiInputBase-root': {
            '.MuiInputAdornment-root': {
              marginRight: '0px',
            },
          },
        },
      },
    },
  },

  birth_date: {
    placeholder: 'Select Birth Date',
    flex: 6,
    props: 'initialFormProps',
  },

  gender: {
    widget: 'SelectWidget',
    placeholder: 'Select Gender',
    flex: 6,
    props: 'initialFormProps',
  },

  civil_status: {
    widget: 'SelectWidget',
    placeholder: 'Select Civil Status',
    flex: 6,
    props: 'initialFormProps',
  },

  nationality: {
    placeholder: 'Enter Nationality',
    flex: 6,
    props: 'initialFormProps',
  },
};

export const DASH_PATTERN_RULES = [
  {
    test: (fieldName) => /email/i.test(fieldName),
    rule: {
      placeholder: 'Enter Email Address',
      flex: 6,
      props: 'initialFormProps',
    },
  },

  {
    test: (fieldName) => /contact|phone|mobile/i.test(fieldName),
    rule: {
      widget: 'CustomContactInputWidget',
      placeholder: 'XXX-XXX-XXXX',
      flex: 6,
      options: {
        widget: 'CustomContactInputWidget',
      },
      props: {
        __spreadInitialFormProps: true,
        field: {
          __spreadInitialFormPropsField: true,
          sx: {
            '.MuiInputBase-root': {
              '.MuiInputAdornment-root': {
                marginRight: '0px',
              },
            },
          },
        },
      },
    },
  },

  {
    test: (fieldName) => /date/i.test(fieldName),
    rule: {
      placeholder: 'Select Date',
      flex: 6,
      props: 'initialFormProps',
    },
  },

  {
    test: (fieldName) => /postal|zip/i.test(fieldName),
    rule: {
      placeholder: 'Enter Postal Code',
      flex: 6,
      props: 'initialFormProps',
    },
  },
];