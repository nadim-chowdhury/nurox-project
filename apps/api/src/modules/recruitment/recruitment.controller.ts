import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { RecruitmentService } from './recruitment.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Recruitment')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('recruitment')
export class RecruitmentController {
  constructor(private readonly recruitmentService: RecruitmentService) {}

  // Job Requisitions
  @Get('jobs')
  @ApiOperation({ summary: 'List all job requisitions' })
  findAllJobs() {
    return this.recruitmentService.findAllJobs();
  }

  @Post('jobs')
  @ApiOperation({ summary: 'Create a new job requisition' })
  createJob(@Body() data: any) {
    return this.recruitmentService.createJob(data);
  }

  @Put('jobs/:id/submit')
  @ApiOperation({ summary: 'Submit job for approval' })
  submitForApproval(
    @Param('id') id: string,
    @Body('approverIds') approverIds: string[],
  ) {
    return this.recruitmentService.submitForApproval(id, approverIds);
  }

  @Put('jobs/:id/approve')
  @ApiOperation({ summary: 'Approve a job step' })
  approveJobStep(
    @Param('id') id: string,
    @Body('userId') userId: string,
    @Body('comment') comment?: string,
  ) {
    return this.recruitmentService.approveJobStep(id, userId, comment);
  }

  @Put('jobs/:id/reject')
  @ApiOperation({ summary: 'Reject a job step' })
  rejectJobStep(
    @Param('id') id: string,
    @Body('userId') userId: string,
    @Body('comment') comment: string,
  ) {
    return this.recruitmentService.rejectJobStep(id, userId, comment);
  }

  @Put('jobs/:id/open')
  @ApiOperation({ summary: 'Open an approved job' })
  openJob(@Param('id') id: string) {
    return this.recruitmentService.openJob(id);
  }

  // Applications
  @Get('applications')
  @ApiOperation({ summary: 'List all applications' })
  findAllApplications() {
    return this.recruitmentService.findAllApplications();
  }

  @Post('applications')
  @ApiOperation({ summary: 'Create a new application' })
  createApplication(@Body() data: any) {
    return this.recruitmentService.createApplication(data);
  }

  @Get('applications/:id')
  @ApiOperation({ summary: 'Get application details' })
  findApplicationById(@Param('id') id: string) {
    return this.recruitmentService.findApplicationById(id);
  }

  @Put('applications/:id/status')
  @ApiOperation({ summary: 'Update application status' })
  updateApplicationStatus(
    @Param('id') id: string,
    @Body('status') status: any,
  ) {
    return this.recruitmentService.updateApplicationStatus(id, status);
  }

  // Candidates
  @Get('candidates')
  @ApiOperation({ summary: 'List all candidates' })
  findAllCandidates() {
    return this.recruitmentService.findAllCandidates();
  }

  @Post('candidates')
  @ApiOperation({ summary: 'Create a new candidate' })
  createCandidate(@Body() data: any) {
    return this.recruitmentService.createCandidate(data);
  }

  @Get('candidates/:id')
  @ApiOperation({ summary: 'Get candidate details' })
  findCandidateById(@Param('id') id: string) {
    return this.recruitmentService.findCandidateById(id);
  }

  @Put('candidates/:id')
  @ApiOperation({ summary: 'Update candidate details' })
  updateCandidate(@Param('id') id: string, @Body() data: any) {
    return this.recruitmentService.updateCandidate(id, data);
  }

  @Post('candidates/:id/resume-url')
  @ApiOperation({ summary: 'Get presigned URL for resume upload' })
  getResumeUploadUrl(
    @Param('id') candidateId: string,
    @Body('fileName') fileName: string,
    @Body('contentType') contentType: string,
  ) {
    return this.recruitmentService.getResumeUploadUrl(
      candidateId,
      fileName,
      contentType,
    );
  }

  // Interviews
  @Get('interviews')
  @ApiOperation({ summary: 'List all interviews' })
  findAllInterviews() {
    return this.recruitmentService.findAllInterviews();
  }

  @Post('interviews')
  @ApiOperation({ summary: 'Schedule an interview' })
  scheduleInterview(@Body() data: any) {
    return this.recruitmentService.scheduleInterview(data);
  }

  @Put('interviews/:id/feedback')
  @ApiOperation({ summary: 'Submit interview feedback' })
  updateInterviewFeedback(
    @Param('id') id: string,
    @Body('feedback') feedback: string,
    @Body('rating') rating: number,
  ) {
    return this.recruitmentService.updateInterviewFeedback(
      id,
      feedback,
      rating,
    );
  }

  // Offer Letters
  @Post('offers')
  @ApiOperation({ summary: 'Create an offer letter' })
  createOfferLetter(@Body() data: any) {
    return this.recruitmentService.createOfferLetter(data);
  }

  @Post('offers/:id/generate-pdf')
  @ApiOperation({ summary: 'Generate offer letter PDF' })
  generateOfferPdf(@Param('id') id: string) {
    return this.recruitmentService.generateOfferPdf(id);
  }

  @Post('offers/:id/sign')
  @ApiOperation({ summary: 'Sign an offer letter' })
  signOfferLetter(
    @Param('id') id: string,
    @Body('signature') signature: string,
  ) {
    return this.recruitmentService.signOfferLetter(id, signature);
  }

  // Onboarding
  @Post('onboarding')
  @ApiOperation({ summary: 'Create onboarding checklist' })
  createOnboardingChecklist(@Body('candidateId') candidateId: string) {
    return this.recruitmentService.createOnboardingChecklist(candidateId);
  }

  @Put('onboarding/:id/tasks')
  @ApiOperation({ summary: 'Update onboarding task status' })
  updateOnboardingTask(
    @Param('id') id: string,
    @Body('taskTitle') taskTitle: string,
    @Body('isCompleted') isCompleted: boolean,
  ) {
    return this.recruitmentService.updateOnboardingTask(
      id,
      taskTitle,
      isCompleted,
    );
  }

  @Get('onboarding/candidate/:candidateId')
  @ApiOperation({ summary: 'Get onboarding checklist by candidate ID' })
  findOnboardingByCandidate(@Param('candidateId') candidateId: string) {
    return this.recruitmentService.findOnboardingByCandidate(candidateId);
  }
}
