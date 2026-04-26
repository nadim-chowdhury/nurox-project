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
} from '@nestjs/common';
import { Response } from 'express';
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
} from '@repo/shared-schemas';
import { SalaryChangeReason } from './entities/salary-history.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { Permission } from '../auth/enums/permissions.enum';
import { QueryEmployeeDto } from './dto/query-employee.dto';
import { CreateDesignationDto } from './dto/create-designation.dto';
import { UpdateDesignationDto } from './dto/update-designation.dto';
import {
  CreateSalaryRevisionDto,
  UpdateSalaryRevisionStatusDto,
} from './dto/salary-revision.dto';
import {
  CreateTransferRequestDto,
  UpdateTransferStatusDto,
} from './dto/transfer-request.dto';
import { CheckModule } from '../../common/guards/module.guard';

@Controller('hr')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@CheckModule('hr')
export class HrController {
  constructor(private readonly hrService: HrService) {}

  @Post('employees')
  @RequirePermissions(Permission.HR_CREATE_EMPLOYEE)
  createEmployee(@Body() dto: CreateEmployeeDto) {
    return this.hrService.createEmployee(dto);
  }

  @Get('employees')
  @RequirePermissions(Permission.HR_VIEW_EMPLOYEES)
  findAllEmployees(@Query() query: QueryEmployeeDto) {
    return this.hrService.findAllEmployees(query);
  }

  @Get('employees/:id')
  findEmployee(@Param('id', ParseUUIDPipe) id: string) {
    return this.hrService.findEmployeeById(id);
  }

  @Patch('employees/:id')
  @RequirePermissions(Permission.HR_UPDATE_EMPLOYEE)
  updateEmployee(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Partial<CreateEmployeeDto>,
  ) {
    return this.hrService.updateEmployee(id, dto);
  }

  @Post('employees/:id/transfer')
  @RequirePermissions(Permission.HR_UPDATE_EMPLOYEE)
  transferEmployee(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: TransferEmployeeDto,
  ) {
    return this.hrService.transferEmployee(id, dto);
  }

  @Post('employees/:id/terminate')
  @RequirePermissions(Permission.HR_UPDATE_EMPLOYEE)
  terminateEmployee(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: TerminationDto,
  ) {
    return this.hrService.terminateEmployee(id, dto);
  }

  @Post('employees/:id/360-review')
  @RequirePermissions(Permission.HR_MANAGE_PERFORMANCE)
  submit360Review(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ThreeSixtyReviewDto,
  ) {
    return this.hrService.submit360Review(id, dto);
  }

  @Post('employees/:id/pip')
  @RequirePermissions(Permission.HR_MANAGE_PERFORMANCE)
  initiatePIP(@Param('id', ParseUUIDPipe) id: string, @Body() dto: PipDto) {
    return this.hrService.initiatePIP(id, dto);
  }

  @Get('trainings')
  @RequirePermissions(Permission.HR_VIEW_EMPLOYEES)
  findAllTrainings() {
    return this.hrService.findAllTrainings();
  }

  @Get('skill-matrix')
  @RequirePermissions(Permission.HR_VIEW_EMPLOYEES)
  getSkillMatrix() {
    return this.hrService.getSkillMatrix();
  }

  @Patch('employees/:id/salary')
  @RequirePermissions(Permission.HR_UPDATE_EMPLOYEE)
  updateSalary(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('newSalary') newSalary: number,
    @Body('reason') reason: SalaryChangeReason,
    @Body('comments') comments?: string,
  ) {
    return this.hrService.updateSalary(id, newSalary, reason, comments);
  }

  @Post('employees/:id/okr')
  @RequirePermissions(Permission.HR_MANAGE_PERFORMANCE)
  addOKR(@Param('id', ParseUUIDPipe) id: string, @Body() dto: OkrDto) {
    return this.hrService.addOKR(id, dto);
  }

  @Post('employees/:id/training')
  @RequirePermissions(Permission.HR_MANAGE_TRAINING)
  addTraining(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: TrainingDto,
  ) {
    return this.hrService.addTraining(id, dto);
  }

  @Post('employees/:id/skill')
  @RequirePermissions(Permission.HR_MANAGE_SKILLS)
  addSkill(@Param('id', ParseUUIDPipe) id: string, @Body() dto: SkillDto) {
    return this.hrService.addSkill(id, dto);
  }

  @Get('employees/:id/history')
  @RequirePermissions(Permission.HR_VIEW_HISTORY)
  getEmployeeHistory(@Param('id', ParseUUIDPipe) id: string) {
    return this.hrService.getEmployeeHistory(id);
  }

  @Get('employees/:id/salary-history')
  @RequirePermissions(Permission.HR_VIEW_HISTORY)
  getSalaryHistory(@Param('id', ParseUUIDPipe) id: string) {
    return this.hrService.getSalaryHistory(id);
  }

  @Get('trainings/:id/certificate')
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
  @RequirePermissions(Permission.HR_DELETE_EMPLOYEE)
  @HttpCode(HttpStatus.NO_CONTENT)
  removeEmployee(@Param('id', ParseUUIDPipe) id: string) {
    return this.hrService.removeEmployee(id);
  }

  @Get('org-chart')
  @RequirePermissions(Permission.HR_VIEW_EMPLOYEES)
  getOrgChart() {
    return this.hrService.getOrgChart();
  }

  @Post('salary-revisions')
  @RequirePermissions(Permission.HR_UPDATE_EMPLOYEE)
  createSalaryRevision(@Body() dto: CreateSalaryRevisionDto) {
    return this.hrService.createSalaryRevision(dto);
  }

  @Get('salary-revisions')
  @RequirePermissions(Permission.HR_VIEW_HISTORY)
  findAllSalaryRevisions() {
    return this.hrService.findAllSalaryRevisions();
  }

  @Patch('salary-revisions/:id/status')
  @RequirePermissions(Permission.HR_UPDATE_EMPLOYEE)
  updateSalaryRevisionStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSalaryRevisionStatusDto,
  ) {
    return this.hrService.updateSalaryRevisionStatus(id, dto);
  }

  @Post('employees/:id/probation/extend')
  @RequirePermissions(Permission.HR_UPDATE_EMPLOYEE)
  extendProbation(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('newEndDate') newEndDate: string,
    @Body('comments') comments: string,
  ) {
    return this.hrService.extendProbation(id, newEndDate, comments);
  }

  @Post('employees/:id/probation/complete')
  @RequirePermissions(Permission.HR_UPDATE_EMPLOYEE)
  completeProbation(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('comments') comments: string,
  ) {
    return this.hrService.completeProbation(id, comments);
  }

  @Post('transfers')
  @RequirePermissions(Permission.HR_UPDATE_EMPLOYEE)
  createTransferRequest(@Body() dto: CreateTransferRequestDto) {
    return this.hrService.createTransferRequest(dto);
  }

  @Get('transfers')
  @RequirePermissions(Permission.HR_VIEW_HISTORY)
  findAllTransferRequests() {
    return this.hrService.findAllTransferRequests();
  }

  @Patch('transfers/:id/status')
  @RequirePermissions(Permission.HR_UPDATE_EMPLOYEE)
  updateTransferStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTransferStatusDto,
  ) {
    return this.hrService.updateTransferRequestStatus(id, dto);
  }

  @Post('employees/:id/profile-change')
  createProfileChangeRequest(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() changes: any,
  ) {
    return this.hrService.createProfileChangeRequest(id, changes);
  }

  @Get('profile-changes')
  @RequirePermissions(Permission.HR_UPDATE_EMPLOYEE)
  findAllProfileChangeRequests() {
    return this.hrService.findAllProfileChangeRequests();
  }

  @Patch('profile-changes/:id/status')
  @RequirePermissions(Permission.HR_UPDATE_EMPLOYEE)
  updateProfileChangeRequestStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: { status: ProfileChangeStatus; rejectionReason?: string },
  ) {
    return this.hrService.updateProfileChangeRequestStatus(id, dto);
  }

  @Post('employees/:id/resignation')
  createResignation(@Param('id', ParseUUIDPipe) id: string, @Body() dto: any) {
    return this.hrService.createResignation(id, dto);
  }

  @Patch('resignations/:id/status')
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
  @RequirePermissions(Permission.HR_UPDATE_EMPLOYEE)
  createTermination(@Body() dto: any) {
    return this.hrService.createTermination(dto);
  }

  @Get('employees/:id/clearance')
  getClearanceChecklist(@Param('id', ParseUUIDPipe) id: string) {
    return this.hrService.getClearanceChecklist(id);
  }

  @Patch('clearance/:id')
  @RequirePermissions(Permission.HR_UPDATE_EMPLOYEE)
  updateClearanceItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('isCleared') isCleared: boolean,
    @Body('remarks') remarks?: string,
  ) {
    return this.hrService.updateClearanceItem(id, isCleared, remarks);
  }

  @Post('employees/:id/exit-interview')
  submitExitInterview(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() responses: any,
  ) {
    return this.hrService.submitExitInterview(id, responses);
  }

  @Post('okr-checkins')
  createOKRCheckIn(@Body() dto: any) {
    return this.hrService.createOKRCheckIn(dto);
  }

  @Get('performance-reviews/:id/progress')
  getOKRProgress(@Param('id', ParseUUIDPipe) id: string) {
    return this.hrService.calculateOKRProgress(id);
  }

  @Post('training-courses')
  @RequirePermissions(Permission.HR_UPDATE_EMPLOYEE)
  createTrainingCourse(@Body() dto: any) {
    return this.hrService.createTrainingCourse(dto);
  }

  @Get('training-courses')
  findAllTrainingCourses() {
    return this.hrService.findAllTrainingCourses();
  }

  @Post('employees/:id/enroll')
  enrollEmployee(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('courseId') courseId: string,
  ) {
    return this.hrService.enrollEmployeeInTraining(id, courseId);
  }

  @Patch('trainings/:id/status')
  updateTrainingStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: TrainingStatus,
    @Body('certificateUrl') certificateUrl?: string,
  ) {
    return this.hrService.updateTrainingStatus(id, status, certificateUrl);
  }

  @Post('skill-catalog')
  @RequirePermissions(Permission.HR_UPDATE_EMPLOYEE)
  createSkillInCatalog(@Body() dto: any) {
    return this.hrService.createSkillInCatalog(dto);
  }

  @Get('skill-catalog')
  findAllSkillsInCatalog() {
    return this.hrService.findAllSkillsInCatalog();
  }

  @Post('employees/:id/skills')
  addSkillToEmployee(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('catalogId') catalogId: string,
    @Body('proficiency') proficiency: number,
  ) {
    return this.hrService.addSkillToEmployee(id, catalogId, proficiency);
  }

  @Post('review-feedback')
  submitReviewFeedback(@Body() dto: any) {
    return this.hrService.submitReviewFeedback(dto);
  }

  @Get('performance-reviews/:id/summary')
  getReviewFeedbackSummary(@Param('id', ParseUUIDPipe) id: string) {
    return this.hrService.getReviewFeedbackSummary(id);
  }

  @Post('pip-actions')
  @RequirePermissions(Permission.HR_UPDATE_EMPLOYEE)
  createPIPAction(@Body() dto: any) {
    return this.hrService.createPIPActionPlan(dto);
  }

  @Get('performance-reviews/:id/pip-actions')
  getPIPActions(@Param('id', ParseUUIDPipe) id: string) {
    return this.hrService.getPIPActionPlans(id);
  }

  @Get('performance-reviews/:id/pip-letter')
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
  @RequirePermissions(Permission.HR_UPDATE_EMPLOYEE)
  updatePIPAction(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('isAchieved') isAchieved: boolean,
    @Body('notes') notes?: string,
  ) {
    return this.hrService.updatePIPActionPlanStatus(id, isAchieved, notes);
  }

  @Post('enps-surveys')
  @RequirePermissions(Permission.HR_UPDATE_EMPLOYEE)
  createENPSSurvey(@Body() dto: any) {
    return this.hrService.createENPSSurvey(dto);
  }

  @Get('enps-surveys')
  findAllENPSSurveys() {
    return this.hrService.findAllENPSSurveys();
  }

  @Post('enps-responses')
  submitENPSResponse(@Body() dto: any) {
    return this.hrService.submitENPSResponse(dto);
  }

  @Get('enps-surveys/:id/analytics')
  getENPSAnalytics(@Param('id', ParseUUIDPipe) id: string) {
    return this.hrService.getENPSAnalytics(id);
  }

  @Post('handbooks')
  @RequirePermissions(Permission.HR_UPDATE_EMPLOYEE)
  createHandbook(@Body() dto: any) {
    return this.hrService.createHandbook(dto);
  }

  @Get('handbooks')
  findAllHandbooks() {
    return this.hrService.findAllHandbooks();
  }

  @Post('employees/:id/handbook-ack')
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
  @RequirePermissions(Permission.HR_UPDATE_EMPLOYEE)
  createSuccessionPlan(@Body() dto: any) {
    return this.hrService.createSuccessionPlan(dto);
  }

  @Get('designations/:id/succession')
  getSuccessionPlansByDesignation(@Param('id', ParseUUIDPipe) id: string) {
    return this.hrService.getSuccessionPlansByDesignation(id);
  }

  @Get('employees/:id/successor-roles')
  getSuccessionPlansByEmployee(@Param('id', ParseUUIDPipe) id: string) {
    return this.hrService.getSuccessionPlansByEmployee(id);
  }

  @Post('departments')
  @RequirePermissions(Permission.SYSTEM_ADMIN_ACCESS)
  createDepartment(@Body() dto: CreateDepartmentSchemaDto) {
    const parsed = createDepartmentSchema.parse(dto);
    return this.hrService.createDepartment(parsed);
  }

  @Get('departments')
  @RequirePermissions(Permission.HR_VIEW_DEPARTMENTS)
  findAllDepartments() {
    return this.hrService.findAllDepartments();
  }

  @Get('departments/:id')
  @RequirePermissions(Permission.HR_VIEW_DEPARTMENTS)
  findDepartment(@Param('id', ParseUUIDPipe) id: string) {
    return this.hrService.findDepartmentById(id);
  }

  @Patch('departments/:id')
  @RequirePermissions(Permission.SYSTEM_ADMIN_ACCESS)
  updateDepartment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDepartmentSchemaDto,
  ) {
    const parsed = updateDepartmentSchema.parse(dto);
    return this.hrService.updateDepartment(id, parsed);
  }

  @Delete('departments/:id')
  @RequirePermissions(Permission.SYSTEM_ADMIN_ACCESS)
  @HttpCode(HttpStatus.NO_CONTENT)
  removeDepartment(@Param('id', ParseUUIDPipe) id: string) {
    return this.hrService.removeDepartment(id);
  }

  @Post('designations')
  createDesignation(@Body() dto: CreateDesignationDto) {
    return this.hrService.createDesignation(dto);
  }

  @Get('designations')
  findAllDesignations() {
    return this.hrService.findAllDesignations();
  }

  @Get('designations/:id')
  findDesignation(@Param('id', ParseUUIDPipe) id: string) {
    return this.hrService.findDesignationById(id);
  }

  @Patch('designations/:id')
  updateDesignation(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDesignationDto,
  ) {
    return this.hrService.updateDesignation(id, dto);
  }

  @Delete('designations/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeDesignation(@Param('id', ParseUUIDPipe) id: string) {
    return this.hrService.removeDesignation(id);
  }
}
