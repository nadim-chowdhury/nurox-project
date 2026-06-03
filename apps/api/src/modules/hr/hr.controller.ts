import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
  Res,
  Req,
  UsePipes,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { HrService } from './hr.service';
import { ProfileChangeStatus } from './entities/profile-change-request.entity';
import { ResignationStatus } from './entities/resignation.entity';
import { TrainingStatus } from './entities/training.entity';
import {
  CreateEmployeeDto,
  OkrDto,
  TrainingDto,
  SkillDto,
  createDepartmentSchema,
  updateDepartmentSchema,
  CreateDepartmentDto as CreateDepartmentSchemaDto,
  UpdateDepartmentDto as UpdateDepartmentSchemaDto,
  TransferEmployeeDto,
  TerminationDto,
  PipDto,
  ThreeSixtyReviewDto,
  createEmployeeSchema,
  transferEmployeeSchema,
  terminationSchema,
  threeSixtyReviewSchema,
  pipSchema,
  okrSchema,
  trainingSchema,
  skillSchema,
  updateSalarySchema,
  UpdateSalaryDto,
} from '@repo/shared-schemas';
import { SalaryChangeReason } from './entities/salary-history.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { Permission } from '../auth/enums/permissions.enum';
import { QueryEmployeeDto } from './dto/query-employee.dto';
import { CreateDesignationDto } from './dto/create-designation.dto';
import { UpdateDesignationDto } from './dto/update-designation.dto';
import { CreateGradeDto } from './dto/create-grade.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';
import {
  CreateSalaryRevisionDto,
  UpdateSalaryRevisionStatusDto,
} from './dto/salary-revision.dto';
import {
  CreateTransferRequestDto,
  UpdateTransferStatusDto,
} from './dto/transfer-request.dto';
import { CheckModule } from '../../common/guards/module.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { AuditLogInterceptor } from '../../common/interceptors/audit-log.interceptor';

@ApiTags('HR Management')
@ApiBearerAuth()
@Controller('hr')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@CheckModule('hr')
@UseInterceptors(AuditLogInterceptor)
export class HrController {
  constructor(private readonly hrService: HrService) {}

  @Post('employees')
  @ApiOperation({ summary: 'Create a new employee' })
  @RequirePermissions(Permission.HR_CREATE_EMPLOYEE)
  @UsePipes(new ZodValidationPipe(createEmployeeSchema))
  createEmployee(@Body() dto: CreateEmployeeDto) {
    return this.hrService.createEmployee(dto);
  }

  @Get('employees')
  @ApiOperation({ summary: 'Get all employees with filtering' })
  @RequirePermissions(Permission.HR_VIEW_EMPLOYEES)
  findAllEmployees(@Query() query: QueryEmployeeDto) {
    return this.hrService.findAllEmployees(query);
  }

  @Get('employees/:id')
  @ApiOperation({ summary: 'Get employee details by ID' })
  findEmployee(@Param('id', ParseUUIDPipe) id: string) {
    return this.hrService.findEmployeeById(id);
  }

  @Patch('employees/:id')
  @ApiOperation({ summary: 'Update employee details' })
  @RequirePermissions(Permission.HR_UPDATE_EMPLOYEE)
  updateEmployee(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Partial<CreateEmployeeDto>,
  ) {
    // Partial update might need a different schema or handling
    return this.hrService.updateEmployee(id, dto);
  }

  @Post('employees/:id/transfer')
  @ApiOperation({
    summary: 'Transfer an employee to a different department/location',
  })
  @RequirePermissions(Permission.HR_UPDATE_EMPLOYEE)
  @UsePipes(new ZodValidationPipe(transferEmployeeSchema))
  transferEmployee(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: TransferEmployeeDto,
  ) {
    return this.hrService.transferEmployee(id, dto);
  }

  @Post('employees/:id/terminate')
  @ApiOperation({ summary: 'Terminate employee employment' })
  @RequirePermissions(Permission.HR_UPDATE_EMPLOYEE)
  @UsePipes(new ZodValidationPipe(terminationSchema))
  terminateEmployee(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: TerminationDto,
  ) {
    return this.hrService.terminateEmployee(id, dto);
  }

  @Post('employees/:id/360-review')
  @ApiOperation({ summary: 'Submit a 360-degree performance review' })
  @RequirePermissions(Permission.HR_MANAGE_PERFORMANCE)
  @UsePipes(new ZodValidationPipe(threeSixtyReviewSchema))
  submit360Review(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ThreeSixtyReviewDto,
  ) {
    return this.hrService.submit360Review(id, dto);
  }

  @Post('employees/:id/pip')
  @ApiOperation({ summary: 'Initiate a Performance Improvement Plan (PIP)' })
  @RequirePermissions(Permission.HR_MANAGE_PERFORMANCE)
  @UsePipes(new ZodValidationPipe(pipSchema))
  initiatePIP(@Param('id', ParseUUIDPipe) id: string, @Body() dto: PipDto) {
    return this.hrService.initiatePIP(id, dto);
  }

  @Get('trainings')
  @ApiOperation({ summary: 'Get all training sessions' })
  @RequirePermissions(Permission.HR_VIEW_EMPLOYEES)
  findAllTrainings() {
    return this.hrService.findAllTrainings();
  }

  @Get('skill-matrix')
  @ApiOperation({ summary: 'Get organizational skill matrix' })
  @RequirePermissions(Permission.HR_VIEW_EMPLOYEES)
  getSkillMatrix() {
    return this.hrService.getSkillMatrix();
  }

  @Patch('employees/:id/salary')
  @ApiOperation({ summary: 'Update employee salary' })
  @RequirePermissions(Permission.HR_UPDATE_EMPLOYEE)
  @UsePipes(new ZodValidationPipe(updateSalarySchema))
  updateSalary(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSalaryDto,
  ) {
    return this.hrService.updateSalary(
      id,
      dto.newSalary,
      dto.reason as SalaryChangeReason,
      dto.comments,
    );
  }

  @Post('employees/:id/okr')
  @ApiOperation({ summary: 'Add Objective and Key Result (OKR) for employee' })
  @RequirePermissions(Permission.HR_MANAGE_PERFORMANCE)
  @UsePipes(new ZodValidationPipe(okrSchema))
  addOKR(@Param('id', ParseUUIDPipe) id: string, @Body() dto: OkrDto) {
    return this.hrService.addOKR(id, dto);
  }

  @Post('employees/:id/training')
  @ApiOperation({ summary: 'Assign training to employee' })
  @RequirePermissions(Permission.HR_MANAGE_PERFORMANCE)
  @UsePipes(new ZodValidationPipe(trainingSchema))
  addTraining(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: TrainingDto,
  ) {
    return this.hrService.addTraining(id, dto);
  }

  @Post('employees/:id/skill')
  @ApiOperation({ summary: 'Add skill to employee profile' })
  @RequirePermissions(Permission.HR_MANAGE_PERFORMANCE)
  @UsePipes(new ZodValidationPipe(skillSchema))
  addSkill(@Param('id', ParseUUIDPipe) id: string, @Body() dto: SkillDto) {
    return this.hrService.addSkill(id, dto);
  }

  @Post('departments')
  @ApiOperation({ summary: 'Create a new department' })
  @RequirePermissions(Permission.HR_MANAGE_DEPARTMENTS)
  @UsePipes(new ZodValidationPipe(createDepartmentSchema))
  createDepartment(@Body() dto: CreateDepartmentSchemaDto) {
    return this.hrService.createDepartment(dto);
  }

  @Patch('departments/:id')
  @ApiOperation({ summary: 'Update department details' })
  @RequirePermissions(Permission.HR_MANAGE_DEPARTMENTS)
  @UsePipes(new ZodValidationPipe(updateDepartmentSchema))
  updateDepartment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDepartmentSchemaDto,
  ) {
    return this.hrService.updateDepartment(id, dto);
  }

  @Get('employees/:id/history')
  @ApiOperation({ summary: 'Get employee career history' })
  @RequirePermissions(Permission.HR_VIEW_HISTORY)
  getEmployeeHistory(@Param('id', ParseUUIDPipe) id: string) {
    return this.hrService.getEmployeeHistory(id);
  }

  @Get('employees/:id/salary-history')
  @ApiOperation({ summary: 'Get employee salary history' })
  @RequirePermissions(Permission.HR_VIEW_HISTORY)
  getSalaryHistory(@Param('id', ParseUUIDPipe) id: string) {
    return this.hrService.getSalaryHistory(id);
  }

  @Get('trainings/:id/certificate')
  @ApiOperation({ summary: 'Download training certificate' })
  @RequirePermissions(Permission.HR_MANAGE_TRAINING)
  async getTrainingCertificate(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ) {
    const buffer = await this.hrService.getTrainingCertificate(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=certificate-${id}.pdf`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }

  @Delete('employees/:id')
  @ApiOperation({ summary: 'Delete employee record' })
  @RequirePermissions(Permission.HR_DELETE_EMPLOYEE)
  @HttpCode(HttpStatus.NO_CONTENT)
  removeEmployee(@Param('id', ParseUUIDPipe) id: string) {
    return this.hrService.removeEmployee(id);
  }

  @Get('org-chart')
  @ApiOperation({ summary: 'Get organizational chart' })
  @RequirePermissions(Permission.HR_VIEW_EMPLOYEES)
  getOrgChart() {
    return this.hrService.getOrgChart();
  }

  @Post('salary-revisions')
  @ApiOperation({ summary: 'Propose a salary revision' })
  @RequirePermissions(Permission.HR_UPDATE_EMPLOYEE)
  createSalaryRevision(@Body() dto: CreateSalaryRevisionDto) {
    return this.hrService.createSalaryRevision(dto);
  }

  @Get('salary-revisions')
  @ApiOperation({ summary: 'Get all salary revisions' })
  @RequirePermissions(Permission.HR_VIEW_HISTORY)
  findAllSalaryRevisions() {
    return this.hrService.findAllSalaryRevisions();
  }

  @Patch('salary-revisions/:id/status')
  @ApiOperation({ summary: 'Update salary revision status (approve/reject)' })
  @RequirePermissions(Permission.HR_UPDATE_EMPLOYEE)
  updateSalaryRevisionStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSalaryRevisionStatusDto,
  ) {
    return this.hrService.updateSalaryRevisionStatus(id, dto);
  }

  @Post('employees/:id/probation/extend')
  @ApiOperation({ summary: 'Extend employee probation period' })
  @RequirePermissions(Permission.HR_UPDATE_EMPLOYEE)
  extendProbation(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('newEndDate') newEndDate: string,
    @Body('comments') comments: string,
  ) {
    return this.hrService.extendProbation(id, newEndDate, comments);
  }

  @Post('employees/:id/probation/complete')
  @ApiOperation({ summary: 'Confirm employee after probation' })
  @RequirePermissions(Permission.HR_UPDATE_EMPLOYEE)
  completeProbation(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('comments') comments: string,
  ) {
    return this.hrService.completeProbation(id, comments);
  }

  @Post('employees/:id/rehire')
  @ApiOperation({ summary: 'Rehire a former employee' })
  @RequirePermissions(Permission.HR_CREATE_EMPLOYEE)
  rehireEmployee(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Partial<CreateEmployeeDto>,
  ) {
    return this.hrService.rehireEmployee(id, dto);
  }

  @Post('transfers')
  @ApiOperation({ summary: 'Request employee transfer' })
  @RequirePermissions(Permission.HR_UPDATE_EMPLOYEE)
  createTransferRequest(@Body() dto: CreateTransferRequestDto) {
    return this.hrService.createTransferRequest(dto);
  }

  @Get('transfers')
  @ApiOperation({ summary: 'Get all transfer requests' })
  @RequirePermissions(Permission.HR_VIEW_HISTORY)
  findAllTransferRequests() {
    return this.hrService.findAllTransferRequests();
  }

  @Patch('transfers/:id/status')
  @ApiOperation({ summary: 'Update transfer request status' })
  @RequirePermissions(Permission.HR_UPDATE_EMPLOYEE)
  updateTransferStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTransferStatusDto,
  ) {
    return this.hrService.updateTransferRequestStatus(id, dto);
  }

  @Post('employees/:id/profile-change')
  @ApiOperation({ summary: 'Create a profile change request' })
  createProfileChangeRequest(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() changes: Record<string, any>,
  ) {
    return this.hrService.createProfileChangeRequest(id, changes);
  }

  @Get('profile-changes')
  @ApiOperation({ summary: 'List all profile change requests' })
  @RequirePermissions(Permission.HR_UPDATE_EMPLOYEE)
  findAllProfileChangeRequests() {
    return this.hrService.findAllProfileChangeRequests();
  }

  @Patch('profile-changes/:id/status')
  @ApiOperation({ summary: 'Update profile change request status' })
  @RequirePermissions(Permission.HR_UPDATE_EMPLOYEE)
  updateProfileChangeRequestStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: { status: ProfileChangeStatus; rejectionReason?: string },
  ) {
    return this.hrService.updateProfileChangeRequestStatus(id, dto);
  }

  @Post('employees/:id/resignation')
  @ApiOperation({ summary: 'Create a resignation request' })
  createResignation(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Record<string, any>,
  ) {
    return this.hrService.createResignation(id, dto);
  }

  @Patch('resignations/:id/status')
  @ApiOperation({ summary: 'Update resignation status' })
  @RequirePermissions(Permission.HR_UPDATE_EMPLOYEE)
  updateResignationStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body()
    dto: {
      status: ResignationStatus;
      approvedLastWorkingDay?: string;
      adminComments?: string;
    },
  ) {
    return this.hrService.updateResignationStatus(id, dto);
  }

  @Post('terminations')
  @ApiOperation({ summary: 'Create a termination record' })
  @RequirePermissions(Permission.HR_UPDATE_EMPLOYEE)
  createTermination(@Body() dto: Record<string, any>) {
    return this.hrService.createTermination(dto);
  }

  @Get('employees/:id/clearance')
  @ApiOperation({ summary: 'Get employee clearance checklist' })
  getClearanceChecklist(@Param('id', ParseUUIDPipe) id: string) {
    return this.hrService.getClearanceChecklist(id);
  }

  @Patch('clearance/:id')
  @ApiOperation({ summary: 'Update clearance item status' })
  @RequirePermissions(Permission.HR_UPDATE_EMPLOYEE)
  updateClearanceItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('isCleared') isCleared: boolean,
    @Body('remarks') remarks?: string,
  ) {
    return this.hrService.updateClearanceItem(id, isCleared, remarks);
  }

  @Post('employees/:id/exit-interview')
  @ApiOperation({ summary: 'Submit exit interview responses' })
  submitExitInterview(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() responses: Record<string, any>,
  ) {
    return this.hrService.submitExitInterview(id, responses);
  }

  @Post('okr-checkins')
  @ApiOperation({ summary: 'Create an OKR check-in' })
  createOKRCheckIn(@Body() dto: Record<string, any>) {
    return this.hrService.createOKRCheckIn(dto);
  }

  @Get('performance-reviews/:id/progress')
  @ApiOperation({ summary: 'Get OKR progress summary' })
  getOKRProgress(@Param('id', ParseUUIDPipe) id: string) {
    return this.hrService.calculateOKRProgress(id);
  }

  @Post('training-courses')
  @ApiOperation({ summary: 'Create a new training course' })
  @RequirePermissions(Permission.HR_UPDATE_EMPLOYEE)
  createTrainingCourse(@Body() dto: Record<string, any>) {
    return this.hrService.createTrainingCourse(dto);
  }

  @Get('training-courses')
  @ApiOperation({ summary: 'Get all training courses' })
  findAllTrainingCourses() {
    return this.hrService.findAllTrainingCourses();
  }

  @Post('employees/:id/enroll')
  @ApiOperation({ summary: 'Enroll employee in a training course' })
  enrollEmployee(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('courseId') courseId: string,
  ) {
    return this.hrService.enrollEmployeeInTraining(id, courseId);
  }

  @Patch('trainings/:id/status')
  @ApiOperation({ summary: 'Update employee training status' })
  updateTrainingStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: TrainingStatus,
    @Body('certificateUrl') certificateUrl?: string,
  ) {
    return this.hrService.updateTrainingStatus(id, status, certificateUrl);
  }

  @Post('skill-catalog')
  @ApiOperation({ summary: 'Add a new skill to the catalog' })
  @RequirePermissions(Permission.HR_UPDATE_EMPLOYEE)
  createSkillInCatalog(@Body() dto: Record<string, any>) {
    return this.hrService.createSkillInCatalog(dto);
  }

  @Get('skill-catalog')
  @ApiOperation({ summary: 'Get all skills in the catalog' })
  findAllSkillsInCatalog() {
    return this.hrService.findAllSkillsInCatalog();
  }

  @Post('employees/:id/skills')
  @ApiOperation({ summary: 'Add skill to employee profile from catalog' })
  addSkillToEmployee(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('catalogId') catalogId: string,
    @Body('proficiency') proficiency: number,
  ) {
    return this.hrService.addSkillToEmployee(id, catalogId, proficiency);
  }

  @Post('review-feedback')
  @ApiOperation({ summary: 'Submit performance review feedback' })
  submitReviewFeedback(@Body() dto: Record<string, any>) {
    return this.hrService.submitReviewFeedback(dto);
  }

  @Get('performance-reviews/:id/summary')
  @ApiOperation({ summary: 'Get performance review feedback summary' })
  getReviewFeedbackSummary(@Param('id', ParseUUIDPipe) id: string) {
    return this.hrService.getReviewFeedbackSummary(id);
  }

  @Post('pip-actions')
  @ApiOperation({ summary: 'Create a PIP action plan item' })
  @RequirePermissions(Permission.HR_UPDATE_EMPLOYEE)
  createPIPAction(@Body() dto: Record<string, any>) {
    return this.hrService.createPIPActionPlan(dto);
  }

  @Get('performance-reviews/:id/pip-actions')
  @ApiOperation({ summary: 'Get PIP action plan items for a review' })
  getPIPActions(@Param('id', ParseUUIDPipe) id: string) {
    return this.hrService.getPIPActionPlans(id);
  }

  @Get('performance-reviews/:id/pip-letter')
  @ApiOperation({ summary: 'Download PIP notification letter' })
  async downloadPIPLetter(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ) {
    const buffer = await this.hrService.generatePIPLetter(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=pip-letter.pdf',
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }

  @Get('trainings/:id/certificate')
  @ApiOperation({ summary: 'Download training certificate (v2)' })
  async downloadCertificate(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ) {
    const buffer = await this.hrService.generateTrainingCertificate(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=certificate.pdf',
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }

  @Patch('pip-actions/:id')
  @ApiOperation({ summary: 'Update PIP action plan item status' })
  @RequirePermissions(Permission.HR_UPDATE_EMPLOYEE)
  updatePIPAction(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('isAchieved') isAchieved: boolean,
    @Body('notes') notes?: string,
  ) {
    return this.hrService.updatePIPActionPlanStatus(id, isAchieved, notes);
  }

  @Post('enps-surveys')
  @ApiOperation({ summary: 'Create a new eNPS survey' })
  @RequirePermissions(Permission.HR_UPDATE_EMPLOYEE)
  createENPSSurvey(@Body() dto: Record<string, any>) {
    return this.hrService.createENPSSurvey(dto);
  }

  @Get('enps-surveys')
  @ApiOperation({ summary: 'Get all eNPS surveys' })
  findAllENPSSurveys() {
    return this.hrService.findAllENPSSurveys();
  }

  @Post('enps-responses')
  @ApiOperation({ summary: 'Submit eNPS survey response' })
  submitENPSResponse(@Body() dto: Record<string, any>) {
    return this.hrService.submitENPSResponse(dto);
  }

  @Get('enps-surveys/:id/analytics')
  @ApiOperation({ summary: 'Get eNPS survey analytics' })
  getENPSAnalytics(@Param('id', ParseUUIDPipe) id: string) {
    return this.hrService.getENPSAnalytics(id);
  }

  @Post('handbooks')
  @ApiOperation({ summary: 'Create a new employee handbook' })
  @RequirePermissions(Permission.HR_UPDATE_EMPLOYEE)
  createHandbook(@Body() dto: Record<string, any>) {
    return this.hrService.createHandbook(dto);
  }

  @Get('handbooks')
  @ApiOperation({ summary: 'Get all employee handbooks' })
  findAllHandbooks() {
    return this.hrService.findAllHandbooks();
  }

  @Post('employees/:id/handbook-ack')
  @ApiOperation({ summary: 'Acknowledge employee handbook receipt' })
  acknowledgeHandbook(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('handbookId') handbookId: string,
    @Req() req: any,
  ) {
    return this.hrService.acknowledgeHandbook(id, handbookId, {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }

  @Post('succession-plans')
  @ApiOperation({ summary: 'Create a succession plan' })
  @RequirePermissions(Permission.HR_UPDATE_EMPLOYEE)
  createSuccessionPlan(@Body() dto: Record<string, any>) {
    return this.hrService.createSuccessionPlan(dto);
  }

  @Get('designations/:id/succession')
  @ApiOperation({ summary: 'Get succession plans for a designation' })
  getSuccessionPlansByDesignation(@Param('id', ParseUUIDPipe) id: string) {
    return this.hrService.getSuccessionPlansByDesignation(id);
  }

  @Get('employees/:id/successor-roles')
  @ApiOperation({ summary: 'Get potential successor roles for an employee' })
  getSuccessionPlansByEmployee(@Param('id', ParseUUIDPipe) id: string) {
    return this.hrService.getSuccessionPlansByEmployee(id);
  }

  @Get('departments')
  @ApiOperation({ summary: 'Get all departments' })
  @RequirePermissions(Permission.HR_VIEW_DEPARTMENTS)
  findAllDepartments() {
    return this.hrService.findAllDepartments();
  }

  @Get('departments/:id')
  @ApiOperation({ summary: 'Get department by ID' })
  @RequirePermissions(Permission.HR_VIEW_DEPARTMENTS)
  findDepartment(@Param('id', ParseUUIDPipe) id: string) {
    return this.hrService.findDepartmentById(id);
  }

  @Delete('departments/:id')
  @ApiOperation({ summary: 'Delete a department' })
  @RequirePermissions(Permission.HR_MANAGE_DEPARTMENTS)
  @HttpCode(HttpStatus.NO_CONTENT)
  removeDepartment(@Param('id', ParseUUIDPipe) id: string) {
    return this.hrService.removeDepartment(id);
  }

  @Post('designations')
  @ApiOperation({ summary: 'Create a new job designation' })
  createDesignation(@Body() dto: CreateDesignationDto) {
    return this.hrService.createDesignation(dto);
  }

  @Get('designations')
  @ApiOperation({ summary: 'Get all job designations' })
  findAllDesignations() {
    return this.hrService.findAllDesignations();
  }

  @Get('designations/:id')
  @ApiOperation({ summary: 'Get job designation by ID' })
  findDesignation(@Param('id', ParseUUIDPipe) id: string) {
    return this.hrService.findDesignationById(id);
  }

  @Patch('designations/:id')
  @ApiOperation({ summary: 'Update job designation details' })
  updateDesignation(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDesignationDto,
  ) {
    return this.hrService.updateDesignation(id, dto);
  }

  @Delete('designations/:id')
  @ApiOperation({ summary: 'Delete a job designation' })
  @HttpCode(HttpStatus.NO_CONTENT)
  removeDesignation(@Param('id', ParseUUIDPipe) id: string) {
    return this.hrService.removeDesignation(id);
  }

  /**
   * GRADES CRUD
   */

  @Post('grades')
  @ApiOperation({ summary: 'Create a new employee grade' })
  @RequirePermissions(Permission.HR_UPDATE_EMPLOYEE)
  createGrade(@Body() dto: CreateGradeDto) {
    return this.hrService.createGrade(dto);
  }

  @Get('grades')
  @ApiOperation({ summary: 'Get all employee grades' })
  @RequirePermissions(Permission.HR_VIEW_EMPLOYEES)
  findAllGrades() {
    return this.hrService.findAllGrades();
  }

  @Get('grades/:id')
  @ApiOperation({ summary: 'Get employee grade by ID' })
  @RequirePermissions(Permission.HR_VIEW_EMPLOYEES)
  findGrade(@Param('id', ParseUUIDPipe) id: string) {
    return this.hrService.findGradeById(id);
  }

  @Patch('grades/:id')
  @ApiOperation({ summary: 'Update employee grade details' })
  @RequirePermissions(Permission.HR_UPDATE_EMPLOYEE)
  updateGrade(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateGradeDto,
  ) {
    return this.hrService.updateGrade(id, dto);
  }

  @Delete('grades/:id')
  @ApiOperation({ summary: 'Delete an employee grade' })
  @RequirePermissions(Permission.HR_UPDATE_EMPLOYEE)
  @HttpCode(HttpStatus.NO_CONTENT)
  removeGrade(@Param('id', ParseUUIDPipe) id: string) {
    return this.hrService.removeGrade(id);
  }
}
