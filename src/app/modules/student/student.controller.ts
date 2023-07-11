import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import pick from '../../../shared/pick';
import { IStudent } from './student.interface';
import { paginationFields } from '../../../constants/pagination';
import { studentFilterableFields } from './student.constant';
import sendResponse from '../../../shared/sendResponse';
import { StudentService } from './student.service';

const getAllStudents = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, studentFilterableFields);
  const paginationOptions = pick(req.query, paginationFields);

  const result = await StudentService.getAllStudents(
    filters,
    paginationOptions
  );

  sendResponse<IStudent[]>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Students retrieved successfully!',
    meta: result.meta,
    data: result.data,
  });
});

const getSingleStudent = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await StudentService.getSingleStudent(id);

  sendResponse<IStudent>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Student retrieved successfully!',
    data: result,
  });
});

const updateStudent = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const updateData = req.body;
  const result = await StudentService.updateStudent(id, updateData);

  sendResponse<IStudent>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Student Updated successfully!',
    data: result,
  });
});

const deleteStudent = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await StudentService.deleteStudent(id);

  sendResponse<IStudent>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Student Deleted Successfully!',
    data: result,
  });
});

export const StudentController = {
  getAllStudents,
  getSingleStudent,
  updateStudent,
  deleteStudent,
};
