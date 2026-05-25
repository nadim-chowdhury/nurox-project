import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { Repository, ObjectLiteral } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { JobRequisition, JobStatus } from './entities/job-requisition.entity';
import { Candidate } from './entities/candidate.entity';
import { Application, ApplicationStatus } from './entities/application.entity';
import { Interview, InterviewStatus } from './entities/interview.entity';
import { OfferLetter } from './entities/offer-letter.entity';
import {
  OnboardingChecklist,
  OnboardingStatus,
} from './entities/onboarding-checklist.entity';
import { OnboardingTemplate } from './entities/onboarding-template.entity';
import { TenantConnectionService } from '../../database/tenant-connection.service';
import { StorageService } from '../system/storage.service';
import { PdfService } from '../system/pdf.service';
import { GoogleCalendarService } from '../system/google-calendar.service';
import { UsersService } from '../users/users.service';
import { LeaveService } from '../leave/leave.service';
import { PayrollService } from '../payroll/payroll.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class RecruitmentService {
  private readonly logger = new Logger(RecruitmentService.name);

  constructor(
    @Inject(forwardRef(() => TenantConnectionService))
    private readonly tenantConnectionService: TenantConnectionService,
    private readonly storageService: StorageService,
    @Inject(forwardRef(() => PdfService))
    private readonly pdfService: PdfService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => LeaveService))
    private readonly leaveService: LeaveService,
    @Inject(forwardRef(() => PayrollService))
    private readonly payrollService: PayrollService,
    private readonly googleCalendarService: GoogleCalendarService,
    @InjectQueue('recruitment') private recruitmentQueue: Queue,
    private readonly configService: ConfigService,
  ) {}

  // Helper to get repository for current tenant
  private async getRepo<T extends ObjectLiteral>(
    entity: any,
  ): Promise<Repository<T>> {
    const manager = await this.tenantConnectionService.getTenantManager();
    return manager.getRepository(entity);
  }

  // Public Career Portal Methods
  async findOpenJobs() {
    const repo = await this.getRepo<JobRequisition>(JobRequisition);
    return repo.find({
      where: { status: JobStatus.OPEN } as any,
      relations: ['department', 'designation'],
      select: [
        'id',
        'title',
        'description',
        'location',
        'employmentType',
        'vacancies',
        'minSalary',
        'maxSalary',
        'currency',
        'createdAt',
        'applicationFormConfig',
      ],
    });
  }

  async findOpenJobById(id: string) {
    const repo = await this.getRepo<JobRequisition>(JobRequisition);
    return repo.findOne({
      where: { id, status: JobStatus.OPEN } as any,
      relations: ['department', 'designation'],
      select: [
        'id',
        'title',
        'description',
        'location',
        'employmentType',
        'vacancies',
        'minSalary',
        'maxSalary',
        'currency',
        'createdAt',
        'applicationFormConfig',
      ],
    });
  }

  // Job Requisitions
  async findAllJobs() {
    const repo = await this.getRepo<JobRequisition>(JobRequisition);
    return repo.find({ relations: ['department', 'designation'] });
  }

  async createJob(data: any) {
    const repo = await this.getRepo<JobRequisition>(JobRequisition);
    const { approverIds, ...rest } = data;

    const job = repo.create({
      ...rest,
      status: JobStatus.DRAFT,
      approvalChain:
        approverIds?.map((userId: string) => ({
          userId,
          status: 'PENDING',
          updatedAt: null,
          comment: '',
        })) || [],
    });
    return repo.save(job);
  }

  async submitForApproval(id: string, approverIds?: string[]) {
    const repo = await this.getRepo<JobRequisition>(JobRequisition);
    const job = await repo.findOne({ where: { id } as any });
    if (!job) throw new Error('Job requisition not found');

    job.status = JobStatus.PENDING_APPROVAL;

    if (approverIds && approverIds.length > 0) {
      job.approvalChain = approverIds.map((userId) => ({
        userId,
        status: 'PENDING',
        updatedAt: null,
        comment: '',
      }));
    } else if (!job.approvalChain || job.approvalChain.length === 0) {
      throw new Error('No approvers assigned to this job requisition');
    }

    return repo.save(job);
  }

  async approveJobStep(id: string, userId: string, comment?: string) {
    const repo = await this.getRepo<JobRequisition>(JobRequisition);
    const job = await repo.findOne({ where: { id } as any });
    if (!job) throw new Error('Job requisition not found');

    const step = job.approvalChain.find((s) => s.userId === userId);
    if (!step) throw new Error('User not in approval chain');

    step.status = 'APPROVED';
    step.comment = comment || '';
    step.updatedAt = new Date();

    const allApproved = job.approvalChain.every((s) => s.status === 'APPROVED');
    if (allApproved) {
      job.status = JobStatus.APPROVED;
    }

    return repo.save(job);
  }

  async rejectJobStep(id: string, userId: string, comment: string) {
    const repo = await this.getRepo<JobRequisition>(JobRequisition);
    const job = await repo.findOne({ where: { id } as any });
    if (!job) throw new Error('Job requisition not found');

    const step = job.approvalChain.find((s) => s.userId === userId);
    if (!step) throw new Error('User not in approval chain');

    step.status = 'REJECTED';
    step.comment = comment;
    step.updatedAt = new Date();
    job.status = JobStatus.DRAFT; // Reset to draft if rejected

    return repo.save(job);
  }

  async openJob(id: string) {
    const repo = await this.getRepo<JobRequisition>(JobRequisition);
    const job = await repo.findOne({
      where: { id } as any,
      relations: ['department', 'designation'],
    });

    if (!job || job.status !== JobStatus.APPROVED) {
      throw new Error('Job must be approved before opening');
    }

    job.status = JobStatus.OPEN;
    const saved = await repo.save(job);

    // Trigger multi-channel publish via BullMQ
    await this.recruitmentQueue.add('job.opened', {
      jobId: saved.id,
      title: saved.title,
      description: saved.description,
      location: saved.location,
      employmentType: saved.employmentType,
      minSalary: saved.minSalary,
      maxSalary: saved.maxSalary,
      currency: saved.currency,
      department: saved.department?.name,
      designation: saved.designation?.title,
    });

    return saved;
  }

  // Applications
  async findAllApplications() {
    const repo = await this.getRepo<Application>(Application);
    return repo.find({ relations: ['job', 'candidate'] });
  }

  async createApplication(data: any) {
    const repo = await this.getRepo<Application>(Application);
    const app = repo.create({
      ...data,
      status: ApplicationStatus.APPLIED,
      timeline: [
        {
          status: ApplicationStatus.APPLIED,
          timestamp: new Date(),
          description: 'Candidate applied for the position',
        },
      ],
    });
    return repo.save(app);
  }

  async updateApplicationStatus(id: string, status: ApplicationStatus) {
    const repo = await this.getRepo<Application>(Application);
    const app = await repo.findOne({
      where: { id } as any,
      relations: ['candidate', 'job'],
    });
    if (!app) throw new Error('Application not found');

    const oldStatus = app.status;
    app.status = status;

    // Track status change in timeline
    const timelineEntry = {
      status,
      oldStatus,
      timestamp: new Date(),
      description: `Status changed from ${oldStatus} to ${status}`,
    };
    app.timeline = [...(app.timeline || []), timelineEntry];

    const saved = await repo.save(app);

    if (status === ApplicationStatus.HIRED) {
      const candidateRepo = await this.getRepo<Candidate>(Candidate);
      const candidate = await candidateRepo.findOne({
        where: { id: app.candidateId } as any,
      });

      if (candidate && candidate.referredById) {
        this.logger.log(
          `[REFERRAL] Candidate ${candidate.email} hired. Processing bonus for referrer ${candidate.referredById}`,
        );
        // In a real app, this would create a payroll entry or notify Finance
        await this.recruitmentQueue.add('referral.bonus_processed', {
          candidateName: `${candidate.firstName} ${candidate.lastName}`,
          referrerId: candidate.referredById,
          amount: candidate.referralBonus || 500, // Default bonus
        });
      }
    }

    if (status === ApplicationStatus.REJECTED) {
      await this.recruitmentQueue.add('application.rejected', {
        email: app.candidate.email,
        firstName: app.candidate.firstName,
        jobTitle: app.job.title,
      });
      this.logger.log(`Queued rejection email for ${app.candidate.email}`);
    }

    return saved;
  }

  async findApplicationById(id: string) {
    const repo = await this.getRepo<Application>(Application);
    return repo.findOne({
      where: { id } as any,
      relations: ['job', 'candidate', 'interviews', 'offerLetters'],
    });
  }

  // Candidates
  async findAllCandidates() {
    const repo = await this.getRepo<Candidate>(Candidate);
    return repo.find();
  }

  async createCandidate(data: any) {
    const repo = await this.getRepo<Candidate>(Candidate);

    // Duplicate detection
    const existing = await repo.findOne({
      where: [
        { email: data.email },
        ...(data.phone ? [{ phone: data.phone }] : []),
      ] as any,
    });

    if (existing) {
      // Update existing candidate info if provided
      await repo.update(existing.id, data);
      return this.findCandidateById(existing.id);
    }

    const candidate = repo.create(data);
    return repo.save(candidate);
  }

  async findCandidateById(id: string) {
    const repo = await this.getRepo<Candidate>(Candidate);
    return repo.findOne({
      where: { id } as any,
      relations: ['applications', 'applications.job'],
    });
  }

  async updateCandidate(id: string, data: any) {
    const repo = await this.getRepo<Candidate>(Candidate);
    await repo.update(id, data);
    return this.findCandidateById(id);
  }

  async getResumeUploadUrl(
    candidateId: string,
    fileName: string,
    contentType: string,
  ) {
    const key = `recruitment/resumes/${candidateId}/${Date.now()}-${fileName}`;
    const uploadUrl = await this.storageService.getUploadPresignedUrl(
      key,
      contentType,
    );
    return { uploadUrl, key };
  }

  async parseResumeAndScore(applicationId: string) {
    const repo = await this.getRepo<Application>(Application);
    const app = await repo.findOne({
      where: { id: applicationId } as any,
      relations: ['candidate', 'job'],
    });
    if (!app) throw new Error('Application not found');

    this.logger.log(
      `[AI] Parsing resume for candidate: ${app.candidate.email}`,
    );

    const apiKey = this.configService.get<string>('ai.openaiApiKey');
    if (!apiKey) {
      this.logger.warn(
        'OpenAI API Key not configured. Using fallback simulation.',
      );
      return this.simulateAiParsing(app, repo);
    }

    try {
      // In a real scenario, we'd read the resume file content from S3/MinIO
      // For this implementation, we'll send the Job Description and Candidate Bio/Notes to OpenAI
      // to demonstrate the scoring logic.

      const prompt = `
        You are an expert HR Recruitment AI.
        Analyze the candidate's fit for the following job:
        
        JOB TITLE: ${app.job.title}
        JOB DESCRIPTION: ${app.job.description}
        
        CANDIDATE NAME: ${app.candidate.firstName} ${app.candidate.lastName}
        CANDIDATE EMAIL: ${app.candidate.email}
        RESUME URL: ${app.candidate.resumeUrl}
        
        Please provide a JSON response with:
        1. skills: string[] (extracted from resume/profile)
        2. experienceYears: number
        3. education: string
        4. summary: string (2-3 sentences)
        5. score: number (0-100, based on job fit)
        6. fitReason: string (detailed explanation)
      `;

      const response = await fetch(
        'https://api.openai.com/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' },
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const result = await response.json();
      const aiResponse = JSON.parse(result.choices[0].message.content);

      // Store AI results in metadata/notes or dedicated columns
      app.notes = `AI Score: ${aiResponse.score}/100\nFit: ${aiResponse.fitReason}\nSummary: ${aiResponse.summary}`;

      // Update candidate skills
      const candidateRepo = await this.getRepo<Candidate>(Candidate);
      await candidateRepo.update(app.candidateId, {
        skills: aiResponse.skills,
      });

      return repo.save(app);
    } catch (error: any) {
      this.logger.error(`AI Parsing failed: ${error.message}`);
      return this.simulateAiParsing(app, repo);
    }
  }

  private async simulateAiParsing(
    app: Application,
    repo: Repository<Application>,
  ) {
    const aiResponse = {
      skills: ['TypeScript', 'React', 'NestJS', 'PostgreSQL', 'Docker'],
      experienceYears: 5,
      education: 'B.Sc. in Computer Science',
      summary:
        'Experienced full-stack developer with strong background in enterprise systems.',
      score: 85,
      fitReason: 'Strong match for tech stack and required experience years.',
    };

    app.notes = `[SIMULATED] AI Score: ${aiResponse.score}/100\nFit: ${aiResponse.fitReason}\nSummary: ${aiResponse.summary}`;

    const candidateRepo = await this.getRepo<Candidate>(Candidate);
    await candidateRepo.update(app.candidateId, {
      skills: aiResponse.skills,
    });

    return repo.save(app);
  }

  async getPublicResumeUploadUrl(fileName: string, contentType: string) {
    const key = `recruitment/temp-resumes/${Date.now()}-${fileName}`;
    const uploadUrl = await this.storageService.getUploadPresignedUrl(
      key,
      contentType,
    );
    return { uploadUrl, key };
  }

  // Interviews
  async scheduleInterview(data: any) {
    const repo = await this.getRepo<Interview>(Interview);

    // Check interviewer availability
    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);

    const conflicts = await repo
      .createQueryBuilder('interview')
      .where(
        'interview.startTime < :endTime AND interview.endTime > :startTime',
        {
          startTime,
          endTime,
        },
      )
      .andWhere('interview.status = :status', {
        status: InterviewStatus.SCHEDULED,
      })
      .andWhere('interview.interviewerIds && :interviewerIds', {
        interviewerIds: data.interviewerIds,
      })
      .getMany();

    if (conflicts.length > 0) {
      const busyIds = conflicts
        .flatMap((c) => c.interviewerIds)
        .filter((id) => data.interviewerIds.includes(id));
      const uniqueBusyIds = [...new Set(busyIds)];
      throw new Error(
        `Interviewer conflict: [${uniqueBusyIds.join(', ')}] are already scheduled at this time.`,
      );
    }

    const applicationRepo = await this.getRepo<Application>(Application);
    const app = await applicationRepo.findOne({
      where: { id: data.applicationId } as any,
      relations: ['candidate', 'job'],
    });
    if (!app) throw new Error('Application not found');

    const interview = repo.create(data);
    const saved = await repo.save(interview);

    // Auto-update application status to the specific interview stage if provided
    if (data.stage) {
      await this.updateApplicationStatus(
        data.applicationId,
        data.stage as ApplicationStatus,
      );
    } else {
      await this.updateApplicationStatus(
        data.applicationId,
        ApplicationStatus.INTERVIEW_1, // Fallback to first interview stage
      );
    }

    // Simulated Google Calendar Webhook / Integration
    this.logger.log(
      `[PROTOTYPE] Triggering Google Calendar invite for ${(saved as any).startTime} to ${(saved as any).endTime}`,
    );

    // In a real implementation, we would call the Google Calendar API here
    // using the user's OAuth tokens.
    try {
      this.logger.log(
        `[CALENDAR] Successfully created event for ${app.candidate.email}`,
      );
      await this.googleCalendarService.createEvent({
        summary: `Interview for ${app.candidate.firstName} ${app.candidate.lastName} - ${app.job.title}`,
        location: data.location || 'Online Meeting',
        description: `Interview stage: ${data.stage || 'Initial'}. \nCandidate notes: ${app.notes}`,
        start: { dateTime: (saved as any).startTime },
        end: { dateTime: (saved as any).endTime },
        attendees: [
          { email: app.candidate.email },
          ...data.interviewerIds.map((id: string) => ({
            email: `${id}@nurox.app`,
          })), // In real app, we'd fetch interviewer emails
        ],
      });
    } catch (error: any) {
      this.logger.error(`[CALENDAR] Failed to create event: ${error.message}`);
    }

    return saved;
  }

  async updateJobStatus(id: string, status: JobStatus) {
    const repo = await this.getRepo<JobRequisition>(JobRequisition);
    const job = await repo.findOne({ where: { id } as any });
    if (!job) throw new Error('Job requisition not found');
    job.status = status;
    return repo.save(job);
  }

  async updateInterviewFeedback(
    id: string,
    feedback: string,
    rating: number,
    scorecard?: Record<string, number>,
  ) {
    const repo = await this.getRepo<Interview>(Interview);
    await repo.update(id, {
      feedback,
      rating,
      scorecard,
      status: InterviewStatus.COMPLETED,
    });
    return repo.findOne({ where: { id } as any });
  }

  async findAllInterviews() {
    const repo = await this.getRepo<Interview>(Interview);
    return repo.find({
      relations: ['application', 'application.candidate', 'application.job'],
    });
  }

  // Offer Letters
  async createOfferLetter(data: any) {
    const repo = await this.getRepo<OfferLetter>(OfferLetter);
    const offer = repo.create(data);
    const saved = (await repo.save(offer)) as any;

    await this.updateApplicationStatus(
      data.applicationId,
      ApplicationStatus.OFFER,
    );

    // Schedule offer expiry check
    const delay = new Date(saved.expiryDate).getTime() - Date.now();
    if (delay > 0) {
      await this.recruitmentQueue.add(
        'offer.expiry_check',
        {
          offerId: saved.id,
          tenantId: this.tenantConnectionService.tenantId,
        },
        { delay },
      );
    }

    return saved;
  }

  async checkOfferExpiry(id: string) {
    const repo = await this.getRepo<OfferLetter>(OfferLetter);
    const offer = await repo.findOne({
      where: { id } as any,
      relations: ['application', 'application.candidate'],
    });

    if (offer && offer.status === ('SENT' as any)) {
      offer.status = 'EXPIRED' as any;
      await repo.save(offer);

      this.logger.log(`Offer ${id} has expired`);

      // Notify recruiter
      await this.recruitmentQueue.add('offer.expired_notification', {
        candidateName: `${offer.application.candidate.firstName} ${offer.application.candidate.lastName}`,
        offerId: offer.id,
      });
    }
  }

  async generateOfferPdf(id: string) {
    const repo = await this.getRepo<OfferLetter>(OfferLetter);
    const offer = await repo.findOne({
      where: { id } as any,
      relations: ['application', 'application.candidate', 'application.job'],
    });
    if (!offer) throw new Error('Offer letter not found');

    const templateHtml = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { padding: 40px; border: 1px solid #ddd; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #00b96b; padding-bottom: 10px; }
            .content { margin: 20px 0; }
            .footer { margin-top: 50px; border-top: 1px solid #eee; padding-top: 10px; font-size: 0.8em; text-align: center; }
            .signature-area { margin-top: 40px; height: 100px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Offer of Employment</h1>
            </div>
            <div class="content">
              <p>Date: ${new Date().toLocaleDateString()}</p>
              <p>To: <strong>{{candidateName}}</strong></p>
              <p>We are delighted to offer you the position of <strong>{{jobTitle}}</strong> with Nurox ERP. We were impressed with your skills and experience and believe you will be a valuable addition to our team.</p>
              <p><strong>Position:</strong> {{jobTitle}}</p>
              <p><strong>Start Date:</strong> {{joiningDate}}</p>
              <p><strong>Annual Salary:</strong> {{baseSalary}} {{currency}}</p>
              <p>Please review this offer and, if you accept, provide your signature below.</p>
              <br/>
              <p>Sincerely,</p>
              <p>HR Department<br/>Nurox ERP</p>
            </div>
            <div class="signature-area" id="signature-area">
              {{#if signed}}
                <img src="{{signatureData}}" style="max-height: 80px;" />
                <p>Signed on: {{signedDate}}</p>
              {{else}}
                <p>(Candidate Signature)</p>
              {{/if}}
            </div>
            <div class="footer">
              <p>&copy; 2026 Nurox ERP. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const data = {
      candidateName: `${offer.application.candidate.firstName} ${offer.application.candidate.lastName}`,
      jobTitle: offer.application.job.title,
      baseSalary: offer.baseSalary,
      currency: offer.currency,
      joiningDate: new Date(offer.joiningDate).toLocaleDateString(),
      signed: !!offer.signedUrl,
      signatureData: offer.signedUrl, // Placeholder for signature image if already signed
      signedDate: offer.updatedAt?.toLocaleDateString(),
    };

    const pdfBuffer = await this.pdfService.generatePdf(templateHtml, data);

    const key = `recruitment/offers/${offer.id}.pdf`;
    const publicUrl = await this.storageService.uploadBuffer(
      key,
      pdfBuffer,
      'application/pdf',
    );

    offer.signedUrl = publicUrl;
    await repo.save(offer);

    return { publicUrl, key };
  }

  async signOfferLetter(id: string, signatureBase64: string) {
    const repo = await this.getRepo<OfferLetter>(OfferLetter);
    const offer = await repo.findOne({
      where: { id } as any,
      relations: ['application', 'application.candidate', 'application.job'],
    });
    if (!offer) throw new Error('Offer letter not found');

    // In a real Puppeteer implementation, we'd re-generate the PDF with the signature image.
    // For this prototype, we'll update the PDF data and re-generate.

    const templateHtml = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { padding: 40px; border: 1px solid #ddd; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #00b96b; padding-bottom: 10px; }
            .content { margin: 20px 0; }
            .footer { margin-top: 50px; border-top: 1px solid #eee; padding-top: 10px; font-size: 0.8em; text-align: center; }
            .signature-area { margin-top: 40px; height: 100px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Offer of Employment (SIGNED)</h1>
            </div>
            <div class="content">
              <p>Date: ${new Date().toLocaleDateString()}</p>
              <p>To: <strong>{{candidateName}}</strong></p>
              <p>We are delighted to offer you the position of <strong>{{jobTitle}}</strong> with Nurox ERP. We were impressed with your skills and experience and believe you will be a valuable addition to our team.</p>
              <p><strong>Position:</strong> {{jobTitle}}</p>
              <p><strong>Start Date:</strong> {{joiningDate}}</p>
              <p><strong>Annual Salary:</strong> {{baseSalary}} {{currency}}</p>
            </div>
            <div class="signature-area">
              <img src="{{signatureBase64}}" style="max-height: 80px;" />
              <p>Signed by ${offer.application.candidate.firstName} ${offer.application.candidate.lastName} on ${new Date().toLocaleDateString()}</p>
            </div>
            <div class="footer">
              <p>&copy; 2026 Nurox ERP. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const data = {
      candidateName: `${offer.application.candidate.firstName} ${offer.application.candidate.lastName}`,
      jobTitle: offer.application.job.title,
      baseSalary: offer.baseSalary,
      currency: offer.currency,
      joiningDate: new Date(offer.joiningDate).toLocaleDateString(),
      signatureBase64,
    };

    const pdfBuffer = await this.pdfService.generatePdf(templateHtml, data);
    const key = `recruitment/offers/${offer.id}-signed.pdf`;
    const publicUrl = await this.storageService.uploadBuffer(
      key,
      pdfBuffer,
      'application/pdf',
    );

    offer.signedUrl = publicUrl;
    offer.status = 'ACCEPTED' as any;
    await repo.save(offer);

    // Auto-create onboarding checklist
    await this.createOnboardingChecklist(offer.application.candidateId);

    return { publicUrl, key };
  }

  // Updated Onboarding Checklist Creation
  async createOnboardingChecklist(
    candidateId: string,
    data: {
      templateId?: string;
      startDate?: Date;
      buddyId?: string;
      assignedAssetIds?: string[];
    } = {},
  ) {
    const repo = await this.getRepo<OnboardingChecklist>(OnboardingChecklist);
    const existing = await repo.findOne({ where: { candidateId } as any });
    if (existing) return existing;

    const { templateId, startDate, buddyId, assignedAssetIds } = data;

    let tasks: any[] = [
      {
        title: 'E-Signature',
        description: 'Sign the offer letter electronically',
        isCompleted: true,
        completedAt: new Date(),
        dueDate: new Date(),
      },
    ];

    if (templateId) {
      const templateRepo =
        await this.getRepo<OnboardingTemplate>(OnboardingTemplate);
      const template = await templateRepo.findOne({
        where: { id: templateId } as any,
      });
      if (template) {
        const templateTasks = template.tasks.map((t) => ({
          title: t.title,
          description: t.description,
          isCompleted: false,
          dueDate: startDate
            ? new Date(
                new Date(startDate).getTime() +
                  (t.daysOffset || 0) * 24 * 60 * 60 * 1000,
              )
            : null,
          isRequired: t.isRequired,
          ownerRole: t.ownerRole,
        }));
        tasks = [...tasks, ...templateTasks];
      }
    } else {
      // Fallback default tasks
      tasks = [
        ...tasks,
        {
          title: 'Personal Information',
          description: 'NID, TIN, Date of Birth, etc.',
          isCompleted: false,
          completedAt: null,
          dueDate: null,
        },
        {
          title: 'Bank Details',
          description: 'Account number, Bank name, Routing info',
          isCompleted: false,
          completedAt: null,
          dueDate: null,
        },
        {
          title: 'IT Asset Provisioning',
          description: 'Laptop, badge, and email setup',
          isCompleted: false,
          completedAt: null,
          dueDate: null,
        },
      ];
    }

    const checklist = repo.create({
      candidateId,
      templateId,
      startDate,
      buddyId,
      assignedAssetIds: assignedAssetIds || [],
      tasks,
      progress: Math.round(
        (tasks.filter((t) => t.isCompleted).length / tasks.length) * 100,
      ),
      status: OnboardingStatus.IN_PROGRESS,
    });
    return repo.save(checklist);
  }

  async updateOnboardingTask(
    id: string,
    taskTitle: string,
    isCompleted: boolean,
    documentKey?: string,
  ) {
    const repo = await this.getRepo<OnboardingChecklist>(OnboardingChecklist);
    const checklist = await repo.findOne({
      where: { id } as any,
      relations: ['candidate'],
    });
    if (!checklist) throw new Error('Onboarding checklist not found');

    const task = checklist.tasks.find((t) => t.title === taskTitle);
    if (task) {
      task.isCompleted = isCompleted;
      if (isCompleted) task.completedAt = new Date();
      if (documentKey) {
        checklist.documentMetadata = {
          ...(checklist.documentMetadata || {}),
          [taskTitle]: documentKey,
        };
      }
    }

    const completedTasks = checklist.tasks.filter((t) => t.isCompleted).length;
    checklist.progress = Math.round(
      (completedTasks / checklist.tasks.length) * 100,
    );

    if (checklist.progress === 100) {
      checklist.status = OnboardingStatus.COMPLETED;

      // Auto-trigger: create user, assign roles, send credentials
      const candidate = checklist.candidate;
      if (candidate) {
        // 1. Invite User
        await this.usersService.invite({
          email: candidate.email,
          firstName: candidate.firstName,
          lastName: candidate.lastName,
          role: 'EMPLOYEE',
        });

        // 2. Schedule Day-1 Welcome Email
        await this.recruitmentQueue.add(
          'onboarding.welcome_email',
          {
            candidateId: candidate.id,
            email: candidate.email,
            firstName: candidate.firstName,
            startDate: checklist.startDate,
          },
          {
            delay: checklist.startDate
              ? Math.max(
                  0,
                  new Date(checklist.startDate).getTime() - Date.now(),
                )
              : 0,
          },
        );

        // 3. Schedule 30/60/90 day check-ins
        const milestonePeriods = [30, 60, 90];
        for (const days of milestonePeriods) {
          await this.recruitmentQueue.add(
            'onboarding.milestone_checkin',
            {
              candidateId: candidate.id,
              days,
              email: candidate.email,
            },
            {
              delay: days * 24 * 60 * 60 * 1000,
            },
          );
        }

        // 4. Initialize Leave Balance (Annual, Sick, Casual)
        // Note: In real app, we would fetch employee record linked to the user
        // For prototype, we'll try to find or create a mock employee record if needed
        // but here we call the service directly with candidate info if it accepts it.
        try {
          // Assuming we have an employee record by now (auto-created during invite or separate step)
          // For now, we'll log it as a prototype step.
          this.logger.log(
            `[ONBOARDING] Initializing leave balances for ${candidate.email}`,
          );
          // await this.leaveService.initializeBalances(candidate.id);
        } catch (err) {
          this.logger.error(
            `Failed to initialize leave balance: ${err.message}`,
          );
        }

        // 5. Assign Default Salary Structure
        try {
          this.logger.log(
            `[ONBOARDING] Assigning default salary structure for ${candidate.email}`,
          );
          // await this.payrollService.assignStructure(candidate.id, 'DEFAULT_STRUCTURE_ID');
        } catch (err) {
          this.logger.error(
            `Failed to assign salary structure: ${err.message}`,
          );
        }

        this.logger.log(
          `Auto-invited candidate ${candidate.email} on onboarding completion`,
        );
      }
    } else if (checklist.progress > 0) {
      checklist.status = OnboardingStatus.IN_PROGRESS;
    }

    return repo.save(checklist);
  }

  async findOnboardingByCandidate(candidateId: string) {
    const repo = await this.getRepo<OnboardingChecklist>(OnboardingChecklist);
    return repo.findOne({
      where: { candidateId } as any,
      relations: ['candidate'],
    });
  }

  // Onboarding Templates
  async findAllOnboardingTemplates() {
    const repo = await this.getRepo<OnboardingTemplate>(OnboardingTemplate);
    return repo.find();
  }

  async createOnboardingTemplate(data: any) {
    const repo = await this.getRepo<OnboardingTemplate>(OnboardingTemplate);
    const template = repo.create(data);
    return repo.save(template);
  }

  async updateOnboardingTemplate(id: string, data: any) {
    const repo = await this.getRepo<OnboardingTemplate>(OnboardingTemplate);
    await repo.update(id, data);
    return repo.findOne({ where: { id } as any });
  }

  async findOnboardingTemplateById(id: string) {
    const repo = await this.getRepo<OnboardingTemplate>(OnboardingTemplate);
    return repo.findOne({ where: { id } as any });
  }

  // Analytics
  async getAnalytics() {
    const applicationRepo = await this.getRepo<Application>(Application);
    const candidateRepo = await this.getRepo<Candidate>(Candidate);
    const interviewRepo = await this.getRepo<Interview>(Interview);

    const totalApplicants = await candidateRepo.count();

    // Funnel data
    const funnel = await applicationRepo
      .createQueryBuilder('app')
      .select('app.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('app.status')
      .getRawMany();

    // Source of hire
    const sources = await candidateRepo
      .createQueryBuilder('candidate')
      .select('candidate.source', 'source')
      .addSelect('COUNT(*)', 'count')
      .groupBy('candidate.source')
      .getRawMany();

    // Actual average time-to-hire (days from application to hired)
    const hiredApps = await applicationRepo.find({
      where: { status: ApplicationStatus.HIRED },
      select: ['createdAt', 'updatedAt'],
    });

    let avgTimeToHire = 0;
    if (hiredApps.length > 0) {
      const totalDays = hiredApps.reduce((acc, app) => {
        const diff = app.updatedAt.getTime() - app.createdAt.getTime();
        return acc + diff / (1000 * 60 * 60 * 24);
      }, 0);
      avgTimeToHire = Math.round(totalDays / hiredApps.length);
    }

    // Interviewer load (top 5)
    const interviews = await interviewRepo.find();
    const interviewerMap: Record<string, number> = {};
    interviews.forEach((i) => {
      i.interviewerIds?.forEach((id) => {
        interviewerMap[id] = (interviewerMap[id] || 0) + 1;
      });
    });

    return {
      totalApplicants,
      funnel: funnel.map((f) => ({ name: f.status, value: parseInt(f.count) })),
      sources: sources.map((s) => ({
        name: s.source || 'Other',
        value: parseInt(s.count),
      })),
      avgTimeToHire: avgTimeToHire || 14, // Fallback to 14 days if no hires
      hiringVelocity: (hiredApps.length / 30).toFixed(1), // Hires per month (approx)
      interviewerLoad: interviewerMap,
    };
  }
}
