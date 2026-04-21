import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { RecruitmentService } from './recruitment.service';

@Controller('recruitment')
export class RecruitmentController {
  constructor(private readonly recruitmentService: RecruitmentService) {}

  @Get('jobs')
  findAllJobs() {
    return this.recruitmentService.findAllJobs();
  }

  @Post('jobs')
  createJob(@Body() data: any) {
    return this.recruitmentService.createJob(data);
  }

  @Put('jobs/:id/submit')
  submitForApproval(@Param('id') id: string) {
    return this.recruitmentService.submitForApproval(id);
  }

  @Put('jobs/:id/approve')
  approveJob(@Param('id') id: string, @Body('comment') comment: string) {
    // In a real app, we'd get userId from the request
    const userId = 'system'; 
    return this.recruitmentService.approveJob(id, userId, comment);
  }

  @Put('jobs/:id/open')
  openJob(@Param('id') id: string) {
    return this.recruitmentService.openJob(id);
  }

  @Get('applications')
  findAllApplications() {
    return this.recruitmentService.findAllApplications();
  }

  @Get('applications/:id')
  findApplicationById(@Param('id') id: string) {
    return this.recruitmentService.findApplicationById(id);
  }

  @Put('applications/:id/status')
  updateApplicationStatus(@Param('id') id: string, @Body('status') status: any) {
    return this.recruitmentService.updateApplicationStatus(id, status);
  }

  @Post('applications')
  createApplication(@Body() data: any) {
    return this.recruitmentService.createApplication(data);
  }

  @Get('candidates')
  findAllCandidates() {
    return this.recruitmentService.findAllCandidates();
  }

  @Post('candidates')
  createCandidate(@Body() data: any) {
    return this.recruitmentService.createCandidate(data);
  }

  @Get('candidates/:id')
  findCandidateById(@Param('id') id: string) {
    return this.recruitmentService.findCandidateById(id);
  }

  @Put('candidates/:id')
  updateCandidate(@Param('id') id: string, @Body() data: any) {
    return this.recruitmentService.updateCandidate(id, data);
  }

  @Post('candidates/:id/resume-url')
  getResumeUploadUrl(
    @Param('id') candidateId: string,
    @Body('fileName') fileName: string,
    @Body('contentType') contentType: string,
  ) {
    return this.recruitmentService.getResumeUploadUrl(candidateId, fileName, contentType);
  }

  @Get('interviews')
  findAllInterviews() {
    return this.recruitmentService.findAllInterviews();
  }

  @Post('interviews')
  scheduleInterview(@Body() data: any) {
    return this.recruitmentService.scheduleInterview(data);
  }

  @Put('interviews/:id/feedback')
  updateInterviewFeedback(
    @Param('id') id: string,
    @Body('feedback') feedback: string,
    @Body('rating') rating: number,
  ) {
    return this.recruitmentService.updateInterviewFeedback(id, feedback, rating);
  }

  @Post('offers')
  createOfferLetter(@Body() data: any) {
    return this.recruitmentService.createOfferLetter(data);
  }

  @Post('offers/:id/generate-pdf')
  generateOfferPdf(@Param('id') id: string) {
    return this.recruitmentService.generateOfferPdf(id);
  }

  @Post('onboarding')
  createOnboardingChecklist(@Body('candidateId') candidateId: string) {
    return this.recruitmentService.createOnboardingChecklist(candidateId);
  }

  @Put('onboarding/:id/tasks')
  updateOnboardingTask(
    @Param('id') id: string,
    @Body('taskTitle') taskTitle: string,
    @Body('isCompleted') isCompleted: boolean,
  ) {
    return this.recruitmentService.updateOnboardingTask(id, taskTitle, isCompleted);
  }

  @Get('onboarding/candidate/:candidateId')
  findOnboardingByCandidate(@Param('candidateId') candidateId: string) {
    return this.recruitmentService.findOnboardingByCandidate(candidateId);
  }
}
