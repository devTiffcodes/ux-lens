import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { UxMode } from '../../domain/models/ux-mode.model';
import { UxIssue } from '../../domain/models/ux-issue.model';
import { environment } from '../../../environments/environment';
import { UxLawCategory } from '../../feature/pages/ux-lens/site-analyzer/site-analyzer.component';

export interface MentorRequest {
  pageName: string;
  uxMode: UxMode;
  issues: UxIssue[];
  wellbeingScore: number;
  userQuestion?: string;
}

export interface MentorResponse {
  message: string;
  uxLawScores?: UxLawCategory[];
}

@Injectable({
  providedIn: 'root',
})
export class ClaudeService {
  private readonly http = inject(HttpClient);

  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly lastResponse = signal<string | null>(null);
  readonly lastRawResponse = signal<MentorResponse | null>(null);

  async getMentorFeedback(request: MentorRequest): Promise<string> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const response = await firstValueFrom(
        this.http.post<MentorResponse>(environment.claudeApiEndpoint, request)
      );
      this.lastResponse.set(response.message);
      this.lastRawResponse.set(response);
      return response.message;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to reach the AI mentor.';
      this.error.set(message);
      throw err;
    } finally {
      this.isLoading.set(false);
    }
  }

  reset(): void {
    this.lastResponse.set(null);
    this.lastRawResponse.set(null);
    this.error.set(null);
  }
}
