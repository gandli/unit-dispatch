import { generateText, streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { VehicleRequest, VehicleStatus, DriverStatus } from './types';

// 用车申请解析模式
const VehicleRequestSchema = z.object({
  userId: z.string(),
  userName: z.string(),
  department: z.string(),
  requestTime: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  purpose: z.string(),
  passengers: z.number().optional(),
  route: z.string(),
  waypoints: z.array(z.string()).optional(),
  carpool: z.boolean().optional(),
  contactInfo: z.string()
});

// 状态更新模式
const StatusUpdateSchema = z.object({
  type: z.enum(['vehicle', 'driver']),
  id: z.string(),
  status: z.union([
    z.enum(['available', 'reserved', 'dispatched', 'maintenance', 'inactive']),
    z.enum(['available', 'pending', 'active', 'off-duty', 'unavailable'])
  ])
});

export async function handleChatMessage(message: string, context: any) {
  try {
    // 使用AI分析用户消息意图
    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      system: `你是一个单位用车管理系统助手。请根据用户消息判断其意图：
      1. 用车申请 - 提取时间、地点、事由、人数等信息
      2. 状态查询 - 查询车辆或司机状态
      3. 状态更新 - 更新车辆或司机状态
      4. 审批操作 - 批准或拒绝用车申请
      5. 其他咨询 - 提供系统使用帮助`,
      prompt: message,
      maxTokens: 500
    });

    // 解析AI返回的结果
    const intent = parseIntent(text);
    
    switch (intent.type) {
      case 'vehicle_request':
        return await processVehicleRequest(intent.data, context);
      case 'status_query':
        return await queryStatus(intent.data, context);
      case 'status_update':
        return await updateStatus(intent.data, context);
      case 'approval':
        return await processApproval(intent.data, context);
      default:
        return { type: 'help', message: '我可以帮您处理用车申请、查询状态或提供系统帮助。' };
    }
  } catch (error) {
    console.error('Chatbot error:', error);
    return { type: 'error', message: '处理请求时出现错误，请稍后重试。' };
  }
}

function parseIntent(aiResponse: string): any {
  // 简单的意图解析逻辑
  if (aiResponse.includes('用车申请')) {
    return { type: 'vehicle_request', data: {} };
  } else if (aiResponse.includes('状态查询')) {
    return { type: 'status_query', data: {} };
  } else if (aiResponse.includes('状态更新')) {
    return { type: 'status_update', data: {} };
  } else if (aiResponse.includes('审批')) {
    return { type: 'approval', data: {} };
  } else {
    return { type: 'help', data: {} };
  }
}

async function processVehicleRequest(data: any, context: any) {
  // 处理用车申请逻辑
  return { type: 'request_processed', message: '用车申请已提交，请等待审批。' };
}

async function queryStatus(data: any, context: any) {
  // 查询状态逻辑
  return { type: 'status_result', message: '查询结果...' };
}

async function updateStatus(data: any, context: any) {
  // 更新状态逻辑
  return { type: 'status_updated', message: '状态已更新。' };
}

async function processApproval(data: any, context: any) {
  // 处理审批逻辑
  return { type: 'approval_processed', message: '审批操作已完成。' };
}

// 流式响应函数（用于实时对话）
export async function streamChatResponse(message: string, context: any) {
  const stream = await streamText({
    model: openai('gpt-4o-mini'),
    system: `你是一个专业的单位用车管理系统助手。请以简洁、专业的语气回答用户问题。
    当前可用功能：用车申请、状态查询、审批处理、系统帮助。
    请根据上下文提供准确的信息。`,
    prompt: message
  });
  
  return stream;
}