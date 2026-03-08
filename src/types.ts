// 车辆和司机状态类型定义
export enum VehicleStatus {
  AVAILABLE = 'available',      // 可用（空闲，可出车）
  RESERVED = 'reserved',       // 预留（已被派单但未出发）
  IN_USE = 'in_use',           // 出车中
  MAINTENANCE = 'maintenance', // 维修/保养
  OUT_OF_SERVICE = 'out_of_service' // 停驶（年检/故障/封存）
}

export enum DriverStatus {
  AVAILABLE = 'available',     // 可接单
  PENDING = 'pending',         // 待出发（已接任务）
  IN_PROGRESS = 'in_progress', // 执行中
  OFF_DUTY = 'off_duty',       // 休息/下班
  UNAVAILABLE = 'unavailable'  // 请假/培训
}

// 用户角色
export enum UserRole {
  EMPLOYEE = 'employee',       // 普通员工
  FLEET_MANAGER = 'fleet_manager', // 车管员
  DRIVER = 'driver'            // 司机
}

// 用车申请类型
export interface VehicleRequest {
  id: string;
  userId: string;
  userName: string;
  department: string;
  requestTime: string;
  startTime: string;
  endTime: string;
  purpose: string;
  passengers: number;
  pickupLocation: string;
  destination: string;
  waypoints?: string[];        // 途径点
  status: RequestStatus;
  vehicleId?: string;
  driverId?: string;
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
}

export enum RequestStatus {
  PENDING = 'pending',         // 待审批
  APPROVED = 'approved',       // 已批准
  REJECTED = 'rejected',       // 已拒绝
  ASSIGNED = 'assigned',       // 已分配
  COMPLETED = 'completed',     // 已完成
  CANCELLED = 'cancelled'      // 已取消
}

// 车辆信息
export interface Vehicle {
  id: string;
  plateNumber: string;
  model: string;
  brand: string;
  year: number;
  mileage: number;
  fuelConsumption: number;     // 每公里油耗(L/100km)
  purchaseDate: string;
  depreciationRate: number;    // 折旧率
  status: VehicleStatus;
  lastMaintenance: string;
  nextMaintenance: string;
}

// 司机信息
export interface Driver {
  id: string;
  name: string;
  phone: string;
  licenseNumber: string;
  status: DriverStatus;
  assignedVehicleId?: string;
}

// 简道云API响应类型
export interface JiandaoyunContact {
  _id: string;
  name: string;
  department: string;
  phone: string;
  email: string;
  role: UserRole;
}

export interface JiandaoyunApiResponse<T> {
  code: number;
  message: string;
  data: T;
}