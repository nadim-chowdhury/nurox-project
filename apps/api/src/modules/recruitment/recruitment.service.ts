import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { Repository, ObjectLiteral } from 'typeorm';
import { JobRequisition, JobStatus } from './entities/job-requisition.entity';
import { Candidate } from './entities/candidate.entity';
import { Application, ApplicationStatus } from './entities/application.entity';
import { Interview, InterviewStatus } from './entities/interview.entity';
import { OfferLetter } from './entities/offer-letter.entity';
import {
  OnboardingChecklist,
  OnboardingStatus,
} from './entities/onboarding-checklist.entity';
import { TenantConnectionService } from '../../database/tenant-connection.service';
import { StorageService } from '../system/storage.service';
import { PdfService } from '../system/pdf.service';
import { UsersService } from '../users/users.service';
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
    @InjectQueue('recruitment') private recruitmentQueue: Queue,
  ) {}

  // Helper to get repository for current tenant
  private async getRepo<T extends ObjectLiteral>(
    entity: any,
  ): Promise<Repository<T>> {
    const manager = await this.tenantConnectionService.getTenantManager();
    return manager.getRepository(entity);
  }

  // Job Requisitions
  async findAllJobs() {
    const repo = await this.getRepo<JobRequisition>(JobRequisition);
    return repo.find({ relations: ['department', 'designation'] });
  }

  async createJob(data: any) {
    const repo = await this.getRepo<JobRequisition>(JobRequisition);
    const job = repo.create({
      ...data,
      status: JobStatus.DRAFT,
      approvalChain: [],
    });
    return repo.save(job);
  }

  async submitForApproval(id: string, approverIds: string[]) {
    const repo = await this.getRepo<JobRequisition>(JobRequisition);
    const job = await repo.findOne({ where: { id } as any });
    if (!job) throw new Error('Job requisition not found');

    job.status = JobStatus.PENDING_APPROVAL;
    job.approvalChain = approverIds.map((userId) => ({
      userId,
      status: 'PENDING',
      updatedAt: null,
      comment: '',
    }));

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
    const job = await repo.findOne({ where: { id } as any });
    if (!job || job.status !== JobStatus.APPROVED) {
      throw new Error('Job must be approved before opening');
    }
    job.status = JobStatus.OPEN;
    return repo.save(job);
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

    app.status = status;
    const saved = await repo.save(app);

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

  // Interviews
  async scheduleInterview(data: any) {
    const repo = await this.getRepo<Interview>(Interview);
    const interview = repo.create(data);
    const saved = await repo.save(interview);

    // Auto-update application status to INTERVIEW if not already
    await this.updateApplicationStatus(
      data.applicationId,
      ApplicationStatus.INTERVIEW,
    );

    // Simulated Google Calendar Webhook / Integration
    this.logger.log(
      `[PROTOTYPE] Triggering Google Calendar invite for ${(saved as any).startTime} to ${(saved as any).endTime}`,
    );
    // TODO: Implement actual Google Calendar API call or webhook trigger here

    return saved;
  }

  async updateJobStatus(id: string, status: JobStatus) {
    const repo = await this.getRepo<JobRequisition>(JobRequisition);
    const job = await repo.findOne({ where: { id } as any });
    if (!job) throw new Error('Job requisition not found');
    job.status = status;
    return repo.save(job);
  }

  async updateInterviewFeedback(id: string, feedback: string, rating: number) {
    const repo = await this.getRepo<Interview>(Interview);
    await repo.update(id, {
      feedback,
      rating,
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
    const saved = await repo.save(offer);

    await this.updateApplicationStatus(
      data.applicationId,
      ApplicationStatus.OFFER,
    );
    return saved;
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

  // Onboarding
  async createOnboardingChecklist(candidateId: string) {
    const repo = await this.getRepo<OnboardingChecklist>(OnboardingChecklist);
    const existing = await repo.findOne({ where: { candidateId } as any });
    if (existing) return existing;

    const checklist = repo.create({
      candidateId,
      tasks: [
        {
          title: 'Personal Information',
          description: 'NID, TIN, Date of Birth, etc.',
          isCompleted: false,
        },
        {
          title: 'Bank Details',
          description: 'Account number, Bank name, Routing info',
          isCompleted: false,
        },
        {
          title: 'Educational Certificates',
          description: 'Degree, Transcript',
          isCompleted: false,
        },
        {
          title: 'Work Experience Documents',
          description: 'Experience letters',
          isCompleted: false,
        },
        {
          title: 'E-Signature',
          description: 'Sign the offer letter electronically',
          isCompleted: true,
        },
      ],
      progress: 20,
      status: OnboardingStatus.IN_PROGRESS,
    });
    return repo.save(checklist);
  }

  async updateOnboardingTask(
    id: string,
    taskTitle: string,
    isCompleted: boolean,
  ) {
    const repo = await this.getRepo<OnboardingChecklist>(OnboardingChecklist);
    const checklist = await repo.findOne({ where: { id } as any });
    if (!checklist) throw new Error('Onboarding checklist not found');

    const task = checklist.tasks.find((t) => t.title === taskTitle);
    if (task) {
      task.isCompleted = isCompleted;
      if (isCompleted) task.completedAt = new Date();
    }

    const completedTasks = checklist.tasks.filter((t) => t.isCompleted).length;
    checklist.progress = Math.round(
      (completedTasks / checklist.tasks.length) * 100,
    );

    if (checklist.progress === 100) {
      checklist.status = OnboardingStatus.COMPLETED;

      // Auto-trigger: create user, assign roles, send credentials
      const candidate = await (
        await this.getRepo<Candidate>(Candidate)
      ).findOne({
        where: { id: checklist.candidateId } as any,
      });
      if (candidate) {
        await this.usersService.invite({
          email: candidate.email,
          firstName: candidate.firstName,
          lastName: candidate.lastName,
          role: 'EMPLOYEE',
        });
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
}
