export interface AIModel {
  value: string;
  label: string;
  description?: string;
}

export const AI_MODELS: AIModel[] = [
  { value: 'qwen', label: '通义千问', description: '阿里云通义千问模型' },
  { value: 'deepseek-coder', label: 'DeepSeek-Coder', description: 'DeepSeek 代码生成模型' },
];

export const DEFAULT_MODEL = 'qwen';

export default AI_MODELS;
