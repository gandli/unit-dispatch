import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { streamText, generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import axios from 'axios';
import { z } from 'zod';

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());

// 简道云API配置
const JIANDAOYUN_APP_ID = process.env.JIANDAOYUN_APP_ID || '';
const JIANDAOYUN_API_KEY = process.env.JIANDAOYUN_API_KEY || '';

// 车辆状态枚举
enum VehicleStatus {
  AVAILABLE = 'available', // 可用（空闲，可出车）
  RESERVED = 'reserved', // 预留（已被派单但未出发）
  IN_TRANSIT = 'in_transit', // 出车中
  MAINTENANCE = 'maintenance', // 维修/保养
  OUT_OF_SERVICE = 'out_of_service' // 停驶（年检/故障/封存）
}

// 司机状态枚举
enum DriverStatus {
  AVAILABLE = 'available', // 可接单
  PENDING = 'pending', // 待出发（已接任务）
  EXECUTING = 'executing', // 执行中
  OFF_DUTY = 'off_duty', // 休息/下班
  UNAVAILABLE = 'unavailable' // 请假/培训
}

// 用车申请表单数据结构
const VehicleRequestSchema = z.object({
  userId: z.string(),
  userName: z.string(),
  department: z.string(),
  requestTime: z.string(),
  departureTime: z.string(),
  returnTime: z.string(),
  purpose: z.string(),
  passengers: z.number().optional(),
  departureLocation: z.string(),
  destination: z.string(),
  waypoints: z.array(z.string()).optional(), // 途径点
  isSharedRide: z.boolean().optional(), // 拼车同乘
  isSequential: z.boolean().optional(), // 接续用车
});

type VehicleRequest = z.infer<typeof VehicleRequestSchema>;

// 获取简道云员工联系人目录
async function fetchEmployeeDirectory(): Promise<any[]> {
  try {
    const response = await axios.post(
      `https://api.jiandaoyun.com/api/v1/app/${JIANDAOYUN_APP_ID}/data/list`,
      {
        api_key: JIANDAOYUN_API_KEY,
        form_id: process.env.EMPLOYEE_DIRECTORY_FORM_ID,
        limit: 1000
      }
    );
    return response.data.data;
  } catch (error) {
    console.error('获取员工目录失败:', error);
    return [];
  }
}

// 获取车辆信息
async function fetchVehicleInfo(): Promise<any[]> {
  try {
    const response = await axios.post(
      `https://api.jiandaoyun.com/api/v1/app/${JIANDAOYUN_APP_ID}/data/list`,
      {
        api_key: JIANDAOYUN_API_KEY,
        form_id: process.env.VEHICLE_INFO_FORM_ID,
        limit: 100
      }
    );
    return response.data.data;
  } catch (error) {
    console.error('获取车辆信息失败:', error);
    return [];
  }
}

// 获取司机信息
async function fetchDriverInfo(): Promise<any[]> {
  try {
    const response = await axios.post(
      `https://api.jiandaoyun.com/api/v1/app/${JIANDAOYUN_APP_ID}/data/list`,
      {
        api_key: JIANDAOYUN_API_KEY,
        form_id: process.env.DRIVER_INFO_FORM_ID,
        limit: 100
      }
    );
    return response.data.data;
  } catch (error) {
    console.error('获取司机信息失败:', error);
    return [];
  }
}

// AI聊天处理路由
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, userId } = req.body;
    
    // 获取上下文数据
    const [employees, vehicles, drivers] = await Promise.all([
      fetchEmployeeDirectory(),
      fetchVehicleInfo(),
      fetchDriverInfo()
    ]);
    
    const contextData = {
      employees,
      vehicles,
      drivers,
      vehicleStatuses: Object.values(VehicleStatus),
      driverStatuses: Object.values(DriverStatus)
    };
    
    // 使用Vercel AI SDK生成响应
    const result = await streamText({
      model: openai('gpt-4-turbo'),
      system: `你是一个单位用车管理系统助手。你可以处理以下操作：
1. 用车申请 - 员工提交用车需求
2. 审批调度 - 车管员审核和批准申请
3. 派车响应 - 司机接收任务并更新状态
4. 状态查询 - 查询车辆和司机当前状态
5. 拼车协调 - 协调多个员工的拼车需求
6. 接续用车 - 处理连续的用车需求
7. 临时变更 - 处理取消或修改需求

当前系统数据：
- 员工: ${JSON.stringify(employees.slice(0, 5))}
- 车辆: ${JSON.stringify(vehicles.slice(0, 5))}
- 司机: ${JSON.stringify(drivers.slice(0, 5))}

请根据用户需求提供相应的帮助和操作指导。`,
      messages,
      onFinish: async ({ text }) => {
        console.log('AI响应完成:', text);
      }
    });
    
    // 流式响应
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    for await (const chunk of result.textStream) {
      res.write(chunk);
    }
    res.end();
    
  } catch (error) {
    console.error('聊天处理错误:', error);
    res.status(500).json({ error: '处理请求时发生错误' });
  }
});

// 用车申请提交路由
app.post('/api/requests', async (req, res) => {
  try {
    const requestData = VehicleRequestSchema.parse(req.body);
    
    // 这里应该调用简道云API保存申请数据
    // 暂时返回模拟响应
    const mockResponse = {
      id: 'req_' + Date.now(),
      status: 'pending',
      ...requestData
    };
    
    res.json(mockResponse);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: '数据验证失败', details: error.errors });
    } else {
      res.status(500).json({ error: '处理申请时发生错误' });
    }
  }
});

// 获取车辆状态
app.get('/api/vehicles/status', async (req, res) => {
  try {
    const vehicles = await fetchVehicleInfo();
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ error: '获取车辆状态失败' });
  }
});

// 获取司机状态
app.get('/api/drivers/status', async (req, res) => {
  try {
    const drivers = await fetchDriverInfo();
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ error: '获取司机状态失败' });
  }
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`用车申请系统服务器运行在端口 ${PORT}`);
});

export default app;