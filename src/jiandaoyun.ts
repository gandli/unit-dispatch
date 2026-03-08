import axios from 'axios';
import { VehicleRequest, Vehicle, Driver, RequestStatus } from './types';

// 简道云API配置
const JIANDAOYUN_API_BASE = 'https://api.jiandaoyun.com/api/v1/app';
const APP_ID = process.env.JIANDAOYUN_APP_ID || '';
const API_KEY = process.env.JIANDAOYUN_API_KEY || '';

// 创建axios实例
const jiandaoyun = axios.create({
  baseURL: JIANDAOYUN_API_BASE,
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

/**
 * 获取员工联系人目录
 */
export async function getEmployeeDirectory(): Promise<any[]> {
  try {
    const response = await jiandaoyun.get(`/entry/${APP_ID}/data-list`);
    return response.data.data;
  } catch (error) {
    console.error('获取员工目录失败:', error);
    throw error;
  }
}

/**
 * 创建用车申请记录
 */
export async function createVehicleRequest(request: VehicleRequest): Promise<any> {
  try {
    const response = await jiandaoyun.post(`/entry/${APP_ID}/data-create`, {
      data: {
        user_id: request.userId,
        request_time: request.requestTime,
        departure_time: request.departureTime,
        return_time: request.returnTime,
        purpose: request.purpose,
        destination: request.destination,
        passenger_count: request.passengerCount,
        vehicle_type: request.vehicleType,
        status: request.status
      }
    });
    return response.data;
  } catch (error) {
    console.error('创建用车申请失败:', error);
    throw error;
  }
}

/**
 * 更新用车申请状态
 */
export async function updateVehicleRequest(requestId: string, status: RequestStatus): Promise<any> {
  try {
    const response = await jiandaoyun.post(`/entry/${APP_ID}/data-update`, {
      data_id: requestId,
      data: {
        status: status
      }
    });
    return response.data;
  } catch (error) {
    console.error('更新用车申请状态失败:', error);
    throw error;
  }
}

/**
 * 获取所有车辆信息
 */
export async function getVehicles(): Promise<Vehicle[]> {
  try {
    // 这里需要根据实际的简道云数据表结构调整
    const response = await jiandaoyun.get(`/entry/${APP_ID}/vehicles`);
    return response.data.data;
  } catch (error) {
    console.error('获取车辆信息失败:', error);
    throw error;
  }
}

/**
 * 获取所有司机信息
 */
export async function getDrivers(): Promise<Driver[]> {
  try {
    // 这里需要根据实际的简道云数据表结构调整
    const response = await jiandaoyun.get(`/entry/${APP_ID}/drivers`);
    return response.data.data;
  } catch (error) {
    console.error('获取司机信息失败:', error);
    throw error;
  }
}

/**
 * 分配车辆和司机
 */
export async function assignVehicleAndDriver(requestId: string, vehicleId: string, driverId: string): Promise<any> {
  try {
    const response = await jiandaoyun.post(`/entry/${APP_ID}/assign`, {
      request_id: requestId,
      vehicle_id: vehicleId,
      driver_id: driverId
    });
    return response.data;
  } catch (error) {
    console.error('分配车辆和司机失败:', error);
    throw error;
  }
}