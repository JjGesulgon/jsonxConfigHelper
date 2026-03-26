import React, { useEffect, useMemo, useState } from 'react';
import Form from '@rjsf/mui';
import validator from '@rjsf/validator-ajv8';
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import enrichSchemaFromApi from '../../utils/schemaEnricher';
import { generateUiSchemaFromSchema } from '../../utils/uiSchemaGenerator';

function isPlainObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value);
}

function isOptionDrivenField(value) {
  return (
    isPlainObject(value) &&
    'value' in value &&
    Array.isArray(value.options) &&
    typeof value.ui_type === 'string'
  );
}

function buildInitialFormDataFromSchema(schema) {
  if (!schema) return {};

  if (schema.type === 'object') {
    const result = {};
    Object.entries(schema.properties || {}).forEach(([key, value]) => {
      const child = buildInitialFormDataFromSchema(value);
      if (child !== undefined) result[key] = child;
    });
    return result;
  }

  if (schema.type === 'array') return [];
  if (schema.default !== undefined) return schema.default;
  if (schema.type === 'boolean') return false;
  if (schema.type === 'number' || schema.type === 'integer') return undefined;

  return '';
}

function normalizeFormDataFromApi(apiNode, schemaNode) {
  if (!schemaNode) return undefined;

  if (schemaNode.type === 'object') {
    const result = {};
    const properties = schemaNode.properties || {};

    Object.entries(properties).forEach(([key, childSchema]) => {
      const apiValue = isPlainObject(apiNode) ? apiNode[key] : undefined;
      const normalizedChild = normalizeFormDataFromApi(apiValue, childSchema);

      if (normalizedChild !== undefined) {
        result[key] = normalizedChild;
      }
    });

    return result;
  }

  if (isOptionDrivenField(apiNode)) {
    return apiNode.value;
  }

  if (apiNode !== undefined) {
    return apiNode;
  }

  if (schemaNode.default !== undefined) {
    return schemaNode.default;
  }

  if (schemaNode.type === 'array') return [];
  if (schemaNode.type === 'boolean') return false;
  if (schemaNode.type === 'number' || schemaNode.type === 'integer') return undefined;

  return '';
}

function CustomInputWidget(props) {
  const formControlProps = props?.uiSchema?.props?.formControl || {};
  const formLabelProps = props?.uiSchema?.props?.formLabel || {};
  const fieldProps = props?.uiSchema?.props?.field || {};

  return (
    <FormControl
      {...formControlProps}
      sx={{ width: '100%', ...(formControlProps?.sx || {}) }}
    >
      <FormLabel
        {...formLabelProps}
        htmlFor={props.id}
        sx={{ mb: 0.75, ...(formLabelProps?.sx || {}) }}
      >
        {props.label}
      </FormLabel>

      <TextField
        {...fieldProps}
        id={props.id}
        value={props.value ?? ''}
        onChange={(e) => props.onChange(e.target.value)}
        placeholder={props.placeholder}
        error={Boolean((props.rawErrors || []).length)}
        helperText={(props.rawErrors || [])[0] || ''}
        disabled={props.disabled || props.readonly}
        fullWidth
      />
    </FormControl>
  );
}

function CustomBooleanWidget(props) {
  const formControlProps = props?.uiSchema?.props?.formControl || {};
  const formLabelProps = props?.uiSchema?.props?.formLabel || {};

  return (
    <FormControl
      {...formControlProps}
      sx={{ width: '100%', ...(formControlProps?.sx || {}) }}
    >
      <FormLabel
        {...formLabelProps}
        htmlFor={props.id}
        sx={{ mb: 1, ...(formLabelProps?.sx || {}) }}
      >
        {props.label}
      </FormLabel>

      <Box sx={{ display: 'flex', alignItems: 'center', minHeight: 40 }}>
        <Switch
          checked={Boolean(props.value)}
          onChange={(e) => props.onChange(e.target.checked)}
        />
        <Typography variant="body2">{props.value ? 'True' : 'False'}</Typography>
      </Box>

      <FormHelperText error>{(props.rawErrors || [])[0] || ''}</FormHelperText>
    </FormControl>
  );
}

function CustomSelectWidget(props) {
  const formControlProps = props?.uiSchema?.props?.formControl || {};
  const formLabelProps = props?.uiSchema?.props?.formLabel || {};
  const fieldProps = props?.uiSchema?.props?.field || {};
  const options = props?.options?.enumOptions || [];

  return (
    <FormControl
      {...formControlProps}
      sx={{ width: '100%', ...(formControlProps?.sx || {}) }}
      error={Boolean((props.rawErrors || []).length)}
    >
      <FormLabel
        {...formLabelProps}
        htmlFor={props.id}
        sx={{ mb: 0.75, ...(formLabelProps?.sx || {}) }}
      >
        {props.label}
      </FormLabel>

      <Select
        {...fieldProps}
        id={props.id}
        value={props.value ?? ''}
        onChange={(e) => props.onChange(e.target.value)}
        displayEmpty
        fullWidth
      >
        <MenuItem value="">
          <em>{props.placeholder || 'Select'}</em>
        </MenuItem>

        {options.map((option, index) => (
          <MenuItem key={`${props.id}-${index}`} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>

      <FormHelperText>{(props.rawErrors || [])[0] || ''}</FormHelperText>
    </FormControl>
  );
}

function CustomContactInputWidget(props) {
  const formControlProps = props?.uiSchema?.props?.formControl || {};
  const formLabelProps = props?.uiSchema?.props?.formLabel || {};
  const fieldProps = props?.uiSchema?.props?.field || {};
  const [selectedOption, setSelectedOption] = useState('+63');

  return (
    <FormControl
      {...formControlProps}
      sx={{ width: '100%', ...(formControlProps?.sx || {}) }}
    >
      <FormLabel
        {...formLabelProps}
        htmlFor={props.id}
        sx={{ mb: 0.75, ...(formLabelProps?.sx || {}) }}
      >
        {props.label}
      </FormLabel>

      <TextField
        {...fieldProps}
        id={props.id}
        type="tel"
        value={props.value ?? ''}
        placeholder={props.placeholder}
        onChange={(e) => {
          const next = e.target.value;
          if (next === '' || /^\d+$/.test(next)) props.onChange(next);
        }}
        error={Boolean((props.rawErrors || []).length)}
        helperText={(props.rawErrors || [])[0] || ''}
        fullWidth
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Select
                size={fieldProps?.size || 'small'}
                value={selectedOption}
                onChange={(e) => setSelectedOption(e.target.value)}
                sx={{ minWidth: 72 }}
              >
                <MenuItem value="+63">+63</MenuItem>
              </Select>
            </InputAdornment>
          ),
        }}
      />
    </FormControl>
  );
}

function ObjectFieldTemplate(props) {
  const isRootObject = props.idSchema?.$id === 'root';

  return (
    <Grid
      container
      spacing={2.5}
      justifyContent="flex-start"
      alignItems="flex-start"
      sx={{ width: '100%', m: 0 }}
    >
      {!isRootObject && (
        <Grid item xs={12}>
          <Box sx={{ mb: 1.5, textAlign: 'left' }}>
            {props.title && (
              <Typography
                {...props?.uiSchema?.title?.props}
                sx={{
                  fontSize: 20,
                  fontWeight: 700,
                  lineHeight: 1.25,
                  mb: 0.5,
                  textAlign: 'left',
                  ...(props?.uiSchema?.title?.props?.sx || {}),
                }}
              >
                {props.title}
              </Typography>
            )}

            {props.description && (
              <Typography
                sx={{
                  color: 'text.secondary',
                  textAlign: 'left',
                  m: 0,
                }}
              >
                {props.description}
              </Typography>
            )}
          </Box>
        </Grid>
      )}

      {props.properties.map((element, index) => {
        if (element.hidden) return null;

        return (
          <Grid
            key={index}
            item
            xs={12}
            sm={element?.content?.props?.uiSchema?.['ui:fieldFlexWidth'] || 12}
            sx={element?.content?.props?.uiSchema?.['ui:containerStyle'] || {}}
          >
            {element.content}
          </Grid>
        );
      })}
    </Grid>
  );
}

const themeObject = {
  templates: { ObjectFieldTemplate },
  showErrorList: false,
  widgets: {
    TextWidget: CustomInputWidget,
    SelectWidget: CustomSelectWidget,
    CheckboxWidget: CustomBooleanWidget,
    CustomContactInputWidget,
  },
};

function JsonXMuiForm(props) {
  const transformErrors = (errors, uiSchema) => {
    const seen = new Set();

    const result = (errors || [])
      .map((err) => ({
        ...err,
        message: err?.name === 'required' ? 'This field is required.' : err?.message,
      }))
      .filter((err) => {
        const key = `${err.property}-${err.name}-${err.message}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

    return props?.transformErrors?.(result, uiSchema) || result;
  };

  return (
    <Form
      {...themeObject}
      {...props}
      validator={validator}
      transformErrors={transformErrors}
    />
  );
}

export default function JsonxMuiFormPreview({ config, apiResponse }) {
  const enrichedSchema = useMemo(
    () => enrichSchemaFromApi(config?.schema, apiResponse),
    [config?.schema, apiResponse]
  );

  const generatedUiSchema = useMemo(
    () => generateUiSchemaFromSchema(config?.schema, apiResponse),
    [config?.schema, apiResponse]
  );

  const resolvedUiSchema = useMemo(
    () => config?.uiSchema || generatedUiSchema || {},
    [config?.uiSchema, generatedUiSchema]
  );

  const initialFormData = useMemo(() => {
    if (apiResponse) {
      return normalizeFormDataFromApi(apiResponse?.data || apiResponse, enrichedSchema);
    }

    return buildInitialFormDataFromSchema(enrichedSchema);
  }, [apiResponse, enrichedSchema]);

  const [formData, setFormData] = useState(initialFormData);
  const [tab, setTab] = useState(0);

  const actionButtons = config?.navigation_buttons || [];

  useEffect(() => {
    setFormData(initialFormData);
  }, [initialFormData]);

  const handleTabChange = (_, newValue) => {
    setTab(newValue);
  };

  const handleSubmit = ({ formData: submittedFormData }) => {
    window.alert(`Submitted:\n${JSON.stringify(submittedFormData, null, 2)}`);
  };

  const handleSave = () => {
    window.alert(`Saved:\n${JSON.stringify(formData, null, 2)}`);
  };

  const handleCancelClick = () => {
    setFormData(initialFormData);
  };

  const triggerSubmit = () => {
    document.getElementById('jsonx-hidden-submit')?.click();
  };

  const actionMap = {
    cancel: handleCancelClick,
    onCancel: handleCancelClick,
    onClosePrompt: handleCancelClick,

    save: handleSave,
    onSave: handleSave,
    onSaveDetails: handleSave,

    submit: triggerSubmit,
    onSubmit: triggerSubmit,
  };

  const handleActionClick = (button) => {
    const action = String(button?.action || '');
    const handler = actionMap[action];

    if (handler) {
      handler();
      return;
    }

    window.alert(`${button?.action || button?.label || 'button'} clicked`);
  };

  return (
    <Paper
      sx={{
        p: 4,
        borderRadius: 4,
        boxShadow: 'none',
        width: '100%',
        textAlign: 'left',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
      }}
    >
      <Box sx={{ mb: 3, textAlign: 'left' }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            lineHeight: 1.2,
            mb: 1,
            textAlign: 'left',
          }}
        >
          {config?.main_header || enrichedSchema?.title || 'Generated Form'}
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ textAlign: 'left', m: 0 }}
        >
          Live form preview generated from the current schema, uiSchema, and config.
        </Typography>
      </Box>

      <Box sx={{ mt: 1 }}>
        <Tabs
          value={tab}
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
        >
          <Tab label="Form Preview" />
          <Tab label="Form Data JSON" />
        </Tabs>

        {tab === 0 && (
          <Box>
            <JsonXMuiForm
              schema={enrichedSchema}
              uiSchema={resolvedUiSchema}
              formData={formData}
              onChange={(e) => setFormData(e.formData)}
              onSubmit={handleSubmit}
            >
              <button
                id="jsonx-hidden-submit"
                type="submit"
                style={{ display: 'none' }}
              />
            </JsonXMuiForm>

            {!!actionButtons.length && (
              <Stack
                direction="row"
                spacing={1.5}
                justifyContent="flex-end"
                sx={{ mt: 2, flexWrap: 'wrap' }}
              >
                {actionButtons.map((button, index) => (
                  <Button
                    key={`${button?.label || button?.action || 'button'}-${index}`}
                    variant={button?.color === 'secondary' ? 'outlined' : 'contained'}
                    color={button?.color || 'primary'}
                    onClick={() => handleActionClick(button)}
                  >
                    {button?.label || 'Action'}
                  </Button>
                ))}
              </Stack>
            )}
          </Box>
        )}

        {tab === 1 && (
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 3,
              backgroundColor: '#fafafa',
            }}
          >
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: 12 }}>
              {JSON.stringify(formData, null, 2)}
            </pre>
          </Paper>
        )}
      </Box>
    </Paper>
  );
}