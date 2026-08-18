import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { UxMode } from '../../domain/models/ux-mode.model';
import { UxIssue } from '../../domain/models/ux-issue.model';
import { environment } from '../../../environments/environment';

/**
 * Payload sent to the /api/claude serverless function describing the
 * current page's state, so the AI mentor can comment on it specifically.
 */
export interface MentorRequest {
  pageName: string;
  uxMode: UxMode;
  issues: UxIssue[];
  wellbeingScore: number;
  /** Optional free-text question from the user to the mentor. */
  userQuestion?: string;
}

export interface MentorResponse {
  message: string;
}

/**
 * ClaudeService
 *
 * Talks to a Vercel serverless function (not the Anthropic API directly),
 * so the API key never reaches the browser. The serverless function is
 * responsible for building the final system prompt and calling
 * claude-sonnet-4-6.
 */
@Injectable({
  providedIn: 'root',
})
export class ClaudeService {
  private readonly http = inject(HttpClient);

  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly lastResponse = signal<string | null>(null);

  /**
   * Sends the current page's UX context to the AI mentor and returns its
   * commentary. Updates isLoading/error/lastResponse signals so dev-panel
   * can bind to them directly without managing its own loading state.
   */
  async getMentorFeedback(request: MentorRequest): Promise<string> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const response = await firstValueFrom(
        this.http.post<MentorResponse>(environment.claudeApiEndpoint, request)
      );
      this.lastResponse.set(response.message);
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

  /** Clears any previous mentor response/error, e.g. on page navigation. */
  reset(): void {
    this.lastResponse.set(null);
    this.error.set(null);
  }
}
