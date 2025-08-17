import React from 'react';
import { Form, Input, Select, InputNumber, AutoComplete, Button, Row, Col } from 'antd';
import { MinusCircleOutlined } from '@ant-design/icons';

const { Option } = Select;

interface FormFieldProps {
  name: string[];
  label: string;
  type: 'input' | 'textarea' | 'select' | 'number' | 'autocomplete';
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  min?: number;
  max?: number;
  step?: number;
  rows?: number;
  allowClear?: boolean;
  mode?: 'multiple' | undefined;
  filterOption?: (inputValue: string, option: any) => boolean;
}

export const FormField: React.FC<FormFieldProps> = ({
  name,
  label,
  type,
  required = false,
  placeholder,
  options = [],
  min,
  max,
  step,
  rows = 3,
  allowClear = false,
  mode,
  filterOption
}) => {
  const rules = required ? [{ required: true, message: `请输入${label}` }] : [];

  const renderField = () => {
    switch (type) {
      case 'input':
        return <Input placeholder={placeholder} />;
      case 'textarea':
        return <Input.TextArea placeholder={placeholder} rows={rows} />;
      case 'select':
        return (
          <Select placeholder={placeholder} allowClear={allowClear} mode={mode}>
            {options.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        );
      case 'number':
        return (
          <InputNumber
            placeholder={placeholder}
            min={min}
            max={max}
            step={step}
            style={{ width: '100%' }}
          />
        );
      case 'autocomplete':
        return (
          <AutoComplete
            placeholder={placeholder}
            options={options}
            filterOption={filterOption}
          />
        );
      default:
        return <Input placeholder={placeholder} />;
    }
  };

  return (
    <Form.Item
      name={name}
      label={label}
      rules={rules}
    >
      {renderField()}
    </Form.Item>
  );
};

interface ExperienceFieldProps {
  name: string[];
  fields: Array<{
    key: string;
    type: 'input' | 'textarea' | 'select';
    label: string;
    placeholder?: string;
    options?: Array<{ value: string; label: string }>;
    span?: number;
    rows?: number;
  }>;
  onRemove: (name: number) => void;
}

export const ExperienceField: React.FC<ExperienceFieldProps> = ({
  name,
  fields,
  onRemove
}) => {
  return (
    <div style={{ border: '1px solid #d9d9d9', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
      <Row gutter={16}>
        {fields.map((field, index) => (
          <Col key={field.key} span={field.span || 12}>
            <FormField
              name={[...name, field.key]}
              label={field.label}
              type={field.type}
              required={true}
              placeholder={field.placeholder}
              options={field.options}
              rows={field.rows}
            />
          </Col>
        ))}
      </Row>
      <Button
        type="text"
        danger
        icon={<MinusCircleOutlined />}
        onClick={() => onRemove(parseInt(name[name.length - 1].toString()))}
        style={{ marginTop: '8px' }}
      >
        删除此经历
      </Button>
    </div>
  );
};
