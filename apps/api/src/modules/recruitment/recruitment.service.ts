import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

@Injectable()
export class RecruitmentService {
  private readonly logger = new Logger(RecruitmentService.name);

  constructor(
    private readonly tenantConnectionService: TenantConnectionService,
    private readonly storageService: StorageService,
    private readonly pdfService: PdfService,
    private readonly usersService: UsersService,
  ) {}

  // Helper to get repository for current tenant
  private async getRepo<T>(entity: any): Promise<Repository<T>> {
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
    });
    return repo.save(job);
  }

  async submitForApproval(id: string) {
    const repo = await this.getRepo<JobRequisition>(JobRequisition);
    const job = await repo.findOne({ where: { id } as any });
    if (!job) throw new Error('Job requisition not found');

    job.status = JobStatus.PENDING_APPROVAL;
    // In a real app, we'd trigger notifications to the first approver here
    return repo.save(job);
  }

  async approveJob(id: string, userId: string, comment?: string) {
    const repo = await this.getRepo<JobRequisition>(JobRequisition);
    const job = await repo.findOne({ where: { id } as any });
    if (!job) throw new Error('Job requisition not found');

    // Simple approval logic for now
    // In a real app, we'd check the approval chain
    job.status = JobStatus.APPROVED;
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
      // Trigger rejection email
      // In a real app, we'd use BullMQ to queue this
      this.logger.log(`Sending rejection email to ${app.candidate.email}`);
      // await this.mailerService.sendRejectionEmail(app.candidate.email, app.candidate.firstName, app.job.title);
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

    return saved;
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
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .header { text-align: center; margin-bottom: 30px; }
            .content { margin: 0 50px; }
            .footer { margin-top: 50px; text-align: center; font-size: 0.8em; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Offer Letter</h1>
          </div>
          <div class="content">
            <p>Date: ${new Date().toLocaleDateString()}</p>
            <p>Dear {{candidateName}},</p>
            <p>We are pleased to offer you the position of <strong>{{jobTitle}}</strong> at Nurox ERP.</p>
            <p><strong>Compensation:</strong> {{baseSalary}} {{currency}} per annum.</p>
            <p><strong>Joining Date:</strong> {{joiningDate}}</p>
            <p>This offer is contingent upon successful completion of our onboarding process.</p>
            <p>We look forward to having you join our team!</p>
            <br/>
            <p>Best regards,</p>
            <p>The HR Team<br/>Nurox ERP</p>
          </div>
          <div class="footer">
            <p>This is an electronically generated document.</p>
          </div>
        </body>
      </html>
    `;

    const data = {
      candidateName: `${offer.application.candidate.firstName} ${offer.application.candidate.lastName}`,
      jobTitle: offer.application.job.title,
      baseSalary: offer.baseSalary,
      currency: offer.currency,
      joiningDate: offer.joiningDate,
    };

    const pdfBuffer = await this.pdfService.generatePdf(templateHtml, data);

    // Save to Storage
    const key = `recruitment/offers/${offer.id}.pdf`;
    const publicUrl = await this.storageService.uploadBuffer(
      key,
      pdfBuffer,
      'application/pdf',
    );

    // Update offer with signed URL
    offer.signedUrl = publicUrl;
    await repo.save(offer);

    return { publicUrl, key };
  }

  // Onboarding
  async createOnboardingChecklist(candidateId: string) {
    const repo = await this.getRepo<OnboardingChecklist>(OnboardingChecklist);
    const checklist = repo.create({
      candidateId,
      tasks: [
        {
          title: 'Personal Information',
          description: 'NID, Date of Birth, etc.',
          isCompleted: false,
        },
        {
          title: 'Bank Details',
          description: 'Account number, Bank name',
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
          isCompleted: false,
        },
      ],
      progress: 0,
      status: OnboardingStatus.NOT_STARTED,
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
