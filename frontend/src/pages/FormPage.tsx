import React, { useState } from 'react';
import { Form, Input, Select, InputNumber, AutoComplete, Button, Card, Row, Col, Space, Divider, Typography, message } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import frontendData from '../data/frontend_data.json';
import { useAnalysis } from '../hooks/useAnalysis';
import type { UserBackground } from '../types';

const { Option } = Select;
const { Title } = Typography;

const FormPage: React.FC = () => {
  const [form] = Form.useForm();
  const { isLoading, submitAnalysis } = useAnalysis();

  const onFinish = async (values: any) => {
    try {
      // 转换表单数据为UserBackground格式
      const userBackground: UserBackground = {
        academic: {
          university: values.academic.university,
          universityTier: values.academic.universityTier,
          major: values.academic.major,
          majorCategory: values.academic.majorCategory,
          gpa: values.academic.gpa,
          gpaScale: values.academic.gpaScale,
          graduationYear: values.academic.graduationYear
        },
        language: values.language?.type ? {
          type: values.language.type,
          total: values.language.total,
          reading: values.language.reading,
          listening: values.language.listening,
          speaking: values.language.speaking,
          writing: values.language.writing
        } : undefined,
        standardTests: {
          gre: values.standardTests?.gre ? {
            total: values.standardTests.gre.total,
            writing: values.standardTests.gre.writing
          } : undefined,
          gmat: values.standardTests?.gmat ? {
            total: values.standardTests.gmat.total
          } : undefined
        },
        applicationIntent: {
          countries: values.applicationIntent.countries,
          majors: values.applicationIntent.majors,
          degree: values.applicationIntent.degree
        },
        experience: {
          research: values.experience.research || [],
          internship: values.experience.internship || [],
          competition: values.experience.competition || [],
          others: values.experience.others || []
        }
      };

      await submitAnalysis(userBackground);
    } catch (error) {
      message.error('提交失败，请重试');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <Title level={1} style={{ textAlign: 'center', marginBottom: '30px' }}>
        留学申请背景信息
      </Title>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          academic: {
            gpaScale: 4.0,
            graduationYear: 2024
          },
          applicationIntent: {
            countries: [],
            majors: [],
            degree: 'Master'
          },
          experience: {
            research: [],
            internship: [],
            competition: [],
            others: []
          }
        }}
      >
        {/* 学术背景 */}
        <Card title="学术背景" style={{ marginBottom: '20px' }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="本科院校"
                name={['academic', 'university']}
                rules={[{ required: true, message: '请选择本科院校' }]}
              >
                <AutoComplete
                  placeholder="请输入或选择院校名称"
                  options={frontendData.universities.map(uni => ({ value: uni, label: uni }))}
                  filterOption={(inputValue, option) =>
                    option?.label?.toString().toLowerCase().includes(inputValue.toLowerCase()) ?? false
                  }
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="院校等级"
                name={['academic', 'universityTier']}
                rules={[{ required: true, message: '请选择院校等级' }]}
              >
                <Select placeholder="请选择院校等级">
                  <Option value="Tier 0">Tier 0 (清北复交等)</Option>
                  <Option value="Tier 1">Tier 1 (985高校)</Option>
                  <Option value="Tier 2">Tier 2 (211高校)</Option>
                  <Option value="Tier 3">Tier 3 (普通一本)</Option>
                  <Option value="Tier 4">Tier 4 (其他)</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="专业"
                name={['academic', 'major']}
                rules={[{ required: true, message: '请选择专业' }]}
              >
                <AutoComplete
                  placeholder="请输入或选择专业名称"
                  options={frontendData.majors.map(major => ({ value: major, label: major }))}
                  filterOption={(inputValue, option) =>
                    option?.label?.toString().toLowerCase().includes(inputValue.toLowerCase()) ?? false
                  }
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="专业大类"
                name={['academic', 'majorCategory']}
                rules={[{ required: true, message: '请选择专业大类' }]}
              >
                <Select placeholder="请选择专业大类">
                  <Option value="CS">计算机科学</Option>
                  <Option value="EE">电气电子</Option>
                  <Option value="Business">商科</Option>
                  <Option value="Arts">艺术</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="GPA"
                name={['academic', 'gpa']}
                rules={[
                  { required: true, message: '请输入GPA' },
                  { type: 'number', min: 0, max: 4, message: 'GPA必须在0-4之间' }
                ]}
              >
                <InputNumber
                  placeholder="请输入GPA"
                  min={0}
                  max={4}
                  step={0.01}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="GPA制式"
                name={['academic', 'gpaScale']}
                rules={[{ required: true, message: '请选择GPA制式' }]}
              >
                <Select>
                  <Option value={4.0}>4.0制</Option>
                  <Option value={5.0}>5.0制</Option>
                  <Option value={100}>100分制</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="毕业年份"
                name={['academic', 'graduationYear']}
                rules={[
                  { required: true, message: '请选择毕业年份' },
                  { type: 'number', min: 2020, max: 2030, message: '毕业年份必须在2020-2030之间' }
                ]}
              >
                <Select placeholder="请选择毕业年份">
                  {Array.from({ length: 11 }, (_, i) => 2020 + i).map(year => (
                    <Option key={year} value={year}>{year}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* 语言成绩 */}
        <Card title="语言成绩" style={{ marginBottom: '20px' }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="考试类型"
                name={['language', 'type']}
              >
                <Select placeholder="请选择考试类型" allowClear>
                  <Option value="TOEFL">TOEFL</Option>
                  <Option value="IELTS">IELTS</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="总分"
                name={['language', 'total']}
              >
                <InputNumber
                  placeholder="请输入总分"
                  min={0}
                  max={120}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={6}>
              <Form.Item
                label="阅读"
                name={['language', 'reading']}
              >
                <InputNumber
                  placeholder="阅读分数"
                  min={0}
                  max={30}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label="听力"
                name={['language', 'listening']}
              >
                <InputNumber
                  placeholder="听力分数"
                  min={0}
                  max={30}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label="口语"
                name={['language', 'speaking']}
              >
                <InputNumber
                  placeholder="口语分数"
                  min={0}
                  max={30}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label="写作"
                name={['language', 'writing']}
              >
                <InputNumber
                  placeholder="写作分数"
                  min={0}
                  max={30}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* 标准化考试 */}
        <Card title="标准化考试" style={{ marginBottom: '20px' }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="GRE总分"
                name={['standardTests', 'gre', 'total']}
              >
                <InputNumber
                  placeholder="请输入GRE总分"
                  min={260}
                  max={340}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="GRE写作"
                name={['standardTests', 'gre', 'writing']}
              >
                <InputNumber
                  placeholder="请输入写作分数"
                  min={0}
                  max={6}
                  step={0.5}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="GMAT总分"
                name={['standardTests', 'gmat', 'total']}
              >
                <InputNumber
                  placeholder="请输入GMAT总分"
                  min={200}
                  max={800}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* 申请意向 */}
        <Card title="申请意向" style={{ marginBottom: '20px' }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="目标国家"
                name={['applicationIntent', 'countries']}
                rules={[{ required: true, message: '请选择目标国家' }]}
              >
                <Select
                  mode="multiple"
                  placeholder="请选择目标国家"
                  allowClear
                >
                  <Option value="美国">美国</Option>
                  <Option value="英国">英国</Option>
                  <Option value="加拿大">加拿大</Option>
                  <Option value="澳大利亚">澳大利亚</Option>
                  <Option value="新加坡">新加坡</Option>
                  <Option value="香港">香港</Option>
                  <Option value="日本">日本</Option>
                  <Option value="德国">德国</Option>
                  <Option value="法国">法国</Option>
                  <Option value="荷兰">荷兰</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="目标专业"
                name={['applicationIntent', 'majors']}
                rules={[{ required: true, message: '请选择目标专业' }]}
              >
                <Select
                  mode="multiple"
                  placeholder="请选择目标专业"
                  allowClear
                >
                  {Object.entries(frontendData.target_majors).map(([category, majors]) => (
                    <Select.OptGroup key={category} label={category}>
                      {majors.map((major: string) => (
                        <Option key={major} value={major}>{major}</Option>
                      ))}
                    </Select.OptGroup>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="学位类型"
                name={['applicationIntent', 'degree']}
                rules={[{ required: true, message: '请选择学位类型' }]}
              >
                <Select placeholder="请选择学位类型">
                  <Option value="Master">硕士</Option>
                  <Option value="PhD">博士</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* 科研经历 */}
        <Card title="科研经历" style={{ marginBottom: '20px' }}>
          <Form.List name={['experience', 'research']}>
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <div key={key} style={{ border: '1px solid #d9d9d9', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
                    <Row gutter={16}>
                      <Col span={24}>
                        <Form.Item
                          {...restField}
                          name={[name, 'title']}
                          label="项目标题"
                          rules={[{ required: true, message: '请输入项目标题' }]}
                        >
                          <Input placeholder="请输入科研项目标题" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          {...restField}
                          name={[name, 'role']}
                          label="担任角色"
                          rules={[{ required: true, message: '请输入担任角色' }]}
                        >
                          <Input placeholder="如：项目负责人、研究员等" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          {...restField}
                          name={[name, 'description']}
                          label="项目描述"
                          rules={[{ required: true, message: '请输入项目描述' }]}
                        >
                          <Input.TextArea
                            placeholder="请详细描述项目内容、方法、成果等"
                            rows={3}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Button
                      type="text"
                      danger
                      icon={<MinusCircleOutlined />}
                      onClick={() => remove(name)}
                      style={{ marginTop: '8px' }}
                    >
                      删除此经历
                    </Button>
                  </div>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    添加科研经历
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Card>

        {/* 实习经历 */}
        <Card title="实习经历" style={{ marginBottom: '20px' }}>
          <Form.List name={['experience', 'internship']}>
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <div key={key} style={{ border: '1px solid #d9d9d9', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          {...restField}
                          name={[name, 'company']}
                          label="公司名称"
                          rules={[{ required: true, message: '请输入公司名称' }]}
                        >
                          <Input placeholder="请输入公司名称" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          {...restField}
                          name={[name, 'position']}
                          label="职位"
                          rules={[{ required: true, message: '请输入职位' }]}
                        >
                          <Input placeholder="请输入实习职位" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={24}>
                        <Form.Item
                          {...restField}
                          name={[name, 'description']}
                          label="工作描述"
                          rules={[{ required: true, message: '请输入工作描述' }]}
                        >
                          <Input.TextArea
                            placeholder="请详细描述工作内容、技能应用、成果等"
                            rows={3}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Button
                      type="text"
                      danger
                      icon={<MinusCircleOutlined />}
                      onClick={() => remove(name)}
                      style={{ marginTop: '8px' }}
                    >
                      删除此经历
                    </Button>
                  </div>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    添加实习经历
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Card>

        {/* 竞赛经历 */}
        <Card title="竞赛经历" style={{ marginBottom: '20px' }}>
          <Form.List name={['experience', 'competition']}>
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <div key={key} style={{ border: '1px solid #d9d9d9', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          {...restField}
                          name={[name, 'name']}
                          label="竞赛名称"
                          rules={[{ required: true, message: '请输入竞赛名称' }]}
                        >
                          <Input placeholder="请输入竞赛名称" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          {...restField}
                          name={[name, 'award']}
                          label="获奖情况"
                          rules={[{ required: true, message: '请输入获奖情况' }]}
                        >
                          <Input placeholder="如：一等奖、二等奖等" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          {...restField}
                          name={[name, 'role']}
                          label="担任角色"
                          rules={[{ required: true, message: '请输入担任角色' }]}
                        >
                          <Input placeholder="如：队长、队员等" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          {...restField}
                          name={[name, 'description']}
                          label="竞赛描述"
                          rules={[{ required: true, message: '请输入竞赛描述' }]}
                        >
                          <Input.TextArea
                            placeholder="请详细描述竞赛内容、过程、收获等"
                            rows={3}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Button
                      type="text"
                      danger
                      icon={<MinusCircleOutlined />}
                      onClick={() => remove(name)}
                      style={{ marginTop: '8px' }}
                    >
                      删除此经历
                    </Button>
                  </div>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    添加竞赛经历
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Card>

        {/* 其他经历 */}
        <Card title="其他经历" style={{ marginBottom: '20px' }}>
          <Form.List name={['experience', 'others']}>
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <div key={key} style={{ border: '1px solid #d9d9d9', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          {...restField}
                          name={[name, 'name']}
                          label="经历名称"
                          rules={[{ required: true, message: '请输入经历名称' }]}
                        >
                          <Input placeholder="请输入经历名称" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          {...restField}
                          name={[name, 'role']}
                          label="担任角色"
                          rules={[{ required: true, message: '请输入担任角色' }]}
                        >
                          <Input placeholder="请输入担任角色" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={24}>
                        <Form.Item
                          {...restField}
                          name={[name, 'description']}
                          label="经历描述"
                          rules={[{ required: true, message: '请输入经历描述' }]}
                        >
                          <Input.TextArea
                            placeholder="请详细描述经历内容、过程、收获等"
                            rows={3}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Button
                      type="text"
                      danger
                      icon={<MinusCircleOutlined />}
                      onClick={() => remove(name)}
                      style={{ marginTop: '8px' }}
                    >
                      删除此经历
                    </Button>
                  </div>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    添加其他经历
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Card>

        {/* 提交按钮 */}
        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <Button 
            type="primary" 
            htmlType="submit" 
            size="large" 
            loading={isLoading}
            disabled={isLoading}
            style={{ minWidth: '120px' }}
          >
            {isLoading ? '提交中...' : '提交分析'}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default FormPage;

