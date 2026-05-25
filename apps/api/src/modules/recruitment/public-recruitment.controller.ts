import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { RecruitmentService } from './recruitment.service';
import { Candidate } from './entities/candidate.entity';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import {
  candidateSchema,
  applicationSchema,
  type CandidateDto,
  type ApplicationDto,
} from '@repo/shared-schemas';

@ApiTags('Public Recruitment')
@Controller('public/recruitment')
export class PublicRecruitmentController {
  constructor(private readonly recruitmentService: RecruitmentService) {}

  @Get('jobs')
  @ApiOperation({ summary: 'List all open job requisitions for career portal' })
  findOpenJobs() {
    return this.recruitmentService.findOpenJobs();
  }

  @Get('jobs/:id')
  @ApiOperation({ summary: 'Get open job details' })
  findOpenJobById(@Param('id') id: string) {
    return this.recruitmentService.findOpenJobById(id);
  }

  @Post('resume-url')
  @ApiOperation({ summary: 'Get presigned URL for public resume upload' })
  getPublicResumeUploadUrl(
    @Body('fileName') fileName: string,
    @Body('contentType') contentType: string,
  ) {
    return this.recruitmentService.getPublicResumeUploadUrl(
      fileName,
      contentType,
    );
  }

  @Post('apply')
  @ApiOperation({ summary: 'Submit a job application from career portal' })
  async apply(
    @Body() data: { candidate: CandidateDto; application: ApplicationDto },
  ) {
    const candidateParsed = candidateSchema.parse(data.candidate);
    const applicationParsed = applicationSchema.parse(data.application);

    // 1. Create or update candidate
    // In a real app, we'd check for duplicates here
    const candidate = (await this.recruitmentService.createCandidate(
      candidateParsed,
    )) as Candidate;

    if (!candidate) throw new Error('Failed to create candidate');

    // 2. Create application
    return this.recruitmentService.createApplication({
      ...applicationParsed,
      candidateId: candidate.id,
    });
  }
}
